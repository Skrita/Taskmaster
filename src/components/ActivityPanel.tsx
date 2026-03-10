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
    <div className="fixed inset-0 z-40 sm:bg-black/60 flex justify-end" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="w-full sm:w-80 bg-slate-900 shadow-2xl shadow-black/50 flex flex-col h-full border-l border-slate-800">
        <div className="flex items-center justify-between px-4 py-4 border-b border-slate-800">
          <h2 className="text-sm font-semibold text-white">Activity Log</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 text-xl leading-none">✕</button>
        </div>

        <div className="overflow-y-auto flex-1 px-4 py-3 space-y-1">
          {activities.length === 0 && (
            <p className="text-sm text-slate-600 text-center mt-8">No activity yet</p>
          )}
          {activities.map(entry => {
            const meta = ACTION_LABELS[entry.action] ?? { label: entry.action, icon: '•' }
            return (
              <div key={entry.id} className="flex gap-2.5 py-2.5 border-b border-slate-800 last:border-0">
                <div className="w-6 h-6 rounded-full bg-violet-900/60 text-violet-300 flex items-center justify-center text-xs shrink-0 mt-0.5 font-semibold">
                  {entry.actor.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-400 leading-snug">
                    <span className="font-medium text-slate-300">{entry.actor}</span>{' '}
                    <span className="text-slate-500">{meta.icon}</span>{' '}
                    {meta.label}
                    {entry.taskTitle && (
                      <>
                        {' '}
                        {entry.taskId && onTaskClick ? (
                          <button
                            className="font-medium text-violet-400 hover:text-violet-300 hover:underline truncate max-w-full text-left transition-colors"
                            onClick={() => onTaskClick(entry.taskId!)}
                          >
                            {entry.taskTitle}
                          </button>
                        ) : (
                          <span className="font-medium text-slate-300">{entry.taskTitle}</span>
                        )}
                      </>
                    )}
                  </p>
                  {entry.detail && (
                    <p className="text-xs text-slate-600 mt-0.5 truncate">{entry.detail}</p>
                  )}
                  <p className="text-xs text-slate-700 mt-0.5">{timeAgo(entry.createdAt)}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
