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

interface Props {
  task: Task
  onClick: () => void
}

export function TaskCard({ task, onClick }: Props) {
  const doneSubs = task.subtasks.filter(s => s.completed).length
  const totalSubs = task.subtasks.length

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm hover:shadow-md cursor-pointer transition-all hover:-translate-y-0.5 group"
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 flex-1">{task.title}</h3>
        <div className="flex items-center gap-1 shrink-0">
          <span className={`w-2 h-2 rounded-full ${PRIORITY_DOT[task.priority]}`} title={task.priority} />
          <span className="text-xs text-gray-400">{PRIORITY_LABEL[task.priority]}</span>
        </div>
      </div>

      {task.description && (
        <p className="text-xs text-gray-400 line-clamp-2 mb-2">{task.description}</p>
      )}

      <div className="flex items-center justify-between gap-2 mt-2">
        <div className="flex items-center gap-1">
          {task.assignees.slice(0, 4).map((name, i) => (
            <div
              key={name}
              className={`w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center -ml-1 first:ml-0 ring-1 ring-white ${avatarColor(name)}`}
              title={name}
              style={{ zIndex: i }}
            >
              {name.charAt(0).toUpperCase()}
            </div>
          ))}
          {task.assignees.length > 4 && (
            <span className="text-xs text-gray-400 ml-1">+{task.assignees.length - 4}</span>
          )}
          {task.comments.length > 0 && (
            <span className="text-xs text-gray-400 ml-1">💬 {task.comments.length}</span>
          )}
        </div>

        {totalSubs > 0 && (
          <div className="flex items-center gap-1.5">
            <div className="w-16 h-1 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-400 rounded-full"
                style={{ width: `${(doneSubs / totalSubs) * 100}%` }}
              />
            </div>
            <span className="text-xs text-gray-400">{doneSubs}/{totalSubs}</span>
          </div>
        )}
      </div>
    </div>
  )
}
