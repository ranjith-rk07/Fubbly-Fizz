import 'lenis/dist/lenis.css'
import { ReactLenis } from 'lenis/react'
import { MotionConfig } from 'motion/react'
import { Nav } from '@/components/Nav'
import { Hero } from '@/components/hero/Hero'
import { Sheet } from '@/components/Sheet'
import { FlavourIndex } from '@/components/FlavourIndex'
import { TastingNotes } from '@/components/TastingNotes'
import { InsideTheCan } from '@/components/InsideTheCan'
import { Footer } from '@/components/Footer'
import { Grain } from '@/components/ui'

export default function App() {
  return (
    <ReactLenis root options={{ lerp: 0.1, smoothWheel: true, autoRaf: true, anchors: { duration: 1.4 } }}>
      <MotionConfig reducedMotion="user">
        <Nav />
        <main>
          <Hero />
          <Sheet>
            <FlavourIndex />
            <TastingNotes />
            <InsideTheCan />
          </Sheet>
        </main>
        <Footer />
        <Grain />
      </MotionConfig>
    </ReactLenis>
  )
}
