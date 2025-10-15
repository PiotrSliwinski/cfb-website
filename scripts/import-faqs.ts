import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { parse } from 'csv-parse/sync'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

// Treatment slug mapping from CSV "Service" field
const treatmentSlugMap: Record<string, string> = {
  'limpeza-dentaria': '5e5c1144-257d-4c3c-8240-48537cdd4ee2',
  'medicina-dentaria-do-sono': '3243667a-7c7f-477f-8d38-1ab7eb39f89d',
  'ortodontia': '341876eb-bde4-42d5-b724-8395080e1fbb',
  'implantes-dentarios': '8cc1b197-ebd0-4190-855b-b10b8e79c78b',
}

interface CSVRow {
  Name: string
  Slug: string
  'Collection ID': string
  'Locale ID': string
  'Item ID': string
  Archived: string
  Draft: string
  'Created On': string
  'Updated On': string
  'Published On': string
  Description: string
  Service: string
  Active: string
}

async function importFAQs() {
  console.log('Starting FAQ import...')

  // Read CSV file
  const csvPath = path.join(process.cwd(), 'legacy', 'clinica-ferreira-borges - Frequent Questions.csv')
  const csvContent = fs.readFileSync(csvPath, 'utf-8')

  // Parse CSV
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
  }) as CSVRow[]

  console.log(`Found ${records.length} FAQs in CSV`)

  let imported = 0
  let skipped = 0

  for (const record of records) {
    // Skip if not active
    if (record.Active !== 'true') {
      console.log(`Skipping inactive FAQ: ${record.Name}`)
      skipped++
      continue
    }

    // Get treatment ID from service slug
    const treatmentId = record.Service ? treatmentSlugMap[record.Service] : null

    if (record.Service && !treatmentId) {
      console.log(`Warning: No treatment found for service "${record.Service}" - FAQ: ${record.Name}`)
      skipped++
      continue
    }

    if (!treatmentId) {
      console.log(`Skipping FAQ without treatment: ${record.Name}`)
      skipped++
      continue
    }

    try {
      // Insert FAQ
      const { data: faq, error: faqError } = await supabase
        .from('treatment_faqs')
        .insert({
          treatment_id: treatmentId,
          display_order: imported,
        })
        .select()
        .single()

      if (faqError) {
        console.error(`Error inserting FAQ: ${record.Name}`, faqError)
        skipped++
        continue
      }

      // Insert Portuguese translation
      const { error: translationError } = await supabase
        .from('treatment_faq_translations')
        .insert({
          faq_id: faq.id,
          language_code: 'pt',
          question: record.Name,
          answer: record.Description,
        })

      if (translationError) {
        console.error(`Error inserting PT translation for: ${record.Name}`, translationError)
        // Delete the FAQ since we couldn't add translation
        await supabase.from('treatment_faqs').delete().eq('id', faq.id)
        skipped++
        continue
      }

      // Insert English translation (same as Portuguese for now - you can translate later)
      await supabase
        .from('treatment_faq_translations')
        .insert({
          faq_id: faq.id,
          language_code: 'en',
          question: record.Name,
          answer: record.Description,
        })

      console.log(`✓ Imported: ${record.Name} (Treatment: ${record.Service})`)
      imported++
    } catch (error) {
      console.error(`Error processing FAQ: ${record.Name}`, error)
      skipped++
    }
  }

  console.log(`\n=== Import Complete ===`)
  console.log(`Total FAQs in CSV: ${records.length}`)
  console.log(`Imported: ${imported}`)
  console.log(`Skipped: ${skipped}`)
}

importFAQs()
  .then(() => {
    console.log('\nFAQ import finished successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Fatal error during import:', error)
    process.exit(1)
  })
