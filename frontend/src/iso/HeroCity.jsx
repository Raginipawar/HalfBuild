import { useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { FLOOR, pt, poly } from './iso'
import IsoBuilding from './IsoBuilding'
import { Lamp, Tree, Patch, LaneDashes, Car } from './StreetBits'

// The landing page city: a floating block with two roads, lamps, a park
// and a dozen projects in different states.
const SIZE = 14
const ROAD = [6.3, 7.7]

const BUILDINGS = [
  { name: 'Habit Tracker',    x: 1,    y: 1,    w: 2,   d: 2,   solid: 6, pending: 2, lit: 0.85, status: 'paused' },
  { name: 'Lofi Timer',       x: 3.7,  y: 0.8,  w: 1.8, d: 1.8, solid: 4, pending: 0, lit: 1,    status: 'rebuilt' },
  { name: 'Recipe Remix',     x: 1,    y: 3.7,  w: 1.8, d: 1.8, solid: 3, pending: 3, lit: 0.5,  status: 'paused' },
  { name: 'Campus Lost and Found', x: 3.6, y: 3.4, w: 2, d: 2,  solid: 7, pending: 2, lit: 1,    status: 'reviving' },
  { name: 'Server Garden',    x: 8.3,  y: 1,    w: 2.2, d: 2.2, solid: 5, pending: 2, lit: 0,    status: 'paused' },
  { name: 'Notes Graph',      x: 11.2, y: 1,    w: 1.9, d: 1.8, solid: 8, pending: 0, lit: 1,    status: 'rebuilt' },
  { name: 'Study Buddy Bot',  x: 8.5,  y: 3.8,  w: 1.8, d: 1.8, solid: 3, pending: 2, lit: 0.85, status: 'paused' },
  { name: 'Weather Haiku',    x: 11.2, y: 3.6,  w: 2,   d: 2,   solid: 3, pending: 0, lit: 0,    status: 'landmark' },
  { name: 'Plant Pal',        x: 1,    y: 8.3,  w: 2,   d: 2,   solid: 9, pending: 1, lit: 1,    status: 'reviving' },
  { name: 'Budget Bee',       x: 3.7,  y: 8.5,  w: 1.8, d: 1.8, solid: 2, pending: 2, lit: 0.5,  status: 'paused' },
  { name: 'Rent Split',       x: 8.3,  y: 8.3,  w: 2,   d: 2,   solid: 5, pending: 0, lit: 1,    status: 'rebuilt' },
  { name: 'Sketch Journal',   x: 11.2, y: 8.3,  w: 2,   d: 2,   solid: 6, pending: 1, lit: 0.5,  status: 'paused' },
  { name: 'Quiz Quest',       x: 8.5,  y: 11.1, w: 1.8, d: 1.8, solid: 1, pending: 3, lit: 0,    status: 'paused' },
]

const LAMPS = [
  [2.4, 6], [5.6, 6], [9.6, 6], [12.8, 6],
  [2.6, 8], [10.6, 8],
  [6, 2.4], [6, 10.6], [8, 13],
]

const TREES = [
  [1.5, 11.6, 1], [2.8, 12.7, 1.1], [4.1, 11.5, 0.9], [4.9, 12.9, 1], [1.4, 13.1, 0.8],
  [12.2, 11.6, 1], [12.9, 12.9, 0.9], [11.2, 12.8, 0.8],
]

const STATUS_TEXT = {
  paused: 'paused construction',
  reviving: 'being revived',
  rebuilt: 'rebuilt',
  landmark: 'landmark with lessons',
}

export default function HeroCity() {
  const reduce = useReducedMotion()
  const [hover, setHover] = useState(null)

  // everything sorted back to front so nearer things draw on top
  const items = [
    ...BUILDINGS.map((b, i) => ({ kind: 'b', depth: b.x + b.w / 2 + b.y + b.d / 2, b, i })),
    ...LAMPS.map(([x, y], i) => ({ kind: 'l', depth: x + y, x, y, i })),
    ...TREES.map(([x, y, s], i) => ({ kind: 't', depth: x + y, x, y, s, i })),
  ].sort((a, b) => a.depth - b.depth)

  const left = pt(0, SIZE)[0] - 20
  const right = pt(SIZE, 0)[0] + 20
  // fit the view to the tallest roof (plus crane) so there is no empty sky
  const topY = Math.min(...BUILDINGS.map((b) =>
    pt(b.x, b.y, (b.solid + b.pending) * FLOOR + (b.status === 'reviving' ? 2.8 : 1.4))[1])) - 16
  const bottomY = pt(SIZE, SIZE, -0.7)[1] + 16
  const vb = { x: left, y: topY, w: right - left, h: bottomY - topY }

  const tip = hover !== null ? BUILDINGS[hover] : null
  const tipPos = tip && (() => {
    const [sx, sy] = pt(tip.x + tip.w / 2, tip.y + tip.d / 2, (tip.solid + tip.pending) * FLOOR)
    return { left: `${((sx - vb.x) / vb.w) * 100}%`, top: `${((sy - vb.y) / vb.h) * 100}%` }
  })()

  return (
    <div className="relative">
      <svg
        viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}
        className="block w-full h-auto"
        role="img"
        aria-label="An isometric city of thirteen projects. Finished parts are solid lit floors, unfinished parts are dashed scaffolding, two buildings have cranes because they are being revived."
      >
        <defs>
          <radialGradient id="lampGlow">
            <stop offset="0" stopColor="var(--lamp)" stopOpacity="var(--glow-alpha)" />
            <stop offset="1" stopColor="var(--lamp)" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* floating ground slab */}
        <polygon points={poly([0, SIZE, 0], [SIZE, SIZE, 0], [SIZE, SIZE, -0.7], [0, SIZE, -0.7])} fill="var(--slab-l)" />
        <polygon points={poly([SIZE, SIZE, 0], [SIZE, 0, 0], [SIZE, 0, -0.7], [SIZE, SIZE, -0.7])} fill="var(--slab-r)" />
        <polygon points={poly([0, 0, 0], [SIZE, 0, 0], [SIZE, SIZE, 0], [0, SIZE, 0])} fill="var(--slab-top)" />

        {/* park and roads */}
        <Patch x={0.7} y={10.9} w={5} d={2.7} fill="var(--grass)" />
        <Patch x={10.8} y={10.9} w={2.6} d={2.7} fill="var(--grass)" />
        <Patch x={0} y={ROAD[0]} w={SIZE} d={ROAD[1] - ROAD[0]} fill="var(--road)" stroke="var(--curb)" />
        <Patch x={ROAD[0]} y={0} w={ROAD[1] - ROAD[0]} d={SIZE} fill="var(--road)" stroke="var(--curb)" />
        <LaneDashes from={[0.3, 7, 0]} to={[ROAD[0] - 0.2, 7, 0]} />
        <LaneDashes from={[ROAD[1] + 0.2, 7, 0]} to={[SIZE - 0.3, 7, 0]} />
        <LaneDashes from={[7, 0.3, 0]} to={[7, ROAD[0] - 0.2, 0]} />
        <LaneDashes from={[7, ROAD[1] + 0.2, 0]} to={[7, SIZE - 0.3, 0]} />

        {!reduce && (
          <>
            <Car from={[0.2, 7.35, 0]} to={[SIZE - 0.2, 7.35, 0]} color="var(--car-a)" dur={16} />
            <Car from={[6.65, SIZE - 0.2, 0]} to={[6.65, 0.2, 0]} color="var(--car-b)" dur={13} begin={-6} />
          </>
        )}

        {items.map((it) => {
          if (it.kind === 'l') return <Lamp key={`l${it.i}`} x={it.x} y={it.y} />
          if (it.kind === 't') return <Tree key={`t${it.i}`} x={it.x} y={it.y} size={it.s} />
          const { b, i } = it
          return (
            <motion.g
              key={`b${i}`}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              whileHover={reduce ? undefined : { y: -4 }}
              transition={{ duration: 0.2 }}
              style={{ cursor: 'default' }}
            >
              <IsoBuilding {...b} seed={i + 3} delay={0.15 + i * 0.07} />
            </motion.g>
          )
        })}
      </svg>

      {tip && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-[calc(100%+14px)] rounded-xl bg-ink px-3.5 py-2.5 text-left text-paper shadow-lg"
          style={tipPos}
        >
          <div className="font-serif text-lg leading-tight whitespace-nowrap">{tip.name}</div>
          <div className="mt-0.5 text-[11px] uppercase tracking-[0.14em] text-white/60 whitespace-nowrap">
            {tip.solid} built · {tip.status === 'paused' || tip.status === 'reviving' ? `${tip.pending} to go · ` : ''}
            {STATUS_TEXT[tip.status]}
          </div>
        </div>
      )}
    </div>
  )
}
