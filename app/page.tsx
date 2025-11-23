"use client";
import { useF1SignalR } from "../hooks/useF1SignalR";
import { SessionHeader } from "../components/SessionHeader";
import { TimingTable } from "../components/TimingTable";
import { EmptyState } from "../components/EmptyState";
import { Navbar } from "../components/Navbar";
import { F1ConnectionTester } from "../components/F1ConnectionTester";
import { useThemeOptimized } from "../hooks/useThemeOptimized";

export default function TelemetryLab() {
  const { drivers, sessionInfo, isConnected, error, reconnect, hasActiveSession, forceActiveSession, fastestLap } = useF1SignalR();
  const { theme } = useThemeOptimized();

  // Mostrar datos si hay drivers O si hay una sesión activa (incluso sin drivers aún)
  const shouldShowData = drivers.length > 0 || (isConnected && hasActiveSession);

  // Hacer la función disponible globalmente para el botón
  if (typeof window !== 'undefined') {
    (window as any).forceActiveSession = forceActiveSession;
  }

  return (
    <div className={`min-h-screen w-full relative flex flex-col ${
      theme === 'light' ? 'bg-gray-50' : 'bg-black'
    }`}>
      <Navbar />
      <div className={`flex-1 ${
        theme === 'light' ? 'bg-transparent' : 'bg-transparent'
      }`}>
        <SessionHeader 
          sessionInfo={sessionInfo} 
          isConnected={isConnected} 
          error={error} 
          hasActiveSession={hasActiveSession}
          fastestLap={fastestLap}
        />
        <div className="px-0 md:px-2 pb-4 md:pb-6 max-w-full mx-auto">
          {!shouldShowData ? (
            <EmptyState reconnect={reconnect} />
          ) : (
            <>
              <TimingTable drivers={drivers} drsEnabled={sessionInfo.drsEnabled} />
            </>
          )}
        </div>
      </div>
      <F1ConnectionTester />
    </div>
  );
}
