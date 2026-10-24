import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from 'motion/react'
import { ArrowDown, ArrowRight } from 'lucide-react'
import { useCurrentUser } from '../store/useStore'

// First impression: a scroll driven story told over one city illustration.
// Scrolling travels up the street, dims the city to dusk when "life happens",
// then brings the warm light back for the revival.

const CHAPTERS = [
  { at: 0.0, title: 'Every builder has a folder of unfinished projects.', sub: 'Scroll to walk through the city they left behind.' },
  { at: 0.17, title: 'Some got halfway.', sub: 'Finished parts stand as solid floors. Unfinished parts wait as scaffolding.' },
  { at: 0.38, title: 'Then life happened.', sub: 'Exams, scope, a bug that would not die. The lights go out one by one.' },
  { at: 0.58, title: 'HALFBUILT turns them into a city you can read.', sub: 'Height is progress. Darkness is time since you last touched it.' },
  { at: 0.78, title: 'Every unfinished project deserves another floor.', sub: 'Inspect each one, pick a path, and bring the right ones back.', final: true },
]

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))

export default function StoryHero() {
  const reduce = useReducedMotion()
  const ref = useRef(null)
  const [p, setP] = useState(reduce ? 1 : 0)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  useMotionValueEvent(scrollYProgress, 'change', (v) => !reduce && setP(v))

  const chapter = [...CHAPTERS].reverse().find((c) => p >= c.at) ?? CHAPTERS[0]
  const idx = CHAPTERS.indexOf(chapter)

  return (
    <section ref={ref} id="story" className={reduce ? 'relative' : 'relative h-[500vh]'} aria-label="The HALFBUILT story">
      <div className={`${reduce ? '' : 'sticky top-16'} mx-auto flex h-[calc(100vh-4rem)] min-h-[600px] max-w-7xl flex-col items-center justify-center gap-8 px-4 py-6 sm:px-8`}>
        <Captions chapter={chapter} idx={idx} />
        <Postcard p={p} />
        <ol className="absolute right-3 top-1/2 hidden -translate-y-1/2 flex-col gap-3 xl:flex" aria-hidden>
          {CHAPTERS.map((c, i) => (
            <li key={i} className={`h-2 w-2 rounded-full border border-ink transition-colors ${i <= idx ? 'bg-ink' : ''}`} />
          ))}
        </ol>
        {!reduce && p < 0.04 && (
          <motion.div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-muted" animate={{ y: [0, 6, 0] }} transition={{ duration: 1.6, repeat: Infinity }} aria-hidden>
            <ArrowDown size={20} />
          </motion.div>
        )}
      </div>
    </section>
  )
}

function Captions({ chapter, idx }) {
  const user = useCurrentUser()
  return (
    <div className="text-center">
      <p className="eyebrow">Chapter {idx + 1} of {CHAPTERS.length} · The city story</p>
      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -24, filter: 'blur(6px)' }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="title mx-auto mt-4 max-w-4xl">{chapter.title}</h2>
          <p className="lead mx-auto mt-3 max-w-xl">{chapter.sub}</p>
          {chapter.final && (
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link to={user ? '/city' : '/signup'} className="btn btn-primary">Build my city <ArrowRight size={16} /></Link>
              <a href="#demo-city" className="btn btn-ghost">See a demo city</a>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function Postcard({ p }) {
  const travel = clamp(p / 0.6) // pan across the skyline
  const zoom = 1.55 - 0.55 * clamp((p - 0.6) / 0.25) // zoom out at the end
  const dusk = clamp((p - 0.38) / 0.15) * (1 - clamp((p - 0.8) / 0.12))
  const glow = clamp((p - 0.8) / 0.12)
  const label = clamp((p - 0.58) / 0.06) * (1 - clamp((p - 0.76) / 0.04))

  return (
    <figure className="relative mx-auto w-full max-w-5xl">
      <div className="relative mx-auto aspect-[734/412] max-h-[56vh] overflow-hidden rounded-[1.5rem] border border-ink shadow-[0_30px_80px_-30px_rgba(0,0,0,0.35)]" style={{ maxWidth: 'calc(56vh * 734 / 412)' }}>
        <img
          src="/story/skyline.jpg"
          alt="A coloured pencil drawing of a city skyline under a blue sky."
          className="absolute inset-0 h-full w-full object-cover"
          style={{ transform: `scale(${zoom})`, transformOrigin: `${15 + travel * 70}% 70%` }}
          draggable="false"
        />
        {/* dusk: the lights go out */}
        <div className="absolute inset-0 bg-[#141a33] mix-blend-multiply" style={{ opacity: dusk * 0.6 }} aria-hidden />
        {/* revival: warm light returns */}
        <div className="absolute inset-0 mix-blend-screen" style={{ opacity: glow * 0.45, background: 'radial-gradient(60% 50% at 50% 70%, #F5B942, transparent 70%)' }} aria-hidden />

        {/* chapter 4: the city becomes readable */}
        <div className="absolute bottom-4 left-4 w-72 max-w-[80%] space-y-2" style={{ opacity: label, transform: `translateY(${(1 - label) * 16}px)` }} aria-hidden>
          {[
            ['Habit Tracker', '3 floors built · 2 to go · paused: exams'],
            ['Recipe Remix', 'untouched 7 months · windows dark'],
          ].map(([n, t]) => (
            <div key={n} className="on-night rounded-xl px-3.5 py-2.5 shadow-lg">
              <p className="text-sm font-semibold">{n}</p>
              <p className="text-[11px] uppercase tracking-[0.12em] text-white/60">{t}</p>
            </div>
          ))}
        </div>
      </div>
    </figure>
  )
}
