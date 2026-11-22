import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react'
import { useLenis } from 'lenis/react'
import { FLAVOURS } from '@/data/flavours'
import { cn, EASE_IN_OUT_QUART, EASE_OUT_EXPO } from '@/lib/math'
import { ArrowIcon } from '@/components/ui'
import logo from '@/assets/fubbly-fizz-logo.png'

const LINKS = [
  { id: 'flavours', label: 'Flavours' },
  { id: 'tasting-notes', label: 'Tasting notes' },
]

export function Nav() {
  const lenis = useLenis()
  const [open, setOpen] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [current, setCurrent] = useState<string | null>(null)
  const menuButton = useRef<HTMLButtonElement>(null)
  const firstLink = useRef<HTMLAnchorElement>(null)
  const { scrollY } = useScroll()

  // Stay put through the hero; afterwards hide on the way down and return on the way up.
  useMotionValueEvent(scrollY, 'change', (y) => {
    const prev = scrollY.getPrevious() ?? y
    const hero = document.getElementById('top')
    const heroEnd = hero ? hero.offsetTop + hero.offsetHeight - window.innerHeight * 1.05 : 0
    if (y < heroEnd) {
      setHidden(false)
      setCurrent(null)
    } else if (y > prev + 6) setHidden(true)
    else if (y < prev - 6) setHidden(false)
  })

  useEffect(() => {
    const sections = ['flavours', 'tasting-notes', 'inside']
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => !!el)
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && setCurrent(entry.target.id)),
      { rootMargin: '-45% 0px -50% 0px' },
    )
    sections.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  // Lock scrolling and manage focus while the mobile menu is open.
  useEffect(() => {
    if (!open) return
    if (lenis) lenis.stop()
    else document.documentElement.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    const focus = window.setTimeout(() => firstLink.current?.focus(), 250)
    return () => {
      if (lenis) lenis.start()
      else document.documentElement.style.overflow = ''
      window.removeEventListener('keydown', onKey)
      window.clearTimeout(focus)
      menuButton.current?.focus({ preventScroll: true })
    }
  }, [open, lenis])

  const go = (e: MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    setOpen(false)
    const target = document.getElementById(id)
    if (!target) return
    if (lenis) {
      lenis.start()
      lenis.scrollTo(id === 'top' ? 0 : target, { duration: 1.4, force: true })
    } else {
      target.scrollIntoView()
    }
  }

  return (
    <>
      <motion.header
        initial={{ y: -110, opacity: 0 }}
        animate={{ y: hidden && !open ? -120 : 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: EASE_OUT_EXPO }}
        className="fixed inset-x-0 top-0 z-50 px-3 pt-3 md:px-6 md:pt-4"
      >
        <nav
          aria-label="Primary"
          className="mx-auto flex h-16 max-w-[1360px] items-center justify-between rounded-full border border-white/55 bg-white/45 pl-4 pr-2 shadow-[0_12px_40px_-14px_rgba(19,38,26,0.3)] backdrop-blur-xl backdrop-saturate-150 md:h-[72px] md:pl-6"
        >
          <a href="#top" onClick={(e) => go(e, 'top')} aria-label="Fubbly Fizz, back to top" className="rounded-lg">
            <img src={logo} alt="Fubbly Fizz" className="h-9 w-auto md:h-11" />
          </a>

          <ul className="hidden items-center gap-1 md:flex">
            {LINKS.map((link) => (
              <li key={link.id}>
                <a
                  href={`#${link.id}`}
                  onClick={(e) => go(e, link.id)}
                  aria-current={current === link.id ? 'location' : undefined}
                  className={cn(
                    'relative flex items-center gap-2 rounded-full px-4 py-2.5 text-[15px] font-semibold text-ink transition-colors duration-300 hover:bg-white/60',
                    current === link.id && 'bg-white/70',
                  )}
                >
                  {current === link.id && <span className="h-1.5 w-1.5 rounded-full bg-pink" />}
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <a
              href="#inside"
              onClick={(e) => go(e, 'inside')}
              className="group hidden h-12 items-center gap-3 rounded-full bg-ink pl-6 pr-2 text-[15px] font-semibold text-paper transition-colors duration-300 hover:bg-[#1f3a27] md:inline-flex"
            >
              Inside the can
              <span className="grid h-8 w-8 place-items-center overflow-hidden rounded-full bg-mango text-ink">
                <ArrowIcon className="h-4 w-4 transition-transform duration-500 ease-out-expo group-hover:translate-x-0.5 group-hover:-rotate-45" />
              </span>
            </a>
            <button
              ref={menuButton}
              type="button"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? 'Close menu' : 'Open menu'}
              onClick={() => setOpen((o) => !o)}
              className="relative grid h-12 w-12 place-items-center rounded-full bg-ink text-paper md:hidden"
            >
              <span
                className={cn(
                  'absolute h-[2px] w-5 rounded-full bg-current transition-transform duration-500 ease-out-expo',
                  open ? 'rotate-45' : '-translate-y-[4px]',
                )}
              />
              <span
                className={cn(
                  'absolute h-[2px] w-5 rounded-full bg-current transition-transform duration-500 ease-out-expo',
                  open ? '-rotate-45' : 'translate-y-[4px]',
                )}
              />
            </button>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            key="menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="fixed inset-0 z-40 flex flex-col overflow-y-auto bg-ink px-6 pb-[calc(2rem_+_env(safe-area-inset-bottom))] pt-28 text-paper md:hidden"
            initial={{ clipPath: 'circle(0% at 88% 44px)' }}
            animate={{ clipPath: 'circle(150% at 88% 44px)' }}
            exit={{ clipPath: 'circle(0% at 88% 44px)' }}
            transition={{ duration: 0.7, ease: EASE_IN_OUT_QUART }}
          >
            <ul className="space-y-1">
              {[...LINKS, { id: 'inside', label: 'Inside the can' }].map((link, k) => (
                <motion.li
                  key={link.id}
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, ease: EASE_OUT_EXPO, delay: 0.18 + k * 0.06 }}
                >
                  <a
                    ref={k === 0 ? firstLink : undefined}
                    href={`#${link.id}`}
                    onClick={(e) => go(e, link.id)}
                    className="type-display flex items-center justify-between border-b border-white/10 py-4 text-[2.75rem]"
                  >
                    {link.label}
                    <ArrowIcon className="h-6 w-6 opacity-50" />
                  </a>
                </motion.li>
              ))}
            </ul>

            <motion.div
              className="mt-auto pt-10"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, ease: EASE_OUT_EXPO, delay: 0.4 }}
            >
              <p className="eyebrow opacity-60">Jump to a flavour</p>
              <div className="mt-4 grid grid-cols-3 gap-2.5">
                {FLAVOURS.map((flavour) => (
                  <a
                    key={flavour.id}
                    href={`#${flavour.id}`}
                    onClick={(e) => go(e, flavour.id)}
                    className="overflow-hidden rounded-[22px] pb-3 pt-4 text-center"
                    style={{ backgroundColor: flavour.palette.bg, color: flavour.palette.ink }}
                  >
                    <img src={flavour.can} alt="" className="mx-auto h-24 w-auto rotate-12" />
                    <span className="mt-2 block text-sm font-semibold">{flavour.name}</span>
                  </a>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
