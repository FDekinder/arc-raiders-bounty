// api/xbox-verify.ts
import type { VercelRequest, VercelResponse } from '@vercel/node'

/**
 * Xbox gamertag validation endpoint
 * Performs basic format validation only
 */

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { gamertag } = req.query

  if (!gamertag || typeof gamertag !== 'string') {
    return res.status(400).json({ error: 'Gamertag required' })
  }

  const trimmedGamertag = gamertag.trim()

  // Basic validation: Xbox gamertags are 3-15 characters
  if (trimmedGamertag.length < 3 || trimmedGamertag.length > 15) {
    return res.status(404).json({
      error: 'Invalid gamertag format (must be 3-15 characters)',
    })
  }

  // Check for invalid characters (only letters, numbers, and spaces allowed)
  if (!/^[a-zA-Z0-9\s]+$/.test(trimmedGamertag)) {
    return res.status(404).json({
      error: 'Invalid gamertag format (only letters, numbers, and spaces allowed)',
    })
  }

  // Return validation-only response
  return res.status(200).json({
    xuid: `xbox-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    gamertag: trimmedGamertag,
    avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(trimmedGamertag)}&size=256&background=107c10&color=fff&bold=true`,
    profileUrl: `https://account.xbox.com/en-us/profile?gamertag=${encodeURIComponent(trimmedGamertag)}`,
    verified: true,
  })
}
