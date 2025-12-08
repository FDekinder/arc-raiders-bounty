// api/utils/steam.ts
const STEAM_API_URL = 'https://api.steampowered.com'

export async function validateSteamAuth(
  openIdParams: Record<string, string | string[]>,
): Promise<boolean> {
  try {
    const validationParams = new URLSearchParams()

    const assocHandle = openIdParams['openid.assoc_handle']
    const signed = openIdParams['openid.signed']
    const sig = openIdParams['openid.sig']
    const ns = openIdParams['openid.ns']

    if (!assocHandle || !signed || !sig || !ns) {
      return false
    }

    validationParams.append(
      'openid.assoc_handle',
      Array.isArray(assocHandle) ? assocHandle[0] : assocHandle,
    )
    validationParams.append('openid.signed', Array.isArray(signed) ? signed[0] : signed)
    validationParams.append('openid.sig', Array.isArray(sig) ? sig[0] : sig)
    validationParams.append('openid.ns', Array.isArray(ns) ? ns[0] : ns)

    // Add all signed fields
    const signedFieldsStr = Array.isArray(signed) ? signed[0] : signed
    const signedFields = signedFieldsStr.split(',')

    for (const field of signedFields) {
      const key = `openid.${field}`
      const value = openIdParams[key]
      if (value) {
        validationParams.append(key, Array.isArray(value) ? value[0] : value)
      }
    }

    validationParams.append('openid.mode', 'check_auth')

    const response = await fetch('https://steamcommunity.com/openid/login', {
      method: 'POST',
      body: validationParams,
    })

    const text = await response.text()
    return text.includes('is_valid:true')
  } catch (error) {
    console.error('Steam auth validation error:', error)
    return false
  }
}

export async function getSteamPlayerInfo(
  steamId: string,
  apiKey: string,
): Promise<{
  steamId: string
  username: string
  avatarUrl: string
  profileUrl: string
} | null> {
  try {
    const url = `${STEAM_API_URL}/ISteamUser/GetPlayerSummaries/v0002/?key=${apiKey}&steamids=${steamId}`
    console.log('Calling Steam API:', url.replace(apiKey, '***'))

    const response = await fetch(url)
    console.log('Steam API response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Steam API error response:', errorText)
      throw new Error(`Steam API error: ${response.status}`)
    }

    const data = (await response.json()) as {
      response: {
        players: Array<{
          steamid: string
          personaname: string
          avatarfull: string
          profileurl: string
        }>
      }
    }

    console.log('Steam API data received:', data)

    if (!data.response.players || data.response.players.length === 0) {
      console.warn('No players found in Steam API response')
      return null
    }

    const player = data.response.players[0]
    console.log('Returning player data:', player.personaname)

    return {
      steamId: player.steamid,
      username: player.personaname,
      avatarUrl: player.avatarfull,
      profileUrl: player.profileurl,
    }
  } catch (error) {
    console.error('Error fetching Steam player info:', error)
    return null
  }
}
