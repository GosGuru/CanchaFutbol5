"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { 
  CreditCard, 
  Building2, 
  Banknote,
  Check,
  Loader2,
  Lock,
  ShieldCheck,
  AlertCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type MetodoPago = "mercadopago" | "transferencia" | "efectivo"

interface PasarelaPagoProps {
  monto: number
  onPagoCompletado: (resultado: ResultadoPago) => void
  onCancelar: () => void
  loading?: boolean
}

export interface ResultadoPago {
  exitoso: boolean
  metodoPago: MetodoPago
  referencia?: string
  mensaje: string
}

const metodosPago = [
  {
    id: "mercadopago" as MetodoPago,
    nombre: "MercadoPago",
    descripcion: "Tarjeta crédito, débito o saldo MP",
    icon: CreditCard,
    color: "from-[#009EE3] to-[#00C3F2]",
    popular: true,
  },
  {
    id: "transferencia" as MetodoPago,
    nombre: "Transferencia bancaria",
    descripcion: "BROU, Itaú, Santander, Scotiabank",
    icon: Building2,
    color: "from-emerald-500 to-emerald-600",
    popular: false,
  },
  {
    id: "efectivo" as MetodoPago,
    nombre: "Pagar en la cancha",
    descripcion: "Efectivo al llegar – sin adelanto",
    icon: Banknote,
    color: "from-amber-500 to-orange-500",
    popular: false,
  },
]

export function PasarelaPago({ monto, onPagoCompletado, onCancelar }: PasarelaPagoProps) {
  const [metodoSeleccionado, setMetodoSeleccionado] = useState<MetodoPago | null>(null)
  const [paso, setPaso] = useState<"seleccion" | "formulario" | "procesando" | "completado">("seleccion")
  
  // Campos de tarjeta (simulados)
  const [tarjeta, setTarjeta] = useState({
    numero: "",
    nombre: "",
    vencimiento: "",
    cvv: "",
  })

  const formatearTarjeta = (valor: string) => {
    const soloNumeros = valor.replace(/\D/g, "")
    const grupos = soloNumeros.match(/.{1,4}/g)
    return grupos ? grupos.join(" ").slice(0, 19) : ""
  }

  const formatearVencimiento = (valor: string) => {
    const soloNumeros = valor.replace(/\D/g, "")
    if (soloNumeros.length >= 2) {
      return `${soloNumeros.slice(0, 2)}/${soloNumeros.slice(2, 4)}`
    }
    return soloNumeros
  }

  const handleSeleccionMetodo = (metodo: MetodoPago) => {
    setMetodoSeleccionado(metodo)
    if (metodo === "efectivo") {
      // Pago en efectivo no requiere formulario
      handleProcesarPago(metodo)
    } else if (metodo === "transferencia") {
      // Mostrar datos de transferencia
      setPaso("formulario")
    } else {
      setPaso("formulario")
    }
  }

  const handleProcesarPago = async (metodo?: MetodoPago) => {
    const metodoPagar = metodo || metodoSeleccionado
    if (!metodoPagar) return

    setPaso("procesando")

    // Simular procesamiento de pago
    await new Promise(resolve => setTimeout(resolve, 2000))

    const referencia = `INV-${crypto.randomUUID().slice(0, 8).toUpperCase()}`
    
    setPaso("completado")

    // Pequeño delay para mostrar la animación de éxito
    setTimeout(() => {
      onPagoCompletado({
        exitoso: true,
        metodoPago: metodoPagar,
        referencia,
        mensaje: metodoPagar === "efectivo" 
          ? "Reserva confirmada. Recordá pagar al llegar a la cancha."
          : `Pago procesado exitosamente. Referencia: ${referencia}`
      })
    }, 1500)
  }

  const validarTarjeta = () => {
    return (
      tarjeta.numero.replace(/\s/g, "").length === 16 &&
      tarjeta.nombre.length >= 3 &&
      tarjeta.vencimiento.length === 5 &&
      tarjeta.cvv.length >= 3
    )
  }

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {/* Selección de método de pago */}
        {paso === "seleccion" && (
          <motion.div
            key="seleccion"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <div className="text-center mb-6">
              <p className="text-muted-foreground">¿Cómo preferís pagar tu reserva?</p>
            </div>

            <div className="grid gap-3">
              {metodosPago.map((metodo, index) => {
                const Icon = metodo.icon
                return (
                  <motion.button
                    key={metodo.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => handleSeleccionMetodo(metodo.id)}
                    className={cn(
                      "relative flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200",
                      "hover:border-primary/50 hover:bg-muted/50",
                      "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background",
                      metodoSeleccionado === metodo.id 
                        ? "border-primary bg-primary/5" 
                        : "border-border"
                    )}
                  >
                    {/* Icono con gradiente */}
                    <div className={cn(
                      "flex items-center justify-center w-12 h-12 rounded-lg bg-linear-to-br",
                      metodo.color
                    )}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>

                    {/* Contenido */}
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{metodo.nombre}</span>
                        {metodo.popular && (
                          <span className="px-2 py-0.5 text-[10px] font-medium bg-primary/20 text-primary rounded-full">
                            Popular
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{metodo.descripcion}</p>
                    </div>

                    {/* Radio button visual */}
                    <div className={cn(
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                      metodoSeleccionado === metodo.id 
                        ? "border-primary bg-primary" 
                        : "border-muted-foreground/30"
                    )}>
                      {metodoSeleccionado === metodo.id && (
                        <Check className="h-3 w-3 text-primary-foreground" />
                      )}
                    </div>
                  </motion.button>
                )
              })}
            </div>

            {/* Seguridad */}
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mt-4">
              <Lock className="h-4 w-4" />
              <span>🔒 Tu pago está 100% protegido</span>
            </div>
          </motion.div>
        )}

        {/* Formulario de pago */}
        {paso === "formulario" && metodoSeleccionado === "mercadopago" && (
          <motion.div
            key="formulario-mp"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {/* Card Preview */}
            <div className="relative h-48 rounded-2xl bg-linear-to-br from-zinc-800 to-zinc-900 p-6 text-white shadow-xl overflow-hidden">
              {/* Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-4 right-4 w-32 h-32 rounded-full border-2 border-white" />
                <div className="absolute top-8 right-8 w-24 h-24 rounded-full border-2 border-white" />
              </div>
              
              {/* Chip */}
              <div className="w-12 h-9 rounded-md bg-linear-to-br from-amber-300 to-amber-500 mb-6" />
              
              {/* Número */}
              <p className="font-mono text-xl tracking-wider mb-4">
                {tarjeta.numero || "•••• •••• •••• ••••"}
              </p>
              
              {/* Info */}
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[10px] uppercase text-zinc-400 mb-1">Titular</p>
                  <p className="font-medium uppercase tracking-wide">
                    {tarjeta.nombre || "TU NOMBRE"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase text-zinc-400 mb-1">Vence</p>
                  <p className="font-mono">{tarjeta.vencimiento || "MM/AA"}</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="numero">Número de tarjeta</Label>
                <Input
                  id="numero"
                  placeholder="4000 0000 0000 0000"
                  value={tarjeta.numero}
                  onChange={(e) => setTarjeta(prev => ({ 
                    ...prev, 
                    numero: formatearTarjeta(e.target.value) 
                  }))}
                  className="font-mono text-lg"
                  maxLength={19}
                />
                <p className="text-xs text-muted-foreground mt-1">Usá 4000... para simular un pago exitoso</p>
              </div>

              <div>
                <Label htmlFor="nombre">Nombre del titular</Label>
                <Input
                  id="nombre"
                  placeholder="JUAN PÉREZ RODRÍGUEZ"
                  value={tarjeta.nombre}
                  onChange={(e) => setTarjeta(prev => ({ 
                    ...prev, 
                    nombre: e.target.value.toUpperCase() 
                  }))}
                  className="uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="vencimiento">Vencimiento</Label>
                  <Input
                    id="vencimiento"
                    placeholder="MM/AA"
                    value={tarjeta.vencimiento}
                    onChange={(e) => setTarjeta(prev => ({ 
                      ...prev, 
                      vencimiento: formatearVencimiento(e.target.value) 
                    }))}
                    className="font-mono"
                    maxLength={5}
                  />
                </div>
                <div>
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    type="password"
                    placeholder="•••"
                    value={tarjeta.cvv}
                    onChange={(e) => setTarjeta(prev => ({ 
                      ...prev, 
                      cvv: e.target.value.replace(/\D/g, "").slice(0, 4) 
                    }))}
                    className="font-mono"
                    maxLength={4}
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setPaso("seleccion")}
                className="flex-1"
              >
                Cambiar método
              </Button>
              <Button 
                onClick={() => handleProcesarPago()}
                disabled={!validarTarjeta()}
                className="flex-1 bg-[#009EE3] hover:bg-[#0087C7]"
              >
                Pagar ${monto.toLocaleString("es-UY")}
              </Button>
            </div>

            {/* Seguridad */}
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span>Procesado de forma segura por MercadoPago</span>
            </div>
          </motion.div>
        )}

        {/* Datos de transferencia */}
        {paso === "formulario" && metodoSeleccionado === "transferencia" && (
          <motion.div
            key="formulario-transfer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <Card className="bg-emerald-500/10 border-emerald-500/20">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-emerald-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-emerald-500">Datos para transferencia</p>
                    <p className="text-sm text-muted-foreground">
                      Realizá la transferencia y enviá el comprobante por WhatsApp
                    </p>
                  </div>
                </div>

                <div className="space-y-3 bg-background/50 rounded-lg p-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Banco:</span>
                    <span className="font-medium">BROU</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cuenta:</span>
                    <span className="font-mono font-medium">001234567-00001</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Titular:</span>
                    <span className="font-medium">Cancha de Fútbol 5</span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-3 mt-3">
                    <span className="text-muted-foreground">Monto:</span>
                    <span className="font-bold text-lg text-primary">${monto.toLocaleString("es-UY")}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setPaso("seleccion")}
                className="flex-1"
              >
                Cambiar método
              </Button>
              <Button 
                onClick={() => handleProcesarPago()}
                className="flex-1"
              >
                Ya hice la transferencia
              </Button>
            </div>
          </motion.div>
        )}

        {/* Procesando */}
        {paso === "procesando" && (
          <motion.div
            key="procesando"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="text-center py-12"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-16 h-16 mx-auto mb-6"
            >
              <Loader2 className="w-16 h-16 text-primary" />
            </motion.div>
            <h3 className="text-xl font-semibold mb-2">⏳ Procesando tu pago...</h3>
            <p className="text-muted-foreground">Un momento, no cierres esta ventana</p>
          </motion.div>
        )}

        {/* Completado */}
        {paso === "completado" && (
          <motion.div
            key="completado"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2, stiffness: 200 }}
              className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/20 flex items-center justify-center"
            >
              <Check className="h-10 w-10 text-primary" />
            </motion.div>
            <h3 className="text-xl font-semibold mb-2">¡Pago completado con éxito!</h3>
            <p className="text-muted-foreground">Te estamos redirigiendo...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botón cancelar (solo en selección) */}
      {paso === "seleccion" && (
        <Button 
          variant="ghost" 
          onClick={onCancelar}
          className="w-full"
        >
          Cancelar
        </Button>
      )}
    </div>
  )
}
