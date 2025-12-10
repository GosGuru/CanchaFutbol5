import { NextRequest, NextResponse } from 'next/server'
import { getReservas, getConfiguracion } from '@/lib/storage'
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'

type Periodo = 'dia' | 'semana' | 'mes'

// GET /api/estadisticas?periodo=dia|semana|mes&fecha=YYYY-MM-DD
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const periodo = (searchParams.get('periodo') || 'dia') as Periodo
    const fechaParam = searchParams.get('fecha')
    
    const fecha = fechaParam ? new Date(fechaParam) : new Date()
    
    // Determinar rango de fechas según periodo
    let fechaInicio: Date
    let fechaFin: Date
    
    switch (periodo) {
      case 'semana':
        fechaInicio = startOfWeek(fecha, { weekStartsOn: 1 }) // Lunes
        fechaFin = endOfWeek(fecha, { weekStartsOn: 1 })
        break
      case 'mes':
        fechaInicio = startOfMonth(fecha)
        fechaFin = endOfMonth(fecha)
        break
      default: // dia
        fechaInicio = startOfDay(fecha)
        fechaFin = endOfDay(fecha)
    }
    
    const reservas = getReservas()
    const config = getConfiguracion()
    
    // Filtrar reservas del periodo
    const reservasPeriodo = reservas.filter(r => {
      const fechaReserva = new Date(r.fecha)
      return fechaReserva >= fechaInicio && fechaReserva <= fechaFin
    })
    
    // Calcular estadísticas
    const totalReservas = reservasPeriodo.length
    const reservasConfirmadas = reservasPeriodo.filter(r => r.estado === 'confirmada').length
    const reservasPendientes = reservasPeriodo.filter(r => r.estado === 'pendiente').length
    const reservasCanceladas = reservasPeriodo.filter(r => r.estado === 'cancelada').length
    const reservasPagadas = reservasPeriodo.filter(r => r.estado === 'pagada').length
    
    // Calcular ingresos (confirmadas + pagadas)
    const ingresosEstimados = reservasPeriodo
      .filter(r => r.estado === 'confirmada' || r.estado === 'pagada')
      .reduce((total, r) => total + r.precio, 0)
    
    // Horarios más populares
    const horariosMap = new Map<string, number>()
    reservasPeriodo.forEach(r => {
      if (r.estado !== 'cancelada') {
        const hora = r.horaInicio
        horariosMap.set(hora, (horariosMap.get(hora) || 0) + 1)
      }
    })
    
    const horariosPopulares = Array.from(horariosMap.entries())
      .map(([hora, cantidad]) => ({ hora, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5)
    
    // Calcular tasa de ocupación por cancha
    const diasEnPeriodo = Math.ceil((fechaFin.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24))
    const horasPorDia = (new Date(`2000-01-01T${config.horarioCierre}`).getTime() - 
                         new Date(`2000-01-01T${config.horarioApertura}`).getTime()) / (1000 * 60 * 60)
    const slotsDisponiblesPorCancha = diasEnPeriodo * Math.floor(horasPorDia * (60 / config.duracionSlot))
    
    const reservasCancha1 = reservasPeriodo.filter(r => r.canchaId === 1 && r.estado !== 'cancelada').length
    const reservasCancha2 = reservasPeriodo.filter(r => r.canchaId === 2 && r.estado !== 'cancelada').length
    
    const tasaOcupacionCancha1 = slotsDisponiblesPorCancha > 0 
      ? Math.round((reservasCancha1 / slotsDisponiblesPorCancha) * 100) 
      : 0
    const tasaOcupacionCancha2 = slotsDisponiblesPorCancha > 0 
      ? Math.round((reservasCancha2 / slotsDisponiblesPorCancha) * 100) 
      : 0
    
    return NextResponse.json({
      success: true,
      data: {
        periodo,
        fechaInicio: fechaInicio.toISOString(),
        fechaFin: fechaFin.toISOString(),
        totalReservas,
        reservasConfirmadas,
        reservasPendientes,
        reservasCanceladas,
        reservasPagadas,
        ingresosEstimados,
        tasaOcupacionCancha1,
        tasaOcupacionCancha2,
        horariosPopulares
      }
    })
  } catch (error) {
    console.error('Error calculating stats:', error)
    return NextResponse.json(
      { success: false, error: 'Error al calcular estadísticas' },
      { status: 500 }
    )
  }
}
