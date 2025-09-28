/* TEMPORARILY DISABLED - F1 DRIVERS API
// Node.js Runtime Configuration
export const runtime = 'nodejs';

import { NextResponse } from "next/server"

// Import f1-api-node using require for Node.js compatibility
const f1Api = require("f1-api-node")

export async function GET(request: Request) {
  try {
    // Usar f1-api-node para obtener datos de pilotos
    const driverLineup = await f1Api.getDriverLineup()
    
    // Mapear los datos para incluir las imágenes reales
    const driversWithImages = driverLineup.map((driver: any) => ({
      name: driver.name,
      team: driver.team,
      rank: driver.rank,
      nationality: driver.nationalityImage,
      driverImage: driver.driverImage,
      nationalityCode: driver.nationality
    }))
    
    return NextResponse.json({
      drivers: driversWithImages,
      success: true,
    })
  } catch (error) {
    console.error("F1 Drivers API error:", error)
    return NextResponse.json({ 
      error: `Failed to fetch drivers: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 })
  }
}
*/

// TEMPORARY PLACEHOLDER - F1 DRIVERS API DISABLED
export const runtime = 'edge';

export async function GET() {
  return new Response(JSON.stringify({ 
    error: "Drivers API temporarily disabled" 
  }), {
    status: 503,
    headers: { 'Content-Type': 'application/json' }
  });
}