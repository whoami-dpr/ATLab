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
  team: string // NEW: team
  pitStops?: number // NEW: number of pit stops
  positionsGained?: number // NEW: positions gained or lost
  lapTimeColor?: 'green' | 'purple' | 'white';
  tyresHistory?: string[] // NEW: history of tyres used
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

export function useF1SignalR() {
  const [drivers, setDrivers] = useState<F1Driver[]>([])
  const [sessionInfo, setSessionInfo] = useState<F1SessionInfo>({
    raceName: "F1 Live Timing",
    flag: "🏁",
    timer: "00:00:00",
    weather: { track: 0, air: 0, humidity: 0, condition: "unknown" },
    lapInfo: "-- / --",
    trackStatus: "No Active Session",
  })
  // State to track tyres history per driver
  const [driversTyreHistory, setDriversTyreHistory] = useState<Record<string, string[]>>({})
  const [isConnected, setIsConnected] = useState(false)
  // New: state to know if there is active session data
  const [hasActiveSession, setHasActiveSession] = useState(false)
  const [connectionWorking, setConnectionWorking] = useState(false)
  
  // Actualizar hasActiveSession basado en connectionWorking
  useEffect(() => {
    if (connectionWorking && !hasActiveSession) {
      // Si la conexión está funcionando pero no hay sesión activa, 
      // considerarlo como "conectado pero sin sesión activa"
      setHasActiveSession(true)
      
      // No activar demo automáticamente - queremos datos reales
    }
  }, [connectionWorking, hasActiveSession, drivers.length])
  // Helper to know if trackStatus indicates active session
  function isSessionActive(trackStatus: string) {
    if (!trackStatus) return false
    const status = trackStatus.toLowerCase()
    // Consider active if it's not explicitly inactive
    return !(
      status.includes("no active") ||
      status.includes("finished") ||
      status.includes("closed") ||
      status.includes("not started") ||
      status.includes("unknown") ||
      status === "test" ||
      status === ""
    )
  }
  
  // Helper to determine if we should show session data
  function shouldShowSessionData() {
    // Show data if we have drivers OR if connection is working (even without active session)
    return drivers.length > 0 || connectionWorking
  }

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
    // Cerrar WebSocket antes de activar demo para evitar race conditions
    if (wsRef.current) {
      wsRef.current.onclose = null; // Desactivar handler para evitar limpieza de estado
      wsRef.current.onerror = null;
      wsRef.current.close();
      wsRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    console.log(" Starting demo mode... (DEMO ACTIVADO)");
    setIsDemoMode(true)
    setForceStopDemo(false)
    setPreventReconnect(true) // Evita reconexión automática mientras esté en demo
    setIsConnected(true)
    setError(null)
    setSessionInfo(getDemoSessionInfo())
    setDrivers(getDemoDrivers(driverColors))

    // Update demo data every 2 seconds
    demoIntervalRef.current = setInterval(() => {
      updateDemoData()
    }, 2000)
  }

  const stopDemo = () => {
    console.log("🛑 Stopping demo mode...")
    setIsDemoMode(false)
    setForceStopDemo(true)
    setPreventReconnect(false) // Permite reconexión automática al salir de demo
    setIsConnected(false)
    setDrivers([])
    setSessionInfo({
      raceName: "F1 Live Timing",
      flag: "🏁",
      timer: "00:00:00",
      weather: { track: 0, air: 0, humidity: 0, condition: "unknown" },
      lapInfo: "-- / --",
      trackStatus: "No Active Session",
    })

    if (demoIntervalRef.current) {
      clearInterval(demoIntervalRef.current)
      demoIntervalRef.current = null
    }
  }

  const updateDemoData = () => {
    // Solo actualizar datos de demo si el modo demo está activo
    if (!isDemoMode) return;

    setDrivers((prevDrivers) => {
      return prevDrivers.map((driver) => {
        // Simulate random lap time changes
        const baseTime = 78.234 + Math.random() * 2 // 1:18.234 to 1:20.234
        const newLapTime = `1:${baseTime.toFixed(3)}`

        // Simulate sector times
        const sector1 = (23.4 + Math.random() * 0.5).toFixed(3)
        const sector2 = (31.2 + Math.random() * 0.6).toFixed(3)
        const sector3 = (23.5 + Math.random() * 0.4).toFixed(3)

        // Random sector colors
        const colors = ["green", "yellow", "purple"]
        const sector1Color = colors[Math.floor(Math.random() * colors.length)]
        const sector2Color = colors[Math.floor(Math.random() * colors.length)]
        const sector3Color = colors[Math.floor(Math.random() * colors.length)]

        // Random DRS
        const drs = Math.random() > 0.7

        // Update stint laps
        const currentLap = Number.parseInt(driver.stint.split(" ")[1]) + 1
        const stint = `L ${currentLap}`

        return {
          ...driver,
          lapTime: newLapTime,
          prevLap: driver.lapTime,
          sector1,
          sector1Prev: driver.sector1,
          sector2,
          sector2Prev: driver.sector2,
          sector3,
          sector3Prev: driver.sector3,
          sector1Color,
          sector2Color,
          sector3Color,
          drs,
          stint,
        }
      })
    })

    // Update session timer solo si está en demo
    setSessionInfo((prev) => {
      const [hours, minutes, seconds] = prev.timer.split(":").map(Number)
      let newSeconds = seconds + 1
      let newMinutes = minutes
      let newHours = hours

      if (newSeconds >= 60) {
        newSeconds = 0
        newMinutes += 1
      }
      if (newMinutes >= 60) {
        newMinutes = 0
        newHours += 1
      }

      const newTimer = `${newHours.toString().padStart(2, "0")}:${newMinutes.toString().padStart(2, "0")}:${newSeconds.toString().padStart(2, "0")}`

      return {
        ...prev,
        timer: newTimer,
      }
    })
  }

  const connectToF1SignalR = async () => {
    console.log("[connectToF1SignalR] Función llamada");
    if (isDemoMode) {
      console.log("[connectToF1SignalR] Bloqueado: está en modo demo, no se conecta ni cierra WebSocket real.");
      return;
    }
    try {
      setError("Connecting to F1 Live Timing...")
      console.log("🔄 Attempting to connect to F1 SignalR...")
      console.log("🔄 Current state - isDemoMode:", isDemoMode, "isConnected:", isConnected)

      // Step 1: Negotiate connection
      console.log("🔄 Fetching negotiate endpoint...")
      
      // Usar URL relativa que funciona tanto en desarrollo como en producción
      const apiUrl = '/api/f1/negotiate'
      
      console.log("🔄 API URL:", apiUrl)
      console.log("🔄 Current origin:", typeof window !== 'undefined' ? window.location.origin : 'server')
      
      const negotiateResponse = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      })
      console.log("📡 Negotiate response status:", negotiateResponse.status)
      
      if (!negotiateResponse.ok) {
        console.error(`❌ Connection failed: Negotiate failed: ${negotiateResponse.status}`)
        setError(`Failed to connect: ${negotiateResponse.status}`)
        setIsConnected(false)
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
        return
      }

      const negotiateData = await negotiateResponse.json()

      if (negotiateData.error) {
        console.error(`❌ Connection failed: ${negotiateData.error}`)
        setError(negotiateData.error)
        setIsConnected(false)
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
        return
      }

      const connectionToken = negotiateData.ConnectionToken
      if (!connectionToken) {
        console.error("❌ Connection failed: No connection token received")
        setError("No connection token received")
        setIsConnected(false)
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
        return
      }

      // Step 2: Connect to WebSocket
      const connectionData = encodeURIComponent('[{"name":"Streaming"}]')
      const wsUrl = `wss://livetiming.formula1.com/signalr/connect?transport=webSockets&clientProtocol=1.5&connectionToken=${encodeURIComponent(connectionToken)}&connectionData=${connectionData}`
      
      console.log("🔗 Connecting to WebSocket...")
      console.log("🔗 URL:", wsUrl.substring(0, 150) + "...")
      console.log("🔗 Connection Token:", connectionToken.substring(0, 20) + "...")
      console.log("🔗 Connection Data:", connectionData)
      
      // Verificar que el token no esté vacío
      if (!connectionToken || connectionToken.length < 10) {
        console.error("❌ Invalid connection token:", connectionToken)
        setError("Invalid connection token")
        return
      }
      
      wsRef.current = new WebSocket(wsUrl)
      console.log("🔗 WebSocket created, readyState:", wsRef.current.readyState)
      
      // Verificar inmediatamente el estado
      setTimeout(() => {
        console.log("🔗 WebSocket readyState after 100ms:", wsRef.current?.readyState)
      }, 100)

      // Timeout para la conexión WebSocket
      const connectionTimeout = setTimeout(() => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.CONNECTING) {
          console.error("❌ WebSocket connection timeout")
          wsRef.current.close()
          setError("WebSocket connection timeout")
          setIsConnected(false)
        }
      }, 10000) // 10 segundos timeout

      wsRef.current.onopen = () => {
        if (isDemoMode) return; // Si demo se activó mientras conectaba, ignorar
        clearTimeout(connectionTimeout)
        console.log("✅ WebSocket connected successfully!")
        console.log("✅ WebSocket readyState:", wsRef.current?.readyState)
        setIsConnected(true)
        setConnectionWorking(true) // Marcar que la conexión está funcionando
        setError(null)
        // Solo salir del modo demo si no está activo manualmente
        if (!isDemoMode) {
          setIsDemoMode(false)
        }
        subscribeToFeeds()
      }

      wsRef.current.onmessage = (event) => {
        if (isDemoMode) return; // Ignorar mensajes si demo está activo
        console.log("📨 WebSocket message received:", event.data.substring(0, 100) + "...")
        
        // Limpiar timeout de mensajes ya que recibimos datos
        if (messageTimeoutRef.current) {
          clearTimeout(messageTimeoutRef.current)
          messageTimeoutRef.current = null
        }
        
        handleWebSocketMessage(event.data)
      }

      wsRef.current.onerror = (error) => {
        if (isDemoMode) {
          // Demo activo: nunca modificar estado ni limpiar nada
          console.warn("[DEMO] Ignorando error de WebSocket, demo sigue activo.");
          return;
        }
        clearTimeout(connectionTimeout)
        console.error("❌ WebSocket error:", error)
        console.error("❌ WebSocket readyState:", wsRef.current?.readyState)
        console.error("❌ WebSocket URL:", wsUrl.substring(0, 100) + "...")
        console.error("❌ Connection token length:", connectionToken.length)
        setError("WebSocket connection error (1006)")
        setIsConnected(false)
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

      wsRef.current.onclose = (event) => {
        if (isDemoMode) {
          // Demo activo: nunca modificar estado ni limpiar nada
          console.warn("[DEMO] Ignorando cierre de WebSocket, demo sigue activo.");
          return;
        }
        clearTimeout(connectionTimeout)
        console.log("🔌 WebSocket closed:", event.code, event.reason)
        console.log("🔌 Close was clean:", event.wasClean)
        console.log("🔌 Close code meaning:", getCloseCodeMeaning(event.code))
        
        setIsConnected(false)
        setConnectionWorking(false) // Resetear el estado de conexión
        setError(`Connection closed (${event.code}: ${event.reason || 'No reason'})`)
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
        
        // Solo reconectar si no es un error 1006 (problema de conexión)
        if (!preventReconnect && event.code !== 1006) {
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current)
          }
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log("🔄 Attempting to reconnect...")
            connectToF1SignalR()
          }, 10000)
        } else if (event.code === 1006) {
          console.log("❌ Not reconnecting due to error 1006 - connection problem")
        }
      }
    } catch (error) {
      console.error("❌ Connection failed:", error)
      if (!isDemoMode) {
        setError("No active F1 session")
        setIsConnected(false)
        setIsDemoMode(false)
        setHasActiveSession(false)

        // Clear data
        setDrivers([])
        setSessionInfo((prev) => ({
          ...prev,
          trackStatus: "No Active Session",
          raceName: "F1 Live Timing",
          timer: "00:00:00",
          weather: { track: 0, air: 0, humidity: 0, condition: "unknown" },
          lapInfo: "-- / --",
        }))

        // Retry after 30 seconds
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current)
        }
        reconnectTimeoutRef.current = setTimeout(connectToF1SignalR, 30000)
      }
    }
  }

  const subscribeToFeeds = () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.log("❌ Cannot subscribe: WebSocket not open, readyState:", wsRef.current?.readyState)
      return
    }

    console.log("📡 WebSocket is open, subscribing to feeds...")

    // Formato correcto de SignalR para F1 (como f1-dash)
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
    
    // También probar con formato alternativo
    setTimeout(() => {
      console.log("📡 Trying alternative SignalR format...")
      const altSubscription = {
        "H": "Streaming",
        "M": "Subscribe", 
        "A": [["TimingData", "SessionInfo", "DriverList"]],
        "I": 1
      }
      const altMessage = JSON.stringify(altSubscription) + "\x1e"
      console.log("📡 Alternative subscription:", altMessage)
      wsRef.current?.send(altMessage)
    }, 2000)
    
    console.log("✅ SignalR subscription sent")
    
    // Configurar timeout para detectar si no hay datos
    if (messageTimeoutRef.current) {
      clearTimeout(messageTimeoutRef.current)
    }
    messageTimeoutRef.current = setTimeout(() => {
      console.log("⏰ No F1 data received after 15 seconds")
      setError("No F1 data received - session might be inactive")
    }, 15000)
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
            // Si recibimos datos de timing, es una sesión activa
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
          // Cualquier mensaje de F1 indica sesión activa
          setHasActiveSession(true)
      }
    } else {
      console.log("⚠️ Message not processed - target:", data.target, "arguments:", data.arguments)
      console.log("⚠️ Full data:", JSON.stringify(data, null, 2))
      // Incluso si no es streaming, si hay datos, considerarlo activo
      if (data && typeof data === 'object') {
        console.log("📊 Non-streaming data detected - considering as active session")
        setHasActiveSession(true)
      }
    }
  }
        case "SessionInfo":
          if (messageData) {
            console.log("📋 Session info received:", messageData.Name || "Unknown")
            updateSessionInfo(messageData)
            // Si recibimos info de sesión, verificar si es activa
            if (messageData.Name && !messageData.Name.toLowerCase().includes("no active")) {
              setHasActiveSession(true)
            }
          }
          break
        case "TrackStatus":
          if (messageData) {
            console.log("🏁 Track status received:", messageData.Status || "Unknown")
            updateTrackStatus(messageData)
          }
          break
        case "WeatherData":
          if (messageData) {
            console.log("🌤️ Weather data received")
            updateWeatherData(messageData)
            // Si recibimos datos de clima, es una sesión activa
            setHasActiveSession(true)
          }
          break
        case "LapCount":
          if (messageData) {
            console.log("🔢 Lap count received:", messageData.CurrentLap || 0, "/", messageData.TotalLaps || 0)
            updateLapCount(messageData)
            // Si recibimos conteo de vueltas, es una sesión activa
            setHasActiveSession(true)
          }
          break
        default:
          console.log("📊 Received:", messageType)
          console.log("📊 Processing as active session data")
          // Cualquier mensaje de F1 indica sesión activa
          setHasActiveSession(true)
      }
    } else {
      console.log("⚠️ Message not processed - target:", data.target, "arguments:", data.arguments)
      console.log("⚠️ Full data:", JSON.stringify(data, null, 2))
      // Incluso si no es streaming, si hay datos, considerarlo activo
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
        
        // Only add if it's a different tyre from the last one
        if (lastTire !== currentTire && currentTire !== "") {
          return {
            ...prev,
            [driverCode]: [...currentHistory, currentTire]
          }
        }
        
        return prev
      })

      const driver: F1Driver = {
        pos: position,
        code: driverCode,
        name: driverData.BroadcastName || `Driver ${driverNumber}`,
        color: driverColors[position - 1] || "bg-gray-500",
        tire: currentTire,
        stint: `L ${driverData.NumberOfLaps || 0}`,
        change: driverData.IntervalToPositionAhead?.Value || "",
        drs: driverData.DRS === "1",
        gap: driverData.GapToLeader || "-- ---",
        gapTime: driverData.IntervalToPositionAhead?.Value || "",
        lapTime: driverData.LastLapTime?.Value || "0:00.000",
        prevLap: driverData.BestLapTime?.Value || "0:00.000",
        sector1: driverData.Sectors?.[0]?.Value || "0.000",
        sector1Prev: driverData.Sectors?.[0]?.PreviousValue || "0.000",
        sector2: driverData.Sectors?.[1]?.Value || "0.000",
        sector2Prev: driverData.Sectors?.[1]?.PreviousValue || "0.000",
        sector3: driverData.Sectors?.[2]?.Value || "0.000",
        sector3Prev: driverData.Sectors?.[2]?.PreviousValue || "0.000",
        sector1Color: getSectorColor(driverData.Sectors?.[0]),
        sector2Color: getSectorColor(driverData.Sectors?.[1]),
        sector3Color: getSectorColor(driverData.Sectors?.[2]),
        lapTimeColor:
          driverData.LastLapTime?.OverallFastest
            ? 'purple'
            : driverData.LastLapTime?.PersonalBest
              ? 'green'
              : 'white',
        team: driverData.TeamName || driverData.Team || '', // Adjust here according to the real API field
        tyresHistory: driversTyreHistory[driverCode] || []
      }

      updatedDrivers.push(driver)
    })

    updatedDrivers.sort((a, b) => a.pos - b.pos)
    setDrivers(updatedDrivers)
    // Si hay drivers, marcar sesión activa (independientemente del trackStatus)
    if (updatedDrivers.length > 0) {
      setHasActiveSession(true)
    }
  }

  const getSectorColor = (sector: any) => {
    if (!sector) return "yellow"
    if (sector.OverallFastest) return "green"
    if (sector.PersonalFastest) return "purple"
    return "yellow"
  }

  const updateSessionInfo = (sessionData: any) => {
    if (isDemoMode) return
    setSessionInfo((prev) => ({
      ...prev,
      raceName: sessionData.Meeting?.Name ? `${sessionData.Meeting.Name}: ${sessionData.Name}` : prev.raceName,
      timer: sessionData.TimeRemaining || prev.timer,
    }))
  }

  const updateTrackStatus = (trackData: any) => {
    if (isDemoMode) return
    setSessionInfo((prev) => {
      const newStatus = trackData.Status || prev.trackStatus
      // Marcar sesión activa si el status indica actividad
      if (isSessionActive(newStatus)) {
        setHasActiveSession(true)
      } else if (newStatus && newStatus.toLowerCase().includes("no active")) {
        setHasActiveSession(false)
      }
      return {
        ...prev,
        trackStatus: newStatus,
      }
    })
  }

  const updateWeatherData = (weatherData: any) => {
    if (isDemoMode) return
    setSessionInfo((prev) => ({
      ...prev,
      weather: {
        track: weatherData.TrackTemp || prev.weather.track,
        air: weatherData.AirTemp || prev.weather.air,
        humidity: weatherData.Humidity || prev.weather.humidity,
        condition: weatherData.Rainfall ? "rain" : "dry",
      },
    }))
  }

  const updateLapCount = (lapData: any) => {
    if (isDemoMode) return
    setSessionInfo((prev) => ({
      ...prev,
      lapInfo: `${lapData.CurrentLap || 0} / ${lapData.TotalLaps || 0}`,
    }))
  }

  useEffect(() => {
    console.log("[useEffect] Iniciando hook useF1SignalR...");
    console.log("[useEffect] isDemoMode:", isDemoMode, "(PROD:", process.env.NODE_ENV, ")");
    
    if (isDemoMode) {
      // Si está en demo, nunca crear ni cerrar WebSocket
      console.log("[useEffect] Modo demo activo, no conectando WebSocket");
      return;
    }
    
    // Conectar siempre al montar el componente
    console.log("[useEffect] Conectando a SignalR/WebSocket real...");
    connectToF1SignalR();
    
    // Cleanup solo para WebSocket y reconexión, nunca para el demoInterval
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        console.log("[useEffect] Cerrando WebSocket al desmontar");
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        console.log("[useEffect] Limpiando timeout de reconexión al desmontar");
      }
      if (messageTimeoutRef.current) {
        clearTimeout(messageTimeoutRef.current);
        console.log("[useEffect] Limpiando timeout de mensajes al desmontar");
      }
    };
  }, []); // Solo ejecutar una vez al montar

  const reconnect = () => {
    // Si estamos en modo demo, no hacer nada al intentar reconectar
    if (isDemoMode) {
      console.log("🔄 Reconnect llamado en modo demo - ignorado (NO SE DEBE CONECTAR)");
      return;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    if (wsRef.current) {
      wsRef.current.close()
    }
    connectToF1SignalR()
  }

  return {
    drivers,
    sessionInfo,
    // Conectado si WebSocket está abierto y no hay error
    isConnected: isConnected && !error,
    error,
    isDemoMode,
    reconnect,
    startDemo,
    stopDemo,
    hasActiveSession, // Exponer el estado de sesión activa
  }
}
