"use client"

import Image from "next/image"

interface StandingsCardProps {
  rank: number
  name: string
  team?: string
  points: number
  logo?: string
  type: 'driver' | 'constructor'
}

export function StandingsCard({ rank, name, team, points, logo, type }: StandingsCardProps) {
  return (
    <div className="relative flex items-center justify-between px-3 py-2 rounded-lg border border-transparent bg-gray-800/30 transition-all hover:bg-gray-800/50 mb-1.5">
      {/* Left Section: Rank & Info */}
      <div className="flex items-center gap-3">
        {/* Rank Number - Simple and minimal */}
        <div className="w-6 flex items-center justify-center font-semibold text-sm text-gray-400 flex-shrink-0">
          {rank}
        </div>

        {/* Logo */}
        {logo && (
           <div className="w-6 h-6 relative flex-shrink-0">
             <Image 
               src={logo} 
               alt={name} 
               fill 
               className="object-contain"
             />
           </div>
        )}

        {/* Name & Team */}
        <div className="flex flex-col">
          <span className="text-white font-semibold text-sm leading-tight">
            {name}
          </span>
          {team && (
            <span className="text-gray-500 text-xs">
              {team}
            </span>
          )}
        </div>
      </div>

      {/* Right Section: Points */}
      <div className="text-right">
        <div className="text-white font-semibold text-base">
          {points}
        </div>
        <div className="text-gray-500 text-[10px] uppercase font-medium">
          pts
        </div>
      </div>
    </div>
  )
}
