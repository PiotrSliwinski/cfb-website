import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkTables() {
  console.log('Checking CMS tables...\n')

  // Check for pages table
  const { data: pages, error: pagesError } = await supabase
    .from('pages')
    .select('*')
    .limit(1)

  if (pagesError) {
    console.log('❌ pages table:', pagesError.message)
  } else {
    console.log('✅ pages table exists')
  }

  // Check for section_types table
  const { data: sectionTypes, error: sectionTypesError } = await supabase
    .from('section_types')
    .select('*')
    .limit(1)

  if (sectionTypesError) {
    console.log('❌ section_types table:', sectionTypesError.message)
  } else {
    console.log('✅ section_types table exists')
  }

  // Check for pages_sections table
  const { data: pagesSections, error: pagesSectionsError } = await supabase
    .from('pages_sections')
    .select('*')
    .limit(1)

  if (pagesSectionsError) {
    console.log('❌ pages_sections table:', pagesSectionsError.message)
  } else {
    console.log('✅ pages_sections table exists')
  }

  // Check for cms_pages table
  const { data: cmsPages, error: cmsPagesError } = await supabase
    .from('cms_pages')
    .select('*')
    .limit(1)

  if (cmsPagesError) {
    console.log('❌ cms_pages table:', cmsPagesError.message)
  } else {
    console.log('✅ cms_pages table exists')
  }

  console.log('\nConclusion:')
  if (!pagesError || !cmsPagesError) {
    console.log('✅ CMS system is available')

    // List available pages
    if (!pagesError) {
      const { data: allPages } = await supabase.from('pages').select('id, title, slug, status')
      console.log('\nAvailable pages:')
      allPages?.forEach(page => {
        console.log(`  - ${page.title} (${page.slug}) - ${page.status}`)
      })
    } else if (!cmsPagesError) {
      const { data: allPages } = await supabase.from('cms_pages').select('id, slug, template, is_published')
      console.log('\nAvailable CMS pages:')
      allPages?.forEach(page => {
        console.log(`  - ${page.slug} (${page.template}) - ${page.is_published ? 'published' : 'draft'}`)
      })
    }
  } else {
    console.log('❌ No CMS system found - need to run migrations')
  }
}

checkTables()
