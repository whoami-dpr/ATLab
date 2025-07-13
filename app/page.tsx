"use client";
import { useF1SignalR } from "../hooks/useF1SignalR";
import { SessionHeader } from "../components/SessionHeader";
import { TimingTable } from "../components/TimingTable";
import { DemoControls } from "../components/DemoControls";
import { EmptyState } from "../components/EmptyState";
import { Navbar } from "../components/Navbar";

export default function TelemetryLab() {
  const { drivers, sessionInfo, isConnected, error, isDemoMode, reconnect, startDemo, stopDemo } = useF1SignalR();

  return (
    <div className="min-h-screen w-full relative flex flex-col">
      <Navbar />
      <div className="flex-1 bg-transparent">
        <SessionHeader sessionInfo={sessionInfo} isConnected={isConnected} isDemoMode={isDemoMode} error={error} />
        <div className="p-6">
          {drivers.length === 0 ? (
            <EmptyState reconnect={reconnect} startDemo={startDemo} />
          ) : (
            <>
              <DemoControls isDemoMode={isDemoMode} startDemo={startDemo} stopDemo={stopDemo} />
              <TimingTable drivers={drivers} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
