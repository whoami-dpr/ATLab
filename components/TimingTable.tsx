"use client"

import React, { memo, useMemo, useState, useEffect } from "react"
import { OptimizedDriverRow } from "./OptimizedDriverRow"
import type { F1Driver } from "../hooks/useF1SignalR"
import { useThemeOptimized } from "../hooks/useThemeOptimized"
import { useTeamLogos } from "../hooks/useTeamLogos"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { DEFAULT_COLUMNS, STORAGE_KEY, type ColumnConfig, type ColumnId } from "../types/ColumnConfig"
import { motion, AnimatePresence } from "motion/react"

interface TimingTableProps {
  drivers: F1Driver[]
  drsEnabled?: boolean
}

// Sortable header component
function SortableHeader({ column }: { column: ColumnConfig }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: column.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: 'grab',
    touchAction: 'none',
  }

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      className="flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/5 rounded-none px-1 border-r border-gray-200 dark:border-gray-600 last:border-r-0"
    >
      {column.label}
    </div>
  )
}

export const TimingTable = memo(function TimingTable({ drivers, drsEnabled = true }: TimingTableProps) {
  const { theme } = useThemeOptimized()
  const [columns, setColumns] = useState<ColumnConfig[]>(DEFAULT_COLUMNS)
  const [showColumnSettings, setShowColumnSettings] = useState(false)
  
  // Load column order from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const savedColumns = JSON.parse(saved) as ColumnConfig[]
        
        // Merge with defaults to ensure new columns appear
        const mergedColumns = [...savedColumns]
        
        DEFAULT_COLUMNS.forEach(defaultCol => {
          if (!mergedColumns.find(c => c.id === defaultCol.id)) {
            mergedColumns.push(defaultCol)
          }
        })
        
        setColumns(mergedColumns)
      } catch (e) {
        console.error('Failed to load column order:', e)
        setColumns(DEFAULT_COLUMNS)
      }
    }
  }, [])

  // Save column order to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(columns))
  }, [columns])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setColumns((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  const toggleColumnVisibility = (columnId: ColumnId) => {
    setColumns((current) =>
      current.map((col) =>
        col.id === columnId ? { ...col, visible: !col.visible } : col
      )
    )
  }

  const sortedDrivers = useMemo(() => {
    return [...drivers].sort((a, b) => {
      if (a.pos === 0 && b.pos !== 0) return 1
      if (a.pos !== 0 && b.pos === 0) return -1
      if (a.pos !== b.pos) return a.pos - b.pos
      return Number(a.code) - Number(b.code)
    })
  }, [drivers])

  const gridTemplateColumns = useMemo(() => 
    columns.filter(c => c.visible).map(c => c.width).join(' '),
    [columns]
  )

  const { getTeamLogo } = useTeamLogos()

  return (
    <div className="bg-transparent rounded-xl overflow-hidden shadow-xl font-inter font-bold max-w-8xl mx-auto overflow-x-auto">
      {/* Mobile Layout */}
      <div className="block md:hidden">
        <div className="space-y-1">
          {sortedDrivers.map((driver, index) => (
            <div key={`${driver.pos}-${driver.code}`}>
              <OptimizedDriverRow 
                driver={driver} 
                index={index} 
                isMobile={true} 
                drsEnabled={drsEnabled}
                teamLogoUrl={getTeamLogo(driver.team || "") || undefined}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block">
        {/* Table Header with Drag & Drop */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div 
            className={`px-0 py-0 bg-gray-100 dark:bg-black text-[10px] font-bold border-b border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white uppercase tracking-wider`}
            style={{
              display: 'grid',
              gridTemplateColumns,
              gap: '0px',
              fontFamily: 'Formula1 Display, Arial, sans-serif'
            }}
          >
            <SortableContext 
              items={columns.map(c => c.id)} 
              strategy={horizontalListSortingStrategy}
            >
              {columns.filter(c => c.visible).map((column) => (
                <SortableHeader key={column.id} column={column} />
              ))}
            </SortableContext>
          </div>
        </DndContext>

        {/* Driver Rows */}
        <div className="relative">
          <AnimatePresence mode="popLayout">
            {sortedDrivers.map((driver, index) => (
              <motion.div
                key={driver.code}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 30 }}
              >
                <OptimizedDriverRow 
                  driver={driver} 
                  index={index} 
                  gapClass="gap-0 px-0" 
                  drsEnabled={drsEnabled}
                  columnOrder={columns.filter(c => c.visible).map(c => c.id)}
                  gridTemplateColumns={gridTemplateColumns}
                  teamLogoUrl={getTeamLogo(driver.team || "") || undefined}
                />
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Column Settings Button - Absolute Bottom Right */}
          <div className="absolute bottom-2 right-2 z-20 opacity-0 hover:opacity-100 transition-opacity duration-200">
            <div className="relative">
              <button
                onClick={() => setShowColumnSettings(!showColumnSettings)}
                className="flex items-center gap-1 px-2 py-1 bg-gray-800/80 hover:bg-gray-700 backdrop-blur-sm rounded text-white text-[10px] shadow-lg border border-white/10"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                <span>Cols</span>
              </button>

              {/* Column Settings Dropdown - Opens Upwards */}
              {showColumnSettings && (
                <div className="absolute bottom-full right-0 mb-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded p-2 shadow-xl z-50 min-w-[180px]">
                  <div className="text-gray-900 dark:text-white text-xs font-bold mb-2">Columns</div>
                  {columns.map((column) => (
                    <label key={column.id} className="flex items-center gap-2 py-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-white/5 px-1 rounded">
                      <input
                        type="checkbox"
                        checked={column.visible}
                        onChange={() => toggleColumnVisibility(column.id)}
                        className="w-3 h-3"
                      />
                      <span className="text-gray-900 dark:text-white text-xs">{column.label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

TimingTable.displayName = "TimingTable"
