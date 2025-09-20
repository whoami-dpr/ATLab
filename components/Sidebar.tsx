"use client"

import React, { memo } from "react"
import { useRouter, usePathname } from "next/navigation"
import {
  RefreshCw,
  Wifi,
  WifiOff,
  BarChart3,
  Map,
  Trophy,
  Cloud,
  Settings,
  Calendar,
  HelpCircle,
  Home,
  Github,
  Heart,
} from "lucide-react"

interface SidebarProps {
  isConnected: boolean
  error: string | null
  reconnect: () => void
  isDemoMode: boolean
  hasActiveSession: boolean
}

export const Sidebar = memo(function Sidebar(props: SidebarProps) {
  const router = useRouter()
  const pathname = usePathname()

  const navigationItems = [
    { name: "Dashboard", path: "/", icon: BarChart3 },
    { name: "Track Map", path: "/track-map", icon: Map },
    { name: "Standings", path: "/standings", icon: Trophy },
    { name: "Weather", path: "/weather", icon: Cloud },
  ]

  const generalItems = [
    { name: "Schedule", path: "/schedule", icon: Calendar },
    { name: "About Us", path: "/about", icon: HelpCircle },
    { name: "Home", path: "/home", icon: Home },
    { name: "Github", path: "https://github.com/whoami-dpr", icon: Github },
  ]

  const linkItems = [
    { name: "Sponsor me", path: "https://github.com/sponsors", icon: Heart },
  ]

  const handleNavigation = (path: string) => {
    if (path.startsWith("http")) {
      window.open(path, "_blank")
    } else {
      router.push(path)
    }
  }

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true
    if (path !== "/" && pathname.startsWith(path)) return true
    return false
  }

  return (
    <div className="w-64 bg-transparent backdrop-blur-sm border-r border-gray-800/50 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-800/50">
        <div className="flex items-center gap-3 mb-4">
          <div>
            <a href="/about-us" className="text-xl font-semibold bg-gradient-to-r from-blue-400 via-blue-500 to-cyan-400 bg-clip-text text-transparent cursor-pointer">ATLab</a>
            <p className="text-xs text-gray-400">F1 Live Timing</p>
          </div>
        </div>

        {/* Connection Status */}
        <div className="flex items-center gap-3 p-3 bg-transparent rounded-lg">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${props.isConnected ? "bg-green-400 animate-pulse" : "bg-red-400"}`}></div>
            {props.isConnected ? <Wifi className="w-4 h-4 text-green-400" /> : <WifiOff className="w-4 h-4 text-red-400" />}
          </div>
          <div className="flex-1">
            <div className="text-xs font-medium text-white">{props.isConnected ? "Live" : "Offline"}</div>
            <div className={`px-2 py-1 rounded text-xs font-bold text-white ${
              props.isDemoMode 
                ? 'bg-blue-600' 
                : props.isConnected && props.hasActiveSession
                  ? 'bg-green-600'
                  : props.isConnected && !props.hasActiveSession
                    ? 'bg-yellow-600'
                    : 'bg-red-600'
            }`}>
              {props.isDemoMode 
                ? 'Blue Flag' 
                : props.isConnected && props.hasActiveSession
                  ? 'Green Flag'
                  : props.isConnected && !props.hasActiveSession
                    ? 'Yellow Flag'
                    : 'Red Flag'
              }
            </div>
          </div>
          <button
            onClick={props.reconnect}
            className="p-1.5 hover:bg-gray-800 rounded-md transition-colors"
            title="Reconnect"
          >
            <RefreshCw className="w-3.5 h-3.5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-4 space-y-6">
        {/* Main Navigation */}
        <div>
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3 px-2">Navigation</div>
          <div className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item.path)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive(item.path)
                      ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                      : "text-gray-300 hover:bg-gray-800/50 hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </button>
              )
            })}
          </div>
        </div>

        {/* General */}
        <div>
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3 px-2">General</div>
          <div className="space-y-1">
            {generalItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item.path)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive(item.path)
                      ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                      : "text-gray-400 hover:bg-gray-800/50 hover:text-gray-200"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </button>
              )
            })}
          </div>
        </div>

        {/* Links */}
        <div>
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3 px-2">Links</div>
          <div className="space-y-1">
            {linkItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item.path)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-800/50 hover:text-gray-200 transition-all"
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
})
