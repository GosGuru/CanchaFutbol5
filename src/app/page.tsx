import { HeroSection } from "@/components/landing/hero-section"
import { HorariosPrecios } from "@/components/landing/horarios-precios"
import { Galeria } from "@/components/landing/galeria"
import { Ubicacion } from "@/components/landing/ubicacion"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { WhatsAppButton } from "@/components/layout/whatsapp-button"

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <HorariosPrecios />
        <Galeria />
        <Ubicacion />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  )
}
