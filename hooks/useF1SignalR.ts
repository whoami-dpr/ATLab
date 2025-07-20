"use client"

import { useState, useEffect, useRef } from "react"

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
  team: string // NUEVO: escudería
  pitStops?: number // NUEVO: cantidad de pit stops
  positionsGained?: number // NUEVO: posiciones ganadas o perdidas
  lapTimeColor?: 'green' | 'purple' | 'white';
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
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDemoMode, setIsDemoMode] = useState(false)
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
  const getDemoDrivers = (): F1Driver[] => [
    {
      pos: 1,
      code: "VER",
      name: "Max Verstappen",
      team: "Red Bull",
      color: driverColors[0],
      tire: "S",
      stint: "L 15",
      change: "+0.234",
      drs: true,
      gap: "LEADER",
      gapTime: "",
      lapTime: "1:18.234",
      prevLap: "1:18.456",
      sector1: "23.456",
      sector1Prev: "23.678",
      sector2: "31.234",
      sector2Prev: "31.456",
      sector3: "23.544",
      sector3Prev: "23.322",
      sector1Color: "green",
      sector2Color: "yellow",
      sector3Color: "purple",
    },
    {
      pos: 2,
      code: "HAM",
      name: "Lewis Hamilton",
      team: "Mercedes",
      color: driverColors[1],
      tire: "M",
      stint: "L 18",
      change: "-0.123",
      drs: false,
      gap: "+0.234",
      gapTime: "+0.234",
      lapTime: "1:18.468",
      prevLap: "1:18.591",
      sector1: "23.567",
      sector1Prev: "23.789",
      sector2: "31.345",
      sector2Prev: "31.567",
      sector3: "23.556",
      sector3Prev: "23.235",
      sector1Color: "yellow",
      sector2Color: "green",
      sector3Color: "yellow",
    },
    {
      pos: 3,
      code: "LEC",
      name: "Charles Leclerc",
      team: "Ferrari",
      color: driverColors[2],
      tire: "S",
      stint: "L 12",
      change: "+0.456",
      drs: true,
      gap: "+0.789",
      gapTime: "+0.555",
      lapTime: "1:18.789",
      prevLap: "1:18.234",
      sector1: "23.678",
      sector1Prev: "23.456",
      sector2: "31.456",
      sector2Prev: "31.234",
      sector3: "23.655",
      sector3Prev: "23.544",
      sector1Color: "purple",
      sector2Color: "yellow",
      sector3Color: "green",
    },
    {
      pos: 4,
      code: "NOR",
      name: "Lando Norris",
      team: "McLaren",
      color: driverColors[3],
      tire: "M",
      stint: "L 20",
      change: "-0.234",
      drs: false,
      gap: "+1.234",
      gapTime: "+0.445",
      lapTime: "1:19.023",
      prevLap: "1:18.789",
      sector1: "23.789",
      sector1Prev: "23.567",
      sector2: "31.567",
      sector2Prev: "31.345",
      sector3: "23.667",
      sector3Prev: "23.877",
      sector1Color: "yellow",
      sector2Color: "purple",
      sector3Color: "green",
    },
    {
      pos: 5,
      code: "RUS",
      name: "George Russell",
      team: "Mercedes",
      color: driverColors[4],
      tire: "H",
      stint: "L 25",
      change: "+0.123",
      drs: false,
      gap: "+2.456",
      gapTime: "+1.222",
      lapTime: "1:19.456",
      prevLap: "1:19.023",
      sector1: "23.890",
      sector1Prev: "23.678",
      sector2: "31.678",
      sector2Prev: "31.456",
      sector3: "23.888",
      sector3Prev: "23.889",
      sector1Color: "green",
      sector2Color: "yellow",
      sector3Color: "yellow",
    },
    {
      pos: 6,
      code: "PIA",
      name: "Oscar Piastri",
      team: "McLaren",
      color: driverColors[5],
      tire: "M",
      stint: "L 16",
      change: "+0.345",
      drs: true,
      gap: "+3.123",
      gapTime: "+0.667",
      lapTime: "1:19.567",
      prevLap: "1:19.234",
      sector1: "23.901",
      sector1Prev: "23.789",
      sector2: "31.789",
      sector2Prev: "31.567",
      sector3: "23.877",
      sector3Prev: "23.878",
      sector1Color: "yellow",
      sector2Color: "green",
      sector3Color: "purple",
    },
    {
      pos: 7,
      code: "PER",
      name: "Sergio Perez",
      team: "Red Bull",
      color: driverColors[6],
      tire: "S",
      stint: "L 13",
      change: "-0.456",
      drs: false,
      gap: "+4.567",
      gapTime: "+1.444",
      lapTime: "1:19.678",
      prevLap: "1:19.345",
      sector1: "24.012",
      sector1Prev: "23.890",
      sector2: "31.890",
      sector2Prev: "31.678",
      sector3: "23.776",
      sector3Prev: "23.777",
      sector1Color: "purple",
      sector2Color: "yellow",
      sector3Color: "green",
    },
    {
      pos: 8,
      code: "SAI",
      name: "Carlos Sainz",
      team: "Ferrari",
      color: driverColors[7],
      tire: "M",
      stint: "L 19",
      change: "+0.567",
      drs: true,
      gap: "+5.234",
      gapTime: "+0.667",
      lapTime: "1:19.789",
      prevLap: "1:19.456",
      sector1: "24.123",
      sector1Prev: "23.901",
      sector2: "31.901",
      sector2Prev: "31.789",
      sector3: "23.765",
      sector3Prev: "23.766",
      sector1Color: "green",
      sector2Color: "purple",
      sector3Color: "yellow",
    },
    {
      pos: 9,
      code: "ALO",
      name: "Fernando Alonso",
      team: "Aston Martin",
      color: driverColors[8],
      tire: "H",
      stint: "L 22",
      change: "-0.678",
      drs: false,
      gap: "+6.789",
      gapTime: "+1.555",
      lapTime: "1:19.890",
      prevLap: "1:19.567",
      sector1: "24.234",
      sector1Prev: "24.012",
      sector2: "32.012",
      sector2Prev: "31.890",
      sector3: "23.644",
      sector3Prev: "23.665",
      sector1Color: "yellow",
      sector2Color: "green",
      sector3Color: "purple",
    },
    {
      pos: 10,
      code: "STR",
      name: "Lance Stroll",
      team: "Aston Martin",
      color: driverColors[9],
      tire: "M",
      stint: "L 17",
      change: "+0.789",
      drs: true,
      gap: "+7.456",
      gapTime: "+0.667",
      lapTime: "1:19.901",
      prevLap: "1:19.678",
      sector1: "24.345",
      sector1Prev: "24.123",
      sector2: "32.123",
      sector2Prev: "31.901",
      sector3: "23.433",
      sector3Prev: "23.654",
      sector1Color: "purple",
      sector2Color: "yellow",
      sector3Color: "green",
    },
    {
      pos: 11,
      code: "GAS",
      name: "Pierre Gasly",
      team: "Alpine",
      color: driverColors[10],
      tire: "S",
      stint: "L 14",
      change: "-0.890",
      drs: false,
      gap: "+8.123",
      gapTime: "+0.667",
      lapTime: "1:20.012",
      prevLap: "1:19.789",
      sector1: "24.456",
      sector1Prev: "24.234",
      sector2: "32.234",
      sector2Prev: "32.012",
      sector3: "23.322",
      sector3Prev: "23.543",
      sector1Color: "green",
      sector2Color: "purple",
      sector3Color: "yellow",
    },
    {
      pos: 12,
      code: "OCO",
      name: "Esteban Ocon",
      team: "Alpine",
      color: driverColors[11],
      tire: "M",
      stint: "L 21",
      change: "+0.901",
      drs: true,
      gap: "+8.890",
      gapTime: "+0.767",
      lapTime: "1:20.123",
      prevLap: "1:19.890",
      sector1: "24.567",
      sector1Prev: "24.345",
      sector2: "32.345",
      sector2Prev: "32.123",
      sector3: "23.211",
      sector3Prev: "23.422",
      sector1Color: "yellow",
      sector2Color: "green",
      sector3Color: "purple",
    },
    {
      pos: 13,
      code: "HUL",
      name: "Nico Hulkenberg",
      team: "Haas",
      color: driverColors[12],
      tire: "H",
      stint: "L 24",
      change: "-1.012",
      drs: false,
      gap: "+9.567",
      gapTime: "+0.677",
      lapTime: "1:20.234",
      prevLap: "1:19.901",
      sector1: "24.678",
      sector1Prev: "24.456",
      sector2: "32.456",
      sector2Prev: "32.234",
      sector3: "23.100",
      sector3Prev: "23.211",
      sector1Color: "purple",
      sector2Color: "yellow",
      sector3Color: "green",
    },
    {
      pos: 14,
      code: "MAG",
      name: "Kevin Magnussen",
      team: "Haas",
      color: driverColors[13],
      tire: "M",
      stint: "L 18",
      change: "+1.123",
      drs: true,
      gap: "+10.234",
      gapTime: "+0.667",
      lapTime: "1:20.345",
      prevLap: "1:20.012",
      sector1: "24.789",
      sector1Prev: "24.567",
      sector2: "32.567",
      sector2Prev: "32.345",
      sector3: "22.989",
      sector3Prev: "23.100",
      sector1Color: "green",
      sector2Color: "purple",
      sector3Color: "yellow",
    },
    {
      pos: 15,
      code: "TSU",
      name: "Yuki Tsunoda",
      team: "RB",
      color: driverColors[14],
      tire: "S",
      stint: "L 15",
      change: "-1.234",
      drs: false,
      gap: "+11.123",
      gapTime: "+0.889",
      lapTime: "1:20.456",
      prevLap: "1:20.123",
      sector1: "24.890",
      sector1Prev: "24.678",
      sector2: "32.678",
      sector2Prev: "32.456",
      sector3: "22.888",
      sector3Prev: "22.989",
      sector1Color: "yellow",
      sector2Color: "green",
      sector3Color: "purple",
    },
    {
      pos: 16,
      code: "LAW",
      name: "Liam Lawson",
      team: "RB",
      color: driverColors[15],
      tire: "M",
      stint: "L 20",
      change: "+1.345",
      drs: true,
      gap: "+12.456",
      gapTime: "+1.333",
      lapTime: "1:20.567",
      prevLap: "1:20.234",
      sector1: "24.901",
      sector1Prev: "24.789",
      sector2: "32.789",
      sector2Prev: "32.567",
      sector3: "22.877",
      sector3Prev: "22.888",
      sector1Color: "purple",
      sector2Color: "yellow",
      sector3Color: "green",
    },
    {
      pos: 17,
      code: "ALB",
      name: "Alex Albon",
      team: "Williams",
      color: driverColors[16],
      tire: "H",
      stint: "L 23",
      change: "-1.456",
      drs: false,
      gap: "+13.789",
      gapTime: "+1.333",
      lapTime: "1:20.678",
      prevLap: "1:20.345",
      sector1: "25.012",
      sector1Prev: "24.890",
      sector2: "32.890",
      sector2Prev: "32.678",
      sector3: "22.776",
      sector3Prev: "22.877",
      sector1Color: "green",
      sector2Color: "purple",
      sector3Color: "yellow",
    },
    {
      pos: 18,
      code: "COL",
      name: "Franco Colapinto",
      team: "Williams",
      color: driverColors[17],
      tire: "M",
      stint: "L 19",
      change: "+1.567",
      drs: true,
      gap: "+14.567",
      gapTime: "+0.778",
      lapTime: "1:20.789",
      prevLap: "1:20.456",
      sector1: "25.123",
      sector1Prev: "24.901",
      sector2: "32.901",
      sector2Prev: "32.789",
      sector3: "22.765",
      sector3Prev: "22.776",
      sector1Color: "yellow",
      sector2Color: "green",
      sector3Color: "purple",
    },
    {
      pos: 19,
      code: "BOT",
      name: "Valtteri Bottas",
      team: "Kick Sauber",
      color: driverColors[18],
      tire: "S",
      stint: "L 16",
      change: "-1.678",
      drs: false,
      gap: "+15.234",
      gapTime: "+0.667",
      lapTime: "1:20.890",
      prevLap: "1:20.567",
      sector1: "25.234",
      sector1Prev: "25.012",
      sector2: "33.012",
      sector2Prev: "32.890",
      sector3: "22.644",
      sector3Prev: "22.765",
      sector1Color: "purple",
      sector2Color: "yellow",
      sector3Color: "green",
    },
    {
      pos: 20,
      code: "ZHO",
      name: "Zhou Guanyu",
      team: "Kick Sauber",
      color: driverColors[19],
      tire: "M",
      stint: "L 22",
      change: "+1.789",
      drs: true,
      gap: "+16.789",
      gapTime: "+1.555",
      lapTime: "1:20.901",
      prevLap: "1:20.678",
      sector1: "25.345",
      sector1Prev: "25.123",
      sector2: "33.123",
      sector2Prev: "32.901",
      sector3: "22.433",
      sector3Prev: "22.644",
      sector1Color: "green",
      sector2Color: "purple",
      sector3Color: "yellow",
    },
  ]

  const getDemoSessionInfo = (): F1SessionInfo => ({
    raceName: "DEMO: British Grand Prix",
    flag: "🟢",
    timer: "01:23:45",
    weather: {
      track: 32,
      air: 24,
      humidity: 65,
      condition: "dry",
    },
    lapInfo: "45 / 52",
    trackStatus: "Green Flag",
  })

  const startDemo = () => {
    console.log("🎮 Starting demo mode...")
    setIsDemoMode(true)
    setIsConnected(true)
    setError(null)
    setSessionInfo(getDemoSessionInfo())
    setDrivers(getDemoDrivers())

    // Update demo data every 2 seconds
    demoIntervalRef.current = setInterval(() => {
      updateDemoData()
    }, 2000)
  }

  const stopDemo = () => {
    console.log("🛑 Stopping demo mode...")
    setIsDemoMode(false)
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

    // Update session timer
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
    try {
      setError("Connecting to F1 Live Timing...")
      console.log("🔄 Attempting to connect to F1 SignalR...")

      // Step 1: Negotiate connection
      const negotiateResponse = await fetch("/api/f1/negotiate")
      if (!negotiateResponse.ok) {
        throw new Error(`Negotiate failed: ${negotiateResponse.status}`)
      }

      const negotiateData = await negotiateResponse.json()

      if (negotiateData.error) {
        throw new Error(negotiateData.error)
      }

      const connectionToken = negotiateData.ConnectionToken
      if (!connectionToken) {
        throw new Error("No connection token received")
      }

      // Step 2: Connect to WebSocket
      const connectionData = encodeURIComponent('[{"name":"Streaming"}]')
      const wsUrl = `wss://livetiming.formula1.com/signalr/connect?transport=webSockets&clientProtocol=1.5&connectionToken=${encodeURIComponent(connectionToken)}&connectionData=${connectionData}`

      wsRef.current = new WebSocket(wsUrl)

      wsRef.current.onopen = () => {
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
        handleWebSocketMessage(event.data)
      }

      wsRef.current.onerror = (error) => {
        console.error("❌ WebSocket error:", error)
        if (!isDemoMode) {
          setError("Connection error")
          setIsConnected(false)
          setIsDemoMode(false)
        }
      }

      wsRef.current.onclose = (event) => {
        console.log("🔌 WebSocket closed:", event.code, event.reason)
        if (!isDemoMode) {
          setIsConnected(false)
          setError("Connection closed")
          setIsDemoMode(false)

          // Clear any existing data
          setDrivers([])
          setSessionInfo((prev) => ({
            ...prev,
            trackStatus: "No Active Session",
            raceName: "F1 Live Timing",
            timer: "00:00:00",
            weather: { track: 0, air: 0, humidity: 0, condition: "unknown" },
            lapInfo: "-- / --",
          }))

          // Auto-reconnect after 10 seconds
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

      const driver: F1Driver = {
        pos: position,
        code: driverData.RacingNumber || driverNumber,
        name: driverData.BroadcastName || `Driver ${driverNumber}`,
        color: driverColors[position - 1] || "bg-gray-500",
        tire: driverData.Tyres?.Compound?.charAt(0) || "M",
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
        team: driverData.TeamName || driverData.Team || '', // Ajusta aquí según el campo real de la API
      }

      updatedDrivers.push(driver)
    })

    updatedDrivers.sort((a, b) => a.pos - b.pos)
    setDrivers(updatedDrivers)
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
    setSessionInfo((prev) => ({
      ...prev,
      trackStatus: trackData.Status || prev.trackStatus,
    }))
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
    if (!isDemoMode) {
      connectToF1SignalR()
    }
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (demoIntervalRef.current) {
        clearInterval(demoIntervalRef.current)
      }
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [isDemoMode])

  const reconnect = () => {
    // Si estamos en modo demo, no hacer nada al intentar reconectar
    // ya que la demo debería continuar funcionando independientemente
    if (isDemoMode) {
      console.log("🔄 Reconnect called while in demo mode - ignoring")
      return
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
    isConnected,
    error,
    isDemoMode,
    reconnect,
    startDemo,
    stopDemo,
  }
}
