// Cloudflare Pages Edge Runtime Configuration
export const runtime = 'edge';

import { NextResponse } from "next/server"

interface DriverStanding {
  position: number
  driver: string
  team: string
  points: number
  wins?: number
}

interface ConstructorStanding {
  position: number
  team: string
  points: number
}

// Datos estáticos actualizados manualmente - 2025 F1 Season (Post-Silverstone)
const CURRENT_DRIVER_STANDINGS: DriverStanding[] = [
  { position: 1, driver: "Max Verstappen", team: "Red Bull Racing Honda RBPT", points: 195, wins: 4 },
  { position: 2, driver: "Lewis Hamilton", team: "Ferrari", points: 158, wins: 2 },
  { position: 3, driver: "Charles Leclerc", team: "Ferrari", points: 142, wins: 1 },
  { position: 4, driver: "Lando Norris", team: "McLaren Mercedes", points: 128, wins: 1 },
  { position: 5, driver: "George Russell", team: "Mercedes", points: 115, wins: 1 },
  { position: 6, driver: "Oscar Piastri", team: "McLaren Mercedes", points: 98, wins: 0 },
  { position: 7, driver: "Sergio Perez", team: "Red Bull Racing Honda RBPT", points: 85, wins: 0 },
  { position: 8, driver: "Kimi Antonelli", team: "Mercedes", points: 72, wins: 0 },
  { position: 9, driver: "Fernando Alonso", team: "Aston Martin Aramco Mercedes", points: 45, wins: 0 },
  { position: 10, driver: "Lance Stroll", team: "Aston Martin Aramco Mercedes", points: 28, wins: 0 },
  { position: 11, driver: "Pierre Gasly", team: "Alpine Renault", points: 24, wins: 0 },
  { position: 12, driver: "Esteban Ocon", team: "Alpine Renault", points: 18, wins: 0 },
  { position: 13, driver: "Nico Hulkenberg", team: "Haas Ferrari", points: 16, wins: 0 },
  { position: 14, driver: "Kevin Magnussen", team: "Haas Ferrari", points: 12, wins: 0 },
  { position: 15, driver: "Yuki Tsunoda", team: "RB Honda RBPT", points: 10, wins: 0 },
  { position: 16, driver: "Liam Lawson", team: "RB Honda RBPT", points: 8, wins: 0 },
  { position: 17, driver: "Alex Albon", team: "Williams Mercedes", points: 6, wins: 0 },
  { position: 18, driver: "Franco Colapinto", team: "Williams Mercedes", points: 4, wins: 0 },
  { position: 19, driver: "Valtteri Bottas", team: "Kick Sauber Ferrari", points: 2, wins: 0 },
  { position: 20, driver: "Zhou Guanyu", team: "Kick Sauber Ferrari", points: 0, wins: 0 },
]

const CURRENT_CONSTRUCTOR_STANDINGS: ConstructorStanding[] = [
  { position: 1, team: "Ferrari", points: 300 },
  { position: 2, team: "Red Bull Racing Honda RBPT", points: 280 },
  { position: 3, team: "McLaren Mercedes", points: 226 },
  { position: 4, team: "Mercedes", points: 187 },
  { position: 5, team: "Aston Martin Aramco Mercedes", points: 73 },
  { position: 6, team: "Alpine Renault", points: 42 },
  { position: 7, team: "Haas Ferrari", points: 28 },
  { position: 8, team: "RB Honda RBPT", points: 18 },
  { position: 9, team: "Williams Mercedes", points: 10 },
  { position: 10, team: "Kick Sauber Ferrari", points: 2 },
]

// Información de la última actualización
const LAST_UPDATED = {
  date: "2025-01-09",
  race: "British Grand Prix (Silverstone)",
  round: 12,
  season: 2025,
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get("type") || "drivers"

  try {
    // Simular un pequeño delay para parecer más realista
    await new Promise((resolve) => setTimeout(resolve, 100))

    if (type === "drivers") {
      return NextResponse.json({
        standings: CURRENT_DRIVER_STANDINGS,
        lastUpdated: LAST_UPDATED,
        success: true,
      })
    } else if (type === "constructors") {
      return NextResponse.json({
        standings: CURRENT_CONSTRUCTOR_STANDINGS,
        lastUpdated: LAST_UPDATED,
        success: true,
      })
    } else {
      return NextResponse.json({ error: "Invalid type. Use 'drivers' or 'constructors'" }, { status: 400 })
    }
  } catch (error) {
    console.error("Standings API error:", error)
    return NextResponse.json({ error: "Failed to fetch standings" }, { status: 500 })
  }
}
