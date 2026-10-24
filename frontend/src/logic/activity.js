// Activity grid: last 26 weeks, 7 rows (Sun to Sat), like GitHub.

const DAY = 86400000
const key = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

export const LEVELS = [0, 1, 2, 4, 6] // 0, 1, 2 to 3, 4 to 5, 6 or more
const levelOf = (n) => LEVELS.reduce((lvl, min, i) => (n >= min ? i : lvl), 0)

export function activityGrid(events, userId, weeks = 26) {
  const counts = {}
  for (const e of events) {
    if (e.userId !== userId) continue
    const k = key(new Date(e.date))
    counts[k] = (counts[k] ?? 0) + 1
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const start = new Date(today.getTime() - (today.getDay() + (weeks - 1) * 7) * DAY)

  const columns = []
  let total = 0
  for (let w = 0; w < weeks; w++) {
    const col = []
    for (let d = 0; d < 7; d++) {
      const date = new Date(start.getTime() + (w * 7 + d) * DAY)
      if (date > today) { col.push(null); continue }
      const count = counts[key(date)] ?? 0
      total += count
      col.push({ date, count, level: levelOf(count) })
    }
    columns.push(col)
  }

  // current streak: consecutive active days ending today or yesterday
  let streak = 0
  let day = new Date(today)
  if (!counts[key(day)]) day = new Date(day.getTime() - DAY)
  while (counts[key(day)]) {
    streak++
    day = new Date(day.getTime() - DAY)
  }

  return { columns, total, streak }
}

export const formatDay = (d) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
