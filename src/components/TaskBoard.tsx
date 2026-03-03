import { useState } from 'react'
import type { Task, Status } from '../types'
import { TaskCard } from './TaskCard'
import { TaskForm } from './TaskForm'

const COLUMNS: { status: Status; label: string; color: string; dot: string }[] = [
  { status: 'todo',        label: 'Todo',        color: 'border-t-gray-400', dot: 'bg-gray-400' },
  { status: 'in-progress', label: 'In Progress', color: 'border-t-blue-500', dot: 'bg-blue-500' },
  { status: 'done',        label: 'Done',        color: 'border-t-green-500',dot: 'bg-green-500'},
]

interface Props {
  tasks: Task[]
  onCardClick: (task: Task) => void
  onAddTask: (fields: { title: string; description: string; status: Status; priority: 'low' | 'medium' | 'high'; assignees: string[] }) => void
  onStatusDrop: (taskId: string, status: Status) => void
}

export function TaskBoard({ tasks, onCardClick, onAddTask, onStatusDrop }: Props) {
  const [addingIn, setAddingIn] = useState<Status | null>(null)
  const [dragOver, setDragOver] = useState<Status | null>(null)

  function handleDragStart(e: React.DragEvent, taskId: string) {
    e.dataTransfer.setData('taskId', taskId)
  }

  function handleDrop(e: React.DragEvent, status: Status) {
    e.preventDefault()
    const taskId = e.dataTransfer.getData('taskId')
    if (taskId) onStatusDrop(taskId, status)
    setDragOver(null)
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 flex-1">
      {COLUMNS.map(col => {
        const colTasks = tasks.filter(t => t.status === col.status)
        return (
          <div
            key={col.status}
            className={`flex flex-col min-w-64 w-64 shrink-0 bg-gray-50 rounded-2xl border-t-4 ${col.color} transition-colors ${dragOver === col.status ? 'bg-purple-50 ring-2 ring-purple-300' : ''}`}
            onDragOver={e => { e.preventDefault(); setDragOver(col.status) }}
            onDragLeave={() => setDragOver(null)}
            onDrop={e => handleDrop(e, col.status)}
          >
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${col.dot}`} />
                <span className="text-sm font-semibold text-gray-700">{col.label}</span>
                <span className="text-xs text-gray-400 bg-gray-200 rounded-full px-1.5 py-0.5 leading-none">
                  {colTasks.length}
                </span>
              </div>
              <button
                onClick={() => setAddingIn(col.status)}
                className="text-gray-400 hover:text-purple-500 text-lg leading-none transition-colors"
                title="Add task"
              >
                +
              </button>
            </div>

            <div className="flex flex-col gap-2 px-3 pb-3 flex-1 overflow-y-auto max-h-[calc(100vh-260px)]">
              {addingIn === col.status && (
                <div className="bg-white rounded-xl border border-purple-200 p-3 shadow-sm">
                  <TaskForm
                    defaultStatus={col.status}
                    onSubmit={fields => {
                      onAddTask(fields)
                      setAddingIn(null)
                    }}
                    onCancel={() => setAddingIn(null)}
                  />
                </div>
              )}
              {colTasks.map(task => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={e => handleDragStart(e, task.id)}
                >
                  <TaskCard task={task} onClick={() => onCardClick(task)} />
                </div>
              ))}
              {colTasks.length === 0 && addingIn !== col.status && (
                <div className="text-center text-xs text-gray-300 py-6">
                  Drag tasks here or click +
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
