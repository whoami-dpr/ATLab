// Node.js Runtime Configuration
export const runtime = 'nodejs';

import { NextResponse } from "next/server"

// Import f1-api-node using require for Node.js compatibility
const f1Api = require("f1-api-node")

export async function GET(request: Request) {
  try {
    // Usar f1-api-node para obtener datos de equipos
    const teamLineup = await f1Api.getTeamLineup()
    
    // Mapear los datos para incluir las imágenes reales
    const teamsWithImages = teamLineup.map((team: any) => ({
      name: team.name,
      points: team.points,
      drivers: team.drivers,
      carLogo: team.carLogo,
      carImage: team.carImage
    }))
    
    return NextResponse.json({
      teams: teamsWithImages,
      success: true,
    })
  } catch (error) {
    console.error("F1 Teams API error:", error)
    return NextResponse.json({ 
      error: `Failed to fetch teams: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 })
  }
}
