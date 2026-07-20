import type { Subject, Topic } from '../types'
import { getDueStatus, intervalLabel } from '../spacedRepetition'
import { Button, Card, DifficultyDots, Tag } from './ui'
import { Markdown } from './Markdown'

interface Props {
  topic: Topic
  subject: Subject | undefined
  onEdit: () => void
  onDelete: () => void
  onComplete: () => void
  onStruggled: () => void
  onToggleSubtopic: (subtopicId: string) => void
  onBack: () => void
}

export function TopicDetail({ topic, subject, onEdit, onDelete, onComplete, onStruggled, onToggleSubtopic, onBack }: Props) {
  const status = getDueStatus(topic.revision.dueDate)
  const doneCount = topic.subtopics.filter((s) => s.completed).length

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="text-sm text-stone-500 hover:text-stone-800">
        ← Back
      </button>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <span className="text-xs font-medium uppercase tracking-wide text-accent-700">
            {subject?.name ?? 'Unknown subject'}
          </span>
          <h1 className="text-xl font-semibold text-stone-900">{topic.name}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-stone-400">
            <span>Learned {topic.dateLearned}</span>
            <DifficultyDots value={topic.difficulty} />
            {topic.tags.map((t) => (
              <Tag key={t}>{t}</Tag>
            ))}
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="default" onClick={onEdit}>
            Edit
          </Button>
          <Button variant="danger" onClick={onDelete}>
            Delete
          </Button>
        </div>
      </div>

      {topic.subtopics.length > 0 && (
        <Card className="px-4 py-3">
          <div className="mb-1.5 flex items-center justify-between">
            <p className="text-xs font-medium text-stone-500">Subtopics</p>
            <p className="text-xs text-stone-400">
              {doneCount}/{topic.subtopics.length} done
            </p>
          </div>
          <ul className="space-y-1">
            {topic.subtopics.map((s) => (
              <li key={s.id} className="flex items-center gap-2">
                <input type="checkbox" checked={s.completed} onChange={() => onToggleSubtopic(s.id)} className="h-4 w-4 accent-accent-600" />
                <span className={`text-sm ${s.completed ? 'text-stone-400 line-through' : 'text-stone-800'}`}>{s.text}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card className="px-4 py-3">
        {topic.notes.trim() ? <Markdown>{topic.notes}</Markdown> : <p className="text-sm text-stone-400">No notes yet.</p>}
      </Card>

      <Card className="px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-stone-500">Revision</p>
            <p className="text-sm text-stone-800">
              {intervalLabel(topic.revision)} · next due <span className="font-medium">{topic.revision.dueDate}</span>{' '}
              {status !== 'upcoming' && (
                <span className={status === 'overdue' ? 'text-red-600' : 'text-accent-700'}>
                  ({status === 'overdue' ? 'overdue' : 'due today'})
                </span>
              )}
            </p>
            <p className="text-xs text-stone-400">{topic.revision.reviewCount} review{topic.revision.reviewCount === 1 ? '' : 's'} so far</p>
          </div>
          <div className="flex gap-2">
            <Button variant="default" onClick={onStruggled}>
              Struggled
            </Button>
            <Button variant="primary" onClick={onComplete}>
              Mark reviewed
            </Button>
          </div>
        </div>

        {topic.revision.history.length > 0 && (
          <ul className="mt-3 space-y-1 border-t border-stone-100 pt-3 text-xs text-stone-500">
            {[...topic.revision.history].reverse().map((h, i) => (
              <li key={i} className="flex justify-between">
                <span>{h.date}</span>
                <span className={h.outcome === 'struggled' ? 'text-red-500' : 'text-stone-500'}>{h.outcome}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
