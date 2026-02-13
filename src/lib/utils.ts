import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const DEFAULT_LOCALE = "es-ES"
const DEFAULT_CURRENCY = "EUR"

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat(DEFAULT_LOCALE, {
    style: "currency",
    currency: DEFAULT_CURRENCY,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString(DEFAULT_LOCALE, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export function formatTime(time: string): string {
  return time
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleString(DEFAULT_LOCALE, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function getHorasDisponibles(
  horaInicio: string,
  horaFin: string,
  duracionSlot: number = 60
): string[] {
  const horas: string[] = []
  const [inicioHora, inicioMin] = horaInicio.split(':').map(Number)
  const [finHora, finMin] = horaFin.split(':').map(Number)
  
  const inicioMinutos = inicioHora * 60 + inicioMin
  const finMinutos = finHora * 60 + finMin
  
  for (let minutos = inicioMinutos; minutos < finMinutos; minutos += duracionSlot) {
    const hora = Math.floor(minutos / 60)
    const min = minutos % 60
    horas.push(`${hora.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`)
  }
  
  return horas
}
