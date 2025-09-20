"use client"

import { useState, useEffect, useRef } from "react"
import { getDemoDrivers, getDemoSessionInfo } from '../lib/demoData'

export interface F1Driver {
  pos: number
  code: string
  name: string
  color: string
  tire: string
  stint: string
  change: string
  drs: boolean
  gap: string
  gapTime: string
  lapTime: string
  prevLap: string
  sector1: string
  sector1Prev: string
  sector2: string
  sector2Prev: string
  sector3: string
  sector3Prev: string
  sector1Color: string
  sector2Color: string
  sector3Color: string
  lapTimeColor: string
  gapColor: string
  gapTimeColor: string
}

export interface F1SessionInfo {
  raceName: string
  flag: string
  timer: string
  weather: {
    track: number
    air: number
    humidity: number
    condition: string
  }
  lapInfo: string
  trackStatus: string
}

export const useF1SignalR = () => {
  const [drivers, setDrivers] = useState<F1Driver[]>([])
  const [sessionInfo, setSessionInfo] = useState<F1SessionInfo>({
    raceName: "F1 Live Timing",
    flag: "🏁",
    timer: "00:00:00",
    weather: { track: 0, air: 0, humidity: 0, condition: "unknown" },
    lapInfo: "-- / --",
    trackStatus: "No Active Session",
  })
  const [driversTyreHistory, setDriversTyreHistory] = useState<Record<string, string[]>>({})
  const [isConnected, setIsConnected] = useState(false)
  const [hasActiveSession, setHasActiveSession] = useState(false)
  const [connectionWorking, setConnectionWorking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [forceStopDemo, setForceStopDemo] = useState(false)
  const [preventReconnect, setPreventReconnect] = useState(false)
  
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const demoIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const messageTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const driverColors = [
    "bg-orange-500",
    "bg-orange-400",
    "bg-green-500",
    "bg-red-500",
    "bg-blue-500",
    "bg-cyan-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-teal-500",
    "bg-yellow-500",
    "bg-lime-500",
    "bg-emerald-500",
    "bg-sky-500",
    "bg-violet-500",
    "bg-rose-500",
    "bg-amber-500",
    "bg-green-400",
    "bg-blue-400",
    "bg-gray-500",
  ]

  const getCloseCodeMeaning = (code: number) => {
    switch (code) {
      case 1000: return "Normal closure"
      case 1001: return "Going away"
      case 1002: return "Protocol error"
      case 1003: return "Unsupported data"
      case 1004: return "Reserved"
      case 1005: return "No status received"
      case 1006: return "Abnormal closure (connection lost)"
      case 1007: return "Invalid frame payload data"
      case 1008: return "Policy violation"
      case 1009: return "Message too big"
      case 1010: return "Missing extension"
      case 1011: return "Internal error"
      case 1015: return "TLS handshake failure"
      default: return "Unknown code"
    }
  }

  // Demo data con 20 pilotos
  const startDemo = () => {
    if (wsRef.current) {
      wsRef.current.close()
    }
    
    setIsDemoMode(true)
    setError(null)
    setIsConnected(true)
    setHasActiveSession(true)
    setDrivers(getDemoDrivers())
    setSessionInfo(getDemoSessionInfo())
    
    // Simular actualizaciones de datos
    demoIntervalRef.current = setInterval(() => {
      if (!forceStopDemo) {
        setDrivers(prevDrivers => 
          prevDrivers.map(driver => ({
            ...driver,
            lapTime: `${Math.floor(Math.random() * 60) + 1}:${(Math.random() * 60).toFixed(3)}`,
            sector1: `${(Math.random() * 30 + 20).toFixed(3)}`,
            sector2: `${(Math.random() * 30 + 20).toFixed(3)}`,
            sector3: `${(Math.random() * 30 + 20).toFixed(3)}`,
          }))
        )
      }
    }, 2000)
  }

  const stopDemo = () => {
    setForceStopDemo(true)
    if (demoIntervalRef.current) {
      clearInterval(demoIntervalRef.current)
    }
    setIsDemoMode(false)
    setDrivers([])
    setHasActiveSession(false)
    setSessionInfo({
      raceName: "F1 Live Timing",
      flag: "🏁",
      timer: "00:00:00",
      weather: { track: 0, air: 0, humidity: 0, condition: "unknown" },
      lapInfo: "-- / --",
      trackStatus: "No Active Session",
    })
  }

  const connectToF1SignalR = async () => {
    if (isDemoMode) return

    try {
      console.log("🔄 Attempting to connect to F1 SignalR...")
      
      // Step 1: Negotiate
      const response = await fetch("/api/f1/negotiate")
      if (!response.ok) {
        throw new Error(`Negotiate failed: ${response.status}`)
      }
      
      const negotiateData = await response.json()
      console.log("📡 Negotiate data received:", negotiateData)
      
      // Step 2: Connect WebSocket
      const connectionData = encodeURIComponent('[{"name":"Streaming"}]')
      const wsUrl = `wss://livetiming.formula1.com/signalr/connect?transport=webSockets&clientProtocol=1.5&connectionToken=${encodeURIComponent(negotiateData.ConnectionToken)}&connectionData=${connectionData}`
      
      console.log("🔗 WebSocket URL:", wsUrl.substring(0, 100) + "...")
      
      wsRef.current = new WebSocket(wsUrl)
      
      wsRef.current.onopen = () => {
        console.log("✅ WebSocket connected successfully!")
        setIsConnected(true)
        setConnectionWorking(true)
        setError(null)
        subscribeToFeeds()
      }
      
      wsRef.current.onmessage = (event) => {
        console.log("📨 WebSocket message received:", event.data.substring(0, 100) + "...")
        handleWebSocketMessage(event.data)
      }
      
      wsRef.current.onerror = (error) => {
        console.error("❌ WebSocket error:", error)
        setError("WebSocket connection error")
        setIsConnected(false)
      }
      
      wsRef.current.onclose = (event) => {
        console.log("🔌 WebSocket closed:", event.code, event.reason)
        setIsConnected(false)
        setConnectionWorking(false)
        setHasActiveSession(false)
        
        if (event.code !== 1000 && !preventReconnect) {
          setTimeout(() => {
            console.log("🔄 Attempting to reconnect...")
            connectToF1SignalR()
          }, 10000)
        }
      }
      
    } catch (error) {
      console.error("❌ Connection failed:", error)
      setError("Connection failed")
      setIsConnected(false)
    }
  }

  const subscribeToFeeds = () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.log("❌ Cannot subscribe: WebSocket not open")
      return
    }

    console.log("📡 Subscribing to F1 feeds...")

    // Formato correcto de SignalR para F1
    const subscription = {
      "H": "Streaming",
      "M": "Subscribe",
      "A": [
        [
          "Heartbeat",
          "CarData.z",
          "Position.z", 
          "ExtrapolatedClock",
          "TopThree",
          "RcmSeries",
          "TimingStats",
          "TimingAppData",
          "WeatherData",
          "TrackStatus",
          "DriverList",
          "RaceControlMessages",
          "SessionInfo",
          "SessionData",
          "LapCount",
          "TimingData"
        ]
      ],
      "I": 0
    }
    
    console.log("📡 Sending SignalR subscription:", JSON.stringify(subscription))
    const message = JSON.stringify(subscription) + "\x1e"
    wsRef.current.send(message)
    
    console.log("✅ SignalR subscription sent")
  }

  const handleWebSocketMessage = (data: string) => {
    if (!data || data === "\x1e") return

    try {
      const messages = data.split("\x1e").filter((msg) => msg.trim())

      messages.forEach((message) => {
        try {
          const parsed = JSON.parse(message)
          console.log("📦 Parsed message:", parsed)
          
          // Handle SignalR message format - DEBUGGING INTENSIVE
          console.log("🔍 ANALYZING MESSAGE:", JSON.stringify(parsed, null, 2))
          
          if (parsed.M && Array.isArray(parsed.M)) {
            console.log("📦 SignalR message with M array, length:", parsed.M.length)
            
            if (parsed.M.length > 0) {
              console.log("🎉 F1 data received! Messages:", parsed.M.length)
              parsed.M.forEach((msg: any, index: number) => {
                console.log(`📡 Message ${index} FULL STRUCTURE:`, JSON.stringify(msg, null, 2))
                
                // Process each message in the M array
                if (msg && msg.H === "Streaming") {
                  console.log("📡 SignalR Streaming message detected!")
                  console.log("📡 Message A array:", msg.A)
                  
                  if (msg.A && Array.isArray(msg.A)) {
                    console.log("📡 Processing A array with", msg.A.length, "items")
                    msg.A.forEach((f1Data: any, dataIndex: number) => {
                      console.log(`📊 F1 Data ${dataIndex} FULL:`, JSON.stringify(f1Data, null, 2))
                      handleF1Data({
                        target: "Streaming",
                        arguments: f1Data
                      })
                    })
                  } else {
                    console.log("⚠️ No A array in Streaming message")
                  }
                } else if (msg && msg.M && Array.isArray(msg.M)) {
                  console.log("📡 Nested M array found:", msg.M)
                  handleF1Data({
                    target: "Streaming",
                    arguments: msg.M
                  })
                } else if (msg) {
                  console.log("📡 Other message type:", msg.H || "unknown")
                  console.log("📡 Message structure:", JSON.stringify(msg, null, 2))
                  
                  // Try to process as F1 data anyway
                  if (msg && typeof msg === 'object') {
                    console.log("📡 Attempting to process as F1 data:", msg)
                    handleF1Data({
                      target: "Streaming",
                      arguments: [msg]
                    })
                  }
                }
              })
            } else {
              console.log("⏳ Empty M array - this means no F1 data is being broadcast")
              console.log("⏳ This could mean:")
              console.log("  - No active F1 session")
              console.log("  - Session is between activities")
              console.log("  - F1 API is not sending data")
            }
          } else if (parsed.H === "Streaming") {
            console.log("📡 Direct SignalR Streaming message:", parsed)
            if (parsed.A && Array.isArray(parsed.A)) {
              console.log("📡 Processing direct A array with", parsed.A.length, "items")
              parsed.A.forEach((f1Data: any, index: number) => {
                console.log(`📊 Direct F1 Data ${index}:`, JSON.stringify(f1Data, null, 2))
                handleF1Data({
                  target: "Streaming",
                  arguments: f1Data
                })
              })
            }
          } else if (parsed.target === "Streaming") {
            console.log("📡 Old format message:", parsed)
            handleF1Data(parsed)
          } else {
            console.log("📊 Other message type:", parsed)
            console.log("📊 This might be a heartbeat or connection message")
          }
        } catch (e) {
          console.log("⚠️ Failed to parse message:", message)
        }
      })
    } catch (error) {
      console.error("Error parsing message:", error)
    }
  }

  const handleF1Data = (data: any) => {
    if (!data) return

    console.log("🔍 handleF1Data called with:", data)
    console.log("🔍 Full data structure:", JSON.stringify(data, null, 2))

    if (data.target === "Streaming" && data.arguments) {
      const [messageType, messageData] = data.arguments
      console.log("📊 Processing F1 data:", messageType, messageData ? "with data" : "no data")
      console.log("📊 Arguments:", data.arguments)
      console.log("📊 Message data structure:", JSON.stringify(messageData, null, 2))

      switch (messageType) {
        case "TimingData":
          if (messageData) {
            console.log("🏎️ Timing data received, drivers:", messageData.Lines ? Object.keys(messageData.Lines).length : 0)
            console.log("🏎️ Timing data structure:", JSON.stringify(messageData, null, 2))
            updateDriverData(messageData)
            setHasActiveSession(true)
          } else {
            console.log("⚠️ TimingData received but no messageData")
          }
          break
        case "DriverList":
          if (messageData) {
            console.log("👥 Driver list received:", JSON.stringify(messageData, null, 2))
            setHasActiveSession(true)
          }
          break
        case "SessionInfo":
          if (messageData) {
            console.log("📋 Session info received:", JSON.stringify(messageData, null, 2))
            updateSessionInfo(messageData)
            if (messageData.Name && !messageData.Name.toLowerCase().includes("no active")) {
              setHasActiveSession(true)
            }
          }
          break
        case "TrackStatus":
          if (messageData) {
            console.log("🏁 Track status received:", JSON.stringify(messageData, null, 2))
            updateTrackStatus(messageData)
            setHasActiveSession(true)
          }
          break
        case "WeatherData":
          if (messageData) {
            console.log("🌤️ Weather data received:", JSON.stringify(messageData, null, 2))
            updateWeatherData(messageData)
            setHasActiveSession(true)
          }
          break
        case "LapCount":
          if (messageData) {
            console.log("🔢 Lap count received:", JSON.stringify(messageData, null, 2))
            updateLapCount(messageData)
            setHasActiveSession(true)
          }
          break
        default:
          console.log("📊 Received:", messageType)
          console.log("📊 Processing as active session data")
          setHasActiveSession(true)
      }
    } else {
      console.log("⚠️ Message not processed - target:", data.target, "arguments:", data.arguments)
      console.log("⚠️ Full data:", JSON.stringify(data, null, 2))
      if (data && typeof data === 'object') {
        console.log("📊 Non-streaming data detected - considering as active session")
        setHasActiveSession(true)
      }
    }
  }

  const updateDriverData = (timingData: any) => {
    if (!timingData.Lines || isDemoMode) return

    const updatedDrivers: F1Driver[] = []

    Object.entries(timingData.Lines).forEach(([driverNumber, driverData]: [string, any]) => {
      if (!driverData || !driverData.Position) return

      const position = Number.parseInt(driverData.Position) || 0
      if (position === 0) return

      const currentTire = driverData.Tyres?.Compound?.charAt(0) || "M"
      const driverCode = driverData.RacingNumber || driverNumber
      
      // Update tyres history
      setDriversTyreHistory(prev => {
        const currentHistory = prev[driverCode] || []
        const lastTire = currentHistory[currentHistory.length - 1]
        
        if (lastTire !== currentTire) {
          const newHistory = [...currentHistory, currentTire]
          return { ...prev, [driverCode]: newHistory }
        }
        return prev
      })

      const driver: F1Driver = {
        pos: position,
        code: driverData.RacingNumber || driverNumber,
        name: driverData.DriverName || `Driver ${driverNumber}`,
        color: driverColors[position - 1] || "bg-gray-500",
        tire: currentTire,
        stint: String(driverData.Tyres?.Stint || 1),
        change: "0",
        drs: driverData.DRS || false,
        gap: driverData.GapToLeader || "0.000",
        gapTime: driverData.IntervalToPositionAhead || "0.000",
        lapTime: driverData.LastLapTime || "0.000",
        prevLap: driverData.BestLapTime || "0.000",
        sector1: driverData.Sectors?.[0] || "0.000",
        sector1Prev: driverData.Sectors?.[0] || "0.000",
        sector2: driverData.Sectors?.[1] || "0.000",
        sector2Prev: driverData.Sectors?.[1] || "0.000",
        sector3: driverData.Sectors?.[2] || "0.000",
        sector3Prev: driverData.Sectors?.[2] || "0.000",
        sector1Color: "text-green-500",
        sector2Color: "text-green-500",
        sector3Color: "text-green-500",
        lapTimeColor: "text-green-500",
        gapColor: "text-white",
        gapTimeColor: "text-white"
      }

      updatedDrivers.push(driver)
    })

    setDrivers(updatedDrivers)
    setHasActiveSession(true)
  }

  const updateSessionInfo = (sessionData: any) => {
    if (isDemoMode) return

    setSessionInfo(prev => ({
      ...prev,
      raceName: sessionData.Name || prev.raceName,
      trackStatus: sessionData.Status || prev.trackStatus
    }))
  }

  const updateTrackStatus = (trackData: any) => {
    if (isDemoMode) return

    setSessionInfo(prev => ({
      ...prev,
      trackStatus: trackData.Status || prev.trackStatus
    }))
  }

  const updateWeatherData = (weatherData: any) => {
    if (isDemoMode) return

    setSessionInfo(prev => ({
      ...prev,
      weather: {
        track: weatherData.TrackTemperature || prev.weather.track,
        air: weatherData.AirTemperature || prev.weather.air,
        humidity: weatherData.Humidity || prev.weather.humidity,
        condition: weatherData.Condition || prev.weather.condition
      }
    }))
  }

  const updateLapCount = (lapData: any) => {
    if (isDemoMode) return

    setSessionInfo(prev => ({
      ...prev,
      lapInfo: `${lapData.CurrentLap || 0} / ${lapData.TotalLaps || 0}`
    }))
  }

  const reconnect = () => {
    if (isDemoMode) {
      stopDemo()
    }
    connectToF1SignalR()
  }

  // Auto-connect on mount
  useEffect(() => {
    if (!isDemoMode) {
      connectToF1SignalR()
    }
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
      if (demoIntervalRef.current) {
        clearInterval(demoIntervalRef.current)
      }
    }
  }, [isDemoMode])

  return {
    drivers,
    sessionInfo,
    isConnected,
    error,
    isDemoMode,
    hasActiveSession,
    reconnect,
    startDemo,
    stopDemo
  }
}
