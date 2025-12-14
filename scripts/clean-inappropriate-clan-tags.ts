// Clean up any existing inappropriate clan tags
import supabaseAdmin from './db-admin.js'
import { validateClanTag } from '../src/lib/clanTagValidator.js'

async function cleanInappropriateClanTags() {
  console.log('🧹 Cleaning Inappropriate Clan Tags...')
  console.log('=' .repeat(60))

  try {
    // Get all users with clan tags
    const { data: users, error: usersError } = await supabaseAdmin
      .from('users')
      .select('id, username, clan_tag')
      .not('clan_tag', 'is', null)

    if (usersError) {
      console.error('❌ Error fetching users:', usersError.message)
      return
    }

    if (!users || users.length === 0) {
      console.log('✅ No users with clan tags found')
      return
    }

    console.log(`\n📋 Found ${users.length} users with clan tags`)
    console.log('🔍 Validating each clan tag...\n')

    let cleanCount = 0
    let validCount = 0
    const toClean: Array<{ id: string; username: string; tag: string }> = []

    // Validate each clan tag
    for (const user of users) {
      const validation = validateClanTag(user.clan_tag)

      if (validation.isValid) {
        console.log(`✅ Valid: [${user.clan_tag}] ${user.username}`)
        validCount++
      } else {
        console.log(
          `❌ Invalid: [${user.clan_tag}] ${user.username} - ${validation.error}`,
        )
        toClean.push({ id: user.id, username: user.username, tag: user.clan_tag })
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60))
    console.log('📊 VALIDATION SUMMARY')
    console.log('='.repeat(60))
    console.log(`✅ Valid clan tags: ${validCount}`)
    console.log(`❌ Invalid clan tags: ${toClean.length}`)
    console.log('='.repeat(60))

    // Clean up invalid tags
    if (toClean.length > 0) {
      console.log('\n🧹 Removing invalid clan tags...\n')

      for (const user of toClean) {
        const { error: updateError } = await supabaseAdmin
          .from('users')
          .update({ clan_tag: null })
          .eq('id', user.id)

        if (updateError) {
          console.error(`❌ Failed to remove tag for ${user.username}:`, updateError.message)
        } else {
          console.log(`✅ Removed [${user.tag}] from ${user.username}`)
          cleanCount++
        }
      }

      console.log('\n' + '='.repeat(60))
      console.log(`🎉 Successfully cleaned ${cleanCount}/${toClean.length} inappropriate clan tags`)
      console.log('='.repeat(60))
    } else {
      console.log('\n🎉 All clan tags are valid! No cleanup needed.')
    }
  } catch (error) {
    console.error('💥 Unexpected error:', error)
    process.exit(1)
  }
}

cleanInappropriateClanTags()
