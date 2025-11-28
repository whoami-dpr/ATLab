// Use Edge runtime for Cloudflare Pages compatibility
export const runtime = 'edge';

import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    // Use a standard browser UA or the one from the request
    const userAgent = request.headers.get("user-agent") || "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    console.log("🔄 Negotiating with F1 SignalR...")
    
    // Step 1: Negotiate connection with F1 SignalR endpoint
    const negotiateUrl =
      "https://livetiming.formula1.com/signalr/negotiate?clientProtocol=1.5&connectionData=%5B%7B%22name%22%3A%22Streaming%22%7D%5D"

    const response = await fetch(negotiateUrl, {
      method: "GET",
      headers: {
        "User-Agent": userAgent,
        "Accept": "application/json",
      },
      cache: "no-store",
    })

    console.log(`📡 F1 API Response: ${response.status} ${response.statusText}`)

    if (!response.ok) {
      console.error(`❌ Negotiate failed: ${response.status} ${response.statusText}`)
      return NextResponse.json({ 
        error: `Failed to negotiate with F1 endpoint: ${response.status} ${response.statusText}` 
      }, { status: 502 })
    }

    const data = await response.json()
    console.log("✅ Negotiate response received:", data)

    const res = NextResponse.json(data)
    
    // Forward Set-Cookie header if present
    const setCookie = response.headers.get('set-cookie')
    if (setCookie) {
      res.headers.set('set-cookie', setCookie)
    }

    return res
  } catch (error) {
    console.error("❌ Negotiate error:", error)
    return NextResponse.json({ 
      error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 })
  }
}
