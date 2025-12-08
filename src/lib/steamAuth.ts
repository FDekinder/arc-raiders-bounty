// src/lib/steamAuth.ts
import { supabase } from './supabase'

const STEAM_OPENID_URL = 'https://steamcommunity.com/openid/login'
const RETURN_URL = 'https://arcraidersbounty.vercel.app/auth/steam/callback'
const REALM = 'https://arcraidersbounty.vercel.app'

export function initiateSteamLogin() {
  const params = new URLSearchParams({
    'openid.ns': 'http://specs.openid.net/auth/2.0',
    'openid.mode': 'checkid_setup',
    'openid.return_to': RETURN_URL,
    'openid.realm': REALM,
    'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select',
    'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select',
  })

  window.location.href = `${STEAM_OPENID_URL}?${params.toString()}`
}

export function extractSteamId(url: string): string | null {
  const match = url.match(/openid\/id\/(\d+)/)
  return match ? match[1] : null
}

export async function verifySteamLogin(params: URLSearchParams): Promise<boolean> {
  // Convert to checkid_immediate mode for verification
  const verifyParams = new URLSearchParams(params)
  verifyParams.set('openid.mode', 'check_authentication')

  try {
    const response = await fetch(STEAM_OPENID_URL, {
      method: 'POST',
      body: verifyParams,
    })

    const text = await response.text()
    return text.includes('is_valid:true')
  } catch (error) {
    console.error('Steam verification error:', error)
    return false
  }
}

export async function getSteamProfile(steamId: string, apiKey: string) {
  try {
    const response = await fetch(
      `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${apiKey}&steamids=${steamId}`,
    )
    const data = await response.json()
    return data.response.players[0]
  } catch (error) {
    console.error('Error fetching Steam profile:', error)
    return null
  }
}

export async function createOrUpdateUser(steamId: string, username: string, avatarUrl?: string) {
  // Check if user exists
  const { data: existingUser } = await supabase
    .from('users')
    .select('*')
    .eq('steam_id', steamId)
    .single()

  if (existingUser) {
    // Update existing user
    const { data, error } = await supabase
      .from('users')
      .update({
        username,
        avatar_url: avatarUrl,
      })
      .eq('steam_id', steamId)
      .select()
      .single()

    return { data, error }
  } else {
    // Create new user
    const { data, error } = await supabase
      .from('users')
      .insert({
        steam_id: steamId,
        username,
        avatar_url: avatarUrl,
      })
      .select()
      .single()

    return { data, error }
  }
}
