import { NextRequest, NextResponse } from 'next/server'
import { getReservas, getConfiguracion } from '@/lib/storage'
import { getHorasDisponibles } from '@/lib/utils'
import { validarHorarioDisponible } from '@/lib/validations'

// Función para generar ocupación ficticia basada en fecha y cancha
function generarOcupacionFicticia(fecha: string, canchaId: number, hora: string): boolean {
  // Crear un "seed" basado en fecha, cancha y hora para que sea consistente
  const seed = `${fecha}-${canchaId}-${hora}`
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  
  const horaNum = parseInt(hora.split(':')[0])
  const diaSemana = new Date(fecha).getDay()
  const esFinDeSemana = diaSemana === 0 || diaSemana === 6
  
  // Definir probabilidad de ocupación según horario y día
  let probabilidadOcupacion = 0
  
  if (esFinDeSemana) {
    // Fin de semana: más ocupación en horarios populares
    if (horaNum >= 9 && horaNum <= 12) probabilidadOcupacion = 70 // Mañanas populares
    else if (horaNum >= 16 && horaNum <= 20) probabilidadOcupacion = 85 // Tardes muy populares
    else if (horaNum >= 20 && horaNum <= 22) probabilidadOcupacion = 75 // Noches populares
    else probabilidadOcupacion = 40 // Otros horarios
  } else {
    // Días de semana: ocupación más concentrada en tardes/noches
    if (horaNum >= 8 && horaNum <= 11) probabilidadOcupacion = 25 // Mañanas tranquilas
    else if (horaNum >= 12 && horaNum <= 14) probabilidadOcupacion = 35 // Mediodía
    else if (horaNum >= 18 && horaNum <= 21) probabilidadOcupacion = 80 // Post-trabajo muy ocupado
    else if (horaNum >= 21 && horaNum <= 22) probabilidadOcupacion = 60 // Noche
    else probabilidadOcupacion = 30 // Otros
  }
  
  // Cancha 2 suele estar un poco más libre
  if (canchaId === 2) probabilidadOcupacion -= 15
  
  // Usar el hash para determinar si está ocupado de forma consistente
  const valorNormalizado = Math.abs(hash % 100)
  return valorNormalizado < probabilidadOcupacion
}

// GET /api/disponibilidad?fecha=YYYY-MM-DD&canchaId=1
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const fecha = searchParams.get('fecha')
    // Aceptar tanto "cancha" como "canchaId" para compatibilidad
    const canchaParam = searchParams.get('canchaId') || searchParams.get('cancha')

    if (!fecha || !canchaParam) {
      return NextResponse.json(
        { success: false, error: 'Fecha y cancha son requeridos' },
        { status: 400 }
      )
    }

    const config = getConfiguracion()
    const cancha = Number(canchaParam) as 1 | 2

    // Obtener todos los slots posibles
    const todosLosSlots = getHorasDisponibles(
      config.horarioApertura,
      config.horarioCierre,
      config.duracionSlot
    )

    // Obtener reservas reales del día
    const reservas = getReservas()
    const reservasDia = reservas.filter(r => {
      if (r.canchaId !== cancha) return false
      if (r.estado === 'cancelada') return false
      
      const fechaReserva = new Date(r.fecha).toISOString().split('T')[0]
      const fechaBusqueda = new Date(fecha).toISOString().split('T')[0]
      
      return fechaReserva === fechaBusqueda
    })

    // Mapear slots con disponibilidad (mezcla de reales y ficticias)
    const slots = todosLosSlots.map(horaInicio => {
      // Calcular hora fin
      const [hora, min] = horaInicio.split(':').map(Number)
      const minutosTotal = hora * 60 + min + config.duracionSlot
      const horaFin = `${Math.floor(minutosTotal / 60).toString().padStart(2, '0')}:${(minutosTotal % 60).toString().padStart(2, '0')}`

      // Verificar si hay reserva real
      const reservaEnSlot = reservasDia.find(r => r.horaInicio === horaInicio)
      
      // Si hay reserva real, está ocupado
      if (reservaEnSlot) {
        return {
          hora: horaInicio,
          horaFin,
          disponible: false,
          reservaId: reservaEnSlot.id
        }
      }
      
      // Si no hay reserva real, usar ocupación ficticia para demo
      const ocupadoFicticio = generarOcupacionFicticia(fecha, cancha, horaInicio)
      
      return {
        hora: horaInicio,
        horaFin,
        disponible: !ocupadoFicticio
      }
    })

    // Retornar en formato que espera el frontend
    return NextResponse.json({ slots })
  } catch (error) {
    console.error('Error en disponibilidad:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener disponibilidad' },
      { status: 500 }
    )
  }
}
