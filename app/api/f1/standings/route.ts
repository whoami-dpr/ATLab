// Edge Runtime Configuration for F1 API (required for Cloudflare Pages)
export const runtime = 'edge';

import { NextResponse } from "next/server"

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
  wins?: number
  teamLogo: string
  teamColor: string
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

// Función para mapear datos de Jolpica/Ergast a nuestro formato
function mapJolpicaDriverData(apiData: any[]): DriverStanding[] {
  return apiData.map((standing: any) => {
    const driver = standing.Driver
    const constructor = standing.Constructors[0]
    
    const driverName = `${driver.givenName} ${driver.familyName}`
    const teamName = constructor ? constructor.name : "Unknown Team"
    
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
      position: parseInt(standing.position),
      driver: driverName,
      team: teamName,
      points: parseInt(standing.points),
      wins: parseInt(standing.wins),
      driverNumber: driver.permanentNumber || teamMapping.driverNumbers[driverName] || "00",
      driverPhoto: `/images/drivers/${driverName.toLowerCase().replace(/\s+/g, '-')}.jpg`,
      teamLogo: `/team-logos/${teamMapping.logo}`,
      teamColor: teamMapping.color
    }
  })
}

function mapJolpicaConstructorData(apiData: any[]): ConstructorStanding[] {
  return apiData.map((standing: any) => {
    const constructor = standing.Constructor
    const teamName = constructor.name
    
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
      position: parseInt(standing.position),
      team: teamName,
      points: parseInt(standing.points),
      wins: parseInt(standing.wins),
      teamLogo: `/team-logos/${teamMapping.logo}`,
      teamColor: teamMapping.color
    }
  })
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get("type") || "drivers"
  const year = parseInt(searchParams.get("year") || "2025")

  try {
    if (type === "drivers") {
      const response = await fetch(`https://api.jolpi.ca/ergast/f1/${year}/driverStandings.json`)
      if (!response.ok) {
        throw new Error(`Ergast API error: ${response.statusText}`)
      }
      const data = await response.json()
      const standingsList = data.MRData.StandingsTable.StandingsLists[0]?.DriverStandings || []
      const mappedDrivers = mapJolpicaDriverData(standingsList)
      
      return NextResponse.json({
        standings: mappedDrivers,
        success: true,
      })
    } else if (type === "constructors") {
      const response = await fetch(`https://api.jolpi.ca/ergast/f1/${year}/constructorStandings.json`)
      if (!response.ok) {
        throw new Error(`Ergast API error: ${response.statusText}`)
      }
      const data = await response.json()
      const standingsList = data.MRData.StandingsTable.StandingsLists[0]?.ConstructorStandings || []
      const mappedConstructors = mapJolpicaConstructorData(standingsList)
      
      return NextResponse.json({
        standings: mappedConstructors,
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
