"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { CalendarIcon, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn, getHorasDisponibles } from "@/lib/utils"
import { Reserva } from "@/types"

const reservaSchema = z.object({
  canchaId: z.string(),
  fecha: z.date({ error: "La fecha es requerida" }),
  horaInicio: z.string({ error: "La hora de inicio es requerida" }),
  horaFin: z.string({ error: "La hora de fin es requerida" }),
  nombreCliente: z.string().min(2, "El nombre es requerido"),
  telefonoCliente: z.string().min(8, "El teléfono es requerido"),
  emailCliente: z.string().email("Email inválido").optional().or(z.literal("")),
  precio: z.string().min(1, "El precio es requerido"),
  notas: z.string().optional(),
})

type ReservaFormValues = z.infer<typeof reservaSchema>

interface FormularioReservaProps {
  reservaInicial?: Reserva
  onSuccess?: () => void
}

export function FormularioReserva({ reservaInicial, onSuccess }: FormularioReservaProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  // Horarios disponibles (mock por ahora, idealmente vendrían de config)
  const horarios = getHorasDisponibles("08:00", "23:00", 60)

  const form = useForm<ReservaFormValues>({
    resolver: zodResolver(reservaSchema),
    defaultValues: {
      canchaId: reservaInicial?.canchaId.toString() || "1",
      fecha: reservaInicial ? new Date(reservaInicial.fecha) : new Date(),
      horaInicio: reservaInicial?.horaInicio || "",
      horaFin: reservaInicial?.horaFin || "",
      nombreCliente: reservaInicial?.cliente.nombre || "",
      telefonoCliente: reservaInicial?.cliente.telefono || "",
      emailCliente: reservaInicial?.cliente.email || "",
      precio: reservaInicial?.precio.toString() || "1000",
      notas: reservaInicial?.notas || "",
    },
  })

  async function onSubmit(data: ReservaFormValues) {
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
        },
        precio: parseInt(data.precio),
        notas: data.notas,
        estado: "confirmada", // Por defecto confirmada al crear desde admin
      }

      const url = reservaInicial 
        ? `/api/reservas/${reservaInicial.id}`
        : "/api/reservas"
      
      const method = reservaInicial ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (result.success) {
        toast.success(reservaInicial ? "Reserva actualizada" : "Reserva creada exitosamente")
        if (onSuccess) {
          onSuccess()
        } else {
          router.push("/reservas")
          router.refresh()
        }
      } else {
        toast.error(result.error || "Error al guardar reserva")
        if (result.errores) {
          result.errores.forEach((error: string) => toast.error(error))
        }
      }
    } catch (error) {
      toast.error("Error de conexión")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Selección de Cancha */}
          <FormField
            control={form.control}
            name="canchaId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cancha</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar cancha" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="1">Cancha 1</SelectItem>
                    <SelectItem value="2">Cancha 2</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Selección de Fecha */}
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
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
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
                      disabled={(date) =>
                        date < new Date(new Date().setHours(0, 0, 0, 0))
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Hora Inicio */}
          <FormField
            control={form.control}
            name="horaInicio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hora Inicio</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar hora" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {horarios.map((hora) => (
                      <SelectItem key={`inicio-${hora}`} value={hora}>
                        {hora}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Hora Fin */}
          <FormField
            control={form.control}
            name="horaFin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hora Fin</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar hora" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {horarios.map((hora) => (
                      <SelectItem key={`fin-${hora}`} value={hora}>
                        {hora}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Datos del Cliente */}
          <FormField
            control={form.control}
            name="nombreCliente"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre del Cliente</FormLabel>
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
                <FormLabel>Teléfono</FormLabel>
                <FormControl>
                  <Input placeholder="+598 99 123 456" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="emailCliente"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email (Opcional)</FormLabel>
                <FormControl>
                  <Input placeholder="cliente@ejemplo.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="precio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Precio</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notas"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notas Adicionales</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Detalles adicionales..." 
                  className="resize-none" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {reservaInicial ? "Actualizar Reserva" : "Crear Reserva"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
