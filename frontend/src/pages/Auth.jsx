import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { ChipsInput, Field } from '../components/ui'
import { PixelSquares } from '../components/Decor'
import BuildingView from '../iso/BuildingView'

// Sign up and Log in share one layout: form on the left, a building on the right.
// DEMO AUTHENTICATION ONLY: everything stays in this browser.

const SAMPLE = {
  name: 'Your first building',
  completedParts: ['Idea', 'Sketch', 'First screen'],
  pendingParts: ['The rest'],
  status: 'reviving',
  reason: 'time',
  lastTouchedOn: new Date().toISOString(),
}

function AuthShell({ title, sub, children }) {
  return (
    <main className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-8 lg:grid-cols-2 lg:py-20">
      <div>
        <PixelSquares />
        <h1 className="title mt-6">{title}</h1>
        <p className="lead mt-3">{sub}</p>
        <div className="mt-8">{children}</div>
      </div>
      <div className="panel relative hidden items-center justify-center overflow-hidden p-10 lg:flex" data-city="night">
        <BuildingView project={SAMPLE} showSign={false} className="h-[420px]" />
        <p className="absolute bottom-8 left-10 right-10 text-sm text-white/60">
          Unfinished does not mean failed. It means the next floor has not been built yet.
        </p>
      </div>
    </main>
  )
}

export function Login() {
  const login = useStore((s) => s.login)
  const navigate = useNavigate()
  const from = useLocation().state?.from ?? '/city'
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    const res = await login(form)
    setBusy(false)
    if (res.ok) navigate(from, { replace: true })
    else setError(res.error)
  }

  return (
    <AuthShell title="Welcome back." sub="Your city kept the lights on where it could.">
      <form onSubmit={submit} className="space-y-4" noValidate>
        <Field label="Email" htmlFor="email">
          <input id="email" type="email" autoComplete="email" required className="field" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </Field>
        <Field label="Password" htmlFor="password" error={error}>
          <input id="password" type="password" autoComplete="current-password" required className="field" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </Field>
        <button type="submit" className="btn btn-primary w-full" disabled={busy}>{busy ? 'Opening your city' : 'Log in'}</button>
        <button
          type="button"
          className="btn btn-ghost w-full"
          onClick={() => setForm({ email: 'demo@halfbuilt.app', password: 'demo1234' })}
        >
          Fill in the demo account
        </button>
        <p className="text-center text-sm text-muted">
          New here? <Link to="/signup" className="font-medium text-ink underline underline-offset-4">Build your city</Link>
        </p>
      </form>
    </AuthShell>
  )
}

export function Signup() {
  const signup = useStore((s) => s.signup)
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', username: '', email: '', password: '', skills: [] })
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    const next = {}
    if (!form.name.trim()) next.name = 'Tell us what to call you.'
    if (!/^[a-z0-9_]{3,20}$/i.test(form.username.trim())) next.username = 'Use 3 to 20 letters, numbers or underscores.'
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) next.email = 'That email does not look right.'
    if (form.password.length < 6) next.password = 'Use at least 6 characters.'
    setErrors(next)
    if (Object.keys(next).length) return
    setBusy(true)
    const res = await signup(form)
    setBusy(false)
    if (res.ok) navigate('/city')
    else setErrors({ [res.error.includes('email') ? 'email' : 'username']: res.error })
  }

  return (
    <AuthShell title="Claim your plot." sub="Every project you started deserves a place in your city.">
      <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2" noValidate>
        <Field label="Name" htmlFor="name" error={errors.name}>
          <input id="name" autoComplete="name" className="field" value={form.name} onChange={set('name')} />
        </Field>
        <Field label="Username" htmlFor="username" error={errors.username}>
          <input id="username" autoComplete="username" className="field" value={form.username} onChange={set('username')} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Email" htmlFor="email" error={errors.email}>
            <input id="email" type="email" autoComplete="email" className="field" value={form.email} onChange={set('email')} />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="Password" htmlFor="password" error={errors.password} hint="Stored only in this browser, hashed with SHA-256.">
            <input id="password" type="password" autoComplete="new-password" className="field" value={form.password} onChange={set('password')} />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="Skills" htmlFor="skills" hint="Press Enter or comma after each one. Used in Builders' Square.">
            <ChipsInput id="skills" value={form.skills} onChange={(skills) => setForm({ ...form, skills })} placeholder="React, UI design, Python" />
          </Field>
        </div>
        <button type="submit" className="btn btn-primary sm:col-span-2" disabled={busy}>{busy ? 'Laying the foundation' : 'Build my city'}</button>
        <p className="text-center text-sm text-muted sm:col-span-2">
          Already have a city? <Link to="/login" className="font-medium text-ink underline underline-offset-4">Log in</Link>
        </p>
      </form>
    </AuthShell>
  )
}
