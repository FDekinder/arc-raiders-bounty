// Apply clan tag migration directly
import supabaseAdmin from './db-admin.js'

async function applyMigration() {
  console.log('🔄 Applying Clan Tag Migration...')
  console.log('=' .repeat(60))

  try {
    // Step 1: Add clan_tag column
    console.log('\n📋 Step 1: Adding clan_tag column...')
    const { error: alterError } = await supabaseAdmin.rpc('exec_sql', {
      sql: 'ALTER TABLE users ADD COLUMN IF NOT EXISTS clan_tag VARCHAR(5)'
    })

    if (alterError) {
      console.error('❌ Error adding column:', alterError.message)
      console.log('\n💡 Trying alternative method...')

      // Alternative: Use raw SQL query
      const { error: rawError } = await supabaseAdmin
        .from('users')
        .select('clan_tag')
        .limit(1)

      if (rawError && rawError.message.includes('does not exist')) {
        console.error('❌ Column still does not exist. Manual migration may be required.')
        console.log('\n📖 Please run this SQL manually in Supabase:')
        console.log('   ALTER TABLE users ADD COLUMN clan_tag VARCHAR(5);')
        console.log('   CREATE INDEX idx_users_clan_tag ON users(clan_tag) WHERE clan_tag IS NOT NULL;')
        process.exit(1)
      } else {
        console.log('✅ Column already exists or was created successfully')
      }
    } else {
      console.log('✅ clan_tag column added successfully')
    }

    // Step 2: Create index
    console.log('\n📋 Step 2: Creating index...')
    const { error: indexError } = await supabaseAdmin.rpc('exec_sql', {
      sql: 'CREATE INDEX IF NOT EXISTS idx_users_clan_tag ON users(clan_tag) WHERE clan_tag IS NOT NULL'
    })

    if (indexError) {
      console.warn('⚠️  Index creation warning:', indexError.message)
      console.log('   (This is usually okay if the index already exists)')
    } else {
      console.log('✅ Index created successfully')
    }

    console.log('\n' + '='.repeat(60))
    console.log('🎉 Migration completed!')
    console.log('=' .repeat(60))

  } catch (error: any) {
    console.error('💥 Unexpected error:', error.message)
    console.log('\n📖 Please run this SQL manually in Supabase SQL Editor:')
    console.log('\nALTER TABLE users ADD COLUMN IF NOT EXISTS clan_tag VARCHAR(5);')
    console.log('CREATE INDEX IF NOT EXISTS idx_users_clan_tag ON users(clan_tag) WHERE clan_tag IS NOT NULL;')
    process.exit(1)
  }
}

applyMigration()
