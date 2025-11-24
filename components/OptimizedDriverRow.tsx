"use client"

import React, { memo, useState } from "react"
import type { F1Driver } from "../hooks/useF1SignalR"
import { useThemeOptimized } from "../hooks/useThemeOptimized"

import type { ColumnId } from "../types/ColumnConfig"

interface OptimizedDriverRowProps {
  driver: F1Driver
  index: number
  gapClass?: string
  isMobile?: boolean
  drsEnabled?: boolean
  columnOrder?: ColumnId[]
  gridTemplateColumns?: string
}

export const OptimizedDriverRow = memo(function OptimizedDriverRow(props: OptimizedDriverRowProps) {
  const { driver, index, isMobile = false, drsEnabled = true, columnOrder, gridTemplateColumns: customGridTemplate } = props
  const { theme } = useThemeOptimized()
  const [isExpanded, setIsExpanded] = useState(false)
  
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

  const getSectorBars = (sector1: any[] = [], sector2: any[] = [], sector3: any[] = []) => {
    const renderBars = () => {
      const allBars: React.ReactElement[] = []
      
      // Render sector 1 bars
      sector1.forEach((segment, i) => {
        let barColor = "bg-gray-700"
        if (segment.Status >= 2048) {
          if (segment.Status === 2051) {
            barColor = "bg-purple-500"
          } else if (segment.Status === 2049) {
            barColor = "bg-green-500"
          } else if (segment.Status === 2052 || segment.Status === 2048) {
            barColor = "bg-yellow-500"
          }
        }
        allBars.push(
          <div key={`s1-${i}`} className={`w-1 h-3 rounded-sm ${barColor}`} />
        )
      })
      
      // Add spacing between sector 1 and 2
      if (sector1.length > 0 && sector2.length > 0) {
        allBars.push(<div key="gap1" className="w-1" />)
      }
      
      // Render sector 2 bars
      sector2.forEach((segment, i) => {
        let barColor = "bg-gray-700"
        if (segment.Status >= 2048) {
          if (segment.Status === 2051) {
            barColor = "bg-purple-500"
          } else if (segment.Status === 2049) {
            barColor = "bg-green-500"
          } else if (segment.Status === 2052 || segment.Status === 2048) {
            barColor = "bg-yellow-500"
          }
        }
        allBars.push(
          <div key={`s2-${i}`} className={`w-1 h-3 rounded-sm ${barColor}`} />
        )
      })
      
      // Add spacing between sector 2 and 3
      if (sector2.length > 0 && sector3.length > 0) {
        allBars.push(<div key="gap2" className="w-1" />)
      }
      
      // Render sector 3 bars
      sector3.forEach((segment, i) => {
        let barColor = "bg-gray-700"
        if (segment.Status >= 2048) {
          if (segment.Status === 2051) {
            barColor = "bg-purple-500"
          } else if (segment.Status === 2049) {
            barColor = "bg-green-500"
          } else if (segment.Status === 2052 || segment.Status === 2048) {
            barColor = "bg-yellow-500"
          }
        }
        allBars.push(
          <div key={`s3-${i}`} className={`w-1 h-3 rounded-sm ${barColor}`} />
        )
      })
      
      return allBars
    }

    return (
      <div className="flex flex-row gap-[1px] items-center">
        {renderBars()}
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
    "Williams":      { bg: "#003d82", text: "white" },
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

  // Function to get team logo path
  const getTeamLogoPath = (team: string): string => {
    const teamLogoMap: Record<string, string> = {
      "Red Bull": "red-bull-racing.svg",
      "Mercedes": "mercedes.svg",
      "Ferrari": "ferrari.svg",
      "McLaren": "mclaren.svg",
      "Aston Martin": "aston-martin.svg",
      "Alpine": "alpine.svg",
      "Williams": "williams.svg",
      "Haas": "haas-f1-team.svg",
      "Kick Sauber": "kick-sauber.svg",
      "RB": "racing-bulls.svg",
      "Racing Bulls": "racing-bulls.svg",
    };
    
    return teamLogoMap[team] || "red-bull-racing.svg"; // Default fallback
  };

  const getSectorTextColor = (color: string) => {
    // Use the same color logic as the minisectors
    if (color.includes('purple')) {
      return "text-purple-400" // Violet: best sector overall
    } else if (color.includes('green')) {
      return "text-green-400" // Green: personal best sector
    } else if (color.includes('yellow')) {
      return "text-yellow-400" // Yellow: improved but not best
    } else {
      return theme === 'light' ? 'text-black' : 'text-white' // Default: normal time
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
      return theme === 'light' ? 'text-black' : 'text-white' // Default: normal time
    }
  }

  // Function to render tyres history
  const renderTyresHistory = () => {
    if (!driver.tyresHistory || driver.tyresHistory.length === 0) {
      return <span className={`text-xs ${
        theme === 'light' ? 'text-gray-700' : 'text-gray-500'
      }`}>-</span>
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
          <span className={`text-xs ml-1 ${
            theme === 'light' ? 'text-gray-600' : 'text-gray-400'
          }`}>+{driver.tyresHistory.length - 3}</span>
        )}
      </div>
    )
  }

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="bg-transparent rounded-lg overflow-hidden shadow-lg">
        {/* Main Driver Row - Exact Design from Image */}
        <div className="flex items-center h-12 bg-black/80 rounded-lg px-1 justify-between">
          {/* Position - Large White Number */}
          <div className="flex items-center justify-center px-3 flex-shrink-0" style={{ minWidth: '60px' }}>
            <span className="text-white font-bold text-2xl">
              {driver.pos}
            </span>
          </div>
          
          {/* Team Logo - Small Dark Grey Square */}
          <div className="flex items-center justify-center px-2 bg-gray-800 rounded-l flex-shrink-0" style={{ minWidth: '50px', height: '40px' }}>
            <img
              src={`/team-logos/${getTeamLogoPath(driver.team || "Unknown")}`}
              alt={driver.team || "Unknown"}
              className="w-6 h-6 object-contain"
            />
          </div>
          
          {/* Driver Code + Number - Blue Section */}
          <div
            className="flex items-center justify-between px-3 py-2 rounded-r flex-shrink-0"
            style={{
              background: getTeamBg(driver.team || "Unknown"),
              height: '40px',
              width: '110px'
            }}
          >
            <span 
              className="text-white font-normal text-lg"
              style={{
                fontFamily: 'Formula1 Display Regular, Arial, sans-serif'
              }}
            >
              {driver.name}
            </span>
            <span 
              className="text-white font-bold text-lg"
              style={{
                fontFamily: 'Formula1 Display Regular, Arial, sans-serif'
              }}
            >
              {driver.racingNumber || driver.pos}
            </span>
          </div>

          {/* DRS/PIT Status - Dynamic Styling Based on State */}
          {(() => {
            // Determine DRS status based on real API data
            let drsStatus = 'off';
            let buttonClass = '';
            let textClass = '';
            
            if (driver.inPit) {
              drsStatus = 'pit';
              buttonClass = 'bg-transparent border-2 border-blue-600';
              textClass = 'text-blue-400';
            } else if (driver.drs) {
              drsStatus = 'active';
              buttonClass = 'bg-transparent border-2 border-green-600';
              textClass = 'text-green-400';
            } else if (drsEnabled && (driver.drsEligible || driver.drsZone)) {
              drsStatus = 'possible';
              buttonClass = 'bg-transparent border-2 border-gray-400';
              textClass = 'text-gray-300';
            } else {
              drsStatus = 'off';
              buttonClass = 'bg-transparent border-2 border-gray-600';
              textClass = 'text-gray-500';
            }
            
            return (
              <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                {/* DRS Button */}
                <div 
                  className={`flex items-center justify-center px-3 py-2 rounded-xl ${buttonClass}`} 
                  style={{ width: '60px', height: '40px' }}
                >
                  <span className={`font-bold text-sm ${textClass}`}>
                    {driver.inPit ? "PIT" : "DRS"}
                  </span>
                </div>
                
                {/* Tyres - Usando imágenes SVG */}
                <div className="flex items-center justify-center bg-transparent rounded-full" style={{ width: '40px', height: '40px' }}>
                  {(() => {
                    // Debug logging
                    console.log(`🏎️ Driver ${driver.name} tire data:`, {
                      tire: driver.tire,
                      tireType: typeof driver.tire,
                      imageSrc: `/images/${driver.tire?.toLowerCase() || 'unknown'}.svg`
                    });
                    
                    return (
                      <img
                        src={`/images/${driver.tire?.toLowerCase() || 'unknown'}.svg`}
                        alt={driver.tire || "Unknown"}
                        className="w-6 h-6 object-contain"
                        onError={(e) => {
                          console.log(`🏎️ Error loading tire image for driver ${driver.name}:`, {
                            tire: driver.tire,
                            imageSrc: `/images/${driver.tire?.toLowerCase() || 'unknown'}.svg`
                          });
                          // Fallback to unknown image
                          e.currentTarget.src = '/images/unknown.svg';
                        }}
                      />
                    );
                  })()}
                </div>
              </div>
            );
          })()}

          {/* Expand Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="ml-1 p-2 text-gray-300 hover:text-white transition-colors duration-200 flex-shrink-0"
          >
            <svg 
              className={`w-5 h-5 transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Expanded Content - Only visible when expanded */}
        {isExpanded && (
          <div className="bg-black/80 p-4 space-y-4">
            {/* Top Section - Lap Information */}
            <div className="flex justify-between items-start">
              {/* Left Side - Lap Info */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">S</span>
                </div>
                <div>
                  <div className="text-white text-base font-bold">L {driver.stint || 51}</div>
                  <div className="text-white text-base">PIT {driver.pitStops ?? 1}</div>
                </div>
              </div>

              {/* Right Side - Lap Time */}
              <div>
                <div className="text-white text-base">Lap Time</div>
                <div className="text-white text-xl font-bold">
                  {formatLapTime(driver.lapTime) || '1:44.556'}
                </div>
              </div>
            </div>

            {/* Middle Section - Gap and Positions */}
            <div className="flex justify-between items-start">
              {/* Left Side - Gap */}
              <div>
                <div className="text-white text-base">Gap</div>
                <div className="text-white text-base font-bold">
                  {driver.gap === 'LEADER' ? '---' : driver.gap || '---'}
                </div>
              </div>

              {/* Right Side - Positions */}
              <div>
                <div className="text-white text-base">Positions</div>
                <div className="text-white text-base">-</div>
              </div>
            </div>

            {/* Lower-Middle Section - Sectors */}
            <div>
              <div className="text-white text-base mb-3">Sectors</div>
              <div className="space-y-2">
                {/* Sector 1 */}
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div key={i} className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    ))}
                  </div>
                  <div className="text-white text-base font-bold">
                    {formatSectorTime(driver.sector1) || '36.853'}
                  </div>
                </div>

                {/* Sector 2 */}
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div key={i} className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    ))}
                  </div>
                  <div className="text-white text-base font-bold">
                    {formatSectorTime(driver.sector2) || '42.306'}
                  </div>
                </div>

                {/* Sector 3 */}
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div key={i} className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    ))}
                  </div>
                  <div className="text-white text-base font-bold">
                    {formatSectorTime(driver.sector3) || '25.397'}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Section - Tyres History */}
            <div>
              <div className="text-white text-base">Tyres History</div>
              <div className="text-white text-base">-</div>
            </div>
          </div>
        )}

      </div>
    )
  }

  // Render individual cell based on column ID
  const renderCell = (columnId: ColumnId) => {
    switch (columnId) {
      case 'driver':
        return (
          <div key="driver" className="flex items-center h-6 pl-1">
            <div className="flex items-center h-5 w-full rounded overflow-hidden">
              <div
                style={{
                  background: getTeamBg(driver.team || "Unknown"),
                  color: getTeamText(driver.team || "Unknown"),
                  width: '20px',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8rem',
                  fontWeight: 'bold'
                }}
              >
                {driver.pos}
              </div>
              <div className="bg-white flex items-center justify-center w-6 h-full px-0.5">
                <img
                  src={`/team-logos/${getTeamLogoPath(driver.team || "Unknown")}`}
                  alt={driver.team || "Unknown"}
                  className="h-3.5 w-auto object-contain"
                />
              </div>
              <div
                style={{
                  background: getTeamBg(driver.team || "Unknown"),
                  color: getTeamText(driver.team || "Unknown"),
                  flex: 1,
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0 4px',
                  fontSize: '0.75rem',
                  fontWeight: 'bold'
                }}
              >
                <span className="font-normal">{driver.code}</span>
                <span className="opacity-90">{driver.racingNumber}</span>
              </div>
            </div>
          </div>
        )
      
      case 'leader':
        return (
          <div key="leader" className="flex items-center justify-center text-white text-xs font-bold">
            {driver.pos === 1 ? 'Leader' : driver.gap || '+0.000'}
          </div>
        )
      
      case 'tyre':
        return (
          <div key="tyre" className="flex items-center justify-center gap-1">
            <span className="text-white text-[10px]">{driver.stint}</span>
            <div className="w-4 h-4 flex items-center justify-center rounded-full border border-gray-600 bg-[#1a1a1a]">
              <span className={`text-[9px] font-bold ${
                driver.tire === 'S' ? 'text-red-500' :
                driver.tire === 'M' ? 'text-yellow-400' :
                driver.tire === 'H' ? 'text-gray-300' :
                driver.tire === 'I' ? 'text-green-400' :
                driver.tire === 'W' ? 'text-blue-400' : 'text-gray-500'
              }`}>
                {driver.tire}
              </span>
            </div>
          </div>
        )
      
      case 'bestLap':
        return (
          <div key="bestLap" className={`flex items-center justify-center text-xs font-bold ${
            driver.isFastestLap ? 'text-purple-400' : 
            driver.isPersonalBest ? 'text-green-400' : 'text-white'
          }`}>
            {formatLapTime(driver.bestLapTime || driver.prevLap)}
          </div>
        )
      
      case 'interval':
        return (
          <div key="interval" className={`flex items-center justify-center text-xs font-bold ${
            driver.pos === 1 ? 'text-gray-500' : 'text-green-400'
          }`}>
            {driver.pos === 1 ? 'Interval' : driver.interval || '+0.000'}
          </div>
        )
      
      case 'lastLap':
        return (
          <div key="lastLap" className={`flex items-center justify-center text-xs font-bold ${
            driver.isFastestLap ? 'text-purple-400' : 
            driver.isPersonalBest ? 'text-green-400' : 'text-white'
          }`}>
            {formatLapTime(driver.lapTime)}
          </div>
        )
      
      case 'miniSectors':
        return (
          <div key="miniSectors" className="flex items-center justify-center px-1">
            {getSectorBars(
              driver.sector1Segments || [], 
              driver.sector2Segments || [], 
              driver.sector3Segments || []
            )}
          </div>
        )
      
      case 'lastSectors':
        return (
          <div key="lastSectors" className="flex items-center justify-center gap-1.5 text-[10px] font-bold">
            <span className={`${getSectorTextColor(driver.sector1Color)}`}>{formatSectorTime(driver.sector1)}</span>
            <span className={`${getSectorTextColor(driver.sector2Color)}`}>{formatSectorTime(driver.sector2)}</span>
            <span className={`${getSectorTextColor(driver.sector3Color)}`}>{formatSectorTime(driver.sector3)}</span>
          </div>
        )
      
      case 'pitIndicator':
        return (
          <div key="pitIndicator" className="flex items-center justify-center">
            {driver.inPit && (
              <div className="bg-[#b12074] text-white text-[9px] px-1 rounded-sm font-bold leading-none py-0.5">
                PIT
              </div>
            )}
          </div>
        )
      
      case 'pitCount':
        return (
          <div key="pitCount" className="flex items-center justify-center text-white text-[10px] font-bold gap-0.5">
            <span>{driver.pitCount}</span>
            <span className="text-gray-400 text-[8px]">PIT</span>
          </div>
        )
      
      case 'topSpeed':
        return (
          <div key="topSpeed" className={`flex items-center justify-center text-xs font-bold ${
            driver.topSpeed && parseFloat(driver.topSpeed) > 340 ? 'text-purple-400' : 'text-white'
          }`}>
            {driver.topSpeed || '---'}
          </div>
        )
      
      default:
        return null
    }
  }

  // Desktop Layout
  const defaultColumnOrder: ColumnId[] = ['driver', 'leader', 'tyre', 'bestLap', 'interval', 'lastLap', 'miniSectors', 'lastSectors', 'pitIndicator', 'pitCount', 'topSpeed']
  const orderedColumns = columnOrder || defaultColumnOrder
  const defaultGridTemplate = 'minmax(100px, 0.8fr) minmax(60px, 0.8fr) minmax(40px, 0.5fr) minmax(60px, 0.8fr) minmax(60px, 0.8fr) minmax(60px, 0.8fr) minmax(90px, 1.2fr) minmax(140px, 1.8fr) minmax(35px, 0.4fr) minmax(35px, 0.4fr) minmax(45px, 0.5fr)'

  return (
    <div
      className={`px-1 py-[1px] transition-all duration-200 font-bold flex items-center border-b border-gray-800/50 ${
        driver.isFastestLap 
          ? 'bg-[#1a1a2e]' 
          : 'hover:bg-[#1f1f2e] bg-[#15151e]'
      }`}
      style={{
        display: 'grid',
        gridTemplateColumns: customGridTemplate || defaultGridTemplate,
        gap: '2px',
        fontFamily: 'Formula1 Display Regular, Arial, sans-serif',
        fontSize: '0.75rem'
      }}
    >
      {orderedColumns.map(columnId => renderCell(columnId))}
    </div>
  )
})

OptimizedDriverRow.displayName = "OptimizedDriverRow"
