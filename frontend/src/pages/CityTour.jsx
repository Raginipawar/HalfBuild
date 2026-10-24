import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Pause, Play, Search } from 'lucide-react'
import { useStore } from '../store/useStore'
import City from '../iso/City'
import StoryHero from '../components/StoryHero'
import { Avatar, Reveal } from '../components/ui'
import { litRatio } from '../logic/buildingState'

// City tour: the scroll story first, then the whole demo city to explore.
export default function CityTour() {
  return (
    <main>
      <StoryHero />
      <DemoCity />
    </main>
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
    <section className="relative scroll-mt-16 overflow-hidden" id="demo-city" aria-label="Demo city">
      <img src="/sky/dawn.png" alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-paper via-transparent to-paper" aria-hidden />
      <div className="absolute inset-0 hidden bg-[#0f1430]/55 dark:block" aria-hidden />

      <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-16 sm:px-8">
        <Reveal className="text-center">
          <p className="eyebrow">The demo city</p>
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

