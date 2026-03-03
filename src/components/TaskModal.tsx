import { useState, useEffect } from 'react'
import type { Task, Status, Priority } from '../types'
import { SubtaskList } from './SubtaskList'
import { CommentList } from './CommentList'
import { AssigneeInput } from './AssigneeInput'

const STATUS_LABELS: Record<Status, string> = {
  todo: 'Todo',
  'in-progress': 'In Progress',
  done: 'Done',
}

const PRIORITY_COLORS: Record<Priority, string> = {
  high: 'text-red-600 bg-red-50',
  medium: 'text-yellow-600 bg-yellow-50',
  low: 'text-green-600 bg-green-50',
}

interface Props {
  task: Task
  onClose: () => void
  onUpdate: (id: string, fields: Partial<Task>) => void
  onDelete: (id: string) => void
  onAddSubtask: (taskId: string, title: string) => void
  onToggleSubtask: (taskId: string, subtaskId: string) => void
  onDeleteSubtask: (taskId: string, subtaskId: string) => void
  onAddComment: (taskId: string, author: string, text: string) => void
}

export function TaskModal({
  task,
  onClose,
  onUpdate,
  onDelete,
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask,
  onAddComment,
}: Props) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description)
  const [assignees, setAssignees] = useState<string[]>(task.assignees)
  const [status, setStatus] = useState<Status>(task.status)
  const [priority, setPriority] = useState<Priority>(task.priority)

  useEffect(() => {
    if (!editing) {
      setTitle(task.title)
      setDescription(task.description)
      setAssignees(task.assignees)
      setStatus(task.status)
      setPriority(task.priority)
    }
  }, [task, editing])

  function handleSave() {
    if (!title.trim()) return
    onUpdate(task.id, { title: title.trim(), description, assignees, status, priority })
    setEditing(false)
  }

  function handleStatusChange(s: Status) {
    setStatus(s)
    onUpdate(task.id, { status: s })
  }

  function handlePriorityChange(p: Priority) {
    setPriority(p)
    onUpdate(task.id, { priority: p })
  }

  function handleDelete() {
    if (window.confirm('Delete this task?')) {
      onDelete(task.id)
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-5 pb-3 border-b border-gray-100">
          <div className="flex-1 mr-4">
            {editing ? (
              <input
                autoFocus
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full text-lg font-bold text-gray-900 border-b-2 border-purple-400 focus:outline-none pb-0.5"
              />
            ) : (
              <h2 className="text-lg font-bold text-gray-900">{task.title}</h2>
            )}
            <p className="text-xs text-gray-400 mt-0.5">
              Created {new Date(task.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex gap-2 items-center shrink-0">
            {editing ? (
              <>
                <button onClick={handleSave} className="text-sm bg-purple-500 text-white px-3 py-1.5 rounded-lg hover:bg-purple-600 font-medium transition-colors">Save</button>
                <button onClick={() => setEditing(false)} className="text-sm text-gray-500 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">Cancel</button>
              </>
            ) : (
              <button onClick={() => setEditing(true)} className="text-sm text-gray-500 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">Edit</button>
            )}
            <button onClick={handleDelete} className="text-sm text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors">Delete</button>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none ml-1">✕</button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-5">
          {/* Meta row */}
          <div className="flex flex-wrap gap-3">
            <div>
              <label className="text-xs text-gray-400 block mb-1">Status</label>
              <select
                value={status}
                onChange={e => handleStatusChange(e.target.value as Status)}
                className="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                {(Object.keys(STATUS_LABELS) as Status[]).map(s => (
                  <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-400 block mb-1">Priority</label>
              {editing ? (
                <select
                  value={priority}
                  onChange={e => handlePriorityChange(e.target.value as Priority)}
                  className="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-purple-400"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              ) : (
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${PRIORITY_COLORS[task.priority]}`}>
                  {task.priority}
                </span>
              )}
            </div>
          </div>

          {/* Assignees */}
          <div>
            <label className="text-xs text-gray-400 block mb-1">Assignees</label>
            {editing ? (
              <AssigneeInput assignees={assignees} onChange={setAssignees} />
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {task.assignees.length === 0
                  ? <span className="text-sm text-gray-300">None</span>
                  : task.assignees.map(name => (
                      <span key={name} className="text-xs font-medium px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                        {name}
                      </span>
                    ))
                }
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="text-xs text-gray-400 block mb-1">Description</label>
            {editing ? (
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
              />
            ) : (
              <p className="text-sm text-gray-700 whitespace-pre-wrap min-h-6">
                {task.description || <span className="text-gray-300">No description</span>}
              </p>
            )}
          </div>

          <hr className="border-gray-100" />

          <SubtaskList
            subtasks={task.subtasks}
            onAdd={title => onAddSubtask(task.id, title)}
            onToggle={sid => onToggleSubtask(task.id, sid)}
            onDelete={sid => onDeleteSubtask(task.id, sid)}
          />

          <hr className="border-gray-100" />

          <CommentList
            comments={task.comments}
            onAdd={(author, text) => onAddComment(task.id, author, text)}
          />
        </div>
      </div>
    </div>
  )
}
