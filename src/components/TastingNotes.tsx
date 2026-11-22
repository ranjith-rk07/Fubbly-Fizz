import { useRef, type PointerEvent } from 'react'
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from 'motion/react'
import { FLAVOURS, type Flavour, type StagePiece } from '@/data/flavours'
import { cn, EASE_OUT_EXPO } from '@/lib/math'
import { ArrowIcon, GRID_PATTERN, Reveal, RevealLines, SpinBadge } from '@/components/ui'
import { useSectionColor } from '@/components/Sheet'

function StagePieceView({
  piece,
  progress,
  shiftX,
  shiftY,
  reduce,
}: {
  piece: StagePiece
  progress: MotionValue<number>
  shiftX: MotionValue<number>
  shiftY: MotionValue<number>
  reduce: boolean
}) {
  const travel = reduce ? 0 : 14 * piece.speed
  // Parallax in % of the whole stage, so small seeds and big wedges move consistently.
  const y = useTransform(progress, [0, 1], [`${travel}%`, `${-travel}%`])
  const rotate = useTransform(progress, [0, 1], reduce ? [0, 0] : [-30 * piece.speed, 30 * piece.speed])
  const x = useTransform(shiftX, (v) => v * 22 * piece.speed)
  const yy = useTransform(shiftY, (v) => v * 16 * piece.speed)

  return (
    <motion.div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ y }}>
      <motion.div
        className="absolute -translate-x-1/2 -translate-y-1/2"
        style={{ left: `${piece.left}%`, top: `${piece.top}%`, width: `${piece.width}%`, rotate, x, y: yy }}
      >
        <img
          src={piece.src}
          alt=""
          draggable={false}
          className="block w-full drop-shadow-[0_18px_22px_rgba(0,0,0,0.18)]"
          style={{
            transform: `rotate(${piece.rotate}deg) scaleX(${piece.flip ? -1 : 1})`,
            filter: piece.blur ? `blur(${piece.blur}px)` : undefined,
          }}
        />
      </motion.div>
    </motion.div>
  )
}

function ChapterStage({ flavour, progress, reduce }: { flavour: Flavour; progress: MotionValue<number>; reduce: boolean }) {
  const stageRef = useRef<HTMLDivElement>(null)
  const { palette } = flavour

  // Scroll-linked motion.
  const canY = useTransform(progress, [0, 1], reduce ? ['0%', '0%'] : ['10%', '-10%'])
  const canRotate = useTransform(progress, [0, 0.5, 1], reduce ? [8, 8, 8] : [-12, 7, 20])
  const ghostX = useTransform(progress, [0, 1], reduce ? ['-8%', '-8%'] : ['10%', '-30%'])

  // Pointer-driven 3D tilt and a specular highlight that follows the cursor across the can.
  const tx = useMotionValue(0)
  const ty = useMotionValue(0)
  const stx = useSpring(tx, { stiffness: 120, damping: 18 })
  const sty = useSpring(ty, { stiffness: 120, damping: 18 })
  const rotateY = useTransform(stx, [-1, 1], [-16, 16])
  const rotateX = useTransform(sty, [-1, 1], [10, -10])
  const glareX = useTransform(stx, [-1, 1], [10, 90])
  const glareY = useTransform(sty, [-1, 1], [12, 72])
  const glare = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.6), rgba(255,255,255,0) 44%)`
  const shiftX = useTransform(stx, (v) => -v)
  const shiftY = useTransform(sty, (v) => -v)

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse' || reduce || !stageRef.current) return
    const r = stageRef.current.getBoundingClientRect()
    tx.set(((e.clientX - r.left) / r.width) * 2 - 1)
    ty.set(((e.clientY - r.top) / r.height) * 2 - 1)
  }
  const onLeave = () => {
    tx.set(0)
    ty.set(0)
  }

  const mask = { maskImage: `url(${flavour.can})`, WebkitMaskImage: `url(${flavour.can})` }

  return (
    <div
      ref={stageRef}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className="relative isolate aspect-[4/5] overflow-hidden rounded-[30px] [container-type:size] sm:aspect-square md:rounded-[44px] lg:aspect-[1/1.04]"
      style={{ backgroundColor: palette.bg }}
    >
      <div
        className="absolute inset-0"
        style={{ background: `radial-gradient(58% 52% at 50% 46%, ${palette.light}, ${palette.light}00 72%)` }}
      />
      <div
        className="absolute inset-0 opacity-90"
        style={{ backgroundImage: GRID_PATTERN, backgroundSize: '19cqw 19cqw', backgroundPosition: 'center' }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-1/2"
        style={{ background: `linear-gradient(to top, ${palette.deep}80, ${palette.deep}00)` }}
      />

      <motion.p
        aria-hidden="true"
        className="type-display absolute left-0 top-[47%] -translate-y-1/2 whitespace-nowrap text-[33cqw] mix-blend-multiply"
        style={{ x: ghostX, color: palette.ink, opacity: 0.17 }}
      >
        {flavour.ghost}
      </motion.p>

      <div className="absolute inset-x-[6%] top-[5.5%] flex items-start justify-between" style={{ color: palette.ink }}>
        <span className="eyebrow">No. {flavour.index}</span>
        <span lang="hi" className="font-deva text-[clamp(1.1rem,4.4cqw,2rem)] leading-none">
          {flavour.native}
        </span>
      </div>

      {flavour.stagePieces
        .filter((p) => !p.front)
        .map((piece, k) => (
          <StagePieceView key={k} piece={piece} progress={progress} shiftX={shiftX} shiftY={shiftY} reduce={reduce} />
        ))}

      <div
        aria-hidden="true"
        className="absolute left-1/2 top-[86%] h-[5%] w-[30%] -translate-x-1/2 rounded-[50%] bg-black/30 blur-xl"
      />
      <motion.div
        className="absolute left-1/2 top-1/2 h-[72cqh] -translate-x-1/2 -translate-y-1/2"
        style={{ y: canY, rotate: canRotate }}
      >
        <motion.div className="relative h-full" style={{ rotateX, rotateY, transformPerspective: 1100 }}>
          <img
            src={flavour.can}
            alt={`Fubbly Fizz ${flavour.name} probiotic soda can`}
            draggable={false}
            className="block h-full w-auto max-w-none drop-shadow-[0_30px_40px_rgba(0,0,0,0.28)]"
          />
          <motion.div
            aria-hidden="true"
            className="absolute inset-0 mix-blend-soft-light"
            style={{ ...mask, maskSize: '100% 100%', WebkitMaskSize: '100% 100%', backgroundImage: glare }}
          />
        </motion.div>
      </motion.div>

      {flavour.stagePieces
        .filter((p) => p.front)
        .map((piece, k) => (
          <StagePieceView key={k} piece={piece} progress={progress} shiftX={shiftX} shiftY={shiftY} reduce={reduce} />
        ))}

      <div className="absolute bottom-[5%] left-[5%] w-[23cqw] min-w-[92px] max-w-[160px]">
        <SpinBadge
          text={flavour.mood}
          bg={palette.badge}
          color={palette.ink}
          center={<span className="type-display text-[clamp(1.1rem,4.6cqw,2.1rem)]">{flavour.index}</span>}
        />
      </div>
    </div>
  )
}

function ProfileMeter({ label, value, color, delay }: { label: string; value: number; color: string; delay: number }) {
  return (
    <div className="grid grid-cols-[76px_1fr_auto] items-center gap-4">
      <span className="text-sm font-semibold">{label}</span>
      <motion.span
        className="flex gap-1.5"
        initial="off"
        whileInView="on"
        viewport={{ once: true, amount: 1 }}
        role="img"
        aria-label={`${label}: ${value} out of 5`}
      >
        {Array.from({ length: 5 }, (_, k) => (
          <motion.span
            key={k}
            className="h-2.5 flex-1 origin-left rounded-full"
            style={{ backgroundColor: k < value ? color : 'currentColor', opacity: k < value ? 1 : 0.13 }}
            variants={{
              off: { scaleX: 0 },
              on: { scaleX: 1, transition: { duration: 0.7, ease: EASE_OUT_EXPO, delay: delay + k * 0.07 } },
            }}
          />
        ))}
      </motion.span>
      <span aria-hidden="true" className="w-5 text-right text-xs font-semibold tabular-nums opacity-60">
        {value}/5
      </span>
    </div>
  )
}

function ChapterNotes({ flavour, next }: { flavour: Flavour; next?: Flavour }) {
  const { palette } = flavour
  const specs = [
    ['Featured ingredient', flavour.ingredient],
    ['Finish', flavour.finish],
    ['Best with', flavour.pairsWith],
  ]

  return (
    <div className="max-w-xl lg:max-w-none" style={{ color: palette.ink }}>
      <Reveal>
        <div className="eyebrow flex items-center justify-between border-b border-current/20 pb-4">
          <span>Tasting notes</span>
          <span className="tabular-nums">{flavour.index} / 03</span>
        </div>
      </Reveal>

      <h3 id={`${flavour.id}-title`} className="type-display mt-8 text-[clamp(3.6rem,8.6vw,8.5rem)] md:mt-10">
        <RevealLines
          lines={flavour.nameLines.map((line, k) =>
            k === flavour.nameLines.length - 1 ? (
              <>
                {line}
                <span style={{ color: palette.accent }}>.</span>
              </>
            ) : (
              line
            ),
          )}
        />
      </h3>

      <Reveal delay={0.1}>
        <p className="mt-4 flex flex-wrap items-baseline gap-x-3 text-xl">
          <span lang="hi" className="font-deva">
            {flavour.native}
          </span>
          <span className="font-serif text-2xl italic opacity-70">{flavour.nativeRoman}</span>
        </p>
        <p className="mt-6 max-w-[34rem] text-lg leading-relaxed opacity-85 md:text-[1.3rem]">{flavour.description}</p>
      </Reveal>

      <Reveal delay={0.15} className="mt-10">
        <p className="eyebrow opacity-70">Flavour profile</p>
        <div className="mt-5 space-y-3.5">
          {flavour.profile.map((item, k) => (
            <ProfileMeter key={item.label} label={item.label} value={item.value} color={palette.accent} delay={k * 0.1} />
          ))}
        </div>
      </Reveal>

      <Reveal delay={0.2}>
        <dl className="mt-10 border-t border-current/20">
          {specs.map(([term, detail]) => (
            <div key={term} className="flex items-baseline justify-between gap-6 border-b border-current/20 py-4">
              <dt className="text-[15px] opacity-75">{term}</dt>
              <dd className="text-right text-[15px] font-semibold">{detail}</dd>
            </div>
          ))}
        </dl>

        <a
          href={next ? `#${next.id}` : '#inside'}
          className="group mt-9 inline-flex items-center gap-4 text-[15px] font-semibold"
        >
          <span
            className="grid h-12 w-12 place-items-center rounded-full text-white transition-transform duration-500 ease-out-expo group-hover:scale-110"
            style={{ backgroundColor: palette.ink }}
          >
            <ArrowIcon className="h-4 w-4 rotate-90 transition-transform duration-500 ease-out-expo group-hover:translate-y-0.5" />
          </span>
          <span className="relative">
            {next ? `Next flavour · ${next.name}` : 'What’s inside the can'}
            <span className="absolute -bottom-1 left-0 h-px w-full origin-right scale-x-0 bg-current transition-transform duration-500 ease-out-expo group-hover:origin-left group-hover:scale-x-100" />
          </span>
        </a>
      </Reveal>
    </div>
  )
}

function Chapter({ flavour, i }: { flavour: Flavour; i: number }) {
  const ref = useRef<HTMLElement>(null)
  const reduce = !!useReducedMotion()
  useSectionColor(ref, flavour.palette.pale)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const stageScale = useTransform(scrollYProgress, [0, 0.3], reduce ? [1, 1] : [0.86, 1])
  const stageRotate = useTransform(scrollYProgress, [0, 0.3], reduce ? [0, 0] : [i % 2 ? 3 : -3, 0])
  const reverse = i % 2 === 1

  return (
    <article
      ref={ref}
      id={flavour.id}
      aria-labelledby={`${flavour.id}-title`}
      className="relative mx-auto grid max-w-[1400px] scroll-mt-4 items-center gap-10 px-5 py-14 md:px-10 md:py-24 lg:grid-cols-12 lg:gap-16 lg:py-28"
    >
      <motion.div className={cn('lg:col-span-7', reverse && 'lg:order-2')} style={{ scale: stageScale, rotate: stageRotate }}>
        <ChapterStage flavour={flavour} progress={scrollYProgress} reduce={reduce} />
      </motion.div>
      <div className={cn('lg:col-span-5', reverse && 'lg:order-1')}>
        <ChapterNotes flavour={flavour} next={FLAVOURS[i + 1]} />
      </div>
    </article>
  )
}

export function TastingNotes() {
  return (
    <section id="tasting-notes" aria-labelledby="tasting-notes-title" className="relative">
      <h2 id="tasting-notes-title" className="sr-only">
        Tasting notes
      </h2>
      {FLAVOURS.map((flavour, i) => (
        <Chapter key={flavour.id} flavour={flavour} i={i} />
      ))}
    </section>
  )
}
