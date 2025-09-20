"use client";
import { useF1SignalR } from "../hooks/useF1SignalR";
import { SessionHeader } from "../components/SessionHeader";
import { TimingTable } from "../components/TimingTable";
import { DemoControls } from "../components/DemoControls";
import { EmptyState } from "../components/EmptyState";
import { Navbar } from "../components/Navbar";
import { F1ConnectionTester } from "../components/F1ConnectionTester";

export default function TelemetryLab() {
  const { drivers, sessionInfo, isConnected, error, isDemoMode, reconnect, startDemo, stopDemo, hasActiveSession, forceActiveSession } = useF1SignalR();

  // Mostrar datos si hay drivers O si hay una sesión activa (incluso sin drivers aún)
  const shouldShowData = drivers.length > 0 || (isConnected && hasActiveSession);

  // Hacer la función disponible globalmente para el botón
  if (typeof window !== 'undefined') {
    (window as any).forceActiveSession = forceActiveSession;
  }

  return (
    <div className="min-h-screen w-full relative flex flex-col">
      <Navbar />
      <div className="flex-1 bg-transparent">
        <SessionHeader sessionInfo={sessionInfo} isConnected={isConnected} isDemoMode={isDemoMode} error={error} hasActiveSession={hasActiveSession} />
        <div className="px-4 py-6 max-w-full mx-auto">
          {!shouldShowData ? (
            <EmptyState reconnect={reconnect} startDemo={startDemo} />
          ) : (
            <>
              <DemoControls isDemoMode={isDemoMode} startDemo={startDemo} stopDemo={stopDemo} />
              <TimingTable drivers={drivers} />
            </>
          )}
        </div>
      </div>
      <F1ConnectionTester />
    </div>
  );
}
