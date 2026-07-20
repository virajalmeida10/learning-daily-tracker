import { useState } from 'react'
import type { Subject, Topic } from '../types'
import { todayISO } from '../date'
import { createInitialRevisionState } from '../spacedRepetition'
import { newId } from '../storage'
import { Button, Input, Label, Select, Tag, Textarea } from './ui'
import { Markdown } from './Markdown'

interface Props {
  subjects: Subject[]
  initial?: Topic
  onSave: (topic: Topic) => void
  onCancel: () => void
}

function ListEditor({ label, items, onChange, placeholder }: { label: string; items: string[]; onChange: (items: string[]) => void; placeholder: string }) {
  const [draft, setDraft] = useState('')

  const commit = () => {
    const v = draft.trim()
    if (v && !items.includes(v)) onChange([...items, v])
    setDraft('')
  }

  return (
    <div>
      <Label>{label}</Label>
      <div className="mb-1.5 flex flex-wrap gap-1.5">
        {items.map((item, i) => (
          <Tag key={item + i} onRemove={() => onChange(items.filter((_, idx) => idx !== i))}>
            {item}
          </Tag>
        ))}
      </div>
      <Input
        value={draft}
        placeholder={placeholder}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault()
            commit()
          }
        }}
        onBlur={commit}
      />
    </div>
  )
}

export function TopicForm({ subjects, initial, onSave, onCancel }: Props) {
  const [subjectId, setSubjectId] = useState(initial?.subjectId ?? subjects[0]?.id ?? '')
  const [name, setName] = useState(initial?.name ?? '')
  const [subtopics, setSubtopics] = useState<string[]>(initial?.subtopics ?? [])
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [dateLearned, setDateLearned] = useState(initial?.dateLearned ?? todayISO())
  const [difficulty, setDifficulty] = useState<1 | 2 | 3 | 4 | 5>(initial?.difficulty ?? 3)
  const [tags, setTags] = useState<string[]>(initial?.tags ?? [])
  const [preview, setPreview] = useState(false)
  const [error, setError] = useState('')

  const insertSnippet = (lang: string) => {
    setNotes((n) => `${n}${n && !n.endsWith('\n') ? '\n' : ''}\n\`\`\`${lang}\n\n\`\`\`\n`)
  }

  const submit = () => {
    if (!name.trim()) return setError('Topic name is required.')
    if (!subjectId) return setError('Pick a subject (add one in Settings if the list is empty).')
    const now = new Date().toISOString()
    const topic: Topic = initial
      ? { ...initial, subjectId, name: name.trim(), subtopics, notes, dateLearned, difficulty, tags, updatedAt: now }
      : {
          id: newId(),
          subjectId,
          name: name.trim(),
          subtopics,
          notes,
          dateLearned,
          difficulty,
          tags,
          revision: createInitialRevisionState(dateLearned),
          createdAt: now,
          updatedAt: now,
        }
    onSave(topic)
  }

  return (
    <div className="space-y-4">
      {error && <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label>Subject</Label>
          <Select value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
            {subjects.length === 0 && <option value="">No subjects yet — add one in Settings</option>}
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Date learned</Label>
          <Input type="date" value={dateLearned} onChange={(e) => setDateLearned(e.target.value)} />
        </div>
      </div>

      <div>
        <Label>Topic name</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Binary search on rotated array" />
      </div>

      <ListEditor label="Subtopics" items={subtopics} onChange={setSubtopics} placeholder="Add a subtopic, press Enter" />

      <div>
        <div className="mb-1 flex items-center justify-between">
          <Label>Notes (markdown)</Label>
          <div className="flex gap-1">
            <button type="button" onClick={() => insertSnippet('java')} className="rounded border border-stone-200 px-1.5 py-0.5 text-[11px] text-stone-500 hover:bg-stone-50">
              + Java block
            </button>
            <button type="button" onClick={() => insertSnippet('sql')} className="rounded border border-stone-200 px-1.5 py-0.5 text-[11px] text-stone-500 hover:bg-stone-50">
              + SQL block
            </button>
            <button
              type="button"
              onClick={() => setPreview((p) => !p)}
              className="rounded border border-stone-200 px-1.5 py-0.5 text-[11px] text-stone-500 hover:bg-stone-50"
            >
              {preview ? 'Edit' : 'Preview'}
            </button>
          </div>
        </div>
        {preview ? (
          <div className="rounded-md border border-stone-300 px-3 py-2 min-h-[10rem]">
            <Markdown>{notes || '*Nothing to preview yet.*'}</Markdown>
          </div>
        ) : (
          <Textarea
            rows={10}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={'Explanation, gotchas, ```java\\n// code\\n``` blocks, etc.'}
            className="font-mono text-[13px]"
          />
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label>Difficulty</Label>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setDifficulty(n as 1 | 2 | 3 | 4 | 5)}
                className={`h-8 w-8 rounded-md border text-sm ${
                  n === difficulty
                    ? 'border-accent-600 bg-accent-600 text-white'
                    : 'border-stone-300 text-stone-500 hover:bg-stone-50'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
        <ListEditor label="Tags" items={tags} onChange={setTags} placeholder="Add a tag, press Enter" />
      </div>

      <div className="flex justify-end gap-2 border-t border-stone-100 pt-4">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" onClick={submit}>
          {initial ? 'Save changes' : 'Log topic'}
        </Button>
      </div>
    </div>
  )
}
