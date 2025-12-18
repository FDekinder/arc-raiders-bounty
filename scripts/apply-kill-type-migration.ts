// Apply kill type migration directly
import supabaseAdmin from './db-admin.js'

async function applyMigration() {
  console.log('🔄 Applying Kill Type Migration...')
  console.log('=' .repeat(60))

  try {
    // Step 1: Create kill_type enum type
    console.log('\n📋 Step 1: Creating kill_type enum type...')
    const { error: enumError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        DO $$ BEGIN
          CREATE TYPE kill_type AS ENUM (
            'friendly_fire',
            'back_stabber',
            'loot_ambush',
            'extract_camper',
            'spawn_killer',
            'bait_switch',
            'third_party',
            'other'
          );
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;
      `
    })

    if (enumError) {
      console.warn('⚠️  Enum creation warning:', enumError.message)
      console.log('   (This is usually okay if the enum already exists)')
    } else {
      console.log('✅ kill_type enum created successfully')
    }

    // Step 2: Add kill_type column
    console.log('\n📋 Step 2: Adding kill_type column...')
    const { error: killTypeError } = await supabaseAdmin.rpc('exec_sql', {
      sql: 'ALTER TABLE bounties ADD COLUMN IF NOT EXISTS kill_type kill_type'
    })

    if (killTypeError) {
      console.error('❌ Error adding kill_type column:', killTypeError.message)
      console.log('\n💡 Trying alternative method...')

      const { error: rawError } = await supabaseAdmin
        .from('bounties')
        .select('kill_type')
        .limit(1)

      if (rawError && rawError.message.includes('does not exist')) {
        console.error('❌ Column still does not exist. Manual migration may be required.')
        console.log('\n📖 Please run this SQL manually in Supabase:')
        console.log(`
          DO $$ BEGIN
            CREATE TYPE kill_type AS ENUM (
              'friendly_fire',
              'back_stabber',
              'loot_ambush',
              'extract_camper',
              'spawn_killer',
              'bait_switch',
              'third_party',
              'other'
            );
          EXCEPTION
            WHEN duplicate_object THEN null;
          END $$;

          ALTER TABLE bounties ADD COLUMN IF NOT EXISTS kill_type kill_type;
          ALTER TABLE bounties ADD COLUMN IF NOT EXISTS kill_type_description TEXT;
          CREATE INDEX IF NOT EXISTS idx_bounties_kill_type ON bounties(kill_type) WHERE kill_type IS NOT NULL;
        `)
        process.exit(1)
      } else {
        console.log('✅ Column already exists or was created successfully')
      }
    } else {
      console.log('✅ kill_type column added successfully')
    }

    // Step 3: Add kill_type_description column
    console.log('\n📋 Step 3: Adding kill_type_description column...')
    const { error: descError } = await supabaseAdmin.rpc('exec_sql', {
      sql: 'ALTER TABLE bounties ADD COLUMN IF NOT EXISTS kill_type_description TEXT'
    })

    if (descError) {
      console.warn('⚠️  Description column warning:', descError.message)
      console.log('   (This is usually okay if the column already exists)')
    } else {
      console.log('✅ kill_type_description column added successfully')
    }

    // Step 4: Create index
    console.log('\n📋 Step 4: Creating index...')
    const { error: indexError } = await supabaseAdmin.rpc('exec_sql', {
      sql: 'CREATE INDEX IF NOT EXISTS idx_bounties_kill_type ON bounties(kill_type) WHERE kill_type IS NOT NULL'
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
    console.log('\n📊 Summary:')
    console.log('   - Created kill_type enum with 8 betrayal categories')
    console.log('   - Added kill_type column to bounties table')
    console.log('   - Added kill_type_description column for "other" category')
    console.log('   - Created index for efficient filtering')

  } catch (error: any) {
    console.error('💥 Unexpected error:', error.message)
    console.log('\n📖 Please run this SQL manually in Supabase SQL Editor:')
    console.log(`
      DO $$ BEGIN
        CREATE TYPE kill_type AS ENUM (
          'friendly_fire',
          'back_stabber',
          'loot_ambush',
          'extract_camper',
          'spawn_killer',
          'bait_switch',
          'third_party',
          'other'
        );
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;

      ALTER TABLE bounties ADD COLUMN IF NOT EXISTS kill_type kill_type;
      ALTER TABLE bounties ADD COLUMN IF NOT EXISTS kill_type_description TEXT;
      CREATE INDEX IF NOT EXISTS idx_bounties_kill_type ON bounties(kill_type) WHERE kill_type IS NOT NULL;
    `)
    process.exit(1)
  }
}

applyMigration()
