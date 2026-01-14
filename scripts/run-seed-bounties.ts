// Script to run the seed-fake-bounties.sql file
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'
import { fileURLToPath } from 'url'
import * as fs from 'fs'

// Load .env.local file
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

// Initialize Supabase client with service role key
const supabaseUrl = process.env.VITE_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables!')
  console.error('Please set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function runSeedScript() {
  console.log('🌱 Starting to seed fake bounty data...\n')

  try {
    // Read the SQL file
    const sqlFilePath = path.join(__dirname, 'seed-fake-bounties.sql')
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf-8')

    console.log('📄 Reading SQL file: seed-fake-bounties.sql')

    // Split the SQL into individual statements (rough split on semicolons outside of DO blocks)
    // For complex SQL with DO blocks, we'll execute the entire file as one
    console.log('🚀 Executing SQL script...\n')

    // Execute the SQL using RPC or direct query
    // Note: Supabase client doesn't support executing raw multi-statement SQL directly
    // We need to use the REST API or execute statements one by one

    // For now, let's execute via psql command (requires psql to be installed)
    const { execSync } = await import('child_process')

    // Get connection string from environment or construct it
    const databaseUrl = process.env.DATABASE_URL || constructDatabaseUrl()

    if (!databaseUrl) {
      console.error('❌ DATABASE_URL not found in environment variables')
      console.error('\nPlease add DATABASE_URL to your .env.local file:')
      console.error('DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres')
      process.exit(1)
    }

    try {
      // Execute SQL file using psql
      console.log('Executing via psql...')
      execSync(`psql "${databaseUrl}" -f "${sqlFilePath}"`, {
        stdio: 'inherit',
      })

      console.log('\n✅ Fake bounty data seeded successfully!')
      console.log('\n🎯 What was created:')
      console.log('   - 20+ fake users (Bounty Hunters and Proud Rats)')
      console.log('   - 25+ active bounties with varying amounts')
      console.log('   - Hunters assigned to bounties')
      console.log('   - Kill records for top Proud Rats')
      console.log('\n🌐 Visit your homepage to see the Most Wanted Top 3!')
      console.log('   👉 https://www.dont-shoot.com')
    } catch (psqlError: any) {
      console.error('❌ psql command failed. Trying alternative method...')

      // Alternative: Execute statements one by one using Supabase client
      await executeSqlAlternative(sqlContent)
    }
  } catch (error: any) {
    console.error('❌ Error seeding data:', error.message)
    process.exit(1)
  }
}

// Construct database URL from Supabase credentials
function constructDatabaseUrl(): string | null {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || ''
  const dbPassword = process.env.SUPABASE_DB_PASSWORD || ''

  if (!supabaseUrl || !dbPassword) return null

  // Extract project ref from Supabase URL
  const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1]
  if (!projectRef) return null

  return `postgresql://postgres:${dbPassword}@db.${projectRef}.supabase.co:5432/postgres`
}

// Alternative method: Execute SQL using Supabase client (limited)
async function executeSqlAlternative(sqlContent: string) {
  console.log('\n📝 Using alternative execution method...')
  console.log('⚠️  Note: This method has limitations with complex SQL')

  // This is a simplified approach - may not work for all SQL
  const statements = sqlContent
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith('--'))

  for (const statement of statements) {
    if (statement.length > 10) {
      try {
        const { error } = await supabase.rpc('exec', { sql: statement })
        if (error) {
          console.warn('⚠️  Statement failed:', statement.substring(0, 50) + '...')
        }
      } catch (err) {
        console.warn('⚠️  Could not execute statement')
      }
    }
  }

  console.log('\n⚠️  Alternative method completed with limitations')
  console.log('For best results, run the SQL file directly in Supabase SQL Editor:')
  console.log('1. Go to your Supabase project dashboard')
  console.log('2. Click on "SQL Editor" in the sidebar')
  console.log('3. Click "New Query"')
  console.log('4. Paste the contents of scripts/seed-fake-bounties.sql')
  console.log('5. Click "Run"')
}

// Run the script
runSeedScript()
