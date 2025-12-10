"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Warehouse, 
  Trees, 
  MoreVertical,
  Power,
  PowerOff,
  Users,
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { getCanchas, createCancha, updateCancha, deleteCancha, getReservas } from "@/lib/storage"
import { formatCurrency, cn } from "@/lib/utils"
import type { Cancha, TipoCancha } from "@/types"

const tiposCancha: { value: TipoCancha; label: string; icon: typeof Warehouse }[] = [
  { value: "techada", label: "Techada", icon: Warehouse },
  { value: "cesped", label: "Césped Natural", icon: Trees },
  { value: "sintetico", label: "Césped Sintético", icon: Warehouse },
]

const caracteristicasDisponibles = [
  "Techada",
  "Iluminación LED",
  "Iluminación nocturna",
  "Césped sintético",
  "Césped natural",
  "Aire libre",
  "Vestuarios",
  "Duchas",
  "Estacionamiento",
  "Tribunas",
  "Sonido ambiente",
  "Wifi"
]

export default function CanchasPage() {
  const [canchas, setCanchas] = useState<Cancha[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedCancha, setSelectedCancha] = useState<Cancha | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    nombre: "",
    tipo: "techada" as TipoCancha,
    capacidad: 10,
    descripcion: "",
    precioPorHora: "",
    precioNocturno: "",
    precioFinDeSemana: "",
    caracteristicas: [] as string[],
  })

  // Cargar canchas
  useEffect(() => {
    loadCanchas()
  }, [])

  const loadCanchas = () => {
    const data = getCanchas()
    setCanchas(data.sort((a, b) => a.orden - b.orden))
    setIsLoading(false)
  }

  // Contar reservas por cancha
  const getReservasCount = (canchaId: number) => {
    const reservas = getReservas()
    const hoy = new Date().toISOString().split("T")[0]
    return reservas.filter(r => 
      r.canchaId === canchaId && 
      r.fecha >= hoy && 
      r.estado !== "cancelada"
    ).length
  }

  // Abrir dialog para crear/editar
  const openDialog = (cancha?: Cancha) => {
    if (cancha) {
      setSelectedCancha(cancha)
      setFormData({
        nombre: cancha.nombre,
        tipo: cancha.tipo,
        capacidad: cancha.capacidad,
        descripcion: cancha.descripcion || "",
        precioPorHora: cancha.precioPorHora?.toString() || "",
        precioNocturno: cancha.precioNocturno?.toString() || "",
        precioFinDeSemana: cancha.precioFinDeSemana?.toString() || "",
        caracteristicas: cancha.caracteristicas || [],
      })
    } else {
      setSelectedCancha(null)
      setFormData({
        nombre: "",
        tipo: "techada",
        capacidad: 10,
        descripcion: "",
        precioPorHora: "",
        precioNocturno: "",
        precioFinDeSemana: "",
        caracteristicas: [],
      })
    }
    setDialogOpen(true)
  }

  // Guardar cancha
  const handleSubmit = async () => {
    if (!formData.nombre.trim()) {
      toast.error("El nombre es obligatorio")
      return
    }

    setIsSubmitting(true)

    try {
      const canchaData = {
        nombre: formData.nombre.trim(),
        tipo: formData.tipo,
        capacidad: formData.capacidad,
        descripcion: formData.descripcion.trim() || undefined,
        precioPorHora: formData.precioPorHora ? parseInt(formData.precioPorHora) : undefined,
        precioNocturno: formData.precioNocturno ? parseInt(formData.precioNocturno) : undefined,
        precioFinDeSemana: formData.precioFinDeSemana ? parseInt(formData.precioFinDeSemana) : undefined,
        caracteristicas: formData.caracteristicas.length > 0 ? formData.caracteristicas : undefined,
        activa: selectedCancha?.activa ?? true,
        orden: selectedCancha?.orden ?? canchas.length + 1,
      }

      if (selectedCancha) {
        updateCancha(selectedCancha.id, canchaData)
        toast.success("Cancha actualizada correctamente")
      } else {
        createCancha(canchaData)
        toast.success("Cancha creada correctamente")
      }

      loadCanchas()
      setDialogOpen(false)
    } catch {
      toast.error("Error al guardar la cancha")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Toggle activa/inactiva
  const toggleActiva = (cancha: Cancha) => {
    updateCancha(cancha.id, { activa: !cancha.activa })
    loadCanchas()
    toast.success(cancha.activa ? "Cancha desactivada" : "Cancha activada")
  }

  // Eliminar cancha
  const handleDelete = () => {
    if (!selectedCancha) return

    const reservasCount = getReservasCount(selectedCancha.id)
    if (reservasCount > 0) {
      toast.error(`No se puede eliminar. Hay ${reservasCount} reservas pendientes`)
      setDeleteDialogOpen(false)
      return
    }

    deleteCancha(selectedCancha.id)
    loadCanchas()
    setDeleteDialogOpen(false)
    setSelectedCancha(null)
    toast.success("Cancha eliminada correctamente")
  }

  // Toggle característica
  const toggleCaracteristica = (caracteristica: string) => {
    setFormData(prev => ({
      ...prev,
      caracteristicas: prev.caracteristicas.includes(caracteristica)
        ? prev.caracteristicas.filter(c => c !== caracteristica)
        : [...prev.caracteristicas, caracteristica]
    }))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Canchas</h2>
          <p className="text-muted-foreground">
            Gestiona las canchas de tu complejo
          </p>
        </div>
        <Button onClick={() => openDialog()} className="gap-2">
          <Plus className="h-4 w-4" />
          Nueva Cancha
        </Button>
      </div>

      {/* Grid de canchas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {canchas.map((cancha, index) => {
            const TipoIcon = tiposCancha.find(t => t.value === cancha.tipo)?.icon || Warehouse
            const reservasCount = getReservasCount(cancha.id)
            
            return (
              <motion.div
                key={cancha.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={cn(
                  "relative overflow-hidden transition-all hover:shadow-lg",
                  !cancha.activa && "opacity-60"
                )}>
                  {/* Badge de estado */}
                  <div className="absolute top-3 right-3 z-10">
                    <Badge 
                      variant={cancha.activa ? "default" : "secondary"}
                      className={cn(
                        "gap-1",
                        cancha.activa 
                          ? "bg-emerald-500/20 text-emerald-500 border-emerald-500/30" 
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {cancha.activa ? (
                        <>
                          <CheckCircle2 className="h-3 w-3" />
                          Activa
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3 w-3" />
                          Inactiva
                        </>
                      )}
                    </Badge>
                  </div>

                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center",
                        cancha.tipo === "techada" 
                          ? "bg-blue-500/20 text-blue-500"
                          : cancha.tipo === "cesped"
                            ? "bg-green-500/20 text-green-500"
                            : "bg-emerald-500/20 text-emerald-500"
                      )}>
                        <TipoIcon className="h-6 w-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg">{cancha.nombre}</CardTitle>
                        <CardDescription className="capitalize">
                          {tiposCancha.find(t => t.value === cancha.tipo)?.label}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Descripción */}
                    {cancha.descripcion && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {cancha.descripcion}
                      </p>
                    )}

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{cancha.capacidad} jugadores</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{reservasCount} reservas</span>
                      </div>
                    </div>

                    {/* Precio */}
                    {cancha.precioPorHora && (
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <DollarSign className="h-4 w-4 text-primary" />
                        <span>{formatCurrency(cancha.precioPorHora)}/hora</span>
                      </div>
                    )}

                    {/* Características */}
                    {cancha.caracteristicas && cancha.caracteristicas.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {cancha.caracteristicas.slice(0, 3).map((car) => (
                          <Badge key={car} variant="outline" className="text-xs">
                            {car}
                          </Badge>
                        ))}
                        {cancha.caracteristicas.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{cancha.caracteristicas.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Acciones */}
                    <div className="flex items-center justify-between pt-2 border-t">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDialog(cancha)}
                        className="gap-1.5"
                      >
                        <Pencil className="h-4 w-4" />
                        Editar
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => toggleActiva(cancha)}>
                            {cancha.activa ? (
                              <>
                                <PowerOff className="h-4 w-4 mr-2" />
                                Desactivar
                              </>
                            ) : (
                              <>
                                <Power className="h-4 w-4 mr-2" />
                                Activar
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => {
                              setSelectedCancha(cancha)
                              setDeleteDialogOpen(true)
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {/* Card para agregar nueva cancha */}
        {canchas.length === 0 && (
          <Card 
            className="border-dashed cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors"
            onClick={() => openDialog()}
          >
            <CardContent className="flex flex-col items-center justify-center h-48 gap-2">
              <Plus className="h-8 w-8 text-muted-foreground" />
              <p className="text-muted-foreground font-medium">Agregar primera cancha</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dialog de crear/editar */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedCancha ? "Editar Cancha" : "Nueva Cancha"}
            </DialogTitle>
            <DialogDescription>
              {selectedCancha 
                ? "Modifica los datos de la cancha"
                : "Completa los datos para crear una nueva cancha"
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Nombre */}
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre *</Label>
              <Input
                id="nombre"
                placeholder="Ej: Cancha Principal"
                value={formData.nombre}
                onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
              />
            </div>

            {/* Tipo */}
            <div className="space-y-2">
              <Label>Tipo de cancha</Label>
              <Select
                value={formData.tipo}
                onValueChange={(value: TipoCancha) => setFormData(prev => ({ ...prev, tipo: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tiposCancha.map((tipo) => (
                    <SelectItem key={tipo.value} value={tipo.value}>
                      <div className="flex items-center gap-2">
                        <tipo.icon className="h-4 w-4" />
                        {tipo.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Capacidad */}
            <div className="space-y-2">
              <Label htmlFor="capacidad">Capacidad (jugadores)</Label>
              <Input
                id="capacidad"
                type="number"
                min={2}
                max={22}
                value={formData.capacidad}
                onChange={(e) => setFormData(prev => ({ ...prev, capacidad: parseInt(e.target.value) || 10 }))}
              />
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                placeholder="Describe las características de la cancha..."
                value={formData.descripcion}
                onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                rows={3}
              />
            </div>

            {/* Precios */}
            <div className="space-y-3">
              <Label>Precios (dejar vacío para usar precio general)</Label>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Normal</Label>
                  <Input
                    type="number"
                    placeholder="$"
                    value={formData.precioPorHora}
                    onChange={(e) => setFormData(prev => ({ ...prev, precioPorHora: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Nocturno</Label>
                  <Input
                    type="number"
                    placeholder="$"
                    value={formData.precioNocturno}
                    onChange={(e) => setFormData(prev => ({ ...prev, precioNocturno: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Fin de semana</Label>
                  <Input
                    type="number"
                    placeholder="$"
                    value={formData.precioFinDeSemana}
                    onChange={(e) => setFormData(prev => ({ ...prev, precioFinDeSemana: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            {/* Características */}
            <div className="space-y-2">
              <Label>Características</Label>
              <div className="flex flex-wrap gap-2">
                {caracteristicasDisponibles.map((car) => (
                  <Badge
                    key={car}
                    variant={formData.caracteristicas.includes(car) ? "default" : "outline"}
                    className="cursor-pointer transition-colors"
                    onClick={() => toggleCaracteristica(car)}
                  >
                    {car}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {selectedCancha ? "Guardar cambios" : "Crear cancha"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmación de eliminación */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar cancha?</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. Se eliminará la cancha &ldquo;{selectedCancha?.nombre}&rdquo; permanentemente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
