import { useState } from 'react'

interface Props {
  assignees: string[]
  onChange: (assignees: string[]) => void
  placeholder?: string
}

export const AVATAR_COLOR_OPTIONS = [
  { id: 'purple', classes: 'bg-purple-100 text-purple-700' },
  { id: 'blue',   classes: 'bg-blue-100 text-blue-700' },
  { id: 'green',  classes: 'bg-green-100 text-green-700' },
  { id: 'orange', classes: 'bg-orange-100 text-orange-700' },
  { id: 'pink',   classes: 'bg-pink-100 text-pink-700' },
  { id: 'teal',   classes: 'bg-teal-100 text-teal-700' },
  { id: 'red',    classes: 'bg-red-100 text-red-700' },
  { id: 'yellow', classes: 'bg-yellow-100 text-yellow-700' },
]

export function avatarColor(name: string): string {
  const storedId = localStorage.getItem(`taskmaster-color-${name}`)
  if (storedId) {
    const match = AVATAR_COLOR_OPTIONS.find(c => c.id === storedId)
    if (match) return match.classes
  }
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + hash * 31
  return AVATAR_COLOR_OPTIONS[Math.abs(hash) % AVATAR_COLOR_OPTIONS.length].classes
}

export function AssigneeInput({ assignees, onChange, placeholder = 'Add assignee...' }: Props) {
  const [input, setInput] = useState('')

  function addName(raw: string) {
    const name = raw.trim()
    if (!name || assignees.includes(name)) return
    onChange([...assignees, name])
    setInput('')
  }

  function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addName(input)
    } else if (e.key === 'Backspace' && !input && assignees.length > 0) {
      onChange(assignees.slice(0, -1))
    }
  }

  function remove(name: string) {
    onChange(assignees.filter(a => a !== name))
  }

  return (
    <div className="flex flex-wrap gap-1.5 items-center bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 focus-within:ring-2 focus-within:ring-violet-500 min-h-9">
      {assignees.map(name => (
        <span key={name} className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${avatarColor(name)}`}>
          {name}
          <button
            type="button"
            onClick={() => remove(name)}
            className="opacity-60 hover:opacity-100 leading-none"
          >
            ✕
          </button>
        </span>
      ))}
      <input
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKey}
        onBlur={() => addName(input)}
        placeholder={assignees.length === 0 ? placeholder : ''}
        className="flex-1 min-w-24 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none bg-transparent"
      />
    </div>
  )
}
