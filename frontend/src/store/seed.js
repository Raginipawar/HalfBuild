// Demo data so the city never looks empty. Dates are relative to "now"
// so window lighting (days since lastTouchedOn) always looks right.
// Every demo account uses the password "demo1234".

const DEMO_HASH = '0ead2060b65992dca4769af601a1b3a35ef38cfad2c2c465bb160ea764157c5d'
const DAY = 86400000

// small seeded random so every reset gives the same city
function rng(seed) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const daysAgo = (n) => new Date(Date.now() - n * DAY).toISOString()

const USERS = [
  ['u1', 'Demo Builder', 'demo', 'demo@halfbuilt.app', ['React', 'UI design'], 200],
  ['u2', 'Aarav Mehta', 'aarav', 'aarav@halfbuilt.app', ['Node', 'Postgres', 'APIs'], 320],
  ['u3', 'Meera Iyer', 'meera', 'meera@halfbuilt.app', ['Python', 'ML', 'Data viz'], 290],
  ['u4', 'Kabir Singh', 'kabir', 'kabir@halfbuilt.app', ['Flutter', 'Firebase'], 260],
  ['u5', 'Zoya Khan', 'zoya', 'zoya@halfbuilt.app', ['Figma', 'Illustration', 'CSS'], 240],
  ['u6', 'Rohan Das', 'rohan', 'rohan@halfbuilt.app', ['Go', 'DevOps', 'Docker'], 210],
]

// [owner, name, description, goal, completed, pending, reason, tools, status, touchedDaysAgo, startedDaysAgo, skillsNeeded]
const PROJECTS = [
  ['u1', 'Habit Tracker', 'A tiny app to track daily habits with streaks.', 'A calm habit app I actually use every morning.',
    ['Habit list', 'Daily check in', 'Streak counter'], ['Reminders', 'Weekly insights'], 'time', ['React', 'Zustand'], 'paused', 64, 150, ['UI design']],
  ['u1', 'Pixel Portfolio', 'A retro pixel art portfolio site.', 'A portfolio that feels like a game menu.',
    ['Landing screen', 'Project grid', 'Pixel font', 'Sound effects'], ['Contact form'], 'event', ['HTML', 'CSS'], 'reviving', 3, 170, []],
  ['u1', 'Recipe Remix', 'Swap ingredients in any recipe.', 'Paste a recipe, get a version with what is in your fridge.',
    ['Recipe parser', 'Ingredient list'], ['Swap engine', 'Saved remixes', 'Share link'], 'scope', ['React', 'Node'], 'paused', 210, 260, ['Node', 'APIs']],
  ['u1', 'Weather Haiku', 'Daily weather written as a haiku.', 'A morning haiku about the sky outside.',
    ['Weather fetch', 'Haiku templates', 'Daily card'], [], 'weakIdea', ['JavaScript'], 'landmark', 120, 200, []],

  ['u2', 'Campus Lost and Found', 'Post and claim lost items on campus.', 'Every lost ID card finds its way home.',
    ['Post item', 'Item feed', 'Photo upload', 'Claim flow'], ['Chat', 'Admin view'], 'event', ['Node', 'Postgres'], 'reviving', 2, 240, ['React', 'UI design']],
  ['u2', 'Rent Split', 'Split rent and bills with flatmates.', 'No more spreadsheet arguments.',
    ['Group setup', 'Expense entry', 'Balances', 'Settle up', 'History'], [], 'time', ['Node', 'React'], 'rebuilt', 12, 300, []],
  ['u2', 'Gig Ledger', 'Income tracker for freelancers.', 'One place for every invoice.',
    ['Invoice list'], ['Client book', 'Tax summary', 'Export'], 'motivation', ['Node'], 'paused', 190, 230, []],
  ['u2', 'Metro Mate', 'Live metro times and crowd levels.', 'Know if the next train is packed.',
    ['Station list', 'Timetable'], ['Crowd reports', 'Alerts'], 'technical', ['APIs'], 'paused', 95, 180, ['Python', 'Data viz']],

  ['u3', 'Study Buddy Bot', 'A chat bot that quizzes you from your notes.', 'Upload notes, get a friendly quiz partner.',
    ['Note upload', 'Question maker', 'Chat UI'], ['Spaced repetition', 'Progress view'], 'technical', ['Python', 'ML'], 'paused', 40, 160, ['React', 'Node']],
  ['u3', 'Plant Pal', 'Identify plants and get care tips.', 'Never kill a succulent again.',
    ['Camera capture', 'Plant model', 'Care cards', 'Water log'], ['Reminders'], 'time', ['Python', 'Flutter'], 'reviving', 5, 210, []],
  ['u3', 'Notes Graph', 'See your notes as a connected graph.', 'A second brain I can actually look at.',
    ['Markdown import', 'Link parser', 'Graph view', 'Search', 'Tags', 'Themes'], [], 'scope', ['D3', 'Python'], 'rebuilt', 20, 280, []],

  ['u4', 'Budget Bee', 'A playful budgeting app for students.', 'Budgeting that feels like a game.',
    ['Wallet setup', 'Spend log', 'Categories'], ['Goals', 'Badges', 'Bank sync'], 'scope', ['Flutter', 'Firebase'], 'paused', 140, 220, ['UI design', 'Illustration']],
  ['u4', 'Trail Notes', 'Offline hiking journal with maps.', 'A diary that works with no signal.',
    ['Offline maps', 'Trail log', 'Photo pins'], ['Elevation chart', 'Share trip'], 'motivation', ['Flutter'], 'reviving', 1, 190, []],
  ['u4', 'Chai Stall POS', 'A billing app for small tea stalls.', 'Help a stall owner close the day in one tap.',
    ['Menu setup', 'Quick bill', 'Day total', 'UPI QR'], [], 'event', ['Flutter', 'Firebase'], 'rebuilt', 30, 250, []],
  ['u4', 'Quiz Quest', 'Multiplayer trivia for friends.', 'Game night on everyone\'s phone.',
    ['Lobby'], ['Question bank', 'Live scoring', 'Rooms'], 'weakIdea', ['Firebase'], 'paused', 260, 300, []],

  ['u5', 'Sketch Journal', 'A daily drawing prompt journal.', 'Thirty days of tiny drawings.',
    ['Prompt feed', 'Canvas', 'Gallery'], ['Brush packs', 'Community wall'], 'motivation', ['Canvas', 'CSS'], 'paused', 75, 200, ['Node', 'APIs']],
  ['u5', 'Doodle Duel', 'Draw and guess with a friend.', 'A cosy drawing game for two.',
    ['Canvas sync', 'Word list', 'Rounds', 'Score screen'], ['Sound'], 'time', ['Figma', 'JavaScript'], 'reviving', 4, 180, []],
  ['u5', 'Bookshelf Swap', 'Swap books with neighbours.', 'A street library on your phone.',
    ['Book listing', 'Map view'], ['Swap requests', 'Ratings'], 'event', ['Figma', 'React'], 'paused', 150, 210, ['Node', 'Postgres']],

  ['u6', 'Code Kata Club', 'Weekly coding challenges with friends.', 'A tiny club that codes every Sunday.',
    ['Challenge feed', 'Submissions', 'Runner'], ['Leaderboard', 'Discussions'], 'time', ['Go', 'Docker'], 'paused', 50, 170, ['React', 'UI design']],
  ['u6', 'Lofi Timer', 'Pomodoro timer with lofi music.', 'Focus sessions that feel like a cafe.',
    ['Timer', 'Music player', 'Themes', 'Stats'], [], 'event', ['Go', 'JavaScript'], 'rebuilt', 8, 200, []],
  ['u6', 'Server Garden', 'Watch your servers grow like plants.', 'Monitoring that does not feel scary.',
    ['Agent', 'Metrics API'], ['Garden view', 'Alerts', 'Mobile'], 'scope', ['Go', 'DevOps'], 'paused', 230, 280, []],
]

export function makeSeed() {
  const rand = rng(24)
  const users = USERS.map(([id, name, username, email, skills, joined]) => ({
    id, name, username, email, passwordHash: DEMO_HASH, skills, joinedOn: daysAgo(joined),
  }))

  const events = []
  let ev = 0
  const log = (userId, projectId, type, date, detail = '') =>
    events.push({ id: `e${++ev}`, userId, projectId, type, date, detail })

  const projects = PROJECTS.map((p, i) => {
    const [ownerId, name, description, goal, completedParts, pendingParts, reason, tools, status, touched, started, skillsNeeded] = p
    const id = `p${i + 1}`
    log(ownerId, id, 'created', daysAgo(started), name)

    if (status === 'reviving' || status === 'rebuilt') {
      const revivedAt = Math.min(started - 10, touched + 25 + Math.floor(rand() * 40))
      log(ownerId, id, 'inspected', daysAgo(revivedAt + 1), 'Site Inspection')
      log(ownerId, id, 'revived', daysAgo(revivedAt), 'Path: continue')
      const floors = Math.max(1, Math.floor(completedParts.length / 2))
      for (let f = 0; f < floors; f++) {
        const d = touched + Math.floor(rand() * Math.max(1, revivedAt - touched))
        log(ownerId, id, 'floorAdded', daysAgo(d), completedParts[completedParts.length - 1 - f])
      }
      if (status === 'rebuilt') log(ownerId, id, 'rebuilt', daysAgo(touched), 'All floors built')
    }
    if (status === 'landmark') {
      log(ownerId, id, 'inspected', daysAgo(touched + 2), 'Site Inspection')
      log(ownerId, id, 'archived', daysAgo(touched), 'Laid to rest as a landmark')
    }

    return {
      id, ownerId, name, description, goal,
      completedParts: [...completedParts],
      pendingParts: [...pendingParts],
      reason, tools,
      links: { repo: '', demo: '' },
      startedOn: daysAgo(started),
      lastTouchedOn: daysAgo(touched),
      status,
      inspection: null,
      chosenPath: status === 'reviving' || status === 'rebuilt' ? 'continue' : status === 'landmark' ? 'archive' : null,
      lessons: status === 'landmark'
        ? 'Small ideas still teach big lessons. I learned to ship a first version in a weekend. Next time I will test the idea with friends first.'
        : '',
      openForCollab: skillsNeeded.length > 0,
      skillsNeeded,
      joinRequests: [],
      coBuilders: [],
    }
  })

  // Background activity so grids and leaderboards look alive (~200 events total).
  const kinds = ['floorAdded', 'floorAdded', 'inspected', 'updated']
  while (events.length < 200) {
    const p = projects[Math.floor(rand() * projects.length)]
    const type = kinds[Math.floor(rand() * kinds.length)]
    // floors only get added to projects that are being revived
    if (type === 'floorAdded' && !['reviving', 'rebuilt'].includes(p.status)) continue
    const day = Math.floor(rand() * 180)
    log(p.ownerId, p.id, type, daysAgo(day), type === 'floorAdded' ? p.completedParts[0] : '')
  }
  events.sort((a, b) => b.date.localeCompare(a.date))

  // one open join request so the owner flow can be shown
  projects[0].joinRequests.push({ userId: 'u5', message: 'I would love to design the weekly insights screen.', status: 'pending', date: daysAgo(2) })

  return { users, projects, events, currentUserId: null }
}
