"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Calendar, Clock, User, Check, ChevronLeft, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { SelectorFecha } from "@/components/reservas/selector-fecha"
import { GridHorarios } from "@/components/reservas/grid-horarios"
import { FormularioCliente } from "@/components/reservas/formulario-cliente"
import { ResumenReserva } from "@/components/reservas/resumen-reserva"
import { getConfiguracion } from "@/lib/storage"
import { cn } from "@/lib/utils"
import type { Cliente } from "@/types"

type Paso = 1 | 2 | 3 | 4

interface DatosReserva {
  fecha: Date | null
  canchaId: 1 | 2
  horaInicio: string | null
  horaFin: string | null
  cliente: Cliente | null
  precio: number
}

const pasos = [
  { numero: 1, titulo: "Fecha", descripcion: "¿Cuándo jugás?", icon: Calendar },
  { numero: 2, titulo: "Horario", descripcion: "¿A qué hora?", icon: Clock },
  { numero: 3, titulo: "Datos", descripcion: "Tu info", icon: User },
  { numero: 4, titulo: "Pagar", descripcion: "¡Listo!", icon: Check },
]

export default function ReservarPage() {
  const config = useMemo(() => getConfiguracion(), [])
  
  const [pasoActual, setPasoActual] = useState<Paso>(1)
  const [datos, setDatos] = useState<DatosReserva>(() => ({
    fecha: null,
    canchaId: 1,
    horaInicio: null,
    horaFin: null,
    cliente: null,
    precio: config.precioPorHora,
  }))

  const handleFechaSelect = (fecha: Date) => {
    setDatos(prev => ({ ...prev, fecha, horaInicio: null, horaFin: null }))
    setPasoActual(2)
  }

  const handleHorarioSelect = (horaInicio: string, horaFin: string, canchaId: 1 | 2) => {
    // Calcular precio según horario
    const hora = parseInt(horaInicio.split(":")[0])
    let precio = config.precioPorHora
    
    if (hora >= 20) {
      precio = config.precios?.turnoNocturno || config.precioPorHora
    } else if (datos.fecha) {
      const dia = datos.fecha.getDay()
      if (dia === 0 || dia === 6) {
        precio = config.precios?.turnoFinDeSemana || config.precioPorHora
      }
    }
    
    setDatos(prev => ({ ...prev, horaInicio, horaFin, canchaId, precio }))
    setPasoActual(3)
  }

  const handleClienteSubmit = (cliente: Cliente) => {
    setDatos(prev => ({ ...prev, cliente }))
    setPasoActual(4)
  }

  const handleVolver = () => {
    if (pasoActual > 1) {
      setPasoActual((pasoActual - 1) as Paso)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header con info de progreso */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
          <Trophy className="h-4 w-4" />
          <span>Reservá fácil y rápido en 2 minutos</span>
        </div>
        <h1 className="text-3xl font-bold mb-2">Reservá tu cancha</h1>
        <p className="text-muted-foreground">Seguí estos simples pasos para confirmar tu turno</p>
      </motion.div>

      {/* Progress Steps - Mejorado y responsivo */}
      <div className="mb-8 px-2">
        {/* Versión compacta móvil */}
        <div className="sm:hidden">
          <div className="flex items-center justify-between bg-muted/30 rounded-2xl p-3">
            {pasos.map((paso, index) => {
              const isActive = paso.numero === pasoActual
              const isCompleted = paso.numero < pasoActual
              const Icon = paso.icon
              
              return (
                <div key={paso.numero} className="flex items-center">
                  <motion.button
                    onClick={() => {
                      if (isCompleted) {
                        setPasoActual(paso.numero as Paso)
                      }
                    }}
                    disabled={!isCompleted && !isActive}
                    whileTap={isCompleted ? { scale: 0.95 } : undefined}
                    className={cn(
                      "relative flex flex-col items-center gap-1 p-2 rounded-xl transition-all",
                      isCompleted && "cursor-pointer",
                      isActive && "bg-primary/10"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                      isCompleted 
                        ? "bg-primary text-primary-foreground" 
                        : isActive 
                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30" 
                          : "bg-muted text-muted-foreground"
                    )}>
                      {isCompleted ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Icon className="h-4 w-4" />
                      )}
                    </div>
                    <span className={cn(
                      "text-[10px] font-medium",
                      isActive ? "text-primary" : isCompleted ? "text-foreground" : "text-muted-foreground"
                    )}>
                      {paso.titulo}
                    </span>
                    
                    {/* Indicador activo */}
                    {isActive && (
                      <motion.div
                        layoutId="mobile-step-indicator"
                        className="absolute -bottom-1 w-6 h-1 bg-primary rounded-full"
                      />
                    )}
                  </motion.button>
                  
                  {/* Mini connector */}
                  {index < pasos.length - 1 && (
                    <div className={cn(
                      "w-4 h-0.5 mx-0.5",
                      isCompleted ? "bg-primary" : "bg-muted"
                    )} />
                  )}
                </div>
              )
            })}
          </div>
          
          {/* Info del paso actual en móvil */}
          <div className="text-center mt-4">
            <p className="text-sm text-muted-foreground">
              Paso {pasoActual} de {pasos.length}: {pasos[pasoActual - 1].descripcion}
            </p>
          </div>
        </div>
        
        {/* Versión desktop */}
        <div className="hidden sm:flex items-center justify-between max-w-2xl mx-auto">
          {pasos.map((paso, index) => {
            const isActive = paso.numero === pasoActual
            const isCompleted = paso.numero < pasoActual
            const Icon = paso.icon

            return (
              <div key={paso.numero} className="flex items-center">
                <div className="flex flex-col items-center">
                  {/* Circle */}
                  <motion.button
                    onClick={() => {
                      if (isCompleted) {
                        setPasoActual(paso.numero as Paso)
                      }
                    }}
                    disabled={!isCompleted && !isActive}
                    initial={false}
                    animate={{
                      scale: isActive ? 1.1 : 1,
                    }}
                    className={cn(
                      "relative w-12 h-12 rounded-full flex items-center justify-center transition-colors",
                      "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background",
                      isCompleted 
                        ? "bg-primary text-primary-foreground cursor-pointer" 
                        : isActive 
                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30" 
                          : "bg-muted text-muted-foreground cursor-not-allowed"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                    
                    {/* Pulse animation para paso activo */}
                    {isActive && (
                      <motion.div
                        className="absolute inset-0 rounded-full bg-primary"
                        initial={{ scale: 1, opacity: 0.5 }}
                        animate={{ scale: 1.5, opacity: 0 }}
                        transition={{ duration: 1, repeat: Infinity }}
                      />
                    )}
                  </motion.button>
                  
                  {/* Label */}
                  <div className="mt-2 text-center">
                    <span className={cn(
                      "text-xs font-medium block",
                      isActive ? "text-primary" : isCompleted ? "text-foreground" : "text-muted-foreground"
                    )}>
                      {paso.titulo}
                    </span>
                    <span className="text-[10px] text-muted-foreground block">
                      {paso.descripcion}
                    </span>
                  </div>
                </div>
                
                {/* Connector line */}
                {index < pasos.length - 1 && (
                  <div className="relative w-16 md:w-24 h-0.5 mx-2 -mt-6">
                    <div className="absolute inset-0 bg-muted rounded-full" />
                    <motion.div
                      className="absolute inset-y-0 left-0 bg-primary rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: isCompleted ? "100%" : "0%" }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Contenido del paso actual */}
      <AnimatePresence mode="wait">
        <motion.div
          key={pasoActual}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {pasoActual === 1 && (
            <Card className="overflow-hidden max-w-2xl mx-auto">
              <CardHeader className="text-center bg-linear-to-b from-primary/5 to-transparent pb-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Calendar className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">¿Cuándo querés jugar?</CardTitle>
                <CardDescription>
                  Seleccioná la fecha ideal para tu próximo partido
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <SelectorFecha
                  fechaSeleccionada={datos.fecha}
                  onSelect={handleFechaSelect}
                  diasBloqueados={config.diasBloqueados}
                />
              </CardContent>
            </Card>
          )}

          {pasoActual === 2 && datos.fecha && (
            <Card className="overflow-hidden max-w-2xl mx-auto">
              <CardHeader className="bg-linear-to-b from-primary/5 to-transparent">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Clock className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Elegí cancha y horario</CardTitle>
                      <CardDescription>
                        {datos.fecha.toLocaleDateString("es-UY", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                        })}
                      </CardDescription>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleVolver}>
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Cambiar fecha</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <GridHorarios
                  fecha={datos.fecha}
                  config={config}
                  onSelect={handleHorarioSelect}
                  horarioSeleccionado={datos.horaInicio}
                />
              </CardContent>
            </Card>
          )}

          {pasoActual === 3 && (
            <Card className="overflow-hidden max-w-2xl mx-auto">
              <CardHeader className="bg-linear-to-b from-primary/5 to-transparent">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">¿Quién va a jugar?</CardTitle>
                      <CardDescription>
                        Completá tus datos para contactarte
                      </CardDescription>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleVolver}>
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Cambiar horario</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Mini resumen de la reserva */}
                <div className="mb-6 p-4 rounded-xl bg-muted/50 flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>
                      {datos.fecha?.toLocaleDateString("es-UY", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>{datos.horaInicio} - Cancha {datos.canchaId}</span>
                  </div>
                  <div className="flex items-center gap-2 ml-auto font-semibold text-primary">
                    ${datos.precio.toLocaleString("es-UY")}
                  </div>
                </div>

                <FormularioCliente
                  onSubmit={handleClienteSubmit}
                  datosIniciales={datos.cliente}
                />
              </CardContent>
            </Card>
          )}

          {pasoActual === 4 && datos.fecha && datos.horaInicio && datos.horaFin && datos.cliente && (
            <ResumenReserva
              fecha={datos.fecha}
              horaInicio={datos.horaInicio}
              horaFin={datos.horaFin}
              canchaId={datos.canchaId}
              cliente={datos.cliente}
              precio={datos.precio}
              onVolver={handleVolver}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
