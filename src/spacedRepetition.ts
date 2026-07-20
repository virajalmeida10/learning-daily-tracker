import type { DueStatus, RevisionState } from './types'
import { addDays, compareISO, todayISO } from './date'

// The interval a topic waits at after clearing stage index i.
// Index 0 is the interval counted from the date a topic was learned.
export const REVISION_INTERVALS_DAYS = [1, 3, 7, 14, 30] as const
const LAST_STAGE = REVISION_INTERVALS_DAYS.length - 1

export function createInitialRevisionState(dateLearned: string): RevisionState {
  return {
    stage: 0,
    dueDate: addDays(dateLearned, REVISION_INTERVALS_DAYS[0]),
    reviewCount: 0,
    graduated: false,
    history: [],
  }
}

export function getDueStatus(dueDate: string, today: string = todayISO()): DueStatus {
  const cmp = compareISO(dueDate, today)
  if (cmp < 0) return 'overdue'
  if (cmp === 0) return 'due'
  return 'upcoming'
}

export function isDueOrOverdue(state: RevisionState, today: string = todayISO()): boolean {
  return getDueStatus(state.dueDate, today) !== 'upcoming'
}

export function daysOverdue(dueDate: string, today: string = todayISO()): number {
  const ms = +new Date(today) - +new Date(dueDate)
  return Math.max(0, Math.round(ms / 86_400_000))
}

// Marking a revision "complete" advances the topic to the next interval.
// The next due date is always counted from the day the review actually
// happened (not the original due date), so a late-but-completed review
// doesn't compound the lateness into every future interval.
//
// Once the final interval (30 days) has been cleared, the topic
// "graduates": it keeps repeating at the 30-day cadence indefinitely
// rather than being dropped from revision entirely, since long-term
// retention still benefits from occasional spaced check-ins.
export function applyCompleted(state: RevisionState, today: string = todayISO()): RevisionState {
  const stageBefore = state.stage
  const nextStage = stageBefore < LAST_STAGE ? stageBefore + 1 : LAST_STAGE
  return {
    stage: nextStage,
    dueDate: addDays(today, REVISION_INTERVALS_DAYS[nextStage]),
    reviewCount: state.reviewCount + 1,
    graduated: state.graduated || stageBefore === LAST_STAGE,
    history: [...state.history, { date: today, outcome: 'completed', stageBefore }],
  }
}

// Marking a revision "struggled" resets the topic to the shortest
// interval so it comes back around quickly, and un-graduates it since
// a struggle means it's no longer reliably retained.
export function applyStruggled(state: RevisionState, today: string = todayISO()): RevisionState {
  const stageBefore = state.stage
  return {
    stage: 0,
    dueDate: addDays(today, REVISION_INTERVALS_DAYS[0]),
    reviewCount: state.reviewCount + 1,
    graduated: false,
    history: [...state.history, { date: today, outcome: 'struggled', stageBefore }],
  }
}

export function intervalLabel(state: RevisionState): string {
  const days = REVISION_INTERVALS_DAYS[state.stage]
  if (state.graduated && state.stage === LAST_STAGE) return `Mastered · every ${days}d`
  return `${days}d interval`
}
