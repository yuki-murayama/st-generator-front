import { createClient } from '@supabase/supabase-js'
import { Database } from '../types/supabase'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const isDevelopment = import.meta.env.VITE_DEV_MODE === 'true'

// 開発環境でのモック設定（実際のSupabaseプロジェクト作成前の動作確認用）
const DEV_SUPABASE_URL = 'https://demo.supabase.co'
const DEV_SUPABASE_KEY = 'demo-key'

const finalUrl = (supabaseUrl && supabaseUrl !== 'https://your-project-id.supabase.co')
  ? supabaseUrl
  : (isDevelopment ? DEV_SUPABASE_URL : null)

const finalKey = (supabaseAnonKey && supabaseAnonKey !== 'your-supabase-anon-key')
  ? supabaseAnonKey
  : (isDevelopment ? DEV_SUPABASE_KEY : null)

if (!finalUrl || !finalKey) {
  console.warn('Supabase環境変数が設定されていません。実際のSupabaseプロジェクトを作成してください。')
  if (!isDevelopment) {
    throw new Error('Supabase environment variables are required for production')
  }
}

export const supabase = createClient<Database>(finalUrl!, finalKey!, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})

// Authentication helper functions
export const auth = {
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },

  signUp: async (email: string, password: string, metadata?: { first_name?: string; last_name?: string }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    })
    return { data, error }
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  getCurrentUser: () => {
    return supabase.auth.getUser()
  },

  onAuthStateChange: (callback: (user: any) => void) => {
    return supabase.auth.onAuthStateChange((_, session) => {
      callback(session?.user || null)
    })
  }
}

// Database helper functions
export const db = {
  // Employee operations
  employees: {
    getAll: () => supabase.from('employees'),
    getById: (id: string) => supabase.from('employees').select('*').eq('id', id).single(),
    create: (employee: any) => supabase.from('employees').insert(employee).select().single(),
    update: (id: string, updates: any) => supabase.from('employees').update(updates).eq('id', id).select().single(),
    delete: (id: string) => supabase.from('employees').delete().eq('id', id)
  },

  // Site operations
  sites: {
    getAll: () => supabase.from('sites'),
    getById: (id: string) => supabase.from('sites').select('*').eq('id', id).single(),
    create: (site: any) => supabase.from('sites').insert(site).select().single(),
    update: (id: string, updates: any) => supabase.from('sites').update(updates).eq('id', id).select().single(),
    delete: (id: string) => supabase.from('sites').delete().eq('id', id)
  },

  // Assignment operations
  assignments: {
    getAll: () => supabase.from('assignments'),
    getById: (id: string) => supabase.from('assignments').select('*, employees(*), sites(*)').eq('id', id).single(),
    create: (assignment: any) => supabase.from('assignments').insert(assignment).select('*, employees(*), sites(*)').single(),
    update: (id: string, updates: any) => supabase.from('assignments').update(updates).eq('id', id).select('*, employees(*), sites(*)').single(),
    delete: (id: string) => supabase.from('assignments').delete().eq('id', id)
  }
}