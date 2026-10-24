import { createContext, useCallback, useContext, useEffect, useId, useMemo, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { GripVertical, MousePointerClick } from 'lucide-react'

// THE CANVAS PROTOCOL (Code Variant Surprise Challenge)
// Primary actions are never buttons. You drag a data card into an Action Zone.
//   <DragCard type="part" data={...}>   a card you can pick up
//   <DropZone accepts={['part']} onDrop={(data, type) => ...}>   where it does something
// Mouse and touch drag with Framer Motion. Keyboard: focus a card, Space to pick it up,
// Tab to a zone, Space or Enter to drop, Escape to cancel.

const CanvasContext = createContext(null)

export function CanvasProvider({ children }) {
  const zones = useRef(new Map())
  const [drag, setDrag] = useState(null) // { type, data, keyboard }
  const [over, setOver] = useState(null)

  const zoneAt = useCallback((x, y, type) => {
    for (const [id, z] of zones.current) {
      const r = z.ref.current?.getBoundingClientRect()
      if (r && x >= r.left && x <= r.right && y >= r.top && y <= r.bottom && z.accepts.includes(type)) return id
    }
    return null
  }, [])

  const drop = useCallback((id, card) => {
    const z = zones.current.get(id)
    setDrag(null)
    setOver(null)
    if (z && z.accepts.includes(card.type)) z.onDrop(card.data, card.type)
  }, [])

  const value = useMemo(() => ({ zones, drag, setDrag, over, setOver, zoneAt, drop }), [drag, over, zoneAt, drop])

  // Escape cancels a keyboard pick up
  useEffect(() => {
    if (!drag?.keyboard) return
    const onKey = (e) => e.key === 'Escape' && setDrag(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [drag])

  return <CanvasContext.Provider value={value}>{children}</CanvasContext.Provider>
}

export const useCanvas = () => useContext(CanvasContext)

export function DragCard({ type, data, children, className = '', disabled = false, label }) {
  const c = useCanvas()
  const picked = c.drag?.keyboard && c.drag.type === type && JSON.stringify(c.drag.data) === JSON.stringify(data)
  // use the pointer's viewport position straight from the event, so drops work on scrolled pages
  const clientPoint = (event, info) =>
    event && 'clientX' in event ? { x: event.clientX, y: event.clientY } : { x: info.point.x - window.scrollX, y: info.point.y - window.scrollY }

  return (
    <motion.div
      drag={!disabled}
      dragSnapToOrigin
      dragElastic={0.6}
      dragMomentum={false}
      whileDrag={{ scale: 1.05, rotate: -2, zIndex: 60, boxShadow: '0 24px 48px -12px rgba(0,0,0,0.35)' }}
      whileHover={disabled ? undefined : { y: -2 }}
      onDragStart={() => c.setDrag({ type, data })}
      onDrag={(event, info) => {
        const p = clientPoint(event, info)
        c.setOver(c.zoneAt(p.x, p.y, type))
      }}
      onDragEnd={(event, info) => {
        const p = clientPoint(event, info)
        const id = c.zoneAt(p.x, p.y, type)
        if (id) c.drop(id, { type, data })
        else { c.setDrag(null); c.setOver(null) }
      }}
      tabIndex={disabled ? -1 : 0}
      role="option"
      aria-grabbed={picked}
      aria-label={label ? `${label}. Press Space to pick up, then move to a drop zone.` : undefined}
      onKeyDown={(e) => {
        if (disabled) return
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault()
          c.setDrag(picked ? null : { type, data, keyboard: true })
        }
      }}
      style={{ touchAction: 'none' }}
      className={`relative select-none rounded-2xl border bg-card p-4 shadow-sm outline-none transition-colors ${disabled ? 'cursor-not-allowed opacity-40' : 'cursor-grab active:cursor-grabbing'} ${picked ? 'border-light ring-4 ring-light/40' : 'border-ink'} ${className}`}
    >
      <div className="flex items-start gap-3">
        {!disabled && <GripVertical size={16} className="mt-0.5 shrink-0 text-soft" aria-hidden />}
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </motion.div>
  )
}

export function DropZone({ accepts, onDrop, children, className = '', title, hint, tone = 'light' }) {
  const c = useCanvas()
  const id = useId()
  const ref = useRef(null)
  const live = useRef(onDrop)
  live.current = onDrop

  useEffect(() => {
    const zones = c.zones.current
    zones.set(id, { ref, accepts, onDrop: (...a) => live.current(...a) })
    return () => zones.delete(id)
  }, [c.zones, id, accepts.join()])

  const ready = c.drag && accepts.includes(c.drag.type)
  const hovering = c.over === id
  const keyboardReady = ready && c.drag.keyboard
  const dark = tone === 'dark'

  return (
    <div
      ref={ref}
      tabIndex={keyboardReady ? 0 : -1}
      role="region"
      aria-label={`${title ?? 'Action zone'}${keyboardReady ? '. Press Space or Enter to drop the card here.' : ''}`}
      onKeyDown={(e) => {
        if (keyboardReady && (e.key === ' ' || e.key === 'Enter')) {
          e.preventDefault()
          c.drop(id, c.drag)
        }
      }}
      className={`relative rounded-2xl border-2 border-dashed transition-all duration-200 ${
        hovering
          ? 'scale-[1.02] border-light bg-light/20'
          : ready
            ? `border-light ${dark ? 'bg-white/5' : 'bg-light/10'} animate-[zone-pulse_1.4s_ease-in-out_infinite]`
            : dark ? 'border-white/25' : 'border-soft'
      } ${className}`}
    >
      {children ?? (
        <div className="flex flex-col items-center justify-center gap-1 p-5 text-center">
          <p className="text-sm font-semibold">{hovering ? 'Let go to do it' : title}</p>
          {hint && <p className={`text-xs ${dark ? 'text-white/60' : 'text-muted'}`}>{hint}</p>}
        </div>
      )}
    </div>
  )
}

// A small strip that explains the interaction wherever actions happen.
export function CanvasHint({ children = 'Drag a card into a dashed zone to act. Keyboard: Space to pick up, Tab to a zone, Space to drop.', dark = false }) {
  return (
    <p className={`flex items-center gap-2 text-xs ${dark ? 'text-white/60' : 'text-muted'}`}>
      <MousePointerClick size={14} className="shrink-0" /> {children}
    </p>
  )
}
