/* TEMPORARILY DISABLED - ENHANCED STANDINGS TABLE
"use client"

import React from "react"
import Image from "next/image"

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
  nationality?: string
}

interface EnhancedStandingsTableProps {
  drivers: DriverStanding[]
  loading?: boolean
  error?: string | null
}

export function EnhancedStandingsTable({ drivers, loading, error }: EnhancedStandingsTableProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Error: {error}</p>
      </div>
    )
  }

  if (!drivers || drivers.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No standings data available</p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Pos
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Driver
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Team
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Points
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Wins
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {drivers.map((driver, index) => (
              <tr key={driver.driver} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {driver.position}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <Image
                        src={driver.driverPhoto}
                        alt={driver.driver}
                        width={40}
                        height={40}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {driver.driver}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        #{driver.driverNumber}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8">
                      <Image
                        src={driver.teamLogo}
                        alt={driver.team}
                        width={32}
                        height={32}
                        className="h-8 w-8 object-contain"
                      />
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {driver.team}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {driver.points}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {driver.wins || 0}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
*/

// TEMPORARY PLACEHOLDER - ENHANCED STANDINGS TABLE DISABLED
export function EnhancedStandingsTable() {
  return (
    <div className="text-center py-8">
      <p className="text-gray-500">Standings table temporarily disabled</p>
    </div>
  )
}