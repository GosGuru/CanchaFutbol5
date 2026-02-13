"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, Loader2, Trash2, Phone, Mail, User, Clock, MapPin } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { cn, getHorasDisponibles } from "@/lib/utils"
import { getConfiguracion } from "@/lib/storage"
import type { Reserva, EstadoReserva } from "@/types"

const reservaSchema = z.object({
  canchaId: z.string(),
  fecha: z.date({ message: "La fecha es requerida" }),
  horaInicio: z.string().min(1, "Selecciona hora de inicio"),
  horaFin: z.string().min(1, "Selecciona hora de fin"),
  nombreCliente: z.string().min(2, "El nombre es requerido"),
  telefonoCliente: z.string().min(8, "El teléfono es requerido"),
  emailCliente: z.string().email("Email inválido").optional().or(z.literal("")),
  documentoCliente: z.string().optional(),
  precio: z.string().min(1, "El precio es requerido"),
  estado: z.string(),
  notas: z.string().optional(),
})

type ReservaFormValues = z.infer<typeof reservaSchema>

interface ModalReservaProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  reserva?: Reserva | null
  fechaInicial?: Date
  horaInicial?: string
  onSuccess?: () => void
}

const estadosReserva: { value: EstadoReserva; label: string; color: string }[] = [
  { value: "pendiente", label: "Pendiente", color: "bg-warning text-warning-foreground" },
  { value: "confirmada", label: "Confirmada", color: "bg-info text-info-foreground" },
  { value: "pagada", label: "Pagada", color: "bg-success text-success-foreground" },
  { value: "cancelada", label: "Cancelada", color: "bg-destructive text-destructive-foreground" },
]

export function ModalReserva({
  open,
  onOpenChange,
  reserva,
  fechaInicial,
  horaInicial,
  onSuccess,
}: ModalReservaProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const config = getConfiguracion()
  
  const horarios = getHorasDisponibles(config.horarioApertura, config.horarioCierre, config.duracionSlot)
  const isEditing = !!reserva

  const form = useForm<ReservaFormValues>({
    resolver: zodResolver(reservaSchema),
    defaultValues: {
      canchaId: "1",
      fecha: new Date(),
      horaInicio: "",
      horaFin: "",
      nombreCliente: "",
      telefonoCliente: "",
      emailCliente: "",
      documentoCliente: "",
      precio: config.precioPorHora.toString(),
      estado: "pendiente",
      notas: "",
    },
  })

  // Actualizar form cuando cambia la reserva o se abre el modal
  useEffect(() => {
    if (open) {
      if (reserva) {
        form.reset({
          canchaId: reserva.canchaId.toString(),
          fecha: new Date(reserva.fecha),
          horaInicio: reserva.horaInicio,
          horaFin: reserva.horaFin,
          nombreCliente: reserva.cliente.nombre,
          telefonoCliente: reserva.cliente.telefono,
          emailCliente: reserva.cliente.email || "",
          documentoCliente: reserva.cliente.documento || reserva.cliente.cedula || "",
          precio: reserva.precio.toString(),
          estado: reserva.estado,
          notas: reserva.notas || "",
        })
      } else {
        form.reset({
          canchaId: "1",
          fecha: fechaInicial || new Date(),
          horaInicio: horaInicial || "",
          horaFin: horaInicial ? getNextHour(horaInicial) : "",
          nombreCliente: "",
          telefonoCliente: "",
          emailCliente: "",
          documentoCliente: "",
          precio: config.precioPorHora.toString(),
          estado: "pendiente",
          notas: "",
        })
      }
    }
  }, [open, reserva, fechaInicial, horaInicial, form, config.precioPorHora])

  const getNextHour = (hora: string): string => {
    const [h, m] = hora.split(":").map(Number)
    const nextH = h + 1
    return `${nextH.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`
  }

  const onSubmit = async (data: ReservaFormValues) => {
    setIsLoading(true)
    try {
      const payload = {
        canchaId: parseInt(data.canchaId),
        fecha: format(data.fecha, "yyyy-MM-dd"),
        horaInicio: data.horaInicio,
        horaFin: data.horaFin,
        cliente: {
          nombre: data.nombreCliente,
          telefono: data.telefonoCliente,
          email: data.emailCliente || undefined,
          documento: data.documentoCliente || undefined,
        },
        precio: parseInt(data.precio),
        estado: data.estado,
        notas: data.notas,
        origen: "admin" as const,
      }

      const url = isEditing ? `/api/reservas/${reserva.id}` : "/api/reservas"
      const method = isEditing ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (result.success) {
        toast.success(isEditing ? "Reserva actualizada" : "Reserva creada exitosamente")
        onOpenChange(false)
        onSuccess?.()
      } else {
        toast.error(result.message || "Error al guardar reserva")
      }
    } catch {
      toast.error("Error de conexión")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!reserva) return
    
    const confirmed = window.confirm("¿Estás seguro de eliminar esta reserva? Esta acción no se puede deshacer.")
    if (!confirmed) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/reservas/${reserva.id}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (result.success) {
        toast.success("Reserva eliminada")
        onOpenChange(false)
        onSuccess?.()
      } else {
        toast.error(result.message || "Error al eliminar")
      }
    } catch {
      toast.error("Error de conexión")
    } finally {
      setIsDeleting(false)
    }
  }

  const selectedEstado = estadosReserva.find(e => e.value === form.watch("estado"))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {isEditing ? "Editar Reserva" : "Nueva Reserva"}
            {isEditing && selectedEstado && (
              <Badge className={cn("text-xs", selectedEstado.color)}>
                {selectedEstado.label}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? `Reserva de ${reserva?.cliente.nombre} - ${format(new Date(reserva!.fecha), "PPP", { locale: es })}`
              : "Completa los datos para crear una nueva reserva desde el panel admin."
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Fecha y Cancha */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="fecha"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: es })
                            ) : (
                              <span>Seleccionar fecha</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="canchaId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cancha</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar cancha" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-primary" />
                            Cancha 1
                          </div>
                        </SelectItem>
                        <SelectItem value="2">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-accent" />
                            Cancha 2
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Horarios */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="horaInicio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hora Inicio</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar hora" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {horarios.map((hora) => (
                          <SelectItem key={hora} value={hora}>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              {hora}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="horaFin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hora Fin</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar hora" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {horarios.map((hora) => (
                          <SelectItem key={hora} value={hora}>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              {hora}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Datos del cliente */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <User className="h-4 w-4" />
                Datos del Cliente
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="nombreCliente"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Juan Pérez" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="telefonoCliente"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono / WhatsApp</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input placeholder="600 123 456" className="pl-10" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="emailCliente"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email (opcional)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input placeholder="email@ejemplo.com" className="pl-10" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="documentoCliente"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>DNI/NIE (opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="12345678Z" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Precio y Estado */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="precio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio (€ EUR)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="40" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="estado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar estado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {estadosReserva.map((estado) => (
                          <SelectItem key={estado.value} value={estado.value}>
                            <div className="flex items-center gap-2">
                              <div className={cn("w-2 h-2 rounded-full", estado.color.split(" ")[0])} />
                              {estado.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Notas */}
            <FormField
              control={form.control}
              name="notas"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas adicionales</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Información adicional sobre la reserva..."
                      className="resize-none"
                      rows={3}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="flex-col sm:flex-row gap-2">
              {isEditing && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isDeleting || isLoading}
                  className="sm:mr-auto"
                >
                  {isDeleting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="mr-2 h-4 w-4" />
                  )}
                  Eliminar
                </Button>
              )}
              
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Guardar Cambios" : "Crear Reserva"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
