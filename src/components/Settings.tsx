import { useRef, useState } from 'react'
import type { AppData, Subject, Topic } from '../types'
import { downloadExport, parseImport } from '../storage'
import { Button, Card, Input, Label } from './ui'

interface Props {
  subjects: Subject[]
  topics: Topic[]
  data: AppData
  onAddSubject: (name: string) => void
  onRenameSubject: (id: string, name: string) => void
  onDeleteSubject: (id: string) => void
  onImport: (data: AppData) => void
}

export function Settings({ subjects, topics, data, onAddSubject, onRenameSubject, onDeleteSubject, onImport }: Props) {
  const [newSubject, setNewSubject] = useState('')
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [importError, setImportError] = useState('')
  const fileInput = useRef<HTMLInputElement>(null)

  const topicCount = (subjectId: string) => topics.filter((t) => t.subjectId === subjectId).length

  const addSubject = () => {
    const v = newSubject.trim()
    if (!v) return
    onAddSubject(v)
    setNewSubject('')
  }

  const deleteSubject = (s: Subject) => {
    const count = topicCount(s.id)
    const message =
      count > 0
        ? `Delete "${s.name}"? This will also permanently delete its ${count} topic${count === 1 ? '' : 's'} and their revision history.`
        : `Delete "${s.name}"?`
    if (window.confirm(message)) onDeleteSubject(s.id)
  }

  const handleImportFile = (file: File) => {
    setImportError('')
    file
      .text()
      .then((text) => {
        try {
          const imported = parseImport(text)
          if (window.confirm('Importing will replace all current data on this device. Continue?')) {
            onImport(imported)
          }
        } catch (e) {
          setImportError(e instanceof Error ? e.message : 'Could not read that file.')
        }
      })
      .catch(() => setImportError('Could not read that file.'))
  }

  return (
    <div className="space-y-4">
      <Card className="px-4 py-3">
        <h2 className="mb-3 text-sm font-semibold text-stone-800">Subjects</h2>
        <ul className="mb-3 space-y-1.5">
          {subjects.map((s) => (
            <li key={s.id} className="flex items-center gap-2">
              {renamingId === s.id ? (
                <>
                  <Input value={renameValue} onChange={(e) => setRenameValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (onRenameSubject(s.id, renameValue.trim() || s.name), setRenamingId(null))} autoFocus />
                  <Button
                    variant="primary"
                    onClick={() => {
                      onRenameSubject(s.id, renameValue.trim() || s.name)
                      setRenamingId(null)
                    }}
                  >
                    Save
                  </Button>
                  <Button variant="ghost" onClick={() => setRenamingId(null)}>
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-sm text-stone-800">{s.name}</span>
                  <span className="text-xs text-stone-400">{topicCount(s.id)} topics</span>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setRenamingId(s.id)
                      setRenameValue(s.name)
                    }}
                  >
                    Rename
                  </Button>
                  <Button variant="danger" onClick={() => deleteSubject(s)}>
                    Delete
                  </Button>
                </>
              )}
            </li>
          ))}
          {subjects.length === 0 && <p className="text-sm text-stone-400">No subjects yet.</p>}
        </ul>
        <div className="flex gap-2 border-t border-stone-100 pt-3">
          <Input value={newSubject} placeholder="New subject name" onChange={(e) => setNewSubject(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addSubject()} />
          <Button variant="primary" onClick={addSubject}>
            Add
          </Button>
        </div>
      </Card>

      <Card className="px-4 py-3">
        <h2 className="mb-3 text-sm font-semibold text-stone-800">Backup</h2>
        <p className="mb-3 text-xs text-stone-500">
          Export everything as a JSON file, or import a backup to restore it on this device (this replaces current data).
        </p>
        <div className="flex flex-wrap gap-2">
          <Button variant="default" onClick={() => downloadExport(data)}>
            Export JSON
          </Button>
          <Button variant="default" onClick={() => fileInput.current?.click()}>
            Import JSON
          </Button>
          <input
            ref={fileInput}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleImportFile(file)
              e.target.value = ''
            }}
          />
        </div>
        {importError && <p className="mt-2 text-sm text-red-600">{importError}</p>}
        <div className="mt-3 border-t border-stone-100 pt-3 text-xs text-stone-400">
          <Label>Local stats</Label>
          {subjects.length} subjects · {topics.length} topics · {data.dailyGoals.length} goals logged
        </div>
      </Card>
    </div>
  )
}
