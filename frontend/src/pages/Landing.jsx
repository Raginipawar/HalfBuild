import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { ArrowRight, Pause, Play, Plus, Search } from 'lucide-react'
import City from '../iso/City'
import BuildingView from '../iso/BuildingView'
import ActivityGrid from '../components/ActivityGrid'
import ProjectCard from '../components/ProjectCard'
import { Avatar, Reveal, ScoreRing } from '../components/ui'
import { HalfCircle, PillHeading, PixelSquares } from '../components/Decor'
import { useStore, useCurrentUser } from '../store/useStore'
import { CONFIG, inspect } from '../logic/revivalScore'
import { rankBuilders } from '../logic/leaderboard'
import { litRatio } from '../logic/buildingState'
import StoryHero from '../components/StoryHero'
import MeadowHero from '../components/MeadowHero'

const recent = new Date().toISOString()
const SAMPLE_PAUSED = { name: 'Paused', completedParts: ['a', 'b', 'c'], pendingParts: ['d', 'e'], status: 'paused', reason: 'time', lastTouchedOn: '2026-03-01T00:00:00Z' }
const SAMPLE_REVIVING = { name: 'Reviving', completedParts: ['a', 'b', 'c', 'd'], pendingParts: ['e'], status: 'reviving', reason: 'time', lastTouchedOn: recent }

export default function Landing() {
  return (
    <main>
      <MeadowHero />
      <StoryHero />
      <ProblemStrip />
      <HowItWorks />
      <Features />
      <ScoreDemo />
      <DemoCity />
      <CommunityPreview />
      <SquarePreview />
      <Voices />
      <Faq />
      <FinalCta />
    </main>
  )
}

const Container = ({ children, className = '' }) => <div className={`mx-auto max-w-7xl px-4 sm:px-8 ${className}`}>{children}</div>

function ProblemStrip() {
  const lines = [
    ['Time', 'Exams, jobs and life arrive, and the project quietly waits.'],
    ['Scope', 'A weekend idea grows into something too big to finish.'],
    ['Getting stuck', 'One hard bug or missing skill, and momentum is gone.'],
  ]
  return (
    <section className="mt-28">
      <Container>
        <Reveal className="panel grid gap-10 p-8 sm:p-14 lg:grid-cols-[1.2fr_1fr]">
          <p className="title !text-paper">
            The problem is not storing unfinished projects. It is <span className="text-light">deciding what to do</span> with each one.
          </p>
          <ul className="space-y-6">
            {lines.map(([k, v]) => (
              <li key={k} className="border-b border-white/15 pb-5 last:border-0">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">{k}</p>
                <p className="mt-1 text-lg text-white/85">{v}</p>
              </li>
            ))}
          </ul>
        </Reveal>
      </Container>
    </section>
  )
}

function HowItWorks() {
  const steps = [
    { n: '01', title: 'Add a project', text: 'List what you finished and what is left. Your building rises floor by floor.', art: <BuildingView project={SAMPLE_PAUSED} showSign={false} className="h-48" minFloors={6} /> },
    { n: '02', title: 'Run a Site Inspection', text: 'Six honest questions give a Revival Score, a recommended path and the reasons.', art: <div className="flex h-48 items-center"><ScoreRing score={72} size={150} /></div> },
    { n: '03', title: 'Revive it or lay it to rest', text: 'A crane appears and the lights come back on. Or it becomes a landmark with lessons.', art: <BuildingView project={SAMPLE_REVIVING} showSign={false} className="h-48" minFloors={6} /> },
  ]
  return (
    <section className="mt-28" id="how">
      <Container>
        <Reveal><PillHeading number="01" note="Three steps">How it works</PillHeading></Reveal>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.1} className="card flex flex-col p-6">
              <div className="flex items-center justify-center rounded-2xl bg-paper py-4">{s.art}</div>
              <p className="mt-6 text-xs font-semibold tracking-[0.2em] text-muted">{s.n}</p>
              <h3 className="subtitle mt-1">{s.title}</h3>
              <p className="mt-2 text-muted">{s.text}</p>
            </Reveal>
          ))}
        </div>
        <div className="mt-6 text-center"><Link to="/how-it-works" className="btn btn-ghost btn-sm">See the full journey <ArrowRight size={14} /></Link></div>
      </Container>
    </section>
  )
}

// tiny looping illustrations for the feature cards (plain CSS animations, see index.css)
function Icon({ kind }) {
  const s = { stroke: 'var(--color-ink)', strokeWidth: 1.5, fill: 'none' }
  const d = (i) => ({ animationDelay: `${i * 0.25}s` })
  return (
    <svg viewBox="0 0 64 48" className="h-12 w-16 overflow-visible" aria-hidden>
      {kind === 'city' && [10, 16, 22, 28].map((h, i) => (
        <rect key={i} className="fx-bar" style={d(i)} x={6 + i * 14} y={44 - h} width="10" height={h} rx="1" fill="var(--color-ink)" />
      ))}
      {kind === 'city' && <line x1="2" y1="44.5" x2="62" y2="44.5" {...s} />}
      {kind === 'inspect' && (<><rect x="18" y="6" width="28" height="38" {...s} /><line className="fx-scan" x1="12" x2="52" y1="40" y2="40" stroke="var(--color-light)" strokeWidth="2.5" /></>)}
      {kind === 'score' && (<><circle cx="32" cy="24" r="16" stroke="var(--color-grey)" strokeWidth="5" fill="none" /><circle className="fx-ring" cx="32" cy="24" r="16" stroke="var(--color-ink)" strokeWidth="5" fill="none" strokeLinecap="round" strokeDasharray="100.5" transform="rotate(-90 32 24)" /></>)}
      {kind === 'timeline' && (<><line x1="14" y1="6" x2="14" y2="44" {...s} />{[10, 24, 38].map((y, i) => (<g key={y}><circle className="fx-pulse" style={d(i)} cx="14" cy={y} r="4" fill={i === 0 ? 'var(--color-light)' : 'var(--color-ink)'} /><rect x="24" y={y - 2} width={30 - i * 6} height="4" rx="2" fill="var(--color-grey)" /></g>))}</>)}
      {kind === 'grid' && Array.from({ length: 24 }, (_, i) => (
        <rect key={i} className="fx-blink" style={d(i % 5)} x={6 + (i % 6) * 9} y={6 + Math.floor(i / 6) * 9} width="7" height="7" rx="1.5" fill={['#e9e9e3', '#ded3b9', '#b9ad8f', 'var(--color-ink)'][(i * 7) % 4]} />
      ))}
      {kind === 'square' && (<>{[[12, 10], [52, 10], [12, 40], [52, 40], [32, 4]].map(([x, y], i) => (<g key={i}><line x1="32" y1="25" x2={x} y2={y} {...s} /><circle className="fx-pulse" style={d(i)} cx={x} cy={y} r="4.5" fill="var(--color-paper)" stroke="var(--color-ink)" strokeWidth="1.5" /></g>))}<circle cx="32" cy="25" r="7" fill="var(--color-ink)" /></>)}
    </svg>
  )
}

function Features() {
  const items = [
    ['city', 'City view', 'Every project is a building. Height shows progress, scaffolding shows what is left.'],
    ['inspect', 'Site Inspection', 'One question per screen, with a scanner line moving up your building.'],
    ['score', 'Revival Score', 'A transparent score from 0 to 100. You can see exactly where every point came from.'],
    ['timeline', 'Construction log', 'Started, floors built, paused, inspected, revived. The whole story, dated.'],
    ['grid', 'Activity grid', 'GitHub style boxes that count revival work, not new starts.'],
    ['square', "Builders' Square", 'Open a project to co-builders and find the skills it is missing.'],
  ]
  return (
    <section className="mt-28">
      <Container>
        <Reveal><PillHeading number="02" note="Everything in one city">Features</PillHeading></Reveal>
        <div className="mt-10 grid gap-px overflow-hidden rounded-[1.5rem] border border-ink bg-ink sm:grid-cols-2 lg:grid-cols-3">
          {items.map(([k, title, text], i) => (
            <Reveal key={k} delay={(i % 3) * 0.08} className="group bg-card p-7 transition-colors hover:bg-paper">
              <Icon kind={k} />
              <h3 className="mt-5 font-display text-xl font-semibold tracking-tight">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{text}</p>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  )
}

function ScoreDemo() {
  const [a, setA] = useState({ completion: 60, interest: 4, relevance: 1 })
  const relevance = ['no', 'somewhat', 'yes'][a.relevance]
  const project = { completedParts: ['Habit list'], pendingParts: ['Reminders'], lastTouchedOn: recent }
  const result = inspect({ completion: a.completion, interest: a.interest, relevance, reason: 'time', effort: 'weeks', reusable: 'no' }, project)

  const sliders = [
    { k: 'completion', label: 'How much is done', min: 0, max: 100, step: 5, show: `${a.completion}%` },
    { k: 'interest', label: 'How much you still care', min: 1, max: 5, step: 1, show: `${a.interest} of 5` },
    { k: 'relevance', label: 'Is it still relevant', min: 0, max: 2, step: 1, show: ['No', 'Somewhat', 'Yes'][a.relevance] },
  ]

  return (
    <section className="mt-28">
      <Container>
        <Reveal><PillHeading number="03" note="Try it, this is the real scoring">Revival Score</PillHeading></Reveal>
        <Reveal className="mt-10 grid overflow-hidden rounded-[1.5rem] border border-ink lg:grid-cols-2">
          <div className="space-y-7 bg-card p-8 sm:p-10">
            <p className="text-sm text-muted">A project that stopped because of time, with a few weeks of work left. Move the sliders.</p>
            {sliders.map((s) => (
              <div key={s.k}>
                <div className="flex items-baseline justify-between">
                  <label htmlFor={`demo-${s.k}`} className="font-medium">{s.label}</label>
                  <span className="font-display text-2xl font-semibold tracking-tight">{s.show}</span>
                </div>
                <input id={`demo-${s.k}`} type="range" min={s.min} max={s.max} step={s.step} value={a[s.k]} onChange={(e) => setA({ ...a, [s.k]: Number(e.target.value) })} className="mt-2 w-full accent-[var(--color-ink)]" />
              </div>
            ))}
            <p className="text-xs text-muted">Weights: interest 30, completion 25, reason 20, relevance 15, effort 10.</p>
          </div>
          <div className="panel flex flex-col items-center justify-center gap-6 rounded-none p-10 text-center">
            <ScoreRing score={result.score} size={190} stroke={14} dark />
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/50">Recommended path</p>
              <AnimatePresence mode="wait">
                <motion.p key={result.path} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mt-1 font-display text-4xl font-semibold tracking-tight">
                  {CONFIG.paths[result.path].label}
                </motion.p>
              </AnimatePresence>
              <p className="mx-auto mt-2 max-w-sm text-sm text-white/65">{CONFIG.paths[result.path].blurb}</p>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  )
}

function DemoCity() {
  const projects = useStore((s) => s.projects)
  const users = useStore((s) => s.users)
  const [q, setQ] = useState('')
  const [owner, setOwner] = useState(null)
  const [months, setMonths] = useState(0)
  const [playing, setPlaying] = useState(false)
  const extraDays = Math.round(months * 30.4)
  const stillLit = projects.filter((p) => litRatio(p, extraDays) > 0).length
  const matches = q.trim() ? users.filter((u) => `${u.name} ${u.username}`.toLowerCase().includes(q.toLowerCase())).slice(0, 5) : []
  const picked = users.find((u) => u.id === owner)

  // play: move the dial forward one month at a time, then stop at a year
  useEffect(() => {
    if (!playing) return
    if (months >= 12) { setPlaying(false); return }
    const t = setTimeout(() => setMonths((m) => Math.min(12, m + 1)), 550)
    return () => clearTimeout(t)
  }, [playing, months])

  const glass = 'glass-bar rounded-2xl border border-white/50'

  // A full width, Git City style section: the whole demo city under a dawn sky,
  // with floating glass panels for search, live stats and the time machine.
  return (
    <section className="relative mt-28 scroll-mt-16 overflow-hidden" id="demo-city" aria-label="Demo city">
      <img src="/sky/dawn.png" alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-paper via-transparent to-paper" aria-hidden />
      <div className="absolute inset-0 hidden bg-[#0f1430]/55 dark:block" aria-hidden />

      <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-16 sm:px-8">
        <Reveal className="text-center">
          <p className="eyebrow">04 · Demo city</p>
          <h2 className="title mx-auto mt-3 max-w-3xl">Six builders. One city. Find yourself in it.</h2>
          <p className="lead mx-auto mt-3 max-w-2xl">Search a builder to light up their buildings, or press play to fast forward a year and watch untouched projects go dark.</p>
        </Reveal>

        {/* top panels */}
        <div className="relative z-20 mt-8 flex flex-wrap items-start justify-between gap-3">
          <div className={`relative w-full max-w-sm p-2 ${glass}`}>
            <label className="flex items-center gap-2 px-2">
              <Search size={16} className="text-muted" />
              <span className="sr-only">Find a builder</span>
              <input value={q} onChange={(e) => { setQ(e.target.value); if (!e.target.value) setOwner(null) }} placeholder="Find a builder, try Meera" className="w-full bg-transparent py-2 text-sm text-ink outline-none" />
            </label>
            {matches.length > 0 && !picked && (
              <ul className="absolute inset-x-0 top-full mt-2 overflow-hidden rounded-xl border border-ink bg-card text-ink shadow-lg">
                {matches.map((u) => (
                  <li key={u.id}>
                    <button className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-paper" onClick={() => { setOwner(u.id); setQ(u.name) }}>
                      <Avatar name={u.name} size={24} /> {u.name} <span className="text-muted">@{u.username}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {picked && (
              <p className="px-2 pb-1 pt-1 text-xs text-muted">
                Showing {picked.name}'s buildings · <Link to={`/builder/${picked.username}`} className="underline">profile</Link> ·{' '}
                <button className="underline" onClick={() => { setOwner(null); setQ('') }}>everyone</button>
              </p>
            )}
          </div>
          <div className={`flex items-center gap-4 px-4 py-3 text-sm ${glass}`}>
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-light opacity-70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-light" />
            </span>
            <span><b>{projects.length}</b> buildings</span>
            <span><b>{users.length}</b> builders</span>
            <span><b>{stillLit}</b> lit</span>
          </div>
        </div>

        {/* the city itself, storybook style, no box */}
        <div data-city="day" className="city-sketch relative -mt-2">
          <City projects={projects} users={users} highlightOwner={owner} minWidth={760} extraDays={extraDays} />
        </div>

        {/* time machine */}
        <div className={`relative z-10 mx-auto -mt-4 flex max-w-3xl flex-wrap items-center gap-4 p-4 ${glass}`}>
          <button
            type="button"
            onClick={() => { if (months >= 12) setMonths(0); setPlaying(!playing) }}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink text-paper"
            aria-label={playing ? 'Pause time' : 'Play time forward'}
          >
            {playing ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <div className="min-w-[200px] flex-1">
            <label htmlFor="time-dial" className="flex justify-between text-xs font-medium uppercase tracking-[0.14em]">
              <span>Time machine</span>
              <span>{months === 0 ? 'Today' : `${months} ${months === 1 ? 'month' : 'months'} from now`}</span>
            </label>
            <input id="time-dial" type="range" min={0} max={12} step={1} value={months}
              onChange={(e) => { setPlaying(false); setMonths(Number(e.target.value)) }}
              className="mt-1 w-full accent-[var(--color-light)]" />
          </div>
          <p className="text-sm text-muted">
            {months > 0 ? 'Only revived projects keep their lights on.' : 'Hover a building to read it, click to open it.'}
          </p>
        </div>
      </div>
    </section>
  )
}

function CommunityPreview() {
  const users = useStore((s) => s.users)
  const events = useStore((s) => s.events)
  const top = useMemo(() => rankBuilders({ users, events }).slice(0, 5), [users, events])
  return (
    <section className="mt-28">
      <Container className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <Reveal className="card p-7">
          <p className="eyebrow">Activity grid</p>
          <h3 className="subtitle mt-2">Revival work, counted day by day.</h3>
          <p className="mt-1 text-sm text-muted">The demo builder's last 26 weeks.</p>
          <div className="mt-6"><ActivityGrid userId="u1" compact /></div>
        </Reveal>
        <Reveal delay={0.1} className="card p-7">
          <p className="eyebrow">Revival Leaderboard</p>
          <h3 className="subtitle mt-2">Finish over start.</h3>
          <ol className="mt-5 divide-y divide-line">
            {top.map((r) => (
              <li key={r.user.id} className="flex items-center gap-3 py-2.5">
                <span className="w-5 text-sm font-semibold">{r.rank}</span>
                <Avatar name={r.user.name} size={30} />
                <span className="flex-1 text-sm">{r.user.name}</span>
                <span className="text-sm font-semibold">{r.points} pts</span>
              </li>
            ))}
          </ol>
          <Link to="/leaderboard" className="btn btn-ghost btn-sm mt-4">Full leaderboard</Link>
        </Reveal>
      </Container>
    </section>
  )
}

function SquarePreview() {
  const projects = useStore((s) => s.projects)
  const open = projects.filter((p) => p.openForCollab).slice(0, 3)
  return (
    <section className="mt-28">
      <Container>
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <PillHeading number="05" note="Find someone to finish with">Builders' Square</PillHeading>
          <Link to="/square" className="btn btn-ghost btn-sm">Browse all <ArrowRight size={14} /></Link>
        </Reveal>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {open.map((p, i) => <Reveal key={p.id} delay={i * 0.08}><ProjectCard project={p} showOwner /></Reveal>)}
        </div>
      </Container>
    </section>
  )
}

function Voices() {
  const users = useStore((s) => s.users)
  const quotes = [
    ['u2', 'Seeing Campus Lost and Found with its lights back on made me want to add one more floor.'],
    ['u3', 'The score told me to restart Study Buddy smaller. Three parts felt doable.'],
    ['u5', 'I archived two projects and wrote what I learned. My GitHub stopped feeling like guilt.'],
  ]
  return (
    <section className="mt-28">
      <Container>
        <Reveal><PillHeading number="06" note="Sample builders from the demo data, not real reviews">Voices from the city</PillHeading></Reveal>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {quotes.map(([id, text], i) => {
            const u = users.find((x) => x.id === id)
            return (
              <Reveal key={id} delay={i * 0.08} className={`flex flex-col justify-between rounded-[1.5rem] p-7 ${i === 1 ? 'panel' : 'card'}`}>
                <p className="text-lg leading-relaxed">“{text}”</p>
                <div className="mt-6 flex items-center gap-3">
                  <Avatar name={u?.name} size={36} dark={i === 1} />
                  <div>
                    <p className="text-sm font-semibold">{u?.name}</p>
                    <p className={`text-xs ${i === 1 ? 'text-white/55' : 'text-muted'}`}>Sample builder</p>
                  </div>
                </div>
              </Reveal>
            )
          })}
        </div>
      </Container>
    </section>
  )
}

const FAQS = [
  ['Is this a task manager?', 'No. There are no boards, sprints or deadlines. HALFBUILT only helps you reflect on a paused project and decide whether to bring it back.'],
  ['How is the score calculated?', 'Six questions. Interest is worth 30 points, completion 25, the reason it stopped 20, relevance today 15 and effort left 10. Reusable parts do not add points, they help pick the path. You can see the full breakdown after every inspection.'],
  ['Do I need an account?', 'You can explore the demo city, leaderboard and Builders\' Square without one. To add your own projects you create a free account in a few seconds.'],
  ['Is my data private?', 'Everything is stored only in your own browser. There is no server. If you import from GitHub, only your public repository list is read, and only the one you pick is saved.'],
  ['Can I revive with someone else?', 'Yes. Mark a project open for co-builders with the skills it needs. Others can request to join and you choose who to accept.'],
  ['Does it cost anything?', 'No. HALFBUILT is free.'],
]

function Faq() {
  const [open, setOpen] = useState(0)
  return (
    <section className="mt-28">
      <Container className="grid gap-10 lg:grid-cols-[1fr_1.6fr]">
        <Reveal>
          <PillHeading number="07">FAQ</PillHeading>
          <p className="lead mt-6 max-w-sm">Short answers to what builders ask first.</p>
        </Reveal>
        <div className="divide-y divide-ink border-y border-ink">
          {FAQS.map(([q, a], i) => (
            <div key={q}>
              <h3>
                <button className="flex w-full items-center justify-between gap-4 py-5 text-left text-lg font-medium" aria-expanded={open === i} onClick={() => setOpen(open === i ? -1 : i)}>
                  {q}
                  <Plus size={20} className={`shrink-0 transition-transform duration-300 ${open === i ? 'rotate-45' : ''}`} />
                </button>
              </h3>
              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                    <p className="max-w-2xl pb-5 text-muted">{a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}

function FinalCta() {
  const user = useCurrentUser()
  return (
    <section className="mt-28">
      <Container>
        <Reveal className="panel relative overflow-hidden px-8 py-16 text-center sm:py-20">
          <PixelSquares className="absolute left-6 top-6" />
          <PixelSquares className="absolute bottom-6 right-6" flip />
          <div className="mx-auto mb-6 flex h-40 max-w-xs justify-center" data-city="night">
            <BuildingView project={SAMPLE_REVIVING} showSign={false} className="h-40" minFloors={6} />
          </div>
          <h2 className="title mx-auto max-w-3xl !text-paper">Your next floor is waiting.</h2>
          <p className="mx-auto mt-4 max-w-xl text-white/65">Add one paused project. Answer six questions. Spend two hours on the first step.</p>
          <Link to={user ? '/project/new' : '/signup'} className="btn mt-8 bg-paper text-ink hover:bg-light">{user ? 'Add a project' : 'Build my city'} <ArrowRight size={16} /></Link>
        </Reveal>
      </Container>
    </section>
  )
}
