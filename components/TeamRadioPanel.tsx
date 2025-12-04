import { TeamRadioMessage, RaceControlMessage } from "@/hooks/useF1SignalR"
import { useState, useRef, useEffect } from "react"

interface TeamRadioPanelProps {
  messages: TeamRadioMessage[]
  raceControlMessages?: RaceControlMessage[]
}

// Typewriter Effect Component
const TypewriterText = ({ text, progress }: { text: string, progress: number }) => {
    // Calculate how many characters to show based on progress (0 to 1)
    // We start showing from the beginning and reveal more as progress increases
    const charIndex = Math.floor(text.length * progress);
    const displayedText = text.slice(0, charIndex);

    return <span>{displayedText}</span>;
};

// Race Control List Component
const RaceControlList = ({ messages }: { messages: RaceControlMessage[] }) => {
    const formatTime = (utcString: string) => {
        try {
            const date = new Date(utcString)
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
        } catch (e) {
            return "--:--"
        }
    }

    return (
        <div className="flex-1 flex flex-col gap-1 h-[400px] overflow-y-auto scrollbar-none min-w-0">
            {[...messages].reverse().map((msg, index) => (
                <div key={`${msg.utc}-${index}`} className="flex bg-white dark:bg-[#1a1d26] rounded overflow-hidden shadow-sm shrink-0 min-h-[36px] border border-gray-200 dark:border-transparent">
                    {/* Left: FIA Logo & Stewards */}
                    <div className="bg-gray-50 dark:bg-[#0f1116] w-20 flex flex-col items-center justify-center p-1 border-r border-gray-200 dark:border-white/10 shrink-0">
                        <img src="/images/FIA.png" alt="FIA" className="w-4 h-4 object-contain mb-0.5 opacity-80" />
                        <span className="text-[9px] font-bold text-gray-500 dark:text-white/60 tracking-wider leading-none">STEWARDS</span>
                        <span className="text-[9px] font-mono text-gray-400 dark:text-white/40 leading-none mt-0.5">{formatTime(msg.utc)}</span>
                    </div>
                    {/* Right: Message */}
                    <div className="flex-1 px-3 py-1 flex items-center bg-white dark:bg-[#1a1d26]">
                        <div className="text-gray-900 dark:text-white text-xs font-bold font-inter leading-tight uppercase flex items-center gap-2">
                            {msg.message.includes("DOUBLE YELLOW") && (
                                <div className="relative w-5 h-3.5 shrink-0">
                                    <div className="absolute top-0 left-0 w-3.5 h-2.5 bg-[#FFD700] rounded-[1px]"></div>
                                    <div className="absolute bottom-0 right-0 w-3.5 h-2.5 bg-[#FFD700] rounded-[1px]"></div>
                                </div>
                            )}
                            {msg.message.includes("CHEQUERED FLAG") && (
                                <div className="w-5 h-3.5 shrink-0 grid grid-cols-4 grid-rows-3 border border-gray-300 dark:border-white/20">
                                    {[...Array(12)].map((_, i) => (
                                        <div key={i} className={`${(Math.floor(i / 4) + i) % 2 === 0 ? 'bg-white' : 'bg-black'} w-full h-full`}></div>
                                    ))}
                                </div>
                            )}
                            {msg.message.includes("GREEN LIGHT") && (
                                <div className="w-5 h-3.5 shrink-0 bg-[#00D2BE] rounded-[1px]"></div>
                            )}
                            {msg.message}
                        </div>
                    </div>
                </div>
            ))}
            {messages.length === 0 && (
                <div className="text-center py-10 text-gray-600 text-xs font-mono">
                    NO RACE CONTROL MESSAGES
                </div>
            )}
        </div>
    );
};

export const TeamRadioPanel = ({ messages, raceControlMessages = [] }: TeamRadioPanelProps) => {
  const [playingUrl, setPlayingUrl] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [progress, setProgress] = useState(0)
  const [currentMessage, setCurrentMessage] = useState<TeamRadioMessage | null>(null)
  
  // AI Transcription State
  const workerRef = useRef<Worker | null>(null)
  const [transcripts, setTranscripts] = useState<Record<string, string>>({})
  const [processingUrl, setProcessingUrl] = useState<string | null>(null)
  const [queue, setQueue] = useState<string[]>([])
  const [modelLoadingProgress, setModelLoadingProgress] = useState<number | null>(null)
  const [isModelReady, setIsModelReady] = useState(false)
  const [isWorkerError, setIsWorkerError] = useState(false)
  
  // Initialize Web Worker (Once)
  useEffect(() => {
    console.log("🎤 Initializing Blob worker...");
    
    const workerCode = `
      import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2';

      // Configure environment
      env.allowLocalModels = false;
      env.useBrowserCache = true;

      console.log("🤖 AI WORKER STARTED");
      
      let transcriber = null;

      const loadModel = async (self) => {
          if (transcriber) return true;
          
          console.log("🤖 Loading model...");
          self.postMessage({ status: 'loading', file: 'onnx', progress: 0 });
          try {
              transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-base.en', {
                  progress_callback: (data) => {
                      if (data.status === 'progress') {
                          self.postMessage({ status: 'loading', file: data.file, progress: data.progress });
                      }
                  }
              });
              console.log("🤖 Model loaded successfully");
              self.postMessage({ status: 'ready' });
              return true;
          } catch (err) {
              console.error("🤖 Model load error:", err);
              self.postMessage({ status: 'error', error: 'Failed to load model: ' + err.message });
              return false;
          }
      };

      self.onmessage = async function(e) {
          const { action, audio, sampleRate, url } = e.data;
          
          if (action === 'init') {
              await loadModel(self);
          }
          else if (action === 'transcribe') {
              const loaded = await loadModel(self);
              if (!loaded) return;

              self.postMessage({ status: 'start', url });
              
              try {
                  console.log("🤖 Running transcription for " + url);
                  const output = await transcriber(audio, {
                      chunk_length_s: 30,
                      stride_length_s: 5,
                      language: 'english',
                      task: 'transcribe',
                      sampling_rate: sampleRate
                  });
                  
                  console.log("🤖 Transcription complete:", output.text);
                  self.postMessage({ status: 'complete', text: output.text, url });
              } catch (err) {
                  console.error("🤖 Transcription error:", err);
                  self.postMessage({ status: 'error', error: 'Transcription failed: ' + err.message, url });
              }
          }
      };
    `;
    
    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(blob);
    
    try {
        // IMPORTANT: type: 'module' is required for imports in Blob workers
        const worker = new Worker(workerUrl, { type: 'module' });
        workerRef.current = worker;
        console.log("🎤 AI Worker initialized successfully")
        
        // Preload model immediately
        worker.postMessage({ action: 'init' });

        worker.onerror = (error) => {
            console.error("❌ Worker Error (Main Thread):", error)
            if (error instanceof ErrorEvent) {
                console.error("❌ Worker Error Details:", error.message, error.filename, error.lineno)
            }
        }

    } catch (e) {
        console.error("❌ Failed to initialize Blob worker:", e)
    }

    return () => {
      console.log("🎤 Terminating worker...");
      workerRef.current?.terminate()
      workerRef.current = null;
    }
  }, []) // Empty dependency array - only run once

  // Populate Queue with untranscribed messages
  useEffect(() => {
      if (messages.length > 0) {
          const untranscribed = messages
              .filter(m => !transcripts[m.audioUrl])
              .map(m => m.audioUrl);
          
          // Only add if not already in queue or processing
          setQueue(prev => {
              const newItems = untranscribed.filter(url => !prev.includes(url) && url !== processingUrl);
              return [...prev, ...newItems];
          });
      }
  }, [messages]) // Intentionally not including transcripts/processingUrl to avoid loops

  // Process Queue
  useEffect(() => {
      if (isModelReady && !processingUrl && queue.length > 0) {
          const nextUrl = queue[0];
          setQueue(prev => prev.slice(1));
          transcribeAudio(nextUrl);
      }
  }, [isModelReady, processingUrl, queue])

  // Handle Worker Messages
  useEffect(() => {
    if (!workerRef.current) return;

    workerRef.current.onmessage = (event) => {
      const { status, text, file, progress, url } = event.data
      
      if (status === 'loading') {
          if (file.includes('onnx')) {
              setModelLoadingProgress(progress)
          }
      } else if (status === 'ready') {
          setModelLoadingProgress(null)
          setIsModelReady(true)
          console.log("✅ AI Model Ready")
      } else if (status === 'start') {
          setProcessingUrl(url)
      } else if (status === 'complete') {
          setProcessingUrl(null)
          setModelLoadingProgress(null)
          if (url) {
              setTranscripts(prev => ({
                  ...prev,
                  [url]: text
              }))
          }
      } else if (status === 'error') {
          console.error("Transcription error:", event.data.error)
          setProcessingUrl(null)
          setModelLoadingProgress(null)
      } else if (status === 'debug') {
          console.log("🤖 Worker Debug:", event.data.message)
      }
    }
  }, [])

  // Typewriter Effect Component moved outside
  const transcribeAudio = async (url: string) => {
    if (!workerRef.current || isWorkerError) return

    try {
        console.log("🎤 Starting transcription for:", url)
        setProcessingUrl(url)
        
        // Fetch audio file
        console.log("🎤 Fetching audio...")
        const response = await fetch(url)
        console.log("🎤 Fetch response status:", response.status)
        const arrayBuffer = await response.arrayBuffer()
        console.log("🎤 Audio fetched, size:", arrayBuffer.byteLength)
        
        // Decode audio using Web Audio API (Main Thread)
        console.log("🎤 Decoding audio...")
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
        console.log("🎤 Audio decoded. Duration:", audioBuffer.duration, "Channels:", audioBuffer.numberOfChannels, "SampleRate:", audioBuffer.sampleRate)
        
        let audioData = audioBuffer.getChannelData(0)
        let finalSampleRate = audioBuffer.sampleRate

        // Resample to 16000Hz if necessary (Whisper expects 16kHz)
        if (audioBuffer.sampleRate !== 16000) {
           console.log("🎤 Resampling from", audioBuffer.sampleRate, "to 16000Hz")
           const offlineCtx = new OfflineAudioContext(1, audioBuffer.duration * 16000, 16000);
           const source = offlineCtx.createBufferSource();
           source.buffer = audioBuffer;
           source.connect(offlineCtx.destination);
           source.start();
           const resampledBuffer = await offlineCtx.startRendering();
           audioData = resampledBuffer.getChannelData(0);
           finalSampleRate = 16000;
           console.log("🎤 Resampling complete. New length:", audioData.length)
        }

        console.log("🎤 Posting to worker...")
        workerRef.current.postMessage({ 
            action: 'transcribe', 
            audio: audioData,
            sampleRate: finalSampleRate,
            url
        })
        console.log("🎤 Message posted to worker")
        
        audioContext.close()

    } catch (e) {
        console.error("❌ Error preparing audio for transcription:", e)
        setProcessingUrl(null)
    }
  }

  const handlePlay = (msg: TeamRadioMessage) => {
    const url = msg.audioUrl
    if (playingUrl === url) {
      // Toggle pause if already playing this one
      if (audioRef.current) {
        if (audioRef.current.paused) {
          audioRef.current.play()
        } else {
          audioRef.current.pause()
          setPlayingUrl(null) // Reset state to show play icon
          setProgress(0)
        }
      }
    } else {
      // Play new one
      if (audioRef.current) {
        audioRef.current.pause()
      }
      setPlayingUrl(url)
      setCurrentMessage(msg)
      setProgress(0)

      if (!transcripts[url] && processingUrl !== url) {
          if (queue.includes(url)) {
              setQueue(prev => [url, ...prev.filter(u => u !== url)])
          }
      }
    }
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime
      const duration = audioRef.current.duration
      if (duration > 0) {
        setProgress(current / duration)
      }
    }
  }

  // Effect to handle audio element source change and play
  useEffect(() => {
    if (playingUrl && audioRef.current) {
      audioRef.current.src = playingUrl
      audioRef.current.play().catch(e => console.error("Error playing audio:", e))
    }
  }, [playingUrl])

  const formatTime = (utcString: string) => {
    try {
      const date = new Date(utcString)
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
    } catch (e) {
      return "--:--"
    }
  }

  return (
    <div className="flex gap-4 items-start relative w-full">
      {/* List Section */}
      <div className="w-fit bg-white dark:bg-[#0b0e14] p-2 font-sans rounded-lg border border-gray-200 dark:border-gray-800/50 shadow-lg dark:shadow-none">
        <div className="flex flex-col gap-0">
          {messages.length === 0 ? (
            <div className="text-center py-4 text-gray-500 text-xs font-mono w-64">
              NO RADIO MESSAGES
            </div>
          ) : (
            messages.map((msg, index) => {
              const isPlaying = playingUrl === msg.audioUrl
              
              return (
                <div key={`${msg.utc}-${index}`} className="flex items-center gap-1 py-0.5 hover:bg-gray-100 dark:hover:bg-white/5 px-2 rounded transition-colors group">
                  {/* Time */}
                  <div className="text-gray-500 dark:text-white text-sm font-inter w-12 text-right shrink-0 font-medium">
                    {formatTime(msg.utc)}
                  </div>
                  
                  {/* Driver Badge */}
                  <div className="w-14 shrink-0 flex justify-center">
                      <div 
                        className="w-full h-7 flex items-center justify-center rounded text-white font-bold text-xs uppercase shadow-sm"
                        style={{ 
                          backgroundColor: msg.teamColor,
                          fontFamily: 'Formula1 Display, Arial, sans-serif'
                        }}
                      >
                        {msg.driverCode}
                      </div>
                  </div>
                  
                  {/* Play Button */}
                  <button 
                    onClick={() => handlePlay(msg)}
                    className="text-gray-900 dark:text-white hover:text-gray-600 dark:hover:text-gray-300 transition-colors shrink-0 focus:outline-none w-8 flex justify-center"
                  >
                    {isPlaying ? (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <rect x="6" y="4" width="4" height="16" />
                        <rect x="14" y="4" width="4" height="16" />
                      </svg>
                    ) : (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5V19L19 12L8 5Z" />
                      </svg>
                    )}
                  </button>
                  
                  {/* Progress Bar (Mini) */}
                  <div className="w-32 h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden flex items-center">
                     <div 
                        className="h-full bg-blue-600 dark:bg-white transition-all duration-100 ease-linear"
                        style={{ width: `${isPlaying ? progress * 100 : 0}%` }}
                     />
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Now Playing Card (Spotify Style) */}
      <div 
          className="w-80 h-80 rounded-xl p-6 flex flex-col justify-between relative overflow-hidden transition-all duration-500 ease-in-out"
          style={{ 
              backgroundColor: currentMessage ? currentMessage.teamColor : '#1a1d26',
              boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)'
          }}
      >
          {/* Background Gradient Overlay for readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/40 pointer-events-none" />
          
          {/* Content */}
          <div className="relative z-10 flex flex-col h-full">
              {currentMessage ? (
                  <>
                    {/* Driver Code Header */}
                    <div className="mb-6 shrink-0">
                        <h2 
                            className="text-5xl font-bold text-white tracking-tighter drop-shadow-md"
                            style={{ fontFamily: 'Formula1 Display, Arial, sans-serif' }}
                        >
                            {currentMessage.driverCode}
                        </h2>
                    </div>

                    {/* Transcript / Lyrics Style Text */}
                    <div className="flex-1 overflow-y-auto pr-2 min-h-0 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                        <p className="text-lg font-medium text-white/90 leading-tight drop-shadow-sm font-inter">
                            {transcripts[currentMessage.audioUrl] || currentMessage.transcript || (
                               <span className="italic opacity-70 flex items-center gap-2">
                                    Audio transmission...
                               </span>
                            )}
                        </p>
                    </div>
                  </>
              ) : (
                  <>
                    {/* Default Header */}
                    <div className="mb-6 shrink-0">
                        <h2 
                            className="text-4xl font-bold text-white/20 tracking-tighter"
                            style={{ fontFamily: 'Formula1 Display, Arial, sans-serif' }}
                        >
                            TEAM RADIO
                        </h2>
                    </div>
                    
                    {/* Default Text */}
                    <div className="flex-1 flex items-center justify-center">
                        <p className="text-white/40 text-center font-inter text-sm">
                            Select a radio message<br/>to start listening
                        </p>
                    </div>
                  </>
              )}

              {/* Footer Branding */}
              <div className="mt-4 pt-4 border-t border-white/20 flex justify-between items-end shrink-0">
                  <span className="text-white/60 text-sm font-medium">ATLab AI</span>
                  {/* Visualizer Bars Animation */}
                  <div className="flex gap-1 items-end h-4">
                      <div className={`w-1 bg-white/80 ${currentMessage && (playingUrl || progress > 0) ? 'animate-[pulse_0.6s_ease-in-out_infinite]' : 'opacity-30'}`} style={{ height: '60%' }}></div>
                      <div className={`w-1 bg-white/80 ${currentMessage && (playingUrl || progress > 0) ? 'animate-[pulse_0.8s_ease-in-out_infinite]' : 'opacity-30'}`} style={{ height: '100%' }}></div>
                      <div className={`w-1 bg-white/80 ${currentMessage && (playingUrl || progress > 0) ? 'animate-[pulse_0.5s_ease-in-out_infinite]' : 'opacity-30'}`} style={{ height: '40%' }}></div>
                      <div className={`w-1 bg-white/80 ${currentMessage && (playingUrl || progress > 0) ? 'animate-[pulse_0.7s_ease-in-out_infinite]' : 'opacity-30'}`} style={{ height: '80%' }}></div>
                  </div>
              </div>
          </div>
      </div>

      {/* Race Control Messages */}
      <RaceControlList messages={raceControlMessages} />

      {/* Hidden Audio Element */}
      <audio 
        ref={audioRef} 
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => {
            setPlayingUrl(null)
            setProgress(0)
        }}
        onError={() => {
            setPlayingUrl(null)
            setProgress(0)
        }}
        className="hidden"
      />

      {/* Worker Status Debug */}

    </div>
  )
}
