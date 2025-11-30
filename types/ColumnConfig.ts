// Column configuration for timing table
export type ColumnId = 
  | 'driver'
  | 'leader'
  | 'tyre'
  | 'bestLap'
  | 'interval'
  | 'lastLap'
  | 'miniSectors'
  | 'lastSectors'
  | 'pitIndicator'
  | 'pitCount'
  | 'topSpeed'
  | 'favoriteGap'
  | 'laps'
  | 'tyreHistory'
  | 'info'
  | 'posChange'
  | 'bestSectors'
  | 'bestSpeeds'

export interface ColumnConfig {
  id: ColumnId
  label: string
  width: string
  visible: boolean
}

export const DEFAULT_COLUMNS: ColumnConfig[] = [
  { id: 'driver', label: 'DRIVER', width: '140px', visible: true },
  { id: 'leader', label: 'LEADER', width: '80px', visible: true },
  { id: 'tyre', label: 'TYRE', width: '60px', visible: true },
  { id: 'bestLap', label: 'BEST LAP', width: '90px', visible: true },
  { id: 'interval', label: 'INTERVAL', width: '80px', visible: true },
  { id: 'lastLap', label: 'LAST LAP', width: '100px', visible: true },
  { id: 'miniSectors', label: 'MINI SECTORS', width: '180px', visible: true },
  { id: 'lastSectors', label: 'LAST SECTORS', width: '180px', visible: true },
  { id: 'bestSectors', label: 'BEST SECTORS', width: '180px', visible: true },
  { id: 'posChange', label: 'POS +/-', width: '60px', visible: true },
  { id: 'pitIndicator', label: 'PIT', width: '50px', visible: true },
  { id: 'pitCount', label: 'PIT', width: '50px', visible: true },
  { id: 'topSpeed', label: 'TOP SPD', width: '80px', visible: true },
  // Hidden by default columns
  { id: 'favoriteGap', label: 'FAV GAP', width: '80px', visible: false },
  { id: 'laps', label: 'LAPS', width: '60px', visible: false },
  { id: 'tyreHistory', label: 'TYRES', width: '120px', visible: false },
  { id: 'info', label: 'INFO', width: '60px', visible: false },
  { id: 'bestSpeeds', label: 'BEST SPEEDS', width: '100px', visible: false },
]

export const STORAGE_KEY = 'f1-timing-column-order-v4'
