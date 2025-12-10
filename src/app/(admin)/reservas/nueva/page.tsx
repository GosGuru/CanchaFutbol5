"use client"

import { FormularioReserva } from "@/components/reservas/formulario-reserva"

export default function NuevaReservaPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Nueva Reserva</h2>
      </div>
      
      <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
        <FormularioReserva />
      </div>
    </div>
  )
}
