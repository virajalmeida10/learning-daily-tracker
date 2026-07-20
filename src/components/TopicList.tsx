import { useMemo, useState } from 'react'
import type { Subject, Topic } from '../types'
import { getDueStatus } from '../spacedRepetition'
import { DifficultyDots, Empty, Input, Select } from './ui'

interface Props {
  topics: Topic[]
  subjects: Subject[]
  onOpen: (topicId: string) => void
  fixedSubjectId?: string
}

const ALL = '__all__'

export function TopicList({ topics, subjects, onOpen, fixedSubjectId }: Props) {
  const [query, setQuery] = useState('')
  const [subjectId, setSubjectId] = useState(fixedSubjectId ?? ALL)
  const [tag, setTag] = useState(ALL)
  const [difficulty, setDifficulty] = useState(ALL)
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const allTags = useMemo(() => Array.from(new Set(topics.flatMap((t) => t.tags))).sort(), [topics])
  const subjectName = (id: string) => subjects.find((s) => s.id === id)?.name ?? 'Unknown subject'

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return topics
      .filter((t) => (fixedSubjectId ? t.subjectId === fixedSubjectId : subjectId === ALL || t.subjectId === subjectId))
      .filter((t) => tag === ALL || t.tags.includes(tag))
      .filter((t) => difficulty === ALL || t.difficulty === Number(difficulty))
      .filter((t) => !from || t.dateLearned >= from)
      .filter((t) => !to || t.dateLearned <= to)
      .filter((t) => {
        if (!q) return true
        const haystack = `${t.name} ${t.subtopics.join(' ')} ${t.notes}`.toLowerCase()
        return haystack.includes(q)
      })
      .sort((a, b) => (fixedSubjectId ? a.dateLearned.localeCompare(b.dateLearned) : b.dateLearned.localeCompare(a.dateLearned)))
  }, [topics, query, subjectId, tag, difficulty, from, to, fixedSubjectId])

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        <Input className="col-span-2 sm:col-span-3 lg:col-span-2" placeholder="Search name, subtopics, notes…" value={query} onChange={(e) => setQuery(e.target.value)} />
        {!fixedSubjectId && (
          <Select value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
            <option value={ALL}>All subjects</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        )}
        <Select value={tag} onChange={(e) => setTag(e.target.value)}>
          <option value={ALL}>All tags</option>
          {allTags.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </Select>
        <Select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
          <option value={ALL}>Any difficulty</option>
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>
              Difficulty {n}
            </option>
          ))}
        </Select>
        <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} title="From date" />
        <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} title="To date" />
      </div>

      {filtered.length === 0 ? (
        <Empty>No topics match.</Empty>
      ) : (
        <ul className="divide-y divide-stone-100 rounded-lg border border-stone-200 bg-white">
          {filtered.map((t) => {
            const status = getDueStatus(t.revision.dueDate)
            return (
              <li key={t.id}>
                <button onClick={() => onOpen(t.id)} className="flex w-full flex-col gap-1 px-4 py-3 text-left hover:bg-stone-50 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {!fixedSubjectId && (
                        <span className="text-xs font-medium uppercase tracking-wide text-accent-700">{subjectName(t.subjectId)}</span>
                      )}
                      <span className="text-xs text-stone-400">{t.dateLearned}</span>
                      <DifficultyDots value={t.difficulty} />
                    </div>
                    <p className="truncate text-sm font-medium text-stone-900">{t.name}</p>
                    {t.tags.length > 0 && <p className="truncate text-xs text-stone-400">{t.tags.join(', ')}</p>}
                  </div>
                  <span
                    className={`shrink-0 rounded px-1.5 py-0.5 text-[11px] font-medium ${
                      status === 'overdue'
                        ? 'bg-red-50 text-red-600'
                        : status === 'due'
                          ? 'bg-accent-50 text-accent-700'
                          : 'bg-stone-50 text-stone-400'
                    }`}
                  >
                    {status === 'overdue' ? 'Overdue' : status === 'due' ? 'Due today' : `Next ${t.revision.dueDate}`}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
