import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from 'motion/react'
import { ArrowRight } from 'lucide-react'
import { useStore, useCurrentUser } from '../store/useStore'
import City from '../iso/City'

// The city story: three scrolls, told with our own city and our own lighting rules.
// 1. Projects rise floor by floor. 2. Time passes and untouched ones go dark.
// 3. A few get revived: cranes appear and their lights come back.

const CHAPTERS = [
  { title: 'Every builder has a folder of unfinished projects.', sub: 'Each one becomes a building. Finished parts are solid floors, unfinished parts are scaffolding.' },
  { title: 'Then life happened.', sub: 'Months pass. Projects nobody touches slowly go dark. Only the ones being revived keep their lights on.' },
  { title: 'Every unfinished project deserves another floor.', sub: 'Inspect each one, pick a path, and bring the right ones back.', final: true },
]

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const now = new Date().toISOString()

export default function StoryHero() {
  const reduce = useReducedMotion()
  const user = useCurrentUser()
  const ref = useRef(null)
  const [p, setP] = useState(reduce ? 1 : 0)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  useMotionValueEvent(scrollYProgress, 'change', (v) => !reduce && setP(v))

  const all = useStore((s) => s.projects)
  const users = useStore((s) => s.users)
  const base = useMemo(() => all.slice(0, 12), [all])
  // the three paused projects that come back to life in chapter 3
  const comeback = useMemo(() => new Set(base.filter((x) => x.status === 'paused').slice(0, 3).map((x) => x.id)), [base])

  const idx = p < 1 / 3 ? 0 : p < 2 / 3 ? 1 : 2
  const rise = clamp(p / 0.28)
  const dark = clamp((p - 0.36) / 0.24)
  const revive = clamp((p - 0.7) / 0.15)

  const projects = base.map((x) => {
    const revived = revive > 0.3 && comeback.has(x.id)
    return {
      ...x,
      completedParts: x.completedParts.slice(0, Math.ceil(rise * x.completedParts.length)),
      pendingParts: rise >= 1 ? x.pendingParts : [],
      status: revived ? 'reviving' : x.status,
      lastTouchedOn: revived || dark === 0 ? now : x.lastTouchedOn,
    }
  })
  const chapter = CHAPTERS[idx]

  return (
    <section ref={ref} id="story" className={reduce ? 'relative py-16' : 'relative h-[300vh]'} aria-label="The HALFBUILT city story">
      <div className={`${reduce ? '' : 'sticky top-16'} mx-auto flex h-[calc(100vh-4rem)] min-h-[600px] max-w-7xl flex-col gap-5 px-4 py-6 sm:px-8`}>
        <div className="text-center">
          <p className="eyebrow">Chapter {idx + 1} of 3 · The city story</p>
            {/* progress through the three chapters */}
          <div className="mx-auto mt-3 flex w-40 gap-1.5" aria-hidden>
            {[0, 1, 2].map((i) => (
              <div key={i} className={`h-1 flex-1 overflow-hidden rounded-full bg-ink/15`}>
                <div className="h-full bg-light" style={{ width: `${clamp(p * 3 - i) * 100}%` }} />
              </div>
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -20, filter: 'blur(6px)' }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <h2 className="title mx-auto mt-3 max-w-4xl">{chapter.title}</h2>
              <p className="lead mx-auto mt-3 max-w-2xl">{chapter.sub}</p>
              {chapter.final && (
                <div className="mt-5 flex flex-wrap justify-center gap-3">
                  <Link to={user ? '/city' : '/signup'} className="btn btn-primary">Build my city <ArrowRight size={16} /></Link>
                  <a href="#demo-city" className="btn btn-ghost">Explore the demo city</a>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div data-city="day" className="city-sketch relative min-h-0 flex-1">
          <div className="flex h-full items-center justify-center p-2 sm:p-6">
            <div className="flex h-full w-full max-w-4xl items-center [&_svg]:max-h-[calc(100vh-22rem)]">
              <div className="w-full"><City projects={projects} users={users} interactive={false} /></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
