import { useRef } from 'react'
import { motion, useTransform, type MotionValue } from 'motion/react'
import { FLAVOURS, type Flavour, type HeroPiece, type Palette } from '@/data/flavours'
import { clamp01, EASE_OUT_EXPO, easeInCubic, easeInOutCubic, easeOutCubic, keyframes, range } from '@/lib/math'
import { useFitText } from '@/lib/hooks'
import { GRID_PATTERN } from '@/components/ui'
import splash from '@/assets/splash.webp'

type Shared = {
  /** Continuous flavour position, 0 (Raw Mango) → 2 (Masala). */
  f: MotionValue<number>
  reduce: boolean
  ready: boolean
}

type Pointer = { px: MotionValue<number>; py: MotionValue<number> }

/* ------------------------------------------------------------------ backdrops */

function Backdrop({ palette }: { palette: Palette }) {
  return (
    <div className="absolute inset-0" style={{ backgroundColor: palette.bg }}>
      <div
        className="absolute left-1/2 top-[50%] aspect-square w-[max(108vmin,880px)] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: `radial-gradient(closest-side, ${palette.light}, ${palette.light}00)` }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-1/2"
        style={{ background: `linear-gradient(to top, ${palette.deep}99, ${palette.deep}00)` }}
      />
    </div>
  )
}

const WAVE_FRONT = 'M0 40 Q 180 2 360 40 T 720 40 T 1080 40 T 1440 40 T 1800 40 T 2160 40 T 2520 40 T 2880 40 V 80 H 0 Z'
const WAVE_BACK = 'M0 30 Q 180 70 360 30 T 720 30 T 1080 30 T 1440 30 T 1800 30 T 2160 30 T 2520 30 T 2880 30 V 80 H 0 Z'

/** Sloshing liquid surface that rides on top of an incoming flavour. */
function Wave({ color }: { color: string }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-[calc(100%-1px)] h-[7%] min-h-10 overflow-hidden">
      <svg
        viewBox="0 0 2880 80"
        preserveAspectRatio="none"
        className="wave-anim absolute bottom-0 left-0 h-full w-[200%] animate-[wave_11s_linear_infinite_reverse] opacity-55"
      >
        <path d={WAVE_BACK} fill={color} />
      </svg>
      <svg
        viewBox="0 0 2880 80"
        preserveAspectRatio="none"
        className="wave-anim absolute bottom-0 left-0 h-full w-[200%] animate-[wave_7s_linear_infinite]"
      >
        <path d={WAVE_FRONT} fill={color} />
      </svg>
    </div>
  )
}

function LiquidLayer({ flavour, i, f, reduce }: { flavour: Flavour; i: number } & Omit<Shared, 'ready'>) {
  // The next flavour pours in from below during the second half of the previous one.
  const y = useTransform(f, (v) => `${(1 - easeInOutCubic(range(v - (i - 1), 0.1, 0.8))) * 112}%`)
  const opacity = useTransform(f, (v) => range(v - (i - 1), 0.3, 0.7))
  return (
    <motion.div className="absolute inset-0 will-change-transform" style={reduce ? { opacity } : { y }}>
      {!reduce && <Wave color={flavour.palette.bg} />}
      <Backdrop palette={flavour.palette} />
    </motion.div>
  )
}

export function HeroBackdrops({ f, reduce }: Omit<Shared, 'ready'>) {
  return (
    <div className="absolute inset-0">
      <Backdrop palette={FLAVOURS[0].palette} />
      {FLAVOURS.slice(1).map((flavour, k) => (
        <LiquidLayer key={flavour.id} flavour={flavour} i={k + 1} f={f} reduce={reduce} />
      ))}
    </div>
  )
}

export function HeroGrid({ f }: { f: MotionValue<number> }) {
  const y = useTransform(f, (v) => v * -70)
  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 -inset-y-[12%] opacity-55"
      style={{
        y,
        backgroundImage: GRID_PATTERN,
        backgroundSize: 'var(--grid) var(--grid)',
        backgroundPosition: 'center',
        maskImage: 'radial-gradient(ellipse 72% 62% at 50% 50%, transparent 38%, #000 100%)',
        WebkitMaskImage: 'radial-gradient(ellipse 72% 62% at 50% 50%, transparent 38%, #000 100%)',
      }}
    />
  )
}

/* ------------------------------------------------------------------ giant words */

function HeroLetter({ ch, k, n, i, f, ready, reduce }: { ch: string; k: number; n: number; i: number } & Shared) {
  const t = n > 1 ? k / (n - 1) : 0
  // Incoming glyphs wait until the new liquid has risen past the word, then roll up out of it.
  const inStart = -0.5 + t * 0.2
  const outStart = 0.03 + t * 0.2

  const transform = useTransform(f, (v) => {
    if (reduce) return 'none'
    const d = v - i
    if (d <= 0) {
      const e = 1 - easeOutCubic(range(d, inStart, inStart + 0.28))
      return `translate3d(0, ${e * 115}%, 0) rotate(${e * 8}deg)`
    }
    const e = easeInCubic(range(d, outStart, outStart + 0.3))
    return `translate3d(0, ${-e * 115}%, 0) rotate(${-e * 8}deg)`
  })

  const intro = i === 0 && !reduce
  return (
    <motion.span
      className="inline-block"
      initial={intro ? { y: '115%' } : false}
      animate={ready ? { y: '0%' } : undefined}
      transition={{ duration: 1.15, ease: EASE_OUT_EXPO, delay: 0.1 + k * 0.055 }}
    >
      <motion.span className="inline-block will-change-transform" style={{ transform, transformOrigin: '0% 100%' }}>
        {ch}
      </motion.span>
    </motion.span>
  )
}

function HeroWord({ flavour, i, stacked, ...shared }: { flavour: Flavour; i: number; stacked: boolean } & Shared) {
  const ref = useRef<HTMLDivElement>(null)
  const lines = stacked ? flavour.heroLines : [flavour.heroLines.join(' ')]
  const size = useFitText(ref, { lineHeight: 0.84, key: lines.join('|') })
  const opacity = useTransform(shared.f, (v) => (shared.reduce ? clamp01(1 - Math.abs(v - i) * 2.5) : 1))

  // Pre-compute each glyph's index so the stagger runs across lines.
  let count = 0
  const glyphs = lines.map((line) => [...line].map((ch) => ({ ch, k: ch === ' ' ? -1 : count++ })))
  const total = count

  return (
    <motion.div
      ref={ref}
      className="hero-word absolute inset-0 flex flex-col items-center justify-center"
      style={{ fontSize: size, color: flavour.palette.ink, opacity }}
    >
      {glyphs.map((line, li) => (
        <div key={li} className="-my-[0.05em] overflow-hidden px-[0.05em] py-[0.05em]">
          <span data-fit className="inline-flex whitespace-nowrap">
            {line.map(({ ch, k }, ci) =>
              k < 0 ? (
                <span key={ci} className="inline-block w-[0.2em]" />
              ) : (
                <HeroLetter key={ci} ch={ch} k={k} n={total} i={i} {...shared} />
              ),
            )}
          </span>
        </div>
      ))}
    </motion.div>
  )
}

export function HeroWords({ stacked, ...shared }: { stacked: boolean } & Shared) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-[3vw] top-(--word-top) h-(--word-h)">
      {FLAVOURS.map((flavour, i) => (
        <HeroWord key={`${flavour.id}-${stacked}`} flavour={flavour} i={i} stacked={stacked} {...shared} />
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ splash */

export function HeroSplash({ f, reduce, ready, part }: Shared & { part: 'back' | 'front' }) {
  const pulse = (v: number) => Math.sin(Math.PI * (v % 1))
  const rotate = useTransform(f, (v) => (reduce ? 0 : -v * 12 - pulse(v) * 10))
  const scale = useTransform(f, (v) => (reduce ? 1 : 1 + 0.16 * pulse(v)))
  const opacity = useTransform(f, (v) => 0.88 - 0.3 * pulse(v))
  // The lower arc passes in front of the can, the upper arc behind it.
  const mask =
    part === 'front'
      ? 'linear-gradient(to bottom, transparent 57%, #000 73%)'
      : 'linear-gradient(to bottom, #000 57%, transparent 73%)'

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute left-1/2 top-(--can-y) w-[calc(var(--H)*1.85)] -translate-x-1/2 -translate-y-1/2"
      style={{ maskImage: mask, WebkitMaskImage: mask }}
    >
      <motion.div
        initial={reduce ? false : { opacity: 0, scale: 0.55, rotate: -40 }}
        animate={ready ? { opacity: 1, scale: 1, rotate: 0 } : undefined}
        transition={{ duration: 1.8, ease: EASE_OUT_EXPO, delay: 0.45 }}
      >
        <motion.img
          src={splash}
          alt=""
          draggable={false}
          className="block w-full will-change-transform"
          style={{ rotate, scale, opacity }}
        />
      </motion.div>
    </div>
  )
}

/* ------------------------------------------------------------------ cans */

// d = f - i. Negative: incoming from below. Positive: leaving upwards.
// Includes an overshoot on arrival and a small anticipation dip before take-off.
const CAN_STOPS = [-0.9, -0.42, -0.12, 0, 0.1, 0.3, 0.8]
const CAN_Y = [125, 16, -2.6, 0, 0, 3.4, -130]
const CAN_ROTATE = [46, 18, 8.5, 12, 12, 17, -32]
const CAN_SCALE = [0.84, 0.98, 1.015, 1, 1, 0.985, 0.82]

function HeroCan({ flavour, i, f, reduce, ready, px, py }: { flavour: Flavour; i: number } & Shared & Pointer) {
  const transform = useTransform(f, (v) => {
    if (reduce) return 'translate3d(-50%, -50%, 0) rotate(12deg)'
    const d = v - i
    const y = keyframes(d, CAN_STOPS, CAN_Y)
    const r = keyframes(d, CAN_STOPS, CAN_ROTATE)
    const s = keyframes(d, CAN_STOPS, CAN_SCALE)
    return `translate3d(-50%, calc(-50% + ${y}vh), 0) rotate(${r}deg) scale(${s})`
  })
  const opacity = useTransform(f, (v) => {
    const d = Math.abs(v - i)
    return reduce ? clamp01(1 - d * 2.5) : d > 0.98 ? 0 : 1
  })
  const shadow = useTransform(f, (v) => clamp01(1 - Math.abs(v - i) * 4))
  const x = useTransform(px, (v) => v * 16)
  const y = useTransform(py, (v) => v * 10)
  const tilt = useTransform(px, (v) => v * 2.5)
  const intro = i === 0 && !reduce

  return (
    <>
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-(--can-y) h-[calc(var(--H)*0.08)] w-[calc(var(--H)*0.46)] -translate-x-1/2 translate-y-[calc(var(--H)*0.5)]"
        style={{ opacity: shadow }}
      >
        <div className="h-full w-full animate-[float-shadow_7s_ease-in-out_infinite] rounded-[50%] bg-black/30 blur-xl" />
      </motion.div>
      <motion.div className="pointer-events-none absolute left-1/2 top-(--can-y) will-change-transform" style={{ transform, opacity }}>
        <motion.div
          initial={intro ? { y: '45vh', rotate: -24, opacity: 0 } : false}
          animate={ready ? { y: '0vh', rotate: 0, opacity: 1 } : undefined}
          transition={{ type: 'spring', stiffness: 55, damping: 12, mass: 1, delay: 0.3 }}
        >
          <motion.div style={{ x, y, rotate: tilt }}>
            <div className="animate-float">
              <img
                src={flavour.can}
                alt={`Fubbly Fizz ${flavour.name} probiotic soda can`}
                draggable={false}
                className="block h-(--H) w-auto max-w-none drop-shadow-[0_28px_36px_rgba(0,0,0,0.22)]"
              />
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </>
  )
}

export function HeroCans({ active, ...props }: Shared & Pointer & { active: number }) {
  return (
    <>
      {FLAVOURS.map((flavour, i) => (
        <div key={flavour.id} aria-hidden={active !== i} className="contents">
          <HeroCan flavour={flavour} i={i} {...props} />
        </div>
      ))}
    </>
  )
}

/* ------------------------------------------------------------------ ingredients */

function HeroPieceView({ piece, i, order, f, reduce, ready, px, py }: { piece: HeroPiece; i: number; order: number } & Shared & Pointer) {
  const dir = piece.x >= 0 ? 1 : -1
  const transform = useTransform(f, (v) => {
    if (reduce) return 'translate3d(-50%, -50%, 0)'
    const d = v - i
    let x = 0
    let y = 0
    let r = 0
    let s = 1
    if (d < 0) {
      // Arrive from below, spinning into place — deeper pieces travel further (parallax).
      const t = easeOutCubic(range(d, -0.92 + order * 0.015, -0.1 - piece.depth * 0.02))
      y = (1 - t) * (70 + 45 * piece.depth)
      r = (1 - t) * 150 * dir
      s = 0.55 + 0.45 * t
    } else {
      // Burst up and outwards, growing as if rushing past the camera.
      const t = easeInCubic(range(d, 0.05, 0.62 + 0.05 * (1 - piece.depth)))
      y = -t * (75 + 50 * piece.depth)
      x = t * dir * 12 * piece.depth
      r = -t * 120 * dir
      s = 1 + 0.3 * t * piece.depth
    }
    return `translate3d(calc(-50% + ${x}vw), calc(-50% + ${y}vh), 0) rotate(${r}deg) scale(${s})`
  })
  const opacity = useTransform(f, (v) => {
    const d = v - i
    if (reduce) return clamp01(1 - Math.abs(d) * 2.5)
    return d < 0 ? range(d, -0.92, -0.67) : 1 - range(d, 0.42, 0.66)
  })
  const x = useTransform(px, (v) => v * 26 * piece.depth)
  const y = useTransform(py, (v) => v * 18 * piece.depth)
  const intro = i === 0 && !reduce

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none absolute will-change-transform"
      style={{
        left: `calc(50% + ${piece.x} * var(--H) * var(--spread))`,
        top: `calc(var(--can-y) + ${piece.y} * var(--H))`,
        width: `calc(${piece.size} * var(--H) * var(--pscale))`,
        transform,
        opacity,
      }}
    >
      <motion.div style={{ x, y }}>
        <motion.div
          initial={intro ? { scale: 0, opacity: 0 } : false}
          animate={ready ? { scale: 1, opacity: 1 } : undefined}
          transition={{ type: 'spring', stiffness: 90, damping: 12, delay: 0.6 + order * 0.08 }}
        >
          <div
            className="animate-float"
            style={{ animationDuration: `${6 + (order % 4) * 1.3}s`, animationDelay: `${-order * 0.9}s` }}
          >
            <img
              src={piece.src}
              alt=""
              draggable={false}
              className="block w-full"
              style={{
                transform: `rotate(${piece.rotate}deg) scaleX(${piece.flip ? -1 : 1})`,
                filter: piece.blur ? `blur(${piece.blur}px)` : undefined,
              }}
            />
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

export function HeroPieces({ layer, portrait, ...props }: Shared & Pointer & { layer: 'back' | 'front'; portrait: boolean }) {
  return (
    <>
      {FLAVOURS.map((flavour, i) =>
        flavour.heroPieces.map((piece, order) =>
          (layer === 'front') === !!piece.front && !(portrait && piece.wideOnly) ? (
            <HeroPieceView key={`${flavour.id}-${order}`} piece={piece} i={i} order={order} {...props} />
          ) : null,
        ),
      )}
    </>
  )
}
