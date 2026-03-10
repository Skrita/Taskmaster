import type React from 'react'
import type { FilterState, Status, Priority } from '../types'

interface Props {
  filter: FilterState
  assignees: string[]
  tags: string[]
  onChange: (f: FilterState) => void
  searchRef?: React.RefObject<HTMLInputElement | null>
}

export function FilterBar({ filter, assignees, tags, onChange, searchRef }: Props) {
  function set<K extends keyof FilterState>(key: K, value: FilterState[K]) {
    onChange({ ...filter, [key]: value })
  }

  const isActive = filter.search || filter.status !== 'all' || filter.priority !== 'all' || filter.assignee || filter.tag

  return (
    <div className="flex flex-wrap gap-2 items-center bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm">
      <input
        ref={searchRef}
        type="text"
        placeholder="Search tasks... ( / )"
        value={filter.search}
        onChange={e => set('search', e.target.value)}
        className="flex-1 min-w-40 text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-400"
      />

      <select
        value={filter.status}
        onChange={e => set('status', e.target.value as Status | 'all')}
        className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-400"
      >
        <option value="all">All statuses</option>
        <option value="todo">Todo</option>
        <option value="in-progress">In Progress</option>
        <option value="done">Done</option>
      </select>

      <select
        value={filter.priority}
        onChange={e => set('priority', e.target.value as Priority | 'all')}
        className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-400"
      >
        <option value="all">All priorities</option>
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>

      <select
        value={filter.assignee}
        onChange={e => set('assignee', e.target.value)}
        className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-400"
      >
        <option value="">All assignees</option>
        {assignees.map(a => (
          <option key={a} value={a}>{a}</option>
        ))}
      </select>

      {tags.length > 0 && (
        <select
          value={filter.tag}
          onChange={e => set('tag', e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-400"
        >
          <option value="">All tags</option>
          {tags.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      )}

      {isActive && (
        <button
          onClick={() => onChange({ search: '', status: 'all', assignee: '', priority: 'all', tag: '' })}
          className="text-sm text-gray-400 hover:text-red-500 transition-colors"
        >
          Clear
        </button>
      )}
    </div>
  )
}
