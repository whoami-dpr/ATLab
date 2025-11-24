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
  // Determine styles based on rank
  const isTop3 = rank <= 3
  
  let borderColor = "border-gray-800"
  let rankBg = "bg-gray-700"
  let rankText = "text-gray-300"
  let icon = null

  if (rank === 1) {
    borderColor = "border-yellow-500"
    rankBg = "bg-yellow-500"
    rankText = "text-black"
    icon = "🏆" // Gold trophy placeholder or icon
  } else if (rank === 2) {
    borderColor = "border-gray-300" // Silver
    rankBg = "bg-gray-300"
    rankText = "text-black"
    icon = "🥈"
  } else if (rank === 3) {
    borderColor = "border-orange-600" // Bronze
    rankBg = "bg-orange-600"
    rankText = "text-black"
    icon = "🥉"
  }

  return (
    <div className={`
      relative flex items-center justify-between p-4 rounded-xl border 
      ${isTop3 ? `${borderColor} bg-gray-900/50` : 'border-transparent bg-gray-800/50'}
      transition-all hover:bg-gray-800 mb-3
    `}>
      {/* Left Section: Rank & Info */}
      <div className="flex items-center gap-4">
        {/* Rank Circle / Icon */}
        <div className={`
          w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0
          ${rankBg} ${rankText}
        `}>
          {isTop3 ? (
            <span className="text-xl">{icon}</span> // You can replace with SVG icons if preferred
          ) : (
            rank
          )}
        </div>

        {/* Logo (Team or Driver Photo if available, but image shows team logo) */}
        {logo && (
           <div className="w-8 h-8 relative flex-shrink-0">
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
          <span className="text-white font-bold text-lg leading-tight">
            {name}
          </span>
          {team && (
            <span className="text-gray-400 text-sm">
              {team}
            </span>
          )}
        </div>
      </div>

      {/* Right Section: Points */}
      <div className="text-right">
        <div className="text-white font-bold text-xl">
          {points}
        </div>
        <div className="text-gray-500 text-xs uppercase font-bold">
          pts
        </div>
      </div>
    </div>
  )
}
