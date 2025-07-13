"use client"

import React, { memo } from "react"
import type { F1Driver } from "../hooks/useF1SignalR"

interface OptimizedDriverRowProps {
  driver: F1Driver
  index: number
}

export const OptimizedDriverRow = memo(function OptimizedDriverRow(props: OptimizedDriverRowProps) {
  const { driver, index } = props

  const getTireColor = (tire: string) => {
    switch (tire) {
      case "S":
        return "bg-gradient-to-br from-red-500 to-red-600 text-white shadow-md shadow-red-500/20"
      case "M":
        return "bg-gradient-to-br from-yellow-400 to-yellow-500 text-black shadow-md shadow-yellow-500/20"
      case "H":
        return "bg-gradient-to-br from-gray-100 to-gray-200 text-black shadow-md shadow-gray-500/20"
      default:
        return "bg-gradient-to-br from-gray-500 to-gray-600 text-white shadow-md shadow-gray-500/20"
    }
  }

  const getSectorBars = (color: string, time: string) => {
    if (!time || time === "0.000") return null

    let barColor = "bg-gradient-to-r from-yellow-400 to-yellow-500"
    let barCount = 10
    let glowColor = "shadow-yellow-400/20"

    switch (color) {
      case "green":
        barColor = "bg-gradient-to-r from-green-400 to-green-500"
        barCount = 15
        glowColor = "shadow-green-400/20"
        break
      case "purple":
        barColor = "bg-gradient-to-r from-purple-400 to-purple-500"
        barCount = 12
        glowColor = "shadow-purple-400/20"
        break
      case "yellow":
      default:
        barColor = "bg-gradient-to-r from-yellow-400 to-yellow-500"
        barCount = 10
        glowColor = "shadow-yellow-400/20"
        break
    }

    return (
      <div className="flex gap-1 mb-1">
        {Array(16)
          .fill(0)
          .map((_, i) => (
            <div
              key={i}
              className={`w-2 h-3 rounded transition-all duration-200 ${
                i < barCount ? `${barColor} shadow-sm ${glowColor}` : "bg-gray-800/50"
              }`}
            />
          ))}
      </div>
    )
  }

  const getPositionColor = (pos: number) => {
    const colors = [
      "bg-gradient-to-br from-orange-400 to-orange-600 shadow-md shadow-orange-500/25", // P1
      "bg-gradient-to-br from-orange-300 to-orange-500 shadow-md shadow-orange-400/25", // P2
      "bg-gradient-to-br from-green-400 to-green-600 shadow-md shadow-green-500/25", // P3
      "bg-gradient-to-br from-red-400 to-red-600 shadow-md shadow-red-500/25", // P4
      "bg-gradient-to-br from-blue-400 to-blue-600 shadow-md shadow-blue-500/25", // P5
      "bg-gradient-to-br from-cyan-400 to-cyan-600 shadow-md shadow-cyan-500/25", // P6
      "bg-gradient-to-br from-purple-400 to-purple-600 shadow-md shadow-purple-500/25", // P7
      "bg-gradient-to-br from-pink-400 to-pink-600 shadow-md shadow-pink-500/25", // P8
      "bg-gradient-to-br from-indigo-400 to-indigo-600 shadow-md shadow-indigo-500/25", // P9
      "bg-gradient-to-br from-teal-400 to-teal-600 shadow-md shadow-teal-500/25", // P10
    ]
    return colors[pos - 1] || "bg-gradient-to-br from-gray-500 to-gray-600 shadow-md shadow-gray-500/25"
  }

  const getSectorTextColor = (color: string) => {
    switch (color) {
      case "green":
        return "text-green-400"
      case "yellow":
        return "text-yellow-400"
      case "purple":
        return "text-purple-400"
      default:
        return "text-white"
    }
  }

  return (
    <div
      className={`grid grid-cols-12 gap-2 px-3 py-1.5 hover:bg-gradient-to-r hover:from-gray-800/20 hover:to-gray-900/20 transition-all duration-200 ${
        index !== 0 ? "border-t border-gray-800/20" : ""
      }`}
    >
      {/* Position & Driver - Más compacto */}
      <div className="col-span-1 flex items-center gap-1.5">
        <div className="w-8 h-8 bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl flex items-center justify-center text-white font-semibold text-xl shadow-sm border border-gray-600/30 font-bold">
          {driver.pos}
        </div>
        <div
          className={`px-3 py-0.5 rounded-md text-base font-bold ${getPositionColor(driver.pos)} text-white border border-white/10`}
        >
          {driver.code}
        </div>
      </div>

      {/* DRS - Más pequeño */}
      <div className="col-span-1 flex items-center">
        <div
          className={`px-3 py-0.5 rounded-md text-base font-bold border transition-all duration-200 ${
            driver.drs
              ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-400/30 shadow-md shadow-blue-500/20"
              : "bg-gradient-to-r from-gray-800 to-gray-900 text-gray-500 border-gray-700/30"
          }`}
        >
          DRS
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
          className="w-7 h-7"
        />
        <div className="flex flex-col leading-tight">
          <span className="font-bold text-base text-white">{driver.stint}</span>
          <span className="font-mono text-xs text-gray-400">PIT {driver.pitStops ?? 0}</span>
        </div>
      </div>

      {/* Info - Más pequeño */}
      <div className="col-span-1 flex items-center">
        <div
          className={`font-semibold text-xs px-1.5 py-0.5 rounded ${
            driver.positionsGained > 0
              ? 'text-green-400 bg-green-400/10'
              : driver.positionsGained < 0
                ? 'text-red-400 bg-red-400/10'
                : 'text-gray-400 bg-gray-400/10'
          }`}
        >
          {driver.positionsGained > 0 ? `+${driver.positionsGained}` : driver.positionsGained}
        </div>
      </div>

      {/* Gap - Fuente mejorada */}
      <div className="col-span-1 flex flex-col justify-center font-inter text-xs font-bold text-base">
        <div className={`font-bold text-base ${driver.gap === "LEADER" ? "text-yellow-400" : "text-blue-400"}`}>{driver.gap}</div>
        <div className="text-gray-500 font-mono text-sm">{driver.gapTime}</div>
      </div>

      {/* Lap Time - Nueva fuente Fira Code */}
      <div className="col-span-1 flex flex-col justify-center font-inter text-xs font-bold text-lg">
        <div className="text-white font-bold font-mono text-base">{driver.lapTime}</div>
        <div className="text-gray-500 font-mono text-sm">{driver.prevLap}</div>
      </div>

      {/* Sectors - Más compactos */}
      <div className="col-span-6 grid grid-cols-3 gap-2">
        {/* Sector 1 */}
        <div className="flex flex-col bg-gray-900/20 rounded-md p-1.5 border border-gray-800/30 font-mono text-base">
          {getSectorBars(driver.sector1Color, driver.sector1)}
          <div className="flex items-baseline gap-2">
            <span className={`font-semibold text-xl ${getSectorTextColor(driver.sector1Color)}`}>{driver.sector1}</span>
            <span className="font-mono text-sm text-gray-500">{driver.sector1Prev}</span>
          </div>
        </div>

        {/* Sector 2 */}
        <div className="flex flex-col bg-gray-900/20 rounded-md p-1.5 border border-gray-800/30 font-mono text-base">
          {getSectorBars(driver.sector2Color, driver.sector2)}
          <div className="flex items-baseline gap-2">
            <span className={`font-semibold text-xl ${getSectorTextColor(driver.sector2Color)}`}>{driver.sector2}</span>
            <span className="font-mono text-sm text-gray-500">{driver.sector2Prev}</span>
          </div>
        </div>

        {/* Sector 3 */}
        <div className="flex flex-col bg-gray-900/20 rounded-md p-1.5 border border-gray-800/30 font-mono text-base">
          {getSectorBars(driver.sector3Color, driver.sector3)}
          <div className="flex items-baseline gap-2">
            <span className={`font-semibold text-xl ${getSectorTextColor(driver.sector3Color)}`}>{driver.sector3}</span>
            <span className="font-mono text-sm text-gray-500">{driver.sector3Prev}</span>
          </div>
        </div>
      </div>
    </div>
  )
})

OptimizedDriverRow.displayName = "OptimizedDriverRow"
