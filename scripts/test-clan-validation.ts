// Test the enhanced clan tag validation
import { validateClanTag } from '../src/lib/clanTagValidator.js'

console.log('🧪 Testing Enhanced Clan Tag Validation')
console.log('=' .repeat(60))

const testCases = [
  // Valid tags
  { tag: 'RAID', expected: true, description: 'Valid clan tag' },
  { tag: 'PRO', expected: true, description: 'Short valid tag' },
  { tag: 'ALPHA', expected: true, description: 'Max length valid tag' },
  { tag: 'X1', expected: true, description: 'Valid with numbers' },

  // Invalid - Too long
  { tag: 'TOOLONG', expected: false, description: 'Too long (6+ chars)' },

  // Invalid - Racial slurs (direct)
  { tag: 'NIG', expected: false, description: 'N-word abbreviation' },
  { tag: 'NIGGA', expected: false, description: 'N-word variant' },
  { tag: 'NGR', expected: false, description: 'N-word extreme abbreviation' },

  // Invalid - Racial slurs (leetspeak)
  { tag: 'N1G', expected: false, description: 'N-word with 1337 speak' },
  { tag: 'N1GG4', expected: false, description: 'N-word with multiple substitutions' },
  { tag: 'N3GR0', expected: false, description: 'Negro in leetspeak' },

  // Invalid - Homophobic slurs
  { tag: 'FAG', expected: false, description: 'Homophobic slur' },
  { tag: 'F4G', expected: false, description: 'Homophobic slur leetspeak' },
  { tag: 'FGT', expected: false, description: 'Homophobic abbreviation' },

  // Invalid - Other racist terms
  { tag: 'CHINK', expected: false, description: 'Anti-Asian slur' },
  { tag: 'CH1NK', expected: false, description: 'Anti-Asian slur leetspeak' },
  { tag: 'SPIC', expected: false, description: 'Anti-Latino slur' },
  { tag: 'KIKE', expected: false, description: 'Anti-Semitic slur' },
  { tag: 'GOOK', expected: false, description: 'Anti-Asian slur' },
  { tag: 'COON', expected: false, description: 'Racist slur' },

  // Invalid - Nazi/hate codes
  { tag: '88', expected: false, description: 'Nazi code HH' },
  { tag: '1488', expected: false, description: 'Nazi code 1488' },
  { tag: '14', expected: false, description: 'Nazi code 14' },
  { tag: 'KKK', expected: false, description: 'KKK abbreviation' },
  { tag: 'NAZI', expected: false, description: 'Nazi' },
  { tag: 'N4ZI', expected: false, description: 'Nazi leetspeak' },

  // Invalid - Profanity
  { tag: 'FUCK', expected: false, description: 'Profanity' },
  { tag: 'F1CK', expected: false, description: 'Profanity leetspeak' },
  { tag: 'FUK', expected: false, description: 'Profanity abbreviation' },
  { tag: 'SHIT', expected: false, description: 'Profanity' },
  { tag: 'SH1T', expected: false, description: 'Profanity leetspeak' },
  { tag: 'CUNT', expected: false, description: 'Profanity' },
  { tag: 'ASS', expected: false, description: 'Profanity' },

  // Invalid - Sexual content
  { tag: 'SEX', expected: false, description: 'Sexual content' },
  { tag: 'PORN', expected: false, description: 'Sexual content' },
  { tag: 'TITS', expected: false, description: 'Sexual content' },
  { tag: 'BOOB', expected: false, description: 'Sexual content' },
  { tag: '69', expected: false, description: 'Sexual number reference' },

  // Invalid - Drug references
  { tag: '420', expected: false, description: 'Drug reference' },
  { tag: 'WEED', expected: false, description: 'Drug reference' },
  { tag: 'METH', expected: false, description: 'Drug reference' },

  // Invalid - Violence
  { tag: 'KILL', expected: false, description: 'Violent term' },
  { tag: 'K1LL', expected: false, description: 'Violent term leetspeak' },
  { tag: 'DIE', expected: false, description: 'Violent term' },
  { tag: 'RAPE', expected: false, description: 'Violent term' },

  // Invalid - Ableist
  { tag: 'TARD', expected: false, description: 'Ableist slur' },

  // Invalid - Repeated characters
  { tag: 'AAAAA', expected: false, description: 'All same character' },
  { tag: 'XXXXX', expected: false, description: 'All same character' },

  // Invalid - Common abbreviations
  { tag: 'WTF', expected: false, description: 'Profane abbreviation' },
  { tag: 'STFU', expected: false, description: 'Profane abbreviation' },
  { tag: 'NSFW', expected: false, description: 'NSFW abbreviation' },
]

let passed = 0
let failed = 0

console.log('\n📋 Running validation tests...\n')

for (const testCase of testCases) {
  const result = validateClanTag(testCase.tag)
  const isValid = result.isValid
  const expectedValid = testCase.expected

  if (isValid === expectedValid) {
    console.log(`✅ PASS: "${testCase.tag}" - ${testCase.description}`)
    passed++
  } else {
    console.log(
      `❌ FAIL: "${testCase.tag}" - ${testCase.description} (Expected ${expectedValid ? 'valid' : 'invalid'}, got ${isValid ? 'valid' : 'invalid'})`,
    )
    if (result.error) {
      console.log(`   Error: ${result.error}`)
    }
    failed++
  }
}

console.log('\n' + '='.repeat(60))
console.log('📊 TEST RESULTS')
console.log('='.repeat(60))
console.log(`✅ Passed: ${passed}/${testCases.length}`)
console.log(`❌ Failed: ${failed}/${testCases.length}`)
console.log(`📈 Success Rate: ${Math.round((passed / testCases.length) * 100)}%`)
console.log('='.repeat(60))

if (failed === 0) {
  console.log('\n🎉 All tests passed! Validation is working correctly.')
} else {
  console.log('\n⚠️  Some tests failed. Review the validation logic.')
  process.exit(1)
}
