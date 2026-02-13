"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "motion/react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  MapPin, 
  DollarSign,
  MessageCircle,
  ChevronLeft,
  CreditCard,
  Mail,
  Sparkles,
  PartyPopper,
  Shield
} from "lucide-react"
import { PasarelaPago, type ResultadoPago } from "./pasarela-pago"
import { getInfoComplejo } from "@/lib/data-service"
import { getCanchaPublica } from "@/lib/data-service"
import { toast } from "sonner"
import type { Cliente } from "@/types"
import { cn, formatCurrency } from "@/lib/utils"

interface ResumenReservaProps {
  fecha: Date
  horaInicio: string
  horaFin: string
  canchaId: 1 | 2
  cliente: Cliente
  precio: number
  onVolver: () => void
}

// Datos pre-calculados para el confetti (evita Math.random durante render)
const CONFETTI_DATA = Array.from({ length: 20 }, (_, i) => ({
  left: (i * 5) + (i % 3) * 2, // Distribuido uniformemente
  direction: i % 2 === 0 ? 1 : -1,
  duration: 2.5 + (i % 5) * 0.4,
  delay: i * 0.025,
}))

export function ResumenReserva({
  fecha,
  horaInicio,
  horaFin,
  canchaId,
  cliente,
  precio,
  onVolver,
}: ResumenReservaProps) {
  const router = useRouter()
  const [mostrarPago, setMostrarPago] = useState(false)
  const [confirmado, setConfirmado] = useState(false)
  const [resultadoPago, setResultadoPago] = useState<ResultadoPago | null>(null)
  
  // Usar datos pre-calculados
  const confettiItems = CONFETTI_DATA

  const handlePagoCompletado = async (resultado: ResultadoPago) => {
    setResultadoPago(resultado)
    
    try {
      // Usar API pública para crear reserva (se sincroniza con panel admin)
      const response = await fetch('/api/public/reservar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          canchaId,
          fecha: format(fecha, "yyyy-MM-dd"),
          horaInicio,
          horaFin,
          cliente,
          precio,
          notas: resultado.metodoPago !== "efectivo" 
            ? `Pago ${resultado.metodoPago} - Ref: ${resultado.referencia}`
            : resultado.metodoPago === "efectivo" 
              ? "Pago en efectivo al llegar"
              : undefined,
        })
      })
      
      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Error al crear reserva')
      }
      
      setConfirmado(true)
      toast.success("¡Reserva creada exitosamente!")
    } catch (error) {
      console.error("Error al crear reserva:", error)
      toast.error("Error al crear la reserva. Inténtalo de nuevo.")
    }
  }

  const handleWhatsApp = () => {
    const info = getInfoComplejo()
    const cancha = getCanchaPublica(canchaId)
    const fechaFormateada = format(fecha, "EEEE d 'de' MMMM", { locale: es })
    const mensaje = encodeURIComponent(
      `¡Hola! Acabo de hacer una reserva en ${info.nombre}\n\n` +
      `Fecha: ${fechaFormateada}\n` +
      `Horario: ${horaInicio} - ${horaFin}\n` +
      `Cancha: ${cancha?.nombre || `Cancha ${canchaId}`}\n` +
      `Nombre: ${cliente.nombre}\n` +
      `Teléfono: ${cliente.telefono}\n` +
      (resultadoPago?.referencia ? `Referencia: ${resultadoPago.referencia}\n` : "") +
      `\nPor favor confirmar mi reserva. ¡Gracias!`
    )
    
    window.open(`https://wa.me/${info.whatsapp}?text=${mensaje}`, "_blank")
  }

  // Vista de confirmación exitosa
  if (confirmado && resultadoPago) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-lg mx-auto"
      >
        <Card className="overflow-hidden">
          {/* Header festivo */}
          <div className="relative bg-linear-to-br from-primary/20 via-primary/10 to-transparent p-8 text-center">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", delay: 0.2, stiffness: 200 }}
              className="w-24 h-24 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center"
            >
              <PartyPopper className="h-12 w-12 text-primary" />
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold mb-2"
            >
              ¡Reserva confirmada!
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-muted-foreground"
            >
              {resultadoPago.metodoPago === "efectivo" 
                ? "Recordá pagar al llegar a la cancha"
                : "Tu pago fue procesado exitosamente"
              }
            </motion.p>

            {/* Confetti animation - valores pre-generados */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {confettiItems.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ 
                    top: "-10%", 
                    left: `${item.left}%`,
                    scale: 0,
                    rotate: 0
                  }}
                  animate={{ 
                    top: "110%", 
                    scale: [0, 1, 1],
                    rotate: 360 * item.direction
                  }}
                  transition={{ 
                    duration: item.duration,
                    delay: item.delay,
                    ease: "easeOut"
                  }}
                  className={cn(
                    "absolute w-3 h-3 rounded-full",
                    i % 3 === 0 ? "bg-primary" : i % 3 === 1 ? "bg-orange-500" : "bg-emerald-500"
                  )}
                />
              ))}
            </div>
          </div>

          <CardContent className="p-6 space-y-6">
            {/* Resumen de la reserva */}
            <div className="bg-muted/50 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Fecha</p>
                  <p className="font-medium capitalize">
                    {format(fecha, "EEEE d 'de' MMMM", { locale: es })}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Horario</p>
                  <p className="font-medium">{horaInicio} - {horaFin} | Cancha {canchaId}</p>
                </div>
              </div>

              {resultadoPago.referencia && (
                <div className="flex items-center gap-3 pt-2 border-t border-border">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Referencia de pago</p>
                    <p className="font-mono font-medium">{resultadoPago.referencia}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Acciones */}
            <div className="space-y-3">
              <Button 
                onClick={handleWhatsApp}
                className="w-full bg-[#25D366] hover:bg-[#20BD5A]"
                size="lg"
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                Enviar confirmación por WhatsApp
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => router.push("/")}
                className="w-full"
              >
                Volver al inicio
              </Button>
            </div>

            {/* Tip */}
            <p className="text-xs text-center text-muted-foreground">
              💡 Te recomendamos llegar 10 minutos antes de tu turno
            </p>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  // Vista de pasarela de pago
  if (mostrarPago) {
    return (
      <Card className="max-w-lg mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Método de pago
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Total a pagar: <span className="font-bold text-primary">{formatCurrency(precio)}</span>
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setMostrarPago(false)}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Volver
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <PasarelaPago
            monto={precio}
            onPagoCompletado={handlePagoCompletado}
            onCancelar={() => setMostrarPago(false)}
          />
        </CardContent>
      </Card>
    )
  }

  // Vista de resumen
  return (
    <Card className="max-w-2xl mx-auto overflow-hidden">
      <CardHeader className="bg-linear-to-r from-primary/10 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">✅ Confirmar reserva</CardTitle>
              <p className="text-sm text-muted-foreground">Revisá todo antes de pagar</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onVolver}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Modificar
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        {/* Grid de información */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Detalles de la reserva */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              🏟️ Tu reserva
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted/70 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Fecha</p>
                  <p className="font-medium capitalize truncate">
                    {format(fecha, "EEEE d 'de' MMMM", { locale: es })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted/70 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Horario</p>
                  <p className="font-medium">{horaInicio} - {horaFin}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted/70 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Cancha</p>
                  <p className="font-medium">Cancha {canchaId} {canchaId === 1 ? "(Techada)" : "(Césped)"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Datos del cliente */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Tus datos de contacto
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted/70 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Nombre</p>
                  <p className="font-medium truncate">{cliente.nombre}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted/70 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Teléfono</p>
                  <p className="font-medium">{cliente.telefono}</p>
                </div>
              </div>

              {cliente.email && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted/70 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="font-medium truncate">{cliente.email}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Card de precio */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-linear-to-br from-primary/20 via-primary/10 to-transparent p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total a pagar</p>
              <p className="text-4xl font-bold text-primary">
                {formatCurrency(precio)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">1 hora de cancha</p>
            </div>
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
          </div>
          
          {/* Decoración */}
          <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-primary/10" />
        </motion.div>

        {/* Seguridad */}
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Shield className="h-4 w-4 text-emerald-500" />
          <span>🔒 Reserva segura • Datos protegidos</span>
        </div>

        {/* Botón de pagar */}
        <Button 
          onClick={() => setMostrarPago(true)}
          size="lg"
          className="w-full h-14 text-lg"
        >
          <CreditCard className="mr-2 h-5 w-5" />
          🚀 Continuar al pago
        </Button>
      </CardContent>
    </Card>
  )
}
