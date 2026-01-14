// Script to grant all achievements to user CoDeBarS
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
  console.error('Please check .env or .env.local for VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

interface Achievement {
  id: string
  name: string
  description: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  points_reward: number
}

async function grantAllAchievements() {
  try {
    console.log('🔍 Looking up user "CoDeBarS"...')

    // Find the user by username
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

    // Get all achievements
    console.log('\n🏆 Fetching all achievements...')
    const { data: achievements, error: achievementsError } = await supabase
      .from('achievements')
      .select('*')
      .order('rarity', { ascending: true })

    if (achievementsError || !achievements) {
      console.error('❌ Failed to fetch achievements:', achievementsError?.message)
      return
    }

    console.log(`✅ Found ${achievements.length} achievements`)

    // Check which achievements the user already has
    const { data: existingAchievements, error: existingError } = await supabase
      .from('user_achievements')
      .select('achievement_id')
      .eq('user_id', user.id)

    if (existingError) {
      console.error('❌ Failed to check existing achievements:', existingError.message)
      return
    }

    const existingIds = new Set(existingAchievements?.map(a => a.achievement_id) || [])
    console.log(`📊 User already has ${existingIds.size} achievements`)

    // Grant all achievements
    console.log('\n🎁 Granting achievements...\n')

    let grantedCount = 0
    let skippedCount = 0
    let totalPoints = 0

    for (const achievement of achievements as Achievement[]) {
      if (existingIds.has(achievement.id)) {
        console.log(`⏭️  ${achievement.name} - Already earned`)
        skippedCount++
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

    console.log('\n' + '='.repeat(50))
    console.log('✨ SUMMARY')
    console.log('='.repeat(50))
    console.log(`✅ Granted: ${grantedCount} achievements`)
    console.log(`⏭️  Skipped: ${skippedCount} achievements (already earned)`)
    console.log(`🎯 Total Points Awarded: ${totalPoints}`)
    console.log('='.repeat(50))
    console.log(`\n🎉 User "${user.username}" now has all achievements!`)
    console.log(`\n👉 View profile at: /profile/${user.username}`)

  } catch (error) {
    console.error('💥 Unexpected error:', error)
  }
}

// Run the script
grantAllAchievements()
