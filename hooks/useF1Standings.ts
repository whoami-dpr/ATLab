"use client"

import { useState, useEffect } from "react"

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

interface LastUpdated {
  date: string
  race: string
  round: number
  season: number
}

interface StandingsResponse {
  standings: DriverStanding[] | ConstructorStanding[]
  lastUpdated: LastUpdated
  success: boolean
}

export function useF1Standings(year?: number) {
  const [drivers, setDrivers] = useState<DriverStanding[]>([])
  const [constructors, setConstructors] = useState<ConstructorStanding[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<LastUpdated | null>(null)

  const fetchStandings = async (selectedYear?: number) => {
    try {
      setLoading(true)
      setError(null)
      const yearParam = selectedYear ? `&year=${selectedYear}` : '';
      // Fetch both drivers and constructors in parallel
      const [driversResponse, constructorsResponse] = await Promise.all([
        fetch(`/api/f1/standings?type=drivers${yearParam}`),
        fetch(`/api/f1/standings?type=constructors${yearParam}`),
      ])

      if (!driversResponse.ok || !constructorsResponse.ok) {
        throw new Error("Failed to fetch standings data")
      }

      const driversData: StandingsResponse = await driversResponse.json()
      const constructorsData: StandingsResponse = await constructorsResponse.json()

      if (!driversData.success || !constructorsData.success) {
        throw new Error("Invalid response from standings API")
      }

      setDrivers(driversData.standings as DriverStanding[])
      setConstructors(constructorsData.standings as ConstructorStanding[])
      setLastUpdated(driversData.lastUpdated)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred"
      setError(errorMessage)
      setDrivers([])
      setConstructors([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStandings(year)
  }, [year])

  const refresh = () => {
    fetchStandings(year)
  }

  return {
    drivers,
    constructors,
    loading,
    error,
    lastUpdated,
    refresh,
  }
}
