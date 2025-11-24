"use client"

import { useState, useEffect, useCallback } from "react"

export interface DriverStanding {
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

export interface ConstructorStanding {
  position: number
  team: string
  points: number
  wins?: number
  teamLogo: string
  teamColor: string
}

export function useF1Standings() {
  const [driverStandings, setDriverStandings] = useState<DriverStanding[]>([])
  const [constructorStandings, setConstructorStandings] = useState<ConstructorStanding[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStandings = useCallback(async (year: string | number = "2025") => {
    setLoading(true)
    setError(null)
    
    try {
      // Fetch drivers
      const driversResponse = await fetch(`/api/f1/standings?type=drivers&year=${year}`)
      if (!driversResponse.ok) throw new Error('Failed to fetch driver standings')
      const driversData = await driversResponse.json()
      setDriverStandings(driversData.standings || [])

      // Fetch constructors
      const constructorsResponse = await fetch(`/api/f1/standings?type=constructors&year=${year}`)
      if (!constructorsResponse.ok) throw new Error('Failed to fetch constructor standings')
      const constructorsData = await constructorsResponse.json()
      setConstructorStandings(constructorsData.standings || [])

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStandings()
  }, [fetchStandings])

  return {
    driverStandings,
    constructorStandings,
    loading,
    error,
    fetchStandings
  }
}
