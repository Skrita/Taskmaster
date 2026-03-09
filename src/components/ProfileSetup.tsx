import { useState } from 'react'

interface Props {
  email: string
  onSave: (username: string) => void
}

export function ProfileSetup({ email, onSave }: Props) {
  const defaultName = email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  const [username, setUsername] = useState(defaultName)

  function handleSave() {
    const trimmed = username.trim()
    if (!trimmed) return
    onSave(trimmed)
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-10 w-full max-w-sm">
        <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">T</div>
        <h2 className="text-xl font-bold text-gray-900 text-center mb-1">Set up your profile</h2>
        <p className="text-sm text-gray-400 text-center mb-6">Just once — choose a display name</p>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-400 block mb-1">Email</label>
            <p className="text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2">{email}</p>
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Display name</label>
            <input
              autoFocus
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSave()}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>
          <button
            onClick={handleSave}
            disabled={!username.trim()}
            className="w-full bg-purple-500 hover:bg-purple-600 disabled:opacity-40 text-white font-medium py-2.5 rounded-lg transition-colors"
          >
            Get started
          </button>
        </div>
      </div>
    </div>
  )
}
