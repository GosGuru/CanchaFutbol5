# 🏟️ Invasor Fútbol 5 - Documentación del Proyecto

> Sistema de reservas para canchas de fútbol 5 - MVP

---

## 📋 Información General

| Campo | Valor |
|-------|-------|
| **Nombre** | Invasor Fútbol 5 |
| **Tipo** | Sistema de reservas deportivas |
| **Ubicación** | Uruguay |
| **Instagram** | [@invasorfutbol5](https://www.instagram.com/invasorfutbol5/) |
| **Estado** | MVP en desarrollo |

---

## 🛠️ Stack Tecnológico

### Core
- **Framework**: Next.js 16 (App Router)
- **Lenguaje**: TypeScript
- **Runtime**: Bun
- **React**: 19.2.0

### Estilos y UI
- **CSS**: Tailwind CSS 4
- **Componentes**: shadcn/ui + Animate UI
- **Iconos**: Lucide React
- **Tema**: Modo oscuro únicamente

### Formularios y Validación
- **Forms**: React Hook Form 7
- **Validación**: Zod 4
- **Resolver**: @hookform/resolvers

### Calendario y Fechas
- **Calendario**: react-big-calendar
- **Date Picker**: react-day-picker
- **Utilidades**: date-fns

### Estado y Almacenamiento
- **Persistencia**: LocalStorage (MVP)
- **Notificaciones**: Sonner

---

## 🎨 Identidad Visual

### Paleta de Colores (Modo Oscuro)

```css
/* Colores principales - Inspirados en fútbol y energía deportiva */
--background: #0a0a0a;           /* Negro profundo */
--foreground: #fafafa;           /* Blanco */

/* Acento principal - Verde cancha */
--primary: #22c55e;              /* Verde vibrante */
--primary-hover: #16a34a;        /* Verde oscuro */
--primary-foreground: #000000;   /* Negro sobre verde */

/* Acento secundario - Energía */
--accent: #f97316;               /* Naranja energético */
--accent-hover: #ea580c;

/* Superficies */
--card: #171717;                 /* Gris oscuro */
--card-hover: #262626;
--muted: #404040;
--muted-foreground: #a3a3a3;

/* Bordes */
--border: #262626;
--ring: #22c55e;

/* Estados */
--success: #22c55e;              /* Verde - Disponible */
--warning: #eab308;              /* Amarillo - Pocas plazas */
--destructive: #ef4444;          /* Rojo - Ocupado/Error */
--info: #3b82f6;                 /* Azul - Información */
```

### Tipografía

| Uso | Fuente | Peso |
|-----|--------|------|
| **Headings** | Inter | 600-700 (Semibold-Bold) |
| **Body** | Inter | 400-500 (Regular-Medium) |
| **Monospace** | JetBrains Mono | 400 |

### Estilo Visual
- **Enfoque**: Moderno + Deportivo/Energético
- **Características**:
  - Bordes redondeados (8-12px)
  - Sombras sutiles
  - Animaciones fluidas (Animate UI)
  - Glassmorphism sutil en cards
  - Gradientes en hero y CTAs

---

## 👥 Público Objetivo

### Usuario 1: Cliente Final
- **Perfil**: Persona que quiere reservar cancha para jugar fútbol 5
- **Dispositivo principal**: Móvil (80%+)
- **Necesidades**:
  - Ver disponibilidad en tiempo real
  - Reservar rápido (3 clicks máximo)
  - Confirmar por WhatsApp
  - Ver ubicación y precios

### Usuario 2: Administrador
- **Perfil**: Dueño/encargado de la cancha
- **Dispositivo**: Desktop/Tablet
- **Necesidades**:
  - Gestionar reservas
  - Ver calendario completo
  - Configurar horarios y precios
  - Ver estadísticas

---

## 🧭 Arquitectura de Información

### Estructura de Rutas

```
/ (Landing Page - Pública)
├── Hero con CTA
├── Horarios y Precios
├── Galería
├── Ubicación
└── Contacto WhatsApp

/reservar (Flujo de reserva - Público)
├── Selección de fecha
├── Selección de horario disponible
├── Formulario de datos
└── Confirmación

/login (Autenticación Admin)

/(admin) - Rutas protegidas
├── /dashboard (Estadísticas)
├── /reservas (Lista y calendario)
├── /reservas/nueva (Nueva reserva manual)
└── /configuracion (Horarios, precios, cancha)
```

---

## 🎯 Principios UX (Nielsen Heuristics)

### 1. Visibilidad del Estado del Sistema
- Indicadores de carga en todas las acciones
- Feedback visual inmediato al seleccionar horarios
- Estados claros: Disponible (verde), Ocupado (rojo), Pocas plazas (amarillo)
- Toast notifications para confirmaciones

### 2. Coincidencia con el Mundo Real
- Lenguaje coloquial uruguayo
- Calendario visual tipo agenda de cancha
- Horarios en formato 24h (estándar local)
- Precios en pesos uruguayos ($UYU)

### 3. Control y Libertad del Usuario
- Botón "Cancelar" siempre visible
- Poder modificar selección antes de confirmar
- Navegación clara con breadcrumbs
- Posibilidad de volver atrás en el flujo

### 4. Consistencia y Estándares
- Botones primarios siempre verdes
- Iconografía consistente (Lucide)
- Patrones de interacción familiares
- Responsive breakpoints estándar

### 5. Prevención de Errores
- Deshabilitar horarios no disponibles
- Validación en tiempo real de formularios
- Confirmación antes de acciones destructivas
- Campos con formato automático (teléfono, cédula)

### 6. Reconocimiento sobre Recuerdo
- Resumen visible de la reserva seleccionada
- Etiquetas claras en formularios
- Historial de reservas accesible
- Autocompletado cuando sea posible

### 7. Flexibilidad y Eficiencia
- Accesos directos para admin frecuente
- Filtros rápidos en calendario
- WhatsApp floating button
- Reserva rápida para clientes recurrentes

### 8. Diseño Estético y Minimalista
- Solo información esencial visible
- Jerarquía visual clara
- Espaciado generoso
- Sin decoraciones innecesarias

### 9. Ayuda para Errores
- Mensajes de error claros y específicos
- Sugerencias de solución
- Campos con error resaltados
- No usar códigos técnicos

### 10. Ayuda y Documentación
- Tooltips en funciones complejas
- FAQ en landing (opcional futuro)
- Contacto WhatsApp siempre accesible

---

## 📱 Diseño Mobile-First

### Breakpoints
```css
/* Mobile first */
sm: 640px   /* Móvil grande */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Desktop grande */
```

### Consideraciones Móvil
- Touch targets mínimo 44x44px
- Botones de acción en zona inferior (pulgar)
- Scroll vertical preferido
- Menú hamburguesa en móvil
- WhatsApp button flotante

---

## 📦 Componentes Animate UI a Utilizar

### Recomendados para el proyecto:
1. **Hero Section**: Background con gradiente animado
2. **Buttons**: Con hover animations
3. **Cards**: Con entrada animada (stagger)
4. **Calendar**: Transiciones suaves
5. **Modal/Dialog**: Con backdrop blur
6. **Toast**: Notificaciones animadas
7. **Loading States**: Skeletons y spinners
8. **Icons**: Lucide animados

---

## 🗂️ Estructura de Datos (LocalStorage)

### Reservas
```typescript
interface Reserva {
  id: string;
  fecha: string;           // ISO date
  horaInicio: string;      // "18:00"
  horaFin: string;         // "19:00"
  cliente: {
    nombre: string;
    telefono: string;
    cedula?: string;
    email?: string;
  };
  estado: 'pendiente' | 'confirmada' | 'cancelada' | 'completada';
  notas?: string;
  creadoEn: string;        // ISO datetime
  actualizadoEn: string;
}
```

### Configuración
```typescript
interface Configuracion {
  cancha: {
    nombre: string;
    direccion: string;
    telefono: string;
    whatsapp: string;
    instagram: string;
  };
  horarios: {
    apertura: string;      // "08:00"
    cierre: string;        // "23:00"
    duracionTurno: number; // minutos (60)
    diasOperacion: number[]; // [1,2,3,4,5,6,0] L-D
  };
  precios: {
    turnoNormal: number;
    turnoNocturno: number; // después de 20:00
    turnoFinDeSemana: number;
  };
  imagenes: string[];      // URLs de galería
}
```

---

## 🚀 Roadmap MVP

### Fase 1 - Landing Page ✅
- [ ] Hero con CTA principal
- [ ] Sección horarios y precios
- [ ] Galería de imágenes
- [ ] Mapa/ubicación
- [ ] Botón WhatsApp flotante
- [ ] Footer con info de contacto

### Fase 2 - Sistema de Reservas
- [ ] Calendario de disponibilidad
- [ ] Flujo de reserva (3 pasos)
- [ ] Confirmación visual
- [ ] Integración WhatsApp

### Fase 3 - Panel Admin
- [ ] Dashboard con estadísticas
- [ ] Gestión de reservas
- [ ] Configuración de cancha
- [ ] Gestión de horarios/precios

### Futuro (Post-MVP)
- Base de datos persistente (Prisma + PostgreSQL)
- Pagos online (MercadoPago)
- Notificaciones automáticas
- Sistema de usuarios/cuentas
- Múltiples canchas/complejos

---

## 📝 Convenciones de Código

### Nombrado
- **Componentes**: PascalCase (`HeroSection.tsx`)
- **Archivos utilidad**: kebab-case (`format-date.ts`)
- **Variables/funciones**: camelCase
- **Constantes**: UPPER_SNAKE_CASE
- **Tipos/Interfaces**: PascalCase con prefijo I opcional

### Estructura de Componentes
```
src/components/
├── ui/              # shadcn/ui base
├── animate-ui/      # Animate UI components
├── layout/          # Header, Footer, Sidebar
├── landing/         # Componentes de landing
├── reservas/        # Componentes de reservas
└── dashboard/       # Componentes admin
```

### Imports
```typescript
// 1. React/Next
import { useState } from 'react';
import Link from 'next/link';

// 2. Librerías externas
import { format } from 'date-fns';

// 3. Componentes UI
import { Button } from '@/components/ui/button';

// 4. Componentes propios
import { HeroSection } from '@/components/landing/hero-section';

// 5. Utilidades/tipos
import { cn } from '@/lib/utils';
import type { Reserva } from '@/types';
```

---

## 🔗 Links Útiles

- [shadcn/ui Docs](https://ui.shadcn.com/)
- [Animate UI Docs](https://animate-ui.com/docs)
- [Tailwind CSS](https://tailwindcss.com/)
- [Next.js App Router](https://nextjs.org/docs/app)
- [React Hook Form](https://react-hook-form.com/)
- [Lucide Icons](https://lucide.dev/)
- [Nielsen Norman Group - 10 Heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/)

---

*Última actualización: 9 de diciembre de 2025*
