
export type Platform = 'steam' | 'xbox' | 'playstation'

export interface PlayerVerification {
  platform: Platform
  playerId: string
  displayName: string
  avatarUrl?: string
  profileUrl?: string
  error?: string
}

// Steam verification (existing)
export async function verifySteamPlayer(searchQuery: string): Promise<PlayerVerification> {
  try {
    const response = await fetch(`/api/steam-verify?searchQuery=${encodeURIComponent(searchQuery)}`)

    if (!response.ok) {
      const errorData = await response.json()
      return {
        platform: 'steam',
        playerId: '',
        displayName: '',
        error: errorData.error || 'Failed to verify Steam player',
      }
    }

    const data = await response.json()

    return {
      platform: 'steam',
      playerId: data.steamId,
      displayName: data.personaName,
      avatarUrl: data.avatarUrl,
      profileUrl: data.profileUrl,
    }
  } catch (error) {
    return {
      platform: 'steam',
      playerId: '',
      displayName: '',
      error: 'Failed to verify Steam player',
    }
  }
}

// Xbox verification
export async function verifyXboxPlayer(gamertag: string): Promise<PlayerVerification> {
  try {
    const response = await fetch(`/api/xbox-verify?gamertag=${encodeURIComponent(gamertag)}`)

    if (!response.ok) {
      const errorData = await response.json()
      return {
        platform: 'xbox',
        playerId: '',
        displayName: '',
        error: errorData.error || 'Xbox gamertag not found',
      }
    }

    const data = await response.json()

    return {
      platform: 'xbox',
      playerId: data.xuid,
      displayName: data.gamertag,
      avatarUrl: data.avatarUrl,
      profileUrl: data.profileUrl,
    }
  } catch (error) {
    return {
      platform: 'xbox',
      playerId: '',
      displayName: '',
      error: 'Failed to verify Xbox player',
    }
  }
}

// PlayStation verification
export async function verifyPSNPlayer(psnId: string): Promise<PlayerVerification> {
  try {
    const response = await fetch(`/api/psn-verify?psnId=${encodeURIComponent(psnId)}`)

    if (!response.ok) {
      const errorData = await response.json()
      return {
        platform: 'playstation',
        playerId: '',
        displayName: '',
        error: errorData.error || 'PSN ID not found',
      }
    }

    const data = await response.json()

    return {
      platform: 'playstation',
      playerId: data.accountId,
      displayName: data.onlineId,
      avatarUrl: data.avatarUrl,
      profileUrl: data.profileUrl,
    }
  } catch (error) {
    return {
      platform: 'playstation',
      playerId: '',
      displayName: '',
      error: 'Failed to verify PlayStation player',
    }
  }
}

// Main verification function that routes to the correct platform
export async function verifyPlayer(
  username: string,
  platform: Platform,
): Promise<PlayerVerification> {
  switch (platform) {
    case 'steam':
      return verifySteamPlayer(username)
    case 'xbox':
      return verifyXboxPlayer(username)
    case 'playstation':
      return verifyPSNPlayer(username)
    default:
      return {
        platform,
        playerId: '',
        displayName: '',
        error: 'Unsupported platform',
      }
  }
}
