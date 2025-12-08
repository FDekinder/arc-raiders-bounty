import type { VercelRequest, VercelResponse } from '@vercel/node'
import { validateSteamAuth, getSteamPlayerInfo } from '../../utils/steam'

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Extract Steam ID from query parameters
    const openidIdentity = req.query['openid.identity'] as string
    if (!openidIdentity) {
      return res.status(400).json({ error: 'Missing OpenID identity' })
    }

    // Extract Steam ID from the URL
    const steamIdMatch = openidIdentity.match(/\/(\d+)$/)
    if (!steamIdMatch) {
      return res.status(400).json({ error: 'Invalid Steam ID format' })
    }

    const steamId = steamIdMatch[1]

    // Validate the OpenID response with Steam
    const isValid = await validateSteamAuth(req.query as Record<string, string | string[]>)
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid Steam authentication' })
    }

    const steamApiKey = process.env.STEAM_API_KEY
    if (!steamApiKey) {
      return res.status(500).json({ error: 'Steam API key not configured' })
    }

    // Fetch player data from Steam API (server-to-server, no CORS issues)
    const playerData = await getSteamPlayerInfo(steamId, steamApiKey)

    if (!playerData) {
      return res.status(404).json({ error: 'Player not found' })
    }

    // Return player data to frontend
    return res.status(200).json({
      success: true,
      player: playerData,
    })
  } catch (error: unknown) {
    console.error('Steam callback error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return res.status(500).json({
      error: 'Authentication failed',
      message: errorMessage,
    })
  }
}
