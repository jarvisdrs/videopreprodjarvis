import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseKey)

export type Database = {
  public: {
    tables: {
      projects: {
        Row: {
          id: string
          name: string
          description: string | null
          status: string
          created_at: string
          updated_at: string
          user_id: string
        }
      }
      scripts: {
        Row: {
          id: string
          project_id: string
          title: string
          content: string
          outline: string | null
          created_at: string
          updated_at: string
        }
      }
      tasks: {
        Row: {
          id: string
          project_id: string
          title: string
          description: string | null
          status: string
          due_date: string | null
          assigned_to: string | null
          created_at: string
          updated_at: string
        }
      }
      budgets: {
        Row: {
          id: string
          project_id: string
          category: string
          amount: number
          spent: number
          created_at: string
          updated_at: string
        }
      }
      locations: {
        Row: {
          id: string
          project_id: string
          name: string
          address: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
      }
      team_members: {
        Row: {
          id: string
          project_id: string
          name: string
          email: string
          role: string
          created_at: string
          updated_at: string
        }
      }
    }
  }
}
