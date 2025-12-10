/**
 * DATA SERVICE - Capa de abstracción para datos
 * 
 * Este módulo actúa como intermediario entre la UI y el almacenamiento.
 * Actualmente usa localStorage, pero está diseñado para migrar fácilmente a:
 * - Supabase (recomendado para realtime)
 * - Firebase
 * - API REST propia
 * 
 * Para migrar: solo modificar las implementaciones de las funciones aquí,
 * el resto de la app seguirá funcionando sin cambios.
 */

import { 
  Reserva, 
  Cancha, 
  Cliente,
  EstadoReserva,
  OrigenReserva 
} from '@/types'
import { 
  getReservas, 
  createReserva, 
  updateReserva,
  getConfiguracion, 
  getCanchas,
  getCancha
} from './storage'
import { parseISO } from 'date-fns'

// ============================================
// TIPOS PARA EL SERVICIO
// ============================================

export interface CrearReservaInput {
  canchaId: number
  fecha: string // 'YYYY-MM-DD'
  horaInicio: string // 'HH:mm'
  horaFin: string // 'HH:mm'
  cliente: Cliente
  precio: number
  origen?: OrigenReserva
  notas?: string
}

export interface DisponibilidadSlot {
  hora: string
  disponible: boolean
  canchaId: number
  precio: number
}

export interface InfoComplejo {
  nombre: string
  direccion: string
  telefono: string
  whatsapp: string
  horarioApertura: string
  horarioCierre: string
  precioBase: number
  precios: {
    normal: number
    nocturno: number
    finDeSemana: number
  }
}

// ============================================
// FUNCIONES PÚBLICAS (para landing y reservas)
// ============================================

/**
 * Obtener información pública del complejo
 * Usada en: Landing, Header, Footer
 */
export function getInfoComplejo(): InfoComplejo {
  const config = getConfiguracion()
  
  return {
    nombre: config.infoComplejo.nombre,
    direccion: config.infoComplejo.direccion,
    telefono: config.infoComplejo.telefono,
    whatsapp: config.infoComplejo.whatsapp,
    horarioApertura: config.horarioApertura,
    horarioCierre: config.horarioCierre,
    precioBase: config.precioPorHora,
    precios: {
      normal: config.precios.turnoNormal,
      nocturno: config.precios.turnoNocturno,
      finDeSemana: config.precios.turnoFinDeSemana
    }
  }
}

/**
 * Obtener canchas activas públicamente
 * Usada en: Flujo de reserva, landing
 */
export function getCanchasPublicas(): Cancha[] {
  return getCanchas()
    .filter(c => c.activa)
    .sort((a, b) => a.orden - b.orden)
}

/**
 * Obtener una cancha por ID
 */
export function getCanchaPublica(id: number): Cancha | null {
  const cancha = getCancha(id)
  if (!cancha || !cancha.activa) return null
  return cancha
}

/**
 * Verificar disponibilidad para una fecha específica
 */
export function getDisponibilidadFecha(
  fecha: string, 
  canchaId?: number
): DisponibilidadSlot[] {
  const config = getConfiguracion()
  const reservas = getReservas()
  const canchas = canchaId ? [getCancha(canchaId)].filter(Boolean) as Cancha[] : getCanchasPublicas()
  
  const slots: DisponibilidadSlot[] = []
  
  // Generar horarios según configuración
  const horaInicio = parseInt(config.horarioApertura.split(':')[0])
  const horaFin = parseInt(config.horarioCierre.split(':')[0])
  
  for (let hora = horaInicio; hora < horaFin; hora++) {
    const horaStr = `${hora.toString().padStart(2, '0')}:00`
    
    for (const cancha of canchas) {
      // Verificar si hay reserva existente
      const reservaExistente = reservas.find(r => 
        r.fecha === fecha && 
        r.horaInicio === horaStr && 
        r.canchaId === cancha.id &&
        r.estado !== 'cancelada'
      )
      
      // Calcular precio según horario y día
      let precio = cancha.precioPorHora || config.precioPorHora
      
      // Verificar si es horario nocturno (>= 20:00)
      if (hora >= 20 && cancha.precioNocturno) {
        precio = cancha.precioNocturno
      } else if (hora >= 20) {
        precio = config.precios.turnoNocturno
      }
      
      // Verificar si es fin de semana
      const fechaDate = parseISO(fecha)
      const diaSemana = fechaDate.getDay()
      if ((diaSemana === 0 || diaSemana === 6)) {
        if (cancha.precioFinDeSemana) {
          precio = cancha.precioFinDeSemana
        } else {
          precio = config.precios.turnoFinDeSemana
        }
      }
      
      // Verificar si es hora pasada
      const ahora = new Date()
      const slotDate = new Date(`${fecha}T${horaStr}`)
      const esPasado = slotDate < ahora
      
      slots.push({
        hora: horaStr,
        disponible: !reservaExistente && !esPasado,
        canchaId: cancha.id,
        precio
      })
    }
  }
  
  return slots
}

/**
 * Verificar si un slot específico está disponible
 */
export function verificarDisponibilidad(
  fecha: string,
  horaInicio: string,
  canchaId: number
): { disponible: boolean; motivo?: string } {
  const reservas = getReservas()
  
  // Verificar hora pasada
  const ahora = new Date()
  const slotDate = new Date(`${fecha}T${horaInicio}`)
  if (slotDate < ahora) {
    return { disponible: false, motivo: 'Este horario ya pasó' }
  }
  
  // Verificar reserva existente
  const reservaExistente = reservas.find(r => 
    r.fecha === fecha && 
    r.horaInicio === horaInicio && 
    r.canchaId === canchaId &&
    r.estado !== 'cancelada'
  )
  
  if (reservaExistente) {
    return { disponible: false, motivo: 'Este horario ya está reservado' }
  }
  
  return { disponible: true }
}

/**
 * Crear una reserva desde la landing/web pública
 */
export async function crearReservaPublica(
  input: CrearReservaInput
): Promise<{ success: boolean; reserva?: Reserva; error?: string }> {
  try {
    // Verificar disponibilidad primero
    const { disponible, motivo } = verificarDisponibilidad(
      input.fecha, 
      input.horaInicio, 
      input.canchaId
    )
    
    if (!disponible) {
      return { success: false, error: motivo }
    }
    
    // Crear la reserva
    const reserva = createReserva({
      canchaId: input.canchaId,
      fecha: input.fecha,
      horaInicio: input.horaInicio,
      horaFin: input.horaFin,
      cliente: input.cliente,
      precio: input.precio,
      estado: 'pendiente', // Las reservas web siempre empiezan como pendientes
      origen: input.origen || 'web',
      notas: input.notas
    })
    
    // Disparar evento para actualizar otras partes de la app
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('reserva-creada', { detail: reserva }))
    }
    
    return { success: true, reserva }
  } catch (error) {
    console.error('Error al crear reserva:', error)
    return { success: false, error: 'Error al procesar la reserva' }
  }
}

/**
 * Obtener horarios disponibles para una fecha y cancha
 * Formato simplificado para el selector de horarios
 */
export function getHorariosDisponibles(
  fecha: string,
  canchaId?: number
): { hora: string; canchaId: number; precio: number }[] {
  const slots = getDisponibilidadFecha(fecha, canchaId)
  return slots
    .filter(s => s.disponible)
    .map(s => ({
      hora: s.hora,
      canchaId: s.canchaId,
      precio: s.precio
    }))
}

/**
 * Calcular precio de una reserva
 */
export function calcularPrecioReserva(
  fecha: string,
  horaInicio: string,
  canchaId: number
): number {
  const config = getConfiguracion()
  const cancha = getCancha(canchaId)
  
  const hora = parseInt(horaInicio.split(':')[0])
  let precio = cancha?.precioPorHora || config.precioPorHora
  
  // Horario nocturno
  if (hora >= 20) {
    precio = cancha?.precioNocturno || config.precios.turnoNocturno
  }
  
  // Fin de semana
  const fechaDate = parseISO(fecha)
  const diaSemana = fechaDate.getDay()
  if (diaSemana === 0 || diaSemana === 6) {
    precio = cancha?.precioFinDeSemana || config.precios.turnoFinDeSemana
  }
  
  return precio
}

// ============================================
// FUNCIONES PARA ADMIN (requieren auth)
// ============================================

/**
 * Obtener todas las reservas (admin)
 */
export function getTodasLasReservas(): Reserva[] {
  return getReservas().sort((a, b) => 
    new Date(b.creadaEl).getTime() - new Date(a.creadaEl).getTime()
  )
}

/**
 * Obtener reservas por fecha (admin)
 */
export function getReservasPorFecha(fecha: string): Reserva[] {
  return getReservas()
    .filter(r => r.fecha === fecha)
    .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio))
}

/**
 * Actualizar estado de reserva (admin)
 */
export function actualizarEstadoReserva(
  id: string, 
  estado: EstadoReserva
): Reserva | null {
  const reserva = updateReserva(id, { estado })
  
  if (reserva && typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('reserva-actualizada', { detail: reserva }))
  }
  
  return reserva
}

// ============================================
// HOOKS HELPERS (para usar con React)
// ============================================

/**
 * Suscribirse a cambios en reservas
 * Usar en useEffect para mantener datos actualizados
 */
export function suscribirseAReservas(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {}
  
  const handler = () => callback()
  
  window.addEventListener('reserva-creada', handler)
  window.addEventListener('reserva-actualizada', handler)
  window.addEventListener('storage', handler)
  
  return () => {
    window.removeEventListener('reserva-creada', handler)
    window.removeEventListener('reserva-actualizada', handler)
    window.removeEventListener('storage', handler)
  }
}
