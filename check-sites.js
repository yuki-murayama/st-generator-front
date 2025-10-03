import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

async function checkSites() {
  // Check all recent sites
  const { data: allSites, error: allError } = await supabase
    .from('sites')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10)

  if (allError) {
    console.error('Error fetching all sites:', allError)
  } else {
    console.log(`\n=== Last 10 sites (most recent first) ===`)
    allSites.forEach((site, idx) => {
      console.log(`${idx + 1}. ${site.name} (Created: ${site.created_at})`)
    })
  }

  // Check for E2E test sites
  const { data: e2eSites, error: e2eError } = await supabase
    .from('sites')
    .select('*')
    .ilike('name', '%E2E%')
    .order('created_at', { ascending: false })

  if (e2eError) {
    console.error('Error fetching E2E sites:', e2eError)
  } else {
    console.log(`\n=== E2E Test Sites ===`)
    console.log(`Found ${e2eSites.length} sites with "E2E" in name`)
    e2eSites.forEach(site => {
      console.log(`- ${site.name} (ID: ${site.id}, Created: ${site.created_at})`)
    })
  }
}

checkSites()
