// Seed achievements into the database using admin privileges
// Run: npm run db:seed-achievements

import supabaseAdmin from './db-admin.js'

// Achievement seed data
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

async function seedAchievements() {
  console.log('🌱 Seeding Achievements Database...')
  console.log('=' .repeat(60))

  try {
    // Check existing achievements
    const { data: existingAchievements, error: checkError } = await supabaseAdmin
      .from('achievements')
      .select('id, name')

    if (checkError) {
      console.error('❌ Error accessing achievements table:', checkError.message)
      console.error('The achievements table may not exist yet.')
      console.error('Run the migration first: npm run db:migrate')
      process.exit(1)
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

      const { error: insertError } = await supabaseAdmin
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

    console.log('\n' + '='.repeat(60))
    console.log('✨ SUMMARY')
    console.log('='.repeat(60))
    console.log(`✅ Inserted: ${insertedCount} new achievements`)
    console.log(`⏭️  Skipped: ${skippedCount} existing achievements`)
    console.log(`📊 Total: ${existingAchievements.length + insertedCount} achievements in database`)
    console.log('='.repeat(60))

    if (insertedCount > 0) {
      console.log('\n🎉 Achievement seeding completed successfully!')
    } else {
      console.log('\n✅ All achievements already exist in the database')
    }

  } catch (error) {
    console.error('💥 Unexpected error:', error)
    process.exit(1)
  }
}

// Run if called directly
seedAchievements()
