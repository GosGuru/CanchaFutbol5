"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  CalendarDays,
  Settings,
  LogOut,
  Menu,
  X,
  Home,
  ExternalLink,
  Goal,
  Grid3X3
} from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { clearSession } from "@/lib/storage"

type SidebarProps = React.HTMLAttributes<HTMLDivElement>

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const routes = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      active: pathname === "/dashboard",
    },
    {
      href: "/reservas",
      label: "Reservas",
      icon: CalendarDays,
      active: pathname.startsWith("/reservas"),
    },
    {
      href: "/canchas",
      label: "Canchas",
      icon: Goal,
      active: pathname.startsWith("/canchas"),
    },
    {
      href: "/disponibilidad",
      label: "Disponibilidad",
      icon: Grid3X3,
      active: pathname.startsWith("/disponibilidad"),
    },
    {
      href: "/configuracion",
      label: "Configuración",
      icon: Settings,
      active: pathname === "/configuracion",
    },
  ]

  const handleLogout = () => {
    clearSession()
    router.push("/login")
  }

  return (
    <>
      {/* Mobile Trigger */}
      <Button
        variant="ghost"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X /> : <Menu />}
      </Button>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r bg-card transition-transform duration-300 ease-in-out md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
          className
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">IF</span>
            </div>
            <span className="text-lg font-bold tracking-tight">
              Cancha de <span className="text-primary">Fútbol 5</span>
            </span>
          </Link>
        </div>
        
        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4">
          <div className="px-3 mb-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2 mb-2">
              Panel Admin
            </p>
          </div>
          <nav className="grid gap-1 px-2">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                onClick={() => setIsOpen(false)}
              >
                <Button
                  variant={route.active ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3",
                    route.active && "bg-primary/10 text-primary hover:bg-primary/20"
                  )}
                >
                  <route.icon className="h-4 w-4" />
                  {route.label}
                </Button>
              </Link>
            ))}
          </nav>

          {/* Separator */}
          <div className="my-4 mx-4 border-t" />

          {/* External Links */}
          <div className="px-3 mb-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2 mb-2">
              Enlaces
            </p>
          </div>
          <nav className="grid gap-1 px-2">
            <Link href="/" target="_blank" onClick={() => setIsOpen(false)}>
              <Button variant="ghost" className="w-full justify-start gap-3">
                <Home className="h-4 w-4" />
                Ver Landing
                <ExternalLink className="h-3 w-3 ml-auto opacity-50" />
              </Button>
            </Link>
            <Link href="/reservar" target="_blank" onClick={() => setIsOpen(false)}>
              <Button variant="ghost" className="w-full justify-start gap-3">
                <CalendarDays className="h-4 w-4" />
                Reservar (Público)
                <ExternalLink className="h-3 w-3 ml-auto opacity-50" />
              </Button>
            </Link>
          </nav>
        </div>

        {/* Footer */}
        <div className="border-t p-4 space-y-2">
          <div className="px-2 py-1">
            <p className="text-xs text-muted-foreground">Sesión activa</p>
            <p className="text-sm font-medium">Administrador</p>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar Sesión
          </Button>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
