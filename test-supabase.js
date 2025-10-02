// Supabase接続テスト
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://cbykdijdtvsmisipigrn.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNieWtkaWpkdHZzbWlzaXBpZ3JuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMzkwMjAsImV4cCI6MjA3NDcxNTAyMH0.vQkOunn1uQTOodBomtTCI2DrNjFJEW3KjTPginf7u_A'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  try {
    console.log('Testing Supabase connection...')

    // テーブル一覧を取得してみる
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .limit(1)

    if (error) {
      console.error('Error:', error.message)
      if (error.message.includes('relation "public.employees" does not exist')) {
        console.log('従業員テーブルが存在しません。データベーススキーマを作成する必要があります。')
      }
    } else {
      console.log('Success! Data:', data)
    }
  } catch (err) {
    console.error('Connection error:', err)
  }
}

testConnection()