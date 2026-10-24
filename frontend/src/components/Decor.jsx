// Decorative language from our slides: pixel squares, half circles, pill headings.

export function PixelSquares({ className = '', flip = false }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={`h-10 w-10 ${flip ? 'rotate-180' : ''} ${className}`}
      aria-hidden="true"
    >
      <rect x="22" y="0" width="14" height="14" fill="var(--color-ink)" />
      <rect x="11" y="13" width="12" height="12" fill="var(--color-grey)" />
      <rect x="0" y="24" width="12" height="12" fill="var(--color-beige)" />
    </svg>
  )
}

export function HalfCircle({ className = '', side = 'bottom' }) {
  const d = side === 'bottom' ? 'M0 0h100a50 50 0 0 1-100 0z' : 'M0 50a50 50 0 0 1 100 0z'
  return (
    <svg viewBox="0 0 100 50" className={className} aria-hidden="true">
      <path d={d} fill="var(--color-grey)" />
    </svg>
  )
}

// Grey pill heading with bold serif caps, slightly tilted like the deck
export function PillHeading({ children, number, note, className = '' }) {
  return (
    <div className={`flex flex-wrap items-center gap-x-5 gap-y-2 ${className}`}>
      <h2 className="inline-block -rotate-1 rounded-full bg-grey px-6 py-2 font-serif text-[clamp(1.6rem,3vw,2.4rem)] uppercase leading-none tracking-tight">
        {children}
      </h2>
      {(number || note) && (
        <span className="eyebrow">
          {number && <span className="mr-3">{number}</span>}
          {note}
        </span>
      )}
    </div>
  )
}
