import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Check if the request is for the F1 WebSocket proxy
  // Only run this middleware in development mode
  // In production (Cloudflare Pages), this is handled by functions/f1-ws/connect.ts
  if (process.env.NODE_ENV === 'development' && request.nextUrl.pathname.startsWith('/f1-ws')) {
    // Clone the request headers
    const requestHeaders = new Headers(request.headers)
    
    // Set the Origin and Host headers to match the target
    // This is crucial for the F1 server to accept the connection
    requestHeaders.set('Origin', 'https://www.formula1.com')
    requestHeaders.set('Referer', 'https://www.formula1.com/')
    // requestHeaders.set('Host', 'livetiming.formula1.com') // Let the platform handle the Host header
    
    // Construct the target URL
    // Replace /f1-ws with /signalr
    const targetUrl = new URL(
      request.nextUrl.pathname.replace(/^\/f1-ws/, '/signalr'),
      'https://livetiming.formula1.com'
    )
    
    // Copy search params
    request.nextUrl.searchParams.forEach((value, key) => {
      targetUrl.searchParams.set(key, value)
    })

    // Rewrite the request with modified headers
    return NextResponse.rewrite(targetUrl, {
      request: {
        headers: requestHeaders,
      },
    })
  }
}

export const config = {
  matcher: '/f1-ws/:path*',
}
