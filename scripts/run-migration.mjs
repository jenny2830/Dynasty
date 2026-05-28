/**
 * Runs the initial schema migration against the live Supabase project
 * using the Management API (no Supabase CLI required).
 *
 * Usage: node scripts/run-migration.mjs
 */

import { readFileSync } from 'fs'
import { createClient } from '@supabase/supabase-js'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Load .env.local manually (no dotenv dependency needed)
const envPath = join(__dirname, '..', '.env.local')
const envContent = readFileSync(envPath, 'utf-8')
const env = {}
for (const line of envContent.split('\n')) {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith('#')) continue
  const eqIdx = trimmed.indexOf('=')
  if (eqIdx === -1) continue
  const key = trimmed.slice(0, eqIdx).trim()
  const value = trimmed.slice(eqIdx + 1).trim()
  env[key] = value
}

const SUPABASE_URL = env['NEXT_PUBLIC_SUPABASE_URL']
const SERVICE_ROLE_KEY = env['SUPABASE_SERVICE_ROLE_KEY']

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌  Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

// Extract project ref from URL: https://<ref>.supabase.co
const projectRef = new URL(SUPABASE_URL).hostname.split('.')[0]

console.log(`\n🏛  DYNASTY — Database Migration`)
console.log(`   Project : ${projectRef}`)
console.log(`   URL     : ${SUPABASE_URL}\n`)

// Read the migration SQL
const sqlPath = join(__dirname, '..', 'supabase', 'migrations', '001_initial_schema.sql')
const sql = readFileSync(sqlPath, 'utf-8')

// Run via Supabase Management API
const response = await fetch(
  `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({ query: sql }),
  }
)

if (!response.ok) {
  // Try direct SQL via the pg-meta endpoint
  console.log('Management API attempt failed, trying pg-meta endpoint...')
  const pgResponse = await fetch(
    `${SUPABASE_URL}/rest/v1/rpc/exec_sql`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({ query: sql }),
    }
  )
  
  if (!pgResponse.ok) {
    const err = await pgResponse.text()
    console.log(`pg-meta status: ${pgResponse.status}`)
    console.log(`Response: ${err.slice(0, 500)}`)
    console.log('\n⚠️  Direct API migration not available in all Supabase tiers.')
    console.log('   Please run the migration manually via the Supabase Dashboard SQL Editor:')
    console.log('   https://supabase.com/dashboard/project/' + projectRef + '/sql/new\n')
    // Fall through to verification
  } else {
    console.log('✅  Migration applied via pg-meta')
  }
} else {
  const result = await response.json()
  console.log('✅  Migration applied via Management API')
  console.log(JSON.stringify(result, null, 2))
}

// Verify tables exist using the anon client
console.log('\n🔍  Verifying tables...')
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

const EXPECTED_TABLES = [
  'landlords',
  'properties',
  'units',
  'tenants',
  'leases',
  'expense_categories',
  'transactions',
  'receipts',
  'recurring_payments',
  'reminders',
  'reports',
]

const results = await Promise.all(
  EXPECTED_TABLES.map(async (table) => {
    const { error } = await supabase.from(table).select('*').limit(0)
    return { table, exists: !error, error: error?.message }
  })
)

let allGood = true
for (const { table, exists, error } of results) {
  if (exists) {
    console.log(`   ✅  ${table}`)
  } else {
    console.log(`   ❌  ${table} — ${error}`)
    allGood = false
  }
}

// Check expense_categories seed
const { data: cats } = await supabase.from('expense_categories').select('name')
console.log(`\n   📂  expense_categories seeded: ${cats?.length ?? 0} rows`)

if (allGood) {
  console.log('\n✨  All tables verified — database is ready!\n')
} else {
  console.log('\n⚠️  Some tables are missing. If migration was not applied automatically,')
  console.log('   copy supabase/migrations/001_initial_schema.sql into the Supabase SQL Editor and run it.')
  console.log(`   https://supabase.com/dashboard/project/${projectRef}/sql/new\n`)
}
