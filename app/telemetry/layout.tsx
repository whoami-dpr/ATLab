import { Navbar } from "../../components/Navbar";

export default function TelemetryLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-black/90">
      <Navbar />
      <main className="p-8 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
} 