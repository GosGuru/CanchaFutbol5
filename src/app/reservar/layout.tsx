"use client"

import Link from "next/link"
import { ArrowLeft, Phone, Circle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ReservarLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-linear-to-b from-background to-muted/20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Volver</span>
              </Link>
            </Button>
            
            <Link href="/" className="flex items-center gap-2 font-bold">
              <Circle className="h-6 w-6 text-primary fill-primary" />
              <span className="hidden sm:inline text-lg">Cancha de Fútbol 5</span>
            </Link>
            
            {/* WhatsApp de ayuda */}
            <Button variant="ghost" size="sm" asChild className="text-[#25D366]">
              <a 
                href="https://wa.me/598999999999?text=Hola,%20necesito%20ayuda%20con%20una%20reserva"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <Phone className="h-4 w-4" />
                <span className="hidden sm:inline">Ayuda</span>
              </a>
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer minimalista */}
      <footer className="py-6 border-t border-border/50">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Cancha de Fútbol 5 · Uruguay</p>
          <p className="mt-1 text-xs">Pago 100% seguro 🔒</p>
        </div>
      </footer>
    </div>
  )
}
