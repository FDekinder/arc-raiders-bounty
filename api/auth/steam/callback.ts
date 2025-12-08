import type { VercelRequest, VercelResponse } from '@vercel/node'
import { validateSteamAuth, getSteamPlayerInfo } from '../../utils/steam'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    console.log('Steam callback received with query:', Object.keys(req.query))

    // Extract Steam ID from query parameters
    const openidIdentity = req.query['openid.identity'] as string
    if (!openidIdentity) {
      console.error('Missing openid.identity in query')
      return res.status(400).json({ error: 'Missing OpenID identity' })
    }

    console.log('OpenID identity:', openidIdentity)

    // Extract Steam ID from the URL
    const steamIdMatch = openidIdentity.match(/\/(\d+)$/)
    if (!steamIdMatch) {
      console.error('Invalid Steam ID format in:', openidIdentity)
      return res.status(400).json({ error: 'Invalid Steam ID format' })
    }

    const steamId = steamIdMatch[1]
    console.log('Extracted Steam ID:', steamId)

    // Validate the OpenID response with Steam
    console.log('Validating Steam auth...')
    const isValid = await validateSteamAuth(req.query as Record<string, string | string[]>)
    console.log('Steam auth valid:', isValid)

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid Steam authentication' })
    }

    const steamApiKey = process.env.STEAM_API_KEY
    if (!steamApiKey) {
      console.error('STEAM_API_KEY not configured')
      return res.status(500).json({ error: 'Steam API key not configured' })
    }

    console.log('Fetching Steam player info for ID:', steamId)

    // Fetch player data from Steam API (server-to-server, no CORS issues)
    const playerData = await getSteamPlayerInfo(steamId, steamApiKey)
    console.log('Player data retrieved:', playerData ? 'yes' : 'no')

    if (!playerData) {
      return res.status(404).json({ error: 'Player not found' })
    }

    // Return player data to frontend
    console.log('Returning player data to frontend')
    return res.status(200).json({
      success: true,
      player: playerData,
    })
  } catch (error: unknown) {
    console.error('Steam callback error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error message:', errorMessage)
    return res.status(500).json({
      error: 'Authentication failed',
      message: errorMessage,
    })
  }
}
