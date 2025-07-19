import { TelemetryChart } from './TelemetryChart';
import type { TelemetryData } from '../../hooks/useTelemetry';

interface TelemetryPanelProps {
  data: TelemetryData;
  data2?: TelemetryData | null;
  selectedLap?: number | null;
  selectedLap2?: number | null;
}

export default function TelemetryPanel({ data, data2, selectedLap, selectedLap2 }: TelemetryPanelProps) {
  // Solo mostrar data2 si selectedLap2 es válido y distinto de selectedLap
  const showComparison = selectedLap2 && selectedLap2 !== selectedLap && data2 ? data2 : undefined;
  return (
    <div>
      <TelemetryChart data={data} data2={showComparison} yKey="speed" label="Speed (km/h)" color="#e53935" color2="#22d3ee" />
      <TelemetryChart data={data} data2={showComparison} yKey="throttle" label="Throttle (%)" color="#43a047" color2="#22d3ee" />
      <TelemetryChart data={data} data2={showComparison} yKey="brake" label="Brake (%)" color="#1e88e5" color2="#22d3ee" />
      <TelemetryChart data={data} data2={showComparison} yKey="rpm" label="RPM" color="#fbc02d" color2="#22d3ee" />
      <TelemetryChart data={data} data2={showComparison} yKey="gear" label="Gear" color="#8e24aa" color2="#22d3ee" />
      <TelemetryChart data={data} data2={showComparison} yKey="drs" label="DRS" color="#00bcd4" color2="#22d3ee" />
    </div>
  );
} 