"use client"

import { useState } from 'react'
import { useF1SignalR } from '@/hooks/useF1SignalR'

export const F1ConnectionTester = () => {
  const {
    drivers,
    sessionInfo,
    isConnected,
    error,
    isDemoMode,
    hasActiveSession,
    reconnect,
    startDemo,
    stopDemo,
    forceActiveSession
  } = useF1SignalR()

  const [isExpanded, setIsExpanded] = useState(false)
  const [isMinimized, setIsMinimized] = useState(true)

  // Si está minimizado, solo mostrar un botón pequeño
  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-black/90 text-white p-2 rounded-lg hover:bg-black/80 transition-colors clickable"
          title="Show F1 Connection Tester"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/90 text-white p-4 rounded-lg text-xs font-mono max-w-md z-50">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-sm">F1 Connection Tester</h3>
        <div className="flex gap-1">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs"
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? '−' : '+'}
          </button>
          <button
            onClick={() => setIsMinimized(true)}
            className="px-2 py-1 bg-gray-600 hover:bg-gray-700 rounded text-xs"
            title="Minimize"
          >
            ×
          </button>
        </div>
      </div>
      
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span>Status:</span>
          <div className={`px-3 py-1 rounded text-xs font-bold text-white ${
            isDemoMode 
              ? 'bg-blue-600' 
              : isConnected
                ? 'bg-green-600'
                : 'bg-red-600'
          }`}>
            {isDemoMode 
              ? 'Demo Mode' 
              : isConnected
                ? 'Connected'
                : 'Disconnected'
            }
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span>API:</span>
          <span className="text-blue-400">F1 Official Live Timing</span>
        </div>
        
        <div className="flex items-center gap-2">
          <span>Data:</span>
          <span className={drivers.length > 0 ? 'text-green-400' : 'text-red-400'}>
            {drivers.length > 0 ? '✅ Received' : '❌ None'}
          </span>
          {isDemoMode && (
            <span className="text-yellow-400 text-xs">(DEMO)</span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <span>Session:</span>
          <span className={
            hasActiveSession && drivers.length > 0 ? 'text-green-400' : 'text-yellow-400'
          }>
            {hasActiveSession && drivers.length > 0 
              ? (sessionInfo.raceName || 'Active Session') 
              : 'No Active Session'
            }
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <span>Drivers:</span>
          <span className={drivers.length > 0 ? 'text-green-400' : 'text-red-400'}>
            {drivers.length}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <span>Session Status:</span>
          <span className={
            hasActiveSession ? 'text-green-400' : 'text-red-400'
          }>
            {hasActiveSession ? '✅' : '❌'}
          </span>
        </div>
        
        {error && (
          <div className="text-red-400 text-xs">
            Error: {error}
          </div>
        )}
      </div>
      
      {isExpanded && (
        <div className="mt-4 space-y-2">
          <div className="space-y-1">
            <h4 className="font-semibold text-xs">Debug Info:</h4>
            <div className="p-2 rounded bg-blue-600 text-xs space-y-1">
              <div><span className="font-semibold">Session Name:</span> {sessionInfo.raceName || 'None'}</div>
              <div><span className="font-semibold">Track Status:</span> {sessionInfo.trackStatus || 'None'}</div>
              <div><span className="font-semibold">hasActiveSession:</span> {hasActiveSession ? 'true' : 'false'}</div>
              <div><span className="font-semibold">Drivers Count:</span> {drivers.length}</div>
              <div><span className="font-semibold">isConnected:</span> {isConnected ? 'true' : 'false'}</div>
              <div><span className="font-semibold">isDemoMode:</span> {isDemoMode ? 'true' : 'false'}</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex gap-2">
              <button
                onClick={reconnect}
                className="px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-xs"
              >
                Reconnect
              </button>
              <button
                onClick={startDemo}
                className="px-2 py-1 bg-purple-600 hover:bg-purple-700 rounded text-xs"
              >
                Start Demo
              </button>
              <button
                onClick={stopDemo}
                className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs"
              >
                Stop Demo
              </button>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={forceActiveSession}
                className="px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-xs"
              >
                Force Active
              </button>
              <button
                onClick={() => {
                  console.log("🔄 Refreshing page...")
                  window.location.reload()
                }}
                className="px-2 py-1 bg-yellow-600 hover:bg-yellow-700 rounded text-xs"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
