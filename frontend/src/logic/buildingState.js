// Statuses and their visuals live in one map, so a new status means one entry here.
export const STATUS = {
  paused:    { label: 'Paused',    lights: 'byDate', crane: false, flag: false, stone: false, scaffold: true },
  inspected: { label: 'Inspected', lights: 'byDate', crane: false, flag: false, stone: false, scaffold: true },
  reviving:  { label: 'Reviving',  lights: 'all',    crane: true,  flag: false, stone: false, scaffold: true },
  rebuilt:   { label: 'Rebuilt',   lights: 'all',    crane: false, flag: true,  stone: false, scaffold: false },
  landmark:  { label: 'Landmark',  lights: 'none',   crane: false, flag: false, stone: true,  scaffold: false },
}

export const REASONS = {
  time:       { label: 'Ran out of time or priorities changed', sign: 'TIME' },
  event:      { label: 'The event ended',                       sign: 'EVENT ENDED' },
  scope:      { label: 'Scope grew too large',                  sign: 'SCOPE' },
  technical:  { label: 'Got stuck technically',                 sign: 'STUCK' },
  motivation: { label: 'Lost motivation',                       sign: 'MOTIVATION' },
  weakIdea:   { label: 'The idea felt weak',                    sign: 'IDEA' },
}

export const daysSince = (iso) => Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86400000))

// Share of windows that are lit (0 to 1).
// extraDays lets the time dial preview the future: what if nobody touches it for a while?
export function litRatio(project, extraDays = 0) {
  const mode = (STATUS[project.status] ?? STATUS.paused).lights
  if (mode === 'all') return 1
  if (mode === 'none') return 0
  const d = daysSince(project.lastTouchedOn) + extraDays
  if (d < 30) return 0.85
  if (d <= 180) return 0.5
  return 0
}
