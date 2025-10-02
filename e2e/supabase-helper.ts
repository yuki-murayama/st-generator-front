import { createClient } from '@supabase/supabase-js'
import { Database } from '../src/types/supabase'

// Create Supabase client for E2E tests using process.env
export const getSupabaseClient = () => {
  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey)
}
