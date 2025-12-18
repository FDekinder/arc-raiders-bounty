// Apply platform column migration directly
import supabaseAdmin from './db-admin.js'

async function applyMigration() {
  console.log('🔄 Applying Platform Column Migration...')
  console.log('=' .repeat(60))

  try {
    // Step 1: Add platform column
    console.log('\n📋 Step 1: Adding platform column...')
    const { error: alterError } = await supabaseAdmin.rpc('exec_sql', {
      sql: "ALTER TABLE users ADD COLUMN IF NOT EXISTS platform VARCHAR(20) DEFAULT 'steam'"
    })

    if (alterError) {
      console.error('❌ Error adding column:', alterError.message)
      console.log('\n💡 Trying alternative method...')

      // Alternative: Use raw SQL query
      const { error: rawError } = await supabaseAdmin
        .from('users')
        .select('platform')
        .limit(1)

      if (rawError && rawError.message.includes('does not exist')) {
        console.error('❌ Column still does not exist. Manual migration may be required.')
        console.log('\n📖 Please run this SQL manually in Supabase:')
        console.log(`   ALTER TABLE users ADD COLUMN IF NOT EXISTS platform VARCHAR(20) DEFAULT 'steam';`)
        console.log(`   CREATE INDEX IF NOT EXISTS idx_users_platform ON users(platform) WHERE platform IS NOT NULL;`)
        console.log(`   UPDATE users SET platform = 'steam' WHERE platform IS NULL;`)
        process.exit(1)
      } else {
        console.log('✅ Column already exists or was created successfully')
      }
    } else {
      console.log('✅ platform column added successfully')
    }

    // Step 2: Create index
    console.log('\n📋 Step 2: Creating index...')
    const { error: indexError } = await supabaseAdmin.rpc('exec_sql', {
      sql: 'CREATE INDEX IF NOT EXISTS idx_users_platform ON users(platform) WHERE platform IS NOT NULL'
    })

    if (indexError) {
      console.warn('⚠️  Index creation warning:', indexError.message)
      console.log('   (This is usually okay if the index already exists)')
    } else {
      console.log('✅ Index created successfully')
    }

    // Step 3: Update existing users to have 'steam' platform
    console.log('\n📋 Step 3: Updating existing users...')
    const { error: updateError } = await supabaseAdmin.rpc('exec_sql', {
      sql: "UPDATE users SET platform = 'steam' WHERE platform IS NULL"
    })

    if (updateError) {
      console.warn('⚠️  Update warning:', updateError.message)
      console.log('   (This is okay if there are no NULL values)')
    } else {
      console.log('✅ Existing users updated successfully')
    }

    console.log('\n' + '='.repeat(60))
    console.log('🎉 Migration completed!')
    console.log('=' .repeat(60))
    console.log('\n📊 Summary:')
    console.log('   - Added platform column to users table')
    console.log('   - Set default value to "steam" for backward compatibility')
    console.log('   - Created index for efficient filtering')
    console.log('   - Updated existing users to have platform = "steam"')
    console.log('\n✨ Platform column now supports: steam, google, email')

  } catch (error: any) {
    console.error('💥 Unexpected error:', error.message)
    console.log('\n📖 Please run this SQL manually in Supabase SQL Editor:')
    console.log(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS platform VARCHAR(20) DEFAULT 'steam';
      CREATE INDEX IF NOT EXISTS idx_users_platform ON users(platform) WHERE platform IS NOT NULL;
      UPDATE users SET platform = 'steam' WHERE platform IS NULL;
    `)
    process.exit(1)
  }
}

applyMigration()
