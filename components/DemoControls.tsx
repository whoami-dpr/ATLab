"use client"

import { memo } from "react"
import { Square } from "lucide-react"

interface DemoControlsProps {
  isDemoMode: boolean
  startDemo: () => void
  stopDemo: () => void
}

const DemoControls = memo(({ isDemoMode, startDemo, stopDemo }: DemoControlsProps) => {
  if (!isDemoMode) return null

  return (
    <div className="mb-4 bg-green-500/10 border border-green-500/30 rounded-lg p-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-green-400 font-medium text-xs">Demo Mode Active</span>
          <span className="text-gray-400 text-xs">Simulated live timing data</span>
        </div>
        <button
          onClick={stopDemo}
          className="border border-red-500 text-red-400 hover:bg-red-500/10 px-3 py-1 rounded-md font-medium text-xs transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-red-400"
        >
          <Square className="w-4 h-4" />
          Stop Demo
        </button>
      </div>
    </div>
  )
})

DemoControls.displayName = "DemoControls"

export { DemoControls }
