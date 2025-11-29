import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const path = searchParams.get('path')

  if (!path) {
    console.error("❌ Audio proxy: Missing path parameter")
    return new NextResponse('Missing path parameter', { status: 400 })
  }

  // Construct the full URL
  const targetUrl = `https://livetiming.formula1.com/static/${path}`
  console.log(`🎧 Audio proxy: Fetching ${targetUrl}`)

  try {
    const userAgent = request.headers.get("user-agent") || "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
    const cookie = request.headers.get("cookie")
    const range = request.headers.get("range")

    console.log(`🎧 Audio proxy: Request for ${path}`)
    console.log(`🎧 Audio proxy: Incoming Range: ${range || 'None'}`)
    console.log(`🎧 Audio proxy: Incoming Cookie length: ${cookie ? cookie.length : 0}`)

    const headers: HeadersInit = {
      'User-Agent': userAgent,
      'Accept': '*/*',
      'Referer': 'https://www.formula1.com/',
      'Origin': 'https://www.formula1.com',
    }

    if (cookie) headers['Cookie'] = cookie
    if (range) headers['Range'] = range

    const response = await fetch(targetUrl, { headers })

    console.log(`🎧 Audio proxy: F1 Response Status: ${response.status}`)

    if (!response.ok && response.status !== 206) {
      console.error(`❌ Audio proxy: Failed to fetch from F1. Status: ${response.status} ${response.statusText}`)
      return new NextResponse(`Failed to fetch audio: ${response.status} ${response.statusText}`, { status: response.status })
    }

    const contentType = response.headers.get('content-type') || 'audio/mpeg'
    const contentLength = response.headers.get('content-length')
    const contentRange = response.headers.get('content-range')
    
    console.log(`✅ Audio proxy: Success. Type: ${contentType}, Length: ${contentLength}, Range: ${contentRange || 'None'}`)

    const arrayBuffer = await response.arrayBuffer()
    
    const responseHeaders: HeadersInit = {
      'Content-Type': 'audio/mpeg',
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*',
    }

    if (contentLength) responseHeaders['Content-Length'] = contentLength
    if (contentRange) responseHeaders['Content-Range'] = contentRange

    return new NextResponse(arrayBuffer, {
      status: response.status,
      headers: responseHeaders
    })
  } catch (error) {
    console.error('❌ Audio proxy: Internal error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
