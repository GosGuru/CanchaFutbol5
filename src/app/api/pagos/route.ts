import { NextResponse } from "next/server"

// Simulador de pasarela de pago para desarrollo
// En producción, esto se conectaría con MercadoPago u otro proveedor

interface PagoRequest {
  monto: number
  metodoPago: "mercadopago" | "transferencia" | "efectivo"
  tarjeta?: {
    numero: string
    nombre: string
    vencimiento: string
    cvv: string
  }
  reserva: {
    fecha: string
    horaInicio: string
    horaFin: string
    canchaId: 1 | 2
    cliente: {
      nombre: string
      telefono: string
      email?: string
    }
  }
}

interface PagoResponse {
  success: boolean
  referencia?: string
  mensaje: string
  estado: "aprobado" | "pendiente" | "rechazado"
}

export async function POST(request: Request) {
  try {
    const body: PagoRequest = await request.json()

    // Validar datos requeridos
    if (!body.monto || body.monto <= 0) {
      return NextResponse.json(
        { success: false, mensaje: "Monto inválido", estado: "rechazado" },
        { status: 400 }
      )
    }

    if (!body.metodoPago) {
      return NextResponse.json(
        { success: false, mensaje: "Método de pago requerido", estado: "rechazado" },
        { status: 400 }
      )
    }

    // Simular procesamiento según método de pago
    let response: PagoResponse

    switch (body.metodoPago) {
      case "mercadopago":
        // Simular validación de tarjeta
        if (!body.tarjeta) {
          return NextResponse.json(
            { success: false, mensaje: "Datos de tarjeta requeridos", estado: "rechazado" },
            { status: 400 }
          )
        }

        // Validar número de tarjeta (simulado)
        const numeroLimpio = body.tarjeta.numero.replace(/\s/g, "")
        if (numeroLimpio.length !== 16) {
          return NextResponse.json(
            { success: false, mensaje: "Número de tarjeta inválido", estado: "rechazado" },
            { status: 400 }
          )
        }

        // Simular algunos casos de rechazo para testing
        if (numeroLimpio.startsWith("0000")) {
          return NextResponse.json(
            { success: false, mensaje: "Tarjeta rechazada - Fondos insuficientes", estado: "rechazado" },
            { status: 402 }
          )
        }

        if (numeroLimpio.startsWith("1111")) {
          return NextResponse.json(
            { success: false, mensaje: "Tarjeta rechazada - Tarjeta vencida", estado: "rechazado" },
            { status: 402 }
          )
        }

        // Pago exitoso
        response = {
          success: true,
          referencia: `MP-${Date.now().toString(36).toUpperCase()}`,
          mensaje: "Pago aprobado por MercadoPago",
          estado: "aprobado"
        }
        break

      case "transferencia":
        // Transferencia queda pendiente de confirmación
        response = {
          success: true,
          referencia: `TF-${Date.now().toString(36).toUpperCase()}`,
          mensaje: "Transferencia registrada - Pendiente de confirmación",
          estado: "pendiente"
        }
        break

      case "efectivo":
        // Pago en efectivo siempre queda pendiente
        response = {
          success: true,
          referencia: `EF-${Date.now().toString(36).toUpperCase()}`,
          mensaje: "Reserva confirmada - Pago pendiente en cancha",
          estado: "pendiente"
        }
        break

      default:
        return NextResponse.json(
          { success: false, mensaje: "Método de pago no soportado", estado: "rechazado" },
          { status: 400 }
        )
    }

    // Simular delay de procesamiento (100-500ms)
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 400))

    return NextResponse.json(response)

  } catch (error) {
    console.error("Error procesando pago:", error)
    return NextResponse.json(
      { 
        success: false, 
        mensaje: "Error interno del servidor", 
        estado: "rechazado" 
      },
      { status: 500 }
    )
  }
}

// GET para verificar estado de un pago
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const referencia = searchParams.get("referencia")

  if (!referencia) {
    return NextResponse.json(
      { error: "Referencia de pago requerida" },
      { status: 400 }
    )
  }

  // Simular búsqueda del estado del pago
  // En producción, esto consultaría la base de datos o el proveedor de pago

  const tipo = referencia.split("-")[0]
  
  let estado: "aprobado" | "pendiente" | "rechazado" = "pendiente"
  
  if (tipo === "MP") {
    estado = "aprobado"
  } else if (tipo === "TF" || tipo === "EF") {
    estado = "pendiente"
  }

  return NextResponse.json({
    referencia,
    estado,
    mensaje: estado === "aprobado" 
      ? "Pago confirmado" 
      : "Pago pendiente de confirmación"
  })
}
