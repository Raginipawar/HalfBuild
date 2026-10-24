import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from 'motion/react'
import { ArrowDown, ArrowRight } from 'lucide-react'
import { useCurrentUser } from '../store/useStore'

// First impression: a scroll driven story. The skyline is drawn flat, like the
// buildings on our slides, and every chapter changes it in a way that explains the product.

const W = 1200
const H = 520
const GROUND = 470
const FH = 24 // floor height

// x, width, finished floors, unfinished floors, window columns, roof, how dark it gets, revived at the end, sign
const CITY = [
  { x: 40, w: 70, f: 6, p: 2, c: 3, roof: 'antenna', dark: 1, sign: 'EXAMS' },
  { x: 128, w: 96, f: 9, p: 1, c: 4, roof: 'tank', dark: 0.5, revive: true },
  { x: 244, w: 64, f: 4, p: 3, c: 2, roof: 'flat', dark: 0.9 },
  { x: 326, w: 110, f: 12, p: 2, c: 5, roof: 'step', dark: 0.7, revive: true, crane: true, focus: true },
  { x: 456, w: 76, f: 7, p: 0, c: 3, roof: 'flag', dark: 0 },
  { x: 552, w: 88, f: 5, p: 4, c: 4, roof: 'flat', dark: 1, sign: 'SCOPE' },
  { x: 660, w: 60, f: 8, p: 1, c: 2, roof: 'antenna', dark: 0.6 },
  { x: 740, w: 104, f: 10, p: 2, c: 4, roof: 'tank', dark: 0.8, revive: true },
  { x: 864, w: 72, f: 3, p: 3, c: 3, roof: 'flat', dark: 1, sign: 'STUCK' },
  { x: 956, w: 92, f: 7, p: 1, c: 4, roof: 'step', dark: 0.4 },
  { x: 1068, w: 92, f: 5, p: 2, c: 4, roof: 'antenna', dark: 0.9 },
]

const CHAPTERS = [
  { at: 0.0, title: 'Every builder has a folder of unfinished projects.', sub: 'Scroll to see what happens to them.' },
  { at: 0.17, title: 'Some got halfway.', sub: 'Finished parts stand as solid floors. Unfinished parts are scaffolding.' },
  { at: 0.38, title: 'Then life happened.', sub: 'Exams, scope, a bug that would not die. The lights go out one by one.' },
  { at: 0.58, title: 'HALFBUILT turns them into a city you can read.', sub: 'Height is progress. Darkness is time since you last touched it.' },
  { at: 0.78, title: 'Every unfinished project deserves another floor.', sub: 'Inspect each one, pick a path, and bring the right ones back.', final: true },
]

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const seeded = (i, j) => ((Math.sin(i * 12.9898 + j * 78.233) * 43758.5453) % 1 + 1) % 1

export default function StoryHero() {
  const reduce = useReducedMotion()
  const ref = useRef(null)
  const [p, setP] = useState(reduce ? 1 : 0)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  useMotionValueEvent(scrollYProgress, 'change', (v) => !reduce && setP(v))

  const chapter = [...CHAPTERS].reverse().find((c) => p >= c.at) ?? CHAPTERS[0]
  const idx = CHAPTERS.indexOf(chapter)

  return (
    <section ref={ref} className={reduce ? 'relative' : 'relative h-[520vh]'} aria-label="The HALFBUILT story">
      <div className={`${reduce ? '' : 'sticky top-16'} flex h-[calc(100vh-4rem)] min-h-[560px] flex-col overflow-hidden`}>
        <Captions chapter={chapter} idx={idx} />
        <div className="relative flex-1">
          <Skyline p={p} />
        </div>
        {/* chapter dots */}
        <ol className="absolute right-4 top-1/2 hidden -translate-y-1/2 flex-col gap-3 sm:flex" aria-hidden>
          {CHAPTERS.map((c, i) => (
            <li key={i} className={`h-2 w-2 rounded-full border border-ink transition-colors ${i <= idx ? 'bg-ink' : ''}`} />
          ))}
        </ol>
        {!reduce && p < 0.04 && (
          <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-muted" animate={{ y: [0, 6, 0] }} transition={{ duration: 1.6, repeat: Infinity }}>
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
    <div className="relative z-10 mx-auto w-full max-w-5xl px-4 pt-10 text-center sm:pt-14">
      <p className="eyebrow">Chapter {idx + 1} of {CHAPTERS.length} · The city story</p>
      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -24, filter: 'blur(6px)' }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1 className={chapter.final ? 'display mt-4' : 'title mt-4'}>{chapter.title}</h1>
          <p className="lead mx-auto mt-3 max-w-2xl">{chapter.sub}</p>
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

function Skyline({ p }) {
  const ground = clamp(p / 0.08) // ground line draws in
  const plots = clamp((p - 0.04) / 0.1) // dashed plots appear
  const rise = clamp((p - 0.17) / 0.18) // floors rise
  const fade = clamp((p - 0.4) / 0.16) // lights go out
  const revive = clamp((p - 0.8) / 0.12) // crane and lights return
  const labels = clamp((p - 0.6) / 0.08) * (1 - revive)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMax meet" className="absolute inset-0 h-full w-full" role="img"
      aria-label="A skyline of unfinished projects: solid floors, dashed scaffolding, windows that go dark over time and a crane on the one being revived.">

      {/* ground and road */}
      <line x1={W / 2 - (W / 2) * ground} x2={W / 2 + (W / 2) * ground} y1={GROUND} y2={GROUND} stroke="var(--color-ink)" strokeWidth="2" />
      <line x1="0" x2={W} y1={GROUND + 26} y2={GROUND + 26} stroke="var(--color-soft)" strokeWidth="1.5" strokeDasharray="14 12" opacity={ground} />

      {CITY.map((b, i) => {
        const order = i / CITY.length
        const local = clamp(rise * 1.6 - order * 0.6)
        const built = Math.round(local * b.f)
        const dark = fade * b.dark * (b.revive ? 1 - revive : 1)
        const top = GROUND - built * FH
        const cw = (b.w - 14) / b.c
        return (
          <g key={i}>
            {/* plot outline */}
            <rect x={b.x} y={GROUND - 6} width={b.w} height="6" fill="none" stroke="var(--color-soft)" strokeDasharray="4 3" opacity={plots * (built ? 0 : 1)} />

            {/* solid floors */}
            {Array.from({ length: built }, (_, k) => {
              const y = GROUND - (k + 1) * FH
              return (
                <g key={k}>
                  <rect x={b.x} y={y} width={b.w} height={FH} fill="var(--color-ink)" />
                  {Array.from({ length: b.c }, (_, c) => {
                    const off = seeded(i * 31 + k, c) < dark
                    return (
                      <rect key={c} x={b.x + 7 + c * cw + cw * 0.18} y={y + 6} width={cw * 0.64} height={FH - 12} rx="1"
                        fill={off ? 'var(--color-soft)' : 'var(--color-light)'} opacity={off ? 0.35 : 1}
                        style={{ transition: 'fill 300ms, opacity 300ms' }} />
                    )
                  })}
                </g>
              )
            })}

            {/* scaffolding floors */}
            {built === b.f && Array.from({ length: b.p }, (_, k) => {
              const y = top - (k + 1) * FH
              return (
                <g key={`s${k}`} stroke="var(--color-soft)" strokeWidth="1.3" strokeDasharray="4 3" fill="none" opacity={clamp(local * 3 - 2)}>
                  <rect x={b.x + 1} y={y} width={b.w - 2} height={FH} />
                  <line x1={b.x + 1} y1={y + FH} x2={b.x + b.w - 1} y2={y} />
                </g>
              )
            })}

            {/* roof details on finished towers */}
            {built === b.f && b.p === 0 && b.roof === 'flag' && (
              <g><line x1={b.x + b.w / 2} y1={top} x2={b.x + b.w / 2} y2={top - 30} stroke="var(--color-ink)" strokeWidth="2" /><path d={`M${b.x + b.w / 2} ${top - 30} l18 6 l-18 6z`} fill="var(--color-light)" /></g>
            )}
            {built === b.f && b.roof === 'antenna' && b.p === 0 && <line x1={b.x + b.w / 2} y1={top} x2={b.x + b.w / 2} y2={top - 24} stroke="var(--color-ink)" strokeWidth="2" />}

            {/* reason sign at the base */}
            {b.sign && (
              <g opacity={fade}>
                <rect x={b.x + b.w / 2 - 34} y={GROUND + 6} width="68" height="16" rx="2" fill="var(--color-card)" stroke="var(--color-ink)" />
                <text x={b.x + b.w / 2} y={GROUND + 17.5} textAnchor="middle" fontSize="8.5" fontWeight="600" letterSpacing="1" fill="var(--color-ink)">PAUSED: {b.sign}</text>
              </g>
            )}

            {/* crane on the project being revived */}
            {b.crane && revive > 0 && (
              <g transform={`translate(0 ${(1 - revive) * -60})`} opacity={revive}>
                <g className="crane-swing" style={{ transformOrigin: `${b.x + 20}px ${top - b.p * FH - 80}px` }}>
                  <line x1={b.x + 20} y1={top - b.p * FH} x2={b.x + 20} y2={top - b.p * FH - 80} stroke="var(--color-ink)" strokeWidth="3" />
                  <line x1={b.x - 20} y1={top - b.p * FH - 80} x2={b.x + 150} y2={top - b.p * FH - 80} stroke="var(--color-ink)" strokeWidth="3" />
                  <line x1={b.x + 120} y1={top - b.p * FH - 80} x2={b.x + 120} y2={top - b.p * FH - 40} stroke="var(--color-ink)" strokeWidth="1.2" />
                  <rect x={b.x + 113} y={top - b.p * FH - 40} width="14" height="10" fill="var(--color-light)" />
                </g>
              </g>
            )}

          </g>
        )
      })}

      {/* chapter 4 labels, drawn last so nothing covers them */}
            {labels > 0 && (() => { const b = CITY.find((x) => x.focus); const top = GROUND - b.f * FH; return (
              <g opacity={labels} fontSize="13" fill="var(--color-ink)">
                {[
                  [top - FH, 'Scaffolding: parts still unfinished'],
                  [top + FH * 3, 'Solid floors: parts you finished'],
                  [top + FH * 7, 'Dark windows: left alone a while'],
                ].map(([y, t]) => (
                  <g key={t}>
                    <circle cx={b.x + b.w + 6} cy={y} r="3" fill="var(--color-ink)" />
                    <line x1={b.x + b.w + 6} y1={y} x2={b.x + b.w + 70} y2={y - 26} stroke="var(--color-ink)" />
                    <rect x={b.x + b.w + 70} y={y - 40} width={t.length * 6.7 + 16} height="26" rx="13" fill="var(--color-card)" stroke="var(--color-ink)" />
                    <text x={b.x + b.w + 78} y={y - 22.5} fontWeight="500">{t}</text>
                  </g>
                ))}
              </g>
            ) })()}

      {/* street lamps and trees */}
      {[110, 236, 545, 650, 950].map((x, i) => (
        <g key={x} opacity={ground}>
          <line x1={x} y1={GROUND} x2={x} y2={GROUND - 34} stroke="var(--color-soft)" strokeWidth="1.5" />
          <circle cx={x} cy={GROUND - 36} r="10" fill="var(--color-light)" opacity={0.18 + 0.25 * fade} />
          <circle cx={x} cy={GROUND - 36} r="3" fill="var(--color-light)" />
          {i % 2 === 0 && <circle cx={x + 10} cy={GROUND - 12} r="10" fill="var(--color-grey)" />}
        </g>
      ))}
    </svg>
  )
}
