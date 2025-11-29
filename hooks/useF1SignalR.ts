
"use client"

import { useState, useEffect, useRef, useMemo } from "react"

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
  drsEligible?: boolean
  drsZone?: boolean
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
  interval?: string
  topSpeed?: string
  bestLapTime?: string
  pitCount?: number
  isInEliminationZone?: boolean
  currentSector?: number
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
  drsEnabled: boolean
}

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

export interface TeamRadioMessage {
  utc: string
  racingNumber: string
  driverCode: string
  teamColor: string
  audioUrl: string
  transcript?: string
  raw?: any
}

export interface RaceControlMessage {
  utc: string
  message: string
  category: string
  flag?: string
  lap?: number
}

export const useF1SignalR = () => {
  const [drivers, setDrivers] = useState<F1Driver[]>([])
  const [raceControlMessages, setRaceControlMessages] = useState<RaceControlMessage[]>([])
  const [sessionInfo, setSessionInfo] = useState<F1SessionInfo>({
    raceName: "F1 Live Timing",
    flag: "🏁",
    timer: "00:00:00",
    weather: { track: 0, air: 0, humidity: 0, condition: "unknown", windSpeed: 0, windDirection: 0, pressure: 0 },
    lapInfo: "-- / --",
    trackStatus: "No Active Session",
    drsEnabled: true
  })
  const [driversTyreHistory, setDriversTyreHistory] = useState<Record<string, string[]>>({})
  const [isConnected, setIsConnected] = useState(false)
  const [hasActiveSession, setHasActiveSession] = useState(false)
  const [sessionPath, setSessionPath] = useState<string>("")
  const [connectionWorking, setConnectionWorking] = useState(false)
  
  // Ref to access latest drivers state inside callbacks
  const driversRef = useRef<F1Driver[]>([])
  
  // Update ref whenever drivers state changes
  useEffect(() => {
    driversRef.current = drivers
  }, [drivers])
  const [error, setError] = useState<string | null>(null)
  const [preventReconnect, setPreventReconnect] = useState(false)
  // Fastest lap state derived from drivers list now

  const [carDataCache, setCarDataCache] = useState<Record<string, any>>({})
  
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const sessionTypeRef = useRef<string>("Unknown") // Track session type for interval calculation logic
  const sessionNameRef = useRef<string>("Unknown") // Track session name for elimination zone logic
  const messageTimeoutRef = useRef<number | null>(null)

  const [teamRadioMessages, setTeamRadioMessages] = useState<TeamRadioMessage[]>([])

  const driverColors = [
    "bg-orange-500",
    "bg-orange-400",
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
      
      // Test basic connectivity removed to avoid CORS errors in production
      // console.log("🌐 Testing basic connectivity...")

      
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
      const timestamp = new Date().getTime()
      
      // Use local proxy to avoid CORS/403 issues
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const host = window.location.host
      const wsUrl = `${protocol}//${host}/f1-ws/connect?transport=webSockets&clientProtocol=1.5&connectionToken=${encodeURIComponent(negotiateData.ConnectionToken)}&connectionData=${connectionData}&_=${timestamp}`
      
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

  function handleInitialData(initialData: any) {
    console.log("🎯 Processing initial data:", initialData)
    console.log("🎯 Initial data keys:", Object.keys(initialData))
    if (initialData.TeamRadio) {
       console.log("🎯 Initial TeamRadio found:", initialData.TeamRadio)
    } else {
       console.log("🎯 Initial TeamRadio NOT found in keys:", Object.keys(initialData))
    }
    
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

    // Process initial RaceControlMessages
    if (initialData.RaceControlMessages && initialData.RaceControlMessages.Messages) {
        const messages = initialData.RaceControlMessages.Messages.map((msg: any) => ({
            utc: msg.Utc,
            message: msg.Message,
            category: msg.Category,
            flag: msg.Flag,
            lap: msg.Lap
        }))
        setRaceControlMessages(messages)
    }

    // Process initial TeamRadio data
    if (initialData.TeamRadio && initialData.TeamRadio.Captures && Array.isArray(initialData.TeamRadio.Captures)) {
      console.log("🎯 Initial TeamRadio data:", initialData.TeamRadio)
      
      const newMessages: TeamRadioMessage[] = initialData.TeamRadio.Captures.map((capture: any) => {
        const racingNumber = capture.RacingNumber
        let driverCode = driverNumberToName[racingNumber] || racingNumber
        
        let teamColor = "#374151" // gray-700 hex
        
        // Try to find driver in current drivers list (using ref to avoid stale closure)
        // Note: In handleInitialData, drivers might be empty if this runs first
        const driver = driversRef.current.find(d => d.racingNumber === racingNumber)

        if (driver) {
            driverCode = driver.code || driverCode
            
            // Map team name to hex colors
            if (driver.team) {
                const team = driver.team.toLowerCase()
                if (team.includes("red bull")) teamColor = "#3671C6"
                else if (team.includes("mclaren")) teamColor = "#FF8000"
                else if (team.includes("ferrari")) teamColor = "#E80020"
                else if (team.includes("mercedes")) teamColor = "#27F4D2"
                else if (team.includes("aston")) teamColor = "#229971"
                else if (team.includes("alpine")) teamColor = "#FF87BC"
                else if (team.includes("williams")) teamColor = "#64C4FF"
                else if (team.includes("rb")) teamColor = "#6692FF"
                else if (team.includes("sauber") || team.includes("kick")) teamColor = "#52E252"
                else if (team.includes("haas")) teamColor = "#B6BABD"
            }
        } else {
            // Fallback to static map
            const team = driverNumberToTeam[racingNumber]
            if (team) {
               if (team === "Red Bull") teamColor = "#3671C6"
               else if (team === "McLaren") teamColor = "#FF8000"
               else if (team === "Ferrari") teamColor = "#E80020"
               else if (team === "Mercedes") teamColor = "#27F4D2"
               else if (team === "Aston Martin") teamColor = "#229971"
               else if (team === "Alpine") teamColor = "#FF87BC"
               else if (team === "Williams") teamColor = "#64C4FF"
               else if (team === "RB") teamColor = "#6692FF"
               else if (team === "Kick Sauber") teamColor = "#52E252"
               else if (team === "Haas") teamColor = "#B6BABD"
            }
        }

        return {
          utc: capture.Utc,
          racingNumber: racingNumber,
          driverCode: driverCode,
          teamColor: teamColor,
          audioUrl: `/api/f1/audio?path=${encodeURIComponent(initialData.SessionInfo?.Path || sessionPath || '')}${encodeURIComponent(capture.Path)}`,
          transcript: capture.Transcript || capture.Text || undefined,
          raw: capture
        }
      })

      // Sort by UTC descending (newest first)
      newMessages.sort((a, b) => new Date(b.utc).getTime() - new Date(a.utc).getTime())

      setTeamRadioMessages(newMessages.slice(0, 20))
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

  function handleF1Data(data: any) {
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
        case "TeamRadio":
          console.log("📻 TeamRadio message received:", messageData)
          if (messageData && messageData.Captures) {
             const newMessages: TeamRadioMessage[] = messageData.Captures.map((capture: any) => {
                const racingNumber = capture.RacingNumber
                let driverCode = driverNumberToName[racingNumber] || racingNumber
                let teamColor = "#374151" // gray-700 hex

                // Try to find driver in current drivers list
                const driver = driversRef.current.find(d => d.racingNumber === racingNumber)
                if (driver) {
                    driverCode = driver.code || driverCode
                    if (driver.team) {
                        const team = driver.team.toLowerCase()
                        if (team.includes("red bull")) teamColor = "#3671C6"
                        else if (team.includes("mclaren")) teamColor = "#FF8000"
                        else if (team.includes("ferrari")) teamColor = "#E80020"
                        else if (team.includes("mercedes")) teamColor = "#27F4D2"
                        else if (team.includes("aston")) teamColor = "#229971"
                        else if (team.includes("alpine")) teamColor = "#FF87BC"
                        else if (team.includes("williams")) teamColor = "#64C4FF"
                        else if (team.includes("rb")) teamColor = "#6692FF"
                        else if (team.includes("sauber") || team.includes("kick")) teamColor = "#52E252"
                        else if (team.includes("haas")) teamColor = "#B6BABD"
                    }
                } else {
                    const team = driverNumberToTeam[racingNumber]
                    if (team) {
                       if (team === "Red Bull") teamColor = "#3671C6"
                       else if (team === "McLaren") teamColor = "#FF8000"
                       else if (team === "Ferrari") teamColor = "#E80020"
                       else if (team === "Mercedes") teamColor = "#27F4D2"
                       else if (team === "Aston Martin") teamColor = "#229971"
                       else if (team === "Alpine") teamColor = "#FF87BC"
                       else if (team === "Williams") teamColor = "#64C4FF"
                       else if (team === "RB") teamColor = "#6692FF"
                       else if (team === "Kick Sauber") teamColor = "#52E252"
                       else if (team === "Haas") teamColor = "#B6BABD"
                    }
                }

                return {
                  utc: capture.Utc,
                  racingNumber: racingNumber,
                  driverCode: driverCode,
                  teamColor: teamColor,
                  audioUrl: `/api/f1/audio?path=${encodeURIComponent(sessionPath || '')}${encodeURIComponent(capture.Path)}`,
                  transcript: capture.Transcript || capture.Text || undefined,
                  raw: capture
                }
             })

             setTeamRadioMessages(prev => {
                const combined = [...newMessages, ...prev]
                // Sort by UTC descending
                combined.sort((a, b) => new Date(b.utc).getTime() - new Date(a.utc).getTime())
                // Keep last 50
                return combined.slice(0, 50)
             })
          }
          break
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
          }
          break
        case "RaceControlMessages":
            if (messageData && messageData.Messages) {
                const newMessages = messageData.Messages.map((msg: any) => ({
                    utc: msg.Utc,
                    message: msg.Message,
                    category: msg.Category,
                    flag: msg.Flag,
                    lap: msg.Lap
                }))
                setRaceControlMessages(prev => [...newMessages, ...prev].slice(0, 50))
            }
            break
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
  function extractStringValue(value: any, defaultValue: string = "0.000"): string {
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
  function extractSectorTime(sectorData: any, defaultValue: string = "0.000"): string {
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

  function updateDriverData(timingData: any) {
    if (!timingData.Lines) return

    console.log("🏎️ Updating driver data with:", timingData)
    const updatedDrivers: F1Driver[] = []

    Object.entries(timingData.Lines).forEach(([driverNumber, driverData]: [string, any]) => {
      if (!driverData) return

      const position = Number.parseInt(driverData.Position) || 0
      // if (position === 0) return // Allow drivers with position 0 (common in practice)

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
      
      // Additional debug logging for tire data
      console.log(`🏎️ Driver ${driverNumber} FINAL TIRE RESULT:`, {
        currentTire,
        tireCompound,
        driverDataTyres: driverData.Tyres,
        driverDataTyreCompound: driverData.TyreCompound,
        carDataTyres: carData?.Tyres,
        allTireFields: {
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
        allTireFieldsExtended: {
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

      // Maps are now defined at the top level

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

      // Determine DRS eligibility based on position and gap
      const isDrsEligible = position > 1 && parseFloat(finalGapValue.replace(/[^\d.-]/g, '')) < 1.0
      const isInDrsZone = driverData.DRSZone || false
      
      const driver: F1Driver = {
        pos: position,
        code: driverNumberToName[driverNumber] || driverNumberToName[String(Number(driverNumber))] || driverData.TLA || driverData.RacingNumber || driverNumber,
        name: extractedName,
        racingNumber: driverData.RacingNumber || driverNumber,
        color: driverColors[position - 1] || "bg-gray-500",
        tire: currentTire,
        stint: String(tireStint),
        change: "0",
        drs: driverData.DRS || false,
        drsEligible: isDrsEligible,
        drsZone: isInDrsZone,
        inPit: driverData.InPit || false,
        retired: driverData.Retired || driverData.KnockedOut || driverData.Stopped || false,
        isFastestLap: false, // Will be updated later
        isPersonalBest: false, // Will be updated later
        gap: finalGapTimeValue, // Distance to leader (GapToLeader)
        gapTime: finalGapTimeValue,
        lapTime: extractStringValue(driverData.LastLapTime?.Value || driverData.LapTime || driverData.CurrentLapTime, "0.000"),
        prevLap: extractStringValue(driverData.BestLapTime?.Value || driverData.PersonalBest, "0.000"),
        sector1: extractSectorTime(driverData.Sectors?.[0]?.Value || driverData.Sector1Time || driverData.SectorTimes?.[0], ""),
        sector1Prev: extractSectorTime(driverData.Sectors?.[0]?.PreviousValue || driverData.Sector1Time || driverData.SectorTimes?.[0], ""),
        sector2: extractSectorTime(driverData.Sectors?.[1]?.Value || driverData.Sector2Time || driverData.SectorTimes?.[1], ""),
        sector2Prev: extractSectorTime(driverData.Sectors?.[1]?.PreviousValue || driverData.Sector2Time || driverData.SectorTimes?.[1], ""),
        sector3: extractSectorTime(driverData.Sectors?.[2]?.Value || driverData.Sectors?.[2]?.PreviousValue || driverData.Sector3Time || driverData.SectorTimes?.[2], ""),
        sector3Prev: extractSectorTime(driverData.Sectors?.[2]?.PreviousValue || driverData.Sector3Time || driverData.SectorTimes?.[2], ""),
          sector1Color: (() => {
             const currentSector = driverData.Sector || 1 // Default to 1 if missing
             // If we are in sector 1, the displayed S1 time is from the PREVIOUS lap, so it should be grey
             if (currentSector === 1) return "text-gray-500"
             
             // Otherwise (Sector 2 or 3), S1 is from CURRENT lap, so color it
             if (driverData.Sectors?.[0]?.OverallFastest) return "purple"
             if (driverData.Sectors?.[0]?.PersonalFastest) return "green"
             // If valid time but not PB/OB, return yellow (slower/no improvement)
             if (driverData.Sectors?.[0]?.Value) return "yellow"
             return "white"
          })(),
          sector2Color: (() => {
             const currentSector = driverData.Sector || 1
             // If we are in sector 1 or 2, the displayed S2 time is from PREVIOUS lap (or not yet set for current), so grey
             if (currentSector === 1 || currentSector === 2) return "text-gray-500"
             
             // Otherwise (Sector 3), S2 is from CURRENT lap
             if (driverData.Sectors?.[1]?.OverallFastest) return "purple"
             if (driverData.Sectors?.[1]?.PersonalFastest) return "green"
             if (driverData.Sectors?.[1]?.Value) return "yellow"
             return "white"
          })(),
          sector3Color: (() => {
             // Sector 3 is ALWAYS from the previous lap (unless we just crossed the line, but then we are in S1)
             // So S3 should generally be colored if it was just completed?
             // Wait, if we are in S1, S3 is the LAST COMPLETED sector.
             // But the user says "start a new lap they should be grey".
             // If I am in S1, I am starting a new lap.
             // So S3 (from previous lap) should be GREY?
             // But usually "Last Sectors" shows the PREVIOUS lap's sectors.
             // If I make them all grey in S1, then I see nothing colored?
             // The user image shows some grey, some colored.
             // Maybe "Last Sectors" means "Current Lap Sectors" + "Previous Lap Sectors if Current not done"?
             // If I am in S1, I have no Current S1. So I show Previous S1 (Grey).
             // If I am in S2, I have Current S1 (Colored). Previous S2 (Grey).
             // If I am in S3, I have Current S1 (Colored), Current S2 (Colored). Previous S3 (Grey).
             
             // So S3 is ALWAYS Grey because it's always from the previous lap until I finish the CURRENT lap?
             // But when I finish the current lap, I immediately go to S1 of NEXT lap.
             // So S3 never gets colored?
             // Unless... when I cross the line, I briefly show the full colored lap?
             // Or maybe S3 stays colored while I am in S1?
             // User: "ya empieza una nueva vuelta esten en gris" (when new lap starts, be grey).
             // This implies S3 becomes grey immediately.
             return "text-gray-500"
          })(),
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
            // console.log(`🔍 Driver ${driverNumber} Sector 3 Segments:`, segments)
            return segments
          })(),
          interval: finalGapValue,
          topSpeed: extractStringValue(driverData.Speeds?.ST?.Value || driverData.Speeds?.['I1']?.Value || driverData.Speeds?.['I2']?.Value || driverData.Speeds?.['FL']?.Value, ""),
          bestLapTime: extractStringValue(driverData.BestLapTime?.Value || driverData.PersonalBest, ""),
          pitCount: driverData.NumberOfPitStops || driverData.PitStops || driverData.PitStopCount || 0
      }

      // Debug logging for lap times
      console.log(`🏎️ Driver ${driver.code} lap times: LastLapTime="${driver.lapTime}", BestLapTime="${driver.prevLap}"`)

      updatedDrivers.push(driver)
      console.log(`🏎️ Added driver ${position}: ${driver.name} (${driver.code}) - ${driver.lapTime}`)
    })

    console.log(`🏎️ Total drivers updated: ${updatedDrivers.length}`)
    
    setDrivers(prevDrivers => {
      // 1. Merge new drivers into previous drivers
      const driverMap = new Map(prevDrivers.map(d => [d.code, d]))
      
      updatedDrivers.forEach(newDriver => {
        const existingDriver = driverMap.get(newDriver.code)
        
        if (existingDriver) {
          // Smart merge: preserve existing data if new data is missing/empty
          const mergedDriver = { ...existingDriver, ...newDriver }
          
          // Preserve Best Lap Time (prevLap) if lost
          if ((!newDriver.prevLap || newDriver.prevLap === "" || newDriver.prevLap === "0.000") && 
              existingDriver.prevLap && existingDriver.prevLap !== "" && existingDriver.prevLap !== "0.000") {
            mergedDriver.prevLap = existingDriver.prevLap
          }
          
          // Preserve BestLapTime field as well
          if ((!newDriver.bestLapTime || newDriver.bestLapTime === "") && existingDriver.bestLapTime) {
            mergedDriver.bestLapTime = existingDriver.bestLapTime
          }
          
          // Preserve Team info
          if ((!newDriver.team || newDriver.team === "Unknown") && existingDriver.team && existingDriver.team !== "Unknown") {
            mergedDriver.team = existingDriver.team
          }
          
          // Preserve Racing Number
          if ((!newDriver.racingNumber || newDriver.racingNumber === "") && existingDriver.racingNumber) {
            mergedDriver.racingNumber = existingDriver.racingNumber
          }
          
          // Preserve Last Lap Time
          if ((!newDriver.lapTime || newDriver.lapTime === "" || newDriver.lapTime === "0.000") && 
              existingDriver.lapTime && existingDriver.lapTime !== "" && existingDriver.lapTime !== "0.000") {
            mergedDriver.lapTime = existingDriver.lapTime
          }
          
          // Preserve Sector 1
          if ((!newDriver.sector1 || newDriver.sector1 === "" || newDriver.sector1 === "0.000") && 
              existingDriver.sector1 && existingDriver.sector1 !== "" && existingDriver.sector1 !== "0.000") {
            mergedDriver.sector1 = existingDriver.sector1
          }
          
          // Preserve Sector 2
          if ((!newDriver.sector2 || newDriver.sector2 === "" || newDriver.sector2 === "0.000") && 
              existingDriver.sector2 && existingDriver.sector2 !== "" && existingDriver.sector2 !== "0.000") {
            mergedDriver.sector2 = existingDriver.sector2
          }
          
          // Preserve Sector 3
          if ((!newDriver.sector3 || newDriver.sector3 === "" || newDriver.sector3 === "0.000") && 
              existingDriver.sector3 && existingDriver.sector3 !== "" && existingDriver.sector3 !== "0.000") {
            mergedDriver.sector3 = existingDriver.sector3
          }
          
          // Preserve Tire History if not present in update
          if ((!newDriver.tyresHistory || newDriver.tyresHistory.length === 0) && existingDriver.tyresHistory && existingDriver.tyresHistory.length > 0) {
             // Only if we don't have new tire info. 
             // Note: usually updates might have just current tire. 
             // If newDriver has tire data, we might want to append? 
             // For now, let's assume if the array is empty in update, we keep old history.
             mergedDriver.tyresHistory = existingDriver.tyresHistory
          }

          // Preserve Minisectors (Segments) with Smart Merge
          // We only overwrite colored segments with grey ones if it's a NEW LAP
          const isNewLap = mergedDriver.lapTime !== existingDriver.lapTime && mergedDriver.lapTime !== "--:--.---"
          
          const mergeSegments = (oldSegs: any[], newSegs: any) => {
            const safeOldSegs = Array.isArray(oldSegs) ? oldSegs : []
            
            // Handle newSegs being an array or an object
            let safeNewSegs: any[] = []
            if (Array.isArray(newSegs)) {
              safeNewSegs = newSegs
            } else if (newSegs && typeof newSegs === 'object') {
              // If object, convert to array but preserve indices if keys are numeric strings
              // Object.values might lose index order if keys are "0", "1", "5" -> [val0, val1, val5]
              // We need to map them to the correct index
              const keys = Object.keys(newSegs).map(Number).filter(n => !isNaN(n))
              if (keys.length > 0) {
                const maxKey = Math.max(...keys)
                safeNewSegs = new Array(maxKey + 1).fill(undefined)
                keys.forEach(key => {
                  safeNewSegs[key] = newSegs[key]
                })
              } else {
                 safeNewSegs = Object.values(newSegs)
              }
            }

            // If new segments are completely empty, return old
            if (safeNewSegs.length === 0) return safeOldSegs

            // Segment-level merge:
            // Create a new array that is at least as long as the max length
            const maxLength = Math.max(safeOldSegs.length, safeNewSegs.length)
            const merged = new Array(maxLength).fill(undefined)

            for (let i = 0; i < maxLength; i++) {
              const newSeg = safeNewSegs[i]
              const oldSeg = safeOldSegs[i]

              // If new segment exists and has valid status, use it
              if (newSeg && typeof newSeg.Status === 'number') {
                merged[i] = newSeg
              } else {
                // Otherwise keep old segment
                merged[i] = oldSeg
              }
            }
            
            return merged
          }

          mergedDriver.sector1Segments = mergeSegments(existingDriver.sector1Segments || [], newDriver.sector1Segments || [])
          mergedDriver.sector2Segments = mergeSegments(existingDriver.sector2Segments || [], newDriver.sector2Segments || [])
          mergedDriver.sector3Segments = mergeSegments(existingDriver.sector3Segments || [], newDriver.sector3Segments || [])

          driverMap.set(newDriver.code, mergedDriver)
        } else {
          driverMap.set(newDriver.code, newDriver)
        }
      })
      
      const mergedDrivers = Array.from(driverMap.values())

      // 2. Find the fastest lap time in current session across ALL drivers
      let currentFastestDriverCode: string | null = null
      let currentFastestTime = Infinity
      
      mergedDrivers.forEach(driver => {
        // Check both LastLapTime (current) and BestLapTime (best) to find the absolute fastest
        let bestTimeMs = Infinity
        let currentTimeMs = Infinity
        
        // Convert BestLapTime (prevLap)
        if (driver.prevLap && driver.prevLap !== "0.000" && driver.prevLap !== "0:00.000" && driver.prevLap !== "--:--.---") {
          if (driver.prevLap.includes(':')) {
            const [minutes, seconds] = driver.prevLap.split(':')
            bestTimeMs = (parseFloat(minutes) * 60 + parseFloat(seconds)) * 1000
          } else {
            bestTimeMs = parseFloat(driver.prevLap) * 1000
          }
        }
        
        // Convert LastLapTime (current)
        if (driver.lapTime && driver.lapTime !== "0.000" && driver.lapTime !== "0:00.000" && driver.lapTime !== "--:--.---") {
          if (driver.lapTime.includes(':')) {
            const [minutes, seconds] = driver.lapTime.split(':')
            currentTimeMs = (parseFloat(minutes) * 60 + parseFloat(seconds)) * 1000
          } else {
            currentTimeMs = parseFloat(driver.lapTime) * 1000
          }
        }
        
        
        // Find the fastest time for this driver (either current or best)
        // Ignore 0 or very small values which indicate invalid data
        let driverFastestTime = Infinity
        if (!isNaN(bestTimeMs) && bestTimeMs > 1000) driverFastestTime = bestTimeMs
        if (!isNaN(currentTimeMs) && currentTimeMs > 1000) {
          driverFastestTime = Math.min(driverFastestTime, currentTimeMs)
        }
        
        if (driverFastestTime !== Infinity && driverFastestTime < currentFastestTime) {
          currentFastestTime = driverFastestTime
          currentFastestDriverCode = driver.code
        }
      })
      
      // 3. Update isFastestLap and isPersonalBest flags for ALL drivers
      let finalDrivers = mergedDrivers.map(driver => {
        // Check if this driver's best time (prevLap) is the fastest of the session
        let driverBestTimeMs = Infinity
        if (driver.prevLap && driver.prevLap !== "0.000" && driver.prevLap !== "0:00.000" && driver.prevLap !== "--:--.---") {
          if (driver.prevLap.includes(':')) {
            const [minutes, seconds] = driver.prevLap.split(':')
            driverBestTimeMs = (parseFloat(minutes) * 60 + parseFloat(seconds)) * 1000
          } else {
            driverBestTimeMs = parseFloat(driver.prevLap) * 1000
          }
        }
        
        // Check if current lap (lapTime) is the personal best for this driver
        let currentLapTimeMs = Infinity
        if (driver.lapTime && driver.lapTime !== "0.000" && driver.lapTime !== "0:00.000" && driver.lapTime !== "--:--.---") {
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
        
        return {
          ...driver,
          isFastestLap,
          isPersonalBest,
          // Recalculate gap if it's 0.000 and we have valid times (common in practice sessions)
          gap: (driver.gap === "0.000" || driver.gap === "") && !isFastestLap && driverBestTimeMs !== Infinity && currentFastestTime !== Infinity
            ? `+${((driverBestTimeMs - currentFastestTime) / 1000).toFixed(3)}`
            : driver.gap,
          gapTime: (driver.gapTime === "0.000" || driver.gapTime === "") && !isFastestLap && driverBestTimeMs !== Infinity && currentFastestTime !== Infinity
            ? `+${((driverBestTimeMs - currentFastestTime) / 1000).toFixed(3)}`
            : driver.gapTime,
          // Store the numeric best time for sorting later if needed
          _bestTimeMs: driverBestTimeMs
        }
      })

      // 4. Fallback for missing positions (0) or Practice Sessions
      // Check if we have ANY drivers with position 0, which indicates we need to calculate positions
      // OR if we are in a practice session (where positions are based on best lap time)
      const hasZeroPosDrivers = finalDrivers.some(d => d.pos === 0)
      
      // Check if intervals are missing/invalid (all zero) which happens in Practice sessions even if positions are sent
      const hasInvalidIntervals = finalDrivers.length > 1 && finalDrivers.slice(1).every(d => 
        !d.interval || d.interval === "0.000" || d.interval === "+0.000" || d.interval === "" || d.interval === "Interval"
      )

      // Check if we are in a Practice or Qualifying session
      const isPractice = sessionTypeRef.current.toLowerCase().includes('practice')
      const isQualifying = sessionTypeRef.current.toLowerCase().includes('qualifying') || 
                          sessionNameRef.current.toLowerCase().includes('qualifying') ||
                          (sessionNameRef.current.toLowerCase().includes('session') && !isPractice) // Heuristic

      // 1. RECALCULATE POSITIONS (Only for Practice or if positions are missing)
      // In Qualifying, we trust the API positions (which handle elimination order correctly)
      // unless we have drivers with 0 position.
      if (hasZeroPosDrivers || isPractice) {
        // console.log(`⚠️ Recalculating positions (Practice or Missing Pos)`)
        
        // Sort ALL drivers by best time
        finalDrivers.sort((a, b) => {
          // 1. Sort by Retired Status (Active first)
          // In Qualy, retired means eliminated, so they should be at the bottom
          if (a.retired !== b.retired) {
            return a.retired ? 1 : -1
          }

          const timeA = (a as any)._bestTimeMs || Infinity
          const timeB = (b as any)._bestTimeMs || Infinity
          
          if (timeA === timeB) {
             return a.code.localeCompare(b.code)
          }
          return timeA - timeB
        })
        
        // Re-assign positions 1..N
        finalDrivers = finalDrivers.map((d, index) => ({
          ...d,
          pos: index + 1
        }))
      } else {
        // If we are NOT recalculating positions (e.g. Qualifying/Race with valid positions),
        // we MUST still sort the array by the official Position.
        finalDrivers.sort((a, b) => a.pos - b.pos)
      }

      // Calculate Elimination Zone (Always check this)
      const sessionName = sessionNameRef.current.toLowerCase()
      // Re-evaluate isQualifying with latest sessionNameRef
      let isQualifyingSession = isQualifying
      
      if (isQualifyingSession) {
          let eliminationPosition = 0
          
          if (sessionName.includes('q1') || sessionName.includes('qualifying 1')) {
            eliminationPosition = 15
          } else if (sessionName.includes('q2') || sessionName.includes('qualifying 2')) {
            eliminationPosition = 10
          } else if (sessionName.includes('q3') || sessionName.includes('qualifying 3')) {
             eliminationPosition = 0 
          } else {
            // Fallback Heuristic
            const knockedOutCount = finalDrivers.filter(d => d.retired).length
            const activeDrivers = finalDrivers.length

            if (knockedOutCount >= 10) {
               eliminationPosition = 0 
            } else if (knockedOutCount >= 5) {
               eliminationPosition = 10 
            } else if (activeDrivers > 15) {
               eliminationPosition = 15 
            }
          }
          
          if (eliminationPosition > 0) {
            finalDrivers = finalDrivers.map(d => ({
              ...d,
              isInEliminationZone: d.pos > eliminationPosition
            }))
          }
      }

      // 2. CALCULATE GAPS/INTERVALS (For Practice, Qualy, or if missing)
      // We do this for Qualifying too because the API often sends "Interval" text instead of values
      if (hasZeroPosDrivers || hasInvalidIntervals || isPractice || isQualifyingSession) {
        const formatGap = (diffMs: number): string => {
          if (diffMs === 0) return "+0.000"
          return `+${(diffMs / 1000).toFixed(3)}`
        }

        const getDriverTime = (d: any) => d._bestTimeMs || Infinity
        // For Gap to Leader, we need the time of the driver at Position 1 (index 0)
        const leaderTimeMs = getDriverTime(finalDrivers[0])

        finalDrivers.forEach((driver: any, index) => {
          if (index === 0) {
            driver.gap = "LEADER"
            driver.interval = "Interval"
          } else {
            const currentDriverTime = getDriverTime(driver)
            
            if (leaderTimeMs > 0 && leaderTimeMs !== Infinity && currentDriverTime > 0 && currentDriverTime !== Infinity) {
              // Calculate Gap to Leader
              const gapToLeader = currentDriverTime - leaderTimeMs
              driver.gap = formatGap(gapToLeader)

              // Calculate Interval to Ahead
              const aheadDriverTime = getDriverTime(finalDrivers[index - 1])
              if (aheadDriverTime > 0 && aheadDriverTime !== Infinity) {
                const intervalToAhead = currentDriverTime - aheadDriverTime
                driver.interval = formatGap(intervalToAhead)
              } else {
                driver.interval = "+0.000"
              }
            }
          }
        })
      }
      
      return finalDrivers
    })
  }

  function updateSessionInfo(sessionData: any) {
    // console.log("🔄 Updating session info with:", sessionData)
    
    // Fastest lap is now derived from drivers list, no need to reset state manually
    const sessionName = sessionData.Name || sessionData.name || "Unknown Session"
    const sessionType = sessionData.Type || sessionData.type || "Unknown"

    if (sessionNameRef.current !== "Unknown" && sessionName !== sessionNameRef.current) {
      console.log("🔄 Session changed from", sessionNameRef.current, "to", sessionName, "- Resetting data")
      setDrivers([])
      setCarDataCache({})
    }

    sessionTypeRef.current = sessionType // Update ref for access in setDrivers callback
    sessionNameRef.current = sessionName // Update ref for elimination zone logic
    
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

  function updateTrackStatus(trackData: any) {
    setSessionInfo(prev => {
      const trackStatus = trackData.Status || prev.trackStatus
      // Determine if DRS is enabled based on track status
      const drsEnabled = !trackStatus?.toLowerCase().includes('safety car') && 
                        !trackStatus?.toLowerCase().includes('vsc') &&
                        !trackStatus?.toLowerCase().includes('red flag')

      return {
        ...prev,
        trackStatus,
        drsEnabled
      }
    })
  }

  function updateWeatherData(weatherData: any) {
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

  function updateLapCount(lapData: any) {
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

  const startConnection = () => {
    setPreventReconnect(false)
    connectToF1SignalR()
  }

  const stopConnection = () => {
    console.log("🛑 Stopping WebSocket connection...")
    setPreventReconnect(true) // Prevent automatic reconnection
    if (wsRef.current) {
      wsRef.current.close(1000, "User initiated close") // 1000 is normal closure
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    setIsConnected(false)
    setConnectionWorking(false)
    setHasActiveSession(false)
    setError(null)
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

  // Derive fastest lap info from drivers list
  const fastestLap = useMemo(() => {
    const driverWithFastestLap = drivers.find(d => d.isFastestLap)
    if (!driverWithFastestLap) {
      return {
        time: "0:00.000",
        driver: null,
        driverCode: null,
        team: null,
        racingNumber: null
      }
    }
    
    // Find the actual fastest time value (best lap)
    let bestTime = driverWithFastestLap.prevLap
    
    return {
      time: bestTime,
      driver: driverWithFastestLap.name,
      driverCode: driverWithFastestLap.code,
      team: driverWithFastestLap.team || null,
      racingNumber: driverWithFastestLap.racingNumber || null
    }
  }, [drivers])

  // Calculate inferred phase for UI display
  const getInferredPhase = () => {
    const sessionName = (sessionInfo.raceName || sessionNameRef.current).toLowerCase()
    const sessionType = (sessionInfo.raceName || sessionTypeRef.current).toLowerCase()
    let isQualifying = sessionType.includes('qualifying') || sessionName.includes('qualifying')
    
    // Heuristic for generic names
    if (!isQualifying && (sessionName.includes('session') || sessionName.includes('f1 live timing'))) {
       if (!sessionType.includes('practice')) {
         isQualifying = true
       }
    }

    if (isQualifying) {
        if (sessionName.includes('q1') || sessionName.includes('qualifying 1')) return "Q1"
        if (sessionName.includes('q2') || sessionName.includes('qualifying 2')) return "Q2"
        if (sessionName.includes('q3') || sessionName.includes('qualifying 3')) return "Q3"
        
        // Fallback Heuristic
         const knockedOutCount = drivers.filter(d => d.retired).length
         const activeDrivers = drivers.length
         
         if (knockedOutCount >= 10) return "Q3"
         if (knockedOutCount >= 5) return "Q2"
         if (activeDrivers > 15) return "Q1"
    }
    return null
  }

  const inferredPhase = getInferredPhase()

  return {
    isConnected,
    connectionWorking,
    error,
    sessionInfo,
    drivers,
    teamRadioMessages,
    raceControlMessages,
    fastestLap,
    inferredPhase,
    reconnect,
    forceActiveSession,
    hasActiveSession,
    toggleConnection: () => {
      if (isConnected) {
        stopConnection()
      } else {
        startConnection()
      }
    }
  }
}
