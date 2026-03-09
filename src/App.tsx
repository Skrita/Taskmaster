import { useState, useMemo } from 'react'
import { useMsal, AuthenticatedTemplate, UnauthenticatedTemplate } from '@azure/msal-react'
import { useTaskStore } from './hooks/useTaskStore'
import { FilterBar } from './components/FilterBar'
import { TaskBoard } from './components/TaskBoard'
import { TaskModal } from './components/TaskModal'
import { LoginPage } from './components/LoginPage'
import { ProfileSetup } from './components/ProfileSetup'
import type { Task, Status, FilterState } from './types'

function TaskApp() {
  const { accounts, instance } = useMsal()
  const account = accounts[0]
  const email = account?.username ?? ''

  const profileKey = `taskmaster-profile-${email}`
  const savedUsername = localStorage.getItem(profileKey)
  const [username, setUsername] = useState<string | null>(savedUsername)

  const store = useTaskStore()
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [filter, setFilter] = useState<FilterState>({
    search: '',
    status: 'all',
    assignee: '',
    priority: 'all',
    tag: '',
  })

  function handleProfileSave(name: string) {
    localStorage.setItem(profileKey, name)
    setUsername(name)
  }

  function handleLogout() {
    instance.logoutRedirect()
  }

  if (!username) {
    return <ProfileSetup email={email} onSave={handleProfileSave} />
  }

  if (store.loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-400 text-sm">Loading tasks...</div>
      </div>
    )
  }

  const liveSelectedTask = selectedTask
    ? store.tasks.find(t => t.id === selectedTask.id) ?? null
    : null

  const assignees = useMemo(
    () => [...new Set(store.tasks.flatMap(t => t.assignees).filter(Boolean))].sort(),
    [store.tasks]
  )

  const allTags = useMemo(
    () => [...new Set(store.tasks.flatMap(t => t.tags).filter(Boolean))].sort(),
    [store.tasks]
  )

  const filtered = useMemo(() => {
    const q = filter.search.toLowerCase()
    return store.tasks.filter(t => {
      if (filter.status !== 'all' && t.status !== filter.status) return false
      if (filter.priority !== 'all' && t.priority !== filter.priority) return false
      if (filter.assignee && !t.assignees.includes(filter.assignee)) return false
      if (filter.tag && !t.tags.includes(filter.tag)) return false
      if (q && !t.title.toLowerCase().includes(q) && !t.description.toLowerCase().includes(q)) return false
      return true
    })
  }, [store.tasks, filter])

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">T</div>
          <h1 className="text-lg font-bold text-gray-900">TaskmAIster</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 text-sm text-gray-400">
            <span>{store.tasks.length} tasks</span>
            <span>·</span>
            <span>{store.tasks.filter(t => t.status === 'done').length} done</span>
          </div>
          <div className="flex items-center gap-2 border-l border-gray-200 pl-4">
            <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold">
              {username.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-medium text-gray-700">{username}</span>
            <button
              onClick={handleLogout}
              className="text-xs text-gray-400 hover:text-gray-600 ml-1 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="px-6 py-3 shrink-0">
        <FilterBar filter={filter} assignees={assignees} tags={allTags} onChange={setFilter} />
      </div>

      <main className="flex-1 px-6 pb-6 flex overflow-hidden">
        <TaskBoard
          tasks={filtered}
          onCardClick={task => setSelectedTask(task)}
          onAddTask={fields => store.addTask(fields)}
          onStatusDrop={(taskId, status: Status) => store.updateTask(taskId, { status })}
        />
      </main>

      {liveSelectedTask && (
        <TaskModal
          task={liveSelectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={store.updateTask}
          onDelete={store.deleteTask}
          onAddSubtask={store.addSubtask}
          onToggleSubtask={store.toggleSubtask}
          onDeleteSubtask={store.deleteSubtask}
          onAddComment={store.addComment}
        />
      )}
    </div>
  )
}

export default function App() {
  // Handle redirect callback (MSAL stores state during redirect)
  const { instance } = useMsal()
  useMemo(() => {
    instance.handleRedirectPromise().catch(() => {})
  }, [instance])

  return (
    <>
      <AuthenticatedTemplate>
        <TaskApp />
      </AuthenticatedTemplate>
      <UnauthenticatedTemplate>
        <LoginPage />
      </UnauthenticatedTemplate>
    </>
  )
}
