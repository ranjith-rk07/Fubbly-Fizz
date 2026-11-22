import { useEffect, useRef, useState } from 'react'
import {
  animate,
  motion,
  useAnimate,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from 'motion/react'
import { useLenis } from 'lenis/react'
import { FLAVOURS, SKY_PALE } from '@/data/flavours'
import { cn, EASE_OUT_EXPO, range } from '@/lib/math'
import { ArrowIcon, Bubbles, Reveal, RevealLines } from '@/components/ui'
import { useSectionColor } from '@/components/Sheet'
import sky from '@/assets/sky.webp'

// Start → clinked pose for the left, middle and right cans.
const CANS = [
  { x: ['-95%', '0%'], y: ['45%', '0%'], rotate: [-26, 12], left: '19%', z: 1, jolt: -5 },
  { x: ['0%', '0%'], y: ['75%', '-5%'], rotate: [-4, 0], left: '50%', z: 2, jolt: 0 },
  { x: ['95%', '0%'], y: ['45%', '0%'], rotate: [26, -12], left: '81%', z: 1, jolt: 5 },
] as const

const CHIPS = [
  { label: 'Prebiotics', className: 'left-[3%] top-[14%]', dot: '#c8e95a' },
  { label: 'Probiotics', className: 'right-[3%] top-[20%]', dot: '#ffc24b' },
  { label: 'Low sugar', className: 'left-[-2%] top-[46%] max-md:hidden', dot: '#f28dc4' },
  { label: '20 cal', className: 'right-[1%] top-[50%]', dot: '#ff7b66' },
  { label: 'Real fruit', className: 'left-[40%] top-[2%] max-md:hidden', dot: '#86c9ef' },
]

function Chip({ label, dot, className, q, k }: { label: string; dot: string; className: string; q: MotionValue<number>; k: number }) {
  const opacity = useTransform(q, (v) => range(v, 0.62 + k * 0.05, 0.8 + k * 0.05))
  const y = useTransform(q, (v) => (1 - range(v, 0.62 + k * 0.05, 0.85 + k * 0.05)) * 26)
  return (
    <motion.span
      className={cn(
        'absolute z-10 flex items-center gap-2 rounded-full border border-white/45 bg-white/20 px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_30px_-12px_rgba(0,30,90,0.5)] backdrop-blur-md',
        className,
      )}
      style={{ opacity, y }}
    >
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: dot }} />
      {label}
    </motion.span>
  )
}

function Can({ i, q }: { i: number; q: MotionValue<number> }) {
  const config = CANS[i]
  const x = useTransform(q, [0, 1], [...config.x])
  const y = useTransform(q, [0, 1], [...config.y])
  const rotate = useTransform(q, [0, 1], [...config.rotate])
  const flavour = FLAVOURS[i]
  return (
    <motion.div
      className="absolute bottom-0 h-full origin-bottom -translate-x-1/2"
      style={{ left: config.left, zIndex: config.z, x, y, rotate }}
    >
      <div data-jolt={i} className="h-full origin-bottom">
        <img
          src={flavour.can}
          alt={`Fubbly Fizz ${flavour.name}`}
          draggable={false}
          className="h-full w-auto max-w-none drop-shadow-[0_30px_40px_rgba(0,25,80,0.45)]"
        />
      </div>
    </motion.div>
  )
}

/** A one-shot ring and spray of bubbles fired at the moment the cans touch. */
function Burst() {
  const drops = Array.from({ length: 12 }, (_, k) => {
    const angle = (k / 12) * Math.PI * 2
    const dist = 70 + (k % 3) * 30
    return { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist * 0.8 - 20, size: 6 + (k % 4) * 3 }
  })
  return (
    <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-[6%] z-20">
      <motion.span
        className="absolute -left-12 -top-12 h-24 w-24 rounded-full border-2 border-white"
        initial={{ scale: 0.2, opacity: 1 }}
        animate={{ scale: 2.6, opacity: 0 }}
        transition={{ duration: 0.9, ease: EASE_OUT_EXPO }}
      />
      <motion.span
        className="absolute -left-8 -top-8 h-16 w-16 rounded-full bg-white/70 blur-md"
        initial={{ scale: 0.3, opacity: 0.9 }}
        animate={{ scale: 1.8, opacity: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      />
      {drops.map((d, k) => (
        <motion.span
          key={k}
          className="absolute rounded-full border border-white/80 bg-white/30"
          style={{ width: d.size, height: d.size, left: -d.size / 2, top: -d.size / 2 }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 0.4 }}
          animate={{ x: d.x, y: d.y, opacity: 0, scale: 1 }}
          transition={{ duration: 1, ease: EASE_OUT_EXPO, delay: 0.03 * (k % 4) }}
        />
      ))}
    </div>
  )
}

function CountUp({ to }: { to: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.8 })
  const value = useMotionValue(0)
  const [shown, setShown] = useState(0)
  useMotionValueEvent(value, 'change', (v) => setShown(Math.round(v)))
  useEffect(() => {
    if (!inView) return
    const controls = animate(value, to, { duration: 1.6, ease: EASE_OUT_EXPO })
    return () => controls.stop()
  }, [inView, to, value])
  return (
    <span ref={ref} className="tabular-nums">
      {shown}
    </span>
  )
}

const BENEFITS = [
  {
    big: 'Pre+Pro',
    title: 'Prebiotics + probiotics',
    text: 'Two kinds of gut-friendly goodness, together in one refreshing can.',
    color: '#c8e95a',
  },
  { big: 'Low', title: 'Low sugar', text: 'All the bright, punchy flavour, without the sugar rush.', color: '#ffc24b' },
  { big: 20, title: 'Calories a can', text: 'Light enough to reach for at any time of day.', color: '#ff7b66' },
  {
    big: 'Real',
    title: 'Real fruit & spice',
    text: 'Raw mango, jeera and masala that taste the way you know them.',
    color: '#86c9ef',
  },
]

export function InsideTheCan() {
  const sectionRef = useRef<HTMLElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const reduce = !!useReducedMotion()
  const lenis = useLenis()
  useSectionColor(sectionRef, SKY_PALE)

  const { scrollYProgress } = useScroll({ target: cardRef, offset: ['start end', 'center center'] })
  const springy = useSpring(scrollYProgress, { stiffness: 110, damping: 24, mass: 0.5 })
  const q = useTransform(reduce ? scrollYProgress : springy, (v) => (reduce ? 1 : v))
  const skyScale = useTransform(scrollYProgress, [0, 1], reduce ? [1, 1] : [1.22, 1])

  const [clinks, setClinks] = useState(0)
  const armed = useRef(true)
  const [scope, animateScope] = useAnimate()
  useMotionValueEvent(q, 'change', (v) => {
    if (v > 0.97 && armed.current) {
      armed.current = false
      setClinks((n) => n + 1)
    } else if (v < 0.7) armed.current = true
  })
  useEffect(() => {
    if (!clinks || reduce) return
    CANS.forEach((can, i) => {
      animateScope(
        `[data-jolt="${i}"]`,
        can.jolt ? { rotate: [0, can.jolt, 0] } : { y: [0, -10, 0] },
        { duration: 0.55, ease: 'easeOut' },
      )
    })
  }, [clinks, reduce, animateScope])

  const toFlavours = () => {
    const target = document.getElementById('flavours')
    if (!target) return
    if (lenis) lenis.scrollTo(target, { duration: 1.8 })
    else target.scrollIntoView()
  }

  return (
    <section ref={sectionRef} id="inside" aria-labelledby="inside-title" className="relative px-3 pb-20 pt-6 md:px-6 md:pb-28 md:pt-10">
      <div
        ref={cardRef}
        className="relative mx-auto flex max-w-[1500px] flex-col overflow-hidden rounded-[32px] bg-[#1b6fe0] md:rounded-[48px] lg:grid lg:h-[clamp(660px,92vh,900px)] lg:grid-cols-12"
      >
        <motion.img
          src={sky}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ scale: skyScale }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,44,128,0.55)_0%,rgba(6,44,128,0)_55%)] lg:bg-[linear-gradient(90deg,rgba(6,44,128,0.6)_0%,rgba(6,44,128,0.2)_42%,rgba(6,44,128,0)_68%)]" />
        <Bubbles count={16} seed={11} />

        <div className="relative z-10 flex flex-col justify-between gap-10 p-7 pt-10 text-white md:p-12 lg:col-span-5 lg:p-14">
          <div>
            <Reveal>
              <p className="eyebrow text-white/80">Inside the can</p>
            </Reveal>
            <h2 id="inside-title" className="type-display mt-5 text-[clamp(3.6rem,7.4vw,7.75rem)]">
              <RevealLines
                lines={[
                  'Good for',
                  <>
                    your <span className="font-serif font-normal italic tracking-[-0.02em] [font-stretch:100%]">gut.</span>
                  </>,
                ]}
              />
            </h2>
          </div>
          <Reveal delay={0.15}>
            <p className="max-w-md text-lg leading-relaxed text-white/90 md:text-xl">
              Fubbly Fizz brings prebiotics and probiotics together in a refreshing soda made to support your gut and
              digestion.
            </p>
            <button
              type="button"
              onClick={toFlavours}
              className="group mt-8 inline-flex h-14 cursor-pointer items-center gap-3 rounded-full bg-white pl-7 pr-2 text-[15px] font-semibold text-ink shadow-[0_18px_40px_-18px_rgba(0,20,70,0.6)] transition-transform duration-500 ease-out-expo hover:-translate-y-0.5"
            >
              Explore the flavours
              <span className="grid h-10 w-10 place-items-center rounded-full bg-ink text-white">
                <ArrowIcon className="h-4 w-4 -rotate-90 transition-transform duration-500 ease-out-expo group-hover:-translate-y-0.5" />
              </span>
            </button>
          </Reveal>
        </div>

        <div ref={scope} className="relative min-h-[480px] flex-1 sm:min-h-[560px] lg:col-span-7 lg:min-h-0">
          <div className="absolute inset-x-[4%] bottom-0 top-[6%] lg:inset-x-[6%] lg:top-[10%]">
            {CHIPS.map((chip, k) => (
              <Chip key={chip.label} {...chip} q={q} k={k} />
            ))}
            <div className="absolute bottom-[-12%] left-1/2 aspect-[1.3/1] h-[74%] max-w-[112%] -translate-x-1/2 lg:bottom-[-14%] lg:h-[80%]">
              {CANS.map((_, i) => (
                <Can key={i} i={i} q={q} />
              ))}
              {clinks > 0 && !reduce && <Burst key={clinks} />}
            </div>
          </div>
        </div>
      </div>

      <ul className="mx-auto mt-4 grid max-w-[1500px] gap-3 sm:grid-cols-2 md:mt-6 md:gap-4 lg:grid-cols-4">
        {BENEFITS.map((b, k) => (
          <li key={b.title}>
            <Reveal delay={k * 0.08} className="h-full">
              <div className="group relative flex h-full min-h-[210px] flex-col overflow-hidden rounded-[28px] bg-white p-7 transition-transform duration-700 ease-out-expo hover:-translate-y-1.5 md:min-h-[300px] md:p-8">
                <span
                  aria-hidden="true"
                  className="absolute inset-0 origin-bottom scale-y-0 transition-transform duration-700 ease-out-expo group-hover:scale-y-100"
                  style={{ backgroundColor: b.color }}
                />
                <div className="relative flex items-center justify-between">
                  <span className="text-sm font-semibold tabular-nums text-ink/50">0{k + 1}</span>
                  <span className="h-3 w-3 rounded-full ring-4 ring-ink/5" style={{ backgroundColor: b.color }} />
                </div>
                <p aria-hidden="true" className="type-display relative mt-auto pt-6 text-[clamp(3rem,5vw,4.75rem)] md:pt-10">
                  {typeof b.big === 'number' ? <CountUp to={b.big} /> : b.big}
                </p>
                <h3 className="relative mt-3 text-lg font-semibold">{b.title}</h3>
                <p className="relative mt-1.5 leading-relaxed text-ink/70">{b.text}</p>
              </div>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  )
}
