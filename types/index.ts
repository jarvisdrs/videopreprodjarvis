export interface Project {
  id: string
  name: string
  description: string | null
  status: 'planning' | 'in_progress' | 'completed' | 'on_hold'
  created_at: string
  updated_at: string
  user_id: string
}

export interface Script {
  id: string
  project_id: string
  title: string
  content: string
  outline: string | null
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  project_id: string
  title: string
  description: string | null
  status: 'todo' | 'in_progress' | 'done'
  due_date: string | null
  assigned_to: string | null
  created_at: string
  updated_at: string
}

export interface Budget {
  id: string
  project_id: string
  category: string
  amount: number
  spent: number
  created_at: string
  updated_at: string
}

export interface Location {
  id: string
  project_id: string
  name: string
  address: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface TeamMember {
  id: string
  project_id: string
  name: string
  email: string
  role: string
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
}
