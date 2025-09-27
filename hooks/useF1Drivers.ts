"use client"

import { useState, useEffect } from "react"

interface F1Driver {
  name: string
  team: string
  rank: string
  nationality: string
  driverImage: string
  nationalityCode: string
}

interface F1Team {
  name: string
  points: number
  drivers: string[]
  carLogo: string
  carImage: string
}

export function useF1Drivers() {
  const [drivers, setDrivers] = useState<F1Driver[]>([])
  const [teams, setTeams] = useState<F1Team[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch both drivers and teams in parallel
      const [driversResponse, teamsResponse] = await Promise.all([
        fetch('/api/f1/drivers'),
        fetch('/api/f1/teams')
      ])

      if (!driversResponse.ok || !teamsResponse.ok) {
        throw new Error("Failed to fetch F1 data")
      }

      const driversData = await driversResponse.json()
      const teamsData = await teamsResponse.json()

      if (!driversData.success || !teamsData.success) {
        throw new Error("Invalid response from F1 API")
      }

      setDrivers(driversData.drivers)
      setTeams(teamsData.teams)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred"
      setError(errorMessage)
      setDrivers([])
      setTeams([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const refresh = () => {
    fetchData()
  }

  return {
    drivers,
    teams,
    loading,
    error,
    refresh,
  }
}
