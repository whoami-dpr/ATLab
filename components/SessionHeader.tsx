"use client"

import { memo } from "react"
import { WeatherWidget } from "./WeatherWidget"
import type { F1SessionInfo } from "../hooks/useF1SignalR"

interface SessionHeaderProps {
  sessionInfo: F1SessionInfo
  isConnected: boolean
  isDemoMode: boolean
  error: string | null
}

const SessionHeader = memo(({ sessionInfo, isConnected, isDemoMode, error }: SessionHeaderProps) => {
  const getTrackStatusColor = () => {
    const status = sessionInfo.trackStatus.toLowerCase()
    if (status.includes("green") || status.includes("clear"))
      return "bg-gradient-to-r from-green-500 to-green-600 shadow-md shadow-green-500/25"
    if (status.includes("yellow"))
      return "bg-gradient-to-r from-yellow-500 to-yellow-600 shadow-md shadow-yellow-500/25"
    if (status.includes("red")) return "bg-gradient-to-r from-red-500 to-red-600 shadow-md shadow-red-500/25"
    return "bg-gradient-to-r from-gray-500 to-gray-600 shadow-md shadow-gray-500/25"
  }

  // Estado de conexión
  let statusColor = "bg-red-500"
  let statusText = "Offline"
  if (isDemoMode) {
    statusColor = "bg-blue-500"
    statusText = "Demo"
  } else if (isConnected && !error) {
    statusColor = "bg-green-500"
    statusText = "Online"
  }

  // Animación para el círculo de estado
  let statusCircleClass = `${statusColor} w-2 h-2 rounded-full inline-block`
  if (isDemoMode || (isConnected && !error)) {
    statusCircleClass += ' animate-pulse'
  } else {
    statusCircleClass += ' animate-ping'
  }

  return (
    <div className="border-b border-gray-800/50 bg-transparent">
      <div className="flex items-center justify-between p-3 min-h-[56px]">
        <div className="flex items-center gap-3 min-h-[48px]">
          <div className="h-full flex items-center">
            <img src="/images/F1-Logo.png" alt="F1 Logo" className="h-full w-auto max-h-[2.8rem] object-contain" />
          </div>
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-white flex items-center gap-2" style={{ fontFamily: 'Inter, Segoe UI, Arial, sans-serif', fontWeight: 'bold' }}>
                F1 Live Timing
                <span
                  className={`w-2 h-2 rounded-full inline-block ml-1 ${statusColor} ${(!isDemoMode && (!isConnected || error)) ? 'animate-blink' : ''}`}
                  title={isDemoMode ? 'Demo' : isConnected && !error ? 'Online' : 'Offline'}
                ></span>
              </h1>
            </div>
            <div className="text-2xl font-bold text-white leading-none" style={{ fontFamily: 'Inter, Segoe UI, Arial, sans-serif', fontWeight: 'bold' }}>{sessionInfo.timer}</div>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <WeatherWidget weather={sessionInfo.weather} />

          <div className="flex items-center gap-6">
            <div className="flex flex-col items-center">
              <span className="text-xs text-gray-400 font-medium leading-none mb-0.5">Laps</span>
              <span className="text-white text-lg font-semibold leading-none">{sessionInfo.lapInfo}</span>
            </div>
            <span className="text-xs text-gray-400 font-medium">{sessionInfo.trackStatus || 'No Active Session'}</span>
          </div>
        </div>
      </div>
    </div>
  )
})

SessionHeader.displayName = "SessionHeader"

export { SessionHeader }
