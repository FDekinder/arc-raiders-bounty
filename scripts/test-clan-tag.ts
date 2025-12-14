// Test clan tag functionality
import supabaseAdmin from './db-admin.js'

async function testClanTag() {
  console.log('🧪 Testing Clan Tag Feature...')
  console.log('=' .repeat(60))

  try {
    // Test 1: Check if clan_tag column exists
    console.log('\n📋 Test 1: Checking if clan_tag column exists...')
    const { data: columns, error: columnError } = await supabaseAdmin
      .from('users')
      .select('clan_tag')
      .limit(1)

    if (columnError) {
      console.error('❌ clan_tag column does not exist:', columnError.message)
      console.log('\n💡 Run migration first: npm run db:migrate add_clan_tag.sql')
      return
    }

    console.log('✅ clan_tag column exists')

    // Test 2: Get current users
    console.log('\n📋 Test 2: Fetching users...')
    const { data: users, error: usersError } = await supabaseAdmin
      .from('users')
      .select('id, username, clan_tag')
      .limit(5)

    if (usersError) {
      console.error('❌ Error fetching users:', usersError.message)
      return
    }

    console.log(`✅ Found ${users?.length || 0} users`)
    if (users && users.length > 0) {
      console.log('\n📊 Sample users:')
      users.forEach((user, i) => {
        const clanTag = user.clan_tag ? `[${user.clan_tag}]` : '[no clan tag]'
        console.log(`   ${i + 1}. ${clanTag} ${user.username}`)
      })
    }

    console.log('\n' + '='.repeat(60))
    console.log('✅ All tests passed!')
    console.log('=' .repeat(60))

  } catch (error) {
    console.error('💥 Unexpected error:', error)
    process.exit(1)
  }
}

testClanTag()
