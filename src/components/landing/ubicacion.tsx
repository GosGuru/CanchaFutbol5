"use client"

import { useMemo } from "react"
import { motion } from "motion/react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Navigation, Clock, Phone } from "lucide-react"
import Link from "next/link"
import { getInfoComplejo } from "@/lib/data-service"
import { getConfiguracion } from "@/lib/storage"

interface InfoUbicacion {
  nombre: string
  direccion: string
  telefono: string
  horarioApertura: string
  horarioCierre: string
  googleMapsUrl: string
  googleMapsEmbed: string
}

export function Ubicacion() {
  const info = useMemo<InfoUbicacion>(() => {
    const config = getConfiguracion()
    const infoComplejo = getInfoComplejo()

    return {
      nombre: infoComplejo.nombre,
      direccion: infoComplejo.direccion,
      telefono: infoComplejo.telefono,
      horarioApertura: infoComplejo.horarioApertura,
      horarioCierre: infoComplejo.horarioCierre,
      googleMapsUrl: config.infoComplejo.googleMapsUrl || "https://maps.google.com",
      googleMapsEmbed: config.infoComplejo.googleMapsEmbed || "https://www.google.com/maps?q=Madrid,+Espa%C3%B1a&output=embed"
    }
  }, [])

  return (
    <section id="ubicacion" className="py-20 bg-background">
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
            ¿Dónde{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-emerald-400">
              Estamos?
            </span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Encuéntranos fácilmente. Estamos ubicados en una zona accesible con aparcamiento disponible.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Map */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2"
          >
            <div className="relative rounded-xl overflow-hidden border border-border/50 aspect-video lg:aspect-auto lg:h-full min-h-[300px]">
              <iframe
                src={info.googleMapsEmbed}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0"
              />
              {/* Overlay gradient */}
              <div className="absolute inset-0 pointer-events-none border border-primary/20 rounded-xl" />
            </div>
          </motion.div>

          {/* Info Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="h-full bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="p-6 flex flex-col h-full">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">Ubicación</h3>
                </div>

                <div className="space-y-4 grow">
                  {/* Address */}
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                    <MapPin className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">{info.nombre}</p>
                      <p className="text-sm text-muted-foreground">{info.direccion}</p>
                    </div>
                  </div>

                  {/* Hours */}
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                    <Clock className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Horario</p>
                      <p className="text-sm text-muted-foreground">Lunes a Domingo: {info.horarioApertura} - {info.horarioCierre}</p>
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                    <Phone className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Contacto</p>
                      <p className="text-sm text-muted-foreground">{info.telefono}</p>
                    </div>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="space-y-3 mt-6">
                  <Button asChild className="w-full" size="lg">
                    <Link href={info.googleMapsUrl} target="_blank" rel="noopener noreferrer">
                      <Navigation className="mr-2 h-4 w-4" />
                      Cómo llegar
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full" size="lg">
                    <Link href="/reservar">
                      Reservar ahora
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
