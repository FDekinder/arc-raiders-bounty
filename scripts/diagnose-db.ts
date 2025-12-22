// Diagnostic script to check database state
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'
import { fileURLToPath } from 'url'

// Load .env.local file
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.VITE_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables!')
  console.error('VITE_SUPABASE_URL:', supabaseUrl)
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'SET' : 'NOT SET')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function diagnoseDatabase() {
  console.log('🔍 DIAGNOSTIC REPORT\n')

  // Check users
  console.log('1️⃣ CHECKING USERS TABLE:')
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('username, kill_count, game_role')
    .in('game_role', ['BH', 'PR'])
    .order('kill_count', { ascending: false })

  if (usersError) {
    console.error('Error fetching users:', usersError)
  } else {
    console.log(`   Total BH/PR users: ${users?.length || 0}`)
    console.log('   Top 10 by kill_count:')
    users?.slice(0, 10).forEach((u, i) => {
      console.log(`   ${i + 1}. ${u.username} (${u.game_role}) - ${u.kill_count || 0} kills`)
    })
  }

  // Check total kills
  console.log('\n2️⃣ CHECKING KILLS TABLE:')
  const { data: kills, error: killsError } = await supabase
    .from('kills')
    .select('id, verification_status')

  if (killsError) {
    console.error('Error fetching kills:', killsError)
  } else {
    const approved = kills?.filter(k => k.verification_status === 'approved').length || 0
    const pending = kills?.filter(k => k.verification_status === 'pending').length || 0
    const rejected = kills?.filter(k => k.verification_status === 'rejected').length || 0
    console.log(`   Total kills: ${kills?.length || 0}`)
    console.log(`   - Approved: ${approved}`)
    console.log(`   - Pending: ${pending}`)
    console.log(`   - Rejected: ${rejected}`)
  }

  // Check actual kill counts per user
  console.log('\n3️⃣ CHECKING ACTUAL KILLS PER PR USER:')
  const { data: prUsers } = await supabase
    .from('users')
    .select('id, username')
    .eq('game_role', 'PR')

  if (prUsers) {
    for (const user of prUsers) {
      const { data: userKills } = await supabase
        .from('kills')
        .select('id')
        .eq('killer_id', user.id)
        .eq('verification_status', 'approved')

      console.log(`   ${user.username}: ${userKills?.length || 0} approved kills`)
    }
  }

  // Check bounties
  console.log('\n4️⃣ CHECKING BOUNTIES TABLE:')
  const { data: bounties, error: bountiesError } = await supabase
    .from('bounties')
    .select('target_gamertag, bounty_amount, status')
    .order('bounty_amount', { ascending: false })
    .limit(10)

  if (bountiesError) {
    console.error('Error fetching bounties:', bountiesError)
  } else {
    console.log(`   Total bounties checked: ${bounties?.length || 0}`)
    bounties?.forEach((b, i) => {
      console.log(`   ${i + 1}. ${b.target_gamertag} - $${b.bounty_amount} (${b.status})`)
    })
  }

  // Check ALL users to see if fake ones were created
  console.log('\n5️⃣ CHECKING ALL USERS (not just BH/PR):')
  const { data: allUsers } = await supabase
    .from('users')
    .select('username, game_role, kill_count')
    .order('username')

  if (allUsers) {
    console.log(`   Total users in database: ${allUsers.length}`)
    allUsers.forEach(u => {
      console.log(`   - ${u.username} (${u.game_role || 'NO ROLE'}) - ${u.kill_count || 0} kills`)
    })
  }

  console.log('\n✅ DIAGNOSTIC COMPLETE')
}

diagnoseDatabase()
