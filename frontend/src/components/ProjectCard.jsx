import { Link } from 'react-router-dom'
import BuildingView from '../iso/BuildingView'
import { Chip, StatusBadge } from './ui'
import { REASONS } from '../logic/buildingState'
import { completionOf } from '../logic/revivalScore'
import { useStore } from '../store/useStore'

// Used by the list view and Builders' Square.
export default function ProjectCard({ project, showOwner = false, action = null }) {
  const owner = useStore((s) => s.users.find((u) => u.id === project.ownerId))
  const pct = completionOf(project)

  return (
    <article className="card group flex flex-col overflow-hidden transition-transform duration-300 hover:-translate-y-1">
      <Link to={`/project/${project.id}`} className="flex flex-1 flex-col">
        <div className="flex h-44 items-end justify-center border-b border-line bg-[linear-gradient(180deg,#fff,#fbfbf8)] pt-3">
          <BuildingView project={project} showSign={false} className="h-40" minFloors={8} />
        </div>
        <div className="flex flex-1 flex-col gap-3 p-5">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-display text-xl font-semibold leading-tight tracking-tight">{project.name}</h3>
            <StatusBadge status={project.status} />
          </div>
          {showOwner && owner && <p className="-mt-2 text-sm text-muted">by {owner.name}</p>}
          <p className="line-clamp-2 text-sm text-muted">{project.description}</p>
          <div>
            <div className="mb-1 flex justify-between text-xs text-muted">
              <span>Paused: {REASONS[project.reason]?.label}</span>
              <span className="font-medium text-ink">{pct}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-grey/60">
              <div className="h-full rounded-full bg-ink" style={{ width: `${pct}%` }} />
            </div>
          </div>
          {project.inspection && <p className="text-xs text-muted">Revival Score <b className="text-ink">{project.inspection.score}</b></p>}
          {project.openForCollab && project.skillsNeeded.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {project.skillsNeeded.map((s) => <Chip key={s} tone="beige">{s}</Chip>)}
            </div>
          )}
        </div>
      </Link>
      {action && <div className="border-t border-line p-4">{action}</div>}
    </article>
  )
}
