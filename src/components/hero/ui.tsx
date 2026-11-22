import { motion, useTransform, type MotionValue } from 'motion/react'
import { FLAVOURS, type Flavour } from '@/data/flavours'
import { clamp01, EASE_OUT_EXPO } from '@/lib/math'
import { SEQ_END } from './choreography'

const introUp = (ready: boolean, delay: number, reduce: boolean) => ({
  initial: reduce ? false : ({ opacity: 0, y: 24 } as const),
  animate: ready ? { opacity: 1, y: 0 } : undefined,
  transition: { duration: 1, ease: EASE_OUT_EXPO, delay },
})

export function HeroEyebrow({ ready, reduce }: { ready: boolean; reduce: boolean }) {
  return (
    <motion.p
      {...introUp(ready, 0.2, reduce)}
      className="eyebrow absolute inset-x-0 top-[5.75rem] flex items-center justify-center gap-4 md:top-[7.25rem]"
    >
      <span className="h-px w-8 bg-current opacity-40 md:w-10" />
      Premium probiotic soda
      <span className="h-px w-8 bg-current opacity-40 md:w-10" />
    </motion.p>
  )
}

function Caption({ flavour, i, f, active, reduce }: { flavour: Flavour; i: number; f: MotionValue<number>; active: boolean; reduce: boolean }) {
  const opacity = useTransform(f, (v) => 1 - clamp01((Math.abs(v - i) - 0.16) / 0.22))
  const y = useTransform(f, (v) => (reduce ? 0 : Math.max(-48, Math.min(48, (v - i) * -90))))
  return (
    <motion.div aria-hidden={!active} className="absolute inset-x-0 bottom-0" style={{ opacity, y }}>
      <p className="eyebrow flex items-center gap-3">
        <span className="h-px w-7 bg-current opacity-50" />
        {flavour.index} — {flavour.name}
      </p>
      <p className="mt-3 text-balance text-[clamp(1.9rem,3.3vw,3.1rem)] font-[760] leading-[0.95] tracking-[-0.04em] [font-stretch:90%]">
        {flavour.tagline}
      </p>
      <p className="mt-2.5 max-w-[36ch] text-[15px] leading-snug opacity-80 md:text-base">{flavour.heroSub}</p>
    </motion.div>
  )
}

export function HeroCaptions({
  f,
  active,
  ready,
  reduce,
}: {
  f: MotionValue<number>
  active: number
  ready: boolean
  reduce: boolean
}) {
  return (
    <motion.div
      {...introUp(ready, 0.85, reduce)}
      className="pointer-events-none absolute inset-x-5 bottom-[calc(5.5rem_+_env(safe-area-inset-bottom))] h-[128px] md:inset-x-10 lg:inset-x-auto lg:bottom-10 lg:left-10 lg:h-[136px] lg:w-[420px] xl:w-[500px]"
    >
      {FLAVOURS.map((flavour, i) => (
        <Caption key={flavour.id} flavour={flavour} i={i} f={f} active={active === i} reduce={reduce} />
      ))}
    </motion.div>
  )
}

/** Bottom-centre: a scroll cue that hands over to a step indicator once the visitor starts scrolling. */
export function HeroProgress({
  progress,
  active,
  ready,
  reduce,
}: {
  progress: MotionValue<number>
  active: number
  ready: boolean
  reduce: boolean
}) {
  const cue = useTransform(progress, [0, 0.025], [1, 0])
  const steps = useTransform(progress, [0.015, 0.045, SEQ_END - 0.01, SEQ_END + 0.04], [0, 1, 1, 0])
  const fill = useTransform(progress, (v) => clamp01(v / SEQ_END))

  return (
    <motion.div
      {...introUp(ready, 1.05, reduce)}
      className="pointer-events-none absolute bottom-12 left-1/2 hidden -translate-x-1/2 xl:block"
    >
      <motion.div className="flex items-center gap-3 whitespace-nowrap text-sm font-semibold" style={{ opacity: cue }}>
        <span className="relative h-8 w-5 rounded-full border-[1.5px] border-current">
          <span className="absolute left-1/2 top-1.5 h-1.5 w-1 -translate-x-1/2 animate-[cue_1.7s_ease-in-out_infinite] rounded-full bg-current" />
        </span>
        Scroll to taste
      </motion.div>
      <motion.div
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-3 text-xs font-semibold tabular-nums"
        style={{ opacity: steps }}
      >
        <span>{FLAVOURS[active].index}</span>
        <span className="relative h-[2px] w-24 overflow-hidden rounded-full bg-current/20">
          <motion.span className="absolute inset-0 origin-left rounded-full bg-current" style={{ scaleX: fill }} />
        </span>
        <span className="opacity-50">03</span>
      </motion.div>
    </motion.div>
  )
}

export function FlavourSwitch({
  active,
  ink,
  onSelect,
  ready,
  reduce,
}: {
  active: number
  ink: MotionValue<string>
  onSelect: (i: number) => void
  ready: boolean
  reduce: boolean
}) {
  return (
    <motion.div
      {...introUp(ready, 0.95, reduce)}
      className="absolute inset-x-4 bottom-[calc(1rem_+_env(safe-area-inset-bottom))] md:inset-x-10 lg:inset-x-auto lg:bottom-10 lg:right-10"
    >
      <div
        role="group"
        aria-label="Choose a flavour"
        className="flex gap-1 rounded-full border border-white/55 bg-white/40 p-1.5 shadow-[0_14px_40px_-16px_rgba(0,0,0,0.35)] backdrop-blur-xl backdrop-saturate-150"
      >
        {FLAVOURS.map((flavour, i) => {
          const on = active === i
          return (
            <button
              key={flavour.id}
              type="button"
              aria-pressed={on}
              onClick={() => onSelect(i)}
              className="relative flex h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-full px-3 text-[14px] font-semibold transition-colors duration-300 hover:bg-white/45 lg:flex-none lg:px-5"
              style={{ color: on ? '#fff' : undefined }}
            >
              {on && (
                <motion.span
                  layoutId="flavour-switch"
                  className="absolute inset-0 rounded-full"
                  style={{ backgroundColor: ink }}
                  transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                />
              )}
              <span
                className="relative h-2 w-2 shrink-0 rounded-full ring-1 ring-black/15"
                style={{ backgroundColor: flavour.palette.bg }}
              />
              <span className="relative whitespace-nowrap">{flavour.name}</span>
            </button>
          )
        })}
      </div>
    </motion.div>
  )
}
