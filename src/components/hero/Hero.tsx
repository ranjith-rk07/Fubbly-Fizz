import { useEffect, useRef, useState, type PointerEvent } from 'react'
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react'
import { useLenis } from 'lenis/react'
import { FLAVOURS } from '@/data/flavours'
import { clamp01, easeInOutCubic, easeOutCubic } from '@/lib/math'
import { useMediaQuery } from '@/lib/hooks'
import { Bubbles } from '@/components/ui'
import { progressToFlavour, REST_P, SEQ_END, TRACK_VH } from './choreography'
import { HeroBackdrops, HeroCans, HeroGrid, HeroPieces, HeroSplash, HeroWords } from './scene'
import { FlavourSwitch, HeroCaptions, HeroEyebrow, HeroProgress } from './ui'

/** Waits for the display font and the first can so the intro never animates fallback glyphs. */
function useIntroReady() {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    let alive = true
    const done = () => alive && setReady(true)
    const fonts = document.fonts
      ? Promise.all([
          document.fonts.load('800 100px "Bricolage Grotesque"'),
          document.fonts.load('italic 400 40px "Instrument Serif"'),
        ])
      : Promise.resolve()
    const img = new Image()
    img.src = FLAVOURS[0].can
    Promise.all([fonts, img.decode().catch(() => undefined)]).then(() => requestAnimationFrame(done), done)
    const fallback = window.setTimeout(done, 1800)
    return () => {
      alive = false
      window.clearTimeout(fallback)
    }
  }, [])
  return ready
}

export function Hero() {
  const trackRef = useRef<HTMLElement>(null)
  const reduce = !!useReducedMotion()
  const portrait = useMediaQuery('(max-aspect-ratio: 4/5)')
  const ready = useIntroReady()
  const lenis = useLenis()

  const { scrollYProgress } = useScroll({ target: trackRef, offset: ['start start', 'end end'] })
  const smooth = useSpring(scrollYProgress, { stiffness: 170, damping: 34, mass: 0.4, restDelta: 0.00005 })
  const progress = reduce ? scrollYProgress : smooth
  const f = useTransform(progress, progressToFlavour)

  // Final viewport of the track: the stage recedes while the content sheet slides over it.
  const cover = useTransform(progress, (v) => clamp01((v - SEQ_END) / (1 - SEQ_END)))
  const stageScale = useTransform(cover, (c) => (reduce ? 1 : 1 - 0.08 * easeOutCubic(c)))
  const stageRadius = useTransform(cover, (c) => `${(reduce ? 0 : c) * 48}px`)
  const dim = useTransform(cover, (c) => c * 0.5)
  const ink = useTransform(f, [0, 1, 2], FLAVOURS.map((flavour) => flavour.palette.ink))

  const [active, setActive] = useState(0)
  useMotionValueEvent(f, 'change', (v) => setActive(Math.round(v)))

  // Pointer parallax (mouse only).
  const px = useMotionValue(0)
  const py = useMotionValue(0)
  const spx = useSpring(px, { stiffness: 50, damping: 16 })
  const spy = useSpring(py, { stiffness: 50, damping: 16 })
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse' || reduce) return
    px.set((e.clientX / window.innerWidth) * 2 - 1)
    py.set((e.clientY / window.innerHeight) * 2 - 1)
  }
  const onPointerLeave = () => {
    px.set(0)
    py.set(0)
  }

  const trackMetrics = () => {
    const track = trackRef.current
    if (!track) return null
    const top = track.getBoundingClientRect().top + window.scrollY
    return { top, total: track.offsetHeight - window.innerHeight }
  }

  const scrollToFlavour = (i: number) => {
    const m = trackMetrics()
    if (!m) return
    const target = m.top + REST_P[i] * m.total + (i === 0 ? 0 : 2)
    if (lenis) lenis.scrollTo(target, { duration: 1.6, easing: easeInOutCubic })
    else window.scrollTo({ top: target, behavior: reduce ? 'auto' : 'smooth' })
  }

  // Gentle snapping: if scrolling stops mid-transition, glide on to the next flavour
  // in the direction of travel so the stage always settles on a composed scene.
  useEffect(() => {
    if (!lenis || reduce) return
    let timer = 0
    let touching = false
    let snapping = false

    const settle = () => {
      if (touching || snapping) return
      const m = trackMetrics()
      if (!m) return
      const p = (window.scrollY - m.top) / m.total
      if (p <= 0.002 || p >= SEQ_END) return
      const v = progressToFlavour(p)
      const base = Math.floor(v)
      const frac = v - base
      if (frac < 0.03 || frac > 0.97) return
      const target = lenis.direction < 0 ? base : base + 1
      snapping = true
      lenis.scrollTo(m.top + REST_P[target] * m.total + 2, {
        duration: 1.1,
        easing: easeOutCubic,
        onComplete: () => (snapping = false),
      })
      window.setTimeout(() => (snapping = false), 1400)
    }
    const schedule = () => {
      window.clearTimeout(timer)
      if (!snapping) timer = window.setTimeout(settle, 200)
    }
    const onTouchStart = () => {
      touching = true
      window.clearTimeout(timer)
    }
    const onTouchEnd = () => {
      touching = false
      schedule()
    }

    const off = lenis.on('scroll', schedule)
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchend', onTouchEnd, { passive: true })
    return () => {
      off()
      window.clearTimeout(timer)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchend', onTouchEnd)
    }
  }, [lenis, reduce])

  const shared = { f, reduce, ready }
  const pointer = { px: spx, py: spy }

  return (
    <section
      ref={trackRef}
      id="top"
      aria-label="Meet the flavours"
      className="relative bg-ink"
      style={{ height: `${TRACK_VH}vh` }}
    >
      <motion.div
        className="hero-stage sticky top-0 h-dvh overflow-hidden will-change-transform"
        style={{ scale: stageScale, borderRadius: stageRadius }}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
      >
        <h1 className="sr-only">Fubbly Fizz: premium probiotic soda in Raw Mango, Jeera and Masala</h1>

        <HeroBackdrops f={f} reduce={reduce} />
        <HeroGrid f={f} />
        <HeroWords stacked={portrait} {...shared} />
        <HeroSplash part="back" {...shared} />
        <HeroPieces layer="back" portrait={portrait} {...shared} {...pointer} />
        <HeroCans active={active} {...shared} {...pointer} />
        <HeroPieces layer="front" portrait={portrait} {...shared} {...pointer} />
        <HeroSplash part="front" {...shared} />
        <Bubbles count={portrait ? 14 : 26} />

        <motion.div className="pointer-events-none absolute inset-0 [&_button]:pointer-events-auto" style={{ color: ink }}>
          <HeroEyebrow ready={ready} reduce={reduce} />
          <HeroCaptions f={f} active={active} ready={ready} reduce={reduce} />
          <HeroProgress progress={progress} active={active} ready={ready} reduce={reduce} />
          <FlavourSwitch active={active} ink={ink} onSelect={scrollToFlavour} ready={ready} reduce={reduce} />
        </motion.div>

        <motion.div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-ink" style={{ opacity: dim }} />
      </motion.div>
    </section>
  )
}
