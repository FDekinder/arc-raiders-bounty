// api/steam-verify.ts
import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { searchQuery } = req.query
  const apiKey = process.env.VITE_STEAM_API_KEY || process.env.STEAM_API_KEY

  if (!searchQuery || typeof searchQuery !== 'string') {
    return res.status(400).json({ error: 'Search query required' })
  }

  if (!apiKey) {
    return res.status(500).json({ error: 'Steam API key not configured' })
  }

  try {
    let steamId: string | null = null

    // Check if it's already a Steam ID (17 digits)
    if (/^\d{17}$/.test(searchQuery)) {
      steamId = searchQuery
    } else {
      // Try to resolve vanity URL
      const vanityResponse = await fetch(
        `https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/?key=${apiKey}&vanityurl=${searchQuery}`,
      )
      const vanityData = await vanityResponse.json()

      if (vanityData.response?.success === 1) {
        steamId = vanityData.response.steamid
      }
    }

    if (!steamId) {
      return res.status(404).json({
        error: 'Steam profile not found. Try using their Steam ID or exact profile name.',
      })
    }

    // Get player profile using Steam API
    const profileResponse = await fetch(
      `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${apiKey}&steamids=${steamId}`,
    )

    if (!profileResponse.ok) {
      throw new Error('Steam API request failed')
    }

    const profileData = await profileResponse.json()
    const player = profileData.response?.players?.[0]

    if (!player) {
      return res.status(404).json({ error: 'Could not retrieve player profile' })
    }

    return res.status(200).json({
      steamId: player.steamid,
      personaName: player.personaname,
      avatarUrl: player.avatarfull,
      profileUrl: player.profileurl,
    })
  } catch (error) {
    console.error('Steam API error:', error)
    return res.status(500).json({ error: 'Failed to verify Steam player' })
  }
}
