import { useState } from 'react'
import type { Subtask } from '../types'

interface Props {
  subtasks: Subtask[]
  onAdd: (title: string) => void
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onGenerateAI?: () => Promise<string[]>
}

export function SubtaskList({ subtasks, onAdd, onToggle, onDelete, onGenerateAI }: Props) {
  const [input, setInput] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [aiError, setAiError] = useState<string | null>(null)

  function handleAdd() {
    const trimmed = input.trim()
    if (!trimmed) return
    onAdd(trimmed)
    setInput('')
  }

  async function handleGenerate() {
    if (!onGenerateAI) return
    setAiLoading(true)
    setAiError(null)
    setSuggestions([])
    try {
      const results = await onGenerateAI()
      setSuggestions(results)
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'Failed to generate subtasks')
    } finally {
      setAiLoading(false)
    }
  }

  function acceptSuggestion(s: string) {
    onAdd(s)
    setSuggestions(prev => prev.filter(x => x !== s))
  }

  function acceptAll() {
    suggestions.forEach(s => onAdd(s))
    setSuggestions([])
  }

  const done = subtasks.filter(s => s.completed).length

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-slate-300">Subtasks</h3>
        <div className="flex items-center gap-2">
          {subtasks.length > 0 && (
            <span className="text-xs text-slate-500">{done}/{subtasks.length} done</span>
          )}
          {onGenerateAI && (
            <button
              onClick={handleGenerate}
              disabled={aiLoading}
              className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 bg-violet-900/30 hover:bg-violet-900/50 border border-violet-800/50 px-2 py-0.5 rounded-full transition-colors disabled:opacity-50"
            >
              {aiLoading
                ? <span className="inline-block w-3 h-3 border border-violet-400 border-t-transparent rounded-full animate-spin" />
                : <span>✦</span>
              }
              {aiLoading ? 'Generating…' : 'Suggest'}
            </button>
          )}
        </div>
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

      {aiError && (
        <p className="text-xs text-red-400 mb-2">{aiError}</p>
      )}

      {suggestions.length > 0 && (
        <div className="mb-3 bg-violet-950/30 border border-violet-800/40 rounded-xl p-3 space-y-1.5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-violet-400">✦ AI suggestions</span>
            <div className="flex gap-3">
              <button onClick={acceptAll} className="text-xs text-violet-300 hover:text-white transition-colors">
                Add all
              </button>
              <button onClick={() => setSuggestions([])} className="text-xs text-slate-600 hover:text-slate-400 transition-colors">
                Dismiss
              </button>
            </div>
          </div>
          {suggestions.map(s => (
            <div key={s} className="flex items-center gap-2 group/sug">
              <span className="flex-1 text-sm text-slate-300">{s}</span>
              <button
                onClick={() => acceptSuggestion(s)}
                className="text-xs text-violet-400 hover:text-violet-300 bg-violet-900/50 hover:bg-violet-900 px-2 py-0.5 rounded transition-colors opacity-0 group-hover/sug:opacity-100"
              >
                + Add
              </button>
              <button
                onClick={() => setSuggestions(prev => prev.filter(x => x !== s))}
                className="text-slate-600 hover:text-slate-400 text-xs transition-colors opacity-0 group-hover/sug:opacity-100"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

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
