import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables from .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') })

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const streamers = [
  'theburntpeanut', 'shroud', 'summit1g', 'recrent', 'cohhcarnage',
  'timthetatman', 'nickmercs', 'ninja', 'sxb', 'wtcn',
  'zackrawrr', 'LIRIK', 'DrDisRespecT', 'sequisha', 'grimmmz',
  'lost', 'sacriel', 'anthony_kongphan', 'thespudhunter', 'solidfps',
  'HutchMF', 'cloakzy', 'Myth_', 'RNGingy', 'xQc',
  'Nadeshot', 'Symfuhny', 'Tfue', 'Swagg', 'Aceu',
  'iiTzTimmy', 'FaZeJSmooth', 'HusKerrs', 'Klean', 'Gigz',
  'Astatoro', 'Phillygamer98', 'BasicallyZen', 'Phixate', 'RamenStyle',
  'Bearki', 'Jesse', 'Qloud', 'ON1C', 'BoschPlays',
  'MrC0d3r', 'Skulldar_', 'Paitambemjoga', 'RAIDER21', 'RiotGamesFPS',
  'RogueNine'
]

async function addStreamerBounties() {
  console.log('Adding streamer bounties...')

  // First, get a PR user to use as creator
  const { data: prUsers, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('game_role', 'PR')
    .limit(1)

  if (userError || !prUsers || prUsers.length === 0) {
    console.error('Error: No PR (Proud Rat) user found. Please create a user first.')
    process.exit(1)
  }

  const creatorId = prUsers[0].id
  console.log(`✓ Found PR user: ${creatorId}`)

  // Create bounties for all streamers
  const bounties = streamers.map(gamertag => ({
    target_gamertag: gamertag,
    bounty_amount: 1,
    created_by: creatorId,
    platform: 'steam',
    status: 'active',
    kill_type: 'other'
  }))

  const { data, error } = await supabase
    .from('bounties')
    .insert(bounties)
    .select()

  if (error) {
    console.error('Error adding streamer bounties:', error)
    process.exit(1)
  }

  console.log(`✓ Successfully added ${data?.length || 0} streamer bounties!`)

  // Verify the bounties
  const { data: verifyData, error: verifyError } = await supabase
    .from('bounties')
    .select('target_gamertag, bounty_amount, status, created_at')
    .in('target_gamertag', streamers)
    .order('created_at', { ascending: false })

  if (!verifyError && verifyData) {
    console.log(`\n✓ Verified ${verifyData.length} streamer bounties in database:`)
    console.log('Top 10:')
    verifyData.slice(0, 10).forEach(b => {
      console.log(`  - ${b.target_gamertag} (${b.status})`)
    })
    if (verifyData.length > 10) {
      console.log(`  ... and ${verifyData.length - 10} more`)
    }
  }
}

addStreamerBounties()
