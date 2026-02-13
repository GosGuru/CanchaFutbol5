"use client"

import { useEffect, useState } from "react"
import { Plus, CalendarDays, List, Search, Filter } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarioReservas } from "@/components/reservas/calendario-reservas"
import { ModalReserva } from "@/components/reservas/modal-reserva"
import { Reserva, EstadoReserva } from "@/types"
import { toast } from "sonner"
import { cn, formatCurrency } from "@/lib/utils"

type VistaType = "calendario" | "lista"

const estadoBadgeStyles: Record<EstadoReserva, string> = {
  pendiente: "bg-warning/20 text-warning border-warning/30",
  confirmada: "bg-info/20 text-info border-info/30",
  pagada: "bg-success/20 text-success border-success/30",
  cancelada: "bg-destructive/20 text-destructive border-destructive/30",
}

export default function ReservasPage() {
  const [reservas, setReservas] = useState<Reserva[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [vista, setVista] = useState<VistaType>("calendario")
  const [busqueda, setBusqueda] = useState("")
  const [filtroEstado, setFiltroEstado] = useState<EstadoReserva | "todos">("todos")
  const [filtroCancha, setFiltroCancha] = useState<"1" | "2" | "todas">("todas")
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [reservaSeleccionada, setReservaSeleccionada] = useState<Reserva | null>(null)
  const [fechaSlotSeleccionado, setFechaSlotSeleccionado] = useState<Date | undefined>()
  const [horaSlotSeleccionado, setHoraSlotSeleccionado] = useState<string | undefined>()

  useEffect(() => {
    fetchReservas()
  }, [])

  const fetchReservas = async () => {
    try {
      const response = await fetch("/api/reservas")
      const result = await response.json()
      if (result.success) {
        setReservas(result.data)
      } else {
        toast.error("Error al cargar reservas")
      }
    } catch {
      toast.error("Error de conexión")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectReserva = (reserva: Reserva) => {
    setReservaSeleccionada(reserva)
    setFechaSlotSeleccionado(undefined)
    setHoraSlotSeleccionado(undefined)
    setModalOpen(true)
  }

  const handleSelectSlot = ({ start }: { start: Date; end: Date }) => {
    setReservaSeleccionada(null)
    setFechaSlotSeleccionado(start)
    setHoraSlotSeleccionado(format(start, "HH:mm"))
    setModalOpen(true)
  }

  const handleNuevaReserva = () => {
    setReservaSeleccionada(null)
    setFechaSlotSeleccionado(undefined)
    setHoraSlotSeleccionado(undefined)
    setModalOpen(true)
  }

  const handleModalSuccess = () => {
    fetchReservas()
  }

  // Filtrar reservas
  const reservasFiltradas = reservas.filter((reserva) => {
    const matchBusqueda = busqueda === "" || 
      reserva.cliente.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      reserva.cliente.telefono.includes(busqueda)
    
    const matchEstado = filtroEstado === "todos" || reserva.estado === filtroEstado
    const matchCancha = filtroCancha === "todas" || reserva.canchaId.toString() === filtroCancha
    
    return matchBusqueda && matchEstado && matchCancha
  })

  // Ordenar por fecha más reciente
  const reservasOrdenadas = [...reservasFiltradas].sort((a, b) => {
    const dateA = new Date(`${a.fecha}T${a.horaInicio}`)
    const dateB = new Date(`${b.fecha}T${b.horaInicio}`)
    return dateB.getTime() - dateA.getTime()
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Reservas</h2>
          <p className="text-muted-foreground">
            {reservas.length} reservas en total
          </p>
        </div>
        <Button onClick={handleNuevaReserva} className="gap-2">
          <Plus className="h-4 w-4" />
          Nueva Reserva
        </Button>
      </div>

      {/* Filtros y Vista */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Búsqueda */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o teléfono..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filtro Estado */}
            <Select value={filtroEstado} onValueChange={(v) => setFiltroEstado(v as EstadoReserva | "todos")}>
              <SelectTrigger className="w-full lg:w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                <SelectItem value="pendiente">Pendiente</SelectItem>
                <SelectItem value="confirmada">Confirmada</SelectItem>
                <SelectItem value="pagada">Pagada</SelectItem>
                <SelectItem value="cancelada">Cancelada</SelectItem>
              </SelectContent>
            </Select>

            {/* Filtro Cancha */}
            <Select value={filtroCancha} onValueChange={(v) => setFiltroCancha(v as "1" | "2" | "todas")}>
              <SelectTrigger className="w-full lg:w-[150px]">
                <SelectValue placeholder="Cancha" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                <SelectItem value="1">Cancha 1</SelectItem>
                <SelectItem value="2">Cancha 2</SelectItem>
              </SelectContent>
            </Select>

            {/* Toggle Vista */}
            <div className="flex border rounded-lg overflow-hidden">
              <Button
                variant={vista === "calendario" ? "secondary" : "ghost"}
                size="sm"
                className="rounded-none"
                onClick={() => setVista("calendario")}
              >
                <CalendarDays className="h-4 w-4" />
              </Button>
              <Button
                variant={vista === "lista" ? "secondary" : "ghost"}
                size="sm"
                className="rounded-none"
                onClick={() => setVista("lista")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contenido */}
      {isLoading ? (
        <div className="flex h-[600px] items-center justify-center border rounded-md bg-card">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      ) : vista === "calendario" ? (
        <CalendarioReservas
          reservas={reservasFiltradas}
          onSelectReserva={handleSelectReserva}
          onSelectSlot={handleSelectSlot}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Lista de Reservas ({reservasOrdenadas.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {reservasOrdenadas.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No hay reservas que coincidan con los filtros
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Horario</TableHead>
                      <TableHead>Cancha</TableHead>
                      <TableHead>Precio</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reservasOrdenadas.map((reserva) => (
                      <TableRow key={reserva.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleSelectReserva(reserva)}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{reserva.cliente.nombre}</p>
                            <p className="text-sm text-muted-foreground">{reserva.cliente.telefono}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {format(new Date(reserva.fecha), "EEE d MMM", { locale: es })}
                        </TableCell>
                        <TableCell>
                          {reserva.horaInicio} - {reserva.horaFin}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={reserva.canchaId === 1 ? "border-primary text-primary" : "border-accent text-accent"}>
                            Cancha {reserva.canchaId}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(reserva.precio)}
                        </TableCell>
                        <TableCell>
                          <Badge className={cn("border", estadoBadgeStyles[reserva.estado])}>
                            {reserva.estado.charAt(0).toUpperCase() + reserva.estado.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            Ver
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Modal de Reserva */}
      <ModalReserva
        open={modalOpen}
        onOpenChange={setModalOpen}
        reserva={reservaSeleccionada}
        fechaInicial={fechaSlotSeleccionado}
        horaInicial={horaSlotSeleccionado}
        onSuccess={handleModalSuccess}
      />
    </div>
  )
}
