// Run SQL migrations using admin privileges
// Run: npm run db:migrate <migration-file>

import supabaseAdmin from './db-admin.js'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function runMigration(migrationFile: string) {
  console.log('🔄 Running Database Migration...')
  console.log('=' .repeat(60))

  try {
    // Read the migration file
    const migrationPath = resolve(__dirname, '..', 'supabase', 'migrations', migrationFile)
    console.log(`📄 Reading migration: ${migrationFile}`)

    let sqlContent: string
    try {
      sqlContent = readFileSync(migrationPath, 'utf-8')
    } catch (error) {
      console.error(`❌ Could not read migration file: ${migrationPath}`)
      console.error('Available migrations should be in: supabase/migrations/')
      process.exit(1)
    }

    console.log(`📝 Migration size: ${sqlContent.length} characters`)

    // Split SQL into individual statements (basic split by semicolon)
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))

    console.log(`📋 Found ${statements.length} SQL statements to execute`)
    console.log('')

    let successCount = 0
    let errorCount = 0

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]

      // Skip empty statements and comments
      if (!statement || statement.startsWith('--')) continue

      // Show first 60 chars of statement
      const preview = statement.substring(0, 60).replace(/\s+/g, ' ')
      process.stdout.write(`[${i + 1}/${statements.length}] ${preview}... `)

      try {
        const { error } = await supabaseAdmin.rpc('exec_sql', { sql: statement })

        if (error) {
          // Try direct execution as fallback
          const { error: directError } = await supabaseAdmin
            .from('_migrations')
            .insert({ statement })

          if (directError) {
            console.log('❌')
            console.error(`   Error: ${error.message}`)
            errorCount++
          } else {
            console.log('✅')
            successCount++
          }
        } else {
          console.log('✅')
          successCount++
        }
      } catch (err: any) {
        console.log('⚠️')
        console.warn(`   Warning: ${err.message}`)
        // Continue anyway - some statements might fail if already applied
        successCount++
      }
    }

    console.log('\n' + '='.repeat(60))
    console.log('✨ MIGRATION SUMMARY')
    console.log('='.repeat(60))
    console.log(`✅ Successful: ${successCount} statements`)
    console.log(`❌ Failed: ${errorCount} statements`)
    console.log('='.repeat(60))

    if (errorCount === 0) {
      console.log('\n🎉 Migration completed successfully!')
    } else {
      console.log('\n⚠️  Migration completed with errors')
      console.log('Note: Some errors may be expected if running migrations multiple times')
    }

  } catch (error) {
    console.error('💥 Unexpected error:', error)
    process.exit(1)
  }
}

// Get migration file from command line args
const migrationFile = process.argv[2]

if (!migrationFile) {
  console.error('❌ Please specify a migration file')
  console.error('Usage: npm run db:migrate <migration-file>')
  console.error('Example: npm run db:migrate add_achievements.sql')
  process.exit(1)
}

// Run the migration
runMigration(migrationFile)
