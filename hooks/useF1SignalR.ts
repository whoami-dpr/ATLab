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
  // Helper to know if trackStatus indicates active session
  function isSessionActive(trackStatus: string) {
    if (!trackStatus) return false
    const status = trackStatus.toLowerCase()
    // Consider active if it's not "no active session", "finished", "closed", "not started", "test", "unknown"
    return !(
      status.includes("no active") ||
      status.includes("finished") ||
      status.includes("closed") ||
      status.includes("not started") ||
      status.includes("test") ||
      status.includes("unknown")
    )
  }
  const [error, setError] = useState<string | null>(null)
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [forceStopDemo, setForceStopDemo] = useState(false)
  const [preventReconnect, setPreventReconnect] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const demoIntervalRef = useRef<NodeJS.Timeout | null>(null)

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
    if (isDemoMode) {
      console.log("[connectToF1SignalR] Bloqueado: está en modo demo, no se conecta ni cierra WebSocket real.");
      return;
    }
    try {
      setError("Connecting to F1 Live Timing...")
      console.log("🔄 Attempting to connect to F1 SignalR...")

      // Step 1: Negotiate connection
      const negotiateResponse = await fetch("/api/f1/negotiate")
      if (!negotiateResponse.ok) {
        console.error(`❌ Connection failed: Negotiate failed: ${negotiateResponse.status}`)
        // Solo mostrar estado vacío, no activar demo automáticamente
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
        return
      }

      const negotiateData = await negotiateResponse.json()

      if (negotiateData.error) {
        console.error(`❌ Connection failed: ${negotiateData.error}`)
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
        return
      }

      const connectionToken = negotiateData.ConnectionToken
      if (!connectionToken) {
        console.error("❌ Connection failed: No connection token received")
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
        return
      }

      // Step 2: Connect to WebSocket
      const connectionData = encodeURIComponent('[{"name":"Streaming"}]')
      const wsUrl = `wss://livetiming.formula1.com/signalr/connect?transport=webSockets&clientProtocol=1.5&connectionToken=${encodeURIComponent(connectionToken)}&connectionData=${connectionData}`

      wsRef.current = new WebSocket(wsUrl)

      wsRef.current.onopen = () => {
        if (isDemoMode) return; // Si demo se activó mientras conectaba, ignorar
        console.log("✅ Connected to F1 SignalR")
        setIsConnected(true)
        setError(null)
        // Solo salir del modo demo si no está activo manualmente
        if (!isDemoMode) {
          setIsDemoMode(false)
        }
        subscribeToFeeds()
      }

      wsRef.current.onmessage = (event) => {
        if (isDemoMode) return; // Ignorar mensajes si demo está activo
        handleWebSocketMessage(event.data)
      }

      wsRef.current.onerror = (error) => {
        if (isDemoMode) {
          // Demo activo: nunca modificar estado ni limpiar nada
          console.warn("[DEMO] Ignorando error de WebSocket, demo sigue activo.");
          return;
        }
        console.error("❌ WebSocket error:", error)
        setError("Connection error")
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
      }

      wsRef.current.onclose = (event) => {
        if (isDemoMode) {
          // Demo activo: nunca modificar estado ni limpiar nada
          console.warn("[DEMO] Ignorando cierre de WebSocket, demo sigue activo.");
          return;
        }
        console.log("🔌 WebSocket closed:", event.code, event.reason)
        setIsConnected(false)
        setError("Connection closed")
        setDrivers([])
        setSessionInfo({
          raceName: "F1 Live Timing",
          flag: "🏁",
          timer: "00:00:00",
          weather: { track: 0, air: 0, humidity: 0, condition: "unknown" },
          lapInfo: "-- / --",
          trackStatus: "No Active Session",
        })
        // Auto-reconnect después de 10 segundos para intentar volver al modo real
        if (!preventReconnect) {
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current)
          }
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log("🔄 Attempting to reconnect...")
            connectToF1SignalR()
          }, 10000)
        }
      }
    } catch (error) {
      console.error("❌ Connection failed:", error)
      if (!isDemoMode) {
        setError("No active F1 session")
        setIsConnected(false)
        setIsDemoMode(false)

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
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return

    const subscriptions = [
      {
        target: "Streaming",
        type: 1,
        invocationId: "0",
        arguments: [
          "Subscribe",
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
            "TimingData",
          ],
        ],
      },
    ]

    subscriptions.forEach((sub) => {
      console.log("📡 Subscribing to:", sub.arguments[1])
      wsRef.current?.send(JSON.stringify(sub) + "\x1e")
    })
  }

  const handleWebSocketMessage = (data: string) => {
    if (!data || data === "\x1e") return

    try {
      const messages = data.split("\x1e").filter((msg) => msg.trim())

      messages.forEach((message) => {
        try {
          const parsed = JSON.parse(message)
          handleF1Data(parsed)
        } catch (e) {
          // Ignore non-JSON messages
        }
      })
    } catch (error) {
      console.error("Error parsing message:", error)
    }
  }

  const handleF1Data = (data: any) => {
    if (!data) return

    if (data.target === "Streaming" && data.arguments) {
      const [messageType, messageData] = data.arguments

      switch (messageType) {
        case "TimingData":
          if (messageData) updateDriverData(messageData)
          break
        case "SessionInfo":
          if (messageData) updateSessionInfo(messageData)
          break
        case "TrackStatus":
          if (messageData) updateTrackStatus(messageData)
          break
        case "WeatherData":
          if (messageData) updateWeatherData(messageData)
          break
        case "LapCount":
          if (messageData) updateLapCount(messageData)
          break
        default:
          console.log("📊 Received:", messageType)
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
    // Si hay drivers y el trackStatus es activo, marcar sesión activa
    if (updatedDrivers.length > 0 && isSessionActive(sessionInfo.trackStatus)) {
      setHasActiveSession(true)
    } else {
      setHasActiveSession(false)
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
      // Si hay drivers y el trackStatus es activo, marcar sesión activa
      if (drivers.length > 0 && isSessionActive(newStatus)) {
        setHasActiveSession(true)
      } else {
        setHasActiveSession(false)
      }
      return {
        ...prev,
        trackStatus: newStatus,
      }
    })
  // Helper para saber si el trackStatus indica sesión activa
  function isSessionActive(trackStatus: string) {
    if (!trackStatus) return false
    const status = trackStatus.toLowerCase()
    // Considera activo si no es "no active session", "finished", "closed", "not started", "test", "unknown"
    return !(
      status.includes("no active") ||
      status.includes("finished") ||
      status.includes("closed") ||
      status.includes("not started") ||
      status.includes("test") ||
      status.includes("unknown")
    )
  }
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
    console.log("[useEffect] isDemoMode:", isDemoMode, "(PROD:", process.env.NODE_ENV, ")");
    if (isDemoMode) {
      // Si está en demo, nunca crear ni cerrar WebSocket
      return;
    }
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
    };
  }, [isDemoMode]);

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
    // Solo conectado si WebSocket está abierto, no hay error, y hay sesión activa
    isConnected: isConnected && hasActiveSession && !error,
    error,
    isDemoMode,
    reconnect,
    startDemo,
    stopDemo,
  }
}
