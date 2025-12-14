// Script to seed achievements and grant all to CoDeBarS
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
dotenv.config({ path: resolve(__dirname, '.env.local') })
dotenv.config({ path: resolve(__dirname, '.env') })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials in environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Achievement seed data from the migration file
const achievementSeeds = [
  // Common Achievements (Beginner)
  { name: 'First Blood', description: 'Complete your first bounty hunt', icon: 'Target', category: 'hunter', requirement_type: 'bounties_completed', requirement_value: 1, badge_color: '#00ff88', rarity: 'common', points_reward: 10 },
  { name: 'Getting Started', description: 'Create your first bounty', icon: 'CircleDollarSign', category: 'creator', requirement_type: 'bounties_created', requirement_value: 1, badge_color: '#00d4ff', rarity: 'common', points_reward: 5 },
  { name: 'Hunter Initiate', description: 'Join your first hunt', icon: 'Crosshair', category: 'hunter', requirement_type: 'hunts_joined', requirement_value: 1, badge_color: '#00d4ff', rarity: 'common', points_reward: 5 },

  // Rare Achievements (Intermediate)
  { name: 'Sharpshooter', description: 'Complete 10 bounty hunts', icon: 'Crosshair', category: 'hunter', requirement_type: 'bounties_completed', requirement_value: 10, badge_color: '#00ff88', rarity: 'rare', points_reward: 50 },
  { name: 'Hot Streak', description: 'Complete 5 bounties in 24 hours', icon: 'Flame', category: 'hunter', requirement_type: 'streak_24h', requirement_value: 5, badge_color: '#ff3355', rarity: 'rare', points_reward: 100 },
  { name: 'Generous Hunter', description: 'Create 10 bounties', icon: 'Gift', category: 'creator', requirement_type: 'bounties_created', requirement_value: 10, badge_color: '#ffd500', rarity: 'rare', points_reward: 50 },
  { name: 'Point Collector', description: 'Earn 500 total points', icon: 'TrendingUp', category: 'milestone', requirement_type: 'points_earned', requirement_value: 500, badge_color: '#ffd500', rarity: 'rare', points_reward: 75 },

  // Epic Achievements (Advanced)
  { name: 'Veteran Hunter', description: 'Complete 50 bounty hunts', icon: 'Award', category: 'hunter', requirement_type: 'bounties_completed', requirement_value: 50, badge_color: '#ff3355', rarity: 'epic', points_reward: 200 },
  { name: 'Big Game Hunter', description: 'Complete a bounty worth 1000+ points', icon: 'Trophy', category: 'hunter', requirement_type: 'single_bounty_value', requirement_value: 1000, badge_color: '#ff3355', rarity: 'epic', points_reward: 150 },
  { name: 'Speed Demon', description: 'Complete a bounty within 1 hour of claiming', icon: 'Zap', category: 'hunter', requirement_type: 'speed_completion', requirement_value: 1, badge_color: '#ffd500', rarity: 'epic', points_reward: 150 },
  { name: 'Point Master', description: 'Earn 2500 total points', icon: 'Medal', category: 'milestone', requirement_type: 'points_earned', requirement_value: 2500, badge_color: '#ffd500', rarity: 'epic', points_reward: 250 },
  { name: 'Bounty Lord', description: 'Create 50 bounties', icon: 'Crown', category: 'creator', requirement_type: 'bounties_created', requirement_value: 50, badge_color: '#00d4ff', rarity: 'epic', points_reward: 200 },

  // Legendary Achievements (Expert)
  { name: 'Legendary Hunter', description: 'Complete 100 bounty hunts', icon: 'Crown', category: 'hunter', requirement_type: 'bounties_completed', requirement_value: 100, badge_color: '#ffd500', rarity: 'legendary', points_reward: 500 },
  { name: 'Point Legend', description: 'Earn 10000 total points', icon: 'Star', category: 'milestone', requirement_type: 'points_earned', requirement_value: 10000, badge_color: '#ffd500', rarity: 'legendary', points_reward: 1000 },
  { name: 'Apex Predator', description: 'Reach #1 on the leaderboard', icon: 'Trophy', category: 'milestone', requirement_type: 'leaderboard_rank', requirement_value: 1, badge_color: '#ff3355', rarity: 'legendary', points_reward: 500 },
  { name: 'Untouchable', description: 'Spend 30 consecutive days without an active bounty on you', icon: 'Shield', category: 'social', requirement_type: 'safe_streak', requirement_value: 30, badge_color: '#00ff88', rarity: 'legendary', points_reward: 750 },
  { name: 'Master Benefactor', description: 'Create 100 bounties', icon: 'Coins', category: 'creator', requirement_type: 'bounties_created', requirement_value: 100, badge_color: '#00d4ff', rarity: 'legendary', points_reward: 500 },
]

interface Achievement {
  id: string
  name: string
  description: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  points_reward: number
}

async function seedAndGrantAchievements() {
  try {
    console.log('🌱 Seeding Achievements Database...')
    console.log('=' .repeat(60))

    // Check current achievement count
    const { data: existingAchievements, error: checkError } = await supabase
      .from('achievements')
      .select('id, name')

    if (checkError) {
      console.error('❌ Error accessing achievements table:', checkError.message)
      console.log('\n⚠️  The achievements table may not exist yet.')
      console.log('📝 Please create it first using the Supabase Dashboard:')
      console.log('   SQL Editor > Run: supabase/migrations/add_achievements.sql')
      return
    }

    const existingNames = new Set(existingAchievements?.map(a => a.name) || [])

    if (existingAchievements && existingAchievements.length > 0) {
      console.log(`📊 Found ${existingAchievements.length} existing achievements`)
    } else {
      console.log('📊 Achievements table is empty, seeding now...')
    }

    // Insert achievements that don't exist
    let insertedCount = 0
    let skippedCount = 0

    for (const achievement of achievementSeeds) {
      if (existingNames.has(achievement.name)) {
        skippedCount++
        continue
      }

      const { error: insertError } = await supabase
        .from('achievements')
        .insert(achievement)

      if (insertError) {
        console.error(`❌ Failed to insert "${achievement.name}":`, insertError.message)
      } else {
        insertedCount++
        const rarityEmoji = {
          common: '⚪',
          rare: '🔵',
          epic: '🟣',
          legendary: '🟡'
        }[achievement.rarity] || '⭐'
        console.log(`${rarityEmoji} Added: ${achievement.name} (${achievement.rarity})`)
      }
    }

    console.log('\n' + '-'.repeat(60))
    console.log(`✅ Inserted: ${insertedCount} new achievements`)
    console.log(`⏭️  Skipped: ${skippedCount} existing achievements`)
    console.log('-'.repeat(60))

    // Now get all achievements and grant to CoDeBarS
    console.log('\n🔍 Looking up user "CoDeBarS"...')

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, username')
      .eq('username', 'CoDeBarS')
      .single()

    if (userError || !user) {
      console.error('❌ User "CoDeBarS" not found:', userError?.message)
      return
    }

    console.log(`✅ Found user: ${user.username} (ID: ${user.id})`)

    // Get full achievement list
    console.log('\n🏆 Fetching all achievements...')
    const { data: achievements, error: achievementsError } = await supabase
      .from('achievements')
      .select('*')
      .order('rarity', { ascending: true })

    if (achievementsError || !achievements) {
      console.error('❌ Failed to fetch achievements:', achievementsError?.message)
      return
    }

    console.log(`✅ Found ${achievements.length} total achievements`)

    // Check which achievements the user already has
    const { data: userAchievements, error: existingError } = await supabase
      .from('user_achievements')
      .select('achievement_id')
      .eq('user_id', user.id)

    if (existingError) {
      console.error('❌ Failed to check existing user achievements:', existingError.message)
      return
    }

    const earnedIds = new Set(userAchievements?.map(a => a.achievement_id) || [])
    console.log(`📊 User already has ${earnedIds.size} achievements`)

    // Grant all achievements
    console.log('\n🎁 Granting all achievements to CoDeBarS...\n')

    let grantedCount = 0
    let alreadyEarnedCount = 0
    let totalPoints = 0

    for (const achievement of achievements as Achievement[]) {
      if (earnedIds.has(achievement.id)) {
        console.log(`⏭️  ${achievement.name} - Already earned`)
        alreadyEarnedCount++
        continue
      }

      // Insert the achievement
      const { error: insertError } = await supabase
        .from('user_achievements')
        .insert({
          user_id: user.id,
          achievement_id: achievement.id,
          earned_at: new Date().toISOString()
        })

      if (insertError) {
        console.error(`❌ Failed to grant "${achievement.name}":`, insertError.message)
        continue
      }

      // Award points if the achievement has points_reward
      if (achievement.points_reward > 0) {
        await supabase.rpc('increment_hunter_points', {
          hunter_id: user.id,
          points: achievement.points_reward
        })
        totalPoints += achievement.points_reward
      }

      // Increment achievements_earned counter
      await supabase.rpc('increment_user_achievements', {
        user_id: user.id
      })

      grantedCount++
      const rarityEmoji = {
        common: '⚪',
        rare: '🔵',
        epic: '🟣',
        legendary: '🟡'
      }[achievement.rarity] || '⭐'

      console.log(`${rarityEmoji} ${achievement.name} - ${achievement.rarity} (+${achievement.points_reward} points)`)
    }

    console.log('\n' + '='.repeat(60))
    console.log('✨ FINAL SUMMARY')
    console.log('='.repeat(60))
    console.log(`🌱 Seeded ${insertedCount} achievements into database`)
    console.log(`✅ Granted ${grantedCount} achievements to ${user.username}`)
    console.log(`⏭️  Skipped ${alreadyEarnedCount} achievements (already earned)`)
    console.log(`🎯 Total Points Awarded: ${totalPoints}`)
    console.log('='.repeat(60))
    console.log(`\n🎉 Success! User "${user.username}" now has all ${achievements.length} achievements!`)
    console.log(`\n👉 View profile to see achievements displayed`)

  } catch (error) {
    console.error('💥 Unexpected error:', error)
  }
}

// Run the script
seedAndGrantAchievements()
