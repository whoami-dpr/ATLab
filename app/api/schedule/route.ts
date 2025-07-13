// Cloudflare Pages Edge Runtime Configuration
export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { parseISO, format, isBefore } from 'date-fns';

// Simple ICS parser compatible with Edge Runtime
function parseICS(icsText: string) {
  const events: any[] = [];
  const lines = icsText.split('\n');
  let currentEvent: any = {};
  let inEvent = false;

  for (const line of lines) {
    if (line.startsWith('BEGIN:VEVENT')) {
      inEvent = true;
      currentEvent = {};
    } else if (line.startsWith('END:VEVENT')) {
      if (inEvent && currentEvent.summary) {
        events.push(currentEvent);
      }
      inEvent = false;
    } else if (inEvent) {
      if (line.startsWith('SUMMARY:')) {
        currentEvent.summary = line.substring(8);
      } else if (line.startsWith('DTSTART:')) {
        const dateStr = line.substring(8);
        currentEvent.start = new Date(
          dateStr.substring(0, 4) + '-' +
          dateStr.substring(4, 6) + '-' +
          dateStr.substring(6, 8) + 'T' +
          dateStr.substring(9, 11) + ':' +
          dateStr.substring(11, 13) + ':' +
          dateStr.substring(13, 15) + 'Z'
        );
      } else if (line.startsWith('DTEND:')) {
        const dateStr = line.substring(6);
        currentEvent.end = new Date(
          dateStr.substring(0, 4) + '-' +
          dateStr.substring(4, 6) + '-' +
          dateStr.substring(6, 8) + 'T' +
          dateStr.substring(9, 11) + ':' +
          dateStr.substring(11, 13) + ':' +
          dateStr.substring(13, 15) + 'Z'
        );
      } else if (line.startsWith('LOCATION:')) {
        currentEvent.location = line.substring(9);
      }
    }
  }

  return events;
}

const ICS_URL = 'https://ics.ecal.com/ecal-sub/660897ca63f9ca0008bcbea6/Formula%201.ics';

export async function GET() {
  try {
    const data = await fetch(ICS_URL);
    const icsText = await data.text();
    const events = parseICS(icsText);

    // Agrupar por carrera (round)
    const rounds: Record<string, any> = {};
    for (const event of events) {
      if (!event.summary) continue;

      // Ejemplo de summary: "FORMULA 1 BELGIAN GRAND PRIX 2025 - RACE"
      const match = event.summary.match(/FORMULA 1 (.+?) - (.+)/);
      if (!match) continue;
      const [_, roundName, sessionKind] = match;

      if (!rounds[roundName]) {
        rounds[roundName] = {
          name: roundName,
          country: event.location || '',
          start: event.start,
          end: event.end,
          sessions: [],
        };
      }
      // Actualizar start/end globales
      if (isBefore(event.start, rounds[roundName].start)) {
        rounds[roundName].start = event.start;
      }
      if (isBefore(rounds[roundName].end, event.end)) {
        rounds[roundName].end = event.end;
      }
      rounds[roundName].sessions.push({
        kind: sessionKind,
        start: event.start,
        end: event.end,
      });
    }

    // Convertir a array y ordenar
    const roundsArr = Object.values(rounds).map((round: any) => ({
      ...round,
      sessions: round.sessions.sort((a: any, b: any) => a.start - b.start),
      over: isBefore(round.end, new Date()),
    })).sort((a: any, b: any) => a.start - b.start);

    return NextResponse.json({ schedule: roundsArr, success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch or parse F1 schedule' }, { status: 500 });
  }
} 