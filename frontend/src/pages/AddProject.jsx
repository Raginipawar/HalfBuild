import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { ChipsInput, Field } from '../components/ui'
import BuildingView from '../iso/BuildingView'
import { REASONS, daysSince } from '../logic/buildingState'
import { fetchRepos, repoToForm } from '../logic/github'
import { Github, PenLine, Search } from 'lucide-react'

const today = () => new Date().toISOString().slice(0, 10)

// Form on the left, a building on the right that grows as the form fills in.
export default function AddProject() {
  const addProject = useStore((s) => s.addProject)
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '', description: '', goal: '',
    completedParts: [], pendingParts: [],
    reason: 'time', startedOn: today(), lastTouchedOn: today(),
    tools: [], repo: '', demo: '',
  })
  const [error, setError] = useState('')
  const [mode, setMode] = useState('manual')
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const preview = {
    name: form.name || 'Your project',
    completedParts: form.completedParts,
    pendingParts: form.pendingParts,
    reason: form.reason,
    status: 'paused',
    lastTouchedOn: new Date(form.lastTouchedOn || today()).toISOString(),
  }

  const submit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) { setError('Every building needs a name.'); return }
    const id = addProject({
      name: form.name.trim(),
      description: form.description.trim(),
      goal: form.goal.trim(),
      completedParts: form.completedParts,
      pendingParts: form.pendingParts,
      reason: form.reason,
      tools: form.tools,
      links: { repo: form.repo.trim(), demo: form.demo.trim() },
      startedOn: new Date(form.startedOn).toISOString(),
      lastTouchedOn: new Date(form.lastTouchedOn).toISOString(),
    })
    navigate(`/project/${id}`, { state: { justBuilt: true } })
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-8">
      <p className="eyebrow">Add a project</p>
      <h1 className="title mt-2">Put a paused project on the map.</h1>
      <p className="lead mt-3 max-w-2xl">Each finished part becomes a solid floor. Each unfinished part becomes scaffolding. Watch it rise as you type.</p>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1.1fr_1fr]">
        <div>
        <div className="mb-6 inline-flex rounded-full border border-ink p-1" role="tablist" aria-label="How to add">
          {[['manual', 'Fill in manually', PenLine], ['github', 'Import from GitHub', Github]].map(([k, label, Icon]) => (
            <button key={k} type="button" role="tab" aria-selected={mode === k} onClick={() => setMode(k)}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium ${mode === k ? 'bg-ink text-paper' : 'hover:bg-grey/50'}`}>
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>
        {mode === 'github' && <GithubImport onPick={(fields) => { setForm({ ...form, ...fields }); setMode('manual') }} />}
        <form hidden={mode !== 'manual'} onSubmit={submit} className="grid gap-5 sm:grid-cols-2" noValidate>
          <div className="sm:col-span-2">
            <Field label="Name" htmlFor="name" error={error}>
              <input id="name" className="field" value={form.name} onChange={(e) => { setError(''); set('name')(e) }} placeholder="Habit Tracker" />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="What it is" htmlFor="description">
              <input id="description" className="field" value={form.description} onChange={set('description')} placeholder="A tiny app to track daily habits" />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="What you wanted it to become" htmlFor="goal">
              <textarea id="goal" rows={2} className="field resize-none" value={form.goal} onChange={set('goal')} placeholder="A calm habit app I actually use every morning" />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Finished parts" htmlFor="done" hint="Each one becomes a solid, lit floor.">
              <ChipsInput id="done" value={form.completedParts} onChange={(v) => setForm({ ...form, completedParts: v })} placeholder="Login, Habit list, Streaks" />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Unfinished parts" htmlFor="todo" hint="Each one becomes a scaffolding floor on top.">
              <ChipsInput id="todo" value={form.pendingParts} onChange={(v) => setForm({ ...form, pendingParts: v })} placeholder="Reminders, Weekly insights" />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Why it stopped" htmlFor="reason">
              <select id="reason" className="field" value={form.reason} onChange={set('reason')}>
                {Object.entries(REASONS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Started on" htmlFor="startedOn">
            <input id="startedOn" type="date" className="field" value={form.startedOn} max={today()} onChange={set('startedOn')} />
          </Field>
          <Field label="Last worked on" htmlFor="lastTouchedOn" hint="Older dates mean darker windows.">
            <input id="lastTouchedOn" type="date" className="field" value={form.lastTouchedOn} max={today()} onChange={set('lastTouchedOn')} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Tools or tech used" htmlFor="tools">
              <ChipsInput id="tools" value={form.tools} onChange={(v) => setForm({ ...form, tools: v })} placeholder="React, Firebase" />
            </Field>
          </div>
          <Field label="Repository link" htmlFor="repo">
            <input id="repo" type="url" className="field" value={form.repo} onChange={set('repo')} placeholder="https://github.com/..." />
          </Field>
          <Field label="Demo link" htmlFor="demo">
            <input id="demo" type="url" className="field" value={form.demo} onChange={set('demo')} placeholder="https://..." />
          </Field>
          <button type="submit" className="btn btn-primary sm:col-span-2">Raise the building</button>
        </form>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div
            className="flex flex-col items-center rounded-[1.75rem] border border-ink p-8"
            style={{ background: 'linear-gradient(180deg, var(--sky-top), var(--sky-bottom))' }}
          >
            <BuildingView project={preview} className="h-[380px] w-full" minFloors={8} />
            <p className="mt-4 font-display text-xl font-semibold tracking-tight">{preview.name}</p>
            <p className="text-sm text-muted">
              {form.completedParts.length} solid {form.completedParts.length === 1 ? 'floor' : 'floors'} · {form.pendingParts.length} under scaffolding
            </p>
          </div>
        </aside>
      </div>
    </main>
  )
}

// Step 1 of the GitHub path: pick one of your public repositories.
// It fills the form, then you add the finished and unfinished parts yourself.
function GithubImport({ onPick }) {
  const [user, setUser] = useState('')
  const [state, setState] = useState({ status: 'idle', repos: [], error: '' })

  const load = async (e) => {
    e.preventDefault()
    if (!user.trim()) return
    setState({ status: 'loading', repos: [], error: '' })
    const res = await fetchRepos(user)
    setState(res.ok ? { status: 'done', repos: res.repos, error: '' } : { status: 'error', repos: [], error: res.error })
  }

  return (
    <div className="card p-5">
      <form onSubmit={load} className="flex flex-wrap gap-2">
        <label className="field flex flex-1 items-center gap-2 px-3">
          <Github size={16} className="text-muted" />
          <span className="sr-only">GitHub username</span>
          <input value={user} onChange={(e) => setUser(e.target.value)} placeholder="Your GitHub username" className="w-full bg-transparent py-2.5 text-sm outline-none" />
        </label>
        <button className="btn btn-primary" disabled={state.status === 'loading'}><Search size={15} /> {state.status === 'loading' ? 'Looking' : 'Find repositories'}</button>
      </form>
      <p className="mt-2 text-xs text-muted">Only public repositories are read. Nothing is stored except the one you pick.</p>
      {state.error && <p className="mt-3 text-sm font-medium text-[#a1361f]" role="alert">{state.error}</p>}
      {state.status === 'done' && (
        state.repos.length ? (
          <ul className="mt-4 max-h-96 divide-y divide-line overflow-y-auto rounded-xl border border-line">
            {state.repos.map((r) => {
              const idle = daysSince(r.pushed_at)
              return (
                <li key={r.id}>
                  <button type="button" onClick={() => onPick(repoToForm(r))} className="flex w-full items-start justify-between gap-3 px-4 py-3 text-left hover:bg-paper">
                    <span>
                      <span className="block font-medium">{r.name}</span>
                      <span className="line-clamp-1 text-sm text-muted">{r.description || 'No description'}</span>
                    </span>
                    <span className="shrink-0 text-right text-xs text-muted">
                      {r.language && <span className="block">{r.language}</span>}
                      <span className={idle > 180 ? 'font-semibold text-ink' : ''}>untouched {idle}d</span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        ) : <p className="mt-3 text-sm text-muted">No public repositories found.</p>
      )}
    </div>
  )
}
