import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { CONFIG, PATH_ORDER } from '../logic/revivalScore'
import { useStore, useCurrentUser } from '../store/useStore'
import { Field } from './ui'

// Shows the five revival paths. Some paths ask one small thing before applying:
// a new goal, a part to move, or lessons learned.
export default function PathChooser({ project, recommended, onApplied, startOpen = null }) {
  const applyPath = useStore((s) => s.applyPath)
  const user = useCurrentUser()
  const others = useStore((s) => s.projects.filter((p) => p.ownerId === user?.id && p.id !== project.id && p.status !== 'landmark'))
  const [picked, setPicked] = useState(startOpen)
  const [goal, setGoal] = useState(project.goal)
  const [lessons, setLessons] = useState('')
  const [part, setPart] = useState(project.completedParts[0] ?? '')
  const [target, setTarget] = useState(others[0]?.id ?? '')

  const apply = () => {
    if (picked === 'changeIdea') applyPath(project.id, picked, { goal })
    else if (picked === 'archive') applyPath(project.id, picked, { lessons })
    else if (picked === 'repurpose') applyPath(project.id, picked, { part, targetId: target })
    else applyPath(project.id, picked)
    onApplied?.(picked)
  }

  const canApply =
    picked &&
    (picked !== 'archive' || lessons.trim().length > 0) &&
    (picked !== 'repurpose' || (part && target)) &&
    (picked !== 'changeIdea' || goal.trim().length > 0)

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {PATH_ORDER.map((key) => {
          const p = CONFIG.paths[key]
          const active = picked === key
          return (
            <button
              key={key}
              type="button"
              onClick={() => setPicked(key)}
              aria-pressed={active}
              className={`rounded-2xl border p-4 text-left transition-colors ${active ? 'border-ink bg-ink text-paper' : 'border-grey bg-card hover:border-ink'}`}
            >
              <span className="flex items-center justify-between">
                <span className="text-sm font-semibold uppercase tracking-[0.12em]">{p.label}</span>
                {key === recommended && <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${active ? 'bg-light text-ink' : 'bg-beige'}`}>Recommended</span>}
              </span>
              <span className={`mt-1.5 block text-sm ${active ? 'text-paper/70' : 'text-muted'}`}>{p.blurb}</span>
            </button>
          )
        })}
      </div>

      <AnimatePresence>
        {picked && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 space-y-4 rounded-2xl border border-ink bg-card p-5">
              <p className="text-sm"><b>First step:</b> {CONFIG.paths[picked].firstStep(project)}</p>
              {picked === 'changeIdea' && (
                <Field label="Rewrite the goal" htmlFor="newGoal">
                  <textarea id="newGoal" rows={2} className="field resize-none" value={goal} onChange={(e) => setGoal(e.target.value)} />
                </Field>
              )}
              {picked === 'archive' && (
                <Field label="Lessons learned" htmlFor="lessons" hint="These go on the landmark plaque.">
                  <textarea id="lessons" rows={3} className="field resize-none" value={lessons} onChange={(e) => setLessons(e.target.value)} placeholder="1. ... 2. ... 3. ..." />
                </Field>
              )}
              {picked === 'repurpose' && (
                others.length && project.completedParts.length ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Part to move" htmlFor="part">
                      <select id="part" className="field" value={part} onChange={(e) => setPart(e.target.value)}>
                        {project.completedParts.map((c) => <option key={c}>{c}</option>)}
                      </select>
                    </Field>
                    <Field label="Move it into" htmlFor="target">
                      <select id="target" className="field" value={target} onChange={(e) => setTarget(e.target.value)}>
                        {others.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
                      </select>
                    </Field>
                  </div>
                ) : (
                  <p className="text-sm text-muted">You need a finished part here and another project to move it into.</p>
                )
              )}
              <button type="button" className="btn btn-primary" disabled={!canApply} onClick={apply} style={{ opacity: canApply ? 1 : 0.4 }}>
                {picked === 'archive' ? 'Lay it to rest as a landmark' : picked === 'repurpose' ? 'Move the part' : 'Start reviving'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
