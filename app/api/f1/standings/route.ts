/* TEMPORARILY DISABLED - STANDINGS API
// Node.js Runtime Configuration for F1 API
export const runtime = 'nodejs';

import { NextResponse } from "next/server"

// Import f1-api-node using require for Node.js compatibility
const f1Api = require("f1-api-node")

interface DriverStanding {
  position: number
  driver: string
  team: string
  points: number
  wins?: number
  driverNumber: string
  driverPhoto: string
  teamLogo: string
  teamColor: string
}

interface ConstructorStanding {
  position: number
  team: string
  points: number
}

// Mapeo de equipos para logos y colores
const TEAM_MAPPING: Record<string, { logo: string; color: string; driverNumbers: Record<string, string> }> = {
  "Red Bull": { 
    logo: "red-bull-racing.svg", 
    color: "#1e41ff",
    driverNumbers: { "Max Verstappen": "1", "Sergio Pérez": "11" }
  },
  "Ferrari": { 
    logo: "ferrari.svg", 
    color: "#dc0000",
    driverNumbers: { "Charles Leclerc": "16", "Lewis Hamilton": "44" }
  },
  "McLaren": { 
    logo: "mclaren.svg", 
    color: "#ff8700",
    driverNumbers: { "Lando Norris": "4", "Oscar Piastri": "81" }
  },
  "Mercedes": { 
    logo: "mercedes.svg", 
    color: "#00d2be",
    driverNumbers: { "George Russell": "63", "Lewis Hamilton": "44" }
  },
  "Aston Martin": { 
    logo: "aston-martin.svg", 
    color: "#229971",
    driverNumbers: { "Fernando Alonso": "14", "Lance Stroll": "18" }
  },
  "Alpine": { 
    logo: "alpine.svg", 
    color: "#2293d1",
    driverNumbers: { "Pierre Gasly": "10", "Esteban Ocon": "31" }
  },
  "Williams": { 
    logo: "williams.svg", 
    color: "#003d82",
    driverNumbers: { "Alexander Albon": "23", "Logan Sargeant": "2" }
  },
  "Haas": { 
    logo: "haas-f1-team.svg", 
    color: "#b6babd",
    driverNumbers: { "Nico Hulkenberg": "27", "Kevin Magnussen": "20" }
  },
  "RB": { 
    logo: "racing-bulls.svg", 
    color: "#6692ff",
    driverNumbers: { "Yuki Tsunoda": "22", "Daniel Ricciardo": "3" }
  },
  "Sauber": { 
    logo: "kick-sauber.svg", 
    color: "#52e252",
    driverNumbers: { "Valtteri Bottas": "77", "Zhou Guanyu": "24" }
  }
}

// Función para mapear datos de f1-api-node a nuestro formato
function mapF1ApiDriverData(apiData: any[]): DriverStanding[] {
  return apiData.map((standing: any, index: number) => {
    const driverName = standing.driver || "Unknown Driver"
    const teamName = standing.team || "Unknown Team"
    
    // Buscar el mapeo del equipo
    const teamMapping = Object.entries(TEAM_MAPPING).find(([key]) => {
      const teamLower = teamName.toLowerCase()
      const keyLower = key.toLowerCase()
      return teamLower.includes(keyLower) || keyLower.includes(teamLower)
    })?.[1] || {
      logo: "red-bull-racing.svg",
      color: "#1e41ff",
      driverNumbers: {}
    }
    
    return {
      position: standing.position || index + 1,
      driver: driverName,
      team: teamName,
      points: parseInt(standing.points) || 0,
      wins: parseInt(standing.wins) || 0,
      driverNumber: teamMapping.driverNumbers[driverName] || "00",
      driverPhoto: `/images/drivers/${driverName.toLowerCase().replace(/\s+/g, '-')}.jpg`,
      teamLogo: `/team-logos/${teamMapping.logo}`,
      teamColor: teamMapping.color
    }
  })
}

function mapF1ApiConstructorData(apiData: any[]): ConstructorStanding[] {
  return apiData.map((standing: any, index: number) => ({
    position: standing.position || index + 1,
    team: standing.team || "Unknown Team",
    points: parseInt(standing.points) || 0
  }))
}


export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get("type") || "drivers"
  const year = parseInt(searchParams.get("year") || "2025")

  try {
    if (type === "drivers") {
      // Usar f1-api-node para obtener las clasificaciones reales
      const driverStandings = await f1Api.getDriverStandings(year)
      const mappedDrivers = mapF1ApiDriverData(driverStandings)
      
      return NextResponse.json({
        standings: mappedDrivers,
        lastUpdated: {
          date: new Date().toISOString().split('T')[0],
          race: "Current Season",
          round: 1,
          season: year,
        },
        success: true,
      })
    } else if (type === "constructors") {
      // Usar f1-api-node para obtener las clasificaciones de constructores
      const constructorStandings = await f1Api.getConstructorStandings(year)
      const mappedConstructors = mapF1ApiConstructorData(constructorStandings)
      
      return NextResponse.json({
        standings: mappedConstructors,
        lastUpdated: {
          date: new Date().toISOString().split('T')[0],
          race: "Current Season",
          round: 1,
          season: year,
        },
        success: true,
      })
    } else {
      return NextResponse.json({ error: "Invalid type. Use 'drivers' or 'constructors'" }, { status: 400 })
    }
  } catch (error) {
    console.error("F1 API error:", error)
    return NextResponse.json({ 
      error: `Failed to fetch ${type} standings: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 })
  }
}


// TEMPORARY PLACEHOLDER - STANDINGS API DISABLED
export async function GET() {
  return new Response(JSON.stringify({ 
    error: "Standings API temporarily disabled" 
  }), {
    status: 503,
    headers: { 'Content-Type': 'application/json' }
  });
}
*/