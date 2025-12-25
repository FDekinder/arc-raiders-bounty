// src/composables/useSEO.ts
import { watch } from 'vue'
import { useRoute } from 'vue-router'

interface SEOConfig {
  title: string
  description: string
  keywords?: string
  ogImage?: string
  canonical?: string
}

export function useSEO(config: SEOConfig) {
  const route = useRoute()
  const baseUrl = 'https://dont-shoot.com'

  function updateMeta() {
    // Update title
    document.title = config.title

    // Update or create meta tags
    updateMetaTag('name', 'description', config.description)
    updateMetaTag('name', 'title', config.title)

    if (config.keywords) {
      updateMetaTag('name', 'keywords', config.keywords)
    }

    // Open Graph tags
    updateMetaTag('property', 'og:title', config.title)
    updateMetaTag('property', 'og:description', config.description)
    updateMetaTag('property', 'og:url', config.canonical || `${baseUrl}${route.path}`)
    updateMetaTag('property', 'og:image', config.ogImage || `${baseUrl}/og-image.png`)
    updateMetaTag('property', 'og:image:width', '1200')
    updateMetaTag('property', 'og:image:height', '630')

    // Twitter tags
    updateMetaTag('property', 'twitter:card', 'summary_large_image')
    updateMetaTag('property', 'twitter:title', config.title)
    updateMetaTag('property', 'twitter:description', config.description)
    updateMetaTag('property', 'twitter:image', config.ogImage || `${baseUrl}/og-image.png`)

    // Canonical URL
    updateCanonical(config.canonical || `${baseUrl}${route.path}`)
  }

  function updateMetaTag(attr: string, key: string, content: string) {
    let element = document.querySelector(`meta[${attr}="${key}"]`)

    if (!element) {
      element = document.createElement('meta')
      element.setAttribute(attr, key)
      document.head.appendChild(element)
    }

    element.setAttribute('content', content)
  }

  function updateCanonical(url: string) {
    let canonical = document.querySelector('link[rel="canonical"]')

    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }

    canonical.setAttribute('href', url)
  }

  // Update meta tags when component mounts
  updateMeta()

  // Watch for route changes
  watch(() => route.path, updateMeta)

  return {
    updateMeta
  }
}

// Predefined SEO configs for different pages
export const seoConfigs = {
  home: {
    title: 'Don\'t Shoot - Arc Raiders Bounty System | Track Most Wanted Players',
    description: 'Place bounties and track the most wanted players in Arc Raiders. Join the hunt, claim rewards, and become the ultimate bounty hunter. Community-driven bounty tracking system.',
    keywords: 'Arc Raiders, bounty system, gaming bounties, player tracking, most wanted, Arc Raiders community',
    canonical: 'https://dont-shoot.com/'
  },
  bounties: {
    title: 'Active Bounties - Arc Raiders Most Wanted | Don\'t Shoot',
    description: 'Browse and hunt active bounties in Arc Raiders. Track the most wanted players, join hunts, and claim rewards. Updated in real-time.',
    keywords: 'Arc Raiders bounties, active bounties, most wanted players, bounty hunting, Arc Raiders rewards',
    canonical: 'https://dont-shoot.com/bounties'
  },
  leaderboard: {
    title: 'Leaderboard - Top Bounty Hunters | Don\'t Shoot',
    description: 'View the top bounty hunters and most wanted players in Arc Raiders. See who leads the hunt and who\'s being hunted the most.',
    keywords: 'Arc Raiders leaderboard, top hunters, most wanted, player rankings, bounty hunters',
    canonical: 'https://dont-shoot.com/leaderboard'
  },
  activity: {
    title: 'Activity Feed - Latest Bounties & Claims | Don\'t Shoot',
    description: 'Stay updated with the latest bounty activity in Arc Raiders. See new bounties, recent claims, and community interactions in real-time.',
    keywords: 'Arc Raiders activity, bounty feed, recent claims, community activity',
    canonical: 'https://dont-shoot.com/activity'
  },
  createBounty: {
    title: 'Create a Bounty - Place a Hit | Don\'t Shoot',
    description: 'Create a bounty on a player in Arc Raiders. Place a hit, set rewards, and let the community hunt them down.',
    keywords: 'create bounty, place bounty, Arc Raiders bounty, player bounty',
    canonical: 'https://dont-shoot.com/create-bounty'
  },
  faq: {
    title: 'FAQ - Frequently Asked Questions | Don\'t Shoot',
    description: 'Find answers to common questions about the Arc Raiders bounty system. Learn how to create bounties, claim rewards, and more.',
    keywords: 'Arc Raiders FAQ, bounty system help, how to create bounty',
    canonical: 'https://dont-shoot.com/faq'
  },
  myClaims: {
    title: 'My Claims - Track Your Bounty Progress | Don\'t Shoot',
    description: 'View and manage your bounty claims in Arc Raiders. Track pending verifications and completed hunts.',
    keywords: 'my claims, bounty claims, track bounties, Arc Raiders progress',
    canonical: 'https://dont-shoot.com/my-claims'
  }
}
