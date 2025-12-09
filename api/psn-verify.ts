// api/psn-verify.ts
import type { VercelRequest, VercelResponse } from '@vercel/node'

/**
 * PlayStation Network API integration
 * Requires PSN_NPSSO environment variable
 *
 * NPSSO token can be obtained from: https://ca.account.sony.com/api/v1/ssocookie
 * (Must be logged in to PlayStation account first)
 *
 * Note: NPSSO tokens expire after ~2 months and need manual refresh
 * API Docs: https://psn-api.achievements.app/
 */

interface PSNAuthTokens {
  accessToken: string
  expiresIn: number
  tokenType: string
  refreshToken: string
}

let cachedTokens: PSNAuthTokens | null = null
let tokenExpiry: number = 0

async function getAccessToken(npsso: string): Promise<string> {
  // Return cached token if still valid (with 5 minute buffer)
  if (cachedTokens && Date.now() < tokenExpiry - 300000) {
    return cachedTokens.accessToken
  }

  try {
    // Exchange NPSSO for access code
    const codeResponse = await fetch('https://ca.account.sony.com/api/authz/v3/oauth/authorize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': `npsso=${npsso}`,
      },
      body: new URLSearchParams({
        access_type: 'offline',
        client_id: '09515159-7237-4370-9b40-3806e67c0891',
        redirect_uri: 'com.scee.psxandroid.scecompcall://redirect',
        response_type: 'code',
        scope: 'psn:mobile.v2.core psn:clientapp',
      }),
    })

    if (!codeResponse.ok) {
      const errorText = await codeResponse.text().catch(() => 'Unable to read error response')
      console.error('PSN auth code error:', codeResponse.status, errorText)
      throw new Error(`Failed to get authorization code: ${codeResponse.status} - ${errorText.substring(0, 200)}`)
    }

    const codeData = await codeResponse.json()
    const authCode = codeData.code

    if (!authCode) {
      console.error('No auth code in response:', JSON.stringify(codeData).substring(0, 200))
      throw new Error(`No authorization code received. Response: ${JSON.stringify(codeData).substring(0, 100)}`)
    }

    // Exchange auth code for access token
    const tokenResponse = await fetch('https://ca.account.sony.com/api/authz/v3/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic MDk1MTUxNTktNzIzNy00MzcwLTliNDAtMzgwNmU2N2MwODkxOnVjUGprYTV0bnRCMktxc1A=',
      },
      body: new URLSearchParams({
        code: authCode,
        redirect_uri: 'com.scee.psxandroid.scecompcall://redirect',
        grant_type: 'authorization_code',
        token_format: 'jwt',
      }),
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text().catch(() => 'Unable to read error response')
      console.error('PSN token error:', tokenResponse.status, errorText)
      throw new Error(`Failed to get access token: ${tokenResponse.status}`)
    }

    const tokenData = await tokenResponse.json()

    // Cache the tokens
    cachedTokens = {
      accessToken: tokenData.access_token,
      expiresIn: tokenData.expires_in,
      tokenType: tokenData.token_type,
      refreshToken: tokenData.refresh_token,
    }
    tokenExpiry = Date.now() + (tokenData.expires_in * 1000)

    return cachedTokens.accessToken
  } catch (error) {
    console.error('PSN authentication error:', error)
    throw new Error('Failed to authenticate with PSN')
  }
}

async function searchPSNUser(accessToken: string, onlineId: string) {
  const response = await fetch(
    `https://m.np.playstation.com/api/search/v1/universalSearch?searchDomain=SocialAllAccounts&searchTerm=${encodeURIComponent(onlineId)}&countryCode=US&languageCode=en`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    }
  )

  if (!response.ok) {
    throw new Error(`PSN search failed: ${response.status}`)
  }

  return response.json()
}

async function getPSNProfile(accessToken: string, accountId: string) {
  const response = await fetch(
    `https://m.np.playstation.com/api/userProfile/v1/internal/users/${accountId}/profiles`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    }
  )

  if (!response.ok) {
    throw new Error(`PSN profile fetch failed: ${response.status}`)
  }

  return response.json()
}

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

  const { psnId } = req.query
  const npsso = process.env.PSN_NPSSO

  if (!psnId || typeof psnId !== 'string') {
    return res.status(400).json({ error: 'PSN ID required' })
  }

  const trimmedPsnId = psnId.trim()

  // Basic validation: PSN IDs are 3-16 characters
  if (trimmedPsnId.length < 3 || trimmedPsnId.length > 16) {
    return res.status(404).json({
      error: 'Invalid PSN ID format (must be 3-16 characters)',
    })
  }

  // If no NPSSO token, fall back to validation-only mode
  if (!npsso) {
    console.warn('PSN_NPSSO not configured, using validation-only mode')
    return res.status(200).json({
      accountId: `psn-${trimmedPsnId}`,
      onlineId: trimmedPsnId,
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(trimmedPsnId)}&size=256&background=003791&color=fff&bold=true`,
      profileUrl: `https://psnprofiles.com/${encodeURIComponent(trimmedPsnId)}`,
      verified: true,
      validationOnly: true,
      note: 'Running in validation-only mode. Set PSN_NPSSO environment variable for full verification. Get token from: https://ca.account.sony.com/api/v1/ssocookie',
    })
  }

  // Log that we're attempting real PSN authentication
  console.log('PSN: Attempting authentication with NPSSO token for:', trimmedPsnId)

  try {
    // Get access token
    const accessToken = await getAccessToken(npsso)

    // Search for the user
    const searchResults = await searchPSNUser(accessToken, trimmedPsnId)

    if (!searchResults.domainResponses || searchResults.domainResponses.length === 0) {
      return res.status(404).json({
        error: 'PSN ID not found',
      })
    }

    const socialResults = searchResults.domainResponses.find(
      (d: any) => d.domain === 'SocialAllAccounts'
    )

    if (!socialResults || !socialResults.results || socialResults.results.length === 0) {
      return res.status(404).json({
        error: 'PSN ID not found',
      })
    }

    // Find exact match (case-insensitive)
    const exactMatch = socialResults.results.find(
      (r: any) => r.socialMetadata?.onlineId?.toLowerCase() === trimmedPsnId.toLowerCase()
    )

    if (!exactMatch) {
      return res.status(404).json({
        error: 'Exact PSN ID match not found',
      })
    }

    const accountId = exactMatch.socialMetadata.accountId

    // Get detailed profile
    const profile = await getPSNProfile(accessToken, accountId)
    const finalOnlineId = profile.profile?.onlineId || exactMatch.socialMetadata.onlineId
    const realAvatarUrl = profile.profile?.avatars?.[0]?.url

    return res.status(200).json({
      accountId: accountId,
      onlineId: finalOnlineId,
      avatarUrl: realAvatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(finalOnlineId)}&size=256&background=003791&color=fff&bold=true`,
      profileUrl: `https://psnprofiles.com/${encodeURIComponent(finalOnlineId)}`,
      verified: true,
    })
  } catch (error) {
    console.error('PSN API error:', error)
    return res.status(500).json({
      error: 'Failed to verify PlayStation player',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
