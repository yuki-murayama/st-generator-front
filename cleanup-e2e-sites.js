import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

async function cleanupE2ESites() {
  console.log('🧹 Cleaning up E2E test sites...')

  // Find all E2E test sites
  const { data: e2eSites, error: fetchError } = await supabase
    .from('sites')
    .select('*')
    .ilike('name', '%E2E%')
    .order('created_at', { ascending: false })

  if (fetchError) {
    console.error('❌ Error fetching E2E sites:', fetchError)
    return
  }

  console.log(`Found ${e2eSites.length} E2E test sites to delete`)

  // Delete all E2E test sites
  const { error: deleteError } = await supabase
    .from('sites')
    .delete()
    .ilike('name', '%E2E%')

  if (deleteError) {
    console.error('❌ Error deleting E2E sites:', deleteError)
    return
  }

  console.log(`✅ Successfully deleted ${e2eSites.length} E2E test sites`)

  // Verify deletion
  const { data: remainingSites } = await supabase
    .from('sites')
    .select('*')
    .ilike('name', '%E2E%')

  if (remainingSites && remainingSites.length === 0) {
    console.log('✅ Verification passed: No E2E test sites remaining')
  } else {
    console.warn(`⚠️ Warning: ${remainingSites?.length || 0} E2E test sites still remain`)
  }
}

cleanupE2ESites()
