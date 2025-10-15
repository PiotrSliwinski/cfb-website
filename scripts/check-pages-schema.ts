import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkSchema() {
  // Try to fetch one page to see what columns we have
  const { data, error } = await supabase
    .from('pages')
    .select('*')
    .limit(1)
    .single()

  if (error) {
    console.error('Error:', error)
  } else {
    console.log('Pages table columns:')
    console.log(Object.keys(data))
    console.log('\nSample row:')
    console.log(JSON.stringify(data, null, 2))
  }

  // Try to fetch all pages
  const { data: allPages, error: allError } = await supabase
    .from('pages')
    .select('id, title, slug, status')
    .order('title')

  if (allError) {
    console.error('\nError fetching all pages:', allError)
  } else {
    console.log('\n\nAll pages:')
    allPages?.forEach(page => {
      console.log(`  - ${page.title} (${page.slug}) - ${page.status}`)
    })
  }
}

checkSchema()
