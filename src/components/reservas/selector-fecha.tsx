"use client"

import { useMemo } from "react"
import { motion, AnimatePresence } from "motion/react"
import { es } from "date-fns/locale"
import { 
  addDays, 
  isBefore, 
  startOfDay, 
  parseISO, 
  isSameDay, 
  format,
  isToday,
  isTomorrow,
  isWeekend
} from "date-fns"
import { 
  Sun,
  CalendarDays,
  CalendarCheck
} from "lucide-react"
import { cn } from "@/lib/utils"

interface SelectorFechaProps {
  fechaSeleccionada: Date | null
  onSelect: (fecha: Date) => void
  diasBloqueados?: string[]
}

export function SelectorFecha({ fechaSeleccionada, onSelect, diasBloqueados = [] }: SelectorFechaProps) {
  const hoy = startOfDay(new Date())
  const maxDate = addDays(hoy, 30)

  // Generar 14 días disponibles
  const diasDisponibles = useMemo(() => {
    const dias: { fecha: Date; diaNumero: string; diaNombre: string; mes: string }[] = []
    const hoyRef = startOfDay(new Date())
    
    for (let i = 0; i < 14; i++) {
      const fecha = addDays(hoyRef, i)
      
      dias.push({ 
        fecha, 
        diaNumero: format(fecha, "d", { locale: es }),
        diaNombre: i === 0 ? "HOY" : i === 1 ? "MAÑANA" : format(fecha, "EEE", { locale: es }).toUpperCase(),
        mes: format(fecha, "MMM", { locale: es }).toUpperCase()
      })
    }
    
    return dias
  }, [])

  // Convertir días bloqueados a Date objects
  const diasBloqueadosDate = useMemo(() => 
    diasBloqueados.map(d => parseISO(d)), 
    [diasBloqueados]
  )

  const isDateDisabled = (date: Date) => {
    if (isBefore(date, hoy)) return true
    if (isBefore(maxDate, date)) return true
    if (diasBloqueadosDate.some(blocked => isSameDay(blocked, date))) return true
    return false
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-1">
        <p className="text-sm font-medium text-muted-foreground flex items-center justify-center gap-2">
          <CalendarDays className="h-4 w-4" />
          Seleccioná el día para tu reserva
        </p>
      </div>
      
      {/* Grid de días */}
      <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 sm:gap-3">
        {diasDisponibles.map((dia, index) => {
          const isSelected = fechaSeleccionada && isSameDay(fechaSeleccionada, dia.fecha)
          const isDisabled = isDateDisabled(dia.fecha)
          const esFinDeSemana = isWeekend(dia.fecha)
          const esHoy = isToday(dia.fecha)
          
          return (
            <motion.button
              key={dia.fecha.toISOString()}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.02 }}
              onClick={() => !isDisabled && onSelect(dia.fecha)}
              disabled={isDisabled}
              className={cn(
                "relative flex flex-col items-center justify-center",
                "aspect-square rounded-2xl border-2 transition-all duration-200",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background",
                isSelected
                  ? "border-primary bg-primary text-primary-foreground shadow-xl shadow-primary/30 scale-105 z-10"
                  : isDisabled
                    ? "border-border/20 bg-muted/10 text-muted-foreground/30 cursor-not-allowed"
                    : esHoy
                      ? "border-primary/50 bg-primary/10 hover:border-primary hover:bg-primary/20 hover:scale-105"
                      : esFinDeSemana
                        ? "border-orange-500/40 bg-orange-500/5 hover:border-orange-500 hover:bg-orange-500/15 hover:scale-105"
                        : "border-border/50 bg-card/50 hover:border-primary/50 hover:bg-primary/5 hover:scale-105"
              )}
            >
              {/* Nombre del día */}
              <span className={cn(
                "text-[9px] sm:text-[10px] font-bold tracking-wide leading-none",
                isSelected 
                  ? "text-primary-foreground/80" 
                  : esHoy && !isSelected
                    ? "text-primary"
                    : "text-muted-foreground"
              )}>
                {dia.diaNombre}
              </span>
              
              {/* Número del día */}
              <span className={cn(
                "text-xl sm:text-2xl font-bold leading-tight",
                isSelected ? "text-primary-foreground" : ""
              )}>
                {dia.diaNumero}
              </span>
              
              {/* Mes */}
              <span className={cn(
                "text-[9px] sm:text-[10px] font-medium leading-none",
                isSelected ? "text-primary-foreground/70" : "text-muted-foreground/70"
              )}>
                {dia.mes}
              </span>

              {/* Indicador de fin de semana */}
              {esFinDeSemana && !isSelected && !isDisabled && (
                <Sun className="h-3 w-3 absolute bottom-1.5 right-1.5 text-orange-500" />
              )}
            </motion.button>
          )
        })}
      </div>

      {/* Leyenda compacta */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-md bg-primary/10 border border-primary/50" />
          <span>Hoy</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-md bg-orange-500/10 border border-orange-500/40" />
          <Sun className="h-3 w-3 text-orange-500" />
          <span>Fin de semana</span>
        </div>
      </div>

      {/* Fecha seleccionada - Feedback */}
      <AnimatePresence>
        {fechaSeleccionada && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="bg-primary/10 border border-primary/20 rounded-2xl p-4 text-center"
          >
            <div className="flex items-center justify-center gap-2 mb-1">
              <CalendarCheck className="h-5 w-5 text-primary" />
              <p className="text-sm text-muted-foreground">Fecha seleccionada</p>
            </div>
            <p className="text-lg font-bold text-primary capitalize">
              {isToday(fechaSeleccionada) 
                ? "Hoy, " 
                : isTomorrow(fechaSeleccionada) 
                  ? "Mañana, " 
                  : ""
              }
              {format(fechaSeleccionada, "EEEE d 'de' MMMM", { locale: es })}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
