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
    <div className="flex items-center gap-3">
      <div className="flex flex-col items-center justify-center">
        <Thermometer className="w-5 h-5 text-gray-400 mb-0.5" />
        <span className="text-white text-xl font-semibold leading-none">{weather.track ?? '--'}°</span>
      </div>
      <div className="flex flex-col items-center justify-center">
        <Wind className="w-5 h-5 text-gray-400 mb-0.5" />
        <span className="text-white text-xl font-semibold leading-none">{weather.air ?? '--'}°</span>
      </div>
      <div className="flex flex-col items-center justify-center">
        <Droplets className="w-5 h-5 text-gray-400 mb-0.5" />
        <span className="text-white text-xl font-semibold leading-none">{weather.humidity ?? '--'}%</span>
      </div>
    </div>
  )
})

WeatherWidget.displayName = "WeatherWidget"

export { WeatherWidget }
