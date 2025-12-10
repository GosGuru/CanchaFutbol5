"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { 
  CalendarDays, 
  Clock, 
  DollarSign, 
  TrendingUp,
  ArrowRight,
  Users,
  Calendar,
  AlertCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StatsCard } from "@/components/dashboard/stats-card"
import { formatCurrency, cn } from "@/lib/utils"
import { getReservas } from "@/lib/storage"
import { Estadisticas, Reserva, EstadoReserva } from "@/types"

const estadoBadgeStyles: Record<EstadoReserva, string> = {
  pendiente: "bg-warning/20 text-warning border-warning/30",
  confirmada: "bg-info/20 text-info border-info/30",
  pagada: "bg-success/20 text-success border-success/30",
  cancelada: "bg-destructive/20 text-destructive border-destructive/30",
}

export default function DashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState<Estadisticas | null>(null)
  const [reservasHoy, setReservasHoy] = useState<Reserva[]>([])
  const [reservasProximas, setReservasProximas] = useState<Reserva[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch stats
        const responseStats = await fetch("/api/estadisticas?periodo=mes")
        const resultStats = await responseStats.json()
        if (resultStats.success) {
          setStats(resultStats.data)
        }

        // Get reservas from storage for quick access
        const todasReservas = getReservas()
        const hoy = new Date().toISOString().split("T")[0]
        
        // Reservas de hoy
        const deHoy = todasReservas
          .filter(r => r.fecha === hoy && r.estado !== "cancelada")
          .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio))
        setReservasHoy(deHoy)

        // Próximas reservas (futuras, excluyendo hoy)
        const proximas = todasReservas
          .filter(r => r.fecha > hoy && r.estado !== "cancelada")
          .sort((a, b) => {
            const dateCompare = a.fecha.localeCompare(b.fecha)
            if (dateCompare !== 0) return dateCompare
            return a.horaInicio.localeCompare(b.horaInicio)
          })
          .slice(0, 5)
        setReservasProximas(proximas)
        
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <AlertCircle className="h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">Error al cargar estadísticas</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Resumen de {format(new Date(), "MMMM yyyy", { locale: es })}
          </p>
        </div>
        <Button onClick={() => router.push("/reservas")} className="gap-2">
          <CalendarDays className="h-4 w-4" />
          Ver Reservas
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Ingresos del Mes"
          value={formatCurrency(stats.ingresosEstimados)}
          icon={DollarSign}
          description="Estimado basado en reservas"
          className="border-l-4 border-l-success"
        />
        <StatsCard
          title="Reservas Totales"
          value={stats.totalReservas}
          icon={CalendarDays}
          description="En este mes"
          className="border-l-4 border-l-primary"
        />
        <StatsCard
          title="Tasa de Ocupación"
          value={`${Math.round((stats.tasaOcupacionCancha1 + stats.tasaOcupacionCancha2) / 2)}%`}
          icon={TrendingUp}
          description="Promedio ambas canchas"
          className="border-l-4 border-l-info"
        />
        <StatsCard
          title="Pendientes"
          value={stats.reservasPendientes}
          icon={Clock}
          description="Reservas por confirmar"
          className="border-l-4 border-l-warning"
        />
      </div>

      {/* Main Content */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Reservas de Hoy */}
        <Card className="lg:col-span-4">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Reservas de Hoy
              </CardTitle>
              <CardDescription>
                {format(new Date(), "EEEE d 'de' MMMM", { locale: es })}
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-lg px-3">
              {reservasHoy.length}
            </Badge>
          </CardHeader>
          <CardContent>
            {reservasHoy.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarDays className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No hay reservas para hoy</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reservasHoy.map((reserva) => (
                  <div
                    key={reserva.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                    onClick={() => router.push("/reservas")}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold",
                        reserva.canchaId === 1 ? "bg-primary/20 text-primary" : "bg-accent/20 text-accent"
                      )}>
                        C{reserva.canchaId}
                      </div>
                      <div>
                        <p className="font-medium">{reserva.cliente.nombre}</p>
                        <p className="text-sm text-muted-foreground">
                          {reserva.horaInicio} - {reserva.horaFin}
                        </p>
                      </div>
                    </div>
                    <Badge className={cn("border", estadoBadgeStyles[reserva.estado])}>
                      {reserva.estado}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Panel Derecho */}
        <div className="lg:col-span-3 space-y-6">
          {/* Ocupación por Cancha */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Ocupación por Cancha</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary" />
                    Cancha 1
                  </span>
                  <span className="font-medium">{stats.tasaOcupacionCancha1}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-500" 
                    style={{ width: `${stats.tasaOcupacionCancha1}%` }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-accent" />
                    Cancha 2
                  </span>
                  <span className="font-medium">{stats.tasaOcupacionCancha2}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div 
                    className="h-full bg-accent transition-all duration-500" 
                    style={{ width: `${stats.tasaOcupacionCancha2}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Horarios Populares */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Horarios Populares</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.horariosPopulares.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No hay datos suficientes
                </p>
              ) : (
                <div className="space-y-3">
                  {stats.horariosPopulares.slice(0, 5).map((item, index) => (
                    <div key={item.hora} className="flex items-center gap-3">
                      <span className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                        index === 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      )}>
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="font-medium">{item.hora}</span>
                          <span className="text-muted-foreground">{item.cantidad} reservas</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                          <div 
                            className="h-full bg-primary/60" 
                            style={{ width: `${Math.min((item.cantidad / stats.totalReservas) * 100 * 3, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Próximas Reservas */}
      {reservasProximas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Próximas Reservas
            </CardTitle>
            <CardDescription>
              Las siguientes {reservasProximas.length} reservas programadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {reservasProximas.map((reserva) => (
                <div
                  key={reserva.id}
                  className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => router.push("/reservas")}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className={reserva.canchaId === 1 ? "border-primary text-primary" : "border-accent text-accent"}>
                      Cancha {reserva.canchaId}
                    </Badge>
                  </div>
                  <p className="font-medium truncate">{reserva.cliente.nombre}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(reserva.fecha), "EEE d MMM", { locale: es })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {reserva.horaInicio} - {reserva.horaFin}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
