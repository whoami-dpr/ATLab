"use client"

import { memo } from "react"
import { Thermometer, Wind, Droplets } from "lucide-react"

interface WeatherData {
  track: number
  air: number
  humidity: number
  condition: string
}

interface WeatherWidgetProps {
  weather: WeatherData
}

const WeatherWidget = memo(({ weather }: WeatherWidgetProps) => {
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2 bg-transparent glass rounded-xl px-3 py-2 border border-gray-700/50 shadow-md">
        <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-md shadow-orange-500/20">
          <Thermometer className="w-4 h-4 text-white" />
        </div>
        <div>
          <div className="text-white font-semibold text-sm">{weather.track || "--"}°</div>
          <div className="text-gray-400 text-xs font-medium">Track</div>
        </div>
      </div>

      <div className="flex items-center gap-2 bg-transparent glass rounded-xl px-3 py-2 border border-gray-700/50 shadow-md">
        <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center shadow-md shadow-green-500/20">
          <Wind className="w-4 h-4 text-white" />
        </div>
        <div>
          <div className="text-white font-semibold text-sm">{weather.air || "--"}°</div>
          <div className="text-gray-400 text-xs font-medium">Air</div>
        </div>
      </div>

      <div className="flex items-center gap-2 bg-transparent glass rounded-xl px-3 py-2 border border-gray-700/50 shadow-md">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20">
          <Droplets className="w-4 h-4 text-white" />
        </div>
        <div>
          <div className="text-white font-semibold text-sm">{weather.humidity || "--"}%</div>
          <div className="text-gray-400 text-xs font-medium">Humidity</div>
        </div>
      </div>
    </div>
  )
})

WeatherWidget.displayName = "WeatherWidget"

export { WeatherWidget }
