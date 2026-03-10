import { useState, useEffect } from 'react'
import type { Task, Status } from '../types'
import { TaskCard } from './TaskCard'
import { TaskForm } from './TaskForm'

const COLUMNS: { status: Status; label: string; color: string; dot: string; tabActive: string }[] = [
  { status: 'todo',        label: 'Todo',        color: 'border-t-slate-500',   dot: 'bg-slate-500',   tabActive: 'border-slate-400 text-slate-300'   },
  { status: 'in-progress', label: 'In Progress', color: 'border-t-violet-500',  dot: 'bg-violet-500',  tabActive: 'border-violet-500 text-violet-400'  },
  { status: 'done',        label: 'Done',        color: 'border-t-emerald-500', dot: 'bg-emerald-500', tabActive: 'border-emerald-500 text-emerald-400' },
]

interface Props {
  tasks: Task[]
  triggerAdd?: number
  onCardClick: (task: Task) => void
  onAddTask: (fields: { title: string; description: string; status: Status; priority: 'low' | 'medium' | 'high'; assignees: string[]; tags: string[]; dueDate?: string }) => void
  onReorder: (taskId: string, beforeTaskId: string | null, targetStatus: Status) => void
}

export function TaskBoard({ tasks, triggerAdd, onCardClick, onAddTask, onReorder }: Props) {
  const [addingIn, setAddingIn] = useState<Status | null>(null)
  const [mobileTab, setMobileTab] = useState<Status>('todo')
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dragOverCardId, setDragOverCardId] = useState<string | null>(null)
  const [dragOverStatus, setDragOverStatus] = useState<Status | null>(null)

  useEffect(() => {
    if (triggerAdd) setAddingIn(mobileTab)
  }, [triggerAdd])

  function handleDragEnd() {
    setDraggedId(null)
    setDragOverCardId(null)
    setDragOverStatus(null)
  }

  function handleColumnDrop(e: React.DragEvent, status: Status) {
    e.preventDefault()
    const taskId = e.dataTransfer.getData('taskId')
    if (taskId) onReorder(taskId, null, status)
    handleDragEnd()
  }

  function handleCardDrop(e: React.DragEvent, beforeTaskId: string, status: Status) {
    e.preventDefault()
    e.stopPropagation()
    const taskId = e.dataTransfer.getData('taskId')
    if (taskId && taskId !== beforeTaskId) onReorder(taskId, beforeTaskId, status)
    handleDragEnd()
  }

  function renderCards(col: typeof COLUMNS[0], colTasks: Task[]) {
    return (
      <div className="flex flex-col gap-2 px-3 pb-3 flex-1 overflow-y-auto max-h-[calc(100vh-260px)]">
        {addingIn === col.status && (
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-3 shadow-sm">
            <TaskForm
              defaultStatus={col.status}
              onSubmit={fields => { onAddTask(fields); setAddingIn(null) }}
              onCancel={() => setAddingIn(null)}
            />
          </div>
        )}
        {colTasks.map(task => (
          <div
            key={task.id}
            draggable
            onDragStart={e => { e.dataTransfer.setData('taskId', task.id); setDraggedId(task.id) }}
            onDragEnd={handleDragEnd}
            onDragOver={e => { e.preventDefault(); e.stopPropagation(); setDragOverCardId(task.id); setDragOverStatus(col.status) }}
            onDragLeave={() => setDragOverCardId(null)}
            onDrop={e => handleCardDrop(e, task.id, col.status)}
            className={`border-t-2 transition-colors ${dragOverCardId === task.id && draggedId !== task.id ? 'border-blue-400' : 'border-transparent'}`}
          >
            <TaskCard task={task} onClick={() => onCardClick(task)} />
          </div>
        ))}
        {colTasks.length === 0 && addingIn !== col.status && (
          <div className="text-center text-xs text-slate-600 py-6">
            Tap + to add a task
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      {/* ── Mobile: tabbed single-column ── */}
      <div className="flex flex-col flex-1 sm:hidden">
        {/* Tab bar */}
        <div className="flex border-b border-slate-800 mb-3 shrink-0">
          {COLUMNS.map(col => {
            const count = tasks.filter(t => t.status === col.status).length
            const active = mobileTab === col.status
            return (
              <button
                key={col.status}
                onClick={() => setMobileTab(col.status)}
                className={`flex-1 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
                  active ? col.tabActive : 'border-transparent text-slate-600'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                {col.label}
                <span className={`text-xs rounded-full px-1.5 leading-none py-0.5 ${active ? 'bg-slate-700 text-slate-300' : 'bg-slate-800 text-slate-500'}`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Active column */}
        {COLUMNS.filter(col => col.status === mobileTab).map(col => {
          const colTasks = tasks.filter(t => t.status === col.status)
          return (
            <div key={col.status} className="flex flex-col flex-1 bg-slate-900 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-sm font-semibold text-slate-300">{col.label}</span>
                <button
                  onClick={() => setAddingIn(col.status)}
                  className="text-slate-600 hover:text-violet-400 text-lg leading-none transition-colors"
                  title="Add task"
                >
                  +
                </button>
              </div>
              {renderCards(col, colTasks)}
            </div>
          )
        })}
      </div>

      {/* ── Desktop: side-by-side columns ── */}
      <div className="hidden sm:flex gap-4 overflow-x-auto pb-4 flex-1">
        {COLUMNS.map(col => {
          const colTasks = tasks.filter(t => t.status === col.status)
          return (
            <div
              key={col.status}
              className={`flex flex-col flex-1 min-w-56 bg-slate-900 rounded-2xl border-t-4 ${col.color} transition-colors ${dragOverStatus === col.status && !dragOverCardId ? 'bg-violet-950/30 ring-2 ring-violet-700/50' : ''}`}
              onDragOver={e => { e.preventDefault(); setDragOverStatus(col.status) }}
              onDragLeave={e => {
                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                  setDragOverStatus(null)
                  setDragOverCardId(null)
                }
              }}
              onDrop={e => handleColumnDrop(e, col.status)}
            >
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${col.dot}`} />
                  <span className="text-sm font-semibold text-slate-300">{col.label}</span>
                  <span className="text-xs text-slate-500 bg-slate-800 rounded-full px-1.5 py-0.5 leading-none">
                    {colTasks.length}
                  </span>
                </div>
                <button
                  onClick={() => setAddingIn(col.status)}
                  className="text-slate-600 hover:text-violet-400 text-lg leading-none transition-colors"
                  title="Add task"
                >
                  +
                </button>
              </div>
              {renderCards(col, colTasks)}
            </div>
          )
        })}
      </div>
    </>
  )
}
