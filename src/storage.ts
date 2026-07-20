import type { AppData, ExportData } from './types'
import { todayISO } from './date'

const STORAGE_KEY = 'learning-tracker:data:v1'

export function newId(): string {
  return crypto.randomUUID()
}

function seedData(): AppData {
  const now = new Date().toISOString()
  const subjects = [
    { id: newId(), name: 'Java / Spring Boot', createdAt: now },
    { id: newId(), name: 'Java DSA', createdAt: now },
    { id: newId(), name: 'SWE Fundamentals', createdAt: now },
  ]
  return { version: 1, subjects, topics: [], dailyGoals: [] }
}

export function loadData(): AppData {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    const seeded = seedData()
    saveData(seeded)
    return seeded
  }
  try {
    const parsed = JSON.parse(raw) as AppData
    if (!parsed.subjects || !parsed.topics || !parsed.dailyGoals) throw new Error('malformed data')
    return parsed
  } catch {
    const seeded = seedData()
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
