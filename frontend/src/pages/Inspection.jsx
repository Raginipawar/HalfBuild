import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { ArrowLeft } from 'lucide-react'
import { useStore, useCurrentUser } from '../store/useStore'
import BuildingView from '../iso/BuildingView'
import PathChooser from '../components/PathChooser'
import { ScoreRing } from '../components/ui'
import { DragCard, DropZone, CanvasHint } from '../components/Canvas'
import { CONFIG, defaultAnswers, inspect } from '../logic/revivalScore'
import NotFound from './NotFound'

// One question per screen. The progress bar is a scanner line moving up the building.
export default function Inspection() {
  const { id } = useParams()
  const project = useStore((s) => s.projects.find((p) => p.id === id))
  const runInspection = useStore((s) => s.runInspection)
  const me = useCurrentUser()
  const navigate = useNavigate()
  const reduce = useReducedMotion()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState(() => (project ? defaultAnswers(project) : {}))
  const [result, setResult] = useState(null)

  const questions = CONFIG.questions
  const q = questions[step]
  const last = step === questions.length - 1

  // Canvas Protocol: dropping an answer card into the slot files it and moves on
  const file = (value) => {
    const a = { ...answers, [q.id]: value }
    setAnswers(a)
    if (!last) return setStep(step + 1)
    const r = inspect(a, project)
    runInspection(project.id, r)
    setResult(r)
  }

  if (!project) return <NotFound />
  if (me?.id !== project.ownerId) return <Navigate to={`/project/${project.id}`} replace />

  const progress = result ? 1 : step / questions.length

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-8">
      <Link to={`/project/${project.id}`} className="text-sm text-muted hover:text-ink">← {project.name}</Link>
      <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_1.3fr]">
        {/* Building with scanner line */}
        <div
          className="relative flex items-end justify-center overflow-hidden rounded-[1.75rem] border border-ink p-8 lg:sticky lg:top-24 lg:self-start"
          style={{ background: 'linear-gradient(180deg, var(--sky-top), var(--sky-bottom))' }}
        >
          <BuildingView project={project} className="h-[380px] w-full" minFloors={8} />
          <motion.div
            className="pointer-events-none absolute inset-x-0 h-px bg-light shadow-[0_0_18px_4px_rgba(245,185,66,0.55)]"
            animate={{ bottom: `${8 + progress * 84}%` }}
            transition={{ duration: reduce ? 0 : 0.6, ease: [0.22, 1, 0.36, 1] }}
            aria-hidden
          />
          <div className="absolute left-5 top-5 rounded-full border border-ink bg-paper px-3 py-1 text-xs font-medium">
            {result ? 'Inspection complete' : `Question ${step + 1} of ${questions.length}`}
          </div>
          <div className="absolute inset-x-5 top-14 h-1 overflow-hidden rounded-full bg-grey/60" role="progressbar" aria-valuemin={0} aria-valuemax={questions.length} aria-valuenow={result ? questions.length : step}>
            <motion.div className="h-full bg-ink" animate={{ width: `${progress * 100}%` }} />
          </div>
        </div>

        {/* Question or result */}
        <div>
          <p className="eyebrow">Site Inspection</p>
          <AnimatePresence mode="wait">
            {!result ? (
              <motion.div
                key={q.id}
                initial={reduce ? { opacity: 0 } : { opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, x: -40 }}
                transition={{ duration: 0.3 }}
              >
                <h1 className="title mt-2">{q.label}</h1>
                <p className="lead mt-3">{q.help}</p>
                <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_200px]">
                  <Answer q={q} value={answers[q.id]} onChange={(v) => setAnswers({ ...answers, [q.id]: v })} />
                  <DropZone accepts={['answer']} onDrop={file} title={last ? 'Inspection slot · see my score' : 'Inspection slot'} hint="Drop your answer here" className="min-h-[120px] lg:sticky lg:top-28 lg:self-start" />
                </div>
                <div className="mt-6 flex flex-wrap items-center gap-4">
                  {step > 0 && (
                    <button className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink" onClick={() => setStep(step - 1)}>
                      <ArrowLeft size={14} /> Previous question
                    </button>
                  )}
                  <CanvasHint>Drag an answer card into the slot to file it.</CanvasHint>
                </div>
              </motion.div>
            ) : (
              <motion.div key="result" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
                <div className="mt-4 flex flex-wrap items-center gap-8">
                  <ScoreRing score={result.score} size={180} stroke={14} />
                  <div className="flex-1">
                    <p className="text-sm text-muted">Recommended path</p>
                    <p className="display !text-[clamp(2.5rem,5vw,4rem)]">{CONFIG.paths[result.path].label}</p>
                  </div>
                </div>
                <ul className="mt-6 space-y-1.5">
                  {result.reasons.map((r) => <li key={r} className="text-lg">{r}</li>)}
                </ul>
                <div className="panel mt-6 p-5">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/50">Your first step</p>
                  <p className="mt-1 text-lg">{result.firstStep}</p>
                </div>
                <details className="mt-5 text-sm">
                  <summary className="cursor-pointer text-muted">How this score was worked out</summary>
                  <ul className="mt-3 grid gap-1 sm:grid-cols-2">
                    {result.breakdown.map((b) => (
                      <li key={b.id} className="flex justify-between rounded-lg bg-card px-3 py-2"><span>{b.label}</span><b>{b.points} / {b.max}</b></li>
                    ))}
                  </ul>
                </details>
                <div className="mt-8">
                  <h2 className="subtitle">Pick your path</h2>
                  <p className="mb-4 mt-1 text-sm text-muted">Drag the recommended path, or any other, onto your building to start it.</p>
                  <PathChooser project={project} recommended={result.path} onApplied={() => navigate(`/project/${project.id}`)} />
                  <Link to={`/project/${project.id}`} className="mt-4 inline-block text-sm text-muted underline underline-offset-4 hover:text-ink">Decide later</Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  )
}

function Answer({ q, value, onChange }) {
  if (q.type === 'slider') {
    return (
      <div>
        <div className="font-display text-6xl font-semibold tracking-tight">{value}%</div>
        <input
          type="range" min={0} max={100} step={5}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          aria-label={q.label}
          className="mt-4 w-full accent-[var(--color-ink)]"
        />
        <div className="mt-5 max-w-xs">
          <DragCard type="answer" data={value} label={`Answer ${value} percent`}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">Your answer</p>
            <p className="font-display text-2xl font-semibold">{value}% done</p>
          </DragCard>
        </div>
      </div>
    )
  }
  return (
    <div className={`grid gap-2.5 ${q.type === 'scale' ? 'grid-cols-5' : 'sm:grid-cols-2'}`} aria-label={q.label}>
      {q.options.map((o) => (
        <DragCard key={o.value} type="answer" data={o.value} label={o.label} className={value === o.value ? '!border-light' : ''}>
          {q.type === 'scale' ? (
            <div className="text-center">
              <span className="block font-display text-3xl font-semibold">{o.value}</span>
              <span className="mt-1 hidden text-[11px] text-muted sm:block">{o.label}</span>
            </div>
          ) : (
            <span className="text-sm font-medium">{o.label}</span>
          )}
        </DragCard>
      ))}
    </div>
  )
}
