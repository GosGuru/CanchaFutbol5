"use client"

import { motion } from "motion/react"
import { useState } from "react"
import Image from "next/image"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { ChevronLeft, ChevronRight, X } from "lucide-react"

const imagenes = [
  {
    src: "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?q=80&w=2071&auto=format&fit=crop",
    alt: "Cancha de fútbol 5 iluminada",
  },
  {
    src: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1993&auto=format&fit=crop",
    alt: "Jugadores en cancha sintética",
  },
  {
    src: "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?q=80&w=2070&auto=format&fit=crop",
    alt: "Partido de fútbol sala",
  },
  {
    src: "https://images.unsplash.com/photo-1551958219-acbc608c6377?q=80&w=2070&auto=format&fit=crop",
    alt: "Cancha de césped sintético",
  },
  {
    src: "https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?q=80&w=2081&auto=format&fit=crop",
    alt: "Fútbol nocturno",
  },
  {
    src: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?q=80&w=2070&auto=format&fit=crop",
    alt: "Ambiente deportivo",
  },
]

export function Galeria() {
  const [selectedImage, setSelectedImage] = useState<number | null>(null)

  const handlePrev = () => {
    if (selectedImage !== null) {
      setSelectedImage(selectedImage === 0 ? imagenes.length - 1 : selectedImage - 1)
    }
  }

  const handleNext = () => {
    if (selectedImage !== null) {
      setSelectedImage(selectedImage === imagenes.length - 1 ? 0 : selectedImage + 1)
    }
  }

  return (
    <section id="galeria" className="py-20 bg-card/30">
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
            Nuestras{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-emerald-400">
              Instalaciones
            </span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Conocé nuestras canchas de césped sintético de última generación. 
            El mejor lugar para jugar al fútbol con tus amigos.
          </p>
        </motion.div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
          {imagenes.map((imagen, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative overflow-hidden rounded-xl cursor-pointer group ${
                index === 0 ? "sm:col-span-2 sm:row-span-2" : ""
              }`}
              onClick={() => setSelectedImage(index)}
            >
              <div className={`relative ${index === 0 ? "aspect-square sm:aspect-auto sm:h-full min-h-[300px]" : "aspect-video"}`}>
                <Image
                  src={imagen.src}
                  alt={imagen.alt}
                  fill
                  sizes={index === 0 ? "(max-width: 640px) 100vw, 66vw" : "(max-width: 640px) 100vw, 33vw"}
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  priority={index < 3}
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Hover content */}
                <div className="absolute inset-0 flex items-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-white text-sm font-medium">{imagen.alt}</span>
                </div>

                {/* Border glow effect */}
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary/50 rounded-xl transition-colors duration-300" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Lightbox Dialog */}
        <Dialog open={selectedImage !== null} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="max-w-5xl p-0 bg-black/95 border-none">
            <div className="relative">
              {/* Close button */}
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                aria-label="Cerrar galería"
              >
                <X className="h-6 w-6 text-white" />
              </button>

              {/* Navigation buttons */}
              <button
                onClick={handlePrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                aria-label="Imagen anterior"
              >
                <ChevronLeft className="h-6 w-6 text-white" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                aria-label="Imagen siguiente"
              >
                <ChevronRight className="h-6 w-6 text-white" />
              </button>

              {/* Image */}
              {selectedImage !== null && (
                <motion.div
                  key={selectedImage}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="relative w-full h-[80vh]"
                >
                  <Image
                    src={imagenes[selectedImage].src}
                    alt={imagenes[selectedImage].alt}
                    fill
                    className="object-contain"
                    sizes="100vw"
                    priority
                  />
                </motion.div>
              )}

              {/* Image counter */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-white/10 text-white text-sm">
                {selectedImage !== null ? selectedImage + 1 : 0} / {imagenes.length}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  )
}
