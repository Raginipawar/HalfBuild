import { motion, useReducedMotion } from 'motion/react'
import { FLOOR, poly, line, pt, hash } from './iso'
import { STATUS } from '../logic/buildingState'

// One isometric building.
// solid floors = completed parts, dashed scaffolding = unfinished parts.
export default function IsoBuilding({
  x, y, w = 2, d = 2,
  solid = 0, pending = 0, lit = 0.85,
  status = 'paused', seed = 1, delay = 0,
}) {
  const reduce = useReducedMotion()
  const look = STATUS[status] ?? STATUS.paused
  const tone = look.stone ? 'stone' : 'face'
  const top = solid * FLOOR
  const scaffoldTop = top + (look.scaffold ? pending : 0) * FLOOR

  const rise = (i) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 10 },
          animate: { opacity: 1, y: 0 },
          transition: { delay: delay + i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] },
        }

  return (
    <g>
      {/* soft contact shadow */}
      <polygon
        points={poly([x - 0.1, y - 0.1, 0], [x + w + 0.35, y - 0.1, 0], [x + w + 0.35, y + d + 0.35, 0], [x - 0.1, y + d + 0.35, 0])}
        fill="var(--shade)"
      />

      {Array.from({ length: solid }, (_, k) => (
        <motion.g key={k} {...rise(k)}>
          <Floor x={x} y={y} w={w} d={d} k={k} tone={tone} lit={lit} seed={seed} />
        </motion.g>
      ))}

      <motion.g {...rise(Math.max(solid - 1, 0))}>
        <polygon
          points={poly([x, y, top], [x + w, y, top], [x + w, y + d, top], [x, y + d, top])}
          fill={`var(--${tone}-t)`}
          stroke="var(--edge)"
          strokeWidth="0.6"
          strokeLinejoin="round"
        />
        {look.stone && <Plaque x={x} y={y} w={w} d={d} />}
      </motion.g>

      {look.scaffold && pending > 0 && (
        <motion.g {...rise(solid + 1)}>
          <Scaffold x={x} y={y} w={w} d={d} z={top} floors={pending} />
        </motion.g>
      )}

      {look.flag && <Flag x={x + w / 2} y={y + d / 2} z={top} />}
      {look.crane && <Crane x={x + 0.3} y={y + 0.3} z={scaffoldTop} reach={w + 1.2} reduce={reduce} />}
    </g>
  )
}

function Floor({ x, y, w, d, k, tone, lit, seed }) {
  const z0 = k * FLOOR
  const z1 = z0 + FLOOR
  const zA = z0 + FLOOR * 0.3
  const zB = z0 + FLOOR * 0.72
  const nl = Math.max(1, Math.round(w / 0.55))
  const nr = Math.max(1, Math.round(d / 0.55))
  const on = (side, i) => hash(seed, k, i, side) < lit

  return (
    <>
      <polygon
        points={poly([x, y + d, z0], [x + w, y + d, z0], [x + w, y + d, z1], [x, y + d, z1])}
        fill={`var(--${tone}-l)`}
        stroke="var(--edge)"
        strokeWidth="0.6"
        strokeLinejoin="round"
      />
      <polygon
        points={poly([x + w, y + d, z0], [x + w, y, z0], [x + w, y, z1], [x + w, y + d, z1])}
        fill={`var(--${tone}-r)`}
        stroke="var(--edge)"
        strokeWidth="0.6"
        strokeLinejoin="round"
      />
      {Array.from({ length: nl }, (_, i) => {
        const s = w / nl
        const u0 = x + i * s + s * 0.28
        const u1 = u0 + s * 0.44
        return (
          <polygon
            key={`l${i}`}
            points={poly([u0, y + d, zA], [u1, y + d, zA], [u1, y + d, zB], [u0, y + d, zB])}
            fill={on(0, i) ? 'var(--light)' : 'var(--window-off)'}
          />
        )
      })}
      {Array.from({ length: nr }, (_, i) => {
        const s = d / nr
        const v0 = y + d - i * s - s * 0.28
        const v1 = v0 - s * 0.44
        return (
          <polygon
            key={`r${i}`}
            points={poly([x + w, v0, zA], [x + w, v1, zA], [x + w, v1, zB], [x + w, v0, zB])}
            fill={on(1, i) ? 'var(--light)' : 'var(--window-off)'}
            opacity={on(1, i) ? 0.92 : 1}
          />
        )
      })}
    </>
  )
}

function Scaffold({ x, y, w, d, z, floors }) {
  const zt = z + floors * FLOOR
  const dash = { stroke: 'var(--scaffold)', strokeWidth: 1, strokeDasharray: '3 2.5', strokeLinecap: 'round' }
  const corners = [[x, y + d], [x + w, y + d], [x + w, y]]
  return (
    <g>
      <line {...line([x, y, z], [x, y, zt])} {...dash} opacity="0.45" />
      {corners.map(([cx, cy], i) => (
        <line key={i} {...line([cx, cy, z], [cx, cy, zt])} {...dash} />
      ))}
      {Array.from({ length: floors }, (_, j) => {
        const a = z + j * FLOOR
        const b = a + FLOOR
        return (
          <g key={j}>
            <line {...line([x, y, b], [x + w, y, b])} {...dash} opacity="0.45" />
            <line {...line([x, y, b], [x, y + d, b])} {...dash} opacity="0.45" />
            <line {...line([x, y + d, b], [x + w, y + d, b])} {...dash} />
            <line {...line([x + w, y + d, b], [x + w, y, b])} {...dash} />
            {/* light diagonal braces */}
            <line {...line([x, y + d, a], [x + w, y + d, b])} {...dash} opacity="0.6" />
            <line {...line([x + w, y + d, a], [x + w, y, b])} {...dash} opacity="0.6" />
          </g>
        )
      })}
    </g>
  )
}

function Crane({ x, y, z, reach, reduce }) {
  const h = 2.4
  const [mx, my] = pt(x, y, z + h)
  const end = pt(x + reach, y, z + h)
  const back = pt(x - 0.8, y, z + h)
  const hookX = end[0] - (end[0] - mx) * 0.3
  const hookY = end[1] - (end[1] - my) * 0.3
  return (
    <g stroke="var(--crane)" strokeLinecap="round">
      <line {...line([x, y, z], [x, y, z + h])} strokeWidth="2.2" />
      <g>
        {!reduce && (
          <animateTransform attributeName="transform" type="rotate" values={`-4 ${mx} ${my};4 ${mx} ${my};-4 ${mx} ${my}`} dur="6s" repeatCount="indefinite" />
        )}
        <line x1={back[0]} y1={back[1]} x2={end[0]} y2={end[1]} strokeWidth="1.8" />
        <line x1={mx} y1={my - 7} x2={end[0]} y2={end[1]} strokeWidth="0.8" />
        <line x1={mx} y1={my - 7} x2={back[0]} y2={back[1]} strokeWidth="0.8" />
        <line x1={hookX} y1={hookY} x2={hookX} y2={hookY + 18} strokeWidth="0.8" />
        <rect x={hookX - 2.5} y={hookY + 18} width="5" height="4" rx="1" fill="var(--crane)" stroke="none" />
        <rect x={back[0] - 3} y={back[1] - 1} width="6" height="5" rx="1" fill="var(--crane)" stroke="none" />
      </g>
    </g>
  )
}

function Flag({ x, y, z }) {
  const [bx, by] = pt(x, y, z)
  const [tx, ty] = pt(x, y, z + 1.1)
  return (
    <g>
      <line x1={bx} y1={by} x2={tx} y2={ty} stroke="var(--scaffold)" strokeWidth="1.2" />
      <path d={`M${tx} ${ty} l12 4 l-12 4 z`} fill="var(--flag)" />
    </g>
  )
}

function Plaque({ x, y, w, d }) {
  return (
    <polygon
      points={poly([x + w * 0.3, y + d, 0.06], [x + w * 0.7, y + d, 0.06], [x + w * 0.7, y + d, 0.32], [x + w * 0.3, y + d, 0.32])}
      fill="var(--plaque)"
      stroke="var(--edge)"
      strokeWidth="0.6"
    />
  )
}
