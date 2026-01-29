import type { VercelRequest, VercelResponse } from '@vercel/node'
import { handlePreflight, setCorsHeaders, applyRateLimit, sendSecureError } from './cors-config'

/**
 * PlayStation Network ID validation endpoint
 * Performs basic format validation only
 */

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS preflight
  if (handlePreflight(req, res)) return

  // Set CORS headers (validates origin)
  if (!setCorsHeaders(req, res)) {
    return sendSecureError(res, 403, 'Origin not allowed')
  }

  // Apply rate limiting
  if (!applyRateLimit(req, res)) return

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
    return res.status(400).json({
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
