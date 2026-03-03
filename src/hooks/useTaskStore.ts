import { useState, useEffect } from 'react'
import type { Task, Status, Priority, Comment, Subtask } from '../types'

const STORAGE_KEY = 'task-manager-v1'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveTasks(tasks: Task[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
}

export function useTaskStore() {
  const [tasks, setTasks] = useState<Task[]>(loadTasks)

  useEffect(() => {
    saveTasks(tasks)
  }, [tasks])

  function addTask(fields: {
    title: string
    description: string
    status: Status
    priority: Priority
    assignees: string[]
  }): Task {
    const now = new Date().toISOString()
    const task: Task = {
      id: generateId(),
      ...fields,
      subtasks: [],
      comments: [],
      createdAt: now,
      updatedAt: now,
    }
    setTasks(prev => [task, ...prev])
    return task
  }

  function updateTask(id: string, fields: Partial<Omit<Task, 'id' | 'subtasks' | 'comments' | 'createdAt'>>): void {
    setTasks(prev =>
      prev.map(t =>
        t.id === id ? { ...t, ...fields, updatedAt: new Date().toISOString() } : t
      )
    )
  }

  function deleteTask(id: string): void {
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  function addSubtask(taskId: string, title: string): void {
    const subtask: Subtask = { id: generateId(), title, completed: false }
    setTasks(prev =>
      prev.map(t =>
        t.id === taskId
          ? { ...t, subtasks: [...t.subtasks, subtask], updatedAt: new Date().toISOString() }
          : t
      )
    )
  }

  function toggleSubtask(taskId: string, subtaskId: string): void {
    setTasks(prev =>
      prev.map(t =>
        t.id === taskId
          ? {
              ...t,
              subtasks: t.subtasks.map(s =>
                s.id === subtaskId ? { ...s, completed: !s.completed } : s
              ),
              updatedAt: new Date().toISOString(),
            }
          : t
      )
    )
  }

  function deleteSubtask(taskId: string, subtaskId: string): void {
    setTasks(prev =>
      prev.map(t =>
        t.id === taskId
          ? {
              ...t,
              subtasks: t.subtasks.filter(s => s.id !== subtaskId),
              updatedAt: new Date().toISOString(),
            }
          : t
      )
    )
  }

  function addComment(taskId: string, author: string, text: string): void {
    const comment: Comment = {
      id: generateId(),
      author,
      text,
      createdAt: new Date().toISOString(),
    }
    setTasks(prev =>
      prev.map(t =>
        t.id === taskId
          ? { ...t, comments: [...t.comments, comment], updatedAt: new Date().toISOString() }
          : t
      )
    )
  }

  return {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
    addComment,
  }
}
