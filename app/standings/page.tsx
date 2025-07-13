"use client"

import React, { memo, useMemo } from "react"
import { useState } from "react"
import { useF1Standings } from "../../hooks/useF1Standings"
import { RefreshCw, Trophy, Users, Crown, Medal, Award, Calendar, MapPin } from "lucide-react"
import { Sidebar } from "../../components/Sidebar"

export default function StandingsPage() {
  const [activeTab, setActiveTab] = useState<"drivers" | "constructors">("drivers")
  const { drivers, constructors, loading, error, lastUpdated, refresh } = useF1Standings()

  const getTeamColor = (team: string) => {
    const colors: { [key: string]: string } = {
      "Red Bull Racing Honda RBPT": "bg-blue-600",
      Ferrari: "bg-red-600",
      "McLaren Mercedes": "bg-orange-500",
      Mercedes: "bg-cyan-400",
      "Aston Martin Aramco Mercedes": "bg-green-600",
      "Alpine Renault": "bg-blue-500",
      "Haas Ferrari": "bg-gray-500",
      "RB Honda RBPT": "bg-blue-700",
      "Williams Mercedes": "bg-blue-400",
      "Kick Sauber Ferrari": "bg-green-500",
    }
    return colors[team] || "bg-gray-600"
  }

  const getPositionIcon = (position: number) => {
    if (position === 1) return <Crown className="w-5 h-5 text-yellow-400" />
    if (position === 2) return <Medal className="w-5 h-5 text-gray-400" />
    if (position === 3) return <Award className="w-5 h-5 text-amber-600" />
    return null
  }

  const getPositionColor = (position: number) => {
    if (position === 1) return "bg-gradient-to-r from-yellow-400 to-yellow-500 text-black"
    if (position === 2) return "bg-gradient-to-r from-gray-300 to-gray-400 text-black"
    if (position === 3) return "bg-gradient-to-r from-amber-500 to-amber-600 text-white"
    return "bg-gray-700 text-white"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Tipado explícito de props
  interface DriverRowProps {
    driver: any;
    getTeamColor: (team: string) => string;
    getPositionIcon: (position: number) => React.ReactNode;
    getPositionColor: (position: number) => string;
  }
  const DriverRow = memo(function DriverRow({ driver, getTeamColor, getPositionIcon, getPositionColor }: DriverRowProps) {
    return (
      <div
        className={`grid grid-cols-12 gap-4 p-4 hover:bg-gray-800/30 transition-colors ${
          driver.position !== drivers.length ? "border-b border-gray-800/30" : ""
        }`}
      >
        <div className="col-span-1 flex items-center gap-2">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${getPositionColor(driver.position)}`}
          >
            {driver.position <= 3 ? getPositionIcon(driver.position) : driver.position}
          </div>
        </div>
        <div className="col-span-4 flex items-center">
          <div className="font-semibold text-white text-lg">{driver.driver}</div>
        </div>
        <div className="col-span-3 flex items-center gap-3">
          <div className={`w-4 h-4 rounded ${getTeamColor(driver.team)}`}></div>
          <span className="text-gray-300 font-medium">{driver.team}</span>
        </div>
        <div className="col-span-2 flex items-center">
          <div className="text-white font-bold text-xl">{driver.points}</div>
        </div>
        <div className="col-span-2 flex items-center">
          <div className="text-gray-300 font-medium">{driver.wins || 0}</div>
        </div>
      </div>
    )
  })

  interface ConstructorRowProps {
    constructor: any;
    getTeamColor: (team: string) => string;
  }
  const ConstructorRow = memo(function ConstructorRow({ constructor, getTeamColor }: ConstructorRowProps) {
    return (
      <div
        className={`grid grid-cols-12 gap-4 p-4 hover:bg-gray-800/30 transition-colors ${
          constructor.position !== constructors.length ? "border-b border-gray-800/30" : ""
        }`}
      >
        <div className="col-span-1 flex items-center gap-2">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${getPositionColor(constructor.position)}`}
          >
            {constructor.position <= 3 ? getPositionIcon(constructor.position) : constructor.position}
          </div>
        </div>
        <div className="col-span-7 flex items-center gap-4">
          <div className={`w-5 h-5 rounded ${getTeamColor(constructor.team)}`}></div>
          <span className="font-semibold text-white text-lg">{constructor.team}</span>
        </div>
        <div className="col-span-4 flex items-center">
          <div className="text-white font-bold text-xl">{constructor.points}</div>
        </div>
      </div>
    )
  })

  const driversMemo = useMemo(() => drivers.map((driver, index) => (
    <DriverRow key={driver.position} driver={driver} getTeamColor={getTeamColor} getPositionIcon={getPositionIcon} getPositionColor={getPositionColor} />
  )), [drivers])

  const constructorsMemo = useMemo(() => constructors.map((constructor, index) => (
    <ConstructorRow key={constructor.team} constructor={constructor} getTeamColor={getTeamColor} />
  )), [constructors])

  return (
    <div className="min-h-screen bg-gray-950 text-white flex">
      <Sidebar isConnected={false} error={null} reconnect={() => {}} />

      <div className="flex-1 bg-gradient-to-br from-gray-900 to-gray-950">
        {/* Header */}
        <div className="border-b border-gray-800/50 bg-gray-900/50 backdrop-blur-sm">
          <div className="flex items-center justify-between p-6">
            <div>
              <h1 className="text-2xl font-bold text-white">Championship Standings</h1>
              <div className="flex items-center gap-4 mt-2">
                <p className="text-gray-400">2025 Formula 1 World Championship</p>
                {lastUpdated && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <MapPin className="w-4 h-4" />
                    <span>{lastUpdated.race}</span>
                    <span>•</span>
                    <span>Round {lastUpdated.round}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              {lastUpdated && (
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span>Updated: {formatDate(lastUpdated.date)}</span>
                </div>
              )}
              <button
                onClick={refresh}
                disabled={loading}
                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-800/50">
          <div className="flex">
            <button
              onClick={() => setActiveTab("drivers")}
              className={`flex items-center gap-3 px-6 py-4 font-medium transition-all ${
                activeTab === "drivers"
                  ? "bg-blue-500/10 text-blue-400 border-b-2 border-blue-500"
                  : "text-gray-400 hover:text-white hover:bg-gray-800/30"
              }`}
            >
              <Trophy className="w-4 h-4" />
              Drivers Championship
            </button>
            <button
              onClick={() => setActiveTab("constructors")}
              className={`flex items-center gap-3 px-6 py-4 font-medium transition-all ${
                activeTab === "constructors"
                  ? "bg-blue-500/10 text-blue-400 border-b-2 border-blue-500"
                  : "text-gray-400 hover:text-white hover:bg-gray-800/30"
              }`}
            >
              <Users className="w-4 h-4" />
              Constructors Championship
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6">
              <p className="font-medium">Error loading standings: {error}</p>
              <button onClick={refresh} className="mt-2 text-sm underline hover:no-underline">
                Try again
              </button>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-32">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <RefreshCw className="w-8 h-8 animate-spin text-blue-400" />
                </div>
                <p className="text-gray-400">Loading standings...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Drivers Tab */}
              {activeTab === "drivers" && (
                <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800/50 overflow-hidden">
                  <div className="grid grid-cols-12 gap-4 p-4 bg-gray-800/50 text-sm font-medium text-gray-400 border-b border-gray-800/50">
                    <div className="col-span-1">POS</div>
                    <div className="col-span-4">DRIVER</div>
                    <div className="col-span-3">TEAM</div>
                    <div className="col-span-2">POINTS</div>
                    <div className="col-span-2">WINS</div>
                  </div>
                  {driversMemo}
                </div>
              )}

              {/* Constructors Tab */}
              {activeTab === "constructors" && (
                <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800/50 overflow-hidden">
                  <div className="grid grid-cols-12 gap-4 p-4 bg-gray-800/50 text-sm font-medium text-gray-400 border-b border-gray-800/50">
                    <div className="col-span-1">POS</div>
                    <div className="col-span-7">TEAM</div>
                    <div className="col-span-4">POINTS</div>
                  </div>
                  {constructorsMemo}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
