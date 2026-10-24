// Revival Score: pure functions, no React.
// Questions, points, paths and first steps all live in CONFIG,
// so a changed requirement means editing this one object.

import { REASONS, daysSince } from './buildingState'

export const CONFIG = {
  questions: [
    {
      id: 'completion', type: 'slider', max: 25,
      label: 'How much of the project is done?',
      help: 'We filled this in from your finished and unfinished parts. Move it if it feels off.',
      points: (v) => Math.round((v / 100) * 25),
    },
    {
      id: 'reason', type: 'choice', max: 20,
      label: 'Why did it stop?',
      help: 'Projects that stopped for outside reasons are easier to bring back.',
      options: [
        { value: 'event', label: REASONS.event.label, points: 20 },
        { value: 'time', label: REASONS.time.label, points: 18 },
        { value: 'scope', label: REASONS.scope.label, points: 14 },
        { value: 'technical', label: REASONS.technical.label, points: 12 },
        { value: 'motivation', label: REASONS.motivation.label, points: 8 },
        { value: 'weakIdea', label: REASONS.weakIdea.label, points: 4 },
      ],
    },
    {
      id: 'interest', type: 'scale', max: 30,
      label: 'Do you still care about this idea?',
      help: '1 means not really, 5 means you think about it often.',
      options: [
        { value: 1, label: 'Not really', points: 0 },
        { value: 2, label: 'A little', points: 10 },
        { value: 3, label: 'Somewhat', points: 18 },
        { value: 4, label: 'Quite a lot', points: 26 },
        { value: 5, label: 'Very much', points: 30 },
      ],
    },
    {
      id: 'relevance', type: 'choice', max: 15,
      label: 'Is the problem it solves still relevant?',
      help: 'Does someone, maybe you, still have this problem today?',
      options: [
        { value: 'yes', label: 'Yes', points: 15 },
        { value: 'somewhat', label: 'Somewhat', points: 8 },
        { value: 'no', label: 'No', points: 0 },
      ],
    },
    {
      id: 'effort', type: 'choice', max: 10,
      label: 'How much effort is left?',
      help: 'A rough guess is enough.',
      options: [
        { value: 'week', label: 'Under a week', points: 10 },
        { value: 'weeks', label: 'A few weeks', points: 5 },
        { value: 'months', label: 'Months', points: 2 },
      ],
    },
    {
      id: 'reusable', type: 'choice', max: 0,
      label: 'Are any parts reusable elsewhere?',
      help: 'A component, a design, a data set. This does not change the score, it helps pick the path.',
      options: [
        { value: 'yes', label: 'Yes', points: 0 },
        { value: 'no', label: 'No', points: 0 },
      ],
    },
  ],

  // checked in order, first match wins
  pathRules: [
    { path: 'changeIdea', test: (a) => a.interest >= 3 && (a.reason === 'weakIdea' || a.relevance === 'no') },
    { path: 'continue', test: (a) => a.interest >= 4 && a.completion >= 50 },
    { path: 'restart', test: (a, ctx) => a.interest >= 3 && (a.completion < 50 || ctx.idleDays > 365) },
    { path: 'repurpose', test: (a) => a.reusable === 'yes' },
    { path: 'archive', test: () => true },
  ],

  paths: {
    continue: {
      label: 'Continue',
      blurb: 'Good progress and you still care. Pick up where you left off.',
      example: 'A habit tracker that is 60 percent done and stopped for exams.',
      firstStep: (p) => `Spend about 2 hours finishing: ${p.pendingParts[0] ?? 'the next unfinished part'}.`,
    },
    restart: {
      label: 'Restart',
      blurb: 'The idea still matters, but the old work is too thin or too old. Start a smaller version.',
      example: 'A budgeting app with one screen built, last touched a year ago.',
      firstStep: () => 'Spend about 2 hours writing a smaller version 1 plan with only 3 parts.',
    },
    changeIdea: {
      label: 'Change the idea',
      blurb: 'You still want to build, but the original idea felt weak. Point the work at a new problem.',
      example: 'A quiz game nobody asked for becomes a revision tool for your class.',
      firstStep: () => 'Spend about 2 hours writing one new problem this project could solve.',
    },
    repurpose: {
      label: 'Repurpose',
      blurb: 'The project may not come back, but some parts deserve a new home.',
      example: 'The login flow from an old side project moves into your portfolio.',
      firstStep: (p) => `Spend about 2 hours moving ${p.completedParts[0] ?? 'a finished part'} into a new or existing project.`,
    },
    archive: {
      label: 'Archive',
      blurb: 'Lay it to rest with what you learned. It becomes a landmark in your city.',
      example: 'A weekend experiment that taught you a new framework.',
      firstStep: () => 'Write three lessons you learned, then lay it to rest as a landmark.',
    },
  },
}

export const PATH_ORDER = ['continue', 'restart', 'changeIdea', 'repurpose', 'archive']

export const completionOf = (p) => {
  const total = p.completedParts.length + p.pendingParts.length
  return total ? Math.round((p.completedParts.length / total) * 100) : 0
}

export function defaultAnswers(project) {
  return {
    completion: completionOf(project),
    reason: project.reason ?? 'time',
    interest: 3,
    relevance: 'somewhat',
    effort: 'weeks',
    reusable: 'no',
  }
}

const q = (id) => CONFIG.questions.find((x) => x.id === id)

export function scoreAnswers(a) {
  const breakdown = CONFIG.questions
    .filter((x) => x.max > 0)
    .map((x) => {
      const points = x.type === 'slider' ? x.points(a[x.id]) : x.options.find((o) => o.value === a[x.id])?.points ?? 0
      return { id: x.id, label: x.label, points, max: x.max }
    })
  return { score: breakdown.reduce((s, b) => s + b.points, 0), breakdown }
}

export function recommendPath(a, project) {
  const ctx = { idleDays: project ? daysSince(project.lastTouchedOn) : 0 }
  return CONFIG.pathRules.find((r) => r.test(a, ctx)).path
}

const WHY = {
  time: 'of time',
  event: 'the event ended',
  scope: 'the scope grew too large',
  technical: 'you got stuck technically',
  motivation: 'you lost motivation',
  weakIdea: 'the idea felt weak',
}

export function buildReasons(a) {
  const out = [`You finished ${a.completion} percent of it.`]
  if (['time', 'event', 'scope'].includes(a.reason)) out.push(`It stopped because ${WHY[a.reason]}, not because the idea was bad.`)
  else if (a.reason === 'weakIdea') out.push('It stopped because the idea felt weak, so the idea is what needs work.')
  else out.push(`It stopped because ${WHY[a.reason]}, which is common and fixable.`)
  if (a.interest >= 4) out.push('You still care about it.')
  else if (a.interest <= 2) out.push('Your interest has faded, and that is okay.')
  else if (a.relevance === 'no') out.push('The problem it solves matters less today.')
  return out.slice(0, 3)
}

// Full result saved on the project after an inspection.
export function inspect(a, project) {
  const { score, breakdown } = scoreAnswers(a)
  const path = recommendPath(a, project)
  return {
    answers: a,
    score,
    breakdown,
    path,
    reasons: buildReasons(a),
    firstStep: CONFIG.paths[path].firstStep(project),
  }
}

export const optionLabel = (id, value) => q(id)?.options?.find((o) => o.value === value)?.label ?? value
