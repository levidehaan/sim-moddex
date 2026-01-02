import type { Server as HttpServer } from 'http'
import { createLogger } from '@sim/logger'
import { Server } from 'socket.io'
import { env } from '@/lib/core/config/env'
import { isDev, isProd } from '@/lib/core/config/feature-flags'
import { getBaseUrl } from '@/lib/core/utils/urls'

const logger = createLogger('SocketIOConfig')

/**
 * Check if local network access is enabled (for home network usage)
 */
function isLocalNetworkAccessEnabled(): boolean {
  return isDev || env.ALLOW_LOCAL_NETWORK === 'true'
}

/**
 * Get allowed origins for Socket.IO CORS configuration
 */
function getAllowedOrigins(): string[] | ((origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => void) {
  if (isLocalNetworkAccessEnabled()) {
    logger.info('Socket.IO CORS: Local network access enabled - allowing all origins')
    return (origin, callback) => {
      callback(null, true)
    }
  }

  const allowedOrigins = [
    getBaseUrl(),
    'http://localhost:3000',
    'http://localhost:3001',
    ...(env.ALLOWED_ORIGINS?.split(',') || []),
  ].filter((url): url is string => Boolean(url))

  logger.info('Socket.IO CORS configuration:', { allowedOrigins })

  return allowedOrigins
}

/**
 * Create and configure a Socket.IO server instance
 * @param httpServer - The HTTP server instance to attach Socket.IO to
 * @returns Configured Socket.IO server instance
 */
export function createSocketIOServer(httpServer: HttpServer): Server {
  const allowedOrigins = getAllowedOrigins()

  const io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'socket.io'],
      credentials: true, // Enable credentials to accept cookies
    },
    transports: ['websocket', 'polling'], // WebSocket first, polling as fallback
    allowEIO3: true, // Keep legacy support for compatibility
    pingTimeout: 60000, // Back to original conservative setting
    pingInterval: 25000, // Back to original interval
    maxHttpBufferSize: 1e6,
    cookie: {
      name: 'io',
      path: '/',
      httpOnly: true,
      sameSite: 'none', // Required for cross-origin cookies
      secure: isProd, // HTTPS in production
    },
  })

  logger.info('Socket.IO server configured with:', {
    allowedOrigins: allowedOrigins.length,
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000,
    maxHttpBufferSize: 1e6,
    cookieSecure: isProd,
    corsCredentials: true,
  })

  return io
}
