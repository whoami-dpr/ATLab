"use client"

import { memo } from "react"
import { Flag, Clock, Play } from "lucide-react"

interface EmptyStateProps {
  reconnect: () => void
  startDemo: () => void
}

const EmptyState = memo(({ reconnect, startDemo }: EmptyStateProps) => {
  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-transparent">
      <div className="text-center flex flex-col items-center gap-6">
        <Flag className="w-12 h-12 text-gray-500 mb-2" />
        <h2 className="text-2xl font-semibold text-white mb-1 tracking-tight">No F1 Session</h2>
        <p className="text-gray-400 mb-2 max-w-md text-base leading-relaxed">
          Esperando una sesión en vivo.<br />
          Prueba la demo o revisa si hay una sesión activa.
        </p>
        <div className="flex gap-4 justify-center mt-2">
          <button
            onClick={reconnect}
            className="border border-blue-500 text-blue-400 hover:bg-blue-500/10 px-6 py-2 rounded-xl font-medium text-base transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <Clock className="w-5 h-5" />
            Buscar sesión
          </button>
          <button
            onClick={startDemo}
            className="border border-green-500 text-green-400 hover:bg-green-500/10 px-6 py-2 rounded-xl font-medium text-base transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-green-400"
          >
            <Play className="w-5 h-5" />
            Demo
          </button>
        </div>
      </div>
    </div>
  )
})

EmptyState.displayName = "EmptyState"

export { EmptyState }
