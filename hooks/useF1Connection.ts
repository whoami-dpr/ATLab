"use client"

import { useState, useEffect, useRef, useCallback } from 'react'

interface F1ConnectionConfig {
  endpoint: string
  name: string
  description: string
}

const F1_CONNECTION_CONFIGS: F1ConnectionConfig[] = [
  {
    endpoint: 'https://livetiming.formula1.com/signalr',
    name: 'F1 Official Live Timing',
    description: 'API oficial de F1 Live Timing'
  }
]

export const useF1Connection = () => {
  const [currentConfig, setCurrentConfig] = useState<F1ConnectionConfig>(F1_CONNECTION_CONFIGS[0])
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<string>('Disconnected')
  const [sessionStatus, setSessionStatus] = useState<string>('Unknown')
  const [dataReceived, setDataReceived] = useState(false)
  const [messageCount, setMessageCount] = useState(0)
  const [forceDataDetection, setForceDataDetection] = useState(false)
  
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const messageTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const connectToF1 = useCallback(async (config: F1ConnectionConfig) => {
    console.log(`🔄 Attempting to connect to ${config.name}...`)
    setCurrentConfig(config)
    setError(null)
    setConnectionStatus('Connecting...')
    
    try {
      await connectToOfficialF1API()
    } catch (err) {
      console.error(`❌ Failed to connect to ${config.name}:`, err)
      setError(`Failed to connect to ${config.name}: ${err}`)
      setConnectionStatus('Failed')
    }
  }, [])

  const connectToOfficialF1API = async () => {
    console.log('🔗 Connecting to official F1 API...')
    
    // Step 1: Negotiate
    const negotiateResponse = await fetch('/api/f1/negotiate')
    if (!negotiateResponse.ok) {
      throw new Error(`Negotiate failed: ${negotiateResponse.status}`)
    }
    
    const negotiateData = await negotiateResponse.json()
    console.log('📡 Negotiate data received:', negotiateData)
    
    // Step 2: Connect WebSocket
    const connectionData = encodeURIComponent('[{"name":"Streaming"}]')
    const wsUrl = `wss://livetiming.formula1.com/signalr/connect?transport=webSockets&clientProtocol=1.5&connectionToken=${encodeURIComponent(negotiateData.ConnectionToken)}&connectionData=${connectionData}`
    
    console.log('🔗 WebSocket URL:', wsUrl.substring(0, 100) + '...')
    
    wsRef.current = new WebSocket(wsUrl)
    
    wsRef.current.onopen = () => {
      console.log('✅ WebSocket connected to official F1 API')
      setIsConnected(true)
      setConnectionStatus('Connected')
      
      // Subscribe to feeds
      setTimeout(() => {
        subscribeToFeeds()
      }, 1000)
    }
    
    wsRef.current.onmessage = (event) => {
      setMessageCount(prev => prev + 1)
      console.log(`📨 Message ${messageCount + 1} received from official F1 API`)
      console.log(`📨 Raw message data:`, event.data)
      
      try {
        const messages = event.data.split('\x1e').filter(msg => msg.trim())
        
        messages.forEach((message, index) => {
          try {
            const parsed = JSON.parse(message)
            console.log(`📦 Parsed message ${index}:`, parsed)
            
            // Detectar cualquier tipo de datos de F1
            if (parsed.M && Array.isArray(parsed.M)) {
              console.log(`📦 M array length: ${parsed.M.length}`)
              if (parsed.M.length > 0) {
                console.log('🎉 F1 data received from official API!')
                console.log('🎉 M array content:', parsed.M)
                setDataReceived(true)
                setSessionStatus('Active Session')
                clearTimeout(messageTimeoutRef.current!)
              } else {
                console.log('⏳ Empty M array - no active F1 session, but connection is working!')
                // Considerar arrays M vacíos como conexión exitosa (no hay sesión activa)
                setDataReceived(true)
                setSessionStatus('No Active Session')
                clearTimeout(messageTimeoutRef.current!)
              }
            } else if (parsed.target === "Streaming") {
              console.log('🎉 Direct F1 streaming data received!')
              console.log('🎉 Streaming data:', parsed)
              setDataReceived(true)
              clearTimeout(messageTimeoutRef.current!)
            } else if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
              console.log('🎉 Other F1 data format detected!')
              console.log('🎉 Data:', parsed)
              setDataReceived(true)
              clearTimeout(messageTimeoutRef.current!)
            } else if (forceDataDetection) {
              console.log('🎉 Force detection: considering any message as data!')
              setDataReceived(true)
            } else {
              console.log('📊 Empty or unknown message format')
            }
          } catch (e) {
            console.log('⚠️ Failed to parse message:', e)
            console.log('⚠️ Raw message:', message)
          }
        })
      } catch (e) {
        console.log('⚠️ Failed to process message:', e)
        console.log('⚠️ Raw event data:', event.data)
      }
    }
    
    wsRef.current.onerror = (error) => {
      console.error('❌ WebSocket error:', error)
      setError('WebSocket connection error')
      setConnectionStatus('Error')
    }
    
    wsRef.current.onclose = (event) => {
      console.log('🔌 WebSocket closed:', event.code, event.reason)
      setIsConnected(false)
      setConnectionStatus('Disconnected')
      
      if (event.code !== 1000) {
        setError(`Connection closed: ${event.code} - ${event.reason || 'No reason'}`)
      }
    }
  }


  const subscribeToFeeds = () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.log('❌ Cannot subscribe: WebSocket not open')
      return
    }

    console.log('📡 Subscribing to F1 feeds...')
    
    // Suscripción principal
    const subscription = {
      target: "Streaming",
      type: 1,
      invocationId: "0",
      arguments: ["Subscribe", [
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
      ]]
    }
    
    const message = JSON.stringify(subscription) + "\x1e"
    console.log('📡 Sending subscription:', message.substring(0, 100) + '...')
    wsRef.current.send(message)
    
    // Suscripción alternativa con formato diferente
    setTimeout(() => {
      console.log('📡 Sending alternative subscription...')
      const altSubscription = {
        target: "Streaming",
        type: 1,
        invocationId: "1",
        arguments: ["Subscribe", ["TimingData", "SessionInfo", "DriverList"]]
      }
      const altMessage = JSON.stringify(altSubscription) + "\x1e"
      console.log('📡 Alternative subscription:', altMessage)
      wsRef.current?.send(altMessage)
    }, 2000)
    
    // Suscripción mínima
    setTimeout(() => {
      console.log('📡 Sending minimal subscription...')
      const minSubscription = {
        target: "Streaming",
        type: 1,
        invocationId: "2",
        arguments: ["Subscribe", ["Heartbeat"]]
      }
      const minMessage = JSON.stringify(minSubscription) + "\x1e"
      console.log('📡 Minimal subscription:', minMessage)
      wsRef.current?.send(minMessage)
    }, 4000)
    
    // Set timeout for data detection
    messageTimeoutRef.current = setTimeout(() => {
      if (!dataReceived) {
        console.log('⏰ No data received after 20 seconds, retrying...')
        tryNextAPI()
      }
    }, 20000)
  }

  const tryNextAPI = () => {
    console.log('🔄 Retrying F1 Official API...')
    connectToF1(currentConfig)
  }

  const disconnect = () => {
    if (wsRef.current) {
      if (wsRef.current.close) {
        wsRef.current.close()
      }
      wsRef.current = null
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    
    if (messageTimeoutRef.current) {
      clearTimeout(messageTimeoutRef.current)
    }
    
    setIsConnected(false)
    setConnectionStatus('Disconnected')
    setError(null)
    setDataReceived(false)
    setMessageCount(0)
  }

  const reconnect = () => {
    disconnect()
    setTimeout(() => {
      connectToF1(currentConfig)
    }, 1000)
  }

  const toggleForceDetection = () => {
    setForceDataDetection(prev => !prev)
    if (!forceDataDetection) {
      console.log('🎯 Force data detection enabled - any message will be considered as data')
      setDataReceived(true)
    } else {
      console.log('🎯 Force data detection disabled')
      setDataReceived(false)
    }
  }

  // Auto-connect on mount
  useEffect(() => {
    connectToF1(currentConfig)
    
    return () => {
      disconnect()
    }
  }, [])

  return {
    currentConfig,
    isConnected,
    error,
    connectionStatus,
    dataReceived,
    messageCount,
    forceDataDetection,
    sessionStatus,
    connectToF1,
    disconnect,
    reconnect,
    tryNextAPI,
    toggleForceDetection,
    availableConfigs: F1_CONNECTION_CONFIGS
  }
}
