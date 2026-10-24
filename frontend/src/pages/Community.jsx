import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import { Search } from 'lucide-react'
import { useStore, useCurrentUser } from '../store/useStore'
import { rankBuilders, POINTS } from '../logic/leaderboard'
import ProjectCard from '../components/ProjectCard'
import { Avatar, Chip } from '../components/ui'
import { PixelSquares } from '../components/Decor'

// Revival Leaderboard and Builders' Square, the two community pages.

export function Leaderboard() {
  const users = useStore((s) => s.users)
  const events = useStore((s) => s.events)
  const me = useCurrentUser()
  const reduce = useReducedMotion()
  const [tab, setTab] = useState('all')
  const rows = useMemo(() => rankBuilders({ users, events }, { thisMonth: tab === 'month' }), [users, events, tab])
  const podium = [rows[1], rows[0], rows[2]].filter(Boolean)
  const heights = { 1: 'h-48', 2: 'h-36', 3: 'h-28' }

  return (
    <main className="mx-auto max-w-6xl px-4 py-14 sm:px-8">
      <PixelSquares />
      <p className="eyebrow mt-6">Revival Leaderboard</p>
      <h1 className="title mt-2">Ranked by what you bring back.</h1>
      <p className="lead mt-3 max-w-2xl">
        Not by what you start. Points = projects revived x {POINTS.revived} + floors added after revival x {POINTS.floor} + landmarks x {POINTS.landmark}.
      </p>

      <div className="mt-8 inline-flex rounded-full border border-ink p-1" role="tablist">
        {[['all', 'All time'], ['month', 'This month']].map(([k, label]) => (
          <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`rounded-full px-4 py-1.5 text-sm font-medium ${tab === k ? 'bg-ink text-paper' : 'hover:bg-grey/50'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Podium */}
      <div className="mt-12 grid grid-cols-3 items-end gap-3 sm:gap-6">
        {podium.map((r, i) => (
          <div key={`${tab}-${r.user.id}`} className="flex flex-col items-center text-center">
            <Avatar name={r.user.name} size={52} />
            <Link to={`/builder/${r.user.username}`} className="mt-2 text-sm font-semibold hover:underline">{r.user.name}</Link>
            <p className="text-xs text-muted">{r.points} pts</p>
            <motion.div
              className={`mt-3 flex w-full items-start justify-center rounded-t-2xl pt-4 font-display text-4xl font-semibold ${heights[r.rank]} ${r.rank === 1 ? 'bg-ink text-paper' : r.rank === 2 ? 'bg-[#4a4a4a] text-paper' : 'bg-grey'}`}
              initial={reduce ? false : { scaleY: 0 }}
              animate={{ scaleY: 1 }}
              style={{ originY: 1 }}
              transition={{ delay: 0.2 + i * 0.12, type: 'spring', stiffness: 120, damping: 16 }}
            >
              {r.rank}
            </motion.div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card mt-0 overflow-x-auto rounded-t-none">
        <table className="w-full min-w-[560px] text-sm">
          <thead className="border-b border-ink text-left text-xs uppercase tracking-[0.12em] text-muted">
            <tr>
              <th className="px-5 py-3">Rank</th>
              <th className="px-5 py-3">Builder</th>
              <th className="px-5 py-3 text-right">Revived</th>
              <th className="px-5 py-3 text-right">Floors after revival</th>
              <th className="px-5 py-3 text-right">Landmarks</th>
              <th className="px-5 py-3 text-right">Points</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const mine = r.user.id === me?.id
              return (
                <tr key={r.user.id} className={`border-b border-line last:border-0 ${mine ? 'bg-beige/60' : ''}`}>
                  <td className="px-5 py-3 font-semibold">{r.rank}</td>
                  <td className="px-5 py-3">
                    <Link to={`/builder/${r.user.username}`} className="flex items-center gap-3 hover:underline">
                      <Avatar name={r.user.name} size={30} /> {r.user.name} {mine && <span className="text-xs text-muted">(you)</span>}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-right">{r.revived}</td>
                  <td className="px-5 py-3 text-right">{r.floors}</td>
                  <td className="px-5 py-3 text-right">{r.landmarks}</td>
                  <td className="px-5 py-3 text-right font-semibold">{r.points}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </main>
  )
}

export function BuildersSquare() {
  const projects = useStore((s) => s.projects)
  const me = useCurrentUser()
  const requestJoin = useStore((s) => s.requestJoin)
  const [query, setQuery] = useState('')
  const [skill, setSkill] = useState('all')
  const [asking, setAsking] = useState(null)
  const [message, setMessage] = useState('')

  const open = projects.filter((p) => p.openForCollab)
  const skills = [...new Set(open.flatMap((p) => p.skillsNeeded))].sort()
  const shown = open.filter((p) =>
    (skill === 'all' || p.skillsNeeded.includes(skill)) &&
    `${p.name} ${p.description}`.toLowerCase().includes(query.toLowerCase()),
  )

  const action = (p) => {
    if (p.ownerId === me?.id) return <p className="text-sm text-muted">This is your project.</p>
    const req = p.joinRequests.find((r) => r.userId === me?.id)
    if (req) return <p className="text-sm">Request <b>{req.status}</b></p>
    if (!me) return <Link to="/login" state={{ from: '/square' }} className="btn btn-ghost btn-sm w-full">Log in to join</Link>
    return <button className="btn btn-primary btn-sm w-full" onClick={() => { setAsking(p); setMessage('') }}>Request to join</button>
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-14 sm:px-8">
      <PixelSquares />
      <p className="eyebrow mt-6">Builders' Square</p>
      <h1 className="title mt-2">Some projects just need one more builder.</h1>
      <p className="lead mt-3 max-w-2xl">These paused projects are open for co-builders. Find one that needs your skills.</p>

      <div className="mt-8 flex flex-wrap gap-3">
        <label className="field flex flex-1 items-center gap-2 px-3">
          <Search size={16} className="text-muted" />
          <span className="sr-only">Search projects</span>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search projects" className="w-full bg-transparent py-2.5 text-sm outline-none" />
        </label>
      </div>
      <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Filter by skill">
        {['all', ...skills].map((s) => (
          <button key={s} onClick={() => setSkill(s)} aria-pressed={skill === s} className={`rounded-full border px-3 py-1 text-xs font-medium ${skill === s ? 'border-ink bg-ink text-paper' : 'border-grey hover:border-ink'}`}>
            {s === 'all' ? 'All skills' : s}
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((p) => <ProjectCard key={p.id} project={p} showOwner action={action(p)} />)}
      </div>
      {!shown.length && <p className="mt-10 text-center text-muted">Nothing matches yet. Try another skill.</p>}

      {asking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4" role="dialog" aria-modal="true" aria-label={`Request to join ${asking.name}`} onClick={() => setAsking(null)}>
          <div className="card w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="subtitle">Join {asking.name}</h2>
            <p className="mt-1 text-sm text-muted">Tell the owner what you would like to help with.</p>
            <div className="mt-3 flex flex-wrap gap-1.5">{asking.skillsNeeded.map((s) => <Chip key={s} tone="beige">{s}</Chip>)}</div>
            <textarea autoFocus rows={3} className="field mt-4 resize-none" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="I can help with..." aria-label="Message" />
            <div className="mt-4 flex justify-end gap-2">
              <button className="btn btn-ghost btn-sm" onClick={() => setAsking(null)}>Cancel</button>
              <button className="btn btn-primary btn-sm" disabled={!message.trim()} onClick={() => { requestJoin(asking.id, message.trim()); setAsking(null) }}>Send request</button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
