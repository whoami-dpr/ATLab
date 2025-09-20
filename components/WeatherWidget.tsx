"use client"

import { memo } from "react"
import { Thermometer, Wind, Droplets } from "lucide-react"

interface WeatherData {
  track: number
  air: number
  humidity: number
  condition: string
  windSpeed?: number
  windDirection?: number
  pressure?: number
}

interface WeatherWidgetProps {
  weather: WeatherData
}

const WeatherWidget = memo(({ weather }: WeatherWidgetProps) => {
  const getWindDirection = (degrees: number) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
    const index = Math.round(degrees / 45) % 8
    return directions[index]
  }

  // Valores por defecto cuando no hay datos
  const trackTemp = weather.track && weather.track > 0 ? Math.round(weather.track) : 0
  const airTemp = weather.air && weather.air > 0 ? Math.round(weather.air) : 0
  const humidity = weather.humidity && weather.humidity > 0 ? Math.round(weather.humidity) : 0
  const windSpeed = weather.windSpeed && weather.windSpeed > 0 ? weather.windSpeed : '0'
  const windDirection = weather.windDirection && weather.windDirection > 0 ? getWindDirection(weather.windDirection) : 'E'

  return (
    <div className="flex items-center gap-3">
      <div className="flex flex-col items-center justify-center">
        <Thermometer className="w-5 h-5 text-gray-400 mb-0.5" />
        <span className="text-white text-xl font-semibold leading-none">{trackTemp}°</span>
        <span className="text-xs text-gray-400">TRC</span>
      </div>
      <div className="flex flex-col items-center justify-center">
        <Thermometer className="w-5 h-5 text-gray-400 mb-0.5" />
        <span className="text-white text-xl font-semibold leading-none">{airTemp}°</span>
        <span className="text-xs text-gray-400">AIR</span>
      </div>
      <div className="flex flex-col items-center justify-center">
        <Droplets className="w-5 h-5 text-gray-400 mb-0.5" />
        <span className="text-white text-xl font-semibold leading-none">{humidity}%</span>
        <span className="text-xs text-gray-400">HUM</span>
      </div>
      <div className="flex flex-col items-center justify-center">
        <Wind className="w-5 h-5 text-gray-400 mb-0.5" />
        <span className="text-white text-xl font-semibold leading-none">{windSpeed}</span>
        <span className="text-xs text-gray-400">{windDirection}</span>
      </div>
    </div>
  )
})

WeatherWidget.displayName = "WeatherWidget"

export { WeatherWidget }
