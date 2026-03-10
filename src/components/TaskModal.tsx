import { useState, useEffect } from 'react'
import type { Task, Status, Priority } from '../types'
import { SubtaskList } from './SubtaskList'
import { CommentList } from './CommentList'
import { AssigneeInput, avatarColor } from './AssigneeInput'
import { tagColor } from './TaskCard'

const STATUS_LABELS: Record<Status, string> = {
  todo: 'Todo',
  'in-progress': 'In Progress',
  done: 'Done',
}

const PRIORITY_COLORS: Record<Priority, string> = {
  high: 'text-red-400 bg-red-950/40',
  medium: 'text-yellow-400 bg-yellow-950/40',
  low: 'text-emerald-400 bg-emerald-950/40',
}

interface Props {
  task: Task
  knownUsers: string[]
  currentUser: string
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
  knownUsers,
  currentUser,
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
  const [tags, setTags] = useState<string[]>(task.tags)
  const [tagInput, setTagInput] = useState('')
  const [dueDate, setDueDate] = useState(task.dueDate ?? '')
  const [status, setStatus] = useState<Status>(task.status)
  const [priority, setPriority] = useState<Priority>(task.priority)

  useEffect(() => {
    if (!editing) {
      setTitle(task.title)
      setDescription(task.description)
      setAssignees(task.assignees)
      setTags(task.tags)
      setDueDate(task.dueDate ?? '')
      setStatus(task.status)
      setPriority(task.priority)
    }
  }, [task, editing])

  function handleSave() {
    if (!title.trim()) return
    onUpdate(task.id, {
      title: title.trim(),
      description,
      assignees,
      tags,
      dueDate: dueDate || undefined,
      status,
      priority,
    })
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

  function addTag(raw: string) {
    const tag = raw.trim()
    if (!tag || tags.includes(tag)) return
    setTags(prev => [...prev, tag])
    setTagInput('')
  }

  function removeTag(tag: string) {
    setTags(prev => prev.filter(t => t !== tag))
  }

  return (
    <div
      className="fixed inset-0 z-50 sm:bg-black/70 sm:flex sm:items-center sm:justify-center sm:p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-slate-900 sm:rounded-2xl shadow-2xl shadow-black/60 w-full sm:max-w-2xl h-full sm:h-auto sm:max-h-[90vh] flex flex-col border border-slate-800">
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-5 pb-3 border-b border-slate-800">
          <div className="flex-1 mr-4">
            {editing ? (
              <input
                autoFocus
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full text-lg font-bold text-white bg-transparent border-b-2 border-violet-500 focus:outline-none pb-0.5"
              />
            ) : (
              <h2 className="text-lg font-bold text-white">{task.title}</h2>
            )}
            <p className="text-xs text-slate-500 mt-0.5">
              Created {new Date(task.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex gap-2 items-center shrink-0">
            {editing ? (
              <>
                <button onClick={handleSave} className="text-sm bg-violet-600 text-white px-3 py-1.5 rounded-lg hover:bg-violet-500 font-medium transition-colors">Save</button>
                <button onClick={() => setEditing(false)} className="text-sm text-slate-400 px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors">Cancel</button>
              </>
            ) : (
              <button onClick={() => setEditing(true)} className="text-sm text-slate-400 px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors">Edit</button>
            )}
            <button onClick={handleDelete} className="text-sm text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-950/40 transition-colors">Delete</button>
            <button onClick={onClose} className="text-slate-500 hover:text-slate-300 text-xl leading-none ml-1">✕</button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-5">
          {/* Meta row */}
          <div className="flex flex-wrap gap-3">
            <div>
              <label className="text-xs text-slate-500 block mb-1">Status</label>
              <select
                value={status}
                onChange={e => handleStatusChange(e.target.value as Status)}
                className="text-sm bg-slate-800 border border-slate-700 text-slate-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                {(Object.keys(STATUS_LABELS) as Status[]).map(s => (
                  <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-500 block mb-1">Priority</label>
              {editing ? (
                <select
                  value={priority}
                  onChange={e => handlePriorityChange(e.target.value as Priority)}
                  className="text-sm bg-slate-800 border border-slate-700 text-slate-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-violet-500"
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

            <div>
              <label className="text-xs text-slate-500 block mb-1">Due date</label>
              {editing ? (
                <input
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="text-sm bg-slate-800 border border-slate-700 text-slate-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              ) : (
                <span className="text-sm text-slate-400">
                  {task.dueDate
                    ? new Date(task.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                    : <span className="text-slate-600">Not set</span>}
                </span>
              )}
            </div>
          </div>

          {/* Assignees */}
          <div>
            <label className="text-xs text-slate-500 block mb-1">Assignees</label>
            {editing ? (
              <AssigneeInput assignees={assignees} onChange={setAssignees} />
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {task.assignees.length === 0
                  ? <span className="text-sm text-slate-600">None</span>
                  : task.assignees.map(name => (
                      <span key={name} className={`text-xs font-medium px-2 py-0.5 rounded-full ${avatarColor(name)}`}>
                        {name}
                      </span>
                    ))
                }
              </div>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="text-xs text-slate-500 block mb-1">Tags</label>
            {editing ? (
              <div className="flex flex-wrap gap-1.5 items-center bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 focus-within:ring-2 focus-within:ring-violet-500 min-h-9">
                {tags.map(tag => (
                  <span key={tag} className={`flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded border ${tagColor(tag)}`}>
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="opacity-60 hover:opacity-100 leading-none">✕</button>
                  </span>
                ))}
                <input
                  type="text"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(tagInput) }
                    else if (e.key === 'Backspace' && !tagInput && tags.length > 0) removeTag(tags[tags.length - 1])
                  }}
                  onBlur={() => addTag(tagInput)}
                  placeholder={tags.length === 0 ? 'Add tags (Enter or comma)...' : ''}
                  className="flex-1 min-w-24 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none bg-transparent"
                />
              </div>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {task.tags.length === 0
                  ? <span className="text-sm text-slate-600">None</span>
                  : task.tags.map(tag => (
                      <span key={tag} className={`text-xs font-medium px-1.5 py-0.5 rounded border ${tagColor(tag)}`}>{tag}</span>
                    ))
                }
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="text-xs text-slate-500 block mb-1">Description</label>
            {editing ? (
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
                className="w-full text-sm bg-slate-800 border border-slate-700 text-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none placeholder:text-slate-600"
              />
            ) : (
              <p className="text-sm text-slate-300 whitespace-pre-wrap min-h-6">
                {task.description || <span className="text-slate-600">No description</span>}
              </p>
            )}
          </div>

          <hr className="border-slate-800" />

          <SubtaskList
            subtasks={task.subtasks}
            onAdd={title => onAddSubtask(task.id, title)}
            onToggle={sid => onToggleSubtask(task.id, sid)}
            onDelete={sid => onDeleteSubtask(task.id, sid)}
          />

          <hr className="border-slate-800" />

          <CommentList
            comments={task.comments}
            knownUsers={knownUsers}
            currentUser={currentUser}
            onAdd={(author, text) => onAddComment(task.id, author, text)}
            onConvertToSubtask={text => onAddSubtask(task.id, text)}
          />
        </div>
      </div>
    </div>
  )
}
