import { useState } from 'react'

type Category = 'bug' | 'suggestion' | 'other'

interface Props {
  currentUser: string
  onClose: () => void
  onSubmit: (category: Category, message: string) => Promise<void>
}

const CATEGORIES: { value: Category; label: string; icon: string }[] = [
  { value: 'bug',        label: 'Bug',        icon: '🐛' },
  { value: 'suggestion', label: 'Suggestion',  icon: '💡' },
  { value: 'other',      label: 'Other',       icon: '💬' },
]

export function FeedbackModal({ currentUser, onClose, onSubmit }: Props) {
  const [category, setCategory] = useState<Category>('suggestion')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!message.trim()) return
    setSubmitting(true)
    try {
      await onSubmit(category, message.trim())
      setDone(true)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 sm:bg-black/70 sm:flex sm:items-center sm:justify-center sm:p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-slate-900 sm:rounded-2xl shadow-2xl shadow-black/60 w-full sm:max-w-md border border-slate-800 flex flex-col">
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-800">
          <h2 className="text-base font-bold text-white">Leave feedback</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 text-xl leading-none">✕</button>
        </div>

        {done ? (
          <div className="px-6 py-10 text-center">
            <div className="text-3xl mb-3">🙏</div>
            <p className="text-slate-300 font-medium mb-1">Thanks, {currentUser}!</p>
            <p className="text-sm text-slate-500">Your feedback has been recorded.</p>
            <button
              onClick={onClose}
              className="mt-6 text-sm bg-violet-600 text-white px-5 py-2 rounded-lg hover:bg-violet-500 transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            <div className="flex gap-2">
              {CATEGORIES.map(c => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setCategory(c.value)}
                  className={`flex-1 flex items-center justify-center gap-1.5 text-sm py-2 rounded-lg border transition-colors ${
                    category === c.value
                      ? 'bg-violet-900/60 border-violet-700 text-violet-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  <span>{c.icon}</span>
                  <span>{c.label}</span>
                </button>
              ))}
            </div>

            <textarea
              autoFocus
              required
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder={
                category === 'bug'
                  ? 'Describe what went wrong and how to reproduce it…'
                  : category === 'suggestion'
                  ? 'What would you like to see improved or added?'
                  : 'What\'s on your mind?'
              }
              rows={5}
              className="w-full text-sm bg-slate-800 border border-slate-700 text-slate-300 placeholder:text-slate-600 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
            />

            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                disabled={submitting || !message.trim()}
                className="flex-1 bg-violet-600 text-white text-sm font-medium py-2 rounded-lg hover:bg-violet-500 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Sending…' : 'Send feedback'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 text-sm text-slate-500 py-2 rounded-lg hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
