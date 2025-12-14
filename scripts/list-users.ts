// List all users in the database
// Run: npm run db:list-users

import supabaseAdmin from './db-admin.js'

async function listUsers() {
  console.log('👥 Fetching All Users...')
  console.log('=' .repeat(80))

  try {
    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Error fetching users:', error.message)
      process.exit(1)
    }

    if (!users || users.length === 0) {
      console.log('📭 No users found in the database')
      return
    }

    console.log(`✅ Found ${users.length} users\n`)

    // Display users in a table format
    console.log('Username'.padEnd(20) +
                'Points'.padEnd(10) +
                'Bounties'.padEnd(12) +
                'Hunted'.padEnd(10) +
                'Achievements'.padEnd(15) +
                'Created At')
    console.log('-'.repeat(80))

    for (const user of users) {
      const username = (user.username || 'N/A').substring(0, 18).padEnd(20)
      const points = (user.total_points || 0).toString().padEnd(10)
      const bounties = (user.bounties_completed || 0).toString().padEnd(12)
      const hunted = (user.times_hunted || 0).toString().padEnd(10)
      const achievements = (user.achievements_earned || 0).toString().padEnd(15)
      const created = new Date(user.created_at).toLocaleDateString()

      console.log(`${username}${points}${bounties}${hunted}${achievements}${created}`)
    }

    console.log('\n' + '='.repeat(80))
    console.log('📊 SUMMARY')
    console.log('='.repeat(80))
    console.log(`Total Users: ${users.length}`)
    console.log(`Total Points: ${users.reduce((sum, u) => sum + (u.total_points || 0), 0)}`)
    console.log(`Total Bounties Completed: ${users.reduce((sum, u) => sum + (u.bounties_completed || 0), 0)}`)
    console.log(`Total Achievements Earned: ${users.reduce((sum, u) => sum + (u.achievements_earned || 0), 0)}`)
    console.log('='.repeat(80))

  } catch (error) {
    console.error('💥 Unexpected error:', error)
    process.exit(1)
  }
}

// Run the script
listUsers()
