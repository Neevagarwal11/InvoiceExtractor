import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { TutorialSection } from "@/components/tutorial-section"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <TutorialSection />
      <Footer />
    </main>
  )
}
