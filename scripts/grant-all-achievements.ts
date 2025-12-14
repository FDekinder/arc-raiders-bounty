// Grant all achievements to a specific user
// Run: npm run db:grant-achievements <username>

import supabaseAdmin from './db-admin.js'

interface Achievement {
  id: string
  name: string
  description: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  points_reward: number
}

async function grantAllAchievements(username: string) {
  console.log(`🎁 Granting All Achievements to: ${username}`)
  console.log('=' .repeat(60))

  try {
    // Find the user by username
    console.log('🔍 Looking up user...')
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, username')
      .eq('username', username)
      .single()

    if (userError || !user) {
      console.error(`❌ User "${username}" not found:`, userError?.message)
      process.exit(1)
    }

    console.log(`✅ Found user: ${user.username} (ID: ${user.id})`)

    // Get all achievements
    console.log('\n🏆 Fetching all achievements...')
    const { data: achievements, error: achievementsError } = await supabaseAdmin
      .from('achievements')
      .select('*')
      .order('rarity', { ascending: true })

    if (achievementsError || !achievements || achievements.length === 0) {
      console.error('❌ No achievements found in database')
      console.error('Run: npm run db:seed-achievements first')
      process.exit(1)
    }

    console.log(`✅ Found ${achievements.length} achievements`)

    // Check which achievements the user already has
    const { data: userAchievements, error: existingError } = await supabaseAdmin
      .from('user_achievements')
      .select('achievement_id')
      .eq('user_id', user.id)

    if (existingError) {
      console.error('❌ Failed to check existing achievements:', existingError.message)
      process.exit(1)
    }

    const earnedIds = new Set(userAchievements?.map(a => a.achievement_id) || [])
    console.log(`📊 User already has ${earnedIds.size} achievements`)

    // Grant all achievements
    console.log('\n🎁 Granting achievements...\n')

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
      const { error: insertError } = await supabaseAdmin
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
        await supabaseAdmin.rpc('increment_hunter_points', {
          hunter_id: user.id,
          points: achievement.points_reward
        })
        totalPoints += achievement.points_reward
      }

      // Increment achievements_earned counter
      await supabaseAdmin.rpc('increment_user_achievements', {
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
    console.log('✨ SUMMARY')
    console.log('='.repeat(60))
    console.log(`✅ Granted: ${grantedCount} achievements`)
    console.log(`⏭️  Skipped: ${alreadyEarnedCount} achievements (already earned)`)
    console.log(`🎯 Total Points Awarded: ${totalPoints}`)
    console.log(`📊 User now has: ${earnedIds.size + grantedCount}/${achievements.length} achievements`)
    console.log('='.repeat(60))

    if (grantedCount > 0) {
      console.log(`\n🎉 Successfully granted ${grantedCount} achievements to ${user.username}!`)
    } else {
      console.log(`\n✅ User ${user.username} already has all achievements`)
    }

  } catch (error) {
    console.error('💥 Unexpected error:', error)
    process.exit(1)
  }
}

// Get username from command line args
const username = process.argv[2]

if (!username) {
  console.error('❌ Please specify a username')
  console.error('Usage: npm run db:grant-achievements <username>')
  console.error('Example: npm run db:grant-achievements CoDeBarS')
  process.exit(1)
}

// Run the script
grantAllAchievements(username)
