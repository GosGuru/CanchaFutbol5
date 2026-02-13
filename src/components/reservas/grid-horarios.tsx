"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import { format } from "date-fns"
import { 
  Clock, 
  Sun, 
  Moon, 
  Sunrise, 
  CheckCircle2,
  XCircle,
  Warehouse,
  Trees,
  Timer
} from "lucide-react"
import { cn, formatCurrency } from "@/lib/utils"
import type { Configuracion, SlotDisponible } from "@/types"

interface GridHorariosProps {
  fecha: Date
  config: Configuracion
  onSelect: (horaInicio: string, horaFin: string, canchaId: 1 | 2) => void
  horarioSeleccionado: string | null
}

type Turno = "mañana" | "tarde" | "noche"

interface SlotExtendido extends SlotDisponible {
  turno: Turno
  precio: number
  esNocturno: boolean
}

export function GridHorarios({ fecha, config, onSelect, horarioSeleccionado }: GridHorariosProps) {
  const [slotsCancha1, setSlotsCancha1] = useState<SlotExtendido[]>([])
  const [slotsCancha2, setSlotsCancha2] = useState<SlotExtendido[]>([])
  const [loading, setLoading] = useState(true)
  const [canchaSeleccionada, setCanchaSeleccionada] = useState<1 | 2>(1)
  const [turnoFiltro, setTurnoFiltro] = useState<Turno | "todos">("todos")

  const getTurno = (hora: string): Turno => {
    const h = parseInt(hora.split(":")[0])
    if (h < 12) return "mañana"
    if (h < 18) return "tarde"
    return "noche"
  }

  const getPrecioSlot = (hora: string): number => {
    const h = parseInt(hora.split(":")[0])
    if (h >= 20) return config.precios?.turnoNocturno || config.precioPorHora
    const diaSemana = fecha.getDay()
    if (diaSemana === 0 || diaSemana === 6) {
      return config.precios?.turnoFinDeSemana || config.precioPorHora
    }
    return config.precios?.turnoNormal || config.precioPorHora
  }

  useEffect(() => {
    const getPrecio = (hora: string): number => {
      const h = parseInt(hora.split(":")[0])
      if (h >= 20) return config.precios?.turnoNocturno || config.precioPorHora
      const diaSemana = fecha.getDay()
      if (diaSemana === 0 || diaSemana === 6) {
        return config.precios?.turnoFinDeSemana || config.precioPorHora
      }
      return config.precios?.turnoNormal || config.precioPorHora
    }

    const fetchDisponibilidad = async () => {
      setLoading(true)
      try {
        const fechaStr = format(fecha, "yyyy-MM-dd")
        
        const [res1, res2] = await Promise.all([
          fetch(`/api/disponibilidad?fecha=${fechaStr}&canchaId=1`),
          fetch(`/api/disponibilidad?fecha=${fechaStr}&canchaId=2`),
        ])

        if (res1.ok && res2.ok) {
          const data1 = await res1.json()
          const data2 = await res2.json()
          
          // Extender slots con información adicional
          const extenderSlots = (slots: SlotDisponible[]): SlotExtendido[] => 
            slots.map(s => ({
              ...s,
              turno: getTurno(s.hora),
              precio: getPrecio(s.hora),
              esNocturno: parseInt(s.hora.split(":")[0]) >= 20
            }))
          
          setSlotsCancha1(extenderSlots(data1.slots || []))
          setSlotsCancha2(extenderSlots(data2.slots || []))
        }
      } catch (error) {
        console.error("Error fetching disponibilidad:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDisponibilidad()
  }, [fecha, config])

  const handleSlotClick = (slot: SlotExtendido, canchaId: 1 | 2) => {
    if (!slot.disponible) return
    
    const [hours, minutes] = slot.hora.split(":").map(Number)
    const endHours = hours + Math.floor(config.duracionSlot / 60)
    const endMinutes = minutes + (config.duracionSlot % 60)
    const horaFin = `${String(endHours).padStart(2, "0")}:${String(endMinutes).padStart(2, "0")}`
    
    onSelect(slot.hora, horaFin, canchaId)
  }

  const slots = canchaSeleccionada === 1 ? slotsCancha1 : slotsCancha2
  const slotsFiltrados = turnoFiltro === "todos" 
    ? slots 
    : slots.filter(s => s.turno === turnoFiltro)

  const disponiblesCount = slots.filter(s => s.disponible).length
  const ocupadosCount = slots.filter(s => !s.disponible).length

  const turnosInfo = [
    { id: "todos" as const, label: "Todos", icon: Clock },
    { id: "mañana" as const, label: "Mañana", icon: Sunrise, rango: "8-12hs" },
    { id: "tarde" as const, label: "Tarde", icon: Sun, rango: "12-18hs" },
    { id: "noche" as const, label: "Noche", icon: Moon, rango: "18-23hs" },
  ]

  if (loading) {
    return (
      <div className="space-y-4">
        {/* Skeleton de tabs de cancha */}
        <div className="flex gap-2">
          <div className="flex-1 h-14 rounded-xl bg-muted animate-pulse" />
          <div className="flex-1 h-14 rounded-xl bg-muted animate-pulse" />
        </div>
        {/* Skeleton de filtros */}
        <div className="flex gap-2">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-8 w-20 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
        {/* Skeleton de slots */}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Selector de cancha - Mejorado */}
      <div className="grid grid-cols-2 gap-3">
        {[1, 2].map((cancha) => {
          const isSelected = canchaSeleccionada === cancha
          const slotsCancha = cancha === 1 ? slotsCancha1 : slotsCancha2
          const disponibles = slotsCancha.filter(s => s.disponible).length
          const CanchaIcon = cancha === 1 ? Warehouse : Trees
          
          return (
            <motion.button
              key={cancha}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setCanchaSeleccionada(cancha as 1 | 2)}
              className={cn(
                "relative p-4 rounded-2xl border-2 transition-all duration-200",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background",
                isSelected 
                  ? "border-primary bg-primary/10 shadow-lg shadow-primary/20" 
                  : "border-border hover:border-primary/40 hover:bg-muted/50"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                  isSelected ? "bg-primary/20" : "bg-muted"
                )}>
                  <CanchaIcon className={cn(
                    "h-5 w-5",
                    isSelected ? "text-primary" : "text-muted-foreground"
                  )} />
                </div>
                <div className="text-left">
                  <p className={cn(
                    "font-semibold",
                    isSelected ? "text-primary" : ""
                  )}>
                    Cancha {cancha}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {cancha === 1 ? "Techada" : "Césped"}
                  </p>
                  <p className={cn(
                    "text-xs font-medium mt-1",
                    disponibles > 0 ? "text-emerald-500" : "text-destructive"
                  )}>
                    {disponibles > 0 
                      ? `${disponibles} turnos libres` 
                      : "Sin disponibilidad"}
                  </p>
                </div>
              </div>
              
              {isSelected && (
                <motion.div
                  layoutId="cancha-indicator"
                  className="absolute inset-0 border-2 border-primary rounded-2xl"
                  transition={{ type: "spring", duration: 0.3 }}
                />
              )}
            </motion.button>
          )
        })}
      </div>

      {/* Filtros por turno - Mejorados */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {turnosInfo.map((turno) => {
          const Icon = turno.icon
          const isActive = turnoFiltro === turno.id
          const slotsEnTurno = turno.id === "todos" 
            ? slots.filter(s => s.disponible).length
            : slots.filter(s => s.turno === turno.id && s.disponible).length
          
          return (
            <button
              key={turno.id}
              onClick={() => setTurnoFiltro(turno.id)}
              className={cn(
                "shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-md" 
                  : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{turno.label}</span>
              <span className={cn(
                "text-xs px-1.5 py-0.5 rounded-md",
                isActive ? "bg-primary-foreground/20" : "bg-background/50"
              )}>
                {slotsEnTurno}
              </span>
            </button>
          )
        })}
      </div>

      {/* Info de disponibilidad */}
      <div className="flex items-center justify-between text-sm bg-muted/30 rounded-xl px-4 py-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-emerald-500">
            <CheckCircle2 className="h-4 w-4" />
            <span className="font-medium">{disponiblesCount} libres</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <XCircle className="h-4 w-4" />
            <span>{ocupadosCount} reservados</span>
          </div>
        </div>
        
        {config.precios?.turnoNocturno !== config.precioPorHora && (
          <div className="flex items-center gap-1.5 text-xs text-amber-500">
            <Moon className="h-3.5 w-3.5" />
            <span>Precio especial nocturno +20hs</span>
          </div>
        )}
      </div>

      {/* Grid de horarios - Mejorado con grid responsivo */}
      {slotsFiltrados.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Timer className="h-16 w-16 mx-auto mb-4 opacity-20" />
          <p className="text-lg font-medium mb-2">No hay turnos libres</p>
          <p className="text-sm mb-4">Probá con otro turno o seleccioná otra fecha</p>
          <button 
            onClick={() => setTurnoFiltro("todos")}
            className="text-primary hover:underline font-medium"
          >
            Ver todos los horarios
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <AnimatePresence mode="popLayout">
            {slotsFiltrados.map((slot, index) => {
              const isSelected = horarioSeleccionado === slot.hora && 
                ((canchaSeleccionada === 1 && slotsCancha1.includes(slot)) ||
                 (canchaSeleccionada === 2 && slotsCancha2.includes(slot)))
              
              return (
                <motion.button
                  key={`${slot.hora}-${canchaSeleccionada}`}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.02 }}
                  onClick={() => handleSlotClick(slot, canchaSeleccionada)}
                  disabled={!slot.disponible}
                  className={cn(
                    "relative p-4 rounded-2xl transition-all duration-200",
                    "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background",
                    slot.disponible 
                      ? isSelected
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                        : "bg-card hover:bg-primary/10 hover:border-primary/50 border border-border cursor-pointer hover:scale-105"
                      : "bg-muted/20 text-muted-foreground/50 cursor-not-allowed border border-transparent"
                  )}
                >
                  {/* Hora */}
                  <span className={cn(
                    "block text-xl font-bold",
                    !slot.disponible && "opacity-40"
                  )}>
                    {slot.hora}
                  </span>
                  
                  {/* Precio */}
                  <span className={cn(
                    "block text-sm mt-1",
                    isSelected 
                      ? "text-primary-foreground/80" 
                      : slot.disponible 
                        ? "text-muted-foreground" 
                        : "text-muted-foreground/40"
                  )}>
                    {formatCurrency(slot.precio)}
                  </span>

                  {/* Indicador nocturno */}
                  {slot.esNocturno && slot.disponible && !isSelected && (
                    <Moon className="absolute top-2 right-2 h-4 w-4 text-amber-500" />
                  )}

                  {/* Badge ocupado */}
                  {!slot.disponible && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-2xl">
                      <span className="text-xs font-medium bg-destructive/10 text-destructive/60 px-2.5 py-1 rounded-lg">
                        Ocupado
                      </span>
                    </div>
                  )}

                  {/* Check de selección */}
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-primary-foreground rounded-full flex items-center justify-center shadow-lg"
                    >
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    </motion.div>
                  )}
                </motion.button>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Horario seleccionado - Feedback mejorado */}
      <AnimatePresence>
        {horarioSeleccionado && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="bg-primary/10 border border-primary/20 rounded-2xl p-5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Horario seleccionado</p>
                  <p className="text-lg font-bold text-primary">
                    {horarioSeleccionado} · Cancha {canchaSeleccionada}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(getPrecioSlot(horarioSeleccionado))}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
