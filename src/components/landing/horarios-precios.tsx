"use client"

import { useMemo } from "react"
import { motion } from "motion/react"
import { Card, CardContent } from "@/components/ui/card"
import { Clock, DollarSign, Calendar, Sun, Moon, CalendarDays, Goal } from "lucide-react"
import { getInfoComplejo, getCanchasPublicas } from "@/lib/data-service"
import { formatCurrency } from "@/lib/utils"

interface PrecioItem {
  tipo: string
  precio: number
  descripcion: string
  icon: typeof Sun
  popular?: boolean
}

export function HorariosPrecios() {
  const { horarioApertura, horarioCierre, precios, cantidadCanchas } = useMemo(() => {
    const info = getInfoComplejo()
    const canchas = getCanchasPublicas()

    // Construir lista de precios dinámicamente
    const preciosLista: PrecioItem[] = []
    
    // Solo mostrar precios diferenciados si son distintos
    const precioNormal = info.precios.normal
    const precioNocturno = info.precios.nocturno
    const precioFinDeSemana = info.precios.finDeSemana
    
    // Si todos los precios son iguales, mostrar solo uno
    if (precioNormal === precioNocturno && precioNormal === precioFinDeSemana) {
      preciosLista.push({
        tipo: "Precio Único",
        precio: precioNormal,
        descripcion: `${info.horarioApertura} a ${info.horarioCierre}`,
        icon: Sun,
        popular: true
      })
    } else {
      // Precios diferenciados
      preciosLista.push({
        tipo: "Turno Normal",
        precio: precioNormal,
        descripcion: `${info.horarioApertura} a 20:00`,
        icon: Sun,
        popular: true
      })
      
      if (precioNocturno !== precioNormal) {
        preciosLista.push({
          tipo: "Turno Nocturno",
          precio: precioNocturno,
          descripcion: "20:00 a " + info.horarioCierre,
          icon: Moon
        })
      }
      
      if (precioFinDeSemana !== precioNormal) {
        preciosLista.push({
          tipo: "Fin de Semana",
          precio: precioFinDeSemana,
          descripcion: "Sábados y domingos",
          icon: CalendarDays
        })
      }
    }

    return {
      horarioApertura: info.horarioApertura,
      horarioCierre: info.horarioCierre,
      precios: preciosLista,
      cantidadCanchas: canchas.length,
    }
  }, [])

  const horarios = [
    { dia: "Lunes a Viernes", horario: `${horarioApertura} - ${horarioCierre}` },
    { dia: "Sábados", horario: `${horarioApertura} - ${horarioCierre}` },
    { dia: "Domingos", horario: `${horarioApertura} - 22:00` },
  ]

  return (
    <section id="horarios" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Horarios y{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-emerald-400">
              Precios
            </span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Reserva tu cancha al mejor precio. Canchas de césped sintético de primera calidad
            disponibles todos los días de la semana.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Horarios Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card className="h-full bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-colors duration-300">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">Horarios de Atención</h3>
                </div>
                
                <div className="space-y-4">
                  {horarios.map((item, index) => (
                    <motion.div
                      key={item.dia}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                      className="flex justify-between items-center py-3 border-b border-border/50 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <CalendarDays className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{item.dia}</span>
                      </div>
                      <span className="text-primary font-semibold">{item.horario}</span>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/10">
                  <p className="text-sm text-muted-foreground">
                    <span className="text-primary font-medium">💡 Tip:</span> Los horarios más populares 
                    son de 18:00 a 21:00. ¡Reserva con antelación!
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Precios Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="h-full bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-colors duration-300">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <DollarSign className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">Precios por Hora</h3>
                </div>

                <div className="space-y-4">
                  {precios.map((item, index) => (
                    <motion.div
                      key={item.tipo}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                      className={`relative p-4 rounded-xl border ${
                        item.popular 
                          ? "border-primary/50 bg-primary/5" 
                          : "border-border/50 bg-card/30"
                      }`}
                    >
                      {item.popular && (
                        <span className="absolute -top-2.5 right-4 px-2 py-0.5 bg-primary text-primary-foreground text-xs font-semibold rounded-full">
                          Único precio
                        </span>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${item.popular ? "bg-primary/20" : "bg-muted"}`}>
                            <item.icon className={`h-5 w-5 ${item.popular ? "text-primary" : "text-muted-foreground"}`} />
                          </div>
                          <div>
                            <h4 className="font-medium">{item.tipo}</h4>
                            <p className="text-sm text-muted-foreground">{item.descripcion}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-bold text-primary">{formatCurrency(item.precio)}</span>
                          <span className="text-muted-foreground text-sm">/hora</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-6 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Duración del turno: 1 hora</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Goal className="h-4 w-4" />
                    <span>{cantidadCanchas} {cantidadCanchas === 1 ? 'cancha disponible' : 'canchas disponibles'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
