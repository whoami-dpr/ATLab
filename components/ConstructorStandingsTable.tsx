"use client"

import React from "react"
import Image from "next/image"

interface ConstructorStanding {
  position: number
  team: string
  points: number
}

interface ConstructorStandingsTableProps {
  constructors: ConstructorStanding[]
  loading?: boolean
  error?: string | null
  year?: number
}

export function ConstructorStandingsTable({ constructors, loading, error, year = 2025 }: ConstructorStandingsTableProps) {
  if (loading) {
    return (
      <div className="w-full bg-white dark:bg-[#111213] rounded-xl shadow-lg border border-gray-200 dark:border-[#23272b] overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-[#23272b] text-base font-semibold text-gray-900 dark:text-white">
          F1 {year} Constructor Championship
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
          F1 {year} Constructor Championship
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
        F1 {year} Constructor Championship
      </div>
      
      {/* Header */}
      <div className="grid grid-cols-4 gap-4 px-4 py-2 bg-gray-50 dark:bg-[#1a1b1d] text-gray-600 dark:text-gray-400 text-xs font-medium border-b border-gray-200 dark:border-[#23272b]">
        <div className="text-center">Pos</div>
        <div>Constructor</div>
        <div className="text-center">Logo</div>
        <div className="text-right">Pts</div>
      </div>

      {/* Constructor Rows */}
      <div className="divide-y divide-gray-200 dark:divide-[#23272b]">
        {constructors.map((constructor, index) => (
          <div 
            key={constructor.position} 
            className="grid grid-cols-4 gap-4 px-4 py-3 hover:bg-gray-50 dark:hover:bg-[#1a1b1d]/50 transition-colors duration-200"
          >
            <div className="flex items-center justify-center">
              <span className="text-lg font-bold text-gray-900 dark:text-white">{constructor.position}</span>
            </div>
            <div className="flex items-center">
              <span className="text-gray-900 dark:text-white font-medium text-sm">{constructor.team}</span>
            </div>
            <div className="flex items-center justify-center">
              <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center">
                <Image
                  src={`/team-logos/${constructor.team.toLowerCase().replace(/\s+/g, '-')}.svg`}
                  alt={constructor.team}
                  width={32}
                  height={32}
                  className="object-contain"
                  onError={(e) => {
                    // Fallback to placeholder if logo fails to load
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder-logo.svg';
                  }}
                />
              </div>
            </div>
            <div className="flex items-center justify-end">
              <span className="text-gray-900 dark:text-white font-bold text-lg">{constructor.points}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
