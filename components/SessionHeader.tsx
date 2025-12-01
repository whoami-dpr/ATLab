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
  fastestLap?: {
    time: string
    driver: string | null
    driverCode: string | null
    team: string | null
    racingNumber: string | null
  }
  inferredPhase?: string | null
  drivers?: any[]
}

const SessionHeader = memo(({ sessionInfo, isConnected, error, hasActiveSession, fastestLap, inferredPhase, drivers = [] }: SessionHeaderProps) => {
  const { schedule } = useSchedule()
  const { theme } = useThemeOptimized()
  
  // Obtener información del GP actual del schedule
  const getCurrentGPInfo = () => {
    if (!schedule || schedule.length === 0) {
      return {
        gpName: 'Loading...',
        country: null,
        sessionType: 'Loading...'
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
        shortGPName = `${match[1]} GP`
      } else {
        // Si no encuentra el patrón, usar solo el país del schedule
        shortGPName = `${currentGP.country} GP`
      }
    }

    return {
      gpName: shortGPName,
      country: currentGP.country,
      sessionType: sessionType
    }
  }

  const gpInfo = getCurrentGPInfo()

  const getCountryFlag = (country: string | null) => {
    if (!country) {
      return (
        <div className={`w-9 h-6 rounded-lg ${theme === 'light' ? 'bg-gray-200' : 'bg-white/10'} animate-pulse`} />
      )
    }
    
    // Mapeo de países a códigos de bandera (usando el mismo del schedule)
    const countryNameToCode: Record<string, string> = {
      Australia: 'aus',
      Austria: 'aut',
      Azerbaijan: 'aze',
      Belgium: 'bel',
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
      Monaco: 'mon',
      Netherlands: 'ned',
      Qatar: 'qat',
      SaudiArabia: 'ksa',
      Singapore: 'sgp',
      USA: 'usa',
      UnitedStates: 'usa',
      Miami: 'usa',
      LasVegas: 'usa',
      AbuDhabi: 'uae',
      UnitedArabEmirates: 'uae',
    }

    const code = countryNameToCode[country.replace(/\s/g, '')] || 'aze'
    const flagUrl = `/country-flags/${code.toLowerCase()}.svg`

    return (
      <div className="w-9 h-6 rounded-lg overflow-hidden flex items-center justify-center shadow-sm opacity-90">
        <img 
          src={flagUrl} 
          alt={`${country} flag`}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none'
            e.currentTarget.parentElement!.style.backgroundColor = '#ccc'
          }}
        />
      </div>
    )
  }

  // Estado de conexión
  const isOnline = isConnected && !error
  const statusColor = isOnline ? "bg-emerald-500" : "bg-rose-500"

  // Status Badge Logic - "Broadcast" Style (Solid & Bold)
  const getStatusBadge = () => {
    const status = sessionInfo.trackStatus?.toLowerCase() || ""
    let bgClass = "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
    let label = "TRACK CLEAR"
    
    if (status.includes('red')) {
      bgClass = "bg-[#ef4444] text-white shadow-lg shadow-red-500/20" // Red 500
      label = "RED FLAG"
    } else if (status.includes('yellow')) {
      bgClass = "bg-[#eab308] text-black shadow-lg shadow-yellow-500/20" // Yellow 500
      label = "YELLOW FLAG"
    } else if (status.includes('green') || status.includes('clear')) {
      bgClass = "bg-[#10b981] text-white shadow-lg shadow-emerald-500/20" // Emerald 500
      label = "TRACK CLEAR"
    } else if (status.includes('sc') || status.includes('safety')) {
       bgClass = "bg-[#f97316] text-black shadow-lg shadow-orange-500/20" // Orange 500
       label = "SAFETY CAR"
    } else if (status.includes('vsc')) {
       bgClass = "bg-[#f97316] text-black shadow-lg shadow-orange-500/20" // Orange 500
       label = "VIRTUAL SC"
    }

    return (
      <div className={`px-4 py-1.5 rounded-xl text-sm font-black uppercase tracking-wider flex items-center gap-2 transition-all duration-300 ${bgClass}`} style={{ fontFamily: 'Inter, sans-serif' }}>
        {label}
      </div>
    )
  }

  // Vertical Divider Component
  const Divider = () => (
    <div className={`h-8 w-px ${theme === 'light' ? 'bg-gray-300' : 'bg-white/10'}`}></div>
  )

  return (
    <div className={`w-full backdrop-blur-xl transition-colors duration-300 border-b z-50 relative ${
      theme === 'light' 
        ? 'bg-white/90 border-gray-200/60' 
        : 'bg-[#0a0a0a]/90 border-white/5'
    }`}>
      
      {/* Desktop Layout - Hybrid: Structured Left + Centered Timer */}
      <div className="hidden xl:flex flex-col w-full">
        {/* Top Row: Main Info & Timer */}
        <div className="flex items-center justify-between h-16 px-6 max-w-[1920px] mx-auto relative w-full">
          
          {/* Left: Structured Info Bar (Logo | GP | Weather) */}
          <div className="flex items-center gap-6 justify-start z-10">
            {/* Logo & Status */}
            <div className="flex items-center gap-3">
              <img src="/images/F1-Logo.png" alt="F1" className="h-8 w-auto opacity-90" />
              <div className={`w-3 h-3 rounded-full transition-colors duration-500 ${statusColor} ${!isOnline ? 'animate-pulse' : ''}`} />
            </div>
            
            <Divider />

            {/* GP Info */}
            <div className="flex items-center gap-3">
               {getCountryFlag(gpInfo.country)}
               <div className="flex flex-col justify-center" style={{ fontFamily: 'Inter, sans-serif' }}>
                  <span className={`text-base font-black tracking-tight uppercase leading-none ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                    {gpInfo.gpName}
                  </span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 ${theme === 'light' ? 'text-gray-500' : 'text-gray-500'}`}>
                     {inferredPhase ? `${gpInfo.sessionType} • ${inferredPhase}` : gpInfo.sessionType}
                  </span>
               </div>
            </div>

            <Divider />

            {/* Weather */}
            <div className="opacity-90 hover:opacity-100 transition-opacity">
               <WeatherWidget weather={sessionInfo.weather} />
            </div>
          </div>

          {/* Center: The Action (Timer & Laps) - Responsive Positioning */}
          <div className="flex flex-col items-center justify-center z-20 pointer-events-none 2xl:absolute 2xl:left-1/2 2xl:top-1/2 2xl:transform 2xl:-translate-x-1/2 2xl:-translate-y-1/2">
             <div className={`text-3xl font-bold tabular-nums tracking-tight leading-none ${theme === 'light' ? 'text-gray-900' : 'text-white'}`} style={{ fontVariantNumeric: 'tabular-nums' }}>
                {sessionInfo.timer}
             </div>
             <div className={`text-[11px] font-medium uppercase tracking-widest mt-1 ${theme === 'light' ? 'text-gray-500' : 'text-gray-500'}`}>
                Lap <span className={theme === 'light' ? 'text-gray-900' : 'text-white'}>{sessionInfo.lapInfo}</span>
             </div>
          </div>

          {/* Right: Status (Flags & Fastest Lap) */}
          <div className="flex items-center gap-4 justify-end z-10">
            {fastestLap && (
              <div className="origin-right">
                 <FastestLapBanner fastestLap={fastestLap} theme={theme} />
              </div>
            )}
            {getStatusBadge()}
          </div>
        </div>

        {/* Bottom Row: Driver Ticker */}
        <div className="w-full h-6 bg-black/5 dark:bg-white/5 border-t border-black/5 dark:border-white/5 flex items-center overflow-hidden relative">
          <div className="whitespace-nowrap animate-marquee flex gap-8 text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400" style={{ fontFamily: 'Formula1 Display, sans-serif' }}>
            {[...drivers, ...drivers].map((driver, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <span className={`text-[10px] ${theme === 'light' ? 'text-gray-400' : 'text-gray-600'}`}>{driver.pos}</span>
                <span className={theme === 'light' ? 'text-gray-800' : 'text-gray-200'}>{driver.code}</span>
                {driver.gap && <span className="text-[9px] opacity-60">{driver.gap}</span>}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Layout - Stacked & Clean (Unchanged from Iteration 2) */}
      <div className="xl:hidden flex flex-col p-4 gap-4">
        {/* Top: Logo & Status */}
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-2">
              <img src="/images/F1-Logo.png" alt="F1" className="h-6 w-auto opacity-90" />
              <div className={`w-3 h-3 rounded-full ${statusColor}`} />
           </div>
           {getStatusBadge()}
        </div>

        {/* Center: BIG Timer */}
        <div className="flex flex-col items-center py-2">
           <div className={`text-4xl font-bold tabular-nums tracking-tighter ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
              {sessionInfo.timer}
           </div>
           <div className={`text-xs font-medium uppercase tracking-widest mt-1 ${theme === 'light' ? 'text-gray-500' : 'text-gray-500'}`}>
              Lap <span className={theme === 'light' ? 'text-gray-900' : 'text-white'}>{sessionInfo.lapInfo}</span>
           </div>
        </div>

        {/* Bottom: Info Scroll */}
        <div className={`flex items-center justify-between pt-3 border-t ${theme === 'light' ? 'border-gray-100' : 'border-white/5'}`}>
           <div className="flex items-center gap-3">
              {getCountryFlag(gpInfo.country)}
              <div className="flex flex-col">
                 <span className={`text-xs font-bold ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                    {gpInfo.gpName}
                 </span>
                 <span className={`text-[10px] ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
                    {inferredPhase ? `${gpInfo.sessionType} • ${inferredPhase}` : gpInfo.sessionType}
                 </span>
              </div>
           </div>
           
           <div className="flex items-center gap-3">
              <div className="scale-90">
                 <WeatherWidget weather={sessionInfo.weather} />
              </div>
           </div>
        </div>
        
        {fastestLap && (
           <div className="mt-1">
              <FastestLapBanner fastestLap={fastestLap} theme={theme} />
           </div>
        )}
      </div>
    </div>
  )
})

SessionHeader.displayName = "SessionHeader"

export { SessionHeader }

if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes marquee {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
    .animate-marquee {
      animation: marquee 120s linear infinite;
    }
  `;
  document.head.appendChild(style);
}
