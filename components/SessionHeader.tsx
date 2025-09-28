"use client"

import { memo } from "react"
import { WeatherWidget } from "./WeatherWidget"
import { FastestLapBanner } from "./FastestLapBanner"
import type { F1SessionInfo } from "../hooks/useF1SignalR"
import { useSchedule } from "../hooks/useSchedule"
import { useThemeOptimized } from "../hooks/useThemeOptimized"

interface SessionHeaderProps {
  sessionInfo: F1SessionInfo
  isConnected: boolean
  error: string | null
  hasActiveSession: boolean
  fastestLapDriver?: string | null
  fastestLapTime?: string | null
  fastestLapTeam?: string | null
  fastestLapDriverName?: string | null
}

const SessionHeader = memo(({ sessionInfo, isConnected, error, hasActiveSession, fastestLapDriver, fastestLapTime, fastestLapTeam, fastestLapDriverName }: SessionHeaderProps) => {
  const { schedule } = useSchedule()
  const { theme } = useThemeOptimized()
  
  const getTrackStatusColor = () => {
    const status = sessionInfo.trackStatus.toLowerCase()
    if (status.includes("green") || status.includes("clear"))
      return "bg-gradient-to-r from-green-500 to-green-600 shadow-md shadow-green-500/25"
    if (status.includes("yellow"))
      return "bg-gradient-to-r from-yellow-500 to-yellow-600 shadow-md shadow-yellow-500/25"
    if (status.includes("red")) return "bg-gradient-to-r from-red-500 to-red-600 shadow-md shadow-red-500/25"
    return "bg-gradient-to-r from-gray-500 to-gray-600 shadow-md shadow-gray-500/25"
  }

  // Obtener información del GP actual del schedule
  const getCurrentGPInfo = () => {
    if (!schedule || schedule.length === 0) {
      return {
        gpName: sessionInfo.raceName || 'F1 Live Timing',
        country: 'Unknown',
        sessionType: 'Session'
      }
    }

    // Buscar el GP actual (el que no está terminado)
    const currentGP = schedule.find(gp => !gp.over) || schedule[0]
    
    // Extraer el tipo de sesión del raceName
    let sessionType = 'Session'
    if (sessionInfo.raceName) {
      if (sessionInfo.raceName.toLowerCase().includes('qualifying')) {
        sessionType = 'Qualifying'
      } else if (sessionInfo.raceName.toLowerCase().includes('practice')) {
        sessionType = 'Practice'
      } else if (sessionInfo.raceName.toLowerCase().includes('race')) {
        sessionType = 'Race'
      } else if (sessionInfo.raceName.toLowerCase().includes('sprint')) {
        sessionType = 'Sprint'
      }
    }

    // Extraer solo el nombre del país y "Grand Prix" del nombre completo
    let shortGPName = currentGP.name
    if (currentGP.name) {
      // Buscar el patrón "PAÍS Grand Prix" en el nombre
      const match = currentGP.name.match(/(\w+)\s+Grand\s+Prix/i)
      if (match) {
        shortGPName = `${match[1]} Grand Prix`
      } else {
        // Si no encuentra el patrón, usar solo el país del schedule
        shortGPName = `${currentGP.country} Grand Prix`
      }
    }

    return {
      gpName: shortGPName,
      country: currentGP.country,
      sessionType: sessionType
    }
  }

  const gpInfo = getCurrentGPInfo()

  const getCountryFlag = (country: string) => {
    // Mapeo de países a códigos de bandera (usando el mismo del schedule)
    const countryNameToCode: Record<string, string> = {
      Australia: 'aus',
      Austria: 'aut',
      Azerbaijan: 'aze',
      Belgium: 'bel',
      Brazil: 'bra',
      Bahrain: 'brn',
      Canada: 'can',
      China: 'chn',
      Spain: 'esp',
      France: 'fra',
      UnitedKingdom: 'gbr',
      Hungary: 'hun',
      Italy: 'ita',
      Japan: 'jpn',
      Mexico: 'mex',
      Monaco: 'mco',
      Netherlands: 'nld',
      Qatar: 'qat',
      SaudiArabia: 'sau',
      Singapore: 'sgp',
      USA: 'usa',
      UnitedStates: 'usa',
      Miami: 'usa',
      LasVegas: 'usa',
      AbuDhabi: 'are',
    }

    const code = countryNameToCode[country.replace(/\s/g, '')] || 'aze'
    const flagUrl = `/country-flags/${code.toLowerCase()}.svg`

    return (
      <div className={`w-8 h-6 rounded overflow-hidden flex items-center justify-center bg-gray-200 ${
        theme === 'light' ? 'shadow-md shadow-gray-400/50 hover:bg-gray-100 transition-colors duration-200' : ''
      }`}>
        <img 
          src={flagUrl} 
          alt={`${country} flag`}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback si la imagen no carga
            e.currentTarget.style.display = 'none'
            e.currentTarget.parentElement!.innerHTML = `
              <div class="w-8 h-6 rounded bg-gradient-to-b from-blue-500 via-white to-red-500 flex items-center justify-center">
                <div class="w-2 h-2 bg-blue-500 rounded-sm"></div>
              </div>
            `
          }}
        />
      </div>
    )
  }

  // Estado de conexión
  let statusColor = "bg-red-500"
  let statusText = "Offline"
  if (isConnected && !error) {
    statusColor = "bg-green-500"
    statusText = "Online"
  }

  // Animación para el círculo de estado
  let statusCircleClass = `${statusColor} w-2 h-2 rounded-full inline-block`
  if (isConnected && !error) {
    statusCircleClass += ' animate-pulse'
  } else {
    statusCircleClass += ' animate-ping'
  }

  return (
    <div className={`border-b bg-transparent ${
      theme === 'light' ? 'border-gray-300/50' : 'border-gray-800/50'
    }`}>
      {/* Mobile Layout */}
      <div className="block md:hidden p-3 space-y-3">
        {/* Top Row: Logo and Timer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/images/F1-Logo.png" alt="F1 Logo" className="h-8 w-auto object-contain" />
            <h1 className={`text-base font-semibold flex items-center gap-2 ${
              theme === 'light' ? 'text-black' : 'text-white'
            }`} style={{ fontFamily: 'Inter, Segoe UI, Arial, sans-serif', fontWeight: 'bold' }}>
              Live Timing
              <span
                className={`w-2 h-2 rounded-full inline-block ml-1 ${statusColor} ${(!isConnected || error) ? 'animate-blink' : ''}`}
                title={isConnected && !error ? 'Online' : 'Offline'}
              ></span>
            </h1>
          </div>
          <div className={`text-xl font-bold ${
            theme === 'light' ? 'text-black' : 'text-white'
          }`} style={{ fontFamily: 'Inter, Segoe UI, Arial, sans-serif', fontWeight: 'bold' }}>
            {sessionInfo.timer}
          </div>
        </div>

        {/* GP Info and Status Row - Moved right below F1 Live */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getCountryFlag(gpInfo.country)}
            <div className="flex flex-col">
              <div className={`text-xs font-medium leading-none ${
                theme === 'light' ? 'text-black' : 'text-white'
              }`}>
                {gpInfo.gpName}
              </div>
              <div className={`text-xs ${
                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
              }`}>
                {gpInfo.sessionType}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center">
              <span className={`text-xs font-medium leading-none mb-0.5 ${
                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
              }`}>Laps</span>
              <span className={`text-sm font-semibold leading-none ${
                theme === 'light' ? 'text-black' : 'text-white'
              }`}>{sessionInfo.lapInfo}</span>
            </div>
            <div className={`px-2 py-1 rounded text-xs font-bold text-white ${
              sessionInfo.trackStatus?.toLowerCase().includes('red') || sessionInfo.trackStatus?.toLowerCase().includes('red flag')
                ? 'bg-red-600'
                : sessionInfo.trackStatus?.toLowerCase().includes('yellow') || sessionInfo.trackStatus?.toLowerCase().includes('yellow flag')
                  ? 'bg-yellow-600'
                  : sessionInfo.trackStatus?.toLowerCase().includes('green') || sessionInfo.trackStatus?.toLowerCase().includes('clear') || sessionInfo.trackStatus?.toLowerCase().includes('green flag')
                    ? 'bg-green-600'
                    : 'bg-gray-600'
            }`}>
              {sessionInfo.trackStatus?.toLowerCase().includes('red') || sessionInfo.trackStatus?.toLowerCase().includes('red flag')
                ? 'Red'
                : sessionInfo.trackStatus?.toLowerCase().includes('yellow') || sessionInfo.trackStatus?.toLowerCase().includes('yellow flag')
                  ? 'Yellow'
                  : sessionInfo.trackStatus?.toLowerCase().includes('green') || sessionInfo.trackStatus?.toLowerCase().includes('clear') || sessionInfo.trackStatus?.toLowerCase().includes('green flag')
                    ? 'Green'
                    : 'No Flag'
              }
            </div>
          </div>
        </div>

        {/* Weather Row */}
        <div className="flex justify-center">
          <WeatherWidget weather={sessionInfo.weather} />
        </div>

        {/* Fastest Lap Banner */}
        <div className="flex justify-center mt-6">
          <FastestLapBanner 
            fastestLapDriver={fastestLapDriver}
            fastestLapTime={fastestLapTime}
            fastestLapTeam={fastestLapTeam}
            fastestLapDriverName={fastestLapDriverName}
            theme={theme}
          />
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex items-center justify-between p-4 min-h-[60px]">
        <div className="flex items-center gap-4 min-h-[52px]">
          <div className="h-full flex items-center">
            <img src="/images/F1-Logo.png" alt="F1 Logo" className="h-full w-auto max-h-[2.8rem] object-contain" />
          </div>
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-2">
              <h1 className={`text-lg font-semibold flex items-center gap-2 ${
                theme === 'light' ? 'text-black' : 'text-white'
              }`} style={{ fontFamily: 'Inter, Segoe UI, Arial, sans-serif', fontWeight: 'bold' }}>
                F1 Live Timing
                <span
                  className={`w-2 h-2 rounded-full inline-block ml-1 ${statusColor} ${(!isConnected || error) ? 'animate-blink' : ''}`}
                  title={isConnected && !error ? 'Online' : 'Offline'}
                ></span>
              </h1>
            </div>
            <div className={`text-2xl font-bold leading-none ${
              theme === 'light' ? 'text-black' : 'text-white'
            }`} style={{ fontFamily: 'Inter, Segoe UI, Arial, sans-serif', fontWeight: 'bold' }}>{sessionInfo.timer}</div>
          </div>
        </div>

        <div className="flex items-center gap-8">
          {/* Fastest Lap Banner */}
          <FastestLapBanner 
            fastestLapDriver={fastestLapDriver}
            fastestLapTime={fastestLapTime}
            fastestLapTeam={fastestLapTeam}
            fastestLapDriverName={fastestLapDriverName}
            theme={theme}
          />

          <WeatherWidget weather={sessionInfo.weather} />

          {/* Grand Prix Info with Flag */}
          <div className="flex items-center gap-4">
            {getCountryFlag(gpInfo.country)}
            <div className="flex flex-col">
              <div className={`text-sm font-medium leading-none ${
                theme === 'light' ? 'text-black' : 'text-white'
              }`}>
                {gpInfo.gpName} - {gpInfo.sessionType}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex flex-col items-center">
              <span className={`text-sm font-medium leading-none mb-1 ${
                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
              }`}>Laps</span>
              <span className={`text-lg font-semibold leading-none ${
                theme === 'light' ? 'text-black' : 'text-white'
              }`}>{sessionInfo.lapInfo}</span>
            </div>
            <div className={`px-4 py-2 rounded text-sm font-bold text-white ${
              sessionInfo.trackStatus?.toLowerCase().includes('red') || sessionInfo.trackStatus?.toLowerCase().includes('red flag')
                ? 'bg-red-600'
                : sessionInfo.trackStatus?.toLowerCase().includes('yellow') || sessionInfo.trackStatus?.toLowerCase().includes('yellow flag')
                  ? 'bg-yellow-600'
                  : sessionInfo.trackStatus?.toLowerCase().includes('green') || sessionInfo.trackStatus?.toLowerCase().includes('clear') || sessionInfo.trackStatus?.toLowerCase().includes('green flag')
                    ? 'bg-green-600'
                    : 'bg-gray-600'
            }`}>
              {sessionInfo.trackStatus?.toLowerCase().includes('red') || sessionInfo.trackStatus?.toLowerCase().includes('red flag')
                ? 'Red Flag'
                : sessionInfo.trackStatus?.toLowerCase().includes('yellow') || sessionInfo.trackStatus?.toLowerCase().includes('yellow flag')
                  ? 'Yellow Flag'
                  : sessionInfo.trackStatus?.toLowerCase().includes('green') || sessionInfo.trackStatus?.toLowerCase().includes('clear') || sessionInfo.trackStatus?.toLowerCase().includes('green flag')
                    ? 'Green Flag'
                    : 'No Flag'
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

SessionHeader.displayName = "SessionHeader"

export { SessionHeader }
