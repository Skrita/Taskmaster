import { useState, useRef } from 'react'
import type { Comment } from '../types'
import { avatarColor } from './AssigneeInput'

interface Props {
  comments: Comment[]
  knownUsers: string[]
  currentUser: string
  onAdd: (author: string, text: string) => void
  onConvertToSubtask?: (text: string) => void
}

function timeAgo(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

function renderCommentText(text: string, knownUsers: string[]) {
  const parts = text.split(/(@\S+)/)
  return parts.map((part, i) => {
    if (part.startsWith('@')) {
      const name = part.slice(1)
      return knownUsers.includes(name)
        ? <span key={i} className={`inline-flex items-center text-xs font-semibold px-1.5 py-0.5 rounded-full ${avatarColor(name)}`}>{part}</span>
        : <span key={i} className="font-semibold text-violet-400">{part}</span>
    }
    return <span key={i}>{part}</span>
  })
}

export function CommentList({ comments, knownUsers, currentUser, onAdd, onConvertToSubtask }: Props) {
  const [text, setText] = useState('')
  const [mentionQuery, setMentionQuery] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const suggestions = mentionQuery !== null
    ? knownUsers.filter(u => u.toLowerCase().startsWith(mentionQuery.toLowerCase()))
    : []

  function handleTextChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const val = e.target.value
    setText(val)
    const cursor = e.target.selectionStart ?? val.length
    const before = val.slice(0, cursor)
    const match = before.match(/@(\w*)$/)
    setMentionQuery(match ? match[1] : null)
  }

  function insertMention(name: string) {
    const cursor = textareaRef.current?.selectionStart ?? text.length
    const before = text.slice(0, cursor)
    const after = text.slice(cursor)
    const atIndex = before.lastIndexOf('@')
    const newText = before.slice(0, atIndex) + `@${name} ` + after
    setText(newText)
    setMentionQuery(null)
    textareaRef.current?.focus()
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault()
      handleAdd()
    }
    if (e.key === 'Escape' && mentionQuery !== null) {
      setMentionQuery(null)
    }
  }

  function handleAdd() {
    if (!text.trim()) return
    onAdd(currentUser || 'Anonymous', text.trim())
    setText('')
    setMentionQuery(null)
  }

  return (
    <div>
      <h3 className="font-semibold text-slate-300 mb-3">Comments</h3>

      {comments.length === 0 && (
        <p className="text-sm text-slate-600 mb-3">No comments yet.</p>
      )}

      <ul className="space-y-3 mb-4">
        {comments.map(c => (
          <li key={c.id} className="flex gap-3 group">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${avatarColor(c.author)}`}>
              {c.author.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex items-baseline gap-2 mb-0.5">
                <span className="text-sm font-medium text-slate-200">{c.author}</span>
                <span className="text-xs text-slate-500">{timeAgo(c.createdAt)}</span>
                {onConvertToSubtask && (
                  <button
                    onClick={() => onConvertToSubtask(c.text)}
                    title="Convert to subtask"
                    className="opacity-0 group-hover:opacity-100 ml-auto text-xs text-violet-400 hover:text-violet-300 hover:bg-violet-900/40 px-1.5 py-0.5 rounded transition-all"
                  >
                    + subtask
                  </button>
                )}
              </div>
              <p className="text-sm text-slate-400 whitespace-pre-wrap leading-relaxed">
                {renderCommentText(c.text, knownUsers)}
              </p>
            </div>
          </li>
        ))}
      </ul>

      <div className="relative space-y-2">
        {suggestions.length > 0 && (
          <div className="absolute bottom-full mb-1 left-0 right-12 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-10">
            {suggestions.map(name => (
              <button
                key={name}
                onMouseDown={e => { e.preventDefault(); insertMention(name) }}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-700 text-left transition-colors"
              >
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${avatarColor(name)}`}>
                  {name.charAt(0).toUpperCase()}
                </span>
                <span className="text-sm text-slate-300">{name}</span>
              </button>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder={`Comment as ${currentUser}… type @ to mention (Ctrl+Enter to post)`}
            rows={2}
            className="flex-1 text-sm bg-slate-800 border border-slate-700 text-slate-300 placeholder:text-slate-600 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
          />
          <button
            onClick={handleAdd}
            className="text-sm bg-violet-600 text-white hover:bg-violet-500 rounded-lg px-4 font-medium transition-colors self-end pb-1.5 pt-1.5"
          >
            Post
          </button>
        </div>
      </div>
    </div>
  )
}
