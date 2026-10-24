import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import { ArrowRight } from 'lucide-react'
import HeroCity from '../iso/HeroCity'
import { useCurrentUser } from '../store/useStore'

// How to read the city, shown right under it so nothing needs explaining.
const LEGEND = [
  {
    title: 'Solid floor',
    text: 'A part you finished. Each one stacks up from the ground.',
    icon: (
      <svg viewBox="0 0 40 28" className="h-7 w-10" aria-hidden>
        <rect x="6" y="6" width="28" height="16" rx="2" fill="var(--face-l)" stroke="var(--edge)" />
        <rect x="10" y="11" width="5" height="6" rx="1" fill="var(--light)" />
        <rect x="18" y="11" width="5" height="6" rx="1" fill="var(--light)" />
        <rect x="26" y="11" width="5" height="6" rx="1" fill="var(--window-off)" />
      </svg>
    ),
  },
  {
    title: 'Scaffolding',
    text: 'A part still to build. Dashed lines wait on the roof.',
    icon: (
      <svg viewBox="0 0 40 28" className="h-7 w-10" aria-hidden>
        <g stroke="var(--scaffold)" strokeWidth="1.4" strokeDasharray="3 2.5" fill="none">
          <rect x="6" y="6" width="28" height="16" rx="1" />
          <path d="M6 22 34 6" />
        </g>
      </svg>
    ),
  },
  {
    title: 'Dark windows',
    text: 'Left alone for a while. Lights fade after one month, then six.',
    icon: (
      <svg viewBox="0 0 40 28" className="h-7 w-10" aria-hidden>
        <rect x="6" y="6" width="28" height="16" rx="2" fill="var(--face-r)" stroke="var(--edge)" />
        <rect x="10" y="11" width="5" height="6" rx="1" fill="var(--window-off)" />
        <rect x="18" y="11" width="5" height="6" rx="1" fill="var(--window-off)" />
        <rect x="26" y="11" width="5" height="6" rx="1" fill="var(--window-off)" />
      </svg>
    ),
  },
  {
    title: 'Crane',
    text: 'Being revived. The lights come back on while you build.',
    icon: (
      <svg viewBox="0 0 40 28" className="h-7 w-10" aria-hidden>
        <g stroke="var(--crane)" strokeWidth="2" strokeLinecap="round">
          <path d="M12 25V5M6 5h28" />
          <path d="M28 5v9" strokeWidth="1" />
        </g>
        <rect x="25.5" y="14" width="5" height="4" rx="1" fill="var(--crane)" />
      </svg>
    ),
  },
]

export default function Landing() {
  const user = useCurrentUser()
  const reduce = useReducedMotion()
  const fade = (i) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 14 },
          animate: { opacity: 1, y: 0 },
          transition: { delay: i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
        }

  return (
    <main>
      <section className="relative overflow-hidden">
        <div aria-hidden className="pastel-wash pointer-events-none absolute -inset-x-20 -top-20 h-[620px]" />

        <div className="relative mx-auto max-w-6xl px-4 pt-16 text-center sm:px-6 sm:pt-24">
          <motion.p {...fade(0)} className="eyebrow">
            A city for your unfinished projects
          </motion.p>
          <motion.h1 {...fade(1)} className="heading-1 mx-auto mt-5 max-w-4xl">
            Every unfinished project deserves another floor.
          </motion.h1>
          <motion.p {...fade(2)} className="text-large mx-auto mt-5 max-w-2xl text-muted">
            Turn your abandoned projects into a living city, and decide which ones to bring back.
          </motion.p>
          <motion.div {...fade(3)} className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to={user ? '/city' : '/signup'} className="btn btn-primary">
              Build my city <ArrowRight size={16} />
            </Link>
            <a href="#read-the-city" className="btn btn-ghost">How to read it</a>
          </motion.div>
        </div>

        <motion.div {...fade(4)} className="relative mx-auto mt-14 max-w-6xl px-4 sm:px-6">
          <div className="city-sky relative overflow-hidden rounded-2xl border border-line">
            <div className="absolute left-4 top-4 z-10 flex items-center gap-2 sm:left-5 sm:top-5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-light opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-light" />
              </span>
              <span className="eyebrow">Demo city · 13 projects</span>
            </div>
            <span className="eyebrow absolute right-4 top-4 z-10 hidden sm:right-5 sm:top-5 sm:block">
              Hover a building
            </span>
            <div className="px-2 pb-2 pt-12 sm:px-10 sm:pt-10">
              <HeroCity />
            </div>
          </div>
        </motion.div>
      </section>

      <section id="read-the-city" className="mx-auto max-w-6xl scroll-mt-20 px-4 sm:px-6">
        <p className="eyebrow pb-4 pt-16">How to read the city</p>
        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {LEGEND.map((l) => (
            <div key={l.title} className="flex gap-4 bg-bg p-6">
              <div className="shrink-0 pt-0.5">{l.icon}</div>
              <div>
                <h2 className="text-[15px] font-medium">{l.title}</h2>
                <p className="mt-1 text-sm leading-relaxed text-muted">{l.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-10 sm:px-6">
        <span className="eyebrow">HALFBUILT · Code Variant Build 01</span>
        <span className="text-sm text-muted">Paused construction is still construction.</span>
      </footer>
    </main>
  )
}
