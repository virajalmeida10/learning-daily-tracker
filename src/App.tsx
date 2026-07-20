import { useEffect, useState, type ReactNode } from 'react'
import type { AppData, DailyGoal, Topic } from './types'
import { loadData, migrateData, newId, saveData } from './storage'
import { applyCompleted, applyStruggled } from './spacedRepetition'
import { todayISO } from './date'
import { Nav, type View } from './components/Nav'
import { RevisePanel } from './components/RevisePanel'
import { DailyGoals } from './components/DailyGoals'
import { TopicForm } from './components/TopicForm'
import { TopicList } from './components/TopicList'
import { TopicDetail } from './components/TopicDetail'
import { Checklist } from './components/Checklist'
import { Settings } from './components/Settings'
import { Card, Modal } from './components/ui'

type DetailOrigin = 'browse' | 'subjects' | 'home'

export default function App() {
  const [data, setData] = useState<AppData>(() => loadData())
  const [view, setView] = useState<View>('home')
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null)
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null)
  const [detailOrigin, setDetailOrigin] = useState<DetailOrigin>('browse')
  const [formOpen, setFormOpen] = useState(false)
  const [formInitial, setFormInitial] = useState<Topic | undefined>(undefined)

  useEffect(() => saveData(data), [data])

  const openTopic = (id: string, origin: DetailOrigin) => {
    setSelectedTopicId(id)
    setDetailOrigin(origin)
  }

  const closeTopic = () => setSelectedTopicId(null)

  const saveTopic = (topic: Topic) => {
    setData((d) => {
      const exists = d.topics.some((t) => t.id === topic.id)
      return { ...d, topics: exists ? d.topics.map((t) => (t.id === topic.id ? topic : t)) : [...d.topics, topic] }
    })
    setFormOpen(false)
    setFormInitial(undefined)
    setSelectedTopicId(topic.id)
  }

  // Toggling a subtopic with children cascades the new state down to all of
  // them; toggling a child recomputes its parent from whether every
  // sibling is now done, so the two levels never drift out of sync.
  const toggleSubtopic = (topicId: string, subtopicId: string) => {
    setData((d) => ({
      ...d,
      topics: d.topics.map((t) =>
        t.id === topicId
          ? {
              ...t,
              subtopics: t.subtopics.map((s) => {
                if (s.id !== subtopicId) return s
                const completed = !s.completed
                const children = s.children && s.children.length > 0 ? s.children.map((c) => ({ ...c, completed })) : s.children
                return { ...s, completed, children }
              }),
              updatedAt: new Date().toISOString(),
            }
          : t,
      ),
    }))
  }

  const toggleSubtopicChild = (topicId: string, subtopicId: string, childId: string) => {
    setData((d) => ({
      ...d,
      topics: d.topics.map((t) =>
        t.id === topicId
          ? {
              ...t,
              subtopics: t.subtopics.map((s) => {
                if (s.id !== subtopicId || !s.children) return s
                const children = s.children.map((c) => (c.id === childId ? { ...c, completed: !c.completed } : c))
                return { ...s, children, completed: children.every((c) => c.completed) }
              }),
              updatedAt: new Date().toISOString(),
            }
          : t,
      ),
    }))
  }

  const deleteTopic = (id: string) => {
    if (!window.confirm('Delete this topic and its revision history? This cannot be undone.')) return
    setData((d) => ({ ...d, topics: d.topics.filter((t) => t.id !== id) }))
    setSelectedTopicId(null)
  }

  const reviseTopic = (id: string, outcome: 'completed' | 'struggled') => {
    setData((d) => ({
      ...d,
      topics: d.topics.map((t) =>
        t.id === id
          ? { ...t, revision: outcome === 'completed' ? applyCompleted(t.revision) : applyStruggled(t.revision), updatedAt: new Date().toISOString() }
          : t,
      ),
    }))
  }

  const addSubject = (name: string) => {
    setData((d) => ({ ...d, subjects: [...d.subjects, { id: newId(), name, createdAt: new Date().toISOString() }] }))
  }

  const renameSubject = (id: string, name: string) => {
    setData((d) => ({ ...d, subjects: d.subjects.map((s) => (s.id === id ? { ...s, name } : s)) }))
  }

  const deleteSubject = (id: string) => {
    setData((d) => ({ ...d, subjects: d.subjects.filter((s) => s.id !== id), topics: d.topics.filter((t) => t.subjectId !== id) }))
    if (selectedSubjectId === id) setSelectedSubjectId(null)
  }

  const addGoal = (input: { subjectId: string; category?: string; text: string }) => {
    const goal: DailyGoal = { id: newId(), date: todayISO(), ...input, completed: false, createdAt: new Date().toISOString() }
    setData((d) => ({ ...d, dailyGoals: [...d.dailyGoals, goal] }))
  }

  const toggleGoal = (id: string) => {
    setData((d) => ({ ...d, dailyGoals: d.dailyGoals.map((g) => (g.id === id ? { ...g, completed: !g.completed } : g)) }))
  }

  const deleteGoal = (id: string) => {
    setData((d) => ({ ...d, dailyGoals: d.dailyGoals.filter((g) => g.id !== id) }))
  }

  const selectedTopic = selectedTopicId ? data.topics.find((t) => t.id === selectedTopicId) : undefined
  const selectedSubject = selectedSubjectId ? data.subjects.find((s) => s.id === selectedSubjectId) : undefined

  let body: ReactNode

  if (selectedTopic) {
    body = (
      <TopicDetail
        topic={selectedTopic}
        subject={data.subjects.find((s) => s.id === selectedTopic.subjectId)}
        onEdit={() => {
          setFormInitial(selectedTopic)
          setFormOpen(true)
        }}
        onDelete={() => deleteTopic(selectedTopic.id)}
        onComplete={() => reviseTopic(selectedTopic.id, 'completed')}
        onStruggled={() => reviseTopic(selectedTopic.id, 'struggled')}
        onToggleSubtopic={(subtopicId) => toggleSubtopic(selectedTopic.id, subtopicId)}
        onToggleSubtopicChild={(subtopicId, childId) => toggleSubtopicChild(selectedTopic.id, subtopicId, childId)}
        onBack={() => {
          closeTopic()
          setView(detailOrigin === 'home' ? 'home' : detailOrigin)
        }}
      />
    )
  } else if (view === 'home') {
    body = (
      <div className="space-y-4">
        <RevisePanel
          topics={data.topics}
          subjects={data.subjects}
          onComplete={(id) => reviseTopic(id, 'completed')}
          onStruggled={(id) => reviseTopic(id, 'struggled')}
          onOpenTopic={(id) => openTopic(id, 'home')}
        />
        <DailyGoals goals={data.dailyGoals} subjects={data.subjects} onAdd={addGoal} onToggle={toggleGoal} onDelete={deleteGoal} compact />
      </div>
    )
  } else if (view === 'log') {
    body = (
      <Card className="px-4 py-4">
        <h1 className="mb-4 text-base font-semibold text-stone-900">Log a topic</h1>
        <TopicForm
          subjects={data.subjects}
          onSave={(topic) => {
            saveTopic(topic)
            setView('home')
          }}
          onCancel={() => setView('home')}
        />
      </Card>
    )
  } else if (view === 'browse') {
    body = <TopicList topics={data.topics} subjects={data.subjects} onOpen={(id) => openTopic(id, 'browse')} />
  } else if (view === 'subjects') {
    if (selectedSubject) {
      body = (
        <div className="space-y-4">
          <button onClick={() => setSelectedSubjectId(null)} className="text-sm text-stone-500 hover:text-stone-800">
            ← All subjects
          </button>
          <h1 className="text-lg font-semibold text-stone-900">{selectedSubject.name}</h1>
          <TopicList topics={data.topics} subjects={data.subjects} fixedSubjectId={selectedSubject.id} onOpen={(id) => openTopic(id, 'subjects')} />
        </div>
      )
    } else {
      body = (
        <ul className="divide-y divide-stone-100 rounded-lg border border-stone-200 bg-white">
          {data.subjects.map((s) => (
            <li key={s.id}>
              <button onClick={() => setSelectedSubjectId(s.id)} className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-stone-50">
                <span className="text-sm font-medium text-stone-900">{s.name}</span>
                <span className="text-xs text-stone-400">{data.topics.filter((t) => t.subjectId === s.id).length} topics</span>
              </button>
            </li>
          ))}
          {data.subjects.length === 0 && <li className="px-4 py-6 text-center text-sm text-stone-400">No subjects yet — add one in Settings.</li>}
        </ul>
      )
    }
  } else if (view === 'checklist') {
    body = <Checklist topics={data.topics} subjects={data.subjects} onToggleSubtopic={toggleSubtopic} onToggleSubtopicChild={toggleSubtopicChild} />
  } else if (view === 'goals') {
    body = <DailyGoals goals={data.dailyGoals} subjects={data.subjects} onAdd={addGoal} onToggle={toggleGoal} onDelete={deleteGoal} />
  } else {
    body = (
      <Settings
        subjects={data.subjects}
        topics={data.topics}
        data={data}
        onAddSubject={addSubject}
        onRenameSubject={renameSubject}
        onDeleteSubject={deleteSubject}
        onImport={(imported) => setData(migrateData(imported))}
      />
    )
  }

  return (
    <div className="min-h-screen bg-canvas text-stone-900">
      <Nav
        view={view}
        onChange={(v) => {
          closeTopic()
          setSelectedSubjectId(null)
          setView(v)
        }}
      />
      <main className="mx-auto max-w-3xl px-4 py-6">{body}</main>

      <Modal
        open={formOpen}
        wide
        title={formInitial ? 'Edit topic' : 'Log a topic'}
        onClose={() => {
          setFormOpen(false)
          setFormInitial(undefined)
        }}
      >
        <TopicForm
          subjects={data.subjects}
          initial={formInitial}
          onSave={saveTopic}
          onCancel={() => {
            setFormOpen(false)
            setFormInitial(undefined)
          }}
        />
      </Modal>
    </div>
  )
}
