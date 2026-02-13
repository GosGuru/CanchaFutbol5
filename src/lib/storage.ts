import { Reserva, Configuracion, Cancha, Bloqueo } from '@/types'

// Keys para localStorage
const STORAGE_KEYS = {
  RESERVAS: 'cancha-futbol5-reservas',
  CONFIGURACION: 'cancha-futbol5-config',
  CANCHAS: 'cancha-futbol5-canchas',
  BLOQUEOS: 'cancha-futbol5-bloqueos',
  SESSION: 'cancha-futbol5-session'
}

// Configuración por defecto
const DEFAULT_CONFIG: Configuracion = {
  horarioApertura: '08:00',
  horarioCierre: '23:00',
  precioPorHora: 40,
  precios: {
    turnoNormal: 40,
    turnoNocturno: 48,
    turnoFinDeSemana: 50
  },
  duracionSlot: 60,
  diasBloqueados: [],
  infoComplejo: {
    nombre: 'Invasor Fútbol 5',
    direccion: 'Madrid, España',
    telefono: '+34 600 111 222',
    whatsapp: '34600111222',
    instagram: 'canchafutbol5',
    googleMapsUrl: 'https://maps.google.com/?q=Invasor+Futbol+5+Madrid+Espana',
    googleMapsEmbed: 'https://www.google.com/maps?q=Madrid,+Espa%C3%B1a&output=embed'
  },
  regional: {
    pais: 'España',
    locale: 'es-ES',
    moneda: 'EUR',
    simboloMoneda: '€',
    zonaHoraria: 'Europe/Madrid',
    metodosPago: ['tarjeta', 'bizum', 'transferencia', 'efectivo']
  }
}

// Canchas por defecto
const DEFAULT_CANCHAS: Cancha[] = [
  { 
    id: 1, 
    nombre: 'Cancha 1', 
    tipo: 'techada',
    activa: true, 
    capacidad: 10,
    descripcion: 'Cancha techada con césped sintético de última generación',
    caracteristicas: ['Techada', 'Iluminación LED', 'Césped sintético'],
    orden: 1,
    creadaEl: new Date().toISOString(),
    actualizadaEl: new Date().toISOString()
  },
  { 
    id: 2, 
    nombre: 'Cancha 2', 
    tipo: 'cesped',
    activa: true, 
    capacidad: 10,
    descripcion: 'Cancha al aire libre con césped natural',
    caracteristicas: ['Aire libre', 'Césped natural', 'Iluminación nocturna'],
    orden: 2,
    creadaEl: new Date().toISOString(),
    actualizadaEl: new Date().toISOString()
  }
]

// Helper para verificar si estamos en el navegador
const isBrowser = typeof window !== 'undefined'

// Obtener todas las reservas
export function getReservas(): Reserva[] {
  if (!isBrowser) return []
  
  const data = localStorage.getItem(STORAGE_KEYS.RESERVAS)
  if (!data) return []
  
  try {
    return JSON.parse(data)
  } catch {
    return []
  }
}

// Obtener una reserva por ID
export function getReserva(id: string): Reserva | null {
  const reservas = getReservas()
  return reservas.find(r => r.id === id) || null
}

// Crear nueva reserva
export function createReserva(reserva: Omit<Reserva, 'id' | 'creadaEl' | 'actualizadaEl'>): Reserva {
  const reservas = getReservas()
  
  const nuevaReserva: Reserva = {
    ...reserva,
    id: crypto.randomUUID(),
    creadaEl: new Date().toISOString(),
    actualizadaEl: new Date().toISOString()
  }
  
  reservas.push(nuevaReserva)
  saveReservas(reservas)
  
  return nuevaReserva
}

// Actualizar reserva existente
export function updateReserva(id: string, data: Partial<Omit<Reserva, 'id' | 'creadaEl'>>): Reserva | null {
  const reservas = getReservas()
  const index = reservas.findIndex(r => r.id === id)
  
  if (index === -1) return null
  
  const reservaActualizada: Reserva = {
    ...reservas[index],
    ...data,
    actualizadaEl: new Date().toISOString()
  }
  
  reservas[index] = reservaActualizada
  saveReservas(reservas)
  
  return reservaActualizada
}

// Eliminar reserva
export function deleteReserva(id: string): boolean {
  const reservas = getReservas()
  const filtered = reservas.filter(r => r.id !== id)
  
  if (filtered.length === reservas.length) return false
  
  saveReservas(filtered)
  return true
}

// Guardar reservas en localStorage
function saveReservas(reservas: Reserva[]): void {
  if (!isBrowser) return
  localStorage.setItem(STORAGE_KEYS.RESERVAS, JSON.stringify(reservas))
  
  // Disparar evento para sincronización entre tabs
  window.dispatchEvent(new CustomEvent('reservas-updated', { detail: reservas }))
}

// Obtener configuración
export function getConfiguracion(): Configuracion {
  if (!isBrowser) return DEFAULT_CONFIG
  
  const data = localStorage.getItem(STORAGE_KEYS.CONFIGURACION)
  if (!data) {
    saveConfiguracion(DEFAULT_CONFIG)
    return DEFAULT_CONFIG
  }
  
  try {
    const parsed = JSON.parse(data) as Partial<Configuracion>
    return {
      ...DEFAULT_CONFIG,
      ...parsed,
      precios: {
        ...DEFAULT_CONFIG.precios,
        ...parsed.precios,
      },
      infoComplejo: {
        ...DEFAULT_CONFIG.infoComplejo,
        ...parsed.infoComplejo,
      },
      regional: parsed.regional
        ? {
            ...DEFAULT_CONFIG.regional!,
            ...parsed.regional,
          }
        : DEFAULT_CONFIG.regional,
    }
  } catch {
    return DEFAULT_CONFIG
  }
}

// Actualizar configuración
export function updateConfiguracion(config: Partial<Configuracion>): Configuracion {
  const currentConfig = getConfiguracion()
  const newConfig: Configuracion = {
    ...currentConfig,
    ...config,
    precios: {
      ...currentConfig.precios,
      ...config.precios,
    },
    infoComplejo: {
      ...currentConfig.infoComplejo,
      ...config.infoComplejo,
    },
    regional: config.regional
      ? {
          ...(currentConfig.regional ?? DEFAULT_CONFIG.regional!),
          ...config.regional,
        }
      : currentConfig.regional,
  }
  saveConfiguracion(newConfig)
  return newConfig
}

// Guardar configuración
function saveConfiguracion(config: Configuracion): void {
  if (!isBrowser) return
  localStorage.setItem(STORAGE_KEYS.CONFIGURACION, JSON.stringify(config))
}

// Obtener canchas
export function getCanchas(): Cancha[] {
  if (!isBrowser) return DEFAULT_CANCHAS
  
  const data = localStorage.getItem(STORAGE_KEYS.CANCHAS)
  if (!data) {
    saveCanchas(DEFAULT_CANCHAS)
    return DEFAULT_CANCHAS
  }
  
  try {
    return JSON.parse(data)
  } catch {
    return DEFAULT_CANCHAS
  }
}

// Obtener una cancha por ID
export function getCancha(id: number): Cancha | null {
  const canchas = getCanchas()
  return canchas.find(c => c.id === id) || null
}

// Crear nueva cancha
export function createCancha(cancha: Omit<Cancha, 'id' | 'creadaEl' | 'actualizadaEl'>): Cancha {
  const canchas = getCanchas()
  
  // Generar nuevo ID (máximo + 1)
  const maxId = canchas.reduce((max, c) => Math.max(max, c.id), 0)
  
  const nuevaCancha: Cancha = {
    ...cancha,
    id: maxId + 1,
    creadaEl: new Date().toISOString(),
    actualizadaEl: new Date().toISOString()
  }
  
  canchas.push(nuevaCancha)
  saveCanchas(canchas)
  
  return nuevaCancha
}

// Actualizar estado de cancha
export function updateCancha(id: number, data: Partial<Omit<Cancha, 'id' | 'creadaEl'>>): Cancha | null {
  const canchas = getCanchas()
  const index = canchas.findIndex(c => c.id === id)
  
  if (index === -1) return null
  
  canchas[index] = { 
    ...canchas[index], 
    ...data,
    actualizadaEl: new Date().toISOString()
  }
  saveCanchas(canchas)
  
  return canchas[index]
}

// Eliminar cancha
export function deleteCancha(id: number): boolean {
  const canchas = getCanchas()
  const filtered = canchas.filter(c => c.id !== id)
  
  if (filtered.length === canchas.length) return false
  
  saveCanchas(filtered)
  return true
}

// Guardar canchas
function saveCanchas(canchas: Cancha[]): void {
  if (!isBrowser) return
  localStorage.setItem(STORAGE_KEYS.CANCHAS, JSON.stringify(canchas))
  
  // Disparar evento para sincronización
  window.dispatchEvent(new CustomEvent('canchas-updated', { detail: canchas }))
}

// ============== BLOQUEOS ==============

// Obtener todos los bloqueos
export function getBloqueos(): Bloqueo[] {
  if (!isBrowser) return []
  
  const data = localStorage.getItem(STORAGE_KEYS.BLOQUEOS)
  if (!data) return []
  
  try {
    return JSON.parse(data)
  } catch {
    return []
  }
}

// Crear bloqueo
export function createBloqueo(bloqueo: Omit<Bloqueo, 'id' | 'creadaEl'>): Bloqueo {
  const bloqueos = getBloqueos()
  
  const nuevoBloqueo: Bloqueo = {
    ...bloqueo,
    id: crypto.randomUUID(),
    creadaEl: new Date().toISOString()
  }
  
  bloqueos.push(nuevoBloqueo)
  saveBloqueos(bloqueos)
  
  return nuevoBloqueo
}

// Eliminar bloqueo
export function deleteBloqueo(id: string): boolean {
  const bloqueos = getBloqueos()
  const filtered = bloqueos.filter(b => b.id !== id)
  
  if (filtered.length === bloqueos.length) return false
  
  saveBloqueos(filtered)
  return true
}

// Guardar bloqueos
function saveBloqueos(bloqueos: Bloqueo[]): void {
  if (!isBrowser) return
  localStorage.setItem(STORAGE_KEYS.BLOQUEOS, JSON.stringify(bloqueos))
}

// Autenticación - Guardar sesión
export function saveSession(username: string): void {
  if (!isBrowser) return
  localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify({ username, loggedAt: new Date().toISOString() }))
}

// Obtener sesión
export function getSession(): { username: string; loggedAt: string } | null {
  if (!isBrowser) return null
  
  const data = localStorage.getItem(STORAGE_KEYS.SESSION)
  if (!data) return null
  
  try {
    return JSON.parse(data)
  } catch {
    return null
  }
}

// Cerrar sesión
export function clearSession(): void {
  if (!isBrowser) return
  localStorage.removeItem(STORAGE_KEYS.SESSION)
}

// Limpiar todos los datos
export function clearAllData(): void {
  if (!isBrowser) return
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key)
  })
}
