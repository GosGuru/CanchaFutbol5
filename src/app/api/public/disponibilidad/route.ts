import { NextRequest, NextResponse } from 'next/server'
import { getDisponibilidadFecha, verificarDisponibilidad } from '@/lib/data-service'

/**
 * GET /api/public/disponibilidad?fecha=YYYY-MM-DD&canchaId=1
 * 
 * Endpoint público para verificar disponibilidad
 * Usado por: Flujo de reserva en landing
 * 
 * Query params:
 * - fecha: string (requerido) - Fecha en formato YYYY-MM-DD
 * - canchaId: number (opcional) - Filtrar por cancha específica
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fecha = searchParams.get('fecha')
    const canchaId = searchParams.get('canchaId')

    if (!fecha) {
      return NextResponse.json(
        { success: false, error: 'Se requiere el parámetro fecha' },
        { status: 400 }
      )
    }

    // Validar formato de fecha
    const fechaRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!fechaRegex.test(fecha)) {
      return NextResponse.json(
        { success: false, error: 'Formato de fecha inválido. Use YYYY-MM-DD' },
        { status: 400 }
      )
    }

    const slots = getDisponibilidadFecha(
      fecha, 
      canchaId ? parseInt(canchaId) : undefined
    )

    // Agrupar por hora para mostrar todas las canchas
    const disponibilidadPorHora = slots.reduce((acc, slot) => {
      if (!acc[slot.hora]) {
        acc[slot.hora] = []
      }
      acc[slot.hora].push({
        canchaId: slot.canchaId,
        disponible: slot.disponible,
        precio: slot.precio
      })
      return acc
    }, {} as Record<string, { canchaId: number; disponible: boolean; precio: number }[]>)

    return NextResponse.json({
      success: true,
      data: {
        fecha,
        slots: disponibilidadPorHora,
        totalSlots: slots.length,
        slotsDisponibles: slots.filter(s => s.disponible).length
      }
    })
  } catch (error) {
    console.error('Error al obtener disponibilidad:', error)
    return NextResponse.json(
      { success: false, error: 'Error al verificar disponibilidad' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/public/disponibilidad
 * 
 * Verificar disponibilidad de un slot específico
 * Body: { fecha, horaInicio, canchaId }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fecha, horaInicio, canchaId } = body

    if (!fecha || !horaInicio || !canchaId) {
      return NextResponse.json(
        { success: false, error: 'Se requieren fecha, horaInicio y canchaId' },
        { status: 400 }
      )
    }

    const resultado = verificarDisponibilidad(fecha, horaInicio, canchaId)

    return NextResponse.json({
      success: true,
      data: resultado
    })
  } catch (error) {
    console.error('Error al verificar slot:', error)
    return NextResponse.json(
      { success: false, error: 'Error al verificar disponibilidad' },
      { status: 500 }
    )
  }
}
