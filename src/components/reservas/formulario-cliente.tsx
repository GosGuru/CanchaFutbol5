"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import { User, Phone, Mail, CreditCard, MessageSquare } from "lucide-react"
import type { Cliente } from "@/types"

const clienteSchema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  telefono: z.string()
    .min(8, "El teléfono debe tener al menos 8 dígitos")
    .regex(/^[0-9+\s-]+$/, "Formato de teléfono inválido"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  documento: z.string().optional(),
  notas: z.string().optional(),
})

type ClienteFormData = z.infer<typeof clienteSchema>

interface FormularioClienteProps {
  onSubmit: (cliente: Cliente) => void
  datosIniciales?: Cliente | null
}

export function FormularioCliente({ onSubmit, datosIniciales }: FormularioClienteProps) {
  const form = useForm<ClienteFormData>({
    resolver: zodResolver(clienteSchema),
    defaultValues: {
      nombre: datosIniciales?.nombre || "",
      telefono: datosIniciales?.telefono || "",
      email: datosIniciales?.email || "",
      documento: datosIniciales?.documento || datosIniciales?.cedula || "",
      notas: "",
    },
  })

  const handleSubmit = (data: ClienteFormData) => {
    const cliente: Cliente = {
      nombre: data.nombre,
      telefono: data.telefono,
      email: data.email || undefined,
      documento: data.documento || undefined,
    }
    onSubmit(cliente)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Nombre */}
          <FormField
            control={form.control}
            name="nombre"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Nombre completo *
                </FormLabel>
                <FormControl>
                  <Input placeholder="Tu nombre" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Teléfono */}
          <FormField
            control={form.control}
            name="telefono"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Teléfono *
                </FormLabel>
                <FormControl>
                  <Input placeholder="099 123 456" {...field} />
                </FormControl>
                <FormDescription className="text-xs">
                  Te contactaremos por WhatsApp
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email (opcional)
                </FormLabel>
                <FormControl>
                  <Input type="email" placeholder="tu@email.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Documento */}
          <FormField
            control={form.control}
            name="documento"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  DNI/NIE (opcional)
                </FormLabel>
                <FormControl>
                  <Input placeholder="12345678Z" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Notas */}
        <FormField
          control={form.control}
          name="notas"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Notas adicionales (opcional)
              </FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Algún comentario o pedido especial..."
                  className="resize-none"
                  rows={3}
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" size="lg" className="w-full">
          Continuar a confirmación
        </Button>
      </form>
    </Form>
  )
}
