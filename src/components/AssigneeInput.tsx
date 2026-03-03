import { useState } from 'react'

interface Props {
  assignees: string[]
  onChange: (assignees: string[]) => void
  placeholder?: string
}

const AVATAR_COLORS = [
  'bg-purple-100 text-purple-700',
  'bg-blue-100 text-blue-700',
  'bg-green-100 text-green-700',
  'bg-orange-100 text-orange-700',
  'bg-pink-100 text-pink-700',
]

export function avatarColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + hash * 31
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
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
    <div className="flex flex-wrap gap-1.5 items-center border border-gray-200 rounded-lg px-2 py-1.5 focus-within:ring-2 focus-within:ring-purple-400 min-h-9">
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
        className="flex-1 min-w-24 text-sm focus:outline-none bg-transparent"
      />
    </div>
  )
}
