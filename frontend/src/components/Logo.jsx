// Small isometric block used as the wordmark icon.
export default function Logo({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <path d="M16 3 28 10 16 17 4 10Z" fill="var(--lilac)" stroke="var(--fg)" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M4 10 16 17v12L4 22Z" fill="var(--sky)" stroke="var(--fg)" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M28 10 16 17v12l12-7Z" fill="var(--pink)" stroke="var(--fg)" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M8 15.6l3.2 1.8v3.2L8 18.8z" fill="var(--light)" />
      <path d="M20.8 17.4l3.2-1.8v3.2l-3.2 1.8z" fill="var(--light)" />
    </svg>
  )
}
