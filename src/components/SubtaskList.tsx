import { useState } from 'react'
import type { Subtask } from '../types'

interface Props {
  subtasks: Subtask[]
  onAdd: (title: string) => void
  onToggle: (id: string) => void
  onDelete: (id: string) => void
}

export function SubtaskList({ subtasks, onAdd, onToggle, onDelete }: Props) {
  const [input, setInput] = useState('')

  function handleAdd() {
    const trimmed = input.trim()
    if (!trimmed) return
    onAdd(trimmed)
    setInput('')
  }

  const done = subtasks.filter(s => s.completed).length

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-gray-700">Subtasks</h3>
        {subtasks.length > 0 && (
          <span className="text-xs text-gray-400">{done}/{subtasks.length} done</span>
        )}
      </div>

      {subtasks.length > 0 && (
        <div className="mb-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-400 rounded-full transition-all"
            style={{ width: `${(done / subtasks.length) * 100}%` }}
          />
        </div>
      )}

      <ul className="space-y-1 mb-3">
        {subtasks.map(s => (
          <li key={s.id} className="flex items-center gap-2 group">
            <input
              type="checkbox"
              checked={s.completed}
              onChange={() => onToggle(s.id)}
              className="w-4 h-4 accent-blue-500 cursor-pointer"
            />
            <span className={`flex-1 text-sm ${s.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
              {s.title}
            </span>
            <button
              onClick={() => onDelete(s.id)}
              className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 text-xs transition-opacity"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          placeholder="Add a subtask..."
          className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={handleAdd}
          className="text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg px-3 py-1.5 font-medium transition-colors"
        >
          Add
        </button>
      </div>
    </div>
  )
}
