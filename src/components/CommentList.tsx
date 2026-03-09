import { useState } from 'react'
import type { Comment } from '../types'

interface Props {
  comments: Comment[]
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

export function CommentList({ comments, onAdd, onConvertToSubtask }: Props) {
  const [author, setAuthor] = useState('')
  const [text, setText] = useState('')

  function handleAdd() {
    if (!text.trim()) return
    onAdd(author.trim() || 'Anonymous', text.trim())
    setText('')
  }

  return (
    <div>
      <h3 className="font-semibold text-gray-700 mb-3">Comments</h3>

      {comments.length === 0 && (
        <p className="text-sm text-gray-400 mb-3">No comments yet.</p>
      )}

      <ul className="space-y-3 mb-4">
        {comments.map(c => (
          <li key={c.id} className="flex gap-3 group">
            <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0">
              {c.author.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex items-baseline gap-2 mb-0.5">
                <span className="text-sm font-medium text-gray-800">{c.author}</span>
                <span className="text-xs text-gray-400">{timeAgo(c.createdAt)}</span>
                {onConvertToSubtask && (
                  <button
                    onClick={() => onConvertToSubtask(c.text)}
                    title="Convert to subtask"
                    className="opacity-0 group-hover:opacity-100 ml-auto text-xs text-blue-500 hover:text-blue-700 hover:bg-blue-50 px-1.5 py-0.5 rounded transition-all"
                  >
                    + subtask
                  </button>
                )}
              </div>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{c.text}</p>
            </div>
          </li>
        ))}
      </ul>

      <div className="space-y-2">
        <input
          type="text"
          value={author}
          onChange={e => setAuthor(e.target.value)}
          placeholder="Your name (optional)"
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <div className="flex gap-2">
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) handleAdd() }}
            placeholder="Write a comment... (Ctrl+Enter to submit)"
            rows={2}
            className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
          />
          <button
            onClick={handleAdd}
            className="text-sm bg-blue-500 text-white hover:bg-blue-600 rounded-lg px-4 font-medium transition-colors self-end pb-1.5 pt-1.5"
          >
            Post
          </button>
        </div>
      </div>
    </div>
  )
}
