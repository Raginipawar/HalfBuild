import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import { ArrowRight, Moon, Sun } from 'lucide-react'
import HeroCity from '../iso/HeroCity'
import { HalfCircle, PixelSquares } from '../components/Decor'
import { useCurrentUser } from '../store/useStore'

export default function Landing() {
  const user = useCurrentUser()
  const reduce = useReducedMotion()
  const [night, setNight] = useState(false)

  const rise = (i) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 28 },
          animate: { opacity: 1, y: 0 },
          transition: { delay: 0.1 + i * 0.09, type: 'spring', stiffness: 120, damping: 18 },
        }

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <HalfCircle side="bottom" className="pointer-events-none absolute -right-16 -top-2 w-56 sm:w-80" />
        <PixelSquares className="absolute left-4 top-6 sm:left-8" />

        <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-20 text-center sm:px-8 sm:pt-28">
          <motion.p {...rise(0)} className="eyebrow">
            Problem Statement 05 · The Project Graveyard
          </motion.p>
          <motion.h1 {...rise(1)} className="display mx-auto mt-6 max-w-5xl">
            Every unfinished project deserves <em className="italic">another floor.</em>
          </motion.h1>
          <motion.p {...rise(2)} className="lead mx-auto mt-6 max-w-2xl">
            Turn your abandoned projects into a living city, then decide which ones to bring back.
          </motion.p>
          <motion.div {...rise(3)} className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link to={user ? '/city' : '/signup'} className="btn btn-primary">
              Build my city <ArrowRight size={16} />
            </Link>
            <a href="#demo-city" className="btn btn-ghost">See a demo city</a>
          </motion.div>
        </div>

        {/* The living city */}
        <motion.div {...rise(4)} id="demo-city" className="relative mx-auto max-w-7xl scroll-mt-24 px-4 sm:px-8">
          <div
            data-city={night ? 'night' : 'day'}
            className="relative overflow-hidden rounded-[1.75rem] border border-ink transition-colors duration-700"
            style={{ background: 'linear-gradient(180deg, var(--sky-top), var(--sky-bottom))' }}
          >
            <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between p-4 sm:p-6">
              <span className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ${night ? 'bg-white/10 text-paper' : 'bg-paper text-ink'} border ${night ? 'border-white/20' : 'border-ink'}`}>
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-light opacity-70" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-light" />
                </span>
                Demo city · 13 projects
              </span>
              <button
                type="button"
                onClick={() => setNight(!night)}
                className={`btn btn-sm border ${night ? 'border-white/30 text-paper hover:bg-white/10' : 'border-ink bg-paper text-ink hover:bg-ink hover:text-paper'}`}
                aria-pressed={night}
              >
                {night ? <Sun size={15} /> : <Moon size={15} />}
                {night ? 'City sleeping' : 'City awake'}
              </button>
            </div>
            <div className="px-1 pb-2 pt-16 sm:px-12 sm:pt-12">
              <HeroCity />
            </div>
          </div>
          <p className={`mt-3 text-center text-xs text-muted`}>Hover a building to read it. Toggle night to see which projects are still lit.</p>
        </motion.div>
      </section>

      {/* Placeholder strip until the full Home sections land in phase 3 */}
      <section className="mx-auto mt-20 max-w-7xl px-4 sm:px-8">
        <div className="panel grid gap-6 p-8 sm:grid-cols-[1.2fr_2fr] sm:p-12">
          <p className="subtitle">Height is progress. Darkness is time since you last touched it.</p>
          <ul className="grid gap-4 text-sm text-white/75 sm:grid-cols-2">
            <li><b className="text-paper">Solid floors</b> are the parts you finished.</li>
            <li><b className="text-paper">Dashed scaffolding</b> is what is still to build.</li>
            <li><b className="text-paper">Dark windows</b> mean it has been left alone a while.</li>
            <li><b className="text-paper">A crane</b> means it is being revived right now.</li>
          </ul>
        </div>
      </section>
    </main>
  )
}
