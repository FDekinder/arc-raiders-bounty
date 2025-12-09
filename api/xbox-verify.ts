// api/xbox-verify.ts
import type { VercelRequest, VercelResponse } from '@vercel/node'

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

  try {
    // Xbox Live API requires authentication
    // For POC: We'll do a simple validation check
    // In production, you'd use Xbox Live API with proper credentials

    // Basic validation: Xbox gamertags are 3-15 characters
    const trimmedGamertag = gamertag.trim()

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

    // Check that gamertag doesn't start or end with a space
    if (trimmedGamertag !== gamertag) {
      return res.status(404).json({
        error: 'Gamertag cannot start or end with a space',
      })
    }

    // For now, we'll return a validated response
    // In production, integrate with Xbox Live API
    // Xbox User IDs (XUIDs) are typically 16-digit numbers

    return res.status(200).json({
      xuid: `xbox-${Date.now()}-${Math.random().toString(36).substring(7)}`, // Placeholder XUID
      gamertag: trimmedGamertag,
      // avatarUrl omitted in validation-only mode - frontend will show default icon
      profileUrl: `https://account.xbox.com/en-us/profile?gamertag=${encodeURIComponent(trimmedGamertag)}`,
      verified: true,
      note: 'Xbox verification is in validation-only mode. Full API integration requires Xbox Live API credentials.',
    })
  } catch (error) {
    console.error('Xbox verification error:', error)
    return res.status(500).json({ error: 'Failed to verify Xbox player' })
  }
}
