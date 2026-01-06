// Secure CORS configuration for all API endpoints

import type { VercelRequest, VercelResponse } from '@vercel/node'

/**
 * Allowed origins for CORS
 * Add your production domain here
 */
const ALLOWED_ORIGINS = [
  'http://localhost:5173', // Local development
  'http://localhost:3000', // Alternative local port
  'https://your-production-domain.com', // TODO: Replace with your actual domain
  'https://your-app.vercel.app', // TODO: Replace with your Vercel domain
]

/**
 * Configure CORS headers securely
 * IMPORTANT: This replaces the insecure Access-Control-Allow-Origin: '*'
 */
export function setCorsHeaders(req: VercelRequest, res: VercelResponse): boolean {
  const origin = req.headers.origin

  // Check if the request origin is in our allowed list
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Access-Control-Allow-Credentials', 'true')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    res.setHeader('Access-Control-Max-Age', '86400') // 24 hours
    return true
  }

  // Origin not allowed
  return false
}

/**
 * Handle preflight OPTIONS requests
 */
export function handlePreflight(req: VercelRequest, res: VercelResponse): boolean {
  if (req.method === 'OPTIONS') {
    if (setCorsHeaders(req, res)) {
      res.status(204).end()
      return true
    } else {
      res.status(403).json({ error: 'Origin not allowed' })
      return true
    }
  }
  return false
}

/**
 * Rate limiting configuration
 */
interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Max requests per window
}

const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

/**
 * Simple in-memory rate limiter
 * For production, use Redis or a proper rate limiting service
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = { windowMs: 60000, maxRequests: 60 }
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const record = rateLimitStore.get(identifier)

  // Clean up expired entries
  if (record && now > record.resetTime) {
    rateLimitStore.delete(identifier)
  }

  const currentRecord = rateLimitStore.get(identifier)

  if (!currentRecord) {
    // First request in window
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + config.windowMs,
    })
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime: now + config.windowMs,
    }
  }

  if (currentRecord.count >= config.maxRequests) {
    // Rate limit exceeded
    return {
      allowed: false,
      remaining: 0,
      resetTime: currentRecord.resetTime,
    }
  }

  // Increment counter
  currentRecord.count++
  rateLimitStore.set(identifier, currentRecord)

  return {
    allowed: true,
    remaining: config.maxRequests - currentRecord.count,
    resetTime: currentRecord.resetTime,
  }
}

/**
 * Get rate limit identifier from request
 * Uses IP address and endpoint combination
 */
export function getRateLimitIdentifier(req: VercelRequest): string {
  // Get IP address (handles proxies)
  const ip =
    req.headers['x-forwarded-for']?.toString().split(',')[0].trim() ||
    req.headers['x-real-ip']?.toString() ||
    'unknown'

  // Combine with endpoint path for per-endpoint limits
  const endpoint = req.url || 'unknown'

  return `${ip}:${endpoint}`
}

/**
 * Apply rate limiting to request
 */
export function applyRateLimit(
  req: VercelRequest,
  res: VercelResponse,
  config?: RateLimitConfig
): boolean {
  const identifier = getRateLimitIdentifier(req)
  const result = checkRateLimit(identifier, config)

  // Set rate limit headers
  res.setHeader('X-RateLimit-Limit', config?.maxRequests || 60)
  res.setHeader('X-RateLimit-Remaining', result.remaining)
  res.setHeader('X-RateLimit-Reset', new Date(result.resetTime).toISOString())

  if (!result.allowed) {
    res.status(429).json({
      error: 'Too many requests',
      message: 'Rate limit exceeded. Please try again later.',
      resetTime: new Date(result.resetTime).toISOString(),
    })
    return false
  }

  return true
}

/**
 * Secure error response helper
 * Prevents information disclosure in error messages
 */
export function sendSecureError(
  res: VercelResponse,
  statusCode: number,
  userMessage: string,
  internalError?: unknown
) {
  // Log internal error for debugging (server-side only)
  if (internalError) {
    console.error('Internal error:', internalError)
  }

  // Send sanitized error to client
  res.status(statusCode).json({
    error: userMessage,
    // DO NOT send stack traces or internal details to client
  })
}

/**
 * Validate required environment variables
 */
export function validateEnv(requiredVars: string[]): void {
  const missing = requiredVars.filter((varName) => !process.env[varName])

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
        'Please check your .env file and Vercel environment settings.'
    )
  }
}

/**
 * Example usage in API endpoint:
 *
 * ```typescript
 * import { setCorsHeaders, handlePreflight, applyRateLimit, sendSecureError } from './cors-config'
 *
 * export default async function handler(req: VercelRequest, res: VercelResponse) {
 *   // Handle preflight
 *   if (handlePreflight(req, res)) return
 *
 *   // Set CORS headers
 *   if (!setCorsHeaders(req, res)) {
 *     return sendSecureError(res, 403, 'Origin not allowed')
 *   }
 *
 *   // Apply rate limiting
 *   if (!applyRateLimit(req, res)) return
 *
 *   // Your API logic here...
 * }
 * ```
 */
