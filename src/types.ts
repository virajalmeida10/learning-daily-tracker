export interface Subject {
  id: string
  name: string
  createdAt: string
}

export type RevisionOutcome = 'completed' | 'struggled'

export interface RevisionHistoryEntry {
  date: string // YYYY-MM-DD, date the review actually happened
  outcome: RevisionOutcome
  stageBefore: number
}

export interface RevisionState {
  stage: number // index into REVISION_INTERVALS_DAYS, the interval currently pending
  dueDate: string // YYYY-MM-DD, next revision due date
  reviewCount: number
  graduated: boolean // true once the final interval has been cleared at least once
  history: RevisionHistoryEntry[]
}

export interface SubtopicChild {
  id: string
  text: string
  completed: boolean
}

export interface Subtopic {
  id: string
  text: string
  completed: boolean
  // Optional finer-grained checklist items under this subtopic. When
  // present, toggling the subtopic cascades to all children, and toggling
  // a child recomputes the subtopic's own completed state from whether
  // every child is done.
  children?: SubtopicChild[]
}

export interface Topic {
  id: string
  subjectId: string
  name: string
  subtopics: Subtopic[]
  notes: string // markdown, may contain fenced code blocks
  dateLearned: string // YYYY-MM-DD
  difficulty: 1 | 2 | 3 | 4 | 5
  tags: string[]
  revision: RevisionState
  createdAt: string
  updatedAt: string
}

export interface DailyGoal {
  id: string
  date: string // YYYY-MM-DD
  subjectId?: string
  category?: string // e.g. "High-Level Design (HLD)" or "Linked Lists", when the subject has sub-categories
  text: string // the specific topic the user typed
  completed: boolean
  createdAt: string
}

export interface AppData {
  version: 1
  subjects: Subject[]
  topics: Topic[]
  dailyGoals: DailyGoal[]
}

export interface ExportData extends AppData {
  exportedAt: string
}

export type DueStatus = 'overdue' | 'due' | 'upcoming'

export type DayGoalStatus = 'complete' | 'partial' | 'incomplete' | 'none'
