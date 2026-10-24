import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import { FLOOR, pt, poly } from './iso'
import IsoBuilding from './IsoBuilding'
import { Lamp, Tree, Patch, LaneDashes, Car } from './StreetBits'
import { STATUS, REASONS, litRatio } from '../logic/buildingState'

// Lay projects out on city blocks: 4 lots per block, a road after every block.
const LOT = 3
const BLOCK = LOT * 2
const ROAD = 1.4
const STEP = BLOCK + ROAD

export function layoutCity(projects) {
  const blocks = Math.max(1, Math.ceil(projects.length / 4))
  const cols = Math.ceil(Math.sqrt(blocks))
  const rows = Math.ceil(blocks / cols)
  const lots = []
  for (let b = 0; b < cols * rows; b++) {
    const bx = (b % cols) * STEP
    const by = Math.floor(b / cols) * STEP
    for (let k = 0; k < 4; k++) lots.push({ x: bx + (k % 2) * LOT, y: by + Math.floor(k / 2) * LOT, block: [bx, by] })
  }
  const buildings = projects.map((p, i) => {
    const total = p.completedParts.length + p.pendingParts.length
    const w = Math.min(2.4, Math.max(1.6, 1.5 + total * 0.12))
    const lot = lots[i]
    return { project: p, x: lot.x + (LOT - w) / 2, y: lot.y + (LOT - w) / 2, w, d: w }
  })
  const empty = lots.slice(projects.length)
  return { buildings, empty, sizeX: cols * STEP, sizeY: rows * STEP, cols, rows }
}

export default function City({ projects, users = [], highlightOwner = null, interactive = true, minWidth = 0, extraDays = 0 }) {
  const reduce = useReducedMotion()
  const navigate = useNavigate()
  const [hover, setHover] = useState(null)
  const scroller = useRef(null)
  const drag = useRef(null)

  const { buildings, empty, sizeX, sizeY, cols, rows } = layoutCity(projects)
  const ownerName = (id) => users.find((u) => u.id === id)?.name

  const items = [
    ...buildings.map((b, i) => ({ kind: 'b', depth: b.x + b.y + b.w, b, i })),
    ...empty.flatMap((l, i) => [
      { kind: 't', depth: l.x + l.y + 1, x: l.x + 1, y: l.y + 1.1, s: 1, i: `a${i}` },
      { kind: 't', depth: l.x + l.y + 3.4, x: l.x + 2.1, y: l.y + 2, s: 0.85, i: `b${i}` },
    ]),
  ]
  // lamps on the corners where roads meet
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      const x = c * STEP + BLOCK + 0.2
      const y = r * STEP + BLOCK + 0.2
      items.push({ kind: 'l', depth: x + y, x, y, i: `${c}-${r}` })
      items.push({ kind: 'l', depth: x - 3 + y, x: x - 3.2, y, i: `${c}-${r}b` })
    }
  }
  items.sort((a, b) => a.depth - b.depth)

  // view box fitted to the slab and the tallest roof
  const tallest = Math.min(
    -60,
    ...buildings.map((b) => pt(b.x, b.y, (b.project.completedParts.length + b.project.pendingParts.length) * FLOOR + (b.project.status === 'reviving' ? 2.8 : 1.4))[1]),
  )
  const vb = {
    x: pt(0, sizeY)[0] - 24,
    y: tallest - 16,
    w: pt(sizeX, 0)[0] - pt(0, sizeY)[0] + 48,
    h: pt(sizeX, sizeY, -0.7)[1] + 16 - (tallest - 16),
  }

  const tip = hover !== null ? buildings[hover] : null
  const tipPos = tip && (() => {
    const [sx, sy] = pt(tip.x + tip.w / 2, tip.y + tip.d / 2, (tip.project.completedParts.length + tip.project.pendingParts.length) * FLOOR)
    return { left: `${((sx - vb.x) / vb.w) * 100}%`, top: `${((sy - vb.y) / vb.h) * 100}%` }
  })()

  // drag to explore when the city is wider than the screen
  const onPointerDown = (e) => {
    if (e.pointerType !== 'mouse' || !scroller.current) return
    drag.current = { x: e.clientX, left: scroller.current.scrollLeft, moved: false }
  }
  const onPointerMove = (e) => {
    if (!drag.current) return
    const dx = e.clientX - drag.current.x
    if (Math.abs(dx) > 4) drag.current.moved = true
    scroller.current.scrollLeft = drag.current.left - dx
  }
  const endDrag = () => setTimeout(() => (drag.current = null), 0)

  return (
    <div
      ref={scroller}
      className="relative overflow-x-auto overscroll-x-contain [scrollbar-width:thin]"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerLeave={endDrag}
    >
      <div className="relative" style={{ minWidth }}>
        <svg
          viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}
          className="block h-auto w-full select-none"
          role="img"
          aria-label={`A city of ${projects.length} projects. Use the list view for a text version.`}
        >
          <defs>
            <radialGradient id="lampGlow">
              <stop offset="0" stopColor="var(--lamp)" stopOpacity="var(--glow-alpha)" />
              <stop offset="1" stopColor="var(--lamp)" stopOpacity="0" />
            </radialGradient>
          </defs>

          <polygon points={poly([0, sizeY, 0], [sizeX, sizeY, 0], [sizeX, sizeY, -0.7], [0, sizeY, -0.7])} fill="var(--slab-l)" />
          <polygon points={poly([sizeX, sizeY, 0], [sizeX, 0, 0], [sizeX, 0, -0.7], [sizeX, sizeY, -0.7])} fill="var(--slab-r)" />
          <polygon points={poly([0, 0, 0], [sizeX, 0, 0], [sizeX, sizeY, 0], [0, sizeY, 0])} fill="var(--slab-top)" />

          {empty.map((l, i) => <Patch key={i} x={l.x + 0.3} y={l.y + 0.3} w={LOT - 0.6} d={LOT - 0.6} fill="var(--grass)" />)}

          {Array.from({ length: rows }, (_, r) => {
            const y = r * STEP + BLOCK
            return (
              <g key={`rx${r}`}>
                <Patch x={0} y={y} w={sizeX} d={ROAD} fill="var(--road)" stroke="var(--curb)" />
                <LaneDashes from={[0.3, y + ROAD / 2, 0]} to={[sizeX - 0.3, y + ROAD / 2, 0]} />
              </g>
            )
          })}
          {Array.from({ length: cols }, (_, c) => {
            const x = c * STEP + BLOCK
            return (
              <g key={`ry${c}`}>
                <Patch x={x} y={0} w={ROAD} d={sizeY} fill="var(--road)" stroke="var(--curb)" />
                <LaneDashes from={[x + ROAD / 2, 0.3, 0]} to={[x + ROAD / 2, sizeY - 0.3, 0]} />
              </g>
            )
          })}

          {!reduce && (
            <>
              <Car from={[0.2, BLOCK + 0.95, 0]} to={[sizeX - 0.2, BLOCK + 0.95, 0]} color="var(--car-a)" dur={8 + sizeX * 0.5} />
              <Car from={[BLOCK + 0.45, sizeY - 0.2, 0]} to={[BLOCK + 0.45, 0.2, 0]} color="var(--car-b)" dur={7 + sizeY * 0.5} begin={-4} />
            </>
          )}

          {items.map((it) => {
            if (it.kind === 'l') return <Lamp key={`l${it.i}`} x={it.x} y={it.y} />
            if (it.kind === 't') return <Tree key={`t${it.i}`} x={it.x} y={it.y} size={it.s} />
            const { b, i } = it
            const p = b.project
            const dim = highlightOwner && p.ownerId !== highlightOwner
            return (
              <motion.g
                key={p.id}
                animate={{ opacity: dim ? 0.18 : 1 }}
                whileHover={interactive && !reduce ? { y: -4 } : undefined}
                transition={{ duration: 0.25 }}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                onClick={() => interactive && !drag.current?.moved && navigate(`/project/${p.id}`)}
                style={{ cursor: interactive ? 'pointer' : 'default' }}
              >
                <IsoBuilding
                  x={b.x} y={b.y} w={b.w} d={b.d}
                  solid={p.completedParts.length}
                  pending={p.pendingParts.length}
                  lit={litRatio(p, extraDays)}
                  status={p.status}
                  seed={i + 3}
                  delay={0.1 + i * 0.06}
                />
              </motion.g>
            )
          })}
        </svg>

        {tip && (
          <div
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-[calc(100%+14px)] on-night rounded-xl px-3.5 py-2.5 shadow-lg"
            style={tipPos}
          >
            <div className="font-display text-base font-semibold leading-tight whitespace-nowrap">{tip.project.name}</div>
            <div className="mt-0.5 text-[11px] uppercase tracking-[0.12em] text-white/60 whitespace-nowrap">
              {STATUS[tip.project.status].label} · {tip.project.completedParts.length} built
              {tip.project.pendingParts.length > 0 && ` · ${tip.project.pendingParts.length} to go`}
              {tip.project.inspection && ` · score ${tip.project.inspection.score}`}
            </div>
            {ownerName(tip.project.ownerId) && (
              <div className="mt-0.5 text-xs text-white/70 whitespace-nowrap">
                by {ownerName(tip.project.ownerId)} · paused: {REASONS[tip.project.reason]?.sign.toLowerCase()}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
