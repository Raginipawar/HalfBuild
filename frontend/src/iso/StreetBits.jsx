import { pt, poly } from './iso'

// Small street furniture for the city: lamps, trees, road strips, cars.

export function Lamp({ x, y }) {
  const [bx, by] = pt(x, y, 0)
  const [tx, ty] = pt(x, y, 1.3)
  return (
    <g>
      <circle cx={tx} cy={ty} r="13" fill="url(#lampGlow)" className="lamp-glow" />
      <line x1={bx} y1={by} x2={tx} y2={ty} stroke="var(--scaffold)" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx={tx} cy={ty} r="2.4" fill="var(--lamp)" />
    </g>
  )
}

export function Tree({ x, y, size = 1 }) {
  const [bx, by] = pt(x, y, 0)
  const [cx, cy] = pt(x, y, 0.85 * size)
  return (
    <g>
      <ellipse cx={bx + 2} cy={by + 1} rx={7 * size} ry={3.2 * size} fill="var(--shade)" />
      <line x1={bx} y1={by} x2={bx} y2={by - 9 * size} stroke="var(--trunk)" strokeWidth="2" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={7.5 * size} fill="var(--tree)" />
      <circle cx={cx - 2.2 * size} cy={cy - 2.4 * size} r={3.6 * size} fill="var(--tree-hi)" />
    </g>
  )
}

// a rectangle on the ground, used for roads and grass
export function Patch({ x, y, w, d, fill, stroke }) {
  return <polygon points={poly([x, y, 0], [x + w, y, 0], [x + w, y + d, 0], [x, y + d, 0])} fill={fill} stroke={stroke} strokeWidth="1" />
}

export function LaneDashes({ from, to }) {
  const [x1, y1] = pt(...from)
  const [x2, y2] = pt(...to)
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--lane)" strokeWidth="1.4" strokeDasharray="6 7" strokeLinecap="round" />
}

// a tiny car that loops along a straight road
export function Car({ from, to, color, dur = 14, begin = 0 }) {
  const [x1, y1] = pt(...from)
  const [x2, y2] = pt(...to)
  return (
    <g>
      <animateMotion path={`M${x1} ${y1} L${x2} ${y2}`} dur={`${dur}s`} begin={`${begin}s`} repeatCount="indefinite" rotate="auto" />
      <rect x="-7" y="-3.5" width="14" height="7" rx="2.5" fill={color} />
      <rect x="-3" y="-2.5" width="6" height="5" rx="1.5" fill="var(--face-t)" opacity="0.8" />
    </g>
  )
}
