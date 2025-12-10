"use client"

import Link from "next/link"
import { Instagram, Phone, MapPin, Circle } from "lucide-react"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-card/50 border-t border-border/50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo & Description */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <Circle className="h-6 w-6 text-primary fill-primary" />
              <span className="text-xl font-bold">Cancha de Fútbol 5</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Las mejores canchas de fútbol 5 en Uruguay. Césped sintético de primera calidad 
              para que disfrutes del mejor fútbol con tus amigos.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold">Enlaces</h4>
            <nav className="flex flex-col space-y-2">
              <Link 
                href="#inicio" 
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Inicio
              </Link>
              <Link 
                href="#horarios" 
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Horarios y Precios
              </Link>
              <Link 
                href="#galeria" 
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Galería
              </Link>
              <Link 
                href="#ubicacion" 
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Ubicación
              </Link>
              <Link 
                href="/reservar" 
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Reservar
              </Link>
            </nav>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="font-semibold">Contacto</h4>
            <div className="space-y-3">
              <a 
                href="https://instagram.com/canchafutbol5"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <Instagram className="h-4 w-4" />
                @canchafutbol5
              </a>
              <a 
                href="tel:+59899999999"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <Phone className="h-4 w-4" />
                +598 99 999 999
              </a>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                Uruguay
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border/50">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {currentYear} Cancha de Fútbol 5. Todos los derechos reservados.
            </p>
            <div className="flex items-center gap-4">
              <a 
                href="https://instagram.com/canchafutbol5"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-muted hover:bg-primary/20 hover:text-primary transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
