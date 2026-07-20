import type { AppData, ExportData, Topic } from './types'
import { todayISO } from './date'
import { createInitialRevisionState } from './spacedRepetition'
import { HLD_PREREQUISITES, LLD_PREREQUISITES, prereqNotes, prereqSubtopicTexts } from './prerequisiteContent'

const STORAGE_KEY = 'learning-tracker:data:v1'
const PREREQ_SEED_KEY = 'learning-tracker:seeded-prereqs:v1'

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

function makePrereqTopic(subjectId: string, name: string, tags: string[]): Topic {
  const sections = name === 'LLD Prerequisites' ? LLD_PREREQUISITES : HLD_PREREQUISITES
  const now = new Date().toISOString()
  const dateLearned = todayISO()
  return {
    id: newId(),
    subjectId,
    name,
    subtopics: prereqSubtopicTexts(sections).map((text) => ({ id: newId(), text, completed: false })),
    notes: prereqNotes(sections),
    dateLearned,
    difficulty: 3,
    tags,
    revision: createInitialRevisionState(dateLearned),
    createdAt: now,
    updatedAt: now,
  }
}

// One-time seed of "LLD Prerequisites" / "HLD Prerequisites" topics under
// System Design. Guarded by a separate localStorage flag (not by whether
// the topics currently exist) so that if the user later deletes either
// topic, it stays deleted rather than reappearing on the next load.
function seedPrerequisiteTopics(data: AppData): AppData {
  if (typeof localStorage === 'undefined' || localStorage.getItem(PREREQ_SEED_KEY)) return data
  localStorage.setItem(PREREQ_SEED_KEY, 'true')

  let subjects = data.subjects
  let systemDesign = subjects.find((s) => s.name.trim().toLowerCase() === 'system design')
  if (!systemDesign) {
    systemDesign = { id: newId(), name: 'System Design', createdAt: new Date().toISOString() }
    subjects = [...subjects, systemDesign]
  }

  const newTopics = [
    makePrereqTopic(systemDesign.id, 'LLD Prerequisites', ['prerequisites', 'lld']),
    makePrereqTopic(systemDesign.id, 'HLD Prerequisites', ['prerequisites', 'hld']),
  ]

  return { ...data, subjects, topics: [...data.topics, ...newTopics] }
}

export function migrateData(data: AppData): AppData {
  return seedPrerequisiteTopics(migrateSubtopics(migrateSeedSubjects(data)))
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
