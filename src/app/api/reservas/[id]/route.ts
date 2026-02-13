import { NextRequest, NextResponse } from 'next/server'
import { getReserva, updateReserva } from '@/lib/storage'
import { validarReserva } from '@/lib/validations'

type RouteParams = {
  params: Promise<{ id: string }>
}

// GET /api/reservas/[id] - Obtener una reserva
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params
    const reserva = getReserva(id)

    if (!reserva) {
      return NextResponse.json(
        { success: false, error: 'Reserva no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: reserva
    })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Error al obtener reserva' },
      { status: 500 }
    )
  }
}

// PUT /api/reservas/[id] - Actualizar una reserva
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params
    const body = await request.json()

    // Verificar que la reserva existe
    const reservaExistente = getReserva(id)
    if (!reservaExistente) {
      return NextResponse.json(
        { success: false, error: 'Reserva no encontrada' },
        { status: 404 }
      )
    }

    // Si se están actualizando datos críticos, validar
    const datosCriticos = ['canchaId', 'fecha', 'horaInicio', 'horaFin', 'cliente']
    const seCambianDatosCriticos = datosCriticos.some(key => key in body)

    if (seCambianDatosCriticos) {
      const datosCompletos = { ...reservaExistente, ...body }
      const validacion = validarReserva(datosCompletos, id)
      
      if (!validacion.valido) {
        return NextResponse.json(
          {
            success: false,
            error: 'Validación fallida',
            errores: validacion.errores
          },
          { status: 400 }
        )
      }
    }

    // Actualizar reserva
    const reservaActualizada = updateReserva(id, body)

    return NextResponse.json({
      success: true,
      data: reservaActualizada
    })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Error al actualizar reserva' },
      { status: 500 }
    )
  }
}

// DELETE /api/reservas/[id] - Eliminar/cancelar una reserva
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params
    
    // En lugar de eliminar, marcamos como cancelada
    const reservaActualizada = updateReserva(id, { estado: 'cancelada' })

    if (!reservaActualizada) {
      return NextResponse.json(
        { success: false, error: 'Reserva no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Reserva cancelada exitosamente',
      data: reservaActualizada
    })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Error al cancelar reserva' },
      { status: 500 }
    )
  }
}
