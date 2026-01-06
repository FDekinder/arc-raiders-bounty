
export type SharePlatform = 'twitter' | 'facebook' | 'discord' | 'instagram' | 'clipboard'

export interface BountyShareData {
  id?: string
  target_gamertag: string
  bounty_amount: number
  platform?: string
  status?: string
}

/**
 * Get the base URL for the application
 */
function getBaseUrl(): string {
  // In production, use the actual domain
  if (import.meta.env.PROD) {
    return 'https://dont-shoot.com'
  }
  // In development, use localhost
  return window.location.origin
}

/**
 * Generate the bounty URL
 */
export function getBountyUrl(bounty: BountyShareData): string {
  const baseUrl = getBaseUrl()
  if (bounty.id) {
    return `${baseUrl}/bounties?id=${bounty.id}`
  }
  return `${baseUrl}/bounties`
}

/**
 * Generate share text based on platform
 */
export function generateShareText(bounty: BountyShareData, platform: SharePlatform): string {
  const platformEmoji = bounty.platform
    ? bounty.platform === 'steam'
      ? '🎮 Steam'
      : bounty.platform === 'xbox'
        ? '🎮 Xbox'
        : '🎮 PlayStation'
    : '🎮'

  switch (platform) {
    case 'twitter':
      return `🎯 BOUNTY ALERT! 🎯

Target: ${bounty.target_gamertag}
Reward: ${bounty.bounty_amount.toLocaleString()} points
Platform: ${platformEmoji}
Status: WANTED

Think you can take them down? 👀

#ArcRaiders #BountyHunter #Gaming`

    case 'facebook':
      return `🎯 New Bounty Posted!

I just placed a ${bounty.bounty_amount.toLocaleString()} point bounty on ${bounty.target_gamertag}!

Can you eliminate this target? Join the hunt now!`

    case 'discord':
      return `🎯 **BOUNTY ALERT!** 🎯

**Target:** ${bounty.target_gamertag}
**Reward:** ${bounty.bounty_amount.toLocaleString()} points
**Platform:** ${platformEmoji}
**Status:** WANTED

Think you can take them down? 👀`

    case 'instagram':
      return `🎯 BOUNTY HUNTER ALERT 🎯

${bounty.bounty_amount.toLocaleString()} POINT REWARD
Target: ${bounty.target_gamertag}
Platform: ${platformEmoji}

Link in bio to claim! 👆

#ArcRaiders #BountyHunter #Gaming #Esports`

    default:
      return `Check out this ${bounty.bounty_amount.toLocaleString()} point bounty on ${bounty.target_gamertag}!`
  }
}

/**
 * Get the share URL for a specific platform
 */
export function getShareUrl(bounty: BountyShareData, platform: SharePlatform): string {
  const bountyUrl = getBountyUrl(bounty)
  const encodedUrl = encodeURIComponent(bountyUrl)

  // Add UTM parameters for tracking
  const utmParams = `utm_source=${platform}&utm_medium=social&utm_campaign=bounty_share`
  const trackedUrl = `${bountyUrl}?${utmParams}`
  const encodedTrackedUrl = encodeURIComponent(trackedUrl)

  switch (platform) {
    case 'twitter': {
      const text = generateShareText(bounty, 'twitter')
      const encodedText = encodeURIComponent(text)
      return `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedTrackedUrl}`
    }

    case 'facebook':
      return `https://www.facebook.com/sharer/sharer.php?u=${encodedTrackedUrl}`

    case 'discord':
    case 'instagram':
    case 'clipboard':
      return trackedUrl

    default:
      return bountyUrl
  }
}

/**
 * Copy text to clipboard with fallback
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    // Try modern Clipboard API first
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    }

    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'
    textArea.style.top = '-999999px'
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()

    const successful = document.execCommand('copy')
    textArea.remove()

    return successful
  } catch (error) {
    console.error('Failed to copy to clipboard:', error)
    return false
  }
}

/**
 * Share bounty on a specific platform
 */
export function shareBounty(bounty: BountyShareData, platform: SharePlatform): void {
  const shareUrl = getShareUrl(bounty, platform)

  if (platform === 'twitter' || platform === 'facebook') {
    // Open share URL in new window
    const width = 600
    const height = 400
    const left = window.screen.width / 2 - width / 2
    const top = window.screen.height / 2 - height / 2

    window.open(
      shareUrl,
      'share',
      `width=${width},height=${height},left=${left},top=${top},toolbar=0,status=0`,
    )
  }
}
