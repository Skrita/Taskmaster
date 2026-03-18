import { useState } from 'react'
import type { Status, Priority } from '../types'
import { AssigneeInput } from './AssigneeInput'
import { tagColor } from './TaskCard'
import { generateSubtasks } from '../lib/claude'

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
  onSubmit: (data: Omit<FormData, 'dueDate'> & { dueDate?: string; subtasks?: string[] }) => void
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
  const [aiSubtasks, setAiSubtasks] = useState<string[]>([])
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)

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

  async function handleGenerateSubtasks() {
    if (!data.title.trim()) return
    setAiLoading(true)
    setAiError(null)
    setAiSubtasks([])
    try {
      const results = await generateSubtasks(data.title, data.description)
      setAiSubtasks(results)
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'Failed to generate subtasks')
    } finally {
      setAiLoading(false)
    }
  }

  function toggleAiSubtask(s: string) {
    setAiSubtasks(prev => prev.filter(x => x !== s))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!data.title.trim()) return
    onSubmit({
      ...data,
      title: data.title.trim(),
      dueDate: data.dueDate || undefined,
      subtasks: aiSubtasks.length > 0 ? aiSubtasks : undefined,
    })
  }

  const inputCls = "w-full text-sm bg-slate-700 border border-slate-600 text-slate-200 placeholder:text-slate-500 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
  const selectCls = "flex-1 text-sm bg-slate-700 border border-slate-600 text-slate-200 rounded-lg px-2 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        autoFocus
        required
        placeholder="Task title *"
        value={data.title}
        onChange={e => set('title', e.target.value)}
        className={inputCls}
      />

      <textarea
        placeholder="Description (optional)"
        value={data.description}
        onChange={e => set('description', e.target.value)}
        rows={2}
        className={`${inputCls} resize-none`}
      />

      <div className="flex gap-2">
        <select
          value={data.status}
          onChange={e => set('status', e.target.value as Status)}
          className={selectCls}
        >
          <option value="todo">Todo</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
        </select>

        <select
          value={data.priority}
          onChange={e => set('priority', e.target.value as Priority)}
          className={selectCls}
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
        className={inputCls}
      />

      <AssigneeInput
        assignees={data.assignees}
        onChange={names => set('assignees', names)}
        placeholder="Add assignees (Enter or comma to add)..."
      />

      <div className="flex flex-wrap gap-1.5 items-center bg-slate-700 border border-slate-600 rounded-lg px-2 py-1.5 focus-within:ring-2 focus-within:ring-violet-500 min-h-9">
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
          className="flex-1 min-w-24 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none bg-transparent"
        />
      </div>

      {/* AI subtask generation */}
      {data.title.trim() && (
        <div>
          <button
            type="button"
            onClick={handleGenerateSubtasks}
            disabled={aiLoading}
            className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 bg-violet-900/30 hover:bg-violet-900/50 border border-violet-800/50 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
          >
            {aiLoading
              ? <span className="inline-block w-3 h-3 border border-violet-400 border-t-transparent rounded-full animate-spin" />
              : <span>✦</span>
            }
            {aiLoading ? 'Generating subtasks…' : 'Suggest subtasks with AI'}
          </button>
          {aiError && <p className="text-xs text-red-400 mt-1">{aiError}</p>}
          {aiSubtasks.length > 0 && (
            <div className="mt-2 bg-violet-950/30 border border-violet-800/40 rounded-xl p-3 space-y-1.5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-violet-400">✦ Will be added on create</span>
                <button
                  type="button"
                  onClick={() => setAiSubtasks([])}
                  className="text-xs text-slate-600 hover:text-slate-400 transition-colors"
                >
                  Clear all
                </button>
              </div>
              {aiSubtasks.map(s => (
                <div key={s} className="flex items-center gap-2 group/sug">
                  <span className="flex-1 text-sm text-slate-300">{s}</span>
                  <button
                    type="button"
                    onClick={() => toggleAiSubtask(s)}
                    className="text-slate-600 hover:text-red-400 text-xs transition-colors opacity-0 group-hover/sug:opacity-100"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          className="flex-1 bg-violet-600 text-white text-sm font-medium py-2 rounded-lg hover:bg-violet-500 transition-colors"
        >
          Create Task
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 text-sm text-slate-500 py-2 rounded-lg hover:bg-slate-700 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
