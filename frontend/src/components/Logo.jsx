// HALFBUILT mark: an H made of two towers. The left tower is finished and lit,
// the right one is still half scaffolding. The crossbar is a row of windows.
export default function Logo({ size = 26, dark = false }) {
  const ink = dark ? '#f7f7f3' : 'var(--color-ink)'
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect x="4" y="4" width="8" height="25" rx="1.5" fill={ink} />
      <rect x="20" y="17" width="8" height="12" rx="1.5" fill={ink} />
      <rect x="20.75" y="4.75" width="6.5" height="10.5" rx="1" fill="none" stroke={ink} strokeWidth="1.5" strokeDasharray="2.2 1.8" />
      <rect x="12" y="15" width="8" height="3" fill={ink} />
      <rect x="6.5" y="8" width="3" height="3" rx="0.5" fill="#F5B942" />
      <rect x="6.5" y="20" width="3" height="3" rx="0.5" fill="#F5B942" />
      <rect x="22.5" y="21" width="3" height="3" rx="0.5" fill="#F5B942" />
    </svg>
  )
}
