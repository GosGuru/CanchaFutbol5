import { Reserva, Configuracion } from '@/types'
import { getReservas, getConfiguracion } from './storage'

// Validar teléfono uruguayo
export function validarTelefonoUruguayo(telefono: string): boolean {
  // Formato: +598 XX XXX XXX o variaciones
  const regex = /^(\+?598)?[\s\-]?([0-9]{2})[\s\-]?([0-9]{3})[\s\-]?([0-9]{3,4})$/
  return regex.test(telefono.trim())
}

// Validar que la fecha sea futura
export function validarFechaFutura(fecha: string): boolean {
  const fechaReserva = new Date(fecha)
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  
  return fechaReserva >= hoy
}

// Validar que el horario esté dentro del horario de apertura
export function validarDentroHorario(
  horaInicio: string,
  horaFin: string,
  config: Configuracion
): { valido: boolean; mensaje?: string } {
  const [inicioHora, inicioMin] = horaInicio.split(':').map(Number)
  const [finHora, finMin] = horaFin.split(':').map(Number)
  const [aperturaHora, aperturaMin] = config.horarioApertura.split(':').map(Number)
  const [cierreHora, cierreMin] = config.horarioCierre.split(':').map(Number)
  
  const inicioMinutos = inicioHora * 60 + inicioMin
  const finMinutos = finHora * 60 + finMin
  const aperturaMinutos = aperturaHora * 60 + aperturaMin
  const cierreMinutos = cierreHora * 60 + cierreMin
  
  if (inicioMinutos < aperturaMinutos) {
    return {
      valido: false,
      mensaje: `El horario de inicio debe ser después de las ${config.horarioApertura}`
    }
  }
  
  if (finMinutos > cierreMinutos) {
    return {
      valido: false,
      mensaje: `El horario de fin debe ser antes de las ${config.horarioCierre}`
    }
  }
  
  if (inicioMinutos >= finMinutos) {
    return {
      valido: false,
      mensaje: 'El horario de inicio debe ser anterior al horario de fin'
    }
  }
  
  return { valido: true }
}

// Validar que no haya conflicto de horarios
export function validarHorarioDisponible(
  canchaId: 1 | 2,
  fecha: string,
  horaInicio: string,
  horaFin: string,
  excludeReservaId?: string
): { disponible: boolean; mensaje?: string } {
  const reservas = getReservas()
  
  const [inicioHora, inicioMin] = horaInicio.split(':').map(Number)
  const [finHora, finMin] = horaFin.split(':').map(Number)
  
  const inicioMinutos = inicioHora * 60 + inicioMin
  const finMinutos = finHora * 60 + finMin
  
  // Filtrar reservas de la misma cancha y fecha
  const reservasMismoDia = reservas.filter(r => {
    if (r.id === excludeReservaId) return false
    if (r.canchaId !== canchaId) return false
    if (r.estado === 'cancelada') return false
    
    const fechaReserva = new Date(r.fecha).toISOString().split('T')[0]
    const fechaBusqueda = new Date(fecha).toISOString().split('T')[0]
    
    return fechaReserva === fechaBusqueda
  })
  
  // Verificar conflictos
  for (const reserva of reservasMismoDia) {
    const [rInicioHora, rInicioMin] = reserva.horaInicio.split(':').map(Number)
    const [rFinHora, rFinMin] = reserva.horaFin.split(':').map(Number)
    
    const rInicioMinutos = rInicioHora * 60 + rInicioMin
    const rFinMinutos = rFinHora * 60 + rFinMin
    
    // Verificar solapamiento
    const haySolapamiento = 
      (inicioMinutos >= rInicioMinutos && inicioMinutos < rFinMinutos) ||
      (finMinutos > rInicioMinutos && finMinutos <= rFinMinutos) ||
      (inicioMinutos <= rInicioMinutos && finMinutos >= rFinMinutos)
    
    if (haySolapamiento) {
      return {
        disponible: false,
        mensaje: `Ya existe una reserva de ${reserva.horaInicio} a ${reserva.horaFin}`
      }
    }
  }
  
  return { disponible: true }
}

// Validar día bloqueado
export function validarDiaNoBloquedo(fecha: string, config: Configuracion): boolean {
  const fechaBusqueda = new Date(fecha).toISOString().split('T')[0]
  return !config.diasBloqueados.some(dia => {
    const diaBloquead = new Date(dia).toISOString().split('T')[0]
    return diaBloquead === fechaBusqueda
  })
}

// Validación completa de reserva
export function validarReserva(
  data: Partial<Reserva>,
  excludeReservaId?: string
): { valido: boolean; errores: string[] } {
  const errores: string[] = []
  
  // Validar campos requeridos
  if (!data.canchaId) errores.push('La cancha es requerida')
  if (!data.fecha) errores.push('La fecha es requerida')
  if (!data.horaInicio) errores.push('La hora de inicio es requerida')
  if (!data.horaFin) errores.push('La hora de fin es requerida')
  if (!data.cliente?.nombre) errores.push('El nombre del cliente es requerido')
  if (!data.cliente?.telefono) errores.push('El teléfono del cliente es requerido')
  
  if (errores.length > 0) {
    return { valido: false, errores }
  }
  
  // Validar teléfono
  if (data.cliente?.telefono && !validarTelefonoUruguayo(data.cliente.telefono)) {
    errores.push('El teléfono debe ser un número uruguayo válido (+598 XX XXX XXX)')
  }
  
  // Validar fecha futura
  if (data.fecha && !validarFechaFutura(data.fecha)) {
    errores.push('La fecha debe ser hoy o en el futuro')
  }
  
  // Obtener configuración
  const config = getConfiguracion()
  
  // Validar horario dentro de apertura
  if (data.horaInicio && data.horaFin) {
    const horarioValido = validarDentroHorario(data.horaInicio, data.horaFin, config)
    if (!horarioValido.valido) {
      errores.push(horarioValido.mensaje!)
    }
  }
  
  // Validar día no bloqueado
  if (data.fecha && !validarDiaNoBloquedo(data.fecha, config)) {
    errores.push('Este día está bloqueado para reservas')
  }
  
  // Validar disponibilidad de horario
  if (data.canchaId && data.fecha && data.horaInicio && data.horaFin) {
    const disponibilidad = validarHorarioDisponible(
      data.canchaId,
      data.fecha,
      data.horaInicio,
      data.horaFin,
      excludeReservaId
    )
    if (!disponibilidad.disponible) {
      errores.push(disponibilidad.mensaje!)
    }
  }
  
  return {
    valido: errores.length === 0,
    errores
  }
}
