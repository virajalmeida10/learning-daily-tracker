import type { Subject, Topic } from '../types'
import { Card, Empty } from './ui'

interface Props {
  topics: Topic[]
  subjects: Subject[]
  onToggleSubtopic: (topicId: string, subtopicId: string) => void
  onToggleSubtopicChild: (topicId: string, subtopicId: string, childId: string) => void
}

export function Checklist({ topics, subjects, onToggleSubtopic, onToggleSubtopicChild }: Props) {
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
              <TopicChecklistCard
                key={t.id}
                topic={t}
                subjectName={subjectName(t.subjectId)}
                onToggleSubtopic={onToggleSubtopic}
                onToggleSubtopicChild={onToggleSubtopicChild}
              />
            ))}
          </div>
        )}
      </section>

      {completed.length > 0 && (
        <section>
          <h2 className="mb-2 text-sm font-semibold text-stone-800">Completed ({completed.length})</h2>
          <div className="space-y-3">
            {completed.map((t) => (
              <TopicChecklistCard
                key={t.id}
                topic={t}
                subjectName={subjectName(t.subjectId)}
                onToggleSubtopic={onToggleSubtopic}
                onToggleSubtopicChild={onToggleSubtopicChild}
              />
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
  onToggleSubtopicChild,
}: {
  topic: Topic
  subjectName: string
  onToggleSubtopic: (topicId: string, subtopicId: string) => void
  onToggleSubtopicChild: (topicId: string, subtopicId: string, childId: string) => void
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
      <ul className="space-y-2">
        {topic.subtopics.map((s) => (
          <li key={s.id}>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={s.completed} onChange={() => onToggleSubtopic(topic.id, s.id)} className="h-4 w-4 accent-accent-600" />
              <span className={`flex-1 text-sm font-medium ${s.completed ? 'text-stone-400 line-through' : 'text-stone-800'}`}>{s.text}</span>
              {s.children && s.children.length > 0 && (
                <span className="text-xs text-stone-400">
                  {s.children.filter((c) => c.completed).length}/{s.children.length}
                </span>
              )}
            </div>
            {s.children && s.children.length > 0 && (
              <ul className="ml-6 mt-1 space-y-1 border-l border-stone-200 pl-3">
                {s.children.map((c) => (
                  <li key={c.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={c.completed}
                      onChange={() => onToggleSubtopicChild(topic.id, s.id, c.id)}
                      className="h-3.5 w-3.5 accent-accent-600"
                    />
                    <span className={`text-xs ${c.completed ? 'text-stone-400 line-through' : 'text-stone-600'}`}>{c.text}</span>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </Card>
  )
}
