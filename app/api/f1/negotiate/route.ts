// Use Edge runtime for Cloudflare Pages compatibility
export const runtime = 'edge';

import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("🔄 Attempting to negotiate with F1 SignalR...")
    
    // Step 1: Negotiate connection with F1 SignalR endpoint
    const negotiateUrl =
      "https://livetiming.formula1.com/signalr/negotiate?clientProtocol=1.5&connectionData=%5B%7B%22name%22%3A%22Streaming%22%7D%5D"

    const response = await fetch(negotiateUrl, {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Accept": "application/json, text/plain, */*",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "cross-site",
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

    return NextResponse.json(data)
  } catch (error) {
    console.error("❌ Negotiate error:", error)
    return NextResponse.json({ 
      error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 })
  }
}
