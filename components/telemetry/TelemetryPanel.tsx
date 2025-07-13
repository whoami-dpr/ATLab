import { TelemetryChart } from './TelemetryChart';
import type { TelemetryData } from '../../hooks/useTelemetry';

interface TelemetryPanelProps {
  data: TelemetryData;
}

export default function TelemetryPanel({ data }: TelemetryPanelProps) {
  return (
    <div>
      <TelemetryChart data={data} yKey="speed" label="Speed (km/h)" color="#e53935" />
      <TelemetryChart data={data} yKey="throttle" label="Throttle (%)" color="#43a047" />
      <TelemetryChart data={data} yKey="brake" label="Brake (%)" color="#1e88e5" />
      <TelemetryChart data={data} yKey="rpm" label="RPM" color="#fbc02d" />
      <TelemetryChart data={data} yKey="gear" label="Gear" color="#8e24aa" />
      <TelemetryChart data={data} yKey="drs" label="DRS" color="#00bcd4" />
    </div>
  );
} 