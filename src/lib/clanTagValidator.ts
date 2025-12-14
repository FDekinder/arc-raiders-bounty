// src/lib/clanTagValidator.ts

/**
 * List of prohibited words and patterns for clan tags
 * This includes common slurs, offensive terms, hate speech, and their abbreviations
 *
 * IMPORTANT: This is a comprehensive filter designed to prevent:
 * - Direct slurs and offensive terms
 * - Leetspeak variations (1337 speak: a->@/4, e->3, i->1/!, o->0, etc.)
 * - Common abbreviations and acronyms
 * - Partial matches that could form offensive content
 */

/**
 * Character substitution map for leetspeak normalization
 */
const LEETSPEAK_MAP: Record<string, string> = {
  '0': 'o',
  '1': 'i',
  '3': 'e',
  '4': 'a',
  '5': 's',
  '7': 't',
  '8': 'b',
  '@': 'a',
  '!': 'i',
  '$': 's',
  '+': 't',
}

/**
 * Normalize leetspeak to detect hidden offensive words
 */
function normalizeLeetspeak(text: string): string {
  let normalized = text.toLowerCase()
  for (const [leet, normal] of Object.entries(LEETSPEAK_MAP)) {
    normalized = normalized.split(leet).join(normal)
  }
  return normalized
}

/**
 * Prohibited exact words (after normalization)
 * These are blocked even as abbreviations or partial matches
 */
const PROHIBITED_WORDS = new Set([
  // Racial slurs (N-word variations)
  'nig', 'niga', 'nigg', 'nigga', 'nigger', 'negro', 'ngr', 'ngga',

  // Homophobic slurs
  'fag', 'fagg', 'faggot', 'fgt', 'dyke', 'queer',

  // Racist terms
  'chink', 'gook', 'spic', 'kike', 'beaner', 'wetback', 'towel',
  'sand', 'jap', 'coon', 'paki', 'raghead', 'slope',

  // Transphobic slurs
  'tranny', 'shemale', 'heshe',

  // Ableist slurs
  'retard', 'tard', 'spaz', 'mong',

  // Sexual/profane
  'fuck', 'fuk', 'fck', 'fick', 'foc', 'fock', 'shit', 'sht', 'cunt', 'cnt', 'cock',
  'dick', 'dic', 'dik', 'penis', 'vagina', 'pussy', 'porn', 'sex',
  'ass', 'arse', 'bitch', 'btch', 'whore', 'slut', 'slt', 'tits', 'boob',

  // Hate groups/extremism
  'nazi', 'nzi', 'hitler', 'kkk', 'isis', 'alqaeda', 'jihad',
  'white power', 'wp', 'ss', 'aryan',

  // Violence
  'kill', 'die', 'death', 'blood', 'gore', 'rape', 'murder',

  // Drug references
  'weed', 'cocaine', 'heroin', 'meth', 'drug',

  // Common offensive abbreviations
  'wtf', 'stfu', 'milf', 'dilf', 'bdsm', 'nsfw',

  // Problematic number codes
  '1488', '88', '14', 'hh', // Nazi codes
  '420', // Drug reference
])

/**
 * Patterns that should be blocked (regex for more complex matching)
 */
const PROHIBITED_PATTERNS = [
  // N-word with any leetspeak or spacing
  /n+[i1!]+[g9]+[a@4]*[s5z]*/i,
  /n+[e3]+gr+[o0]/i,
  /n+[i1!]+g+r/i,

  // F-word (gay slur) with variations
  /f+[a@4]+g+[o0t]*/i,
  /f+[a@4]+[g9]+[s5]*/i,
  /f+[g9]+t+/i,

  // Other racial slurs with variations
  /ch+[i1!]+n+k/i,
  /sp+[i1!]+c+/i,
  /k+[i1!]+k+[e3]/i,
  /g+[o0]+k+/i,
  /c+[o0]+n+/i,
  /j+[a@4]+p+/i,
  /p+[a@4]+k+[i1!]/i,

  // Transphobic
  /tr+[a@4]+n+[yn]/i,
  /sh+[e3]+m+[a@4]+l+[e3]/i,

  // Ableist
  /r+[e3]+t+[a@4]+r+d+/i,
  /t+[a@4]+r+d+/i,
  /sp+[a@4]+z+/i,

  // Sexual/profane
  /f+[u\*]+c+k+/i,
  /f+[u\*]+k+/i,
  /sh+[i1!]+t+/i,
  /c+[u\*]+n+t+/i,
  /c+[o0]+c+k+/i,
  /d+[i1!]+c+k+/i,
  /p+[u\*]+s+[s5]+[y]/i,
  /p+[o0]+r+n+/i,
  /[a@4]+s+[s5]+[h]*[o0]*l*[e3]*/i,
  /b+[i1!]+t+ch+/i,
  /wh+[o0]+r+[e3]/i,
  /sl+[u\*]+t+/i,
  /t+[i1!]+t+[s5]*/i,
  /b+[o0]+b+[s5]*/i,

  // Hate groups
  /n+[a@4]+z+[i1!]/i,
  /h+[i1!]+t+l+[e3]+r/i,
  /k+k+k+/i,
  /[i1!]+s+[i1!]+s+/i,
  /j+[i1!]+h+[a@4]+d+/i,

  // Violence
  /k+[i1!]+l+[l1]+/i,
  /d+[e3]+[a@4]+th+/i,
  /r+[a@4]+p+[e3]/i,
  /m+[u\*]+r+d+[e3]+r/i,

  // Any 88 or 1488 (Nazi codes)
  /88/,
  /1488/,
  /14/,

  // 69 sexual reference
  /69/,

  // 420 drug reference
  /420/,
]

/**
 * Validates a clan tag for length, characters, and offensive content
 * @param clanTag - The clan tag to validate
 * @returns Object with isValid flag and optional error message
 */
export interface ClanTagValidation {
  isValid: boolean
  error?: string
}

export function validateClanTag(clanTag: string): ClanTagValidation {
  // Check if empty
  if (!clanTag || clanTag.trim().length === 0) {
    return { isValid: false, error: 'Clan tag cannot be empty' }
  }

  // Trim whitespace
  const trimmed = clanTag.trim()

  // Check length (max 5 characters)
  if (trimmed.length > 5) {
    return { isValid: false, error: 'Clan tag must be 5 characters or less' }
  }

  // Check for allowed characters (alphanumeric only)
  if (!/^[A-Za-z0-9]+$/.test(trimmed)) {
    return { isValid: false, error: 'Clan tag can only contain letters and numbers' }
  }

  // Normalize the text to detect leetspeak attempts
  const normalized = normalizeLeetspeak(trimmed)

  // Check against prohibited exact words (including partial matches)
  for (const word of PROHIBITED_WORDS) {
    if (normalized.includes(word)) {
      return { isValid: false, error: 'Clan tag contains inappropriate content' }
    }
  }

  // Check against prohibited patterns (regex matching)
  for (const pattern of PROHIBITED_PATTERNS) {
    if (pattern.test(trimmed)) {
      return { isValid: false, error: 'Clan tag contains inappropriate content' }
    }
    // Also check normalized version
    if (pattern.test(normalized)) {
      return { isValid: false, error: 'Clan tag contains inappropriate content' }
    }
  }

  // Additional check for repeated characters (like "AAAAA")
  if (/^(.)\1{4,}$/.test(trimmed)) {
    return { isValid: false, error: 'Clan tag cannot be all the same character' }
  }

  // Block suspicious number sequences
  if (/^\d+$/.test(trimmed)) {
    // All numbers - check if it's a known hate code
    const numValue = trimmed
    if (
      numValue.includes('88') ||
      numValue.includes('14') ||
      numValue.includes('69') ||
      numValue.includes('420') ||
      numValue === '1488'
    ) {
      return { isValid: false, error: 'Clan tag contains inappropriate content' }
    }
  }

  return { isValid: true }
}

/**
 * Sanitizes a clan tag by trimming and converting to uppercase
 * @param clanTag - The clan tag to sanitize
 * @returns Sanitized clan tag
 */
export function sanitizeClanTag(clanTag: string): string {
  return clanTag.trim().toUpperCase()
}
