import { useRef, useState, type PointerEvent } from 'react'
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from 'motion/react'
import { FLAVOURS, PAPER, type Flavour } from '@/data/flavours'
import { cn, EASE_OUT_EXPO, wrap } from '@/lib/math'
import { ArrowIcon, Reveal, RevealLines, Sparkle } from '@/components/ui'
import { useSectionColor } from '@/components/Sheet'

const TAPE_ITEMS = ['Low sugar', 'Prebiotic + probiotic', 'Real fruit', '20 cal', 'Good for your gut', 'Indian-inspired']

/** Endless marquee band; scrolling speeds it up and flips its direction. */
function Tape({ velocity, className }: { velocity: number; className?: string }) {
  const reduce = useReducedMotion()
  const base = useMotionValue(0)
  const { scrollY } = useScroll()
  const scrollVelocity = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 })
  const boost = useTransform(scrollVelocity, [0, 1000], [0, 4], { clamp: false })
  const direction = useRef(1)
  const x = useTransform(base, (v) => `${wrap(-50, 0, v)}%`)

  useAnimationFrame((_, delta) => {
    if (reduce) return
    const b = boost.get()
    if (b < 0) direction.current = -1
    else if (b > 0) direction.current = 1
    let move = direction.current * velocity * (delta / 1000)
    move += direction.current * move * b
    base.set(base.get() + move)
  })

  const group = (
    <div className="flex shrink-0 items-center">
      {[...TAPE_ITEMS, ...TAPE_ITEMS].map((item, k) => (
        <span key={k} className="flex items-center">
          <span className="type-display px-6 text-[clamp(1.6rem,3.2vw,2.75rem)] uppercase leading-none tracking-[-0.02em] md:px-8">
            {item}
          </span>
          <Sparkle className="h-[clamp(0.9rem,1.6vw,1.4rem)] w-[clamp(0.9rem,1.6vw,1.4rem)] opacity-80" />
        </span>
      ))}
    </div>
  )

  return (
    <div className={cn('absolute -left-[5%] w-[110%] overflow-hidden py-4 md:py-5', className)}>
      <motion.div className="flex w-max whitespace-nowrap will-change-transform" style={{ x }}>
        {group}
        {group}
      </motion.div>
    </div>
  )
}

function Tapes() {
  return (
    <div aria-hidden="true" className="relative h-[170px] overflow-hidden md:h-[230px]">
      <Tape velocity={-2.4} className="top-[26%] rotate-[2.4deg] bg-ink text-mango" />
      <Tape
        velocity={3}
        className="top-[30%] -rotate-[2.6deg] bg-pink text-white shadow-[0_18px_40px_-18px_rgba(224,21,122,0.7)]"
      />
    </div>
  )
}

function IndexRow({ flavour }: { flavour: Flavour }) {
  const rowRef = useRef<HTMLAnchorElement>(null)
  const [hover, setHover] = useState(false)
  const mx = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 240, damping: 26, mass: 0.6 })
  const tilt = useTransform(useVelocity(sx), [-1800, 0, 1800], [-20, 0, 20], { clamp: true })

  const track = (e: PointerEvent<HTMLAnchorElement>, jump = false) => {
    if (e.pointerType !== 'mouse' || !rowRef.current) return
    const x = e.clientX - rowRef.current.getBoundingClientRect().left
    if (jump) {
      mx.jump(x)
      sx.jump(x)
    } else mx.set(x)
  }

  return (
    <li className="border-t border-ink/15 last:border-b">
      <a
        ref={rowRef}
        href={`#${flavour.id}`}
        onPointerEnter={(e) => {
          if (e.pointerType !== 'mouse') return
          track(e, true)
          setHover(true)
        }}
        onPointerMove={track}
        onPointerLeave={() => setHover(false)}
        className="group relative isolate grid grid-cols-[auto_1fr_auto] items-center gap-x-4 py-5 hover:z-10 md:grid-cols-12 md:gap-x-6 md:py-8"
      >
        <span
          aria-hidden="true"
          className="absolute -inset-x-3 inset-y-1.5 -z-10 origin-bottom scale-y-0 rounded-[24px] transition-transform duration-700 ease-out-expo group-hover:scale-y-100 md:-inset-x-6"
          style={{ backgroundColor: flavour.palette.bg }}
        />
        <span className="self-start pt-2 text-sm font-semibold tabular-nums text-ink/50 md:col-span-1 md:self-center md:pt-0">
          {flavour.index}
        </span>
        <span className="md:col-span-6">
          <span className="type-display block text-[clamp(2.75rem,7.2vw,6.75rem)] transition-transform duration-700 ease-out-expo group-hover:translate-x-3">
            {flavour.name}
            <span style={{ color: flavour.palette.accent }}>.</span>
          </span>
          <span className="mt-1 block font-serif text-xl italic text-ink/70 md:hidden">{flavour.mood}</span>
        </span>
        <span className="hidden font-serif text-[clamp(1.4rem,2.1vw,2.1rem)] italic text-ink/80 md:col-span-3 md:block">
          {flavour.mood}
        </span>
        <span className="hidden items-center justify-end gap-4 md:col-span-2 md:flex">
          <span className="text-sm font-semibold opacity-0 transition-opacity duration-500 group-hover:opacity-100 lg:inline">
            Tasting notes
          </span>
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-ink/20 transition-colors duration-500 group-hover:border-ink group-hover:bg-ink group-hover:text-paper">
            <ArrowIcon className="h-4 w-4 rotate-45 transition-transform duration-500 ease-out-expo group-hover:rotate-90" />
          </span>
        </span>

        {/* Touch screens: a small can thumbnail is always visible. */}
        <img src={flavour.can} alt="" className="h-24 w-auto rotate-[14deg] md:hidden" />

        {/* Mouse: the can follows the cursor and leans with its velocity. */}
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-1/2 z-20 hidden h-[clamp(220px,26vw,320px)] -translate-x-1/2 -translate-y-1/2 md:block"
          style={{ x: sx, rotate: tilt }}
        >
          <motion.img
            src={flavour.can}
            alt=""
            className="h-full w-auto drop-shadow-[0_24px_30px_rgba(0,0,0,0.3)]"
            initial={false}
            animate={hover ? { opacity: 1, scale: 1, y: 0, rotate: 10 } : { opacity: 0, scale: 0.6, y: 40, rotate: -6 }}
            transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
          />
        </motion.span>
      </a>
    </li>
  )
}

export function FlavourIndex() {
  const ref = useRef<HTMLElement>(null)
  useSectionColor(ref, PAPER)

  return (
    <section ref={ref} id="flavours" aria-labelledby="flavours-title" className="relative">
      <Tapes />
      <div className="mx-auto max-w-[1400px] px-5 pb-24 pt-6 md:px-10 md:pb-32 md:pt-10">
        <header className="grid items-end gap-8 md:grid-cols-12">
          <div className="md:col-span-8">
            <Reveal>
              <p className="eyebrow text-ink/70">The tasting notes</p>
            </Reveal>
            <h2 id="flavours-title" className="type-display mt-5 text-[clamp(3.4rem,8.6vw,8.75rem)]">
              <RevealLines
                lines={[
                  <>
                    Pick your{' '}
                    <span className="font-serif font-normal italic tracking-[-0.02em] [font-stretch:100%]">flavour.</span>
                  </>,
                ]}
              />
            </h2>
          </div>
          <Reveal className="md:col-span-4" delay={0.15}>
            <p className="max-w-sm text-lg leading-relaxed text-ink/75 md:ml-auto">
              From the sharp tang of raw mango to warm masala spice. Get to know the taste inside each can.
            </p>
          </Reveal>
        </header>

        <Reveal className="mt-14 md:mt-20" y={40}>
          <ol>
            {FLAVOURS.map((flavour) => (
              <IndexRow key={flavour.id} flavour={flavour} />
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
  )
}
