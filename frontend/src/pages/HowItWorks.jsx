import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import { ArrowRight } from 'lucide-react'
import { Reveal } from '../components/ui'
import { PillHeading, PixelSquares } from '../components/Decor'
import { CONFIG, PATH_ORDER } from '../logic/revivalScore'
import { useCurrentUser } from '../store/useStore'

const JOURNEY = [
  ['Hello', 'A greeting in six languages, then the city.'],
  ['Sign up', 'Name, username and the skills you bring.'],
  ['My City', 'Every project you add stands as a building.'],
  ['Add a project', 'Finished parts become floors, unfinished parts scaffolding.'],
  ['Site Inspection', 'Six honest questions, one per screen.'],
  ['Revival plan', 'A score, a path, the reasons and a first step.'],
  ['Act on it', 'Revive, rework or lay it to rest as a landmark.'],
  ['City updates', 'Lights, floors, timeline and activity grid change.'],
]

export default function HowItWorks() {
  const reduce = useReducedMotion()
  const user = useCurrentUser()

  return (
    <main>
      <section className="mx-auto max-w-7xl px-4 pt-20 sm:px-8">
        <PixelSquares />
        <p className="eyebrow mt-6">How it works</p>
        <h1 className="display mt-4 max-w-5xl">From paused project to first step in about three minutes.</h1>
      </section>

      {/* Animated journey: a line draws through the steps as you scroll */}
      <section className="mx-auto mt-20 max-w-7xl px-4 sm:px-8">
        <Reveal><PillHeading number="01" note="The full journey">User flow</PillHeading></Reveal>
        <ol className="relative mt-12 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {JOURNEY.map(([title, text], i) => (
            <motion.li
              key={title}
              className={`relative rounded-[1.25rem] border border-ink p-6 ${[2, 4, 5].includes(i) ? 'on-night' : 'bg-card'}`}
              initial={reduce ? false : { opacity: 0, y: 30, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: (i % 4) * 0.12, type: 'spring', stiffness: 140, damping: 18 }}
            >
              <span className={`text-xs font-semibold tracking-[0.2em] ${[2, 4, 5].includes(i) ? 'text-white/50' : 'text-muted'}`}>0{i + 1}</span>
              <h3 className="mt-2 font-display text-xl font-semibold tracking-tight">{title}</h3>
              <p className={`mt-1 text-sm ${[2, 4, 5].includes(i) ? 'text-white/70' : 'text-muted'}`}>{text}</p>
              {(i + 1) % 4 !== 0 && (
                <motion.span
                  aria-hidden
                  className="absolute -right-6 top-1/2 hidden h-px w-6 origin-left bg-ink lg:block"
                  initial={reduce ? false : { scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + (i % 4) * 0.12, duration: 0.4 }}
                />
              )}
            </motion.li>
          ))}
        </ol>
        <p className="mt-6 text-sm text-muted">Always one tap away in the menu: Revival Leaderboard, Builders' Square, your profile and activity grid.</p>
      </section>

      <section className="mx-auto mt-28 max-w-7xl px-4 sm:px-8">
        <Reveal><PillHeading number="02" note="Recommended by your answers, chosen by you">The five revival paths</PillHeading></Reveal>
        <div className="mt-10 space-y-4">
          {PATH_ORDER.map((key, i) => {
            const p = CONFIG.paths[key]
            return (
              <Reveal key={key} delay={i * 0.05} className={`grid gap-4 rounded-[1.25rem] border border-ink p-6 md:grid-cols-[0.6fr_1.2fr_1fr] md:items-center ${i === 0 ? 'on-night' : 'bg-card'}`}>
                <p className="font-display text-2xl font-semibold uppercase tracking-tight">{p.label}</p>
                <p className={i === 0 ? 'text-white/75' : 'text-muted'}>{p.blurb}</p>
                <p className={`text-sm ${i === 0 ? 'text-white/60' : 'text-muted'}`}><b className={i === 0 ? 'text-paper' : 'text-ink'}>Example:</b> {p.example}</p>
              </Reveal>
            )
          })}
        </div>
        <Reveal className="card mt-10 p-7">
          <h3 className="subtitle">How the path is picked</h3>
          <ol className="mt-4 list-decimal space-y-1.5 pl-5 text-muted">
            <li><b className="text-ink">Change the idea</b> if you still care (3 or more) but the idea felt weak or is no longer relevant.</li>
            <li><b className="text-ink">Continue</b> if you care a lot (4 or more) and it is at least half done.</li>
            <li><b className="text-ink">Restart</b> if you care (3 or more) but it is under half done or untouched for over a year.</li>
            <li><b className="text-ink">Repurpose</b> if some parts are reusable elsewhere.</li>
            <li><b className="text-ink">Archive</b> otherwise, with three lessons learned.</li>
          </ol>
        </Reveal>
        <div className="mt-14 text-center">
          <Link to={user ? '/project/new' : '/signup'} className="btn btn-primary">{user ? 'Add a project' : 'Build my city'} <ArrowRight size={16} /></Link>
        </div>
      </section>
    </main>
  )
}
