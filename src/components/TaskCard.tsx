import type { Task, Priority } from '../types'
import { avatarColor } from './AssigneeInput'

const PRIORITY_DOT: Record<Priority, string> = {
  high: 'bg-red-500',
  medium: 'bg-yellow-400',
  low: 'bg-green-500',
}

const PRIORITY_LABEL: Record<Priority, string> = {
  high: 'High',
  medium: 'Med',
  low: 'Low',
}

const TAG_COLORS = [
  'bg-blue-950/60 text-blue-300 border-blue-800',
  'bg-violet-950/60 text-violet-300 border-violet-800',
  'bg-teal-950/60 text-teal-300 border-teal-800',
  'bg-orange-950/60 text-orange-300 border-orange-800',
  'bg-rose-950/60 text-rose-300 border-rose-800',
  'bg-cyan-950/60 text-cyan-300 border-cyan-800',
]

export function tagColor(tag: string): string {
  let hash = 0
  for (let i = 0; i < tag.length; i++) hash = tag.charCodeAt(i) + hash * 31
  return TAG_COLORS[Math.abs(hash) % TAG_COLORS.length]
}

function dueDateLabel(dueDate: string): { text: string; className: string } {
  const due = new Date(dueDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  due.setHours(0, 0, 0, 0)
  const diff = Math.round((due.getTime() - today.getTime()) / 86400000)

  if (diff < 0) return { text: `${Math.abs(diff)}d overdue`, className: 'text-red-400' }
  if (diff === 0) return { text: 'Due today', className: 'text-orange-400' }
  if (diff === 1) return { text: 'Due tomorrow', className: 'text-yellow-400' }
  return {
    text: `Due ${due.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`,
    className: 'text-slate-500',
  }
}

interface Props {
  task: Task
  onClick: () => void
}

export function TaskCard({ task, onClick }: Props) {
  const doneSubs = task.subtasks.filter(s => s.completed).length
  const totalSubs = task.subtasks.length
  const due = task.dueDate ? dueDateLabel(task.dueDate) : null

  return (
    <div
      onClick={onClick}
      className="bg-slate-800 rounded-xl border border-slate-700/60 p-3 shadow-sm hover:shadow-lg hover:shadow-black/20 cursor-pointer transition-all hover:-translate-y-0.5 hover:border-slate-600 group"
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="flex items-start gap-1.5 flex-1 min-w-0">
          {task.status === 'done' && (
            <span className="text-emerald-500 font-bold text-sm shrink-0 mt-px">✓</span>
          )}
          <h3 className={`text-sm font-semibold line-clamp-2 ${task.status === 'done' ? 'text-slate-500 line-through' : 'text-slate-100'}`}>{task.title}</h3>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <span className={`w-2 h-2 rounded-full ${PRIORITY_DOT[task.priority]}`} title={task.priority} />
          <span className="text-xs text-slate-500">{PRIORITY_LABEL[task.priority]}</span>
        </div>
      </div>

      {task.description && (
        <p className="text-xs text-slate-500 line-clamp-2 mb-2">{task.description}</p>
      )}

      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {task.tags.map(tag => (
            <span key={tag} className={`text-xs px-1.5 py-0.5 rounded border font-medium ${tagColor(tag)}`}>
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between gap-2 mt-2">
        <div className="flex items-center gap-1 flex-wrap">
          {task.assignees.slice(0, 3).map(name => (
            <span
              key={name}
              className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${avatarColor(name)}`}
            >
              {name}
            </span>
          ))}
          {task.assignees.length > 3 && (
            <span className="text-xs text-slate-500">+{task.assignees.length - 3}</span>
          )}
          {task.comments.length > 0 && (
            <span className="text-xs text-slate-500 ml-1">💬 {task.comments.length}</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {due && <span className={`text-xs font-medium ${due.className}`}>{due.text}</span>}
          {totalSubs > 0 && (
            <div className="flex items-center gap-1.5">
              <div className="w-16 h-1 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${(doneSubs / totalSubs) * 100}%` }}
                />
              </div>
              <span className="text-xs text-slate-500">{doneSubs}/{totalSubs}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
