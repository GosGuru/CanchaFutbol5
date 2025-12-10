"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { motion } from "motion/react"
import Link from "next/link"
import Image from "next/image"
import { Calendar, MapPin, Clock } from "lucide-react"
import { getInfoComplejo } from "@/lib/data-service"
import { formatCurrency } from "@/lib/utils"

interface InfoComplejo {
  nombre: string
  direccion: string
  horarioApertura: string
  horarioCierre: string
  precioBase: number
}

export function HeroSection() {
  const [info, setInfo] = useState<InfoComplejo>({
    nombre: "Cancha de Fútbol 5",
    direccion: "Durazno, Uruguay",
    horarioApertura: "08:00",
    horarioCierre: "23:00",
    precioBase: 1500
  })

  useEffect(() => {
    // Cargar datos reales
    const data = getInfoComplejo()
    setInfo({
      nombre: data.nombre,
      direccion: data.direccion,
      horarioApertura: data.horarioApertura,
      horarioCierre: data.horarioCierre,
      precioBase: data.precioBase
    })
  }, [])

  return (
    <section 
      id="inicio"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      aria-label="Sección principal"
    >
      {/* Background Image - Optimized with next/image */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1575361204480-aadea25e6e68?q=80&w=2071&auto=format&fit=crop"
          alt="Cancha de fútbol 5 iluminada"
          fill
          priority
          className="object-cover"
          sizes="100vw"
          quality={85}
        />
      </div>
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-linear-to-b from-black/70 via-black/60 to-background" />
      
      {/* Animated gradient accent */}
      <div className="absolute inset-0 bg-linear-to-r from-primary/20 via-transparent to-accent/10 animate-pulse" />
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl mx-auto"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-primary/20 border border-primary/30 rounded-full px-4 py-2 mb-6"
            role="status"
            aria-live="polite"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="text-sm font-medium text-primary">Reservas abiertas</span>
          </motion.div>

          {/* Heading */}
          <motion.h1 
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            Reservá tu cancha en{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-emerald-400">
              {info.nombre}
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            Canchas de césped sintético de primera calidad. 
            Reservá online en segundos y disfrutá del mejor fútbol con tus amigos.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          >
            <Button 
              asChild 
              size="lg" 
              className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <Link href="/reservar">
                <Calendar className="mr-2 h-5 w-5" aria-hidden="true" />
                Reservar ahora
              </Link>
            </Button>
            <Button 
              asChild 
              variant="outline" 
              size="lg"
              className="text-lg px-8 py-6 border-white/20 hover:bg-white/10 transition-all duration-300 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <Link href="#horarios">
                <Clock className="mr-2 h-5 w-5" aria-hidden="true" />
                Ver horarios
              </Link>
            </Button>
          </motion.div>

          {/* Quick Info Cards */}
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
          >
            <div className="flex items-center justify-center gap-2 bg-white/5 backdrop-blur-sm rounded-lg px-4 py-3 border border-white/10">
              <MapPin className="h-4 w-4 text-primary" aria-hidden="true" />
              <span className="text-sm">{info.direccion}</span>
            </div>
            <div className="flex items-center justify-center gap-2 bg-white/5 backdrop-blur-sm rounded-lg px-4 py-3 border border-white/10">
              <Clock className="h-4 w-4 text-primary" aria-hidden="true" />
              <span className="text-sm">{info.horarioApertura} - {info.horarioCierre}</span>
            </div>
            <div className="flex items-center justify-center gap-2 bg-white/5 backdrop-blur-sm rounded-lg px-4 py-3 border border-white/10">
              <span className="text-sm font-semibold text-primary">{formatCurrency(info.precioBase)}</span>
              <span className="text-sm">/hora</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          aria-hidden="true"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center"
          >
            <motion.div 
              className="w-1.5 h-1.5 bg-white rounded-full mt-2"
              animate={{ y: [0, 16, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
