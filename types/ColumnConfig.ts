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
  { id: 'driver', label: 'DRIVER', width: 'minmax(120px, 0.6fr)', visible: true },
  { id: 'leader', label: 'LEADER', width: 'minmax(70px, 0.2fr)', visible: true },
  { id: 'tyre', label: 'TYRE', width: 'minmax(50px, 0.4fr)', visible: true },
  { id: 'bestLap', label: 'BEST LAP', width: 'minmax(40px, 0.5fr)', visible: true },
  { id: 'interval', label: 'INTERVAL', width: 'minmax(50px, 0.5fr)', visible: true },
  { id: 'lastLap', label: 'LAST LAP', width: 'minmax(90px, 0.5fr)', visible: true },
  { id: 'miniSectors', label: 'MINI SECTORS', width: 'minmax(100px, 1fr)', visible: true },
  { id: 'lastSectors', label: 'LAST SECTORS', width: 'minmax(150px, 1fr)', visible: true },
  { id: 'bestSectors', label: 'BEST SECTORS', width: 'minmax(150px, 1fr)', visible: true },
  { id: 'posChange', label: 'POS +/-', width: 'minmax(60px, 0.2fr)', visible: true },
  { id: 'pitIndicator', label: 'PIT', width: 'minmax(50px, 0.2fr)', visible: true },
  { id: 'pitCount', label: 'PIT', width: 'minmax(50px, 0.2fr)', visible: true },
  { id: 'topSpeed', label: 'TOP SPD', width: 'minmax(70px, 0.2fr)', visible: true },
  // Hidden by default columns
  { id: 'favoriteGap', label: 'FAV GAP', width: 'minmax(80px, 0.8fr)', visible: false },
  { id: 'laps', label: 'LAPS', width: 'minmax(60px, 0.6fr)', visible: false },
  { id: 'tyreHistory', label: 'TYRES', width: 'minmax(120px, 1.2fr)', visible: false },
  { id: 'info', label: 'INFO', width: 'minmax(60px, 0.6fr)', visible: false },
  { id: 'bestSpeeds', label: 'BEST SPEEDS', width: 'minmax(100px, 1fr)', visible: false },
]

export const STORAGE_KEY = 'f1-timing-column-order-v2'
