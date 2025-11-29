"use client";
import { useF1SignalR } from "../hooks/useF1SignalR";
import { SessionHeader } from "../components/SessionHeader";
import { TimingTable } from "../components/TimingTable";
import { EmptyState } from "../components/EmptyState";
import { Navbar } from "../components/Navbar";
import { F1ConnectionTester } from "../components/F1ConnectionTester";
import { TeamRadioPanel } from "../components/TeamRadioPanel";

export default function TelemetryLab() {
  const { drivers, sessionInfo, isConnected, error, reconnect, hasActiveSession, forceActiveSession, fastestLap, inferredPhase, teamRadioMessages, raceControlMessages } = useF1SignalR();

  // Mostrar datos si hay drivers O si hay una sesión activa (incluso sin drivers aún)
  const shouldShowData = drivers.length > 0 || (isConnected && hasActiveSession);

  // Hacer la función disponible globalmente para el botón
  if (typeof window !== 'undefined') {
    (window as any).forceActiveSession = forceActiveSession;
  }

  return (
    <div className="min-h-screen w-full relative flex flex-col bg-gray-50 dark:bg-black transition-colors duration-200">
      <Navbar />
      <div className="flex-1 bg-transparent">
        <SessionHeader 
          sessionInfo={sessionInfo} 
          isConnected={isConnected} 
          error={error} 
          hasActiveSession={hasActiveSession}
          fastestLap={fastestLap}
          inferredPhase={inferredPhase}
        />
        <div className="px-0 md:px-2 pb-4 md:pb-6 max-w-full mx-auto">
          {!shouldShowData ? (
            <EmptyState reconnect={reconnect} />
          ) : (
            <div className="flex flex-col gap-4">
              <div className="w-full overflow-hidden">
                <TimingTable drivers={drivers} drsEnabled={sessionInfo.drsEnabled} />
              </div>
              <div className="w-fit">
                <TeamRadioPanel messages={teamRadioMessages} raceControlMessages={raceControlMessages} />
              </div>
            </div>
          )}
        </div>
      </div>
      <F1ConnectionTester />
    </div>
  );
}
