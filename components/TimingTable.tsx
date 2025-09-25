"use client"

import React, { memo, useMemo } from "react"
import { OptimizedDriverRow } from "./OptimizedDriverRow"
import type { F1Driver } from "../hooks/useF1SignalR"
import { useThemeOptimized } from "../hooks/useThemeOptimized"

interface TimingTableProps {
  drivers: F1Driver[]
}

export const TimingTable = memo(function TimingTable({ drivers }: TimingTableProps) {
  const { theme } = useThemeOptimized()
  const sortedDrivers = useMemo(() => {
    return [...drivers].sort((a, b) => a.pos - b.pos)
  }, [drivers])

  return (
    <div className="bg-transparent rounded-xl overflow-hidden shadow-xl font-inter font-bold max-w-8xl mx-auto">
      {/* Table Header - Más compacto */}
      <div 
        className={`px-1 py-0.5 bg-transparent text-xs font-semibold border-b ${
          theme === 'light' 
            ? 'text-gray-700 border-gray-300/50' 
            : 'text-gray-300 border-gray-700/50'
        }`}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          gap: '0px'
        }}
      >
        <div className="col-span-1 flex items-center px-0" style={{ paddingLeft: '0px' }}>Position</div>
        <div className="col-span-1 flex items-center px-2" style={{ marginLeft: '60px', paddingLeft: '16px' }}>DRS</div>
        <div className="col-span-1 flex items-center px-1" style={{ marginLeft: '45px' }}>Tire</div>
        <div className="col-span-1 flex items-center px-0" style={{ marginLeft: '30px' }}>Tyres History</div>
        <div className="col-span-1 flex items-center px-0" style={{ marginLeft: '40px' }}>Info</div>
        <div className="col-span-1 flex items-center px-0" style={{ marginLeft: '30px' }}>Gap</div>
        <div className="col-span-1 flex items-center px-0" style={{ marginLeft: '27px' }}>LapTime</div>
        <div className="col-span-5 flex items-center px-0" style={{ marginLeft: '30px' }}>Sectors</div>
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
