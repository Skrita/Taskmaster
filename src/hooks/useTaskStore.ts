import { useState, useEffect } from 'react'
import type { Task, Status, Priority, Comment, Subtask, ActivityLog } from '../types'
import { supabase } from '../lib/supabase'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

// Map Supabase row (snake_case) → Task (camelCase)
function rowToTask(row: Record<string, unknown>): Task {
  return {
    id: row.id as string,
    title: row.title as string,
    description: (row.description as string) ?? '',
    status: row.status as Status,
    priority: row.priority as Priority,
    assignees: (row.assignees as string[]) ?? [],
    tags: (row.tags as string[]) ?? [],
    dueDate: (row.due_date as string) ?? undefined,
    subtasks: (row.subtasks as Subtask[]) ?? [],
    comments: (row.comments as Comment[]) ?? [],
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}

function rowToActivity(row: Record<string, unknown>): ActivityLog {
  return {
    id: row.id as string,
    taskId: (row.task_id as string) ?? null,
    taskTitle: (row.task_title as string) ?? null,
    actor: row.actor as string,
    action: row.action as string,
    detail: (row.detail as string) ?? undefined,
    createdAt: row.created_at as string,
  }
}

export function useTaskStore(username: string) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [activities, setActivities] = useState<ActivityLog[]>([])

  // Initial fetch
  useEffect(() => {
    supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setTasks(data.map(rowToTask))
        setLoading(false)
      })

    supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)
      .then(({ data, error }) => {
        if (!error && data) setActivities(data.map(rowToActivity))
      })

    // Real-time subscription — updates appear instantly for all users
    const taskChannel = supabase
      .channel('tasks-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
        supabase
          .from('tasks')
          .select('*')
          .order('created_at', { ascending: false })
          .then(({ data, error }) => {
            if (!error && data) setTasks(data.map(rowToTask))
          })
      })
      .subscribe()

    const activityChannel = supabase
      .channel('activity-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activity_logs' }, payload => {
        const entry = rowToActivity(payload.new as Record<string, unknown>)
        setActivities(prev => [entry, ...prev].slice(0, 100))
      })
      .subscribe()

    return () => {
      supabase.removeChannel(taskChannel)
      supabase.removeChannel(activityChannel)
    }
  }, [])

  async function logActivity(
    action: string,
    taskId: string | null,
    taskTitle: string | null,
    detail?: string,
  ) {
    const entry = {
      id: generateId(),
      task_id: taskId,
      task_title: taskTitle,
      actor: username,
      action,
      detail: detail ?? null,
    }
    await supabase.from('activity_logs').insert(entry)
  }

  async function addTask(fields: {
    title: string
    description: string
    status: Status
    priority: Priority
    assignees: string[]
    tags: string[]
    dueDate?: string
  }): Promise<Task> {
    const now = new Date().toISOString()
    const row = {
      id: generateId(),
      title: fields.title,
      description: fields.description,
      status: fields.status,
      priority: fields.priority,
      assignees: fields.assignees,
      tags: fields.tags,
      due_date: fields.dueDate ?? null,
      subtasks: [],
      comments: [],
      created_at: now,
      updated_at: now,
    }
    const { data } = await supabase.from('tasks').insert(row).select().single()
    const task = rowToTask(data ?? row)
    setTasks(prev => [task, ...prev])
    logActivity('task_created', task.id, task.title)
    return task
  }

  async function updateTask(id: string, fields: Partial<Omit<Task, 'id' | 'subtasks' | 'comments' | 'createdAt'>>): Promise<void> {
    const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (fields.title !== undefined) update.title = fields.title
    if (fields.description !== undefined) update.description = fields.description
    if (fields.status !== undefined) update.status = fields.status
    if (fields.priority !== undefined) update.priority = fields.priority
    if (fields.assignees !== undefined) update.assignees = fields.assignees
    if (fields.tags !== undefined) update.tags = fields.tags
    if ('dueDate' in fields) update.due_date = fields.dueDate ?? null

    const existing = tasks.find(t => t.id === id)
    const taskTitle = fields.title ?? existing?.title ?? null

    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...fields, updatedAt: update.updated_at as string } : t))
    await supabase.from('tasks').update(update).eq('id', id)

    // Log what changed
    if (fields.status !== undefined && existing?.status !== fields.status) {
      logActivity('status_changed', id, taskTitle, `${existing?.status} → ${fields.status}`)
    } else if (fields.priority !== undefined && existing?.priority !== fields.priority) {
      logActivity('priority_changed', id, taskTitle, `${existing?.priority} → ${fields.priority}`)
    } else if (fields.assignees !== undefined) {
      logActivity('assignees_updated', id, taskTitle)
    } else if ('dueDate' in fields) {
      logActivity('due_date_set', id, taskTitle, fields.dueDate ?? 'cleared')
    } else if (fields.tags !== undefined) {
      logActivity('tags_updated', id, taskTitle)
    } else if (fields.title !== undefined || fields.description !== undefined) {
      logActivity('task_edited', id, taskTitle)
    }
  }

  async function deleteTask(id: string): Promise<void> {
    const task = tasks.find(t => t.id === id)
    setTasks(prev => prev.filter(t => t.id !== id))
    await supabase.from('tasks').delete().eq('id', id)
    logActivity('task_deleted', null, task?.title ?? null)
  }

  async function addSubtask(taskId: string, title: string): Promise<void> {
    const task = tasks.find(t => t.id === taskId)
    const subtask: Subtask = { id: generateId(), title, completed: false }
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t
      const updated = { ...t, subtasks: [...t.subtasks, subtask], updatedAt: new Date().toISOString() }
      supabase.from('tasks').update({ subtasks: updated.subtasks, updated_at: updated.updatedAt }).eq('id', taskId)
      return updated
    }))
    logActivity('subtask_added', taskId, task?.title ?? null, title)
  }

  async function toggleSubtask(taskId: string, subtaskId: string): Promise<void> {
    const task = tasks.find(t => t.id === taskId)
    const subtask = task?.subtasks.find(s => s.id === subtaskId)
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t
      const updated = {
        ...t,
        subtasks: t.subtasks.map(s => s.id === subtaskId ? { ...s, completed: !s.completed } : s),
        updatedAt: new Date().toISOString(),
      }
      supabase.from('tasks').update({ subtasks: updated.subtasks, updated_at: updated.updatedAt }).eq('id', taskId)
      return updated
    }))
    if (subtask && !subtask.completed) {
      logActivity('subtask_completed', taskId, task?.title ?? null, subtask.title)
    }
  }

  async function deleteSubtask(taskId: string, subtaskId: string): Promise<void> {
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t
      const updated = {
        ...t,
        subtasks: t.subtasks.filter(s => s.id !== subtaskId),
        updatedAt: new Date().toISOString(),
      }
      supabase.from('tasks').update({ subtasks: updated.subtasks, updated_at: updated.updatedAt }).eq('id', taskId)
      return updated
    }))
  }

  async function addComment(taskId: string, author: string, text: string): Promise<void> {
    const task = tasks.find(t => t.id === taskId)
    const comment: Comment = { id: generateId(), author, text, createdAt: new Date().toISOString() }
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t
      const updated = { ...t, comments: [...t.comments, comment], updatedAt: new Date().toISOString() }
      supabase.from('tasks').update({ comments: updated.comments, updated_at: updated.updatedAt }).eq('id', taskId)
      return updated
    }))
    logActivity('comment_added', taskId, task?.title ?? null)
  }

  return {
    tasks,
    loading,
    activities,
    addTask,
    updateTask,
    deleteTask,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
    addComment,
  }
}
