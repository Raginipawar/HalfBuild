// Revival Leaderboard: ranks builders by what they bring back, not what they start.
// Points = revived x 10 + floors added after revival x 2 + landmarks x 3

export const POINTS = { revived: 10, floor: 2, landmark: 3 }

export function rankBuilders({ users, events }, { thisMonth = false } = {}) {
  const now = new Date()
  const inPeriod = (e) => {
    if (!thisMonth) return true
    const d = new Date(e.date)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }

  // first revival date per project, so only floors after it count
  const revivedAt = {}
  for (const e of events) {
    if (e.type === 'revived' && (!revivedAt[e.projectId] || e.date < revivedAt[e.projectId])) revivedAt[e.projectId] = e.date
  }

  const rows = users.map((u) => {
    const mine = events.filter((e) => e.userId === u.id && inPeriod(e))
    const revived = new Set(mine.filter((e) => e.type === 'revived').map((e) => e.projectId)).size
    const floors = mine.filter((e) => e.type === 'floorAdded' && revivedAt[e.projectId] && e.date >= revivedAt[e.projectId]).length
    const landmarks = mine.filter((e) => e.type === 'archived').length
    return { user: u, revived, floors, landmarks, points: revived * POINTS.revived + floors * POINTS.floor + landmarks * POINTS.landmark }
  })

  return rows
    .sort((a, b) => b.points - a.points || b.revived - a.revived)
    .map((r, i) => ({ ...r, rank: i + 1 }))
}
