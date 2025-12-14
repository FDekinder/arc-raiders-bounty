# Clan Tag Validation System

## Overview

The clan tag validation system provides comprehensive filtering to prevent offensive, racist, violent, and inappropriate content in user clan tags. This is a critical safety feature to maintain a respectful gaming community.

## Features

### 1. **Multi-Layer Protection**

The validation uses multiple detection strategies:

- **Direct Word Matching**: Blocks exact offensive words and common abbreviations
- **Leetspeak Normalization**: Converts 1337 speak (e.g., `N1G` → `NIG`) to detect disguised offensive content
- **Regex Patterns**: Catches complex variations and creative spellings
- **Number Code Detection**: Blocks hate symbols like `88`, `1488`, `14` (Nazi codes)

### 2. **Character Normalization**

Automatically normalizes leetspeak substitutions:
- `0` → `o`
- `1` → `i`
- `3` → `e`
- `4` → `a`
- `5` → `s`
- `7` → `t`
- `8` → `b`
- `@` → `a`
- `!` → `i`
- `$` → `s`
- `+` → `t`

This catches attempts like:
- `F4G` → detects as `FAG`
- `N1GG4` → detects as `NIGGA`
- `SH1T` → detects as `SHIT`

### 3. **Blocked Content Categories**

#### Racial Slurs
- N-word and all variations (including abbreviations like `NIG`, `NGR`, `NGGA`)
- Anti-Asian slurs (`CHINK`, `GOOK`, `JAP`)
- Anti-Latino slurs (`SPIC`, `BEANER`)
- Anti-Semitic slurs (`KIKE`)
- Anti-Black slurs (`COON`)
- Other racist terms

#### Homophobic/Transphobic Slurs
- F-word slurs and abbreviations (`FAG`, `FGT`, `FAGGOT`)
- Transphobic terms (`TRANNY`, etc.)
- Other LGBTQ+ slurs

#### Ableist Slurs
- `RETARD`, `TARD`, `SPAZ`, `MONG`

#### Profanity
- Common profanity (`FUCK`, `SHIT`, `CUNT`, `ASS`, `BITCH`)
- Abbreviations (`FUK`, `FCK`, `SHT`, `WTF`, `STFU`)
- Leetspeak variations (`F1CK`, `SH1T`)

#### Sexual Content
- Explicit terms (`SEX`, `PORN`, `TITS`, `BOOB`)
- Crude references
- Number codes (`69`)

#### Hate Groups & Extremism
- Nazi references (`NAZI`, `HITLER`, `88`, `1488`, `14`)
- White supremacist codes (`KKK`, `WP`, `SS`, `HH`)
- Terrorist groups (`ISIS`, `ALQAEDA`)
- Extremist symbols

#### Violence
- Violent terms (`KILL`, `DIE`, `RAPE`, `MURDER`)
- Gore references (`BLOOD`, `GORE`, `DEATH`)

#### Drug References
- Drug names (`WEED`, `COCAINE`, `HEROIN`, `METH`)
- Drug codes (`420`)

### 4. **Additional Rules**

- **Max Length**: 5 characters
- **Allowed Characters**: Letters and numbers only (A-Z, 0-9)
- **No Repeated Characters**: Blocks tags like `AAAAA` or `XXXXX`
- **No Empty Tags**: Must contain at least 1 character

## Usage

```typescript
import { validateClanTag, sanitizeClanTag } from '@/lib/clanTagValidator'

// Validate a clan tag
const result = validateClanTag('RAID')
if (result.isValid) {
  console.log('✅ Valid clan tag')
} else {
  console.log(`❌ Invalid: ${result.error}`)
}

// Sanitize input (trim and uppercase)
const clean = sanitizeClanTag('  raid  ') // Returns "RAID"
```

## Testing

Run the comprehensive test suite:

```bash
npx tsx scripts/test-clan-validation.ts
```

This tests 51+ different scenarios including:
- Valid clan tags
- Direct offensive words
- Leetspeak variations
- Abbreviations
- Number codes
- Edge cases

## Examples

### ✅ Valid Clan Tags
- `RAID` - Standard clan tag
- `PRO` - Short tag
- `ALPHA` - Max length (5 chars)
- `X1` - With numbers
- `G4MER` - Leetspeak for non-offensive word

### ❌ Blocked Clan Tags

**Racial Slurs:**
- `NIG`, `NIGGA`, `N1G`, `N1GG4` - N-word variations
- `CHINK`, `CH1NK` - Anti-Asian
- `SPIC`, `KIKE`, `GOOK`, `COON` - Other slurs

**Homophobic:**
- `FAG`, `F4G`, `FGT` - F-word variations

**Profanity:**
- `FUCK`, `F1CK`, `FUK` - F-word
- `SHIT`, `SH1T` - S-word
- `ASS`, `CUNT` - Other profanity

**Hate Symbols:**
- `88`, `1488`, `14` - Nazi codes
- `KKK`, `NAZI`, `N4ZI` - Hate groups

**Sexual/Drug:**
- `69`, `420` - Number references
- `SEX`, `PORN`, `WEED` - Direct terms

## Database Schema

The clan tag is stored in the `users` table:

```sql
ALTER TABLE users ADD COLUMN clan_tag VARCHAR(5);
CREATE INDEX idx_users_clan_tag ON users(clan_tag) WHERE clan_tag IS NOT NULL;
```

## Display Format

Clan tags appear in red brackets before the username:

```
[RAID] PlayerName
```

## Future Improvements

Consider adding:
1. **Machine Learning**: Train a model to detect new offensive patterns
2. **Community Reporting**: Allow users to report inappropriate clan tags
3. **Regional Filters**: Add language-specific offensive terms
4. **Similarity Detection**: Catch intentional misspellings (e.g., `PHUCK`)
5. **Whitelist**: Allow specific words that might trigger false positives

## Privacy & Safety

This filter prioritizes **safety over permissiveness**. It's better to occasionally block a legitimate tag than to allow offensive content. Users who feel their tag was incorrectly blocked can contact support.

## Maintenance

Review and update the filter regularly:
- Monitor new slang and coded language
- Add emerging hate symbols
- Adjust for false positives
- Stay current with online harassment trends

## License

This validation system is part of the Arc Raiders Bounty application.
