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
        <h3 className="font-semibold text-slate-300">Subtasks</h3>
        {subtasks.length > 0 && (
          <span className="text-xs text-slate-500">{done}/{subtasks.length} done</span>
        )}
      </div>

      {subtasks.length > 0 && (
        <div className="mb-2 h-1.5 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all"
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
              className="w-4 h-4 accent-violet-500 cursor-pointer"
            />
            <span className={`flex-1 text-sm ${s.completed ? 'line-through text-slate-600' : 'text-slate-300'}`}>
              {s.title}
            </span>
            <button
              onClick={() => onDelete(s.id)}
              className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 text-xs transition-opacity"
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
          className="flex-1 text-sm bg-slate-800 border border-slate-700 text-slate-300 placeholder:text-slate-600 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
        <button
          onClick={handleAdd}
          className="text-sm bg-violet-900/50 text-violet-300 hover:bg-violet-900 rounded-lg px-3 py-1.5 font-medium transition-colors border border-violet-800/50"
        >
          Add
        </button>
      </div>
    </div>
  )
}
