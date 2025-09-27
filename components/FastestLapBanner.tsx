"use client"

import { memo } from "react"

interface FastestLapBannerProps {
  fastestLapDriver: string | null
  fastestLapTime: string | null
  fastestLapTeam?: string | null
  fastestLapDriverName?: string | null
  theme: 'light' | 'dark'
}

const FastestLapBanner = memo(({ fastestLapDriver, fastestLapTime, fastestLapTeam, fastestLapDriverName, theme }: FastestLapBannerProps) => {
  // Solo mostrar si hay datos de vuelta rápida
  if (!fastestLapDriver || !fastestLapTime) {
    return null
  }

  // Convertir el tiempo de milisegundos a formato MM:SS.mmm
  const formatLapTime = (timeMs: string) => {
    const time = parseFloat(timeMs)
    if (isNaN(time)) return timeMs
    
    const totalSeconds = time / 1000
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = Math.floor(totalSeconds % 60)
    const milliseconds = Math.floor((totalSeconds % 1) * 1000)
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`
  }

  const formattedTime = formatLapTime(fastestLapTime)

  // Función para obtener el logo del equipo
  const getTeamLogo = (teamName: string | null) => {
    if (!teamName) return '/placeholder-logo.svg'
    
    const teamLogos: Record<string, string> = {
      'Red Bull': '/team-logos/red-bull-racing.svg',
      'Red Bull Racing': '/team-logos/red-bull-racing.svg',
      'Ferrari': '/team-logos/ferrari.svg',
      'Mercedes': '/team-logos/mercedes.svg',
      'McLaren': '/team-logos/mclaren.svg',
      'Aston Martin': '/team-logos/aston-martin.svg',
      'Alpine': '/team-logos/alpine.svg',
      'Williams': '/team-logos/williams.svg',
      'Haas': '/team-logos/haas-f1-team.svg',
      'Haas F1 Team': '/team-logos/haas-f1-team.svg',
      'Kick Sauber': '/team-logos/kick-sauber.svg',
      'Sauber': '/team-logos/kick-sauber.svg',
      'RB': '/team-logos/racing-bulls.svg',
      'Racing Bulls': '/team-logos/racing-bulls.svg'
    }
    
    return teamLogos[teamName] || '/placeholder-logo.svg'
  }

  return (
    <div className="flex items-center rounded-md overflow-hidden shadow-lg h-10 md:h-12">
      {/* Left Section - Purple with FastLap Image and FASTEST LAP Text */}
      <div className="bg-purple-600 flex items-center h-full w-40 md:w-48">
        {/* FastLap Image */}
        <img
          src="/images/fastLap.png"
          alt="Fastest Lap"
          className="w-6 h-6 md:w-8 md:h-8 object-contain mx-2"
        />
        
        {/* FASTEST LAP Text - Black background fills remaining space */}
        <div className="bg-black flex-1 h-full flex items-center justify-center px-2 md:px-3">
          <span 
            className="text-purple-400 font-bold text-xs md:text-sm tracking-wide whitespace-nowrap"
            style={{ 
              fontFamily: 'Formula1 Display Regular, Arial, sans-serif',
              textShadow: '0 0 8px rgba(168, 85, 247, 0.5)'
            }}
          >
            FASTEST LAP
          </span>
        </div>
      </div>

      {/* Right Section - Purple with Driver Info and Time */}
      <div className="bg-purple-600 flex items-center justify-between px-2 md:px-4 py-1 md:py-2 h-full flex-1 rounded-r-md">
        {/* Driver Name */}
        <div className="flex flex-col">
          <span 
            className="text-white text-xs font-normal uppercase"
            style={{ 
              fontFamily: 'Formula1 Display Regular, Arial, sans-serif',
              textShadow: '0 0 4px rgba(255, 255, 255, 0.3)'
            }}
          >
            {fastestLapDriver}
          </span>
          <span 
            className="text-white text-xs md:text-sm font-bold"
            style={{ 
              fontFamily: 'Formula1 Display Regular, Arial, sans-serif',
              textShadow: '0 0 4px rgba(255, 255, 255, 0.3)'
            }}
          >
            {fastestLapDriverName || fastestLapDriver}
          </span>
        </div>

        {/* Team Logo */}
        <div className="w-8 h-8 md:w-12 md:h-12 flex items-center justify-center mx-2 md:mx-4">
          <img
            src={getTeamLogo(fastestLapTeam)}
            alt={fastestLapTeam || 'Team'}
            className="w-6 h-6 md:w-10 md:h-10 object-contain"
            onError={(e) => {
              // Fallback si el logo no carga
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder-logo.svg';
            }}
          />
        </div>

        {/* Lap Time */}
        <span 
          className="text-white text-sm md:text-lg font-bold"
          style={{ 
            fontFamily: 'Formula1 Display Regular, Arial, sans-serif',
            textShadow: '0 0 8px rgba(255, 255, 255, 0.5)'
          }}
        >
          {formattedTime}
        </span>
      </div>
    </div>
  )
})

FastestLapBanner.displayName = "FastestLapBanner"

export { FastestLapBanner }
