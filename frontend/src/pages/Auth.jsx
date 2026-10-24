import { lazy, Suspense, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { ChipsInput, Field } from '../components/ui'
import { DragCard, DropZone, CanvasHint } from '../components/Canvas'
import Logo from '../components/Logo'
import { PixelSquares } from '../components/Decor'
// the 3D lanyard pulls in three.js, so it only loads on these two pages
const Lanyard = lazy(() => import('../components/Lanyard/Lanyard'))

// Sign up and Log in share one layout: form on the left, a building on the right.
// DEMO AUTHENTICATION ONLY: everything stays in this browser.


// Canvas Protocol: you enter by dropping your builder pass on the site gate.
function PassAndGate({ name, line, onEnter, busy, gateTitle }) {
  return (
    <div className="mt-2 space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <DragCard type="pass" data="pass" label="Your builder pass" disabled={busy}>
          <div className="flex items-center gap-3">
            <Logo size={28} />
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">Builder pass</p>
              <p className="truncate font-semibold">{name || 'Your name here'}</p>
              <p className="truncate text-xs text-muted">{line}</p>
            </div>
          </div>
        </DragCard>
        <DropZone accepts={['pass']} onDrop={onEnter} title={busy ? 'Opening the gate' : gateTitle} hint="Drop your pass here" />
      </div>
      <CanvasHint />
    </div>
  )
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
      <div className="panel relative hidden min-h-[620px] overflow-hidden lg:block">
        <Suspense fallback={null}>
          <Lanyard
            frontImage="/lanyard/card-front.svg"
            backImage="/lanyard/card-back.svg"
            strapImage="/lanyard/strap.svg"
            cardColor="#1f1e1f"
            finish="glossy"
            metal="graphite"
            size={0.62}
            strapLength={0.42}
          />
        </Suspense>
        <p className="pointer-events-none absolute bottom-6 left-8 right-8 text-sm text-white/55">
          Your builder pass. Drag it, throw it, click to flip it.
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
    e?.preventDefault()
    setBusy(true)
    const res = await login(form)
    setBusy(false)
    if (res.ok) navigate(from, { replace: true })
    else setError(res.error)
  }

  return (
    <AuthShell title="Welcome back." sub="Your city kept the lights on where it could.">
      <form onSubmit={(e) => e.preventDefault()} className="space-y-4" noValidate>
        <Field label="Email" htmlFor="email">
          <input id="email" type="email" autoComplete="email" required className="field" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </Field>
        <Field label="Password" htmlFor="password" error={error}>
          <input id="password" type="password" autoComplete="current-password" required className="field" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </Field>
        <PassAndGate name={form.email} line="Drag me to the gate to log in" onEnter={submit} busy={busy} gateTitle="Site gate · Log in" />
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
    e?.preventDefault()
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
      <form onSubmit={(e) => e.preventDefault()} className="grid gap-4 sm:grid-cols-2" noValidate>
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
        <div className="sm:col-span-2">
          <PassAndGate name={form.name} line={form.username ? `@${form.username}` : 'Drag me to the gate to join'} onEnter={submit} busy={busy} gateTitle="Site gate · Build my city" />
        </div>
        <p className="text-center text-sm text-muted sm:col-span-2">
          Already have a city? <Link to="/login" className="font-medium text-ink underline underline-offset-4">Log in</Link>
        </p>
      </form>
    </AuthShell>
  )
}
