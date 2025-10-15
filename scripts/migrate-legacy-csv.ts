#!/usr/bin/env ts-node

/**
 * Legacy CSV Data Migration Script
 *
 * This script imports data from legacy CSV files into Supabase database
 * Files in /legacy/*.csv
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import { parse } from 'csv-parse/sync'

// Supabase configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY is required')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Helper function to read CSV file
function readCSV(filename: string): any[] {
  const filepath = path.join(process.cwd(), 'legacy', filename)

  if (!fs.existsSync(filepath)) {
    console.warn(`⚠️  File not found: ${filename}`)
    return []
  }

  const content = fs.readFileSync(filepath, 'utf-8')
  return parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  })
}

// Helper to create slug from name
function createSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Parse JSONB fields safely
function parseJSONB(value: string | undefined, fallback: any = []): any {
  if (!value) return fallback
  try {
    return JSON.parse(value)
  } catch {
    return fallback
  }
}

async function migrateServices() {
  console.log('\n📋 Migrating Services (Treatments)...')

  const services = readCSV('clinica-ferreira-borges - Services.csv')

  if (services.length === 0) {
    console.log('   ⚠️  No services found to migrate')
    return
  }

  let count = 0
  for (const service of services) {
    const slug = service.Slug || createSlug(service.Name)

    // Insert or update treatment
    const { data: treatment, error: treatmentError } = await supabase
      .from('treatments')
      .upsert({
        slug,
        icon_url: service.Icon || null,
        hero_image_url: service['Hero Image'] || null,
        display_order: count,
        is_published: service.Active === 'true',
        is_featured: false
      }, {
        onConflict: 'slug'
      })
      .select()
      .single()

    if (treatmentError) {
      console.error(`   ❌ Error with service ${slug}:`, treatmentError.message)
      continue
    }

    // Insert PT translation
    await supabase
      .from('treatment_translations')
      .upsert({
        treatment_id: treatment.id,
        language_code: 'pt',
        title: service.Name,
        subtitle: service['Hero Header'] || '',
        description: service['Hero Description'] || service.Description,
        benefits: parseJSONB(service.Benefits),
        process_steps: parseJSONB(service.ProcessSteps)
      }, {
        onConflict: 'treatment_id,language_code'
      })

    // Insert EN translation (if available)
    // Note: CSV doesn't have EN, so we'll skip or use placeholders

    count++
    console.log(`   ✅ Migrated: ${service.Name}`)
  }

  console.log(`   📊 Total services migrated: ${count}`)
}

async function migrateTeam() {
  console.log('\n👥 Migrating Team Members...')

  const team = readCSV('clinica-ferreira-borges - Teams.csv')

  if (team.length === 0) {
    console.log('   ⚠️  No team members found to migrate')
    return
  }

  let count = 0
  for (const member of team) {
    const slug = member.Slug || createSlug(member.Name)

    // Insert or update team member
    const { data: teamMember, error: memberError } = await supabase
      .from('team_members')
      .upsert({
        slug,
        photo_url: member.Image || null,
        display_order: count,
        email: member.Email || null,
        phone: member.Phone || null,
        is_published: member.Active === 'true'
      }, {
        onConflict: 'slug'
      })
      .select()
      .single()

    if (memberError) {
      console.error(`   ❌ Error with team member ${slug}:`, memberError.message)
      continue
    }

    // Insert PT translation
    await supabase
      .from('team_member_translations')
      .upsert({
        member_id: teamMember.id,
        language_code: 'pt',
        name: member.Name,
        title: member.Title || '',
        specialty: member.Specialty || '',
        bio: member.Bio || '',
        credentials: member.Credentials || ''
      }, {
        onConflict: 'member_id,language_code'
      })

    count++
    console.log(`   ✅ Migrated: ${member.Name}`)
  }

  console.log(`   📊 Total team members migrated: ${count}`)
}

async function migrateFAQs() {
  console.log('\n❓ Migrating Frequent Questions...')

  const faqs = readCSV('clinica-ferreira-borges - Frequent Questions.csv')

  if (faqs.length === 0) {
    console.log('   ⚠️  No FAQs found to migrate')
    return
  }

  // Get all treatments to map service slugs
  const { data: treatments } = await supabase
    .from('treatments')
    .select('id, slug')

  const treatmentMap = new Map(treatments?.map(t => [t.slug, t.id]) || [])

  let count = 0
  for (const faq of faqs) {
    const serviceSlug = faq.Service
    const treatmentId = serviceSlug ? treatmentMap.get(serviceSlug) : null

    // Insert FAQ
    const { data: faqData, error: faqError } = await supabase
      .from('treatment_faqs')
      .insert({
        treatment_id: treatmentId,
        display_order: count
      })
      .select()
      .single()

    if (faqError) {
      console.error(`   ❌ Error with FAQ:`, faqError.message)
      continue
    }

    // Insert PT translation
    await supabase
      .from('treatment_faq_translations')
      .insert({
        faq_id: faqData.id,
        language_code: 'pt',
        question: faq.Name,
        answer: faq.Description
      })

    count++
    console.log(`   ✅ Migrated FAQ: ${faq.Name.substring(0, 50)}...`)
  }

  console.log(`   📊 Total FAQs migrated: ${count}`)
}

async function migrateProcesses() {
  console.log('\n🔄 Migrating Processes...')

  const processes = readCSV('clinica-ferreira-borges - Processes.csv')

  if (processes.length === 0) {
    console.log('   ⚠️  No processes found to migrate')
    return
  }

  console.log(`   ℹ️  Found ${processes.length} process entries`)
  console.log('   💡 Process data will be added to treatment descriptions')

  // Processes are additional descriptive content for treatments
  // We can add them as extended process_steps in treatment_translations

  const { data: treatments } = await supabase
    .from('treatments')
    .select('id, slug')

  const treatmentMap = new Map(treatments?.map(t => [t.slug, t.id]) || [])

  for (const process of processes) {
    const serviceSlug = process.Service
    const treatmentId = serviceSlug ? treatmentMap.get(serviceSlug) : null

    if (!treatmentId) {
      console.log(`   ⚠️  No treatment found for process: ${process.Name}`)
      continue
    }

    // Note: Process data could be stored in a JSONB field or separate table
    // For now, log them for manual review
    console.log(`   📝 Process for ${serviceSlug}: ${process.Name}`)
  }

  console.log('   ✅ Processes reviewed (manual integration may be needed)')
}

async function main() {
  console.log('🚀 Starting Legacy CSV Data Migration')
  console.log('=====================================')

  try {
    // Run migrations in sequence
    await migrateServices()
    await migrateTeam()
    await migrateFAQs()
    await migrateProcesses()

    console.log('\n✅ Migration completed successfully!')
    console.log('=====================================')
    console.log('📊 Summary:')
    console.log('   - Check Supabase Studio for imported data')
    console.log('   - Review treatments, team members, and FAQs')
    console.log('   - Update English translations manually if needed')

  } catch (error) {
    console.error('\n❌ Migration failed:', error)
    process.exit(1)
  }
}

// Run migration
if (require.main === module) {
  main()
}
