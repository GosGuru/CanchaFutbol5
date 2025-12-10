import { NextRequest, NextResponse } from 'next/server'
import { getReservas, createReserva } from '@/lib/storage'
import { validarReserva } from '@/lib/validations'
import { getConfiguracion } from '@/lib/storage'
import type { Reserva, FiltrosReservas } from '@/types'

// GET /api/reservas - Listar todas las reservas con filtros opcionales
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const fecha = searchParams.get('fecha')
    const canchaId = searchParams.get('cancha')
    const estado = searchParams.get('estado')
    const busqueda = searchParams.get('busqueda')

    let reservas = getReservas()

    // Aplicar filtros
    if (fecha) {
      reservas = reservas.filter(r => {
        const fechaReserva = new Date(r.fecha).toISOString().split('T')[0]
        const fechaFiltro = new Date(fecha).toISOString().split('T')[0]
        return fechaReserva === fechaFiltro
      })
    }

    if (canchaId) {
      reservas = reservas.filter(r => r.canchaId === Number(canchaId))
    }

    if (estado) {
      reservas = reservas.filter(r => r.estado === estado)
    }

    if (busqueda) {
      const termino = busqueda.toLowerCase()
      reservas = reservas.filter(r =>
        r.cliente.nombre.toLowerCase().includes(termino) ||
        r.cliente.telefono.includes(termino) ||
        r.cliente.email?.toLowerCase().includes(termino)
      )
    }

    // Ordenar por fecha y hora (más recientes primero)
    reservas.sort((a, b) => {
      const fechaA = new Date(`${a.fecha}T${a.horaInicio}`)
      const fechaB = new Date(`${b.fecha}T${b.horaInicio}`)
      return fechaB.getTime() - fechaA.getTime()
    })

    return NextResponse.json({
      success: true,
      data: reservas,
      total: reservas.length
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Error al obtener reservas' },
      { status: 500 }
    )
  }
}

// POST /api/reservas - Crear nueva reserva
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Obtener precio por defecto si no se proporciona
    const config = getConfiguracion()
    const precio = body.precio || config.precioPorHora

    const datosReserva = {
      ...body,
      precio,
      estado: body.estado || 'pendiente'
    }

    // Validar reserva
    const validacion = validarReserva(datosReserva)
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

    // Crear reserva
    const nuevaReserva = createReserva(datosReserva)

    return NextResponse.json({
      success: true,
      data: nuevaReserva
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating reserva:', error)
    return NextResponse.json(
      { success: false, error: 'Error al crear reserva' },
      { status: 500 }
    )
  }
}
