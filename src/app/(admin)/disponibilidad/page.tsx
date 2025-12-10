"use client"

import { useEffect, useState, useCallback } from "react"
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Clock,
  User,
  Phone,
  RefreshCw,
  Plus,
  CheckCircle2,
  XCircle,
  Loader2
} from "lucide-react"
import { format, addDays, startOfWeek, isToday, addWeeks, subWeeks } from "date-fns"
import { es } from "date-fns/locale"
import { motion } from "motion/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Reserva, Cancha, EstadoReserva } from "@/types"
import { getCanchas } from "@/lib/storage"
import { cn, formatCurrency } from "@/lib/utils"
import { toast } from "sonner"

// Horarios disponibles (8:00 a 23:00)
const HORARIOS = Array.from({ length: 16 }, (_, i) => {
  const hora = i + 8
  return `${hora.toString().padStart(2, '0')}:00`
})

interface SlotInfo {
  reserva: Reserva | null
  estado: 'disponible' | 'reservado' | 'pendiente' | 'bloqueado'
}

const estadoConfig = {
  disponible: {
    bg: "bg-success/10 hover:bg-success/20 border-success/20",
    text: "text-success",
    label: "Disponible"
  },
  reservado: {
    bg: "bg-primary/20 border-primary/30",
    text: "text-primary",
    label: "Reservado"
  },
  pendiente: {
    bg: "bg-warning/20 border-warning/30",
    text: "text-warning",
    label: "Pendiente"
  },
  bloqueado: {
    bg: "bg-muted border-muted-foreground/20",
    text: "text-muted-foreground",
    label: "No disponible"
  }
}

export default function DisponibilidadPage() {
  const [canchas, setCanchas] = useState<Cancha[]>([])
  const [reservas, setReservas] = useState<Reserva[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [fechaBase, setFechaBase] = useState(() => startOfWeek(new Date(), { locale: es, weekStartsOn: 1 }))
  const [selectedSlot, setSelectedSlot] = useState<{
    cancha: Cancha
    fecha: Date
    hora: string
    reserva: Reserva | null
  } | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)

  // Generar días de la semana
  const diasSemana = Array.from({ length: 7 }, (_, i) => addDays(fechaBase, i))

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      // Cargar canchas
      const canchasData = getCanchas().filter(c => c.activa)
      setCanchas(canchasData)

      // Cargar reservas
      const response = await fetch("/api/reservas")
      const result = await response.json()
      if (result.success) {
        setReservas(result.data)
      }
    } catch {
      toast.error("Error al cargar datos")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()

    // Escuchar cambios en canchas
    const handleCanchasUpdate = () => {
      const canchasData = getCanchas().filter(c => c.activa)
      setCanchas(canchasData)
    }

    window.addEventListener('canchas-updated', handleCanchasUpdate)
    return () => window.removeEventListener('canchas-updated', handleCanchasUpdate)
  }, [fetchData])

  // Obtener estado de un slot específico
  const getSlotInfo = (canchaId: number, fecha: Date, hora: string): SlotInfo => {
    const fechaStr = format(fecha, 'yyyy-MM-dd')
    const reserva = reservas.find(r => 
      r.canchaId === canchaId && 
      r.fecha === fechaStr && 
      r.horaInicio === hora &&
      r.estado !== 'cancelada'
    )

    if (reserva) {
      return {
        reserva,
        estado: reserva.estado === 'pendiente' ? 'pendiente' : 'reservado'
      }
    }

    // Verificar si es hora pasada
    const ahora = new Date()
    const slotDate = new Date(`${fechaStr}T${hora}`)
    if (slotDate < ahora) {
      return { reserva: null, estado: 'bloqueado' }
    }

    return { reserva: null, estado: 'disponible' }
  }

  // Contar reservas por día
  const getReservasPorDia = (fecha: Date) => {
    const fechaStr = format(fecha, 'yyyy-MM-dd')
    return reservas.filter(r => r.fecha === fechaStr && r.estado !== 'cancelada').length
  }

  // Navegación de semanas
  const irSemanaAnterior = () => setFechaBase(prev => subWeeks(prev, 1))
  const irSemanaSiguiente = () => setFechaBase(prev => addWeeks(prev, 1))
  const irHoy = () => setFechaBase(startOfWeek(new Date(), { locale: es, weekStartsOn: 1 }))

  const handleSlotClick = (cancha: Cancha, fecha: Date, hora: string, slotInfo: SlotInfo) => {
    setSelectedSlot({
      cancha,
      fecha,
      hora,
      reserva: slotInfo.reserva
    })
    setDetailDialogOpen(true)
  }

  const handleCambiarEstado = async (reservaId: string, nuevoEstado: EstadoReserva) => {
    try {
      const response = await fetch(`/api/reservas/${reservaId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado })
      })

      if (response.ok) {
        toast.success(`Reserva ${nuevoEstado}`)
        fetchData()
        setDetailDialogOpen(false)
      } else {
        toast.error("Error al actualizar")
      }
    } catch {
      toast.error("Error de conexión")
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Disponibilidad</h1>
            <p className="text-muted-foreground">
              Vista en tiempo real de disponibilidad por cancha y horario
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar
            </Button>
          </div>
        </div>

        {/* Navegación de semana */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={irSemanaAnterior}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={irSemanaSiguiente}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={irHoy}>
                  Hoy
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">
                  {format(diasSemana[0], "d MMM", { locale: es })} - {format(diasSemana[6], "d MMM yyyy", { locale: es })}
                </span>
              </div>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    Ir a fecha
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={fechaBase}
                    onSelect={(date) => date && setFechaBase(startOfWeek(date, { locale: es, weekStartsOn: 1 }))}
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </CardContent>
        </Card>

        {/* Leyenda */}
        <div className="flex flex-wrap items-center gap-4 text-sm">
          {Object.entries(estadoConfig).map(([key, config]) => (
            <div key={key} className="flex items-center gap-2">
              <div className={cn("w-4 h-4 rounded border", config.bg)} />
              <span className="text-muted-foreground">{config.label}</span>
            </div>
          ))}
        </div>

        {/* Grid de disponibilidad por cancha */}
        <div className="space-y-6">
          {canchas.map((cancha) => (
            <motion.div
              key={cancha.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: cancha.id === 1 ? '#10b981' : '#8b5cf6' }}
                      />
                      {cancha.nombre}
                    </CardTitle>
                    <Badge variant="outline">
                      {formatCurrency(cancha.precioPorHora || 1500)}/hora
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                  <table className="w-full border-collapse min-w-[800px]">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="p-2 text-left text-sm font-medium text-muted-foreground border-b w-20">
                          <Clock className="h-4 w-4 inline mr-1" />
                          Hora
                        </th>
                        {diasSemana.map((dia) => (
                          <th 
                            key={dia.toISOString()} 
                            className={cn(
                              "p-2 text-center text-sm font-medium border-b min-w-[100px]",
                              isToday(dia) && "bg-primary/10"
                            )}
                          >
                            <div className={cn(
                              "flex flex-col items-center",
                              isToday(dia) && "text-primary"
                            )}>
                              <span className="text-xs text-muted-foreground uppercase">
                                {format(dia, "EEE", { locale: es })}
                              </span>
                              <span className={cn(
                                "text-lg font-bold",
                                isToday(dia) && "bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center"
                              )}>
                                {format(dia, "d")}
                              </span>
                              {getReservasPorDia(dia) > 0 && (
                                <span className="text-xs text-muted-foreground">
                                  {getReservasPorDia(dia)} res.
                                </span>
                              )}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {HORARIOS.map((hora) => (
                        <tr key={hora} className="hover:bg-muted/30">
                          <td className="p-2 text-sm font-medium text-muted-foreground border-r bg-muted/30">
                            {hora}
                          </td>
                          {diasSemana.map((dia) => {
                            const slotInfo = getSlotInfo(cancha.id, dia, hora)
                            const config = estadoConfig[slotInfo.estado]

                            return (
                              <td 
                                key={`${dia.toISOString()}-${hora}`}
                                className={cn(
                                  "p-1 border",
                                  isToday(dia) && "bg-primary/5"
                                )}
                              >
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button
                                      onClick={() => handleSlotClick(cancha, dia, hora, slotInfo)}
                                      disabled={slotInfo.estado === 'bloqueado'}
                                      className={cn(
                                        "w-full h-10 rounded text-xs font-medium transition-all border",
                                        config.bg,
                                        config.text,
                                        slotInfo.estado === 'bloqueado' && "cursor-not-allowed opacity-50",
                                        slotInfo.estado !== 'bloqueado' && "cursor-pointer"
                                      )}
                                    >
                                      {slotInfo.reserva ? (
                                        <span className="truncate px-1 block">
                                          {slotInfo.reserva.cliente.nombre.split(' ')[0]}
                                        </span>
                                      ) : slotInfo.estado === 'disponible' ? (
                                        <Plus className="h-4 w-4 mx-auto opacity-0 group-hover:opacity-100" />
                                      ) : null}
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent side="top" className="max-w-[200px]">
                                    {slotInfo.reserva ? (
                                      <div className="space-y-1">
                                        <p className="font-medium">{slotInfo.reserva.cliente.nombre}</p>
                                        <p className="text-xs">{slotInfo.reserva.cliente.telefono}</p>
                                        <Badge variant="outline" className="text-xs">
                                          {slotInfo.reserva.estado}
                                        </Badge>
                                      </div>
                                    ) : (
                                      <p>{config.label}</p>
                                    )}
                                  </TooltipContent>
                                </Tooltip>
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Dialog de detalle */}
        <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {selectedSlot?.reserva ? "Detalle de Reserva" : "Slot Disponible"}
              </DialogTitle>
            </DialogHeader>

            {selectedSlot && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Cancha</p>
                    <p className="font-medium">{selectedSlot.cancha.nombre}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Fecha</p>
                    <p className="font-medium">
                      {format(selectedSlot.fecha, "EEEE d 'de' MMMM", { locale: es })}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Hora</p>
                    <p className="font-medium">{selectedSlot.hora}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Precio</p>
                    <p className="font-medium">
                      {formatCurrency(selectedSlot.cancha.precioPorHora || 1500)}
                    </p>
                  </div>
                </div>

                {selectedSlot.reserva ? (
                  <>
                    <div className="border-t pt-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{selectedSlot.reserva.cliente.nombre}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedSlot.reserva.cliente.telefono}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          Estado: {selectedSlot.reserva.estado}
                        </Badge>
                      </div>
                      {selectedSlot.reserva.notas && (
                        <p className="text-sm text-muted-foreground">
                          Notas: {selectedSlot.reserva.notas}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2 pt-2">
                      {selectedSlot.reserva.estado === 'pendiente' && (
                        <Button 
                          className="flex-1"
                          onClick={() => handleCambiarEstado(selectedSlot.reserva!.id, 'confirmada')}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Confirmar
                        </Button>
                      )}
                      {selectedSlot.reserva.estado !== 'cancelada' && (
                        <Button 
                          variant="destructive" 
                          className="flex-1"
                          onClick={() => handleCambiarEstado(selectedSlot.reserva!.id, 'cancelada')}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Cancelar
                        </Button>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="border-t pt-4">
                    <p className="text-center text-muted-foreground mb-4">
                      Este horario está disponible para reservar
                    </p>
                    <Button 
                      className="w-full"
                      onClick={() => {
                        // Redirect to nueva reserva with pre-filled data
                        const params = new URLSearchParams({
                          cancha: selectedSlot.cancha.id.toString(),
                          fecha: format(selectedSlot.fecha, 'yyyy-MM-dd'),
                          hora: selectedSlot.hora
                        })
                        window.location.href = `/reservas/nueva?${params.toString()}`
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Crear Reserva
                    </Button>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}
