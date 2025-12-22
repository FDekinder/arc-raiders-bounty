// Script to populate the database with fake users, bounties, and kills for testing
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'
import { fileURLToPath } from 'url'

// Load .env.local file
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables!')
  console.error('Please set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Fake user data - 10 of each role
const fakeBountyHunters = [
  { username: 'ShadowHunter', game_role: 'BH', platform: 'steam' },
  { username: 'RaidMaster', game_role: 'BH', platform: 'xbox' },
  { username: 'StormBreaker', game_role: 'BH', platform: 'playstation' },
  { username: 'NightStalker', game_role: 'BH', platform: 'steam' },
  { username: 'IronWolf', game_role: 'BH', platform: 'xbox' },
  { username: 'VoidWalker', game_role: 'BH', platform: 'playstation' },
  { username: 'CrimsonBlade', game_role: 'BH', platform: 'steam' },
  { username: 'BloodHawk', game_role: 'BH', platform: 'xbox' },
  { username: 'ThunderFist', game_role: 'BH', platform: 'playstation' },
  { username: 'DarkWolf', game_role: 'BH', platform: 'steam' },
]

const fakeProudRats = [
  { username: 'DeadShot', game_role: 'PR', platform: 'steam', clan_tag: 'KILL' },
  { username: 'PhantomKill', game_role: 'PR', platform: 'xbox', clan_tag: 'SHAD' },
  { username: 'Reaper', game_role: 'PR', platform: 'playstation', clan_tag: '' },
  { username: 'SilentAssassin', game_role: 'PR', platform: 'steam', clan_tag: 'SNK' },
  { username: 'GhostRider', game_role: 'PR', platform: 'xbox', clan_tag: '' },
  { username: 'WarMachine', game_role: 'PR', platform: 'playstation', clan_tag: 'WAR' },
  { username: 'Executioner', game_role: 'PR', platform: 'steam', clan_tag: 'EXEC' },
  { username: 'VenomStrike', game_role: 'PR', platform: 'xbox', clan_tag: 'VNM' },
  { username: 'IronFist', game_role: 'PR', platform: 'playstation', clan_tag: '' },
  { username: 'DarkPhoenix', game_role: 'PR', platform: 'steam', clan_tag: 'PHX' },
]

async function seedFakeData() {
  console.log('Starting to seed fake data...')

  try {
    // Create fake Bounty Hunter users
    console.log('\n1. Creating fake Bounty Hunter users...')
    const bhUserIds: string[] = []
    for (const bh of fakeBountyHunters) {
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: `${bh.username.toLowerCase()}@fake.com`,
        password: 'FakePassword123!',
        email_confirm: true,
        user_metadata: {
          username: bh.username,
          game_role: bh.game_role,
          platform: bh.platform,
        },
      })

      if (authError) {
        console.error(`Error creating auth user ${bh.username}:`, authError)
        continue
      }

      if (authData.user) {
        bhUserIds.push(authData.user.id)
        console.log(`✓ Created BH user: ${bh.username} (${authData.user.id})`)
      }
    }

    // Create fake Proud Rat users
    console.log('\n2. Creating fake Proud Rat users...')
    const prUserIds: string[] = []
    for (const pr of fakeProudRats) {
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: `${pr.username.toLowerCase()}@fake.com`,
        password: 'FakePassword123!',
        email_confirm: true,
        user_metadata: {
          username: pr.username,
          game_role: pr.game_role,
          platform: pr.platform,
          clan_tag: pr.clan_tag,
        },
      })

      if (authError) {
        console.error(`Error creating auth user ${pr.username}:`, authError)
        continue
      }

      if (authData.user) {
        prUserIds.push(authData.user.id)
        console.log(`✓ Created PR user: ${pr.username} (${authData.user.id})`)
      }
    }

    // Wait for profiles to be created by trigger
    console.log('\nWaiting 2 seconds for profiles to be created...')
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Create bounties on Bounty Hunters
    console.log('\n3. Creating bounties...')
    const bountyAmounts = [1000, 500, 300, 200, 150, 100, 75, 50, 40, 30]
    for (let i = 0; i < Math.min(bhUserIds.length, bountyAmounts.length); i++) {
      // Get the BH user
      const { data: bhUser } = await supabase
        .from('users')
        .select('username')
        .eq('id', bhUserIds[i])
        .single()

      if (!bhUser) continue

      // Create bounty with a random PR user as creator
      const creatorId = prUserIds[Math.floor(Math.random() * prUserIds.length)]
      const { error: bountyError } = await supabase.from('bounties').insert({
        target_gamertag: bhUser.username,
        bounty_amount: bountyAmounts[i],
        status: 'active',
        created_by: creatorId,
        platform: 'steam',
      })

      if (bountyError) {
        console.error(`Error creating bounty for ${bhUser.username}:`, bountyError)
      } else {
        console.log(`✓ Created bounty: ${bountyAmounts[i]} on ${bhUser.username}`)
      }
    }

    // Create kills - distribution: 25, 20, 18, 15, 13, 10, 8, 6, 4, 2
    console.log('\n4. Creating kills...')
    const killCounts = [25, 20, 18, 15, 13, 10, 8, 6, 4, 2]
    for (let i = 0; i < Math.min(prUserIds.length, killCounts.length); i++) {
      const killerId = prUserIds[i]

      // Get killer username from users table
      const { data: killerUser } = await supabase
        .from('users')
        .select('username')
        .eq('id', killerId)
        .single()

      if (!killerUser) continue

      // Create kills with random BH victims
      for (let j = 0; j < killCounts[i]; j++) {
        const victimId = bhUserIds[j % bhUserIds.length]

        const { data: victimUser } = await supabase
          .from('users')
          .select('username')
          .eq('id', victimId)
          .single()

        if (!victimUser) continue

        const { error: killError } = await supabase.from('kills').insert({
          killer_id: killerId,
          victim_gamertag: victimUser.username,
          screenshot_url: 'https://fake-proof.com/screenshot.jpg',
          verification_status: 'approved',
        })

        if (killError) {
          console.error(`Error creating kill:`, killError)
        }
      }

      console.log(`✓ Created ${killCounts[i]} kills for ${killerUser.username}`)
    }

    // Update kill_count in users table
    console.log('\n5. Updating kill counts in users table...')
    for (const killerId of prUserIds) {
      const { data: kills } = await supabase
        .from('kills')
        .select('id')
        .eq('killer_id', killerId)
        .eq('verification_status', 'approved')

      const killCount = kills?.length || 0

      const { error: updateError } = await supabase
        .from('users')
        .update({ kill_count: killCount })
        .eq('id', killerId)

      if (updateError) {
        console.error(`Error updating kill count:`, updateError)
      }
    }

    const { data: updatedPRUsers } = await supabase
      .from('users')
      .select('username, kill_count')
      .eq('game_role', 'PR')
      .order('kill_count', { ascending: false })

    if (updatedPRUsers) {
      console.log('\nTop killers leaderboard:')
      updatedPRUsers.forEach((u, i) => {
        console.log(`${i + 1}. ${u.username} - ${u.kill_count} kills`)
      })
    }

    console.log('\n✅ Fake data seeding completed successfully!')
    console.log('\nFake user credentials:')
    console.log('Email format: <username>@fake.com')
    console.log('Password: FakePassword123!')
  } catch (error) {
    console.error('Error seeding fake data:', error)
    process.exit(1)
  }
}

seedFakeData()
