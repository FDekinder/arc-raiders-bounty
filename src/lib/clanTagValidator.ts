// src/lib/clanTagValidator.ts

/**
 * List of prohibited words and patterns for clan tags
 * This includes common slurs, offensive terms, and hate speech
 */
const PROHIBITED_PATTERNS = [
  // Racial slurs and hate speech
  /n[i1!]gg[e3a]/i,
  /n[i1!]g[a@]/i,
  /f[a@]gg[o0]t/i,
  /ch[i1!]nk/i,
  /sp[i1!]c/i,
  /k[i1!]ke/i,
  /dyke/i,
  /tr[a@]nny/i,
  /r[e3]t[a@]rd/i,

  // Violence and gore
  /k[i1!]ll/i,
  /d[i1!]e/i,
  /bl[o0]{2}d/i,
  /g[o0]re/i,
  /murd[e3]r/i,
  /sh[o0]{2}t/i,
  /stab/i,

  // Sexual content
  /s[e3]x/i,
  /p[o0]rn/i,
  /c[o0]ck/i,
  /d[i1!]ck/i,
  /p[e3]n[i1!]s/i,
  /vag[i1!]na/i,
  /t[i1!]t/i,
  /ass/i,
  /f[u\*]ck/i,
  /sh[i1!]t/i,
  /c[u\*]nt/i,
  /b[i1!]tch/i,
  /wh[o0]r[e3]/i,
  /sl[u\*]t/i,

  // Extremist symbols and groups
  /n[a@]z[i1!]/i,
  /h[i1!]tl[e3]r/i,
  /kkk/i,
  /[i1!]s[i1!]s/i,
  /[a@]l[qk][a@][e3]d[a@]/i,

  // Drugs
  /h[e3]r[o0][i1!]n/i,
  /c[o0]c[a@][i1!]n[e3]/i,
  /m[e3]th/i,

  // Common leetspeak variations
  /[a@]ssh[o0]l[e3]/i,
  /b[a@]st[a@]rd/i,
  /d[a@]mn/i,
  /h[e3]ll/i,
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

  // Check against prohibited patterns
  for (const pattern of PROHIBITED_PATTERNS) {
    if (pattern.test(trimmed)) {
      return { isValid: false, error: 'Clan tag contains inappropriate content' }
    }
  }

  // Additional check for repeated characters (like "AAAAA")
  if (/^(.)\1{4,}$/.test(trimmed)) {
    return { isValid: false, error: 'Clan tag cannot be all the same character' }
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
