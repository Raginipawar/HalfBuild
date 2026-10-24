import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { ChipsInput, Field } from '../components/ui'
import BuildingView from '../iso/BuildingView'
import { REASONS } from '../logic/buildingState'

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
        <form onSubmit={submit} className="grid gap-5 sm:grid-cols-2" noValidate>
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
