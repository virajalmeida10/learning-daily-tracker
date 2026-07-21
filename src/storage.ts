import type { AppData, ExportData, Topic } from './types'
import { addDays, todayISO } from './date'
import { createInitialRevisionState } from './spacedRepetition'
import {
  HLD_PREREQUISITES,
  HLD_PREREQUISITES_TOPIC_NAME,
  JAVA_FOUNDATIONS,
  JAVA_FOUNDATIONS_TOPIC_NAME,
  LLD_PREREQUISITES,
  LLD_PREREQUISITES_TOPIC_NAME,
  prereqNotes,
  prereqSubtopicSeeds,
  type PrereqSection,
} from './prerequisiteContent'

const STORAGE_KEY = 'learning-tracker:data:v1'
const PREREQ_SEED_KEY = 'learning-tracker:seeded-prereqs:v1'
const JAVA_FOUNDATIONS_SEED_KEY = 'learning-tracker:seeded-java-foundations:v1'

export function newId(): string {
  return crypto.randomUUID()
}

function seedData(): AppData {
  const now = new Date().toISOString()
  const subjects = [
    { id: newId(), name: 'Java', createdAt: now },
    { id: newId(), name: 'Spring Boot', createdAt: now },
    { id: newId(), name: 'Data Structures & Algorithms', createdAt: now },
    { id: newId(), name: 'SWE Fundamentals', createdAt: now },
    { id: newId(), name: 'System Design', createdAt: now },
  ]
  return { version: 1, subjects, topics: [], dailyGoals: [] }
}

// One-time fixups for subjects seeded by earlier versions of this app, so
// existing users' data lines up with the current default subject set
// (Java/Spring Boot split apart, DSA renamed, System Design added) without
// losing any topics already logged against those subjects.
function migrateSeedSubjects(data: AppData): AppData {
  let subjects = data.subjects
  let changed = false
  const byName = (name: string) => subjects.find((s) => s.name.trim().toLowerCase() === name)

  const combined = byName('java / spring boot')
  if (combined) {
    changed = true
    subjects = subjects.map((s) => (s.id === combined.id ? { ...s, name: 'Java' } : s))
    if (!subjects.some((s) => s.name.trim().toLowerCase() === 'spring boot')) {
      subjects = [...subjects, { id: newId(), name: 'Spring Boot', createdAt: new Date().toISOString() }]
    }
  }

  const dsa = byName('java dsa')
  if (dsa) {
    changed = true
    subjects = subjects.map((s) => (s.id === dsa.id ? { ...s, name: 'Data Structures & Algorithms' } : s))
  }

  if (!subjects.some((s) => s.name.trim().toLowerCase() === 'system design')) {
    changed = true
    subjects = [...subjects, { id: newId(), name: 'System Design', createdAt: new Date().toISOString() }]
  }

  return changed ? { ...data, subjects } : data
}

// Older versions stored each topic's subtopics as plain strings with no
// completion state. Upgrade them in place to { id, text, completed } so
// existing topics work with the subtopic checklist.
function migrateSubtopics(data: AppData): AppData {
  let changed = false
  const topics = data.topics.map((t) => {
    const subtopics = t.subtopics as unknown[]
    if (subtopics.length > 0 && typeof subtopics[0] === 'string') {
      changed = true
      return { ...t, subtopics: (subtopics as string[]).map((text) => ({ id: newId(), text, completed: false })) }
    }
    return t
  })
  return changed ? { ...data, topics } : data
}

// A topic whose subtopics are the section headings and whose children are
// every item under each heading — all checkable, nothing left as static
// unmarkable text. Notes are left empty on purpose: the checklist itself
// is the content, so nothing is duplicated below it.
function makeChecklistTopic(subjectId: string, name: string, sections: PrereqSection[], tags: string[], dateLearned: string): Topic {
  const now = new Date().toISOString()
  return {
    id: newId(),
    subjectId,
    name,
    subtopics: prereqSubtopicSeeds(sections).map((s) => ({
      id: newId(),
      text: s.heading,
      completed: false,
      children: s.items.map((text) => ({ id: newId(), text, completed: false })),
    })),
    notes: '',
    dateLearned,
    difficulty: 3,
    tags,
    revision: createInitialRevisionState(dateLearned),
    createdAt: now,
    updatedAt: now,
  }
}

function findOrCreateSubject(subjects: AppData['subjects'], name: string) {
  const existing = subjects.find((s) => s.name.trim().toLowerCase() === name.toLowerCase())
  if (existing) return { subjects, subject: existing }
  const created = { id: newId(), name, createdAt: new Date().toISOString() }
  return { subjects: [...subjects, created], subject: created }
}

// One-time seed of "LLD Prerequisites" / "HLD Prerequisites" topics under
// System Design. Guarded by a separate localStorage flag (not by whether
// the topics currently exist) so that if the user later deletes either
// topic, it stays deleted rather than reappearing on the next load.
function seedPrerequisiteTopics(data: AppData): AppData {
  if (typeof localStorage === 'undefined' || localStorage.getItem(PREREQ_SEED_KEY)) return data
  localStorage.setItem(PREREQ_SEED_KEY, 'true')

  const { subjects, subject: systemDesign } = findOrCreateSubject(data.subjects, 'System Design')
  const dateLearned = todayISO()
  const newTopics = [
    makeChecklistTopic(systemDesign.id, LLD_PREREQUISITES_TOPIC_NAME, LLD_PREREQUISITES, ['prerequisites', 'lld'], dateLearned),
    makeChecklistTopic(systemDesign.id, HLD_PREREQUISITES_TOPIC_NAME, HLD_PREREQUISITES, ['prerequisites', 'hld'], dateLearned),
  ]

  return { ...data, subjects, topics: [...data.topics, ...newTopics] }
}

// One-time seed of the "Java foundations" topic, positioned to sort before
// the LLD/HLD prerequisites (one day earlier) in the System Design subject's
// chronological view. Own flag, independent of the prerequisites seed above,
// so it still runs for users who already had that one seeded before this
// topic existed.
function seedJavaFoundationsTopic(data: AppData): AppData {
  if (typeof localStorage === 'undefined' || localStorage.getItem(JAVA_FOUNDATIONS_SEED_KEY)) return data
  localStorage.setItem(JAVA_FOUNDATIONS_SEED_KEY, 'true')

  const { subjects, subject: systemDesign } = findOrCreateSubject(data.subjects, 'System Design')
  const dateLearned = addDays(todayISO(), -1)
  const topic = makeChecklistTopic(systemDesign.id, JAVA_FOUNDATIONS_TOPIC_NAME, JAVA_FOUNDATIONS, ['prerequisites', 'java'], dateLearned)

  return { ...data, subjects, topics: [...data.topics, topic] }
}

// Upgrades prerequisite topics seeded by an earlier version of this app:
// renames them to include the "Learn By Code Implementation" / "Mostly
// Conceptual" suffix, backfills checkable child items under each subtopic
// heading (a child's initial completed state mirrors whatever its parent
// subtopic was already marked as, so nothing looks like it regressed), and
// clears the notes field if it still holds the original auto-generated
// text (now redundant with the checklist) — but leaves notes alone if the
// user has since edited them.
function migratePrereqTopics(data: AppData): AppData {
  let changed = false
  const topics = data.topics.map((t) => {
    const name = t.name.trim()
    const kind =
      name === 'LLD Prerequisites' || name === LLD_PREREQUISITES_TOPIC_NAME
        ? 'lld'
        : name === 'HLD Prerequisites' || name === HLD_PREREQUISITES_TOPIC_NAME
          ? 'hld'
          : null
    if (!kind) return t
    const sections = kind === 'lld' ? LLD_PREREQUISITES : HLD_PREREQUISITES
    const targetName = kind === 'lld' ? LLD_PREREQUISITES_TOPIC_NAME : HLD_PREREQUISITES_TOPIC_NAME
    const seedByHeading = new Map(prereqSubtopicSeeds(sections).map((s) => [s.heading, s.items]))

    let subtopicsChanged = false
    const nextSubtopics = t.subtopics.map((sub) => {
      if (sub.children && sub.children.length > 0) return sub
      const items = seedByHeading.get(sub.text)
      if (!items) return sub
      subtopicsChanged = true
      return { ...sub, children: items.map((text) => ({ id: newId(), text, completed: sub.completed })) }
    })
    const notesChanged = t.notes !== '' && t.notes === prereqNotes(sections)
    const nameChanged = t.name !== targetName

    if (!nameChanged && !subtopicsChanged && !notesChanged) return t
    changed = true
    return { ...t, name: targetName, subtopics: subtopicsChanged ? nextSubtopics : t.subtopics, notes: notesChanged ? '' : t.notes }
  })
  return changed ? { ...data, topics } : data
}

export function migrateData(data: AppData): AppData {
  return seedJavaFoundationsTopic(seedPrerequisiteTopics(migratePrereqTopics(migrateSubtopics(migrateSeedSubjects(data)))))
}

export function loadData(): AppData {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    const seeded = migrateData(seedData())
    saveData(seeded)
    return seeded
  }
  try {
    const parsed = JSON.parse(raw) as AppData
    if (!parsed.subjects || !parsed.topics || !parsed.dailyGoals) throw new Error('malformed data')
    const migrated = migrateData(parsed)
    if (migrated !== parsed) saveData(migrated)
    return migrated
  } catch {
    const seeded = migrateData(seedData())
    saveData(seeded)
    return seeded
  }
}

export function saveData(data: AppData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function exportData(data: AppData): ExportData {
  return { ...data, exportedAt: new Date().toISOString() }
}

export function downloadExport(data: AppData): void {
  const payload = exportData(data)
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `learning-tracker-backup-${todayISO()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function parseImport(json: string): AppData {
  const parsed = JSON.parse(json)
  if (!Array.isArray(parsed?.subjects) || !Array.isArray(parsed?.topics) || !Array.isArray(parsed?.dailyGoals)) {
    throw new Error('This file does not look like a Learning Tracker backup.')
  }
  return {
    version: 1,
    subjects: parsed.subjects,
    topics: parsed.topics,
    dailyGoals: parsed.dailyGoals,
  }
}
