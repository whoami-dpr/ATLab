"use client"

import { useState, useEffect, useRef } from "react"

export interface F1Driver {
  pos: number
  code: string
  name: string
  racingNumber: string
  color: string
  tire: string
  stint: string
  change: string
  drs: boolean
  inPit: boolean
  isFastestLap: boolean
  isPersonalBest: boolean
  retired: boolean
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
  team?: string
  tyresHistory?: string[]
  pitStops?: number
  positionsGained?: number
  sector1Segments?: Array<{ Status: number; PersonalFastest?: boolean; OverallFastest?: boolean }>
  sector2Segments?: Array<{ Status: number; PersonalFastest?: boolean; OverallFastest?: boolean }>
  sector3Segments?: Array<{ Status: number; PersonalFastest?: boolean; OverallFastest?: boolean }>
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
    windSpeed?: number
    windDirection?: number
    pressure?: number
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
    weather: { track: 0, air: 0, humidity: 0, condition: "unknown", windSpeed: 0, windDirection: 0, pressure: 0 },
    lapInfo: "-- / --",
    trackStatus: "No Active Session",
  })
  const [driversTyreHistory, setDriversTyreHistory] = useState<Record<string, string[]>>({})
  const [isConnected, setIsConnected] = useState(false)
  const [hasActiveSession, setHasActiveSession] = useState(false)
  const [connectionWorking, setConnectionWorking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preventReconnect, setPreventReconnect] = useState(false)
  const [fastestLapDriver, setFastestLapDriver] = useState<string | null>(null)
  const [fastestLapTime, setFastestLapTime] = useState<number>(Infinity) // Store the fastest lap time in milliseconds
  const [fastestLapTeam, setFastestLapTeam] = useState<string | null>(null)
  const [fastestLapDriverName, setFastestLapDriverName] = useState<string | null>(null)
  const [carDataCache, setCarDataCache] = useState<Record<string, any>>({})
  
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<number | null>(null)
  const messageTimeoutRef = useRef<number | null>(null)

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


  const connectToF1SignalR = async () => {
    // Clear any existing connection
    if (wsRef.current) {
      console.log("🔄 Closing existing WebSocket connection...")
      wsRef.current.close()
      wsRef.current = null
    }

    // Clear any existing timeouts
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }

    try {
      console.log("🔄 Attempting to connect to F1 SignalR...")
      setError(null)
      
      // Test basic connectivity first
      console.log("🌐 Testing basic connectivity...")
      try {
        const testResponse = await fetch("https://livetiming.formula1.com/", { 
          method: 'HEAD',
          mode: 'no-cors' // This will work even with CORS issues
        })
        console.log("✅ Basic connectivity test passed")
      } catch (connectivityError) {
        console.warn("⚠️ Basic connectivity test failed:", connectivityError)
        console.log("🔄 Continuing with connection attempt...")
      }
      
      // Step 1: Negotiate
      console.log("📡 Attempting to negotiate with F1 API...")
      const response = await fetch("/api/f1/negotiate")
      if (!response.ok) {
        throw new Error(`Negotiate failed: ${response.status} - ${response.statusText}`)
      }
      
      const negotiateData = await response.json()
      console.log("📡 Negotiate data received:", negotiateData)
      
      // Step 2: Connect WebSocket
      const connectionData = encodeURIComponent('[{"name":"Streaming"}]')
      const wsUrl = `wss://livetiming.formula1.com/signalr/connect?transport=webSockets&clientProtocol=1.5&connectionToken=${encodeURIComponent(negotiateData.ConnectionToken)}&connectionData=${connectionData}`
      
      console.log("🔗 WebSocket URL:", wsUrl.substring(0, 100) + "...")
      console.log("🔗 Connection token:", negotiateData.ConnectionToken?.substring(0, 20) + "...")
      console.log("🔗 Connection data:", connectionData)
      console.log("🔗 Full URL length:", wsUrl.length)

      wsRef.current = new WebSocket(wsUrl)

      // Monitor WebSocket state changes
      const stateCheckInterval = window.setInterval(() => {
        if (wsRef.current) {
          const state = wsRef.current.readyState
          const stateText = state === WebSocket.CONNECTING ? 'CONNECTING' : 
                           state === WebSocket.OPEN ? 'OPEN' : 
                           state === WebSocket.CLOSING ? 'CLOSING' : 
                           state === WebSocket.CLOSED ? 'CLOSED' : 'UNKNOWN'
          console.log("🔍 WebSocket state check:", stateText, state)
        }
      }, 2000) // Check every 2 seconds

      // Set a connection timeout
      const connectionTimeout = window.setTimeout(() => {
        clearInterval(stateCheckInterval)
        if (wsRef.current?.readyState === WebSocket.CONNECTING) {
          console.error("⏰ Connection timeout - closing WebSocket")
          wsRef.current.close()
          setError("Connection timeout - F1 server not responding")
          setIsConnected(false)
          setConnectionWorking(false)
        }
      }, 15000) // 15 seconds timeout

      wsRef.current.onopen = () => {
        clearTimeout(connectionTimeout)
        clearInterval(stateCheckInterval)
        console.log("✅ WebSocket connected successfully!")
        setIsConnected(true)
        setConnectionWorking(true)
        setError(null)
        subscribeToFeeds()
        // No establecer hasActiveSession aquí - esperar datos reales de F1
      }

      wsRef.current.onmessage = (event) => {
        console.log("📨 WebSocket message received:", event.data.substring(0, 100) + "...")
        handleWebSocketMessage(event.data)
      }

      wsRef.current.onerror = (error) => {
        clearTimeout(connectionTimeout)
        clearInterval(stateCheckInterval)
        
        // WebSocket error objects are often empty, so we need to check the readyState
        const readyState = wsRef.current?.readyState
        const url = wsRef.current?.url
        
        console.error("❌ WebSocket error occurred")
        console.error("❌ Error object:", error)
        console.error("❌ WebSocket state:", {
          readyState,
          readyStateText: readyState === WebSocket.CONNECTING ? 'CONNECTING' : 
                         readyState === WebSocket.OPEN ? 'OPEN' : 
                         readyState === WebSocket.CLOSING ? 'CLOSING' : 
                         readyState === WebSocket.CLOSED ? 'CLOSED' : 'UNKNOWN',
          url: url?.substring(0, 100) + '...',
          errorType: error?.type,
          errorTarget: error?.target,
          isTrusted: error?.isTrusted
        })
        
        // Determine error type based on readyState
        if (readyState === WebSocket.CONNECTING) {
          console.error("❌ Connection failed during initial handshake")
          setError("Failed to connect to F1 Live Timing server - check your internet connection")
        } else if (readyState === WebSocket.OPEN) {
          console.error("❌ Error occurred while connected")
          setError("WebSocket connection error - attempting reconnection...")
        } else if (readyState === WebSocket.CLOSED) {
          console.error("❌ WebSocket was already closed")
          setError("WebSocket connection was closed unexpectedly")
        } else {
          console.error("❌ WebSocket in unexpected state:", readyState)
          setError("WebSocket connection error")
        }
        
        setIsConnected(false)
        setConnectionWorking(false)
        
        // Attempt to reconnect after a short delay
        reconnectTimeoutRef.current = window.setTimeout(() => {
          if (!preventReconnect) {
            console.log("🔄 Attempting to reconnect after error...")
            connectToF1SignalR()
          }
        }, 5000)
      }

      wsRef.current.onclose = (event) => {
        clearTimeout(connectionTimeout)
        clearInterval(stateCheckInterval)
        console.log("🔌 WebSocket closed:", event.code, event.reason)
        console.log("🔌 Close code meaning:", getCloseCodeMeaning(event.code))
        console.log("🔌 Was clean:", event.wasClean)
        console.log("🔌 ReadyState before close:", wsRef.current?.readyState)
        
        setIsConnected(false)
        setConnectionWorking(false)
        
        // Only clear hasActiveSession if it was an unexpected close
        if (event.code !== 1000) {
          setHasActiveSession(false)
          console.log("🔌 Unexpected close - clearing active session")
        }
        
        if (event.code !== 1000 && !preventReconnect) {
          console.log("🔄 Unexpected close - attempting to reconnect in 10 seconds...")
          setError(`Connection lost (${event.code}): ${event.reason || 'Unknown reason'}`)
          reconnectTimeoutRef.current = window.setTimeout(() => {
            console.log("🔄 Attempting to reconnect...")
            connectToF1SignalR()
          }, 10000)
        } else if (event.code === 1000) {
          console.log("✅ WebSocket closed normally")
          setError(null)
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

    // Formato exacto de F1-DASH
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
          "SessionStatus",
            "DriverList",
            "RaceControlMessages",
            "SessionInfo",
            "SessionData",
            "LapCount",
            "TimingData",
          "TeamRadio",
          "PitLaneTimeCollection",
          "ChampionshipPrediction"
        ]
      ],
      "I": 1
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
          
          // Handle SignalR message format - F1-DASH style
          console.log("🔍 ANALYZING MESSAGE:", JSON.stringify(parsed, null, 2))
          
          // Check for initial data (R field)
          if (parsed.R) {
            console.log("🎯 INITIAL DATA DETECTED!")
            console.log("🎯 Initial data:", JSON.stringify(parsed.R, null, 2))
            handleInitialData(parsed.R)
            return
          }
          
          // Check for updates (M array)
          if (parsed.M && Array.isArray(parsed.M)) {
            console.log("📦 SignalR message with M array, length:", parsed.M.length)
            
            if (parsed.M.length > 0) {
              console.log("🎉 F1 data received! Messages:", parsed.M.length)
              parsed.M.forEach((msg: any, index: number) => {
                console.log(`📡 Message ${index} FULL STRUCTURE:`, JSON.stringify(msg, null, 2))
                
                // Process each message in the M array - F1-DASH format
                if (msg && msg.A && Array.isArray(msg.A) && msg.A.length >= 2) {
                  const category = msg.A[0] // e.g., "SessionInfo", "TimingData", etc.
                  const data = msg.A[1]    // The actual data
                  
                  console.log(`📊 Processing ${category}:`, JSON.stringify(data, null, 2))
                  
                  // Log específico para SessionInfo
                  if (category === "SessionInfo") {
                    console.log("🎯 SESSION INFO DETECTED!")
                    console.log("🎯 SessionInfo data:", JSON.stringify(data, null, 2))
                    console.log("🎯 Session Name:", data.Name || data.name || "No name")
                    console.log("🎯 Session Type:", data.Type || data.type || "No type")
                    console.log("🎯 Session Status:", data.Status || data.status || "No status")
                    console.log("🎯 Session Phase:", data.Phase || data.phase || "No phase")
                  }
                  
                  // Log específico para SessionStatus
                  if (category === "SessionStatus") {
                    console.log("🎯 SESSION STATUS DETECTED!")
                    console.log("🎯 SessionStatus data:", JSON.stringify(data, null, 2))
                    console.log("🎯 Status Name:", data.Name || data.name || "No name")
                    console.log("🎯 Status Type:", data.Type || data.type || "No type")
                    console.log("🎯 Status Status:", data.Status || data.status || "No status")
                    console.log("🎯 Status Phase:", data.Phase || data.phase || "No phase")
                  }
                  
                  // Log específico para TimingData
                  if (category === "TimingData") {
                    console.log("🎯 TIMING DATA DETECTED!")
                    console.log("🎯 TimingData data:", JSON.stringify(data, null, 2))
                    console.log("🎯 Drivers count:", data.Lines ? Object.keys(data.Lines).length : 0)
                    if (data.Lines) {
                      Object.entries(data.Lines).forEach(([key, driver]: [string, any]) => {
                        console.log(`🎯 Driver ${key}: ${driver.DriverName || driver.FullName || 'Unknown'} - Position ${driver.Position}`)
                      })
                    }
                  }
                  
                  // Log específico para DriverList
                  if (category === "DriverList") {
                    console.log("🎯 DRIVER LIST DETECTED!")
                    console.log("🎯 DriverList data:", JSON.stringify(data, null, 2))
                    console.log("🎯 Drivers count:", data.Drivers ? data.Drivers.length : 0)
                  }
                  
                  handleF1Data({
                    target: "Streaming",
                    arguments: [category, data]
                  })
                } else {
                  console.log("⚠️ Message doesn't match expected format:", msg)
                }
              })
            } else {
              console.log("⏳ Empty M array - this means no F1 data is being broadcast")
              console.log("⏳ This could mean:")
              console.log("  - No active F1 session")
              console.log("  - Session is between activities")
              console.log("  - F1 API is not sending data")
            }
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

  const handleInitialData = (initialData: any) => {
    console.log("🎯 Processing initial data:", initialData)
    
    // Process initial session data
    if (initialData.SessionInfo) {
      console.log("🎯 Initial session info:", initialData.SessionInfo)
      updateSessionInfo(initialData.SessionInfo)
      setHasActiveSession(true)
    }
    
    // Process initial timing data
    if (initialData.TimingData) {
      console.log("🎯 Initial timing data:", initialData.TimingData)
      updateDriverData(initialData.TimingData)
      setHasActiveSession(true)
    }
    
    // Process TimingData first (contains all drivers)
    if (initialData.TimingData) {
      console.log("🎯 Initial TimingData (all drivers):", initialData.TimingData)
      updateDriverData(initialData.TimingData)
      setHasActiveSession(true)
    }
    // If no TimingData, fallback to TopThree (limited to 3 drivers)
    else if (initialData.TopThree) {
      console.log("🎯 Initial TopThree data (limited to 3 drivers):", initialData.TopThree)
      // Convert TopThree to TimingData format for processing
      const timingData = {
        Lines: {}
      }
      
      if (initialData.TopThree.Lines) {
        initialData.TopThree.Lines.forEach((driver: any, index: number) => {
          (timingData.Lines as any)[driver.RacingNumber] = {
            Position: driver.Position,
            RacingNumber: driver.RacingNumber,
            DriverName: driver.FullName,
            LapTime: driver.LapTime,
            DiffToLeader: driver.DiffToLeader,
            DiffToAhead: driver.DiffToAhead,
            Team: driver.Team,
            TeamColour: driver.TeamColour
          }
        })
      }
      
      updateDriverData(timingData)
      setHasActiveSession(true)
    }
    
    // Process weather data
    if (initialData.WeatherData) {
      console.log("🎯 Initial weather data:", JSON.stringify(initialData.WeatherData, null, 2))
      console.log("🎯 Weather data type:", typeof initialData.WeatherData)
      console.log("🎯 Weather data keys:", Object.keys(initialData.WeatherData || {}))
      updateWeatherData(initialData.WeatherData)
      setHasActiveSession(true)
    }
    
    // Process extrapolated clock (session timer)
    if (initialData.ExtrapolatedClock) {
      console.log("🎯 Initial clock data:", initialData.ExtrapolatedClock)
      setSessionInfo(prev => ({
        ...prev,
        timer: initialData.ExtrapolatedClock.Remaining || "00:00:00"
      }))
      setHasActiveSession(true)
    }
    
    // Only mark as active session if we have specific F1 data with actual content
    const hasValidSessionInfo = initialData.SessionInfo && 
      initialData.SessionInfo.Name && 
      !initialData.SessionInfo.Name.toLowerCase().includes("no active")
    
    const hasValidTimingData = initialData.TimingData && 
      initialData.TimingData.Lines && 
      Object.keys(initialData.TimingData.Lines).length > 0
    
    const hasValidTopThree = initialData.TopThree && 
      initialData.TopThree.Lines && 
      initialData.TopThree.Lines.length > 0
    
    if (hasValidSessionInfo || hasValidTimingData || hasValidTopThree) {
      console.log("🎯 Valid F1 data received - marking as active session")
      setHasActiveSession(true)
    } else {
      console.log("🎯 No valid F1 data in initial data - not marking as active session")
      setHasActiveSession(false)
    }
  }

  const handleF1Data = (data: any) => {
    if (!data) return

    console.log("🔍 handleF1Data called with:", data)
    console.log("🔍 Full data structure:", JSON.stringify(data, null, 2))
    
    // Log all message types to find tire data
    if (data.arguments && data.arguments.length > 0) {
      console.log("🏎️ Message type:", data.arguments[0])
    }

    if (data.target === "Streaming" && data.arguments) {
      const [messageType, messageData] = data.arguments
      console.log("📊 Processing F1 data:", messageType, messageData ? "with data" : "no data")
      console.log("📊 Arguments:", data.arguments)
      
      // Special logging for CarData to debug tire issues
      if (messageType === "CarData" || messageType === "CarData.z") {
        console.log("🔍 CAR DATA DEBUG - Message received:", {
          messageType,
          hasData: !!messageData,
          dataType: typeof messageData,
          dataKeys: messageData ? Object.keys(messageData) : 'no data',
          fullData: messageData,
          isString: typeof messageData === 'string',
          stringLength: typeof messageData === 'string' ? messageData.length : 'not string',
          isCompressed: messageType === "CarData.z"
        })
      } else {
        console.log("📊 Message data structure:", JSON.stringify(messageData, null, 2))
      }

      switch (messageType) {
        case "Position.z":
          console.log("🏎️ Position.z message received - checking for tire data:", messageData)
          if (messageData && typeof messageData === 'object') {
            console.log("🏎️ Position.z COMPLETE structure:", JSON.stringify(messageData, null, 2))
            // Check if Position.z contains tire information
            const positionKeys = Object.keys(messageData)
            console.log("🏎️ Position.z keys:", positionKeys)
            
            // Process Position.z for tire information
            if (messageData.Entries) {
              console.log("🏎️ Position.z.Entries found:", Object.keys(messageData.Entries))
              // Log tire data for each driver
              Object.entries(messageData.Entries).forEach(([driverNumber, positionData]: [string, any]) => {
                console.log(`🏎️ Driver ${driverNumber} Position.z:`, {
                  driverNumber,
                  positionData,
                  tireFields: {
                    Tyres: positionData.Tyres,
                    TyreCompound: positionData.TyreCompound,
                    Compound: positionData.Compound,
                    TyreType: positionData.TyreType,
                    TireType: positionData.TireType,
                    Tyre: positionData.Tyre,
                    Tire: positionData.Tire
                  }
                })
              })
            }
          }
          break
        case "TimingData":
          if (messageData && messageData.Lines && Object.keys(messageData.Lines).length > 0) {
            console.log("🏎️ Timing data received with drivers:", Object.keys(messageData.Lines).length)
            console.log("🏎️ Timing data structure:", JSON.stringify(messageData, null, 2))
            updateDriverData(messageData)
            setHasActiveSession(true)
            console.log("✅ Active session confirmed - drivers data received")
          } else {
            console.log("⚠️ TimingData received but no driver data")
          }
          break
        case "CarData":
        case "CarData.z":
          console.log("🏎️ CarData message received - checking for tire data:", messageData)
          if (messageData && typeof messageData === 'object') {
            console.log("🏎️ CarData COMPLETE structure:", JSON.stringify(messageData, null, 2))
            // Check if CarData contains tire information
            const carDataKeys = Object.keys(messageData)
            console.log("🏎️ CarData keys:", carDataKeys)
            
            // Check if we have Entries
            if (messageData.Entries) {
              console.log("🏎️ CarData.Entries found with drivers:", Object.keys(messageData.Entries))
            } else {
              console.log("⚠️ CarData.Entries NOT FOUND - checking other possible structures")
              // Check for other possible structures
              if (messageData.Lines) {
                console.log("🏎️ CarData.Lines found:", Object.keys(messageData.Lines))
              }
              if (messageData.Drivers) {
                console.log("🏎️ CarData.Drivers found:", Object.keys(messageData.Drivers))
              }
            }
            
            // Process CarData for tire information
            if (messageData.Entries) {
              console.log("🏎️ CarData.Entries found:", Object.keys(messageData.Entries))
              // Store tire data for each driver
              const newCarDataCache: Record<string, any> = {}
              Object.entries(messageData.Entries).forEach(([driverNumber, carData]: [string, any]) => {
                console.log(`🏎️ Driver ${driverNumber} CarData:`, {
                  driverNumber,
                  carData,
                  tireFields: {
                    Tyres: carData.Tyres,
                    TyreCompound: carData.TyreCompound,
                    Compound: carData.Compound,
                    TyreType: carData.TyreType,
                    TireType: carData.TireType,
                    Tyre: carData.Tyre,
                    Tire: carData.Tire
                  }
                })
                newCarDataCache[driverNumber] = carData
              })
              setCarDataCache(newCarDataCache)
              console.log("✅ CarData cache updated with", Object.keys(newCarDataCache).length, "drivers")
            } else {
              console.log("⚠️ CarData.Entries NOT FOUND - checking other possible structures")
              // Check for other possible structures
              if (messageData.Lines) {
                console.log("🏎️ CarData.Lines found:", Object.keys(messageData.Lines))
                // Try to process Lines structure
                const newCarDataCache: Record<string, any> = {}
                Object.entries(messageData.Lines).forEach(([driverNumber, carData]: [string, any]) => {
                  console.log(`🏎️ Driver ${driverNumber} CarData from Lines:`, carData)
                  newCarDataCache[driverNumber] = carData
                })
                setCarDataCache(newCarDataCache)
                console.log("✅ CarData cache updated from Lines with", Object.keys(newCarDataCache).length, "drivers")
              }
              if (messageData.Drivers) {
                console.log("🏎️ CarData.Drivers found:", Object.keys(messageData.Drivers))
                // Try to process Drivers structure
                const newCarDataCache: Record<string, any> = {}
                Object.entries(messageData.Drivers).forEach(([driverNumber, carData]: [string, any]) => {
                  console.log(`🏎️ Driver ${driverNumber} CarData from Drivers:`, carData)
                  newCarDataCache[driverNumber] = carData
                })
                setCarDataCache(newCarDataCache)
                console.log("✅ CarData cache updated from Drivers with", Object.keys(newCarDataCache).length, "drivers")
              }
            }
          }
          break
        case "TimingStats":
          console.log("🏎️ TimingStats message received - checking for tire data:", messageData)
          break
        case "TimingAppData":
          console.log("🏎️ TimingAppData message received - checking for tire data:", messageData)
          break
        case "DriverList":
          if (messageData && messageData.Drivers && messageData.Drivers.length > 0) {
            console.log("👥 Driver list received with", messageData.Drivers.length, "drivers")
            console.log("👥 Driver list:", JSON.stringify(messageData, null, 2))
            setHasActiveSession(true)
            console.log("✅ Active session confirmed - driver list received")
          } else {
            console.log("⚠️ DriverList received but no drivers")
          }
          break
        case "SessionInfo":
          if (messageData) {
            console.log("📋 Session info received:", JSON.stringify(messageData, null, 2))
            console.log("📋 Session Name:", messageData.Name || "Unknown")
            console.log("📋 Session Type:", messageData.Type || "Unknown")
            console.log("📋 Session Status:", messageData.Status || "Unknown")
            console.log("📋 Session Phase:", messageData.Phase || "Unknown")
            
            updateSessionInfo(messageData)
            
            // Solo marcar como sesión activa si hay información específica de sesión
            const sessionName = messageData.Name || ""
            const sessionType = messageData.Type || ""
            const sessionStatus = messageData.Status || ""
            
            const isActiveSession = (
              sessionName && 
              !sessionName.toLowerCase().includes("no active") &&
              !sessionName.toLowerCase().includes("finished") &&
              !sessionName.toLowerCase().includes("closed") &&
              !sessionName.toLowerCase().includes("not started") &&
              sessionType &&
              sessionType.toLowerCase() !== "unknown" &&
              sessionStatus &&
              sessionStatus.toLowerCase() !== "unknown"
            )

            if (isActiveSession) {
              console.log("✅ Active session detected:", sessionName, "-", sessionType)
              setHasActiveSession(true)
            } else {
              console.log("❌ No active session - Name:", sessionName, "Type:", sessionType, "Status:", sessionStatus)
              setHasActiveSession(false)
            }
          } else {
            console.log("⚠️ SessionInfo received but no messageData")
          }
          break
        case "TrackStatus":
          if (messageData) {
            console.log("🏁 Track status received:", JSON.stringify(messageData, null, 2))
            updateTrackStatus(messageData)
            // Track status alone doesn't indicate active session
            console.log("🏁 Track status received but not setting active session")
          }
          break
        case "SessionStatus":
          if (messageData) {
            console.log("📊 Session status received:", JSON.stringify(messageData, null, 2))
            updateSessionInfo(messageData)
            // Only set as active if there's specific session data
            if (messageData.Name && !messageData.Name.toLowerCase().includes("no active")) {
              setHasActiveSession(true)
            }
          }
          break
        case "WeatherData":
          if (messageData) {
            console.log("🌤️ Weather data received:", JSON.stringify(messageData, null, 2))
            console.log("🌤️ Weather data type:", typeof messageData)
            console.log("🌤️ Weather data keys:", Object.keys(messageData || {}))
            updateWeatherData(messageData)
            // Weather data alone doesn't indicate active session
            console.log("🌤️ Weather data received but not setting active session")
          }
          break
        case "LapCount":
          if (messageData) {
            console.log("🔢 Lap count received:", JSON.stringify(messageData, null, 2))
            updateLapCount(messageData)
            // Lap count alone doesn't indicate active session
            console.log("🔢 Lap count received but not setting active session")
          }
          break
        default:
          console.log("📊 Received:", messageType)
          console.log("📊 Unknown message type - not setting active session")
          // Log all message types to see what we're receiving
          console.log("📊 ALL MESSAGE TYPES RECEIVED:", messageType, "Data:", messageData)
          // No establecer hasActiveSession para tipos de mensaje desconocidos
      }
    } else {
      console.log("⚠️ Message not processed - target:", data.target, "arguments:", data.arguments)
      console.log("⚠️ Full data:", JSON.stringify(data, null, 2))
      if (data && typeof data === 'object') {
        console.log("📊 Non-streaming data detected - not setting active session without specific F1 data")
        // No establecer hasActiveSession para datos no específicos de F1
      }
    }
  }

  // Helper function to safely extract string values from F1 data
  const extractStringValue = (value: any, defaultValue: string = "0.000"): string => {
    if (value === null || value === undefined) return defaultValue
    if (typeof value === 'string') {
      // If it's a string, clean it up
      const cleaned = value.trim()
      return cleaned === '' || cleaned === '0' || cleaned === '0.000' ? defaultValue : cleaned
    }
    if (typeof value === 'number') {
      return value === 0 ? defaultValue : String(value)
    }
    if (value && typeof value === 'object') {
      // If it's an object, try to extract a meaningful value
      if (value.Value !== undefined) return extractStringValue(value.Value, defaultValue)
      if (value.Status !== undefined) return extractStringValue(value.Status, defaultValue)
      if (value.OverallFastest !== undefined) return extractStringValue(value.OverallFastest, defaultValue)
      if (value.PersonalFastest !== undefined) return extractStringValue(value.PersonalFastest, defaultValue)
      
      // For F1 timing data, look for common time-related properties
      if (value.Time !== undefined) return extractStringValue(value.Time, defaultValue)
      if (value.LapTime !== undefined) return extractStringValue(value.LapTime, defaultValue)
      if (value.SectorTime !== undefined) return extractStringValue(value.SectorTime, defaultValue)
      if (value.Gap !== undefined) return extractStringValue(value.Gap, defaultValue)
      
      // If it's an array, try to get the first element
      if (Array.isArray(value) && value.length > 0) {
        return extractStringValue(value[0], defaultValue)
      }
      
      // Try to find any string or number value in the object
      const stringValue = Object.values(value).find(v => 
        (typeof v === 'string' && v.trim() !== '') || 
        (typeof v === 'number' && v !== 0)
      )
      if (stringValue) return extractStringValue(stringValue, defaultValue)
      
      // If all else fails, log the object structure for debugging
      console.log("🔍 Could not extract string from object:", value)
      return defaultValue
    }
    return defaultValue
  }

  // Helper function to extract sector time from sector data
  const extractSectorTime = (sectorData: any, defaultValue: string = "0.000"): string => {
    if (sectorData === null || sectorData === undefined) return defaultValue
    if (typeof sectorData === 'string') {
      const cleaned = sectorData.trim()
      // Return empty string for empty values, not the default
      if (cleaned === '' || cleaned === '0' || cleaned === '0.000') return ""
      return cleaned
    }
    if (typeof sectorData === 'number') {
      return sectorData === 0 ? "" : String(sectorData)
    }
    if (sectorData && typeof sectorData === 'object') {
      // Try common sector time properties
      if (sectorData.Time !== undefined) return extractSectorTime(sectorData.Time, defaultValue)
      if (sectorData.SectorTime !== undefined) return extractSectorTime(sectorData.SectorTime, defaultValue)
      if (sectorData.Value !== undefined) return extractSectorTime(sectorData.Value, defaultValue)
      if (sectorData.OverallFastest !== undefined) return extractSectorTime(sectorData.OverallFastest, defaultValue)
      if (sectorData.PersonalFastest !== undefined) return extractSectorTime(sectorData.PersonalFastest, defaultValue)
      
      // Try to find any string or number value
      const stringValue = Object.values(sectorData).find(v => 
        (typeof v === 'string' && v.trim() !== '') || 
        (typeof v === 'number' && v !== 0)
      )
      if (stringValue) return extractSectorTime(stringValue, defaultValue)
    }
    return defaultValue
  }

  const updateDriverData = (timingData: any) => {
    if (!timingData.Lines) return

    console.log("🏎️ Updating driver data with:", timingData)
    const updatedDrivers: F1Driver[] = []

    Object.entries(timingData.Lines).forEach(([driverNumber, driverData]: [string, any]) => {
      if (!driverData) return

      const position = Number.parseInt(driverData.Position) || 0
      if (position === 0) return

      // Log the complete structure of the data we're receiving
      console.log(`🏎️ Driver ${driverNumber} COMPLETE data structure:`, JSON.stringify(driverData, null, 2))
      
      // Log all possible gap-related fields
      console.log(`🏎️ Driver ${driverNumber} ALL GAP FIELDS:`, {
        position,
        driverNumber,
        allStats: driverData.Stats,
        directGapFields: {
          DiffToLeader: driverData.DiffToLeader,
          GapToLeader: driverData.GapToLeader,
          Gap: driverData.Gap,
          DiffToAhead: driverData.DiffToAhead,
          IntervalToPositionAhead: driverData.IntervalToPositionAhead,
          Interval: driverData.Interval,
          TimeDiffToFastest: driverData.TimeDiffToFastest,
          TimeDifftoPositionAhead: driverData.TimeDifftoPositionAhead
        },
        allDriverDataKeys: Object.keys(driverData)
      })
      
      // Log all fields that might contain tire information
      console.log(`🏎️ Driver ${driverNumber} ALL TIRE-RELATED FIELDS:`, {
        position,
        driverNumber,
        allKeys: Object.keys(driverData),
        tireFields: {
          Tyres: driverData.Tyres,
          TyreCompound: driverData.TyreCompound,
          Compound: driverData.Compound,
          TyreType: driverData.TyreType,
          TireType: driverData.TireType,
          Tyre: driverData.Tyre,
          Tire: driverData.Tire,
          TyreStint: driverData.TyreStint,
          Stint: driverData.Stint,
          TyreStatus: driverData.TyreStatus,
          TireStatus: driverData.TireStatus,
          TyreCondition: driverData.TyreCondition,
          TireCondition: driverData.TireCondition
        },
        allFieldsWithTire: Object.keys(driverData).filter(key => 
          key.toLowerCase().includes('tire') || 
          key.toLowerCase().includes('tyre') || 
          key.toLowerCase().includes('compound')
        ),
        allFieldsWithRubber: Object.keys(driverData).filter(key => 
          key.toLowerCase().includes('rubber') || 
          key.toLowerCase().includes('soft') || 
          key.toLowerCase().includes('medium') || 
          key.toLowerCase().includes('hard') || 
          key.toLowerCase().includes('intermediate')
        ),
        allFieldsWithStatus: Object.keys(driverData).filter(key => 
          key.toLowerCase().includes('status') || 
          key.toLowerCase().includes('condition')
        ),
        // Check if tire data might be in nested objects
        nestedTireData: {
          'Sectors[0]': driverData.Sectors?.[0],
          'Sectors[1]': driverData.Sectors?.[1], 
          'Sectors[2]': driverData.Sectors?.[2],
          'Speeds': driverData.Speeds,
          'BestLapTime': driverData.BestLapTime,
          'LastLapTime': driverData.LastLapTime
        },
        // Check all string values that might contain tire info
        allStringValues: Object.entries(driverData)
          .filter(([key, value]) => typeof value === 'string' && value.length < 10)
          .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
      })
      
      // Log specific fields that might contain the real data
      console.log(`🔍 Driver ${driverNumber} specific fields:`, {
        'DriverName': driverData.DriverName,
        'FullName': driverData.FullName,
        'Name': driverData.Name,
        'RacingNumber': driverData.RacingNumber,
        'FirstName': driverData.FirstName,
        'LastName': driverData.LastName,
        'Abbreviation': driverData.Abbreviation,
        'ShortName': driverData.ShortName,
        'DisplayName': driverData.DisplayName,
        'LapTime': driverData.LapTime,
        'LastLapTime': driverData.LastLapTime,
        'BestLapTime': driverData.BestLapTime,
        'Sectors': driverData.Sectors,
        'SectorTimes': driverData.SectorTimes,
        'Sector1Time': driverData.Sector1Time,
        'Sector2Time': driverData.Sector2Time,
        'Sector3Time': driverData.Sector3Time,
        'Tyres': driverData.Tyres,
        'TyreCompound': driverData.TyreCompound,
        'TyreStint': driverData.TyreStint,
        'PitStops': driverData.PitStops,
        'DiffToLeader': driverData.DiffToLeader,
        'GapToLeader': driverData.GapToLeader,
        'DiffToAhead': driverData.DiffToAhead,
        'IntervalToPositionAhead': driverData.IntervalToPositionAhead
      })

      // Extract tire information from multiple possible fields
      // First try TimingData, then CarData cache
      const carData = carDataCache[driverNumber]
      
      // Comprehensive tire compound extraction
      const tireCompound = driverData.Tyres?.Compound || 
                          driverData.TyreCompound || 
                          driverData.Compound ||
                          carData?.Tyres?.Compound || 
                          carData?.TyreCompound || 
                          carData?.Compound
      
      let currentTire = "?" // Default fallback - show unknown instead of assuming
      
      // Try to extract tire from compound
      if (tireCompound) {
        if (typeof tireCompound === 'string') {
          currentTire = tireCompound.charAt(0).toUpperCase()
        } else if (tireCompound && typeof tireCompound === 'object') {
          if (tireCompound.Value) {
            currentTire = tireCompound.Value.charAt(0).toUpperCase()
          } else if (tireCompound.Compound) {
            currentTire = tireCompound.Compound.charAt(0).toUpperCase()
          }
        }
      }
      
      // If we still don't have a valid tire, try to extract from other fields
      if (currentTire === "?" && !tireCompound) {
        // Try to find tire info in other possible fields from both TimingData and CarData
        const alternativeTire = driverData.TyreType || 
                              driverData.TireType || 
                              driverData.Tyre || 
                              driverData.Tire ||
                              carData?.TyreType || 
                              carData?.TireType || 
                              carData?.Tyre || 
                              carData?.Tire
        if (alternativeTire && typeof alternativeTire === 'string') {
          currentTire = alternativeTire.charAt(0).toUpperCase()
        }
      }
      
      // Additional fallback: check for tire info in Tyres object
      if (currentTire === "?" && driverData.Tyres) {
        if (driverData.Tyres.Type) {
          currentTire = driverData.Tyres.Type.charAt(0).toUpperCase()
        } else if (driverData.Tyres.Compound) {
          currentTire = driverData.Tyres.Compound.charAt(0).toUpperCase()
        }
      }
      
      // Additional fallback: check CarData Tyres object
      if (currentTire === "?" && carData?.Tyres) {
        if (carData.Tyres.Type) {
          currentTire = carData.Tyres.Type.charAt(0).toUpperCase()
        } else if (carData.Tyres.Compound) {
          currentTire = carData.Tyres.Compound.charAt(0).toUpperCase()
        }
      }
      
      const tireStint = driverData.Tyres?.Stint || driverData.TyreStint || driverData.Stint || driverData.NumberOfLaps || 1
      const pitStops = driverData.NumberOfPitStops || driverData.PitStops || driverData.PitStopCount || 0
      const currentLap = driverData.NumberOfLaps || 0
      
      // If no tire data is available, show empty or unknown
      if (currentTire === "M" && !tireCompound) {
        currentTire = "?" // Show unknown instead of inventing data
        console.log(`🏎️ Driver ${driverNumber} NO TIRE DATA AVAILABLE - showing unknown (position ${position}, pitStops: ${pitStops}, laps: ${currentLap})`)
      }
      
      // Extract gap information - for leader, gap should be empty
      const isLeader = position === 1
      
      let finalGapValue = ""
      let finalGapTimeValue = ""
      
      if (!isLeader && driverData.Stats && driverData.Stats.length > 0) {
        // Use the LAST element of Stats array (most recent/current data)
        const stats = driverData.Stats[driverData.Stats.length - 1]
        if (stats.TimeDiffToFastest && stats.TimeDiffToFastest !== "") {
          finalGapTimeValue = stats.TimeDiffToFastest  // Gap acumulativo va abajo
        }
        if (stats.TimeDifftoPositionAhead && stats.TimeDifftoPositionAhead !== "") {
          finalGapValue = stats.TimeDifftoPositionAhead  // Gap individual va arriba
        }
      }
      
      // Fallback to other gap fields if Stats is not available
      if (finalGapValue === "" && !isLeader) {
        const gapFromFields = extractStringValue(driverData.DiffToAhead || driverData.IntervalToPositionAhead || driverData.Interval, "")
        finalGapValue = gapFromFields !== "" ? gapFromFields : "0.000"
      }
      if (finalGapTimeValue === "" && !isLeader) {
        const gapTimeFromFields = extractStringValue(driverData.DiffToLeader || driverData.GapToLeader || driverData.Gap, "")
        finalGapTimeValue = gapTimeFromFields !== "" ? gapTimeFromFields : "0.000"
      }
      
      // For leader, show empty gaps
      if (isLeader) {
        finalGapValue = "--- ---"
        finalGapTimeValue = "0.000"
      }
      const driverCode = driverData.RacingNumber || driverData.DriverNumber || driverNumber
      
      console.log(`🏎️ Driver ${driverNumber} tire info:`, {
        compound: tireCompound,
        currentTire,
        stint: tireStint,
        pitStops,
        currentLap,
        tyresObject: driverData.Tyres,
        rawTireData: {
          'Tyres': driverData.Tyres,
          'TyreCompound': driverData.TyreCompound,
          'Compound': driverData.Compound,
          'TyreType': driverData.TyreType,
          'TireType': driverData.TireType,
          'Tyre': driverData.Tyre,
          'Tire': driverData.Tire
        },
        carDataTireFields: carData ? {
          'Tyres': carData.Tyres,
          'TyreCompound': carData.TyreCompound,
          'Compound': carData.Compound,
          'TyreType': carData.TyreType,
          'TireType': carData.TireType,
          'Tyre': carData.Tyre,
          'Tire': carData.Tire
        } : 'no carData',
        allTireFields: {
          Tyres: driverData.Tyres,
          TyreCompound: driverData.TyreCompound,
          Compound: driverData.Compound,
          TyreStint: driverData.TyreStint,
          Stint: driverData.Stint,
          PitStops: driverData.PitStops,
          PitStopCount: driverData.PitStopCount,
          NumberOfLaps: driverData.NumberOfLaps,
          NumberOfPitStops: driverData.NumberOfPitStops
        },
        tireExtraction: {
          'driverData.Tyres?.Compound': driverData.Tyres?.Compound,
          'driverData.TyreCompound': driverData.TyreCompound,
          'driverData.Compound': driverData.Compound,
          'driverData.TyreType': driverData.TyreType,
          'driverData.TireType': driverData.TireType,
          'driverData.Tyre': driverData.Tyre,
          'driverData.Tire': driverData.Tire,
          'carData?.Tyres?.Compound': carData?.Tyres?.Compound,
          'carData?.TyreCompound': carData?.TyreCompound,
          'carData?.Compound': carData?.Compound,
          'carData?.TyreType': carData?.TyreType,
          'carData?.TireType': carData?.TireType,
          'carData?.Tyre': carData?.Tyre,
          'carData?.Tire': carData?.Tire
        }
      })

      console.log(`🏎️ Driver ${driverNumber} gap info:`, {
        position,
        isLeader,
        finalGapValue,
        finalGapTimeValue,
        allStats: driverData.Stats,
        usingStatsIndex: driverData.Stats ? driverData.Stats.length - 1 : -1,
        selectedStats: driverData.Stats ? driverData.Stats[driverData.Stats.length - 1] : null,
        rawGap: driverData.DiffToLeader || driverData.GapToLeader || driverData.Gap,
        rawGapTime: driverData.DiffToAhead || driverData.IntervalToPositionAhead || driverData.Interval,
        allGapFields: {
          DiffToLeader: driverData.DiffToLeader,
          GapToLeader: driverData.GapToLeader,
          Gap: driverData.Gap,
          DiffToAhead: driverData.DiffToAhead,
          IntervalToPositionAhead: driverData.IntervalToPositionAhead,
          Interval: driverData.Interval
        },
        expectedFromImage: position === 1 ? "--- ---" : 
                          position === 2 ? "+0.478" : 
                          position === 3 ? "+0.112" : 
                          position === 4 ? "+0.010" : 
                          position === 5 ? "+0.353" : 
                          position === 6 ? "+0.073" : 
                          position === 7 ? "+0.096" : "unknown"
      })

      console.log(`🏎️ Driver ${driverNumber} lap time info:`, {
        lapTime: driverData.LastLapTime?.Value || driverData.LapTime || driverData.CurrentLapTime,
        prevLap: driverData.BestLapTime?.Value || driverData.PersonalBest,
        rawLastLapTime: driverData.LastLapTime,
        rawBestLapTime: driverData.BestLapTime,
        isBestLapTime: !!driverData.BestLapTime?.Value,
        isLastLapTime: !!driverData.LastLapTime?.Value,
        displayOrder: "Current lap (top) -> Best lap (bottom, purple)"
      })

      console.log(`🏎️ Driver ${driverNumber} sector info:`, {
        sectors: driverData.Sectors,
        sector1: {
          current: driverData.Sectors?.[0]?.Value,
          previous: driverData.Sectors?.[0]?.PreviousValue,
          extracted: extractSectorTime(driverData.Sectors?.[0]?.Value || driverData.Sector1Time || driverData.SectorTimes?.[0], ""),
          segments: driverData.Sectors?.[0]?.Segments,
          personalFastest: driverData.Sectors?.[0]?.PersonalFastest,
          overallFastest: driverData.Sectors?.[0]?.OverallFastest
        },
        sector2: {
          current: driverData.Sectors?.[1]?.Value,
          previous: driverData.Sectors?.[1]?.PreviousValue,
          extracted: extractSectorTime(driverData.Sectors?.[1]?.Value || driverData.Sector2Time || driverData.SectorTimes?.[1], ""),
          segments: driverData.Sectors?.[1]?.Segments,
          personalFastest: driverData.Sectors?.[1]?.PersonalFastest,
          overallFastest: driverData.Sectors?.[1]?.OverallFastest
        },
        sector3: {
          current: driverData.Sectors?.[2]?.Value,
          previous: driverData.Sectors?.[2]?.PreviousValue,
          extracted: extractSectorTime(driverData.Sectors?.[2]?.Value || driverData.Sector3Time || driverData.SectorTimes?.[2], ""),
          segments: driverData.Sectors?.[2]?.Segments,
          personalFastest: driverData.Sectors?.[2]?.PersonalFastest,
          overallFastest: driverData.Sectors?.[2]?.OverallFastest
        },
        allSectorFields: {
          Sector1Time: driverData.Sector1Time,
          Sector2Time: driverData.Sector2Time,
          Sector3Time: driverData.Sector3Time,
          SectorTimes: driverData.SectorTimes
        }
      })
      
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

      // Map of known driver numbers to abbreviations (exactly as shown in the image)
      const driverNumberToName: Record<string, string> = {
        "1": "VER",
        "4": "NOR",
        "5": "BOR",
        "6": "HAD",
        "10": "GAS",
        "12": "ANT",
        "14": "ALO",
        "16": "LEC",
        "18": "STR",
        "22": "TSU",
        "23": "ALB",
        "27": "HUL",
        "30": "LAW",
        "31": "OCO",
        "43": "COL",
        "44": "HAM",
        "55": "SAI",
        "63": "RUS",
        "81": "PIA",
        "87": "BEA"
      }

      // Map of driver numbers to their teams (2025 season)
      const driverNumberToTeam: Record<string, string> = {
        "1": "Red Bull",      // VER
        "4": "McLaren",       // NOR
        "5": "Kick Sauber",   // BOR
        "6": "RB",            // HAD
        "10": "Alpine",       // GAS
        "12": "Mercedes",     // ANT
        "14": "Aston Martin", // ALO
        "16": "Ferrari",      // LEC
        "18": "Aston Martin", // STR
        "22": "Red Bull",     // TSU
        "23": "Williams",     // ALB
        "27": "Haas",         // HUL
        "30": "RB",           // LAW
        "31": "Kick Sauber",  // OCO
        "43": "Alpine",       // COL
        "44": "Ferrari",      // HAM
        "55": "Williams",     // SAI
        "63": "Mercedes",     // RUS
        "81": "McLaren",      // PIA
        "87": "Haas"          // BEA
      }

      // Extract driver name with better fallback - prioritize our mapping
      const extractedName = driverNumberToName[driverNumber] ||
                           driverData.DriverName || 
                           driverData.FullName || 
                           driverData.Name || 
                           driverData.DisplayName ||
                           driverData.Abbreviation ||
                           (driverData.FirstName && driverData.LastName ? `${driverData.FirstName} ${driverData.LastName}` : null) ||
                           driverData.ShortName ||
                           `Driver ${driverNumber}`

      const extractedTeam = driverNumberToTeam[driverNumber] || 
                           driverData.Team || 
                           driverData.TeamName || 
                           driverData.Constructor || 
                           "Unknown"
      
      console.log(`🏎️ Driver ${driverNumber} data extraction:`, {
        'DriverNumber': driverNumber,
        'Mapped Name': driverNumberToName[driverNumber],
        'Final Name': extractedName,
        'Mapped Team': driverNumberToTeam[driverNumber],
        'Team Raw Data': {
          'Team': driverData.Team,
          'TeamName': driverData.TeamName,
          'Constructor': driverData.Constructor
        },
        'Final Team': extractedTeam,
        'Sectors Raw Data': {
          'Sector1': driverData.Sectors?.[0]?.Value,
          'Sector1Prev': driverData.Sectors?.[0]?.PreviousValue,
          'Sector2': driverData.Sectors?.[1]?.Value,
          'Sector2Prev': driverData.Sectors?.[1]?.PreviousValue,
          'Sector3': driverData.Sectors?.[2]?.Value,
          'Sector3Prev': driverData.Sectors?.[2]?.PreviousValue
        }
      })

      // Log the final driver object to see what's being passed to the component
      console.log(`🎨 Driver ${driverNumber} final object:`, {
        'name': extractedName,
        'team': extractedTeam,
        'pos': position,
        'inPit': driverData.InPit,
        'retired': driverData.Retired,
        'knockedOut': driverData.KnockedOut,
        'stopped': driverData.Stopped,
        'status': driverData.Status,
        'sector1Color': driverData.Sectors?.[0]?.OverallFastest ? "purple" : 
                       driverData.Sectors?.[0]?.PersonalFastest ? "green" : 
                       driverData.Sectors?.[0]?.Value && driverData.Sectors?.[0]?.PreviousValue && 
                       parseFloat(driverData.Sectors[0].Value) < parseFloat(driverData.Sectors[0].PreviousValue) ? "yellow" : "white",
        'sector2Color': driverData.Sectors?.[1]?.OverallFastest ? "purple" : 
                       driverData.Sectors?.[1]?.PersonalFastest ? "green" : 
                       driverData.Sectors?.[1]?.Value && driverData.Sectors?.[1]?.PreviousValue && 
                       parseFloat(driverData.Sectors[1].Value) < parseFloat(driverData.Sectors[1].PreviousValue) ? "yellow" : "white",
        'sector3Color': driverData.Sectors?.[2]?.OverallFastest ? "purple" : 
                       driverData.Sectors?.[2]?.PersonalFastest ? "green" : 
                       driverData.Sectors?.[2]?.Value && driverData.Sectors?.[2]?.PreviousValue && 
                       parseFloat(driverData.Sectors[2].Value) < parseFloat(driverData.Sectors[2].PreviousValue) ? "yellow" : "white",
        'lapTimeColor': driverData.LastLapTime?.OverallFastest ? "purple" : 
                       driverData.LastLapTime?.PersonalFastest ? "green" : 
                       driverData.LastLapTime?.Value && driverData.BestLapTime?.Value && 
                       parseFloat(driverData.LastLapTime.Value.replace(':', '.')) < parseFloat(driverData.BestLapTime.Value.replace(':', '.')) ? "yellow" : "white"
      })

      const driver: F1Driver = {
        pos: position,
        code: driverData.RacingNumber || driverNumber,
        name: extractedName,
        racingNumber: driverData.RacingNumber || driverNumber,
        color: driverColors[position - 1] || "bg-gray-500",
        tire: currentTire,
        stint: String(tireStint),
        change: "0",
        drs: driverData.DRS || false,
        inPit: driverData.InPit || false,
        retired: driverData.Retired || driverData.KnockedOut || driverData.Stopped || false,
        isFastestLap: false, // Will be updated later
        isPersonalBest: false, // Will be updated later
        gap: finalGapValue,
        gapTime: finalGapTimeValue,
        lapTime: extractStringValue(driverData.LastLapTime?.Value || driverData.LapTime || driverData.CurrentLapTime, "0.000"),
        prevLap: extractStringValue(driverData.BestLapTime?.Value || driverData.PersonalBest, "0.000"),
        sector1: extractSectorTime(driverData.Sectors?.[0]?.Value || driverData.Sector1Time || driverData.SectorTimes?.[0], ""),
        sector1Prev: extractSectorTime(driverData.Sectors?.[0]?.PreviousValue || driverData.Sector1Time || driverData.SectorTimes?.[0], ""),
        sector2: extractSectorTime(driverData.Sectors?.[1]?.Value || driverData.Sector2Time || driverData.SectorTimes?.[1], ""),
        sector2Prev: extractSectorTime(driverData.Sectors?.[1]?.PreviousValue || driverData.Sector2Time || driverData.SectorTimes?.[1], ""),
        sector3: extractSectorTime(driverData.Sectors?.[2]?.Value || driverData.Sectors?.[2]?.PreviousValue || driverData.Sector3Time || driverData.SectorTimes?.[2], ""),
        sector3Prev: extractSectorTime(driverData.Sectors?.[2]?.PreviousValue || driverData.Sector3Time || driverData.SectorTimes?.[2], ""),
          sector1Color: driverData.Sectors?.[0]?.OverallFastest ? "purple" : 
                       driverData.Sectors?.[0]?.PersonalFastest ? "green" : 
                       driverData.Sectors?.[0]?.Value && driverData.Sectors?.[0]?.PreviousValue && 
                       parseFloat(driverData.Sectors[0].Value) < parseFloat(driverData.Sectors[0].PreviousValue) ? "yellow" : "white",
          sector2Color: driverData.Sectors?.[1]?.OverallFastest ? "purple" : 
                       driverData.Sectors?.[1]?.PersonalFastest ? "green" : 
                       driverData.Sectors?.[1]?.Value && driverData.Sectors?.[1]?.PreviousValue && 
                       parseFloat(driverData.Sectors[1].Value) < parseFloat(driverData.Sectors[1].PreviousValue) ? "yellow" : "white",
          sector3Color: driverData.Sectors?.[2]?.OverallFastest ? "purple" : 
                       driverData.Sectors?.[2]?.PersonalFastest ? "green" : 
                       driverData.Sectors?.[2]?.Value && driverData.Sectors?.[2]?.PreviousValue && 
                       parseFloat(driverData.Sectors[2].Value) < parseFloat(driverData.Sectors[2].PreviousValue) ? "yellow" : "white",
          lapTimeColor: driverData.LastLapTime?.OverallFastest ? "purple" : 
                       driverData.LastLapTime?.PersonalFastest ? "green" : 
                       driverData.LastLapTime?.Value && driverData.BestLapTime?.Value && 
                       parseFloat(driverData.LastLapTime.Value.replace(':', '.')) < parseFloat(driverData.BestLapTime.Value.replace(':', '.')) ? "yellow" : "white",
          gapColor: "text-white",
          gapTimeColor: "text-white",
          team: extractedTeam,
          tyresHistory: driversTyreHistory[driverCode] || [],
          pitStops: pitStops,
          positionsGained: driverData.PositionsGained || 0,
          sector1Segments: (() => {
            const segments = driverData.Sectors?.[0]?.Segments || []
            console.log(`🔍 Driver ${driverNumber} Sector 1 Segments:`, segments)
            return segments
          })(),
          sector2Segments: (() => {
            const segments = driverData.Sectors?.[1]?.Segments || []
            console.log(`🔍 Driver ${driverNumber} Sector 2 Segments:`, segments)
            return segments
          })(),
          sector3Segments: (() => {
            const segments = driverData.Sectors?.[2]?.Segments || []
            console.log(`🔍 Driver ${driverNumber} Sector 3 Segments:`, segments)
            return segments
          })()
      }

      // Debug logging for lap times
      console.log(`🏎️ Driver ${driver.code} lap times: LastLapTime="${driver.lapTime}", BestLapTime="${driver.prevLap}"`)

      updatedDrivers.push(driver)
      console.log(`🏎️ Added driver ${position}: ${driver.name} (${driver.code}) - ${driver.lapTime}`)
    })

    console.log(`🏎️ Total drivers updated: ${updatedDrivers.length}`)
    
    // Find the driver with the fastest lap time in current session
    let currentFastestDriverCode: string | null = null
    let currentFastestTime = Infinity
    
    updatedDrivers.forEach(driver => {
      // Check both LastLapTime (current) and BestLapTime (best) to find the absolute fastest
      let bestTimeMs = Infinity
      let currentTimeMs = Infinity
      
      // Convert BestLapTime (prevLap)
      if (driver.prevLap && driver.prevLap !== "0.000" && driver.prevLap !== "--:--.---") {
        if (driver.prevLap.includes(':')) {
          const [minutes, seconds] = driver.prevLap.split(':')
          bestTimeMs = (parseFloat(minutes) * 60 + parseFloat(seconds)) * 1000
        } else {
          bestTimeMs = parseFloat(driver.prevLap) * 1000
        }
      }
      
      // Convert LastLapTime (current)
      if (driver.lapTime && driver.lapTime !== "0.000" && driver.lapTime !== "--:--.---") {
        if (driver.lapTime.includes(':')) {
          const [minutes, seconds] = driver.lapTime.split(':')
          currentTimeMs = (parseFloat(minutes) * 60 + parseFloat(seconds)) * 1000
        } else {
          currentTimeMs = parseFloat(driver.lapTime) * 1000
        }
      }
      
      // Find the fastest time for this driver (either current or best)
      const driverFastestTime = Math.min(bestTimeMs, currentTimeMs)
      
      console.log(`🏎️ Driver ${driver.code} times: current="${driver.lapTime}" (${currentTimeMs}ms), best="${driver.prevLap}" (${bestTimeMs}ms), fastest=${driverFastestTime}ms`)
      
      if (!isNaN(driverFastestTime) && driverFastestTime < currentFastestTime) {
        currentFastestTime = driverFastestTime
        currentFastestDriverCode = driver.code
        console.log(`🏎️ New current fastest: ${driver.code} with ${driverFastestTime}ms`)
      }
    })
    
    // Always update the fastest lap for current session (even if no historical data)
    if (currentFastestDriverCode && currentFastestTime < Infinity) {
      // Find the team and name for the fastest lap driver
      const fastestDriver = updatedDrivers.find(driver => driver.code === currentFastestDriverCode)
      const fastestTeam = fastestDriver?.team || null
      const fastestDriverName = fastestDriver?.name || null
      
      setFastestLapTime(currentFastestTime)
      setFastestLapDriver(currentFastestDriverCode)
      setFastestLapTeam(fastestTeam)
      setFastestLapDriverName(fastestDriverName)
      console.log(`🏎️ FASTEST LAP OF SESSION: ${currentFastestDriverCode} (${fastestDriverName}) - ${fastestTeam} with ${currentFastestTime}ms`)
    } else {
      console.log(`🏎️ NO FASTEST LAP FOUND - currentFastestDriverCode: ${currentFastestDriverCode}, currentFastestTime: ${currentFastestTime}`)
    }
    
    // Mark drivers with fastest lap and personal best logic
    const driversWithFastestLap = updatedDrivers.map(driver => {
      // Check if this driver's best time (prevLap) is the fastest of the session
      let driverBestTimeMs = Infinity
      if (driver.prevLap && driver.prevLap !== "0.000" && driver.prevLap !== "--:--.---") {
        if (driver.prevLap.includes(':')) {
          const [minutes, seconds] = driver.prevLap.split(':')
          driverBestTimeMs = (parseFloat(minutes) * 60 + parseFloat(seconds)) * 1000
        } else {
          driverBestTimeMs = parseFloat(driver.prevLap) * 1000
        }
      }
      
      // Check if current lap (lapTime) is the personal best for this driver
      let currentLapTimeMs = Infinity
      if (driver.lapTime && driver.lapTime !== "0.000" && driver.lapTime !== "--:--.---") {
        if (driver.lapTime.includes(':')) {
          const [minutes, seconds] = driver.lapTime.split(':')
          currentLapTimeMs = (parseFloat(minutes) * 60 + parseFloat(seconds)) * 1000
        } else {
          currentLapTimeMs = parseFloat(driver.lapTime) * 1000
        }
      }
      
      const isFastestLap = !isNaN(driverBestTimeMs) && driverBestTimeMs === currentFastestTime
      
      // Check if current lap is personal best (with tolerance for floating point precision)
      const timeDifference = Math.abs(currentLapTimeMs - driverBestTimeMs)
      const isPersonalBest = !isNaN(currentLapTimeMs) && !isNaN(driverBestTimeMs) && timeDifference < 10 // 10ms tolerance
      
      console.log(`🏎️ Driver ${driver.code} personal best check: current="${driver.lapTime}" (${currentLapTimeMs}ms), best="${driver.prevLap}" (${driverBestTimeMs}ms), diff=${timeDifference}ms, isPersonalBest=${isPersonalBest}`)
      
      return {
        ...driver,
        isFastestLap,
        isPersonalBest
      }
    })
    
    console.log(`🏎️ Drivers with fastest lap marked:`, driversWithFastestLap.map(d => ({ code: d.code, isFastestLap: d.isFastestLap, prevLap: d.prevLap })))
    
    setDrivers(driversWithFastestLap)
    
    // Only set active session if we actually have drivers
    if (updatedDrivers.length > 0) {
      setHasActiveSession(true)
      console.log("✅ Active session confirmed - drivers data processed")
    } else {
      console.log("⚠️ No drivers in updateDriverData - not setting active session")
    }
  }

  const updateSessionInfo = (sessionData: any) => {
    console.log("🔄 Updating session info with:", sessionData)
    
    // Reset fastest lap when starting a new session
    const sessionName = sessionData.Name || sessionData.name || "Unknown Session"
    const sessionType = sessionData.Type || sessionData.type || "Unknown"
    
    // Reset fastest lap for qualifying sessions or when session changes
    if (sessionType.toLowerCase().includes('qualifying') || sessionType.toLowerCase().includes('race')) {
      setFastestLapTime(Infinity)
      setFastestLapDriver(null)
      setFastestLapTeam(null)
      setFastestLapDriverName(null)
      console.log("🔄 Reset fastest lap for new session:", sessionName)
    }
    
    const sessionStatus = sessionData.Status || sessionData.status || "Unknown"
    const sessionPhase = sessionData.Phase || sessionData.phase || "Unknown"
    
    console.log("🔄 Session details:")
    console.log("  - Name:", sessionName)
    console.log("  - Type:", sessionType)
    console.log("  - Status:", sessionStatus)
    console.log("  - Phase:", sessionPhase)

    // Crear un nombre más descriptivo para la sesión
    let displayName = sessionName
    if (sessionType && sessionType !== "Unknown" && sessionType !== "No type") {
      displayName = `${sessionName} - ${sessionType}`
    } else if (sessionName === "Unknown Session" || sessionName === "F1 Live Timing") {
      // Si no tenemos información específica, mostrar que estamos conectados
      displayName = "F1 Live Timing - Connected"
    }
    
    // Crear un estado más descriptivo
    let displayStatus = sessionStatus
    if (sessionPhase && sessionPhase !== "Unknown" && sessionPhase !== "No phase") {
      displayStatus = `${sessionStatus} (${sessionPhase})`
    } else if (sessionStatus === "Unknown" || sessionStatus === "No status") {
      displayStatus = "Connected"
    }

    setSessionInfo(prev => ({
      ...prev,
      raceName: displayName,
      trackStatus: displayStatus,
      lapInfo: sessionData.CurrentLap ? `${sessionData.CurrentLap} / ${sessionData.TotalLaps || '--'}` : prev.lapInfo
    }))
    
    console.log("✅ Session info updated:", displayName, displayStatus)
  }

  const updateTrackStatus = (trackData: any) => {
    setSessionInfo(prev => ({
        ...prev,
      trackStatus: trackData.Status || prev.trackStatus
    }))
  }

  const updateWeatherData = (weatherData: any) => {
    console.log("🌤️ COMPLETE weather data structure:", JSON.stringify(weatherData, null, 2))
    console.log("🌤️ TrackTemp:", weatherData.TrackTemp)
    console.log("🌤️ AirTemp:", weatherData.AirTemp)
    console.log("🌤️ Humidity:", weatherData.Humidity)
    console.log("🌤️ WindSpeed:", weatherData.WindSpeed)
    console.log("🌤️ WindDirection:", weatherData.WindDirection)
    console.log("🌤️ Rainfall:", weatherData.Rainfall)

    setSessionInfo(prev => ({
      ...prev,
      weather: {
        track: parseFloat(weatherData.TrackTemp) || prev.weather.track,
        air: parseFloat(weatherData.AirTemp) || prev.weather.air,
        humidity: parseFloat(weatherData.Humidity) || prev.weather.humidity,
        condition: weatherData.Rainfall === "1" ? "rain" : "clear",
        windSpeed: parseFloat(weatherData.WindSpeed) || prev.weather.windSpeed,
        windDirection: parseFloat(weatherData.WindDirection) || prev.weather.windDirection,
        pressure: parseFloat(weatherData.Pressure) || prev.weather.pressure
      }
    }))
  }

  const updateLapCount = (lapData: any) => {
    setSessionInfo(prev => ({
      ...prev,
      lapInfo: `${lapData.CurrentLap || 0} / ${lapData.TotalLaps || 0}`
    }))
  }

  const reconnect = () => {
    connectToF1SignalR()
  }

  const forceActiveSession = () => {
    console.log("🎯 Forcing active session detection...")
    setHasActiveSession(true)
    setConnectionWorking(true)
    setIsConnected(true)
  }

  // Auto-connect on mount
  useEffect(() => {
    connectToF1SignalR()
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [])

  return {
    drivers,
    sessionInfo,
    isConnected,
    error,
    hasActiveSession,
    fastestLapDriver,
    fastestLapTime: fastestLapTime === Infinity ? null : fastestLapTime.toString(),
    fastestLapTeam,
    fastestLapDriverName,
    reconnect,
    forceActiveSession
  }
}
