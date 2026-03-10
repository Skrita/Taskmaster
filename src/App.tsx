import { useState, useMemo, useRef, useEffect } from 'react'
import { useMsal, AuthenticatedTemplate, UnauthenticatedTemplate } from '@azure/msal-react'
import { useTaskStore } from './hooks/useTaskStore'
import { FilterBar } from './components/FilterBar'
import { TaskBoard } from './components/TaskBoard'
import { TaskModal } from './components/TaskModal'
import { LoginPage } from './components/LoginPage'
import { ProfileSetup } from './components/ProfileSetup'
import { ActivityPanel } from './components/ActivityPanel'
import { AVATAR_COLOR_OPTIONS, avatarColor } from './components/AssigneeInput'
import type { Task, FilterState } from './types'

function TaskApp() {
  const { accounts, instance } = useMsal()
  const account = accounts[0]
  const email = account?.username ?? ''

  const profileKey = `taskmaster-profile-${email}`
  const savedUsername = localStorage.getItem(profileKey) ?? (import.meta.env.DEV ? 'Dev' : null)
  const [username, setUsername] = useState<string | null>(savedUsername)

  const store = useTaskStore(username ?? '')
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [showActivity, setShowActivity] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [, setColorVersion] = useState(0)
  const [triggerAdd, setTriggerAdd] = useState(0)
  const colorPickerRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (colorPickerRef.current && !colorPickerRef.current.contains(e.target as Node)) {
        setShowColorPicker(false)
      }
    }
    if (showColorPicker) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showColorPicker])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable

      if (e.key === 'Escape') {
        if (selectedTask) setSelectedTask(null)
        else if (showActivity) setShowActivity(false)
        else if (showColorPicker) setShowColorPicker(false)
        return
      }
      if (isInput) return
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault()
        setTriggerAdd(v => v + 1)
      }
      if (e.key === '/') {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [selectedTask, showActivity, showColorPicker])
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

  const liveSelectedTask = selectedTask
    ? store.tasks.find(t => t.id === selectedTask.id) ?? null
    : null

  const assignees = useMemo(
    () => [...new Set(store.tasks.flatMap(t => t.assignees).filter(Boolean))].sort(),
    [store.tasks]
  )

  const knownUsers = useMemo(
    () => [...new Set([
      ...store.tasks.flatMap(t => t.assignees),
      ...store.tasks.flatMap(t => t.comments.map(c => c.author)),
      ...(username ? [username] : []),
    ].filter(Boolean))].sort(),
    [store.tasks, username]
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

  if (!username) {
    return <ProfileSetup email={email} onSave={handleProfileSave} />
  }

  if (store.loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-slate-500 text-sm">Loading tasks...</div>
      </div>
    )
  }

  function handleActivityTaskClick(taskId: string) {
    const task = store.tasks.find(t => t.id === taskId)
    if (task) {
      setSelectedTask(task)
      setShowActivity(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <header className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-violet-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-violet-900/40">T</div>
          <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">TaskmAIster</h1>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden sm:flex items-center gap-3 text-sm text-slate-500">
            <span>{store.tasks.length} tasks</span>
            <span>·</span>
            <span>{store.tasks.filter(t => t.status === 'done').length} done</span>
          </div>
          <button
            onClick={() => setShowActivity(v => !v)}
            className={`flex items-center gap-1.5 text-sm px-2.5 py-1.5 rounded-lg transition-colors ${
              showActivity
                ? 'bg-violet-900/60 text-violet-300'
                : 'text-slate-400 hover:bg-slate-800'
            }`}
            title="Activity log"
          >
            <span className="text-base leading-none">⚡</span>
            <span className="hidden sm:inline">Activity</span>
            {store.activities.length > 0 && (
              <span className="bg-violet-600 text-white text-xs rounded-full px-1.5 py-0.5 leading-none min-w-5 text-center">
                {store.activities.length > 99 ? '99+' : store.activities.length}
              </span>
            )}
          </button>
          <div className="flex items-center gap-2 border-l border-slate-800 pl-3 sm:pl-4">
            <div className="relative" ref={colorPickerRef}>
              <button
                onClick={() => setShowColorPicker(v => !v)}
                className={`text-xs font-bold px-2 py-0.5 rounded-full transition-colors ${username ? avatarColor(username) : ''}`}
                title="Choose your colour"
              >
                <span className="sm:hidden">{username.charAt(0).toUpperCase()}</span>
                <span className="hidden sm:inline">{username.charAt(0).toUpperCase()}{username.slice(1)}</span>
              </button>
              {showColorPicker && (
                <div className="absolute right-0 top-full mt-1.5 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-3 z-50 w-48">
                  <p className="text-xs text-slate-400 mb-2 font-medium">Your colour</p>
                  <div className="grid grid-cols-4 gap-1.5">
                    {AVATAR_COLOR_OPTIONS.map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => {
                          localStorage.setItem(`taskmaster-color-${username}`, opt.id)
                          setColorVersion(v => v + 1)
                          setShowColorPicker(false)
                        }}
                        className={`text-xs font-bold px-1.5 py-1 rounded-full ${opt.classes} ring-2 ${
                          localStorage.getItem(`taskmaster-color-${username}`) === opt.id
                            ? 'ring-slate-400'
                            : 'ring-transparent'
                        } hover:ring-slate-500 transition-all`}
                        title={opt.id}
                      >
                        {username.charAt(0).toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="px-3 sm:px-6 py-2 sm:py-3 shrink-0">
        <FilterBar filter={filter} assignees={assignees} tags={allTags} onChange={setFilter} searchRef={searchInputRef} />
      </div>

      <main className="flex-1 px-3 sm:px-6 pb-4 sm:pb-6 flex overflow-hidden">
        <TaskBoard
          tasks={filtered}
          triggerAdd={triggerAdd}
          onCardClick={task => setSelectedTask(task)}
          onAddTask={fields => store.addTask(fields)}
          onReorder={(taskId, beforeTaskId, status) => store.reorderTask(taskId, beforeTaskId, status)}
        />
      </main>

      {liveSelectedTask && (
        <TaskModal
          task={liveSelectedTask}
          knownUsers={knownUsers}
          currentUser={username}
          onClose={() => setSelectedTask(null)}
          onUpdate={store.updateTask}
          onDelete={store.deleteTask}
          onAddSubtask={store.addSubtask}
          onToggleSubtask={store.toggleSubtask}
          onDeleteSubtask={store.deleteSubtask}
          onAddComment={store.addComment}
        />
      )}

      {showActivity && (
        <ActivityPanel
          activities={store.activities}
          onClose={() => setShowActivity(false)}
          onTaskClick={handleActivityTaskClick}
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

  if (import.meta.env.DEV) {
    return <TaskApp />
  }

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
