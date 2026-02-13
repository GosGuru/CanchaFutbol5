import { NextRequest, NextResponse } from 'next/server'

// Credenciales hardcodeadas para MVP
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin2024'
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body

    // Validar credenciales
    if (
      username === ADMIN_CREDENTIALS.username &&
      password === ADMIN_CREDENTIALS.password
    ) {
      return NextResponse.json({
        success: true,
        user: {
          username: ADMIN_CREDENTIALS.username
        }
      })
    }

    return NextResponse.json(
      { success: false, error: 'Credenciales inválidas' },
      { status: 401 }
    )
  } catch {
    return NextResponse.json(
      { success: false, error: 'Error en el servidor' },
      { status: 500 }
    )
  }
}
