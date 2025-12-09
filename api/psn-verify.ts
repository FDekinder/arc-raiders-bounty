// api/psn-verify.ts
import type { VercelRequest, VercelResponse } from '@vercel/node'

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

  if (!psnId || typeof psnId !== 'string') {
    return res.status(400).json({ error: 'PSN ID required' })
  }

  try {
    // PSN API requires authentication
    // For POC: We'll do a simple validation check
    // In production, you'd use PlayStation Network API with proper credentials

    // Basic validation: PSN IDs are 3-16 characters
    if (psnId.length < 3 || psnId.length > 16) {
      return res.status(404).json({
        error: 'Invalid PSN ID format (must be 3-16 characters)',
      })
    }

    // For now, we'll return a validated response
    // In production, integrate with PSN API

    return res.status(200).json({
      accountId: `psn-${psnId}`, // Placeholder account ID
      onlineId: psnId,
      avatarUrl: 'https://i.pravatar.cc/150?img=12', // Placeholder avatar
      profileUrl: `https://psnprofiles.com/${encodeURIComponent(psnId)}`,
      verified: true,
      note: 'PSN verification is in validation-only mode. Full API integration requires PlayStation Network credentials.',
    })
  } catch (error) {
    console.error('PSN verification error:', error)
    return res.status(500).json({ error: 'Failed to verify PlayStation player' })
  }
}
