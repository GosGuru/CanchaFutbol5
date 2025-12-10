import { NextResponse } from 'next/server'
import { getConfiguracion, getCanchas } from '@/lib/storage'

/**
 * GET /api/public/info
 * 
 * Endpoint público para obtener información del complejo
 * Usado por: Landing page, componentes públicos
 * 
 * No requiere autenticación
 */
export async function GET() {
  try {
    const config = getConfiguracion()
    const canchas = getCanchas().filter(c => c.activa)
    
    // Información pública (sin datos sensibles)
    const infoPublica = {
      complejo: {
        nombre: config.infoComplejo.nombre,
        direccion: config.infoComplejo.direccion,
        telefono: config.infoComplejo.telefono,
        whatsapp: config.infoComplejo.whatsapp,
        instagram: config.infoComplejo.instagram,
        googleMapsUrl: config.infoComplejo.googleMapsUrl,
        googleMapsEmbed: config.infoComplejo.googleMapsEmbed
      },
      horarios: {
        apertura: config.horarioApertura,
        cierre: config.horarioCierre,
        duracionSlot: config.duracionSlot
      },
      precios: {
        base: config.precioPorHora,
        normal: config.precios.turnoNormal,
        nocturno: config.precios.turnoNocturno,
        finDeSemana: config.precios.turnoFinDeSemana
      },
      canchas: canchas.map(c => ({
        id: c.id,
        nombre: c.nombre,
        tipo: c.tipo,
        capacidad: c.capacidad,
        descripcion: c.descripcion,
        caracteristicas: c.caracteristicas,
        precioPorHora: c.precioPorHora || config.precioPorHora,
        precioNocturno: c.precioNocturno || config.precios.turnoNocturno,
        precioFinDeSemana: c.precioFinDeSemana || config.precios.turnoFinDeSemana
      })),
      cantidadCanchas: canchas.length
    }

    return NextResponse.json({
      success: true,
      data: infoPublica
    })
  } catch (error) {
    console.error('Error al obtener info pública:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener información' },
      { status: 500 }
    )
  }
}
