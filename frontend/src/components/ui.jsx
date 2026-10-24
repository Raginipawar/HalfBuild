import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { animate, motion, useReducedMotion } from 'motion/react'
import { X } from 'lucide-react'
import { STATUS } from '../logic/buildingState'
import { useCurrentUser } from '../store/useStore'

// Small shared building blocks used across pages.

export function Reveal({ children, delay = 0, className = '', as = 'div' }) {
  const reduce = useReducedMotion()
  const M = motion[as]
  if (reduce) return <M className={className}>{children}</M>
  return (
    <M
      className={className}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ delay, type: 'spring', stiffness: 110, damping: 20 }}
    >
      {children}
    </M>
  )
}

export function ProtectedRoute({ children }) {
  const user = useCurrentUser()
  const location = useLocation()
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return children
}

const STATUS_STYLE = {
  paused: 'bg-grey text-ink',
  inspected: 'bg-beige text-ink',
  reviving: 'bg-light text-ink',
  rebuilt: 'bg-ink text-paper',
  landmark: 'border border-ink bg-card text-ink',
}

export function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] ${STATUS_STYLE[status]}`}>
      {STATUS[status]?.label}
    </span>
  )
}

export function Chip({ children, onRemove, tone = 'grey' }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${tone === 'ink' ? 'bg-ink text-paper' : tone === 'beige' ? 'bg-beige' : 'bg-grey/70'}`}>
      {children}
      {onRemove && (
        <button type="button" onClick={onRemove} aria-label={`Remove ${children}`} className="rounded-full p-0.5 hover:bg-black/10">
          <X size={12} />
        </button>
      )}
    </span>
  )
}

// Type and press Enter or comma to add a chip. Backspace on empty removes the last one.
export function ChipsInput({ id, value, onChange, placeholder }) {
  const [text, setText] = useState('')
  const add = () => {
    const parts = text.split(',').map((s) => s.trim()).filter(Boolean).filter((s) => !value.includes(s))
    if (parts.length) onChange([...value, ...parts])
    setText('')
  }
  return (
    <div className="field flex min-h-12 flex-wrap items-center gap-1.5 px-2 py-1.5">
      {value.map((v) => (
        <Chip key={v} onRemove={() => onChange(value.filter((x) => x !== v))}>{v}</Chip>
      ))}
      <input
        id={id}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add() }
          if (e.key === 'Backspace' && !text && value.length) onChange(value.slice(0, -1))
        }}
        onBlur={add}
        placeholder={value.length ? '' : placeholder}
        className="min-w-[8rem] flex-1 bg-transparent px-1.5 py-1 text-sm outline-none"
      />
    </div>
  )
}

export function Avatar({ name = '', size = 40, dark = false }) {
  const initials = name.split(' ').map((s) => s[0]).join('').slice(0, 2).toUpperCase()
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold ${dark ? 'bg-paper text-ink' : 'bg-ink text-paper'}`}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
      aria-hidden
    >
      {initials}
    </span>
  )
}

// Animated ring that counts up to the score.
export function ScoreRing({ score, size = 160, stroke = 12, dark = false }) {
  const reduce = useReducedMotion()
  const [shown, setShown] = useState(reduce ? score : 0)
  useEffect(() => {
    if (reduce) { setShown(score); return }
    const c = animate(0, score, { duration: 1.2, ease: [0.22, 1, 0.36, 1], onUpdate: (v) => setShown(Math.round(v)) })
    return () => c.stop()
  }, [score, reduce])
  const r = (size - stroke) / 2
  const len = 2 * Math.PI * r
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }} role="img" aria-label={`Revival Score ${score} out of 100`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={dark ? 'rgba(255,255,255,0.15)' : 'var(--color-grey)'} strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={dark ? 'var(--color-light)' : 'var(--color-ink)'}
          strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={len} strokeDashoffset={len * (1 - shown / 100)}
        />
      </svg>
      <div className="absolute text-center">
        <div className="font-display font-semibold leading-none tracking-tight" style={{ fontSize: size * 0.3 }}>{shown}</div>
        <div className={`mt-1 text-[11px] uppercase tracking-[0.18em] ${dark ? 'text-white/60' : 'text-muted'}`}>Score</div>
      </div>
    </div>
  )
}

export function Field({ label, htmlFor, hint, error, children }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium">{label}</label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-muted">{hint}</p>}
      {error && <p className="mt-1 text-xs font-medium text-[#a1361f]" role="alert">{error}</p>}
    </div>
  )
}

export function Stat({ value, label }) {
  return (
    <div>
      <div className="font-display text-3xl font-semibold tracking-tight">{value}</div>
      <div className="text-xs uppercase tracking-[0.14em] text-muted">{label}</div>
    </div>
  )
}
