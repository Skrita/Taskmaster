import { useState } from 'react'
import type { Status, Priority } from '../types'

interface FormData {
  title: string
  description: string
  status: Status
  priority: Priority
  assignee: string
}

interface Props {
  defaultStatus?: Status
  onSubmit: (data: FormData) => void
  onCancel: () => void
}

export function TaskForm({ defaultStatus = 'todo', onSubmit, onCancel }: Props) {
  const [data, setData] = useState<FormData>({
    title: '',
    description: '',
    status: defaultStatus,
    priority: 'medium',
    assignee: '',
  })

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setData(prev => ({ ...prev, [key]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!data.title.trim()) return
    onSubmit({ ...data, title: data.title.trim() })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        autoFocus
        required
        placeholder="Task title *"
        value={data.title}
        onChange={e => set('title', e.target.value)}
        className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
      />

      <textarea
        placeholder="Description (optional)"
        value={data.description}
        onChange={e => set('description', e.target.value)}
        rows={2}
        className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
      />

      <div className="flex gap-2">
        <select
          value={data.status}
          onChange={e => set('status', e.target.value as Status)}
          className="flex-1 text-sm border border-gray-200 rounded-lg px-2 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="todo">Todo</option>
          <option value="in-progress">In Progress</option>
          <option value="review">Review</option>
          <option value="done">Done</option>
        </select>

        <select
          value={data.priority}
          onChange={e => set('priority', e.target.value as Priority)}
          className="flex-1 text-sm border border-gray-200 rounded-lg px-2 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="high">High priority</option>
          <option value="medium">Medium priority</option>
          <option value="low">Low priority</option>
        </select>
      </div>

      <input
        placeholder="Assignee name (optional)"
        value={data.assignee}
        onChange={e => set('assignee', e.target.value)}
        className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
      />

      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          className="flex-1 bg-blue-500 text-white text-sm font-medium py-2 rounded-lg hover:bg-blue-600 transition-colors"
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
