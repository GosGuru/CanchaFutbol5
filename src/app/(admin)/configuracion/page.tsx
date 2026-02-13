"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { 
  Loader2, 
  Save, 
  Clock, 
  DollarSign, 
  Building2, 
  Phone, 
  MapPin,
  Instagram,
  Calendar,
  Plus,
  X
} from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

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
import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Configuracion } from "@/types"
import { getConfiguracion, updateConfiguracion } from "@/lib/storage"

const configSchema = z.object({
  // Horarios
  horarioApertura: z.string(),
  horarioCierre: z.string(),
  duracionSlot: z.number().min(30).max(120),
  
  // Precios
  precioPorHora: z.number().min(0),
  precioNocturno: z.number().min(0),
  precioFinDeSemana: z.number().min(0),
  
  // Info del complejo
  nombreComplejo: z.string().min(1, "El nombre es requerido"),
  direccion: z.string().min(1, "La dirección es requerida"),
  telefono: z.string().min(8, "Teléfono inválido"),
  whatsapp: z.string().min(8, "WhatsApp inválido"),
  instagram: z.string().optional(),
  googleMapsUrl: z.string().url("URL inválida").optional().or(z.literal("")),
  googleMapsEmbed: z.string().optional(),
})

type ConfigFormValues = z.infer<typeof configSchema>

export default function ConfiguracionPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [config, setConfig] = useState<Configuracion | null>(null)
  const [diasBloqueados, setDiasBloqueados] = useState<Date[]>([])
  const [fechaBloquear, setFechaBloquear] = useState<Date | undefined>()

  const form = useForm<ConfigFormValues>({
    resolver: zodResolver(configSchema),
    defaultValues: {
      horarioApertura: "08:00",
      horarioCierre: "23:00",
      duracionSlot: 60,
      precioPorHora: 40,
      precioNocturno: 48,
      precioFinDeSemana: 50,
      nombreComplejo: "",
      direccion: "",
      telefono: "",
      whatsapp: "",
      instagram: "",
      googleMapsUrl: "",
      googleMapsEmbed: "",
    },
  })

  useEffect(() => {
    const currentConfig = getConfiguracion()
    setConfig(currentConfig)
    setDiasBloqueados(currentConfig.diasBloqueados.map(d => new Date(d)))
    
    form.reset({
      horarioApertura: currentConfig.horarioApertura,
      horarioCierre: currentConfig.horarioCierre,
      duracionSlot: currentConfig.duracionSlot,
      precioPorHora: currentConfig.precioPorHora,
      precioNocturno: currentConfig.precios?.turnoNocturno || currentConfig.precioPorHora,
      precioFinDeSemana: currentConfig.precios?.turnoFinDeSemana || currentConfig.precioPorHora,
      nombreComplejo: currentConfig.infoComplejo?.nombre || "Invasor Fútbol 5",
      direccion: currentConfig.infoComplejo?.direccion || "",
      telefono: currentConfig.infoComplejo?.telefono || "",
      whatsapp: currentConfig.infoComplejo?.whatsapp || "",
      instagram: currentConfig.infoComplejo?.instagram || "",
      googleMapsUrl: currentConfig.infoComplejo?.googleMapsUrl || "",
      googleMapsEmbed: currentConfig.infoComplejo?.googleMapsEmbed || "",
    })
  }, [form])

  const handleAgregarDiaBloqueado = () => {
    if (fechaBloquear) {
      const yaExiste = diasBloqueados.some(
        d => d.toDateString() === fechaBloquear.toDateString()
      )
      if (!yaExiste) {
        setDiasBloqueados([...diasBloqueados, fechaBloquear])
        toast.success(`Día ${format(fechaBloquear, "d MMM yyyy", { locale: es })} bloqueado`)
      }
      setFechaBloquear(undefined)
    }
  }

  const handleRemoverDiaBloqueado = (fecha: Date) => {
    setDiasBloqueados(diasBloqueados.filter(
      d => d.toDateString() !== fecha.toDateString()
    ))
  }

  const onSubmit = async (data: ConfigFormValues) => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const newConfig: Partial<Configuracion> = {
        horarioApertura: data.horarioApertura,
        horarioCierre: data.horarioCierre,
        duracionSlot: data.duracionSlot,
        precioPorHora: data.precioPorHora,
        precios: {
          turnoNormal: data.precioPorHora,
          turnoNocturno: data.precioNocturno,
          turnoFinDeSemana: data.precioFinDeSemana,
        },
        diasBloqueados: diasBloqueados.map(d => d.toISOString().split("T")[0]),
        infoComplejo: {
          nombre: data.nombreComplejo,
          direccion: data.direccion,
          telefono: data.telefono,
          whatsapp: data.whatsapp,
          instagram: data.instagram || "",
          googleMapsUrl: data.googleMapsUrl || "",
          googleMapsEmbed: data.googleMapsEmbed || "",
        },
      }
      
      updateConfiguracion(newConfig)
      toast.success("Configuración actualizada exitosamente")
    } catch {
      toast.error("Error al guardar configuración")
    } finally {
      setIsLoading(false)
    }
  }

  if (!config) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Configuración</h2>
          <p className="text-muted-foreground">
            Administra los parámetros del sistema de reservas
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Información del Complejo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Información del Complejo
              </CardTitle>
              <CardDescription>
                Datos que aparecerán en la landing page y comunicaciones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="nombreComplejo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre del Complejo</FormLabel>
                      <FormControl>
                        <Input placeholder="Cancha de Fútbol 5" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="direccion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dirección</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input placeholder="Av. Principal 1234" className="pl-10" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="telefono"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input placeholder="099 123 456" className="pl-10" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="whatsapp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>WhatsApp (número completo)</FormLabel>
                      <FormControl>
                        <Input placeholder="34600111222" {...field} />
                      </FormControl>
                      <FormDescription>
                        Sin + ni espacios. Ej: 34600111222
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="instagram"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instagram</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input placeholder="@canchafutbol5" className="pl-10" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="googleMapsUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL de Google Maps</FormLabel>
                      <FormControl>
                        <Input placeholder="https://maps.google.com/..." {...field} />
                      </FormControl>
                      <FormDescription>
                        Link para abrir en Google Maps
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="googleMapsEmbed"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Embed de Google Maps</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder='<iframe src="https://www.google.com/maps/embed?..." ...' 
                        className="font-mono text-xs"
                        rows={3}
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Código iframe de Google Maps para mostrar en la landing
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Horarios */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Horarios de Atención
              </CardTitle>
              <CardDescription>
                Define los horarios disponibles para reservas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="horarioApertura"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Apertura</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="horarioCierre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cierre</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="duracionSlot"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duración turno (minutos)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min={30} 
                          max={120} 
                          step={15} 
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Precios */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                Precios
              </CardTitle>
              <CardDescription>
                Configura los precios por hora según el tipo de turno
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="precioPorHora"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Turno Normal (€ EUR)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min={0} 
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        Precio base por hora
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="precioNocturno"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Turno Nocturno (€ EUR)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min={0} 
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        Después de las 20:00
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="precioFinDeSemana"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fin de Semana (€ EUR)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min={0} 
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        Sábados y Domingos
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Días Bloqueados */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Días Bloqueados
              </CardTitle>
              <CardDescription>
                Fechas en las que no se permiten reservas (feriados, mantenimiento, etc.)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Plus className="h-4 w-4" />
                      Agregar fecha
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={fechaBloquear}
                      onSelect={setFechaBloquear}
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      initialFocus
                    />
                    <div className="p-3 border-t">
                      <Button 
                        size="sm" 
                        className="w-full"
                        onClick={handleAgregarDiaBloqueado}
                        disabled={!fechaBloquear}
                      >
                        Bloquear día
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {diasBloqueados.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {diasBloqueados
                    .sort((a, b) => a.getTime() - b.getTime())
                    .map((fecha, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary"
                        className="gap-1 pr-1"
                      >
                        {format(fecha, "EEE d MMM yyyy", { locale: es })}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 hover:bg-destructive/20"
                          onClick={() => handleRemoverDiaBloqueado(fecha)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No hay días bloqueados
                </p>
              )}
            </CardContent>
          </Card>

          {/* Botón Guardar */}
          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading} size="lg" className="gap-2">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Guardar Configuración
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
