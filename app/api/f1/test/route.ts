/* TEMPORARILY DISABLED - F1 TEST API
// Cloudflare Pages Edge Runtime Configuration
export const runtime = 'nodejs';

import { NextResponse } from "next/server"
import f1Api from "f1-api-node"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const functionName = searchParams.get("function") || "getDriverData"

  try {
    let result;
    
    switch (functionName) {
      case "getDriverData":
        result = await f1Api.getDriverData()
        break
      case "getTeamLineup":
        result = await f1Api.getTeamLineup()
        break
      case "getDriverStandings":
        const year = parseInt(searchParams.get("year") || "2024")
        result = await f1Api.getDriverStandings(year)
        break
      case "getConstructorStandings":
        const constructorYear = parseInt(searchParams.get("year") || "2024")
        result = await f1Api.getConstructorStandings(constructorYear)
        break
      case "getWorldChampions":
        result = await f1Api.getWorldChampions()
        break
      case "getRaceResults":
        const raceYear = parseInt(searchParams.get("year") || "2024")
        result = await f1Api.getRaceResults(raceYear)
        break
      case "getRaceSchedule":
        const scheduleYear = parseInt(searchParams.get("year") || "2024")
        result = await f1Api.getRaceSchedule(scheduleYear)
        break
      case "getFastestLaps":
        const fastestYear = parseInt(searchParams.get("year") || "2024")
        result = await f1Api.getFastestLaps(fastestYear)
        break
      default:
        return NextResponse.json({ 
          error: "Invalid function. Available functions: getDriverData, getTeamLineup, getDriverStandings, getConstructorStandings, getWorldChampions, getRaceResults, getRaceSchedule, getFastestLaps" 
        }, { status: 400 })
    }

    return NextResponse.json({
      function: functionName,
      data: result,
      success: true,
    })
  } catch (error) {
    console.error("F1 API test error:", error)
    return NextResponse.json({ 
      error: `Failed to fetch ${functionName}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      function: functionName
    }, { status: 500 })
  }
}


// TEMPORARY PLACEHOLDER - F1 TEST API DISABLED
export async function GET() {
  return new Response(JSON.stringify({ 
    error: "F1 Test API temporarily disabled" 
  }), {
    status: 503,
    headers: { 'Content-Type': 'application/json' }
  });
}
*/