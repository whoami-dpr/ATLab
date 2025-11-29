import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Middleware is now empty as WebSocket proxy is handled by:
  // 1. next.config.mjs rewrites (Local Development)
  // 2. Cloudflare Pages Functions (Production)
}

export const config = {
  matcher: '/f1-ws/:path*',
}
