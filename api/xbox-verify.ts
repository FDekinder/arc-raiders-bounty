// api/xbox-verify.ts
import type { VercelRequest, VercelResponse } from '@vercel/node'

/**
 * Xbox Live API integration using OpenXBL (xbl.io)
 * Requires OPENXBL_API_KEY environment variable
 *
 * Free tier: 120 requests/hour
 * API Docs: https://xbl.io/console
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
  const apiKey = process.env.OPENXBL_API_KEY

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

  // If no API key, fall back to validation-only mode
  if (!apiKey) {
    console.warn('OPENXBL_API_KEY not configured, using validation-only mode')
    return res.status(200).json({
      xuid: `xbox-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      gamertag: trimmedGamertag,
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(trimmedGamertag)}&size=256&background=107c10&color=fff&bold=true`,
      profileUrl: `https://account.xbox.com/en-us/profile?gamertag=${encodeURIComponent(trimmedGamertag)}`,
      verified: true,
      validationOnly: true,
      note: 'Running in validation-only mode. Set OPENXBL_API_KEY for full verification.',
    })
  }

  try {
    // Step 1: Search for the gamertag to get XUID
    const searchResponse = await fetch(
      `https://xbl.io/api/v2/search/${encodeURIComponent(trimmedGamertag)}`,
      {
        headers: {
          'X-Authorization': apiKey,
          'Accept': 'application/json',
        },
      }
    )

    if (!searchResponse.ok) {
      if (searchResponse.status === 404) {
        return res.status(404).json({
          error: 'Xbox gamertag not found',
        })
      }
      if (searchResponse.status === 401) {
        return res.status(500).json({
          error: 'Invalid OpenXBL API key',
        })
      }
      if (searchResponse.status === 429) {
        return res.status(429).json({
          error: 'Rate limit exceeded. Please try again later.',
        })
      }
      throw new Error(`OpenXBL API error: ${searchResponse.status}`)
    }

    const searchData = await searchResponse.json()

    // Check if we got any results
    if (!searchData.people || searchData.people.length === 0) {
      return res.status(404).json({
        error: 'Xbox gamertag not found',
      })
    }

    const player = searchData.people[0]

    // Step 2: Get detailed profile information
    const profileResponse = await fetch(
      `https://xbl.io/api/v2/profile/${player.xuid}`,
      {
        headers: {
          'X-Authorization': apiKey,
          'Accept': 'application/json',
        },
      }
    )

    let profileData
    if (profileResponse.ok) {
      profileData = await profileResponse.json()
    }

    // Return verified player information
    const finalGamertag = player.gamertag || player.displayName
    const realAvatarUrl = profileData?.profileUsers?.[0]?.settings?.find((s: any) => s.id === 'GameDisplayPicRaw')?.value

    return res.status(200).json({
      xuid: player.xuid,
      gamertag: finalGamertag,
      avatarUrl: realAvatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(finalGamertag)}&size=256&background=107c10&color=fff&bold=true`,
      profileUrl: `https://account.xbox.com/en-us/profile?gamertag=${encodeURIComponent(finalGamertag)}`,
      gamerscore: profileData?.profileUsers?.[0]?.settings?.find((s: any) => s.id === 'Gamerscore')?.value,
      verified: true,
    })
  } catch (error) {
    console.error('Xbox Live API error:', error)
    return res.status(500).json({
      error: 'Failed to verify Xbox player',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
