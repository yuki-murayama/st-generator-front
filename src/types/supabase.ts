export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      employees: {
        Row: {
          id: string
          first_name: string
          last_name: string
          email: string
          phone: string | null
          department: string
          position: string
          hire_date: string
          status: 'active' | 'inactive'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          first_name: string
          last_name: string
          email: string
          phone?: string | null
          department: string
          position: string
          hire_date: string
          status?: 'active' | 'inactive'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          email?: string
          phone?: string | null
          department?: string
          position?: string
          hire_date?: string
          status?: 'active' | 'inactive'
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      sites: {
        Row: {
          id: string
          name: string
          description: string | null
          location: string
          start_date: string
          end_date: string | null
          status: 'active' | 'completed' | 'suspended'
          manager_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          location: string
          start_date: string
          end_date?: string | null
          status?: 'active' | 'completed' | 'suspended'
          manager_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          location?: string
          start_date?: string
          end_date?: string | null
          status?: 'active' | 'completed' | 'suspended'
          manager_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      assignments: {
        Row: {
          id: string
          employee_id: string
          site_id: string
          start_date: string
          end_date: string | null
          role: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          employee_id: string
          site_id: string
          start_date: string
          end_date?: string | null
          role?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          employee_id?: string
          site_id?: string
          start_date?: string
          end_date?: string | null
          role?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignments_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignments_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}