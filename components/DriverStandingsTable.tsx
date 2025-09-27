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
}

interface DriverStandingsTableProps {
  drivers: DriverStanding[]
  loading?: boolean
  error?: string | null
  year?: number
}

export function DriverStandingsTable({ drivers, loading, error, year = 2025 }: DriverStandingsTableProps) {
  if (loading) {
    return (
      <div className="w-full bg-white dark:bg-[#111213] rounded-xl shadow-lg border border-gray-200 dark:border-[#23272b] overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-[#23272b] text-base font-semibold text-gray-900 dark:text-white">
          F1 {year} Driver Championship
        </div>
        <div className="flex items-center justify-center h-32 text-gray-600 dark:text-gray-400 text-base">
          Cargando clasificaciones...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full bg-white dark:bg-[#111213] rounded-xl shadow-lg border border-gray-200 dark:border-[#23272b] overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-[#23272b] text-base font-semibold text-gray-900 dark:text-white">
          F1 {year} Driver Championship
        </div>
        <div className="flex items-center justify-center h-32 text-red-600 dark:text-red-400 text-base">
          Error: {error}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full bg-white dark:bg-[#111213] rounded-xl shadow-lg border border-gray-200 dark:border-[#23272b] overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-[#23272b] text-base font-semibold text-gray-900 dark:text-white">
        F1 {year} Driver Championship
      </div>
      
      {/* Header */}
      <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-gray-50 dark:bg-[#1a1b1d] text-gray-600 dark:text-gray-400 text-xs font-medium border-b border-gray-200 dark:border-[#23272b]">
        <div className="col-span-1 text-center">Pos</div>
        <div className="col-span-7">Driver</div>
        <div className="col-span-2 text-center">Team</div>
        <div className="col-span-2 text-right">Pts</div>
      </div>

      {/* Driver Rows */}
      <div className="divide-y divide-gray-200 dark:divide-[#23272b]">
        {drivers.map((driver, index) => (
          <div 
            key={driver.position} 
            className="grid grid-cols-12 gap-2 px-4 py-2 hover:bg-gray-50 dark:hover:bg-[#1a1b1d]/50 transition-colors duration-200"
          >
            {/* Position with colored bar */}
            <div className="col-span-1 flex items-center justify-center">
              <div className="flex items-center">
                <div 
                  className="w-1 h-5 rounded-full mr-1"
                  style={{ backgroundColor: driver.teamColor }}
                />
                <span className="text-sm font-bold text-gray-900 dark:text-white">{driver.position}</span>
              </div>
            </div>

            {/* Driver Info */}
            <div className="col-span-7 flex items-center space-x-2">
              {/* Driver Photo */}
              <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
                <Image
                  src={driver.driverPhoto}
                  alt={driver.driver}
                  width={32}
                  height={32}
                  className="object-cover"
                  onError={(e) => {
                    // Fallback to placeholder if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder-user.jpg';
                  }}
                />
              </div>
              
              {/* Driver Name and Number */}
              <div className="flex flex-col min-w-0">
                <span className="text-gray-900 dark:text-white font-semibold text-sm truncate">{driver.driver}</span>
                <div className="flex items-center space-x-1">
                  <span className="text-gray-600 dark:text-gray-400 text-xs">#{driver.driverNumber}</span>
                </div>
              </div>
            </div>

            {/* Team Info */}
            <div className="col-span-2 flex items-center justify-center">
              {/* Team Logo */}
              <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center">
                <Image
                  src={driver.teamLogo}
                  alt={driver.team}
                  width={20}
                  height={20}
                  className="object-contain"
                  onError={(e) => {
                    // Fallback to placeholder if logo fails to load
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder-logo.svg';
                  }}
                />
              </div>
            </div>

            {/* Points */}
            <div className="col-span-2 flex items-center justify-end">
              <span className="text-gray-900 dark:text-white font-bold text-sm">{driver.points}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
