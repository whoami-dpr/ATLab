"use client"

import { memo } from "react"

interface DebugPanelProps {
  isConnected: boolean
  hasActiveSession: boolean
  driversCount: number
  trackStatus: string
  error: string | null
  isDemoMode: boolean
  onReconnect?: () => void
}

const DebugPanel = memo(({ 
  isConnected, 
  hasActiveSession, 
  driversCount, 
  trackStatus, 
  error, 
  isDemoMode,
  onReconnect
}: DebugPanelProps) => {
  if (process.env.NODE_ENV === 'production') return null

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs font-mono max-w-sm z-50">
      <div className="font-bold mb-2">Debug Info</div>
      <div>Connected: {isConnected ? '✅' : '❌'}</div>
      <div>Active Session: {hasActiveSession ? '✅' : '❌'}</div>
      <div>Drivers: {driversCount}</div>
      <div>Track Status: {trackStatus}</div>
      <div>Demo Mode: {isDemoMode ? '✅' : '❌'}</div>
      {error && <div className="text-red-400">Error: {error}</div>}
      {onReconnect && (
        <button 
          onClick={onReconnect}
          className="mt-2 px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs"
        >
          Force Reconnect
        </button>
      )}
    </div>
  )
})

DebugPanel.displayName = "DebugPanel"

export { DebugPanel }
