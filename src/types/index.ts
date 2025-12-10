// Tipos de estado de reserva
export type EstadoReserva = "pendiente" | "confirmada" | "cancelada" | "pagada"

// Origen de la reserva
export type OrigenReserva = "web" | "admin" | "whatsapp"

// Tipo de cancha
export type TipoCancha = "techada" | "cesped" | "sintetico"

// Cliente
export interface Cliente {
  nombre: string
  telefono: string
  email?: string
  cedula?: string
}

// Reserva
export interface Reserva {
  id: string
  canchaId: number
  fecha: string // ISO date string
  horaInicio: string // "14:00"
  horaFin: string // "15:00"
  cliente: Cliente
  precio: number
  estado: EstadoReserva
  origen: OrigenReserva
  notas?: string
  creadaEl: string // ISO date string
  actualizadaEl: string // ISO date string
}

// Cancha - Expandida para CRUD completo
export interface Cancha {
  id: number
  nombre: string
  tipo: TipoCancha
  activa: boolean
  capacidad: number
  descripcion?: string
  precioPorHora?: number // Precio específico de esta cancha (override del general)
  precioNocturno?: number
  precioFinDeSemana?: number
  caracteristicas?: string[] // ["Iluminación LED", "Vestuarios", etc]
  imagen?: string
  orden: number // Para ordenar en la UI
  creadaEl: string
  actualizadaEl: string
}

// Información del complejo
export interface InfoComplejo {
  nombre: string
  direccion: string
  telefono: string
  whatsapp: string
  instagram: string
  googleMapsUrl: string
  googleMapsEmbed: string
}

// Precios por tipo de turno
export interface Precios {
  turnoNormal: number
  turnoNocturno: number // después de las 20:00
  turnoFinDeSemana: number
}

// Configuración del sistema
export interface Configuracion {
  horarioApertura: string // "08:00"
  horarioCierre: string // "23:00"
  precioPorHora: number // precio base (legacy)
  precios: Precios
  duracionSlot: number // 60 minutos
  diasBloqueados: string[] // ISO date strings
  infoComplejo: InfoComplejo
}

// Usuario administrador
export interface Usuario {
  username: string
  email?: string
  rol?: "admin" | "empleado"
}

// Estadísticas
export interface Estadisticas {
  totalReservas: number
  reservasConfirmadas: number
  reservasPendientes: number
  reservasCanceladas: number
  ingresosEstimados: number
  tasaOcupacionCancha1: number
  tasaOcupacionCancha2: number
  horariosPopulares: { hora: string; cantidad: number }[]
}

// Filtros de reservas
export interface FiltrosReservas {
  fecha?: string
  canchaId?: number
  estado?: EstadoReserva
  busqueda?: string
}

// Slot de horario disponible
export interface SlotDisponible {
  hora: string
  disponible: boolean
  reservaId?: string
  canchaId?: number
}

// Bloqueo de horario (mantenimiento, eventos, etc)
export interface Bloqueo {
  id: string
  canchaId: number | null // null = todas las canchas
  fechaInicio: string
  fechaFin: string
  horaInicio?: string
  horaFin?: string
  motivo: string
  creadaEl: string
}
