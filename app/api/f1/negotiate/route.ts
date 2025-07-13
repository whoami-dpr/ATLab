// Cloudflare Pages Edge Runtime Configuration
export const runtime = 'edge';

import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Step 1: Negotiate connection with F1 SignalR endpoint
    const negotiateUrl =
      "https://livetiming.formula1.com/signalr/negotiate?clientProtocol=1.5&connectionData=%5B%7B%22name%22%3A%22Streaming%22%7D%5D"

    const response = await fetch(negotiateUrl, {
      method: "GET",
      headers: {
        "User-Agent": "BestHTTP",
        "Accept-Encoding": "gzip, identity",
        Connection: "keep-alive, Upgrade",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      console.error(`Negotiate failed: ${response.status} ${response.statusText}`)
      return NextResponse.json({ error: "Failed to negotiate with F1 endpoint" }, { status: 502 })
    }

    const data = await response.json()
    console.log("Negotiate response:", data)

    return NextResponse.json(data)
  } catch (error) {
    console.error("Negotiate error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
