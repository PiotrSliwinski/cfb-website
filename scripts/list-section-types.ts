import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function listSectionTypes() {
  const { data, error } = await supabase
    .from('section_types')
    .select('*')
    .order('category, display_name')

  if (error) {
    console.error('Error:', error)
    return
  }

  console.log('Available Section Types:\n')
  data?.forEach((type) => {
    console.log(`${type.display_name} (${type.uid})`)
    console.log(`  Icon: ${type.icon}`)
    console.log(`  Category: ${type.category}`)
    console.log(`  Description: ${type.description}`)
    console.log(`  Schema:`, JSON.stringify(type.schema, null, 2))
    console.log('')
  })
}

listSectionTypes()
