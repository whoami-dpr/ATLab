"use client"

import { StandingsCard } from "./StandingsCard"
import { DriverStanding, ConstructorStanding } from "../hooks/useF1Standings"

interface StandingsListProps {
  title: string
  data: (DriverStanding | ConstructorStanding)[]
  type: 'driver' | 'constructor'
}

export function StandingsList({ title, data, type }: StandingsListProps) {
  return (
    <div className="flex flex-col w-full">
      <h2 className="text-2xl font-bold text-white mb-6 pl-2 border-l-4 border-red-600">
        {title}
      </h2>
      
      <div className="flex flex-col gap-2">
        {data.map((item) => {
          // Determine props based on type
          const name = type === 'driver' 
            ? (item as DriverStanding).driver 
            : (item as ConstructorStanding).team
            
          const team = type === 'driver' 
            ? (item as DriverStanding).team 
            : "Team" // Or leave empty if redundant for constructors
            
          const logo = type === 'driver'
            ? (item as DriverStanding).teamLogo // Drivers show team logo in the image
            : (item as ConstructorStanding).teamLogo

          return (
            <StandingsCard
              key={type === 'driver' ? (item as DriverStanding).driver : (item as ConstructorStanding).team}
              rank={item.position}
              name={name}
              team={team}
              points={item.points}
              logo={logo}
              type={type}
            />
          )
        })}
      </div>
    </div>
  )
}
