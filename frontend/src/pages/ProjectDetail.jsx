import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'motion/react'
import { Check, ExternalLink, Github } from 'lucide-react'
import { useStore, useCurrentUser } from '../store/useStore'
import BuildingView from '../iso/BuildingView'
import PathChooser from '../components/PathChooser'
import { Avatar, Chip, ChipsInput, ScoreRing, StatusBadge } from '../components/ui'
import { REASONS } from '../logic/buildingState'
import { CONFIG, completionOf } from '../logic/revivalScore'
import { formatDay } from '../logic/activity'
import NotFound from './NotFound'

const EVENT_TEXT = {
  created: 'Construction started',
  inspected: 'Site Inspection',
  revived: 'Revival began',
  floorAdded: 'Floor added',
  rebuilt: 'Rebuilt',
  archived: 'Became a landmark',
  updated: 'Updated',
  joinRequested: 'Co-builder asked to join',
}

export default function ProjectDetail() {
  const { id } = useParams()
  const project = useStore((s) => s.projects.find((p) => p.id === id))
  const users = useStore((s) => s.users)
  const allEvents = useStore((s) => s.events)
  const me = useCurrentUser()
  if (!project) return <NotFound />

  const owner = users.find((u) => u.id === project.ownerId)
  const isOwner = me?.id === project.ownerId
  const events = allEvents.filter((e) => e.projectId === project.id)

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-8">
      <Link to={isOwner ? '/city' : `/builder/${owner?.username}`} className="text-sm text-muted hover:text-ink">
        ← {isOwner ? 'My City' : `${owner?.name}'s city`}
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        {/* Building */}
        <div
          className="flex flex-col items-center justify-end rounded-[1.75rem] border border-ink p-8 lg:sticky lg:top-24 lg:self-start"
          style={{ background: 'linear-gradient(180deg, var(--sky-top), var(--sky-bottom))' }}
        >
          <BuildingView project={project} className="h-[440px] w-full" minFloors={8} />
          {project.status === 'landmark' && project.lessons && (
            <div className="mt-6 w-full rounded-xl border border-ink bg-[var(--stone-t)] p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">Lessons learned</p>
              <p className="mt-2 text-sm leading-relaxed">{project.lessons}</p>
            </div>
          )}
        </div>

        {/* Story and actions */}
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={project.status} />
            <span className="text-sm text-muted">by <Link className="underline underline-offset-4" to={`/builder/${owner?.username}`}>{owner?.name}</Link></span>
          </div>
          <h1 className="title mt-3">{project.name}</h1>
          {project.description && <p className="lead mt-3">{project.description}</p>}

          {project.goal && (
            <div className="mt-6">
              <p className="eyebrow">What it was meant to become</p>
              <p className="mt-1.5">{project.goal}</p>
            </div>
          )}

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="card p-5">
              <p className="text-sm font-semibold">Finished · {project.completedParts.length}</p>
              <ul className="mt-2 space-y-1.5 text-sm">
                {project.completedParts.map((c) => <li key={c} className="flex gap-2"><Check size={16} className="mt-0.5 shrink-0" /> {c}</li>)}
                {!project.completedParts.length && <li className="text-muted">Nothing yet, and that is fine.</li>}
              </ul>
            </div>
            <div className="rounded-[1.25rem] border border-dashed border-soft p-5">
              <p className="text-sm font-semibold">Unfinished · {project.pendingParts.length}</p>
              <ul className="mt-2 space-y-1.5 text-sm text-muted">
                {project.pendingParts.map((c) => <li key={c}>{c}</li>)}
                {!project.pendingParts.length && <li>No scaffolding left.</li>}
              </ul>
            </div>
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
            <div><dt className="text-muted">Done</dt><dd className="font-semibold">{completionOf(project)}%</dd></div>
            <div><dt className="text-muted">Paused because</dt><dd className="font-semibold">{REASONS[project.reason]?.sign.toLowerCase()}</dd></div>
            <div><dt className="text-muted">Started</dt><dd className="font-semibold">{formatDay(new Date(project.startedOn))}</dd></div>
            <div><dt className="text-muted">Last touched</dt><dd className="font-semibold">{formatDay(new Date(project.lastTouchedOn))}</dd></div>
          </dl>

          {(project.tools.length > 0 || project.links.repo || project.links.demo) && (
            <div className="mt-6 flex flex-wrap items-center gap-2">
              {project.tools.map((t) => <Chip key={t}>{t}</Chip>)}
              {project.links.repo && <a href={project.links.repo} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm"><Github size={14} /> Repository</a>}
              {project.links.demo && <a href={project.links.demo} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm"><ExternalLink size={14} /> Demo</a>}
            </div>
          )}

          {isOwner && <Actions project={project} />}
          <Collaboration project={project} isOwner={isOwner} users={users} me={me} />

          {/* Construction log */}
          <section className="mt-12" aria-label="Construction log">
            <h2 className="subtitle">Construction log</h2>
            <ol className="relative mt-5 border-l border-ink pl-6">
              {events.map((e) => (
                <li key={e.id} className="relative pb-5">
                  <span className={`absolute -left-[31px] top-1 h-3 w-3 rounded-full border border-ink ${['revived', 'rebuilt'].includes(e.type) ? 'bg-light' : e.type === 'floorAdded' ? 'bg-ink' : 'bg-paper'}`} />
                  <p className="text-xs text-muted">{formatDay(new Date(e.date))}</p>
                  <p className="font-medium">{EVENT_TEXT[e.type] ?? e.type}</p>
                  {e.detail && <p className="text-sm text-muted">{e.detail}</p>}
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>
    </main>
  )
}

function Actions({ project }) {
  const completePart = useStore((s) => s.completePart)
  const markRebuilt = useStore((s) => s.markRebuilt)
  const [choosing, setChoosing] = useState(false)
  const ins = project.inspection

  return (
    <section className="mt-10" aria-label="What next">
      {project.status === 'paused' && (
        <div className="panel flex flex-wrap items-center justify-between gap-4 p-6">
          <div>
            <p className="font-display text-2xl font-semibold tracking-tight">Not sure what to do with it?</p>
            <p className="text-sm text-white/65">Six honest questions give a Revival Score, a path and one small first step.</p>
          </div>
          <Link to={`/project/${project.id}/inspect`} className="btn bg-paper text-ink hover:bg-light">Start Site Inspection</Link>
        </div>
      )}

      {project.status === 'inspected' && ins && (
        <div className="panel p-6">
          <div className="flex flex-wrap items-center gap-6">
            <ScoreRing score={ins.score} size={120} stroke={10} dark />
            <div className="flex-1">
              <p className="text-xs uppercase tracking-[0.18em] text-white/50">Recommended path</p>
              <p className="font-display text-3xl font-semibold tracking-tight">{CONFIG.paths[ins.path].label}</p>
              <ul className="mt-2 space-y-0.5 text-sm text-white/70">{ins.reasons.map((r) => <li key={r}>{r}</li>)}</ul>
              <p className="mt-2 text-sm"><b>First step:</b> {ins.firstStep}</p>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button className="btn bg-paper text-ink hover:bg-light" onClick={() => setChoosing(true)}>Use this plan</button>
            <button className="btn border border-white/40 hover:border-paper" onClick={() => setChoosing(true)}>Choose another path</button>
            <Link to={`/project/${project.id}/inspect`} className="btn text-white/60 hover:text-paper">Inspect again</Link>
          </div>
          {choosing && <div className="mt-6 rounded-2xl bg-paper p-4 text-ink"><PathChooser project={project} recommended={ins.path} startOpen={ins.path} onApplied={() => setChoosing(false)} /></div>}
        </div>
      )}

      {project.status === 'reviving' && (
        <div className="card p-6">
          <p className="font-display text-2xl font-semibold tracking-tight">Under revival</p>
          <p className="text-sm text-muted">Mark a part as done and watch its scaffolding become a lit floor.</p>
          <ul className="mt-4 space-y-2">
            {project.pendingParts.map((part) => (
              <motion.li key={part} layout className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-soft px-4 py-3">
                <span>{part}</span>
                <button className="btn btn-primary btn-sm" onClick={() => completePart(project.id, part)}><Check size={14} /> Mark as done</button>
              </motion.li>
            ))}
          </ul>
          {project.pendingParts.length === 0 && (
            <button className="btn btn-primary mt-2" onClick={() => markRebuilt(project.id)}>Mark as rebuilt</button>
          )}
        </div>
      )}

      {project.status === 'rebuilt' && (
        <div className="card p-6">
          <p className="font-display text-2xl font-semibold tracking-tight">Rebuilt. The flag is up.</p>
          <p className="text-sm text-muted">This one went from paused construction to finished. That counts on the leaderboard.</p>
        </div>
      )}
    </section>
  )
}

function Collaboration({ project, isOwner, users, me }) {
  const toggleCollab = useStore((s) => s.toggleCollab)
  const updateProject = useStore((s) => s.updateProject)
  const respondJoin = useStore((s) => s.respondJoin)
  const requestJoin = useStore((s) => s.requestJoin)
  const [skills, setSkills] = useState(project.skillsNeeded)
  const [message, setMessage] = useState('')
  const nameOf = (id) => users.find((u) => u.id === id)?.name ?? 'A builder'
  const mine = project.joinRequests.find((r) => r.userId === me?.id)
  const pending = project.joinRequests.filter((r) => r.status === 'pending')

  if (project.status === 'landmark' && !isOwner) return null

  return (
    <section className="mt-10 card p-6" aria-label="Co-builders">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-display text-xl font-semibold tracking-tight">Co-builders</p>
          <p className="text-sm text-muted">{project.openForCollab ? 'Listed in Builders\' Square.' : 'Not looking for help right now.'}</p>
        </div>
        {isOwner && (
          <button
            role="switch"
            aria-checked={project.openForCollab}
            onClick={() => toggleCollab(project.id, skills)}
            className={`relative h-7 w-12 rounded-full transition-colors ${project.openForCollab ? 'bg-ink' : 'bg-grey'}`}
          >
            <span className="sr-only">Open for co-builders</span>
            <span className={`absolute top-1 h-5 w-5 rounded-full bg-paper transition-all ${project.openForCollab ? 'left-6' : 'left-1'}`} />
          </button>
        )}
      </div>

      {isOwner && (
        <div className="mt-4">
          <label htmlFor="skillsNeeded" className="mb-1.5 block text-sm font-medium">Skills needed</label>
          <ChipsInput id="skillsNeeded" value={skills} onChange={setSkills} placeholder="Node, UI design" />
          {project.openForCollab && skills.join() !== project.skillsNeeded.join() && (
            <button className="btn btn-ghost btn-sm mt-2" onClick={() => updateProject(project.id, { skillsNeeded: skills })}>Save skills</button>
          )}
        </div>
      )}

      {project.coBuilders.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {project.coBuilders.map((id) => (
            <span key={id} className="inline-flex items-center gap-2 rounded-full border border-ink py-1 pl-1 pr-3 text-sm">
              <Avatar name={nameOf(id)} size={24} /> {nameOf(id)}
            </span>
          ))}
        </div>
      )}

      {isOwner && pending.length > 0 && (
        <ul className="mt-5 space-y-3">
          {pending.map((r) => (
            <li key={r.userId} className="flex flex-wrap items-center gap-3 rounded-xl bg-paper p-4">
              <Avatar name={nameOf(r.userId)} size={36} />
              <div className="flex-1">
                <p className="text-sm font-semibold">{nameOf(r.userId)} wants to help</p>
                <p className="text-sm text-muted">{r.message}</p>
              </div>
              <button className="btn btn-primary btn-sm" onClick={() => respondJoin(project.id, r.userId, true)}>Accept</button>
              <button className="btn btn-ghost btn-sm" onClick={() => respondJoin(project.id, r.userId, false)}>Decline</button>
            </li>
          ))}
        </ul>
      )}

      {!isOwner && project.openForCollab && (
        me ? (
          mine ? (
            <p className="mt-4 text-sm">Your request is <b>{mine.status}</b>.</p>
          ) : (
            <div className="mt-4 flex flex-wrap gap-2">
              <input aria-label="Message to the owner" className="field flex-1" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="What would you like to help with?" />
              <button className="btn btn-primary" disabled={!message.trim()} onClick={() => requestJoin(project.id, message.trim())}>Request to join</button>
            </div>
          )
        ) : (
          <Link to="/login" state={{ from: `/project/${project.id}` }} className="btn btn-ghost btn-sm mt-4">Log in to request to join</Link>
        )
      )}
    </section>
  )
}
