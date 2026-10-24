import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import BuildingView from '../iso/BuildingView'
import { Reveal } from '../components/ui'
import { HalfCircle, PillHeading, PixelSquares } from '../components/Decor'
import { CONFIG } from '../logic/revivalScore'

const DIAGRAM = {
  name: 'Habit Tracker',
  completedParts: ['Habit list', 'Daily check in', 'Streak counter', 'Settings'],
  pendingParts: ['Reminders', 'Weekly insights'],
  status: 'reviving',
  reason: 'time',
  lastTouchedOn: new Date().toISOString(),
}

const LABELS = [
  ['Crane', 'The project is being revived right now.'],
  ['Scaffolding', 'Parts that are still unfinished, dashed on top.'],
  ['Solid floors', 'Parts you actually completed, one floor each.'],
  ['Lit windows', 'Recent activity. They go dark the longer it is left.'],
  ['Sign', 'Why construction stopped, at the base.'],
]

const PRINCIPLES = [
  ['Encourage, never shame', 'Abandoned projects are paused construction. Every word on this site is written to make returning feel good.'],
  ['Small first steps', 'Every plan ends with one task of about two hours. Big plans are how projects stalled in the first place.'],
  ['Finish over start', 'The leaderboard counts revivals and floors added after revival. Starting something new earns nothing.'],
]

export default function About() {
  return (
    <main className="relative overflow-hidden">
      <HalfCircle className="pointer-events-none absolute -right-20 top-0 w-72" />
      <section className="mx-auto max-w-7xl px-4 pt-20 sm:px-8">
        <PixelSquares />
        <p className="eyebrow mt-6">About HALFBUILT</p>
        <h1 className="display mt-4 max-w-5xl">A second chance for the projects you left behind.</h1>
        <div className="mt-10 grid gap-10 md:grid-cols-2">
          <Reveal>
            <h2 className="subtitle">The problem, in plain words</h2>
            <p className="lead mt-3">
              Every builder has a folder of half finished projects. They stopped for good reasons: exams, a hackathon that ended, scope that grew, one bug that would not die.
              Months later the repository is still there, but the context is gone and the project has turned into guilt.
              GitHub shows the code, not why it stopped. Task managers are built for active work with deadlines. Nothing helps you answer the real question: what should I do with this now?
            </p>
          </Reveal>
          <Reveal delay={0.1} className="panel p-8">
            <p className="text-xs uppercase tracking-[0.2em] text-white/50">Our mission</p>
            <p className="mt-3 font-display text-3xl font-semibold leading-tight tracking-tight">
              Help every builder decide, honestly and kindly, which unfinished projects deserve another floor.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto mt-28 max-w-7xl px-4 sm:px-8">
        <Reveal><PillHeading number="01" note="Height is progress, darkness is time">Why a city</PillHeading></Reveal>
        <Reveal className="card mt-10 grid items-center gap-8 p-8 md:grid-cols-[1fr_1.2fr]">
          <BuildingView project={DIAGRAM} className="mx-auto h-[420px] w-full max-w-sm" minFloors={6} />
          <ol className="space-y-5">
            {LABELS.map(([k, v], i) => (
              <li key={k} className="flex items-start gap-4">
                <span className="mt-1.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink text-xs font-semibold text-paper">{i + 1}</span>
                <div className="flex-1 border-b border-line pb-4">
                  <p className="font-semibold">{k}</p>
                  <p className="text-sm text-muted">{v}</p>
                </div>
              </li>
            ))}
          </ol>
        </Reveal>
        <p className="mt-4 text-sm text-muted">A city turns a list of repositories into something you can read at a glance, and makes revisiting feel like coming home rather than facing a backlog.</p>
      </section>

      <section className="mx-auto mt-28 max-w-7xl px-4 sm:px-8">
        <Reveal><PillHeading number="02">Our principles</PillHeading></Reveal>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {PRINCIPLES.map(([k, v], i) => (
            <Reveal key={k} delay={i * 0.08} className={`rounded-[1.5rem] p-7 ${i === 0 ? 'panel' : 'card'}`}>
              <p className={`text-xs font-semibold tracking-[0.2em] ${i === 0 ? 'text-white/50' : 'text-muted'}`}>0{i + 1}</p>
              <h3 className="subtitle mt-2">{k}</h3>
              <p className={`mt-2 text-sm leading-relaxed ${i === 0 ? 'text-white/70' : 'text-muted'}`}>{v}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-28 max-w-7xl px-4 sm:px-8">
        <Reveal><PillHeading number="03" note="Transparent and explainable">How the score works</PillHeading></Reveal>
        <Reveal className="mt-10 flex overflow-hidden rounded-[1.25rem] border border-ink text-center">
          {CONFIG.questions.filter((q) => q.max > 0).sort((a, b) => b.max - a.max).map((q, i) => (
            <div key={q.id} className={`py-6 ${['bg-ink text-paper', 'bg-[#4a4a4a] text-paper', 'bg-soft text-paper', 'bg-grey', 'bg-card'][i]}`} style={{ flex: q.max }}>
              <p className="font-display text-3xl font-semibold">{q.max}</p>
              <p className="mt-1 px-2 text-[11px] uppercase tracking-[0.12em] opacity-80">{q.id}</p>
            </div>
          ))}
        </Reveal>
        <p className="mt-4 max-w-3xl text-muted">
          Reasons like running out of time score higher than a weak idea, because those projects are easier to bring back. The path comes from simple rules checked in order, and every result shows its reasoning and one small first step. You always decide.
        </p>
      </section>

      <section className="mx-auto mt-28 max-w-7xl px-4 sm:px-8">
        <Reveal><PillHeading number="04">The team</PillHeading></Reveal>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[['Ragini Pawar', 'Team lead, design and build'], ['Team member', 'Placeholder'], ['Team member', 'Placeholder'], ['Team member', 'Placeholder']].map(([n, r], i) => (
            <Reveal key={i} delay={i * 0.06} className="card p-6">
              <div className={`h-14 w-14 rounded-full ${i === 0 ? 'bg-ink' : 'border border-dashed border-soft'}`} />
              <p className="mt-4 font-semibold">{n}</p>
              <p className="text-sm text-muted">{r}</p>
            </Reveal>
          ))}
        </div>
        <div className="mt-14 text-center">
          <Link to="/how-it-works" className="btn btn-primary">See how it works <ArrowRight size={16} /></Link>
        </div>
      </section>
    </main>
  )
}
