import { useEffect, useMemo, useState } from 'react'
import type { DailyGoal, DayGoalStatus, Subject } from '../types'
import { addDays, todayISO } from '../date'
import { Button, Card, Input, Select } from './ui'

interface Props {
  goals: DailyGoal[]
  subjects: Subject[]
  onAdd: (goal: { subjectId: string; category?: string; text: string }) => void
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  compact?: boolean
}

const DATA_STRUCTURES = [
  'Arrays',
  'Strings',
  'Linked Lists',
  'Stacks',
  'Queues',
  'Hash Tables',
  'Trees',
  'Binary Search Trees',
  'Heaps',
  'Graphs',
  'Tries',
  'Sets',
]

const SYSTEM_DESIGN_LEVELS = ['High-Level Design (HLD)', 'Low-Level Design (LLD)']

const SWE_FUNDAMENTALS_TOPICS = ['Computer Networks', 'Operating Systems', 'Database Management Systems']

function categoryOptionsFor(subjectName: string | undefined): string[] | null {
  if (!subjectName) return null
  const n = subjectName.toLowerCase()
  if (n.includes('system design')) return SYSTEM_DESIGN_LEVELS
  if (n.includes('dsa') || n.includes('data structure')) return DATA_STRUCTURES
  if (n.includes('fundamentals')) return SWE_FUNDAMENTALS_TOPICS
  return null
}

function dayStatus(goalsForDay: DailyGoal[]): DayGoalStatus {
  if (goalsForDay.length === 0) return 'none'
  const doneCount = goalsForDay.filter((g) => g.completed).length
  if (doneCount === goalsForDay.length) return 'complete'
  if (doneCount === 0) return 'incomplete'
  return 'partial'
}

function currentStreak(byDate: Map<string, DailyGoal[]>, today: string): number {
  let streak = 0
  let cursor = today
  if (dayStatus(byDate.get(cursor) ?? []) !== 'complete') {
    cursor = addDays(cursor, -1)
  }
  while (dayStatus(byDate.get(cursor) ?? []) === 'complete') {
    streak++
    cursor = addDays(cursor, -1)
  }
  return streak
}

const STATUS_CLASSES: Record<DayGoalStatus, string> = {
  complete: 'bg-accent-600',
  partial: 'bg-accent-200',
  incomplete: 'bg-red-200',
  none: 'bg-stone-100',
}

export function DailyGoals({ goals, subjects, onAdd, onToggle, onDelete, compact = false }: Props) {
  const [subjectId, setSubjectId] = useState(subjects[0]?.id ?? '')
  const [category, setCategory] = useState('')
  const [draft, setDraft] = useState('')
  const today = todayISO()

  const subjectName = (id?: string) => subjects.find((s) => s.id === id)?.name ?? 'General'
  const categoryOptions = categoryOptionsFor(subjects.find((s) => s.id === subjectId)?.name)

  useEffect(() => {
    if (categoryOptions && !categoryOptions.includes(category)) setCategory(categoryOptions[0])
    if (!categoryOptions && category) setCategory('')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjectId])

  const byDate = useMemo(() => {
    const m = new Map<string, DailyGoal[]>()
    for (const g of goals) {
      const list = m.get(g.date) ?? []
      list.push(g)
      m.set(g.date, list)
    }
    return m
  }, [goals])

  const todayGoals = (byDate.get(today) ?? []).slice().sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  const streak = useMemo(() => currentStreak(byDate, today), [byDate, today])

  const historyDays = compact ? 0 : 35
  const history = useMemo(() => {
    if (!historyDays) return []
    return Array.from({ length: historyDays }, (_, i) => {
      const date = addDays(today, -(historyDays - 1 - i))
      return { date, status: dayStatus(byDate.get(date) ?? []) }
    })
  }, [byDate, today, historyDays])

  const submit = () => {
    const v = draft.trim()
    if (!v || !subjectId) return
    onAdd({ subjectId, category: categoryOptions ? category : undefined, text: v })
    setDraft('')
  }

  return (
    <Card className="px-4 py-3">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-stone-800">Today's goals</h2>
        <span className="text-xs text-stone-500">
          🔥 {streak} day{streak === 1 ? '' : 's'} streak
        </span>
      </div>

      <div className="mb-3 space-y-2">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} disabled={subjects.length === 0}>
            {subjects.length === 0 && <option value="">No subjects yet</option>}
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
          {categoryOptions && (
            <Select value={category} onChange={(e) => setCategory(e.target.value)}>
              {categoryOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          )}
        </div>
        <div className="flex gap-2">
          <Input
            value={draft}
            placeholder="Topic, e.g. Reverse a linked list"
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
          />
          <Button variant="primary" onClick={submit}>
            Add
          </Button>
        </div>
      </div>

      {todayGoals.length === 0 ? (
        <p className="py-2 text-sm text-stone-400">No goals set for today yet.</p>
      ) : (
        <ul className="space-y-1.5">
          {todayGoals.map((g) => (
            <li key={g.id} className="flex items-start gap-2 rounded px-1 py-1 hover:bg-stone-50">
              <input type="checkbox" checked={g.completed} onChange={() => onToggle(g.id)} className="mt-0.5 h-4 w-4 accent-accent-600" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5 text-xs text-stone-500">
                  <span className="font-medium uppercase tracking-wide text-accent-700">{subjectName(g.subjectId)}</span>
                  {g.category && <span className="rounded bg-stone-100 px-1.5 py-0.5 text-stone-600">{g.category}</span>}
                </div>
                <span className={`text-sm ${g.completed ? 'text-stone-400 line-through' : 'text-stone-800'}`}>{g.text}</span>
              </div>
              <button onClick={() => onDelete(g.id)} className="text-stone-300 hover:text-red-500" aria-label="Delete goal">
                &times;
              </button>
            </li>
          ))}
        </ul>
      )}

      {!compact && (
        <div className="mt-4 border-t border-stone-100 pt-3">
          <p className="mb-1.5 text-xs font-medium text-stone-500">Last {historyDays} days</p>
          <div className="flex flex-wrap gap-1">
            {history.map((h) => (
              <span key={h.date} title={`${h.date}: ${h.status}`} className={`h-3.5 w-3.5 rounded-sm ${STATUS_CLASSES[h.status]}`} />
            ))}
          </div>
          <div className="mt-2 flex gap-3 text-[11px] text-stone-400">
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-sm bg-accent-600" /> complete
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-sm bg-accent-200" /> partial
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-sm bg-red-200" /> missed
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-sm bg-stone-100" /> no goals
            </span>
          </div>
        </div>
      )}
    </Card>
  )
}
