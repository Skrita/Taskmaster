import type { ActivityLog } from '../types'

const ACTION_LABELS: Record<string, { label: string; icon: string }> = {
  task_created:      { label: 'created task',        icon: '✦' },
  task_edited:       { label: 'edited task',          icon: '✎' },
  task_deleted:      { label: 'deleted task',         icon: '✕' },
  status_changed:    { label: 'changed status',       icon: '⇄' },
  priority_changed:  { label: 'changed priority',     icon: '▲' },
  assignees_updated: { label: 'updated assignees',    icon: '👤' },
  due_date_set:      { label: 'updated due date',     icon: '📅' },
  tags_updated:      { label: 'updated tags',         icon: '🏷' },
  subtask_added:     { label: 'added subtask',        icon: '＋' },
  subtask_completed: { label: 'completed subtask',    icon: '✓' },
  comment_added:     { label: 'commented on',         icon: '💬' },
}

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

interface Props {
  activities: ActivityLog[]
  onClose: () => void
  onTaskClick?: (taskId: string) => void
}

export function ActivityPanel({ activities, onClose, onTaskClick }: Props) {
  return (
    <div className="fixed inset-0 z-40 flex justify-end" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="w-80 bg-white shadow-2xl flex flex-col h-full border-l border-gray-200">
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800">Activity Log</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
        </div>

        <div className="overflow-y-auto flex-1 px-4 py-3 space-y-1">
          {activities.length === 0 && (
            <p className="text-sm text-gray-400 text-center mt-8">No activity yet</p>
          )}
          {activities.map(entry => {
            const meta = ACTION_LABELS[entry.action] ?? { label: entry.action, icon: '•' }
            return (
              <div key={entry.id} className="flex gap-2.5 py-2.5 border-b border-gray-50 last:border-0">
                <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs shrink-0 mt-0.5">
                  {entry.actor.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-700 leading-snug">
                    <span className="font-medium">{entry.actor}</span>{' '}
                    <span className="text-gray-500">{meta.icon}</span>{' '}
                    {meta.label}
                    {entry.taskTitle && (
                      <>
                        {' '}
                        {entry.taskId && onTaskClick ? (
                          <button
                            className="font-medium text-purple-600 hover:underline truncate max-w-full text-left"
                            onClick={() => onTaskClick(entry.taskId!)}
                          >
                            {entry.taskTitle}
                          </button>
                        ) : (
                          <span className="font-medium text-gray-700">{entry.taskTitle}</span>
                        )}
                      </>
                    )}
                  </p>
                  {entry.detail && (
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{entry.detail}</p>
                  )}
                  <p className="text-xs text-gray-300 mt-0.5">{timeAgo(entry.createdAt)}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
