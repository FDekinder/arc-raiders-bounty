const STEAM_API_URL = 'https://api.steampowered.com'

export async function validateSteamAuth(
  openIdParams: Record<string, string | string[]>,
): Promise<boolean> {
  try {
    console.log('Validating Steam auth with params:', Object.keys(openIdParams))

    // Build validation params
    const validationParams = new URLSearchParams()
    validationParams.append('openid.mode', 'check_auth')
    validationParams.append('openid.ns', 'http://specs.openid.net/auth/2.0')

    // Copy all parameters from the callback
    for (const [key, value] of Object.entries(openIdParams)) {
      if (key.startsWith('openid.')) {
        const paramValue = Array.isArray(value) ? value[0] : value
        validationParams.append(key, paramValue)
        console.log(`Adding param: ${key}`)
      }
    }

    console.log('Sending validation request to Steam...')
    const response = await fetch('https://steamcommunity.com/openid/login', {
      method: 'POST',
      body: validationParams.toString(),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })

    const text = await response.text()
    console.log('Steam validation response:', text.substring(0, 200))

    const isValid = text.includes('is_valid:true')
    console.log('Steam auth validation result:', isValid)

    return isValid
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
