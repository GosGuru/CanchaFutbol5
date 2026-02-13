import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#22c55e",
};

export const metadata: Metadata = {
  title: {
    default: "Invasor Fútbol 5 | Reserva tu cancha en España",
    template: "%s | Invasor Fútbol 5",
  },
  description: "Reserva tu cancha de fútbol 5. Canchas de césped sintético de primera calidad en España. Reservas online fácil y rápido. ¡Juega con tus amigos!",
  keywords: ["fútbol 5", "cancha", "reservas", "España", "fútbol sala", "alquiler cancha", "futbol 5 españa", "cancha sintetica"],
  authors: [{ name: "Invasor Fútbol 5" }],
  creator: "Invasor Fútbol 5",
  publisher: "Invasor Fútbol 5",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Invasor Fútbol 5 | Reserva tu cancha",
    description: "Reserva tu cancha de fútbol 5. Canchas de césped sintético de primera calidad en España.",
    url: "https://canchafutbol5.com",
    siteName: "Invasor Fútbol 5",
    locale: "es_ES",
    type: "website",
    images: [
      {
        url: "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?q=80&w=1200&auto=format&fit=crop",
        width: 1200,
        height: 630,
        alt: "Cancha de Fútbol 5 - Canchas de césped sintético",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Invasor Fútbol 5 | Reserva tu cancha",
    description: "Reserva tu cancha de fútbol 5. Canchas de césped sintético de primera calidad en España.",
    images: ["https://images.unsplash.com/photo-1575361204480-aadea25e6e68?q=80&w=1200&auto=format&fit=crop"],
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Invasor Fútbol 5",
  },
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },
  category: "sports",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          forcedTheme="dark"
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
