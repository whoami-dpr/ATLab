"use client"

import { memo } from "react"

interface FastestLapBannerProps {
  fastestLap?: {
    time: string
    driver: string | null
    driverCode: string | null
    team: string | null
    racingNumber: string | null
  }
  theme: 'light' | 'dark'
}

const FastestLapBanner = memo(({ fastestLap, theme }: FastestLapBannerProps) => {
  // Solo mostrar si hay datos de vuelta rápida
  if (!fastestLap || !fastestLap.driver || !fastestLap.time) {
    return null
  }

  // Convertir el tiempo de milisegundos a formato MM:SS.mmm
  const formatLapTime = (timeMs: string) => {
    // Si ya tiene formato (contiene :), devolverlo tal cual
    if (timeMs.includes(':')) return timeMs

    const time = parseFloat(timeMs)
    if (isNaN(time)) return timeMs
    
    const totalSeconds = time / 1000
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = Math.floor(totalSeconds % 60)
    const milliseconds = Math.floor((totalSeconds % 1) * 1000)
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`
  }

  const formattedTime = formatLapTime(fastestLap.time)

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
        <div className="w-10 h-full flex items-center justify-center bg-purple-600">
             <img
            src="/images/fastLap.png"
            alt="Fastest Lap"
            className="w-6 h-6 object-contain"
            />
        </div>
        
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
      <div className="bg-purple-600 flex items-center justify-between px-4 py-1 h-full flex-1 rounded-r-md">
        {/* Driver Name & Number Stacked */}
        <div className="flex flex-col items-start justify-center mr-4">
          <span 
            className="text-white text-[10px] font-bold leading-none mb-0.5"
            style={{ fontFamily: 'Formula1 Display Regular, Arial, sans-serif' }}
          >
            {fastestLap.racingNumber || ''}
          </span>
          <span 
            className="text-white text-sm font-bold leading-none uppercase"
            style={{ 
              fontFamily: 'Formula1 Display Regular, Arial, sans-serif',
              textShadow: '0 0 4px rgba(255, 255, 255, 0.3)'
            }}
          >
            {fastestLap.driverCode || ''}
          </span>
        </div>

        {/* Team Logo */}
        <div className="w-8 h-8 md:w-12 md:h-12 flex items-center justify-center mx-2 md:mx-4">
          <img
            src={getTeamLogo(fastestLap.team)}
            alt={fastestLap.team || 'Team'}
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
