"use client"

import React, { memo } from "react"
import type { F1Driver } from "../hooks/useF1SignalR"

interface OptimizedDriverRowProps {
  driver: F1Driver
  index: number
  gapClass?: string
}

export const OptimizedDriverRow = memo(function OptimizedDriverRow(props: OptimizedDriverRowProps) {
  const { driver, index } = props
  
  // Log the driver data to see what team is being received
  console.log(`🎨 OptimizedDriverRow received driver:`, {
    'name': driver.name,
    'team': driver.team,
    'pos': driver.pos,
    'inPit': driver.inPit,
    'retired': driver.retired
  })

  // Function to format lap times properly
  const formatLapTime = (time: string): string => {
    if (!time || time === "0.000" || time === "0") return "--:--.---"
    
    // If it's already in the correct format (MM:SS.mmm), return as is
    if (time.includes(':') && time.includes('.')) {
      return time
    }
    
    // If it's just a number (seconds), convert to MM:SS.mmm format
    const numTime = parseFloat(time)
    if (!isNaN(numTime)) {
      const minutes = Math.floor(numTime / 60)
      const seconds = numTime % 60
      return `${minutes}:${seconds.toFixed(3).padStart(6, '0')}`
    }
    
    return time
  }

  // Function to format sector times properly
  const formatSectorTime = (time: string): string => {
    if (!time || time === "0.000" || time === "0") return "--.---"
    
    // If it's already in the correct format (SS.mmm), return as is
    if (time.includes('.') && !time.includes(':')) {
      return time
    }
    
    // If it's just a number (seconds), format as SS.mmm
    const numTime = parseFloat(time)
    if (!isNaN(numTime)) {
      return numTime.toFixed(3)
    }
    
    return time
  }

  const getTireColor = (tire: string) => {
    switch (tire.toUpperCase()) {
      case "S":
      case "SOFT":
        return "bg-gradient-to-br from-red-500 to-red-600 text-white shadow-md shadow-red-500/20"
      case "M":
      case "MEDIUM":
        return "bg-gradient-to-br from-yellow-400 to-yellow-500 text-black shadow-md shadow-yellow-500/20"
      case "H":
      case "HARD":
        return "bg-gradient-to-br from-gray-100 to-gray-200 text-black shadow-md shadow-gray-500/20"
      case "I":
      case "INTERMEDIATE":
        return "bg-gradient-to-br from-green-500 to-green-600 text-white shadow-md shadow-green-500/20"
      case "W":
      case "WET":
        return "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md shadow-blue-500/20"
      default:
        return "bg-gradient-to-br from-gray-500 to-gray-600 text-white shadow-md shadow-gray-500/20"
    }
  }

  const getSectorBars = (segments: Array<{ Status: number; PersonalFastest?: boolean; OverallFastest?: boolean }> = [], sectorPersonalFastest: boolean = false, sectorOverallFastest: boolean = false) => {
    console.log(`🎨 getSectorBars called with:`, {
      segmentsCount: segments.length,
      sectorPersonalFastest,
      sectorOverallFastest,
      segments: segments.map(s => ({ 
        Status: s.Status, 
        PersonalFastest: s.PersonalFastest, 
        OverallFastest: s.OverallFastest,
        // Log all properties of each segment
        allProperties: Object.keys(s),
        fullSegment: s
      }))
    })

    // If no real segment data, show gray bars
    if (!segments || segments.length === 0) {
      return (
        <div className="flex gap-0.5 mb-0.5">
          {Array(8).fill(0).map((_, i) => (
            <div key={i} className="w-2.5 h-1.5 rounded bg-gray-700" />
          ))}
        </div>
      )
    }

    return (
      <div className="flex gap-0.5 mb-0.5">
        {segments.map((segment, i) => {
          let barColor = "bg-gray-700" // Default: not passed through
          let glowColor = ""

          // Check if the segment was passed through
          if (segment.Status >= 2048) { // Segment completed
            if (segment.Status === 2051) {
              // Violet: Overall Fastest Minisector
              barColor = "bg-gradient-to-r from-purple-400 to-purple-500"
              glowColor = "shadow-purple-400/20"
            } else if (segment.Status === 2052) {
              // Orange: Personal Best / Improved Minisector
              barColor = "bg-gradient-to-r from-orange-400 to-orange-500"
              glowColor = "shadow-orange-400/20"
            } else if (segment.Status === 2049) {
              // Green: Good / Personal Best Minisector
              barColor = "bg-gradient-to-r from-green-400 to-green-500"
              glowColor = "shadow-green-400/20"
            } else if (segment.Status === 2048) {
              // Yellow: Completed normally
              barColor = "bg-gradient-to-r from-yellow-400 to-yellow-500"
              glowColor = "shadow-yellow-400/20"
            } else {
              // Default for other completed statuses if not specifically mapped
              barColor = "bg-gradient-to-r from-white-400 to-white-500"
              glowColor = "shadow-white-400/20"
            }
          }
          // If segment.Status is 0 or < 2048, it remains gray (default)

          return (
            <div
              key={i}
              className={`w-2.5 h-1.5 rounded transition-all duration-200 ${
                segment.Status >= 2048 ? `${barColor} shadow-sm ${glowColor}` : "bg-gray-700"
              }`}
            />
          )
        })}
      </div>
    )
  }

  // Mapping of team to official color and text color
  const TEAM_COLORS: Record<string, { bg: string; text: string }> = {
    "Red Bull":      { bg: "#1e41ff", text: "white" },
    "Mercedes":      { bg: "#00d2be", text: "white" },
    "Ferrari":       { bg: "#dc0000", text: "white" },
    "McLaren":       { bg: "#ff8700", text: "white" },
    "Aston Martin":  { bg: "#229971", text: "white" },
    "Alpine":        { bg: "#2293d1", text: "white" },
    "Williams":      { bg: "#37bedd", text: "white" },
    "Haas":          { bg: "#b6babd", text: "white" },
    "Kick Sauber":   { bg: "#52e252", text: "white" },
    "RB":            { bg: "#6692ff", text: "white" }, // Racing Bulls
    // Default colors for unknown teams
    "Unknown":       { bg: "#666666", text: "white" },
    "F1":            { bg: "#666666", text: "white" },
    // Other teams if any
  };

  const getTeamBg = (team: string) => {
    const color = TEAM_COLORS[team]?.bg || '#666666';
    console.log(`🎨 Team color for "${team}":`, color);
    return color;
  };
  const getTeamText = (team: string) => TEAM_COLORS[team]?.text || 'white';

  const getSectorTextColor = (color: string) => {
    // Use the same color logic as the minisectors
    if (color.includes('purple')) {
      return "text-purple-400" // Violet: best sector overall
    } else if (color.includes('green')) {
      return "text-green-400" // Green: personal best sector
    } else if (color.includes('yellow')) {
      return "text-yellow-400" // Yellow: improved but not best
    } else {
      return "text-white" // Default: normal time
    }
  }

  const getLapTimeColor = (lapTimeColor: string, isFastestLap: boolean) => {
    // Use the same color logic as the minisectors for lap times
    if (isFastestLap) {
      return "text-purple-400" // Violet: fastest lap overall
    } else if (lapTimeColor.includes('purple')) {
      return "text-purple-400" // Violet: best lap overall
    } else if (lapTimeColor.includes('green')) {
      return "text-green-400" // Green: personal best lap
    } else if (lapTimeColor.includes('yellow')) {
      return "text-yellow-400" // Yellow: improved but not best
    } else {
      return "text-white" // Default: normal time
    }
  }

  // Function to render tyres history
  const renderTyresHistory = () => {
    if (!driver.tyresHistory || driver.tyresHistory.length === 0) {
      return <span className="text-gray-500 text-xs">-</span>
    }
    
    return (
      <div className="flex flex-wrap gap-1 max-w-full overflow-hidden">
        {driver.tyresHistory.slice(0, 3).map((tire, index) => {
          const tireType = tire.toUpperCase()
          return (
            <img
              key={index}
              src={
                tireType === 'S' || tireType === 'SOFT' ? '/images/soft.svg'
                : tireType === 'M' || tireType === 'MEDIUM' ? '/images/medium.svg'
                : tireType === 'H' || tireType === 'HARD' ? '/images/hard.svg'
                : tireType === 'I' || tireType === 'INTERMEDIATE' ? '/images/intermediate.svg'
                : tireType === 'W' || tireType === 'WET' ? '/images/wet.svg'
                : '/images/soft.svg'
              }
              alt={tire}
              className="w-6 h-6 opacity-90 flex-shrink-0"
              title={`Stint ${index + 1}: ${tire}`}
            />
          )
        })}
        {driver.tyresHistory.length > 3 && (
          <span className="text-xs text-gray-400 ml-1">+{driver.tyresHistory.length - 3}</span>
        )}
      </div>
    )
  }

        return (
          <div
            className={`grid grid-cols-12 gap-0.5 px-1 py-0.5 transition-all duration-200 font-inter font-bold ${
              driver.isFastestLap 
                ? 'bg-gradient-to-r from-purple-900/30 to-purple-800/30' 
                : 'hover:bg-gradient-to-r hover:from-gray-800/20 hover:to-gray-900/20'
            }`}
          >
      {/* Position & Driver - Team background, fixed size */}
      <div className="col-span-1 flex items-center gap-0">
        <div
          className="flex items-center justify-center"
          style={{
            background: getTeamBg(driver.team || "Unknown"),
            borderRadius: '0.5rem',
            height: '32px',
            width: '90px', // Ancho fijo para todos
            minWidth: '90px',
            maxWidth: '90px',
            overflow: 'hidden',
            padding: 0,
          }}
        >
          {/* Position number, white text */}
          <div
            style={{
              color: getTeamText(driver.team || "Unknown"),
              fontWeight: 700,
              fontSize: '1.1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '32px',
              minWidth: '28px',
              paddingLeft: '8px',
              paddingRight: '4px',
              margin: 0,
              whiteSpace: 'nowrap',
            }}
          >
            {driver.pos}
          </div>
          {/* Nombre del piloto, fondo escudería, texto blanco */}
          <div
            style={{
              color: getTeamText(driver.team || "Unknown"),
              background: getTeamBg(driver.team || "Unknown"),
              fontWeight: 700,
              fontSize: '1.1rem',
              letterSpacing: '0.03em',
              borderRadius: 0,
              borderTopRightRadius: '0.5rem',
              borderBottomRightRadius: '0.5rem',
              padding: '0 10px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: 0,
              whiteSpace: 'nowrap',
            }}
          >
            {driver.name}
          </div>
        </div>
      </div>

      {/* DRS/PIT - Más pequeño */}
      <div className="col-span-1 flex items-center">
        <div
          className={`px-3 py-0.5 rounded border-2 transition-all duration-200 ${
            driver.inPit
              ? "bg-slate-600 text-blue-300 border-blue-300 shadow-md shadow-blue-300/20"
              : driver.drs
                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-400/30 shadow-md shadow-blue-500/20"
                : "bg-gradient-to-r from-gray-800 to-gray-900 text-gray-500 border-gray-700/30"
          }`}
          style={{ borderRadius: '0.25rem' }}
        >
          {driver.inPit ? "PIT" : "DRS"}
        </div>
      </div>

      {/* Tire - Más compacto */}
      <div className="col-span-1 flex items-center gap-1">
        <img
          src={
            driver.tire === 'S' ? '/images/soft.svg'
            : driver.tire === 'M' ? '/images/medium.svg'
            : driver.tire === 'H' ? '/images/hard.svg'
            : driver.tire === 'I' ? '/images/intermediate.svg'
            : '/images/soft.svg'
          }
          alt={driver.tire}
          className="w-8 h-8"
        />
        <div className="flex flex-col leading-tight">
          <span className="font-bold text-base text-white">{driver.stint}</span>
          <span className="text-xs text-gray-400" style={{ fontFamily: 'Inter, sans-serif' }}>PIT {driver.pitStops ?? 0}</span>
        </div>
      </div>

      {/* Tyres History */}
      <div className="col-span-1 flex items-center">
        {renderTyresHistory()}
      </div>

      {/* Info - Posiciones ganadas y estado del piloto */}
      <div className="col-span-1 flex flex-col items-start justify-center">
        <span className="text-xs text-gray-500 leading-none">
          {driver.positionsGained === undefined || driver.positionsGained === 0
            ? '-'
            : driver.positionsGained > 0
              ? `+${driver.positionsGained}`
              : driver.positionsGained}
        </span>
        <span className={
          driver.retired
            ? 'text-red-400 font-bold text-base'
            : driver.inPit
              ? 'text-blue-400 font-bold text-base'
              : 'text-green-400 font-bold text-base'
        }>
          {driver.retired ? 'OUT' : driver.inPit ? 'PIT' : 'RACING'}
        </span>
      </div>

      {/* Gap - Fuente mejorada */}
      <div className="col-span-1 flex flex-col justify-center text-xs font-bold text-base">
        <div
          className={`font-bold ${driver.gap === 'LEADER' ? 'text-gray-500' : 'text-white'}`}
          style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.15rem' }}
        >
          {driver.gap === 'LEADER' ? '--- ---' : driver.gap}
        </div>
        <div className="text-gray-500 text-sm font-normal" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>{driver.gapTime}</div>
      </div>

      {/* Lap Time - Nueva fuente Inter */}
      <div className="col-span-1 flex flex-col justify-center text-xs font-bold text-lg">
        <div
          className={`font-bold ${getLapTimeColor(driver.lapTimeColor, driver.isFastestLap)}`}
          style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.15rem' }}
        >
          {formatLapTime(driver.lapTime)}
        </div>
        <div
          className={`text-sm ${
            driver.isFastestLap
              ? 'text-purple-400'
              : driver.lapTimeColor.includes('purple')
                ? 'text-purple-400'
                : driver.lapTimeColor.includes('green')
                  ? 'text-green-400'
                  : 'text-gray-500'
          } font-normal`}
          style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}
        >
          {formatLapTime(driver.prevLap)}
        </div>
      </div>

      {/* Sectors - Más compactos */}
      <div className="col-span-5 grid grid-cols-3 gap-2">
        {/* Sector 1 */}
        <div className="flex flex-col bg-gray-900/20 rounded-md p-1.5 border border-gray-800/30 text-base font-inter">
          {getSectorBars(driver.sector1Segments, driver.sector1Color.includes('green'), driver.sector1Color.includes('purple'))}
          <div className="flex items-baseline gap-2">
            <span className={`font-semibold text-xl ${getSectorTextColor(driver.sector1Color)}`}>{formatSectorTime(driver.sector1)}</span>
            <span className="text-sm text-gray-500 font-normal">{formatSectorTime(driver.sector1Prev)}</span>
          </div>
        </div>

        {/* Sector 2 */}
        <div className="flex flex-col bg-gray-900/20 rounded-md p-1.5 border border-gray-800/30 text-base font-inter">
          {getSectorBars(driver.sector2Segments, driver.sector2Color.includes('green'), driver.sector2Color.includes('purple'))}
          <div className="flex items-baseline gap-2">
            <span className={`font-semibold text-xl ${getSectorTextColor(driver.sector2Color)}`}>{formatSectorTime(driver.sector2)}</span>
            <span className="text-sm text-gray-500 font-normal">{formatSectorTime(driver.sector2Prev)}</span>
          </div>
        </div>

        {/* Sector 3 */}
        <div className="flex flex-col bg-gray-900/20 rounded-md p-1.5 border border-gray-800/30 text-base font-inter">
          {getSectorBars(driver.sector3Segments, driver.sector3Color.includes('green'), driver.sector3Color.includes('purple'))}
          <div className="flex items-baseline gap-2">
            <span className={`font-semibold text-xl ${getSectorTextColor(driver.sector3Color)}`}>{formatSectorTime(driver.sector3)}</span>
            <span className="text-sm text-gray-500 font-normal">{formatSectorTime(driver.sector3Prev)}</span>
          </div>
        </div>
      </div>
    </div>
  )
})

OptimizedDriverRow.displayName = "OptimizedDriverRow"
