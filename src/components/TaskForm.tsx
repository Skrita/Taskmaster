import { useState } from 'react'
import type { Status, Priority } from '../types'
import { AssigneeInput } from './AssigneeInput'
import { tagColor } from './TaskCard'

interface FormData {
  title: string
  description: string
  status: Status
  priority: Priority
  assignees: string[]
  tags: string[]
  dueDate: string
}

interface Props {
  defaultStatus?: Status
  onSubmit: (data: Omit<FormData, 'dueDate'> & { dueDate?: string }) => void
  onCancel: () => void
}

export function TaskForm({ defaultStatus = 'todo', onSubmit, onCancel }: Props) {
  const [data, setData] = useState<FormData>({
    title: '',
    description: '',
    status: defaultStatus,
    priority: 'medium',
    assignees: [],
    tags: [],
    dueDate: '',
  })
  const [tagInput, setTagInput] = useState('')

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setData(prev => ({ ...prev, [key]: value }))
  }

  function addTag(raw: string) {
    const tag = raw.trim()
    if (!tag || data.tags.includes(tag)) return
    set('tags', [...data.tags, tag])
    setTagInput('')
  }

  function removeTag(tag: string) {
    set('tags', data.tags.filter(t => t !== tag))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!data.title.trim()) return
    onSubmit({
      ...data,
      title: data.title.trim(),
      dueDate: data.dueDate || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        autoFocus
        required
        placeholder="Task title *"
        value={data.title}
        onChange={e => set('title', e.target.value)}
        className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
      />

      <textarea
        placeholder="Description (optional)"
        value={data.description}
        onChange={e => set('description', e.target.value)}
        rows={2}
        className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
      />

      <div className="flex gap-2">
        <select
          value={data.status}
          onChange={e => set('status', e.target.value as Status)}
          className="flex-1 text-sm border border-gray-200 rounded-lg px-2 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
        >
          <option value="todo">Todo</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
        </select>

        <select
          value={data.priority}
          onChange={e => set('priority', e.target.value as Priority)}
          className="flex-1 text-sm border border-gray-200 rounded-lg px-2 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
        >
          <option value="high">High priority</option>
          <option value="medium">Medium priority</option>
          <option value="low">Low priority</option>
        </select>
      </div>

      <input
        type="date"
        value={data.dueDate}
        onChange={e => set('dueDate', e.target.value)}
        className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-500"
      />

      <AssigneeInput
        assignees={data.assignees}
        onChange={names => set('assignees', names)}
        placeholder="Add assignees (Enter or comma to add)..."
      />

      <div className="flex flex-wrap gap-1.5 items-center border border-gray-200 rounded-lg px-2 py-1.5 focus-within:ring-2 focus-within:ring-purple-400 min-h-9">
        {data.tags.map(tag => (
          <span key={tag} className={`flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded border ${tagColor(tag)}`}>
            {tag}
            <button type="button" onClick={() => removeTag(tag)} className="opacity-60 hover:opacity-100 leading-none">✕</button>
          </span>
        ))}
        <input
          type="text"
          value={tagInput}
          onChange={e => setTagInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(tagInput) }
            else if (e.key === 'Backspace' && !tagInput && data.tags.length > 0) removeTag(data.tags[data.tags.length - 1])
          }}
          onBlur={() => addTag(tagInput)}
          placeholder={data.tags.length === 0 ? 'Add tags (Enter or comma)...' : ''}
          className="flex-1 min-w-24 text-sm focus:outline-none bg-transparent"
        />
      </div>

      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          className="flex-1 bg-purple-500 text-white text-sm font-medium py-2 rounded-lg hover:bg-purple-600 transition-colors"
        >
          Create Task
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 text-sm text-gray-500 py-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
