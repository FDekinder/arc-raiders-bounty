// api/psn-verify.ts
import type { VercelRequest, VercelResponse } from '@vercel/node'

/**
 * PlayStation Network ID validation endpoint
 * Performs basic format validation only
 */

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

  const trimmedPsnId = psnId.trim()

  // Basic validation: PSN IDs are 3-16 characters
  if (trimmedPsnId.length < 3 || trimmedPsnId.length > 16) {
    return res.status(404).json({
      error: 'Invalid PSN ID format (must be 3-16 characters)',
    })
  }

  // Return validation-only response
  return res.status(200).json({
    accountId: `psn-${trimmedPsnId}`,
    onlineId: trimmedPsnId,
    avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(trimmedPsnId)}&size=256&background=003791&color=fff&bold=true`,
    profileUrl: `https://psnprofiles.com/${encodeURIComponent(trimmedPsnId)}`,
    verified: true,
  })
}
