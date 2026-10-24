import { FLOOR, pt, poly } from './iso'
import IsoBuilding from './IsoBuilding'
import { REASONS, STATUS, litRatio } from '../logic/buildingState'

// One building on its own small plot, with the reason sign at its base.
// Used on the project page, the add form preview and project cards.
export default function BuildingView({ project, showSign = true, className = '', minFloors = 6 }) {
  const solid = project.completedParts.length
  const pending = project.pendingParts.length
  const total = solid + pending
  const w = Math.min(2.6, Math.max(1.8, 1.6 + total * 0.12))
  const x = (4 - w) / 2
  const y = (4 - w) / 2
  const top = Math.max(total, minFloors) * FLOOR + (project.status === 'reviving' ? 3 : 1.6)
  const vb = { x: pt(0, 4)[0] - 14, y: pt(x, y, top)[1] - 10, w: pt(4, 0)[0] - pt(0, 4)[0] + 28 }
  vb.h = pt(4, 4, -0.5)[1] + 8 - vb.y

  const sign = project.status === 'landmark'
    ? 'LANDMARK'
    : project.status === 'reviving' || project.status === 'rebuilt'
      ? STATUS[project.status].label.toUpperCase()
      : `PAUSED: ${REASONS[project.reason]?.sign ?? 'TIME'}`

  return (
    <figure className={`flex flex-col items-center ${className}`}>
      <svg
        viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}
        className="h-full w-full"
        role="img"
        aria-label={`${project.name || 'New project'}: ${solid} floors built, ${pending} unfinished, ${STATUS[project.status].label.toLowerCase()}${project.status === 'paused' ? ` because ${REASONS[project.reason]?.label.toLowerCase()}` : ''}.`}
      >
        <defs>
          <radialGradient id="lampGlow">
            <stop offset="0" stopColor="var(--lamp)" stopOpacity="var(--glow-alpha)" />
            <stop offset="1" stopColor="var(--lamp)" stopOpacity="0" />
          </radialGradient>
        </defs>
        <polygon points={poly([0, 4, 0], [4, 4, 0], [4, 4, -0.5], [0, 4, -0.5])} fill="var(--slab-l)" />
        <polygon points={poly([4, 4, 0], [4, 0, 0], [4, 0, -0.5], [4, 4, -0.5])} fill="var(--slab-r)" />
        <polygon points={poly([0, 0, 0], [4, 0, 0], [4, 4, 0], [0, 4, 0])} fill="var(--slab-top)" />
        <IsoBuilding x={x} y={y} w={w} d={w} solid={solid} pending={pending} lit={litRatio(project)} status={project.status} seed={project.name.length + 7} />
      </svg>
      {showSign && (
        <figcaption className="-mt-1 rounded border border-ink bg-card px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]">
          {sign}
        </figcaption>
      )}
    </figure>
  )
}
