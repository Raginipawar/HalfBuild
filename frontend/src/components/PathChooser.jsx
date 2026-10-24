import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { CONFIG, PATH_ORDER } from '../logic/revivalScore'
import { useStore, useCurrentUser } from '../store/useStore'
import { Field } from './ui'
import { DragCard, DropZone, CanvasHint } from './Canvas'
import BuildingView from '../iso/BuildingView'

// Canvas Protocol: drag a path card onto your building to start it.
// Paths that need one more detail (new goal, lessons, a part to move) ask for it,
// then you drop the signed plan card on the building to confirm.
const NEEDS_DETAIL = ['changeIdea', 'archive', 'repurpose']

export default function PathChooser({ project, recommended, onApplied }) {
  const applyPath = useStore((s) => s.applyPath)
  const user = useCurrentUser()
  const others = useStore((s) => s.projects.filter((p) => p.ownerId === user?.id && p.id !== project.id && p.status !== 'landmark'))
  const [picked, setPicked] = useState(null)
  const [goal, setGoal] = useState(project.goal)
  const [lessons, setLessons] = useState('')
  const [part, setPart] = useState(project.completedParts[0] ?? '')
  const [target, setTarget] = useState(others[0]?.id ?? '')

  const apply = (path) => {
    if (path === 'changeIdea') applyPath(project.id, path, { goal })
    else if (path === 'archive') applyPath(project.id, path, { lessons })
    else if (path === 'repurpose') applyPath(project.id, path, { part, targetId: target })
    else applyPath(project.id, path)
    onApplied?.(path)
  }

  const ready =
    picked &&
    (picked !== 'archive' || lessons.trim().length > 0) &&
    (picked !== 'repurpose' || (part && target)) &&
    (picked !== 'changeIdea' || goal.trim().length > 0)

  const onDrop = (data, type) => {
    if (type === 'path') {
      if (NEEDS_DETAIL.includes(data)) setPicked(data)
      else apply(data)
    } else if (type === 'plan' && ready) apply(picked)
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
      <div className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          {PATH_ORDER.map((key) => {
            const p = CONFIG.paths[key]
            return (
              <DragCard key={key} type="path" data={key} label={`${p.label} path`} className={key === recommended ? '!border-light' : ''}>
                <span className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold uppercase tracking-[0.12em]">{p.label}</span>
                  {key === recommended && <span className="rounded-full bg-light px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#1f1e1f]">Recommended</span>}
                </span>
                <span className="mt-1.5 block text-sm text-muted">{p.blurb}</span>
              </DragCard>
            )
          })}
        </div>
        <CanvasHint>Drag a path onto your building to start it.</CanvasHint>
      </div>

      <DropZone accepts={picked ? ['path', 'plan'] : ['path']} onDrop={onDrop} title="Your building" className="flex flex-col items-center p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Your building · drop a path here</p>
        <BuildingView project={project} showSign={false} className="h-56 w-full" minFloors={6} />
        <AnimatePresence>
          {picked && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="w-full overflow-hidden">
              <div className="mt-3 space-y-3 text-left">
                <p className="text-sm"><b>{CONFIG.paths[picked].label}.</b> {CONFIG.paths[picked].firstStep(project)}</p>
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
                    <div className="grid gap-3">
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
                <DragCard type="plan" data={picked} disabled={!ready} label="Signed plan">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">Signed plan</p>
                  <p className="text-sm font-semibold">{ready ? 'Drop me on the building to confirm' : 'Fill in the detail above first'}</p>
                </DragCard>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DropZone>
    </div>
  )
}
