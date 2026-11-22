import { useLenis } from 'lenis/react'
import { FLAVOURS } from '@/data/flavours'
import { ArrowIcon, RevealLines } from '@/components/ui'
import logo from '@/assets/fubbly-fizz-logo.png'

export function Footer() {
  const lenis = useLenis()
  const toTop = () => (lenis ? lenis.scrollTo(0, { duration: 2.2 }) : window.scrollTo({ top: 0 }))

  return (
    <footer className="relative -mt-16 bg-mango pt-16 text-mango-ink">
      <div className="mx-auto max-w-[1400px] px-5 pt-20 md:px-10 md:pt-28">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <p className="eyebrow opacity-70">Three flavours. One happy gut.</p>
            <h2 className="type-display mt-5 text-[clamp(4.5rem,14.5vw,14rem)] leading-[0.82]">
              <RevealLines
                lines={[
                  <>
                    Stay <span className="font-serif font-normal italic tracking-[-0.02em] [font-stretch:100%]">fizzy.</span>
                  </>,
                ]}
              />
            </h2>
          </div>
          <div className="lg:col-span-4 lg:pb-5">
            <p className="max-w-sm text-lg leading-relaxed">
              Indian-inspired probiotic soda in three flavours, made to be good for your gut.
            </p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {FLAVOURS.map((flavour) => (
                <li key={flavour.id}>
                  <a
                    href={`#${flavour.id}`}
                    className="flex items-center gap-2 rounded-full border border-current/25 px-4 py-2 text-sm font-semibold transition-colors duration-300 hover:bg-ink hover:text-mango"
                  >
                    <span
                      className="h-2 w-2 rounded-full ring-1 ring-black/20"
                      style={{ backgroundColor: flavour.palette.bg }}
                    />
                    {flavour.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-6 border-t border-current/20 py-8 md:mt-24 md:flex-row md:items-center md:justify-between">
          <img src={logo} alt="Fubbly Fizz" className="h-12 w-auto self-start md:self-auto" />
          <p className="text-[15px]">Indian-inspired probiotic soda.</p>
          <p className="text-sm opacity-70">© {new Date().getFullYear()} Fubbly Fizz</p>
          <button
            type="button"
            onClick={toTop}
            className="group inline-flex cursor-pointer items-center gap-3 self-start text-[15px] font-semibold md:self-auto"
          >
            Back to top
            <span className="grid h-11 w-11 place-items-center rounded-full bg-ink text-mango transition-transform duration-500 ease-out-expo group-hover:-translate-y-1">
              <ArrowIcon className="h-4 w-4 -rotate-90" />
            </span>
          </button>
        </div>
      </div>
    </footer>
  )
}
