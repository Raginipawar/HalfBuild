import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Building2, List, Moon, Plus, Search, Sun } from 'lucide-react'
import { useStore, useCurrentUser } from '../store/useStore'
import City from '../iso/City'
import ActivityGrid from '../components/ActivityGrid'
import ProjectCard from '../components/ProjectCard'
import { Avatar, Stat } from '../components/ui'
import { REASONS, STATUS, daysSince } from '../logic/buildingState'
import NotFound from './NotFound'

// My City (owner view) and the public profile (read only) share this page.
export function CityPage({ user, readOnly }) {
  const allProjects = useStore((s) => s.projects)
  const events = useStore((s) => s.events)
  const projects = useMemo(() => allProjects.filter((p) => p.ownerId === user.id), [allProjects, user.id])
  const [view, setView] = useState('city')
  const [night, setNight] = useState(false)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [reason, setReason] = useState('all')

  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
  const stats = {
    buildings: projects.length,
    revived: projects.filter((p) => ['reviving', 'rebuilt'].includes(p.status)).length,
    landmarks: projects.filter((p) => p.status === 'landmark').length,
    floors: events.filter((e) => e.userId === user.id && e.type === 'floorAdded' && e.date >= monthStart).length,
  }

  // revisit prompt: the paused project with the oldest lastTouchedOn that was never inspected
  const revisit = !readOnly && projects
    .filter((p) => p.status === 'paused' && !p.inspection)
    .sort((a, b) => a.lastTouchedOn.localeCompare(b.lastTouchedOn))[0]

  const filtered = projects.filter((p) =>
    (status === 'all' || p.status === status) &&
    (reason === 'all' || p.reason === reason) &&
    `${p.name} ${p.description}`.toLowerCase().includes(query.toLowerCase()),
  )

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-8">
      {/* Header */}
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div className="flex items-center gap-4">
          <Avatar name={user.name} size={64} />
          <div>
            <p className="eyebrow">{readOnly ? 'Builder profile' : 'My City'}</p>
            <h1 className="title">{readOnly ? `${user.name}'s city` : `${user.name.split(' ')[0]}'s city`}</h1>
            <p className="mt-1 text-sm text-muted">@{user.username} · {user.skills.join(', ') || 'No skills listed yet'}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-x-10 gap-y-4 sm:grid-cols-4">
          <Stat value={stats.buildings} label="Buildings" />
          <Stat value={stats.revived} label="Revived" />
          <Stat value={stats.landmarks} label="Landmarks" />
          <Stat value={stats.floors} label="Floors this month" />
        </div>
      </header>

      <section className="card mt-10 p-6" aria-label="Activity">
        <h2 className="mb-4 text-sm font-semibold">Activity in the last 26 weeks</h2>
        <ActivityGrid userId={user.id} />
      </section>

      {revisit && (
        <section className="panel mt-6 flex flex-wrap items-center justify-between gap-4 p-6">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-white/50">Worth a look today</p>
            <p className="mt-1 font-display text-2xl font-semibold tracking-tight">{revisit.name}</p>
            <p className="text-sm text-white/65">
              Untouched for {daysSince(revisit.lastTouchedOn)} days and never inspected. Six questions could tell you what to do with it.
            </p>
          </div>
          <Link to={`/project/${revisit.id}/inspect`} className="btn bg-paper text-ink hover:bg-light">Start Site Inspection</Link>
        </section>
      )}

      {projects.length === 0 ? (
        <EmptyCity readOnly={readOnly} />
      ) : (
        <>
          {/* Controls */}
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <div className="inline-flex rounded-full border border-ink p-1" role="tablist" aria-label="View">
              {[['city', 'City view', Building2], ['list', 'List view', List]].map(([v, label, Icon]) => (
                <button
                  key={v}
                  role="tab"
                  aria-selected={view === v}
                  onClick={() => setView(v)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${view === v ? 'bg-ink text-paper' : 'hover:bg-grey/50'}`}
                >
                  <Icon size={15} /> {label}
                </button>
              ))}
            </div>
            {view === 'city' && (
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setNight(!night)} aria-pressed={night}>
                {night ? <Sun size={15} /> : <Moon size={15} />} {night ? 'City sleeping' : 'City awake'}
              </button>
            )}
            {!readOnly && (
              <Link to="/project/new" className="btn btn-primary btn-sm ml-auto"><Plus size={15} /> Add a project</Link>
            )}
          </div>

          {view === 'city' ? (
            <div
              data-city={night ? 'night' : 'day'}
              className="mt-5 overflow-hidden rounded-[1.75rem] border border-ink transition-colors duration-700"
              style={{ background: 'linear-gradient(180deg, var(--sky-top), var(--sky-bottom))' }}
            >
              <div className="p-2 sm:p-8">
                <City projects={projects} users={[user]} minWidth={projects.length > 4 ? 640 : 0} />
              </div>
              <p className={`px-6 pb-4 text-xs ${night ? 'text-white/50' : 'text-muted'}`}>
                Hover a building to read it, click to open it. Drag sideways to explore on smaller screens.
              </p>
            </div>
          ) : (
            <div className="mt-5">
              <div className="flex flex-wrap gap-3">
                <label className="field flex flex-1 items-center gap-2 px-3">
                  <Search size={16} className="text-muted" />
                  <span className="sr-only">Search projects</span>
                  <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search your projects" className="w-full bg-transparent py-2.5 text-sm outline-none" />
                </label>
                <select aria-label="Filter by status" value={status} onChange={(e) => setStatus(e.target.value)} className="field w-auto">
                  <option value="all">All statuses</option>
                  {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
                <select aria-label="Filter by reason" value={reason} onChange={(e) => setReason(e.target.value)} className="field w-auto">
                  <option value="all">All reasons</option>
                  {Object.entries(REASONS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
              {filtered.length ? (
                <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {filtered.map((p) => <ProjectCard key={p.id} project={p} />)}
                </div>
              ) : (
                <p className="mt-10 text-center text-muted">No buildings match that search. <button className="underline" onClick={() => { setQuery(''); setStatus('all'); setReason('all') }}>Clear filters</button></p>
              )}
            </div>
          )}
        </>
      )}
    </main>
  )
}

function EmptyCity({ readOnly }) {
  return (
    <section className="card mt-10 flex flex-col items-center px-6 py-16 text-center">
      <svg viewBox="0 0 200 80" className="w-56" aria-hidden>
        <path d="M10 60 100 20 190 60 100 76Z" fill="var(--slab-top)" stroke="var(--color-ink)" />
        <path d="M70 46 100 33 130 46 100 58Z" fill="none" stroke="var(--color-soft)" strokeDasharray="4 3" />
      </svg>
      <h2 className="subtitle mt-6">{readOnly ? 'This city has no buildings yet.' : 'Your city is waiting for its first building.'}</h2>
      {!readOnly && <Link to="/project/new" className="btn btn-primary mt-6"><Plus size={16} /> Add a project</Link>}
    </section>
  )
}

export default function MyCity() {
  const user = useCurrentUser()
  return <CityPage user={user} readOnly={false} />
}

export function Profile() {
  const { username } = useParams()
  const user = useStore((s) => s.users.find((u) => u.username === username))
  const me = useCurrentUser()
  if (!user) return <NotFound />
  return <CityPage user={user} readOnly={me?.id !== user.id} />
}

