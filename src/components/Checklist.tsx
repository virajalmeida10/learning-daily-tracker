import type { Subject, Topic } from '../types'
import { Card, Empty } from './ui'

interface Props {
  topics: Topic[]
  subjects: Subject[]
  onToggleSubtopic: (topicId: string, subtopicId: string) => void
}

export function Checklist({ topics, subjects, onToggleSubtopic }: Props) {
  const subjectName = (id: string) => subjects.find((s) => s.id === id)?.name ?? 'Unknown subject'

  const withSubtopics = topics.filter((t) => t.subtopics.length > 0)
  const pending = withSubtopics
    .filter((t) => t.subtopics.some((s) => !s.completed))
    .sort((a, b) => b.dateLearned.localeCompare(a.dateLearned))
  const completed = withSubtopics
    .filter((t) => t.subtopics.every((s) => s.completed))
    .sort((a, b) => b.dateLearned.localeCompare(a.dateLearned))

  if (withSubtopics.length === 0) {
    return <Empty>No subtopics yet. Add subtopics when logging a topic and they'll show up here to check off.</Empty>
  }

  return (
    <div className="space-y-6">
      <section>
        <h2 className="mb-2 text-sm font-semibold text-stone-800">Pending ({pending.length})</h2>
        {pending.length === 0 ? (
          <p className="text-sm text-stone-400">Nothing pending — everything logged so far is checked off.</p>
        ) : (
          <div className="space-y-3">
            {pending.map((t) => (
              <TopicChecklistCard key={t.id} topic={t} subjectName={subjectName(t.subjectId)} onToggleSubtopic={onToggleSubtopic} />
            ))}
          </div>
        )}
      </section>

      {completed.length > 0 && (
        <section>
          <h2 className="mb-2 text-sm font-semibold text-stone-800">Completed ({completed.length})</h2>
          <div className="space-y-3">
            {completed.map((t) => (
              <TopicChecklistCard key={t.id} topic={t} subjectName={subjectName(t.subjectId)} onToggleSubtopic={onToggleSubtopic} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function TopicChecklistCard({
  topic,
  subjectName,
  onToggleSubtopic,
}: {
  topic: Topic
  subjectName: string
  onToggleSubtopic: (topicId: string, subtopicId: string) => void
}) {
  const doneCount = topic.subtopics.filter((s) => s.completed).length

  return (
    <Card className="px-4 py-3">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div>
          <span className="text-xs font-medium uppercase tracking-wide text-accent-700">{subjectName}</span>
          <p className="text-sm font-medium text-stone-900">{topic.name}</p>
        </div>
        <span className="text-xs text-stone-400">
          {doneCount}/{topic.subtopics.length} done · learned {topic.dateLearned}
        </span>
      </div>
      <ul className="space-y-1">
        {topic.subtopics.map((s) => (
          <li key={s.id} className="flex items-center gap-2">
            <input type="checkbox" checked={s.completed} onChange={() => onToggleSubtopic(topic.id, s.id)} className="h-4 w-4 accent-accent-600" />
            <span className={`text-sm ${s.completed ? 'text-stone-400 line-through' : 'text-stone-800'}`}>{s.text}</span>
          </li>
        ))}
      </ul>
    </Card>
  )
}
