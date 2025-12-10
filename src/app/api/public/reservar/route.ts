import { NextRequest, NextResponse } from 'next/server'
import { crearReservaPublica, verificarDisponibilidad } from '@/lib/data-service'
import { z } from 'zod'

// Schema de validación para la reserva
const reservaSchema = z.object({
  canchaId: z.number().positive(),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido'),
  horaInicio: z.string().regex(/^\d{2}:\d{2}$/, 'Formato de hora inválido'),
  horaFin: z.string().regex(/^\d{2}:\d{2}$/, 'Formato de hora inválido'),
  cliente: z.object({
    nombre: z.string().min(2, 'Nombre muy corto').max(100),
    telefono: z.string().min(8, 'Teléfono inválido').max(20),
    email: z.string().email('Email inválido').optional().or(z.literal('')),
  }),
  precio: z.number().positive(),
  notas: z.string().max(500).optional()
})

/**
 * POST /api/public/reservar
 * 
 * Crear una reserva desde la landing page
 * No requiere autenticación
 * 
 * Body:
 * {
 *   canchaId: number,
 *   fecha: "YYYY-MM-DD",
 *   horaInicio: "HH:mm",
 *   horaFin: "HH:mm",
 *   cliente: { nombre, telefono, email? },
 *   precio: number,
 *   notas?: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validar datos
    const validacion = reservaSchema.safeParse(body)
    if (!validacion.success) {
      const errores = validacion.error.issues.map((e) => ({
        campo: e.path.map(String).join('.'),
        mensaje: e.message
      }))
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Datos inválidos',
          detalles: errores
        },
        { status: 400 }
      )
    }

    const datos = validacion.data

    // Verificar disponibilidad antes de crear
    const { disponible, motivo } = verificarDisponibilidad(
      datos.fecha,
      datos.horaInicio,
      datos.canchaId
    )

    if (!disponible) {
      return NextResponse.json(
        { 
          success: false, 
          error: motivo || 'Horario no disponible'
        },
        { status: 409 } // Conflict
      )
    }

    // Crear la reserva
    const resultado = await crearReservaPublica({
      canchaId: datos.canchaId,
      fecha: datos.fecha,
      horaInicio: datos.horaInicio,
      horaFin: datos.horaFin,
      cliente: {
        nombre: datos.cliente.nombre,
        telefono: datos.cliente.telefono,
        email: datos.cliente.email || undefined
      },
      precio: datos.precio,
      origen: 'web',
      notas: datos.notas
    })

    if (!resultado.success) {
      return NextResponse.json(
        { success: false, error: resultado.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        id: resultado.reserva?.id,
        mensaje: '¡Reserva creada exitosamente!',
        estado: 'pendiente',
        detalles: {
          fecha: datos.fecha,
          hora: `${datos.horaInicio} - ${datos.horaFin}`,
          cancha: datos.canchaId,
          precio: datos.precio
        }
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Error al crear reserva:', error)
    return NextResponse.json(
      { success: false, error: 'Error al procesar la reserva' },
      { status: 500 }
    )
  }
}
