export type Status = 'todo' | 'in-progress' | 'done'
export type Priority = 'low' | 'medium' | 'high'

export interface Subtask {
  id: string
  title: string
  completed: boolean
}

export interface Comment {
  id: string
  author: string
  text: string
  createdAt: string
}

export interface Task {
  id: string
  title: string
  description: string
  status: Status
  priority: Priority
  assignees: string[]
  tags: string[]
  dueDate?: string
  subtasks: Subtask[]
  comments: Comment[]
  createdAt: string
  updatedAt: string
}

export interface FilterState {
  search: string
  status: Status | 'all'
  assignee: string
  priority: Priority | 'all'
  tag: string
}
