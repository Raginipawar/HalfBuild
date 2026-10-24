// A tiny building: two solid floors and one scaffolding floor.
export default function Logo({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect x="7" y="3" width="18" height="8" fill="none" stroke="var(--color-soft)" strokeWidth="1.5" strokeDasharray="2.5 2" />
      <rect x="7" y="12" width="18" height="17" fill="var(--color-ink)" />
      <rect x="10" y="15" width="4" height="4" fill="var(--color-light)" />
      <rect x="18" y="15" width="4" height="4" fill="#fff" />
      <rect x="10" y="22" width="4" height="4" fill="#fff" />
      <rect x="18" y="22" width="4" height="4" fill="var(--color-light)" />
    </svg>
  )
}
