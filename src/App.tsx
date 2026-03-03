import { useState, useMemo } from 'react'
import { useTaskStore } from './hooks/useTaskStore'
import { FilterBar } from './components/FilterBar'
import { TaskBoard } from './components/TaskBoard'
import { TaskModal } from './components/TaskModal'
import type { Task, Status, FilterState } from './types'

export default function App() {
  const store = useTaskStore()
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [filter, setFilter] = useState<FilterState>({
    search: '',
    status: 'all',
    assignee: '',
    priority: 'all',
  })

  const liveSelectedTask = selectedTask
    ? store.tasks.find(t => t.id === selectedTask.id) ?? null
    : null

  const assignees = useMemo(
    () => [...new Set(store.tasks.flatMap(t => t.assignees).filter(Boolean))].sort(),
    [store.tasks]
  )

  const filtered = useMemo(() => {
    const q = filter.search.toLowerCase()
    return store.tasks.filter(t => {
      if (filter.status !== 'all' && t.status !== filter.status) return false
      if (filter.priority !== 'all' && t.priority !== filter.priority) return false
      if (filter.assignee && !t.assignees.includes(filter.assignee)) return false
      if (q && !t.title.toLowerCase().includes(q) && !t.description.toLowerCase().includes(q)) return false
      return true
    })
  }, [store.tasks, filter])

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">T</div>
          <h1 className="text-lg font-bold text-gray-900">
            TaskmAister
          </h1>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-400">
          <span>{store.tasks.length} tasks</span>
          <span>·</span>
          <span>{store.tasks.filter(t => t.status === 'done').length} done</span>
        </div>
      </header>

      {/* Filter bar */}
      <div className="px-6 py-3 shrink-0">
        <FilterBar filter={filter} assignees={assignees} onChange={setFilter} />
      </div>

      {/* Board */}
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
