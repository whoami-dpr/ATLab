"use client"

import React, { memo, useMemo } from "react"
import { OptimizedDriverRow } from "./OptimizedDriverRow"
import type { F1Driver } from "../hooks/useF1SignalR"

interface TimingTableProps {
  drivers: F1Driver[]
}

export const TimingTable = memo(function TimingTable({ drivers }: TimingTableProps) {
  const sortedDrivers = useMemo(() => {
    return [...drivers].sort((a, b) => a.pos - b.pos)
  }, [drivers])

  return (
    <div className="bg-transparent rounded-xl border border-gray-800/50 overflow-hidden shadow-xl font-inter font-bold max-w-8xl mx-auto">
      {/* Table Header - Más compacto */}
      <div className="grid grid-cols-12 gap-0.5 px-1 py-1 bg-transparent text-xs font-semibold text-gray-300 border-b border-gray-700/50">
        <div className="col-span-1">Position</div>
        <div className="col-span-1">DRS</div>
        <div className="col-span-1">Tire</div>
        <div className="col-span-1">Tyres History</div>
        <div className="col-span-1">Info</div>
        <div className="col-span-1">Gap</div>
        <div className="col-span-1">LapTime</div>
        <div className="col-span-5">Sectors</div>
      </div>

      {/* Driver Rows */}
      <div className="max-h-[70vh] overflow-y-auto">
        {sortedDrivers.map((driver, index) => (
          <OptimizedDriverRow key={`${driver.pos}-${driver.code}`} driver={driver} index={index} gapClass="gap-0.5 px-1" />
        ))}
      </div>
    </div>
  )
})

TimingTable.displayName = "TimingTable"
