import { useState, useEffect } from 'react'
import type { Task, Status, Priority, Comment, Subtask } from '../types'
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
    subtasks: (row.subtasks as Subtask[]) ?? [],
    comments: (row.comments as Comment[]) ?? [],
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}

export function useTaskStore() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

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

    // Real-time subscription — updates appear instantly for all users
    const channel = supabase
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

    return () => { supabase.removeChannel(channel) }
  }, [])

  async function addTask(fields: {
    title: string
    description: string
    status: Status
    priority: Priority
    assignees: string[]
  }): Promise<Task> {
    const now = new Date().toISOString()
    const row = {
      id: generateId(),
      title: fields.title,
      description: fields.description,
      status: fields.status,
      priority: fields.priority,
      assignees: fields.assignees,
      subtasks: [],
      comments: [],
      created_at: now,
      updated_at: now,
    }
    const { data } = await supabase.from('tasks').insert(row).select().single()
    const task = rowToTask(data ?? row)
    setTasks(prev => [task, ...prev])
    return task
  }

  async function updateTask(id: string, fields: Partial<Omit<Task, 'id' | 'subtasks' | 'comments' | 'createdAt'>>): Promise<void> {
    const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (fields.title !== undefined) update.title = fields.title
    if (fields.description !== undefined) update.description = fields.description
    if (fields.status !== undefined) update.status = fields.status
    if (fields.priority !== undefined) update.priority = fields.priority
    if (fields.assignees !== undefined) update.assignees = fields.assignees

    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...fields, updatedAt: update.updated_at as string } : t))
    await supabase.from('tasks').update(update).eq('id', id)
  }

  async function deleteTask(id: string): Promise<void> {
    setTasks(prev => prev.filter(t => t.id !== id))
    await supabase.from('tasks').delete().eq('id', id)
  }

  async function addSubtask(taskId: string, title: string): Promise<void> {
    const subtask: Subtask = { id: generateId(), title, completed: false }
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t
      const updated = { ...t, subtasks: [...t.subtasks, subtask], updatedAt: new Date().toISOString() }
      supabase.from('tasks').update({ subtasks: updated.subtasks, updated_at: updated.updatedAt }).eq('id', taskId)
      return updated
    }))
  }

  async function toggleSubtask(taskId: string, subtaskId: string): Promise<void> {
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
    const comment: Comment = { id: generateId(), author, text, createdAt: new Date().toISOString() }
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t
      const updated = { ...t, comments: [...t.comments, comment], updatedAt: new Date().toISOString() }
      supabase.from('tasks').update({ comments: updated.comments, updated_at: updated.updatedAt }).eq('id', taskId)
      return updated
    }))
  }

  return {
    tasks,
    loading,
    addTask,
    updateTask,
    deleteTask,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
    addComment,
  }
}
