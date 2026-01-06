// This replaces the insecure version with proper CORS, rate limiting, and key protection

import type { VercelRequest, VercelResponse } from '@vercel/node'
import {
  setCorsHeaders,
  handlePreflight,
  applyRateLimit,
  sendSecureError,
  validateEnv,
} from './cors-config'

// Validate environment variables on module load
validateEnv(['STEAM_API_KEY'])

// CRITICAL: Use server-side key WITHOUT 'VITE_' prefix
// This key is NOT exposed to the frontend
const STEAM_API_KEY = process.env.STEAM_API_KEY!

interface SteamProfile {
  steamid: string
  personaname: string
  avatarfull: string
  profileurl: string
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Handle preflight requests
    if (handlePreflight(req, res)) return

    // Set CORS headers and check origin
    if (!setCorsHeaders(req, res)) {
      return sendSecureError(res, 403, 'Origin not allowed')
    }

    // Apply rate limiting (60 requests per minute per IP)
    if (!applyRateLimit(req, res, { windowMs: 60000, maxRequests: 60 })) {
      return // Rate limit response already sent
    }

    // Only allow GET requests
    if (req.method !== 'GET') {
      return sendSecureError(res, 405, 'Method not allowed')
    }

    const { searchQuery } = req.query

    // Validate input
    if (!searchQuery || typeof searchQuery !== 'string') {
      return sendSecureError(res, 400, 'Search query required')
    }

    // Sanitize input - limit length and characters
    const sanitizedQuery = searchQuery.trim().slice(0, 100)
    if (sanitizedQuery.length === 0) {
      return sendSecureError(res, 400, 'Invalid search query')
    }

    // Validate query format (alphanumeric, underscores, hyphens only)
    if (!/^[a-zA-Z0-9_-]+$/.test(sanitizedQuery)) {
      return sendSecureError(res, 400, 'Invalid characters in search query')
    }

    // Search for Steam user by vanity URL
    const vanityResponse = await fetch(
      `https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/?key=${STEAM_API_KEY}&vanityurl=${sanitizedQuery}`
    )

    if (!vanityResponse.ok) {
      return sendSecureError(
        res,
        503,
        'Steam API temporarily unavailable',
        `Steam API error: ${vanityResponse.status}`
      )
    }

    const vanityData = await vanityResponse.json()
    let steamId: string | null = null

    if (vanityData.response?.success === 1) {
      steamId = vanityData.response.steamid
    } else if (/^\d{17}$/.test(sanitizedQuery)) {
      // If query looks like a Steam ID64, use it directly
      steamId = sanitizedQuery
    }

    if (!steamId) {
      return res.status(404).json({
        error: 'Player not found',
        message: 'No Steam user found with that name or ID',
      })
    }

    // Get player profile
    const profileResponse = await fetch(
      `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${STEAM_API_KEY}&steamids=${steamId}`
    )

    if (!profileResponse.ok) {
      return sendSecureError(
        res,
        503,
        'Steam API temporarily unavailable',
        `Steam API profile error: ${profileResponse.status}`
      )
    }

    const profileData = await profileResponse.json()
    const player = profileData.response?.players?.[0]

    if (!player) {
      return res.status(404).json({
        error: 'Player not found',
        message: 'Steam profile not found',
      })
    }

    // Return sanitized profile data
    const profile: SteamProfile = {
      steamid: player.steamid,
      personaname: player.personaname,
      avatarfull: player.avatarfull,
      profileurl: player.profileurl,
    }

    return res.status(200).json({
      platform: 'Steam',
      profile,
    })
  } catch (error) {
    // Log error for debugging (server-side only)
    console.error('Steam verify error:', error)

    // Send generic error to client (no details leaked)
    return sendSecureError(res, 500, 'An error occurred while verifying Steam account', error)
  }
}

/**
 * SECURITY IMPROVEMENTS IN THIS VERSION:
 *
 * ✅ CORS restricted to allowed origins (not '*')
 * ✅ Rate limiting (60 requests/minute per IP)
 * ✅ Steam API key stored server-side only (no VITE_ prefix)
 * ✅ Input validation and sanitization
 * ✅ Query length limits
 * ✅ Character whitelist validation
 * ✅ Secure error handling (no info disclosure)
 * ✅ Method validation (GET only)
 * ✅ Steam ID format validation
 * ✅ Proper HTTP status codes
 * ✅ Environment variable validation
 *
 * REMOVED VULNERABILITIES:
 *
 * ❌ Access-Control-Allow-Origin: '*' (now restricted)
 * ❌ Exposed API key in frontend (now server-side only)
 * ❌ No rate limiting (now has 60/min limit)
 * ❌ Unvalidated input (now sanitized and validated)
 * ❌ Error messages leak info (now generic)
 * ❌ No input length limits (now max 100 chars)
 */
