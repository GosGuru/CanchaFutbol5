"use client"

import { useState } from "react"
import { Calendar, dateFnsLocalizer, View, Views } from "react-big-calendar"
import { format, parse, startOfWeek, getDay } from "date-fns"
import { es } from "date-fns/locale"
import "react-big-calendar/lib/css/react-big-calendar.css"
import { Reserva } from "@/types"
import { cn } from "@/lib/utils"

const locales = {
  'es': es,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

interface CalendarioReservasProps {
  reservas: Reserva[]
  onSelectReserva?: (reserva: Reserva) => void
  onSelectSlot?: (slotInfo: { start: Date; end: Date }) => void
}

export function CalendarioReservas({
  reservas,
  onSelectReserva,
  onSelectSlot
}: CalendarioReservasProps) {
  const [view, setView] = useState<View>(Views.WEEK)
  const [date, setDate] = useState(new Date())

  // Transformar reservas al formato de react-big-calendar
  const events = reservas.map(reserva => {
    const start = new Date(`${reserva.fecha}T${reserva.horaInicio}`)
    const end = new Date(`${reserva.fecha}T${reserva.horaFin}`)
    
    return {
      id: reserva.id,
      title: `${reserva.cliente.nombre} (${reserva.canchaId === 1 ? 'C1' : 'C2'})`,
      start,
      end,
      resource: reserva,
      canchaId: reserva.canchaId,
      estado: reserva.estado
    }
  })

  const eventStyleGetter = (event: any) => {
    let backgroundColor = '#3b82f6' // blue-500 default
    
    if (event.canchaId === 1) {
      backgroundColor = '#10b981' // emerald-500
    } else if (event.canchaId === 2) {
      backgroundColor = '#8b5cf6' // violet-500
    }

    if (event.estado === 'pendiente') {
      backgroundColor = '#f59e0b' // amber-500
    } else if (event.estado === 'cancelada') {
      backgroundColor = '#ef4444' // red-500
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    }
  }

  return (
    <div className="h-[600px] bg-background rounded-md border p-4">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        culture="es"
        messages={{
          next: "Siguiente",
          previous: "Anterior",
          today: "Hoy",
          month: "Mes",
          week: "Semana",
          day: "Día",
          agenda: "Agenda",
          date: "Fecha",
          time: "Hora",
          event: "Evento",
          noEventsInRange: "No hay reservas en este rango",
        }}
        view={view}
        onView={setView}
        date={date}
        onNavigate={setDate}
        min={new Date(0, 0, 0, 8, 0, 0)} // 8:00 AM
        max={new Date(0, 0, 0, 23, 0, 0)} // 11:00 PM
        onSelectEvent={(event) => onSelectReserva?.(event.resource)}
        onSelectSlot={(slotInfo) => onSelectSlot?.(slotInfo)}
        selectable
        eventPropGetter={eventStyleGetter}
      />
    </div>
  )
}
