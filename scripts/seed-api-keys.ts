/**
 * Seed API Keys from .env to Database
 *
 * This script reads API keys from .env.local and seeds them into the database.
 * Run with: npx tsx scripts/seed-api-keys.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Read .env.local file
const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');

// Parse env file
const envVars: Record<string, string> = {};
envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...valueParts] = trimmed.split('=');
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join('=').trim();
    }
  }
});

// Initialize Supabase client
const supabaseUrl = envVars['NEXT_PUBLIC_SUPABASE_URL'] || 'http://127.0.0.1:54321';
const supabaseKey = envVars['SUPABASE_SERVICE_ROLE_KEY'] || '';

const supabase = createClient(supabaseUrl, supabaseKey);

// Define API key mappings
const apiKeyMappings = [
  // Supabase
  {
    name: 'NEXT_PUBLIC_SUPABASE_URL',
    service: 'supabase',
    description: 'Supabase project URL',
    is_active: true,
  },
  {
    name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    service: 'supabase',
    description: 'Supabase anonymous key (public)',
    is_active: true,
  },
  {
    name: 'SUPABASE_SERVICE_ROLE_KEY',
    service: 'supabase',
    description: 'Supabase service role key (sensitive - full access)',
    is_active: true,
  },
  // Google
  {
    name: 'NEXT_PUBLIC_GOOGLE_PLACES_API_KEY',
    service: 'google',
    description: 'Google Places API key for reviews',
    is_active: true,
  },
  {
    name: 'NEXT_PUBLIC_GOOGLE_PLACE_ID',
    service: 'google',
    description: 'Clínica Ferreira Borges Google Place ID',
    is_active: true,
  },
  {
    name: 'GOOGLE_MAPS_API_KEY',
    service: 'google',
    description: 'Google Maps API key',
    is_active: false,
  },
  {
    name: 'GOOGLE_ANALYTICS_ID',
    service: 'google',
    description: 'Google Analytics tracking ID',
    is_active: false,
  },
  // Email
  {
    name: 'SMTP_HOST',
    service: 'email',
    description: 'SMTP server host',
    is_active: false,
  },
  {
    name: 'SMTP_PORT',
    service: 'email',
    description: 'SMTP server port',
    is_active: false,
  },
  {
    name: 'SMTP_USER',
    service: 'email',
    description: 'SMTP username',
    is_active: false,
  },
  {
    name: 'SMTP_PASSWORD',
    service: 'email',
    description: 'SMTP password (sensitive)',
    is_active: false,
  },
  // Payment
  {
    name: 'STRIPE_PUBLISHABLE_KEY',
    service: 'payment',
    description: 'Stripe publishable key',
    is_active: false,
  },
  {
    name: 'STRIPE_SECRET_KEY',
    service: 'payment',
    description: 'Stripe secret key (sensitive)',
    is_active: false,
  },
  // AI
  {
    name: 'OPENAI_API_KEY',
    service: 'ai',
    description: 'OpenAI API key',
    is_active: false,
  },
];

async function seedAPIKeys() {
  console.log('🌱 Seeding API keys from .env.local...\n');

  const apiKeysToInsert = apiKeyMappings.map(mapping => {
    const value = envVars[mapping.name] || '';
    const status = value ? '✅' : '⚠️ ';

    console.log(`${status} ${mapping.name}`);
    if (value) {
      console.log(`   Value: ${value.substring(0, 20)}${value.length > 20 ? '...' : ''}`);
    } else {
      console.log(`   Value: (empty)`);
    }

    return {
      name: mapping.name,
      key_value: value,
      service: mapping.service,
      description: mapping.description,
      is_active: mapping.is_active && value !== '',
    };
  });

  console.log(`\n📊 Total keys to seed: ${apiKeysToInsert.length}`);
  console.log(`✅ Keys with values: ${apiKeysToInsert.filter(k => k.key_value).length}`);
  console.log(`⚠️  Empty keys: ${apiKeysToInsert.filter(k => !k.key_value).length}\n`);

  const { data, error } = await supabase
    .from('api_keys')
    .upsert(apiKeysToInsert, {
      onConflict: 'name',
    });

  if (error) {
    console.error('❌ Error seeding API keys:', error);
    process.exit(1);
  }

  console.log('✅ API keys seeded successfully!\n');
  console.log('🔗 View in admin panel: http://localhost:3000/admin (API Keys tab)');
}

seedAPIKeys()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
