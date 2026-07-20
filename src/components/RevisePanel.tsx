import { useMemo, useState } from 'react'
import type { Subject, Topic } from '../types'
import { todayISO } from '../date'
import { daysOverdue, getDueStatus, intervalLabel } from '../spacedRepetition'
import { Button, Card, DifficultyDots, Empty } from './ui'

interface Props {
  topics: Topic[]
  subjects: Subject[]
  onComplete: (topicId: string) => void
  onStruggled: (topicId: string) => void
  onOpenTopic: (topicId: string) => void
}

export function RevisePanel({ topics, subjects, onComplete, onStruggled, onOpenTopic }: Props) {
  const today = todayISO()
  const subjectName = (id: string) => subjects.find((s) => s.id === id)?.name ?? 'Unknown subject'

  const due = useMemo(() => {
    return topics
      .map((t) => ({ topic: t, status: getDueStatus(t.revision.dueDate, today) }))
      .filter((x) => x.status !== 'upcoming')
      .sort((a, b) => a.topic.revision.dueDate.localeCompare(b.topic.revision.dueDate))
  }, [topics, today])

  const overdueCount = due.filter((x) => x.status === 'overdue').length

  return (
    <Card className="border-accent-200">
      <div className="flex items-center justify-between border-b border-stone-100 px-4 py-3">
        <div>
          <h2 className="text-base font-semibold text-stone-900">Revise first</h2>
          <p className="text-xs text-stone-500">
            {due.length === 0
              ? 'Nothing due — you are caught up.'
              : `${due.length} topic${due.length === 1 ? '' : 's'} to revise${overdueCount ? `, ${overdueCount} overdue` : ''}`}
          </p>
        </div>
        {due.length > 0 && (
          <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-accent-600 px-2 text-sm font-semibold text-white">
            {due.length}
          </span>
        )}
      </div>

      {due.length === 0 ? (
        <Empty>No revisions due today. Log a topic to schedule your first one.</Empty>
      ) : (
        <ul className="divide-y divide-stone-100">
          {due.map(({ topic, status }) => (
            <RevisionRow
              key={topic.id}
              topic={topic}
              overdueDays={status === 'overdue' ? daysOverdue(topic.revision.dueDate, today) : 0}
              subjectName={subjectName(topic.subjectId)}
              onComplete={() => onComplete(topic.id)}
              onStruggled={() => onStruggled(topic.id)}
              onOpen={() => onOpenTopic(topic.id)}
            />
          ))}
        </ul>
      )}
    </Card>
  )
}

function RevisionRow({
  topic,
  overdueDays,
  subjectName,
  onComplete,
  onStruggled,
  onOpen,
}: {
  topic: Topic
  overdueDays: number
  subjectName: string
  onComplete: () => void
  onStruggled: () => void
  onOpen: () => void
}) {
  const [busy, setBusy] = useState(false)

  return (
    <li className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <button onClick={onOpen} className="min-w-0 flex-1 text-left">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-accent-700">
            {subjectName}
          </span>
          {overdueDays > 0 && (
            <span className="rounded bg-red-50 px-1.5 py-0.5 text-[11px] font-medium text-red-600">
              {overdueDays}d overdue
            </span>
          )}
          <DifficultyDots value={topic.difficulty} />
        </div>
        <p className="truncate text-sm font-medium text-stone-900">{topic.name}</p>
        <p className="text-xs text-stone-400">{intervalLabel(topic.revision)}</p>
      </button>
      <div className="flex shrink-0 gap-2">
        <Button
          variant="default"
          disabled={busy}
          onClick={() => {
            setBusy(true)
            onStruggled()
          }}
        >
          Struggled
        </Button>
        <Button
          variant="primary"
          disabled={busy}
          onClick={() => {
            setBusy(true)
            onComplete()
          }}
        >
          Done
        </Button>
      </div>
    </li>
  )
}
