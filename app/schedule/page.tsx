"use client";
import { useSchedule } from '../../hooks/useSchedule';
import { format, formatDistanceStrict } from 'date-fns';
import { Countdown } from '../../components/Countdown';
import { Navbar } from '../../components/Navbar';

// Mapping de nombre de país a código de bandera (ISO 3166-1 alpha-3)
const countryNameToCode: Record<string, string> = {
  Australia: 'aus',
  Austria: 'aut',
  Azerbaijan: 'aze',
  Belgium: 'bel',
  Brazil: 'bra',
  Bahrain: 'brn',
  Canada: 'can',
  China: 'chn',
  Spain: 'esp',
  France: 'fra',
  UnitedKingdom: 'gbr',
  Hungary: 'hun',
  Italy: 'ita',
  Japan: 'jpn',
  Mexico: 'mex',
  Monaco: 'mco',
  Netherlands: 'nld',
  Qatar: 'qat',
  SaudiArabia: 'sau',
  Singapore: 'sgp',
  USA: 'usa',
  UnitedStates: 'usa',
  Miami: 'usa',
  LasVegas: 'usa',
  AbuDhabi: 'are',
  // ...agrega más según tus banderas
};

function getFlagUrl(country: string, country_key?: string) {
  let code = country_key;
  if (!code) {
    code = countryNameToCode[country.replace(/\s/g, '')] || '';
  }
  return code ? `/country-flags/${code.toLowerCase()}.svg` : undefined;
}

function getSessionName(kind: string, allSessions: any[], currentIndex: number) {
  // Si es una sesión de práctica, contar cuántas sesiones de práctica han aparecido antes
  if (kind === 'Pract' || kind === 'Prac' || kind === 'Practice' || kind.toLowerCase().includes('practice')) {
    let practiceCount = 0;
    for (let i = 0; i < currentIndex; i++) {
      if (allSessions[i] && (allSessions[i].kind === 'Pract' || allSessions[i].kind === 'Prac' || allSessions[i].kind === 'Practice' || allSessions[i].kind.toLowerCase().includes('practice'))) {
        practiceCount++;
      }
    }
    return `Practice ${practiceCount + 1}`;
  }
  
  // Lógica especial para sesiones de Sprint
  if (kind === 'Sprint' || kind === 'Sp' || kind === 'Spri' || kind === 'Sprint R') {
    // Si hay una sesión de Sprint después de esta en el fin de semana, esta es Qualification
    const hasSprintAfter = allSessions.slice(currentIndex + 1).some(session => 
      session && (session.kind === 'Sprint' || session.kind === 'Sp' || session.kind === 'Spri' || session.kind === 'Sprint R')
    );
    
    if (hasSprintAfter) {
      return 'Sprint Qualification';
    } else {
      return 'Sprint Race';
    }
  }
  
  const sessionNames: Record<string, string> = {
    'Qua': 'Qualifying',
    'Qu': 'Qualifying',
    'Qualify': 'Qualifying',
    'Qualif': 'Qualifying',
    'Race': 'Race',
    'Sprint Quali': 'Sprint Qualification',
    'FP1': 'Practice 1',
    'FP2': 'Practice 2', 
    'FP3': 'Practice 3',
    'Q1': 'Qualifying 1',
    'Q2': 'Qualifying 2',
    'Q3': 'Qualifying 3',
    'Sprint Qualifying': 'Sprint Qualification',
    'Sprint Race': 'Sprint Race'
  };
  
  return sessionNames[kind] || kind;
}

export default function SchedulePage() {
  const { schedule, loading, error, nextSession, nextRace } = useSchedule();
  const now = new Date();

  return (
    <div className="min-h-screen w-full relative font-inter">
      {/* X Organizations Black Background with Top Glow */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(120, 180, 255, 0.25), transparent 70%), #000000",
        }}
      />
      <div className="relative z-10 flex flex-col min-h-screen text-white">
        <Navbar />
        <div className="flex-1 p-8">
          <h1 className="text-3xl font-bold mb-0">Schedule</h1>
          <div className="text-gray-400 text-sm mb-6">All times are local time</div>
          {loading && <div>Loading...</div>}
          {error && <div className="text-red-400">{error}</div>}
          {!loading && !error && (
            <>
              {/* Fila superior: Up Next y Próxima carrera */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start mb-12">
                {/* Columna izquierda: Countdowns */}
                <div className="pr-2">
                  {nextSession && (
                    <div className="mb-4">
                      <div className="text-xl font-semibold mb-1">Next session in</div>
                      <Countdown
                        targetDate={nextSession.start}
                        label={undefined}
                        className="mb-1"
                      />
                      <div className="text-gray-400 mt-1 text-xs">
                        {nextSession.kind}: {format(new Date(nextSession.start), 'EEEE, MMMM d, yyyy')} – {format(new Date(nextSession.start), 'HH:mm')} - {format(new Date(nextSession.end), 'HH:mm')}
                      </div>
                    </div>
                  )}
                  <div className="border-b border-gray-700 my-2" />
                  {nextRace && (
                    <div className="mb-1">
                      <div className="text-xl font-semibold mb-1">Next race in</div>
                      <Countdown
                        targetDate={nextRace.start}
                        label={undefined}
                        className="mb-1"
                      />
                      {/* Fecha y hora de la próxima carrera */}
                      {(() => {
                        const raceSession = nextRace.round.sessions.find(
                          (s: any) => s.kind && s.kind.toLowerCase() === 'race'
                        );
                        return raceSession ? (
                          <div className="text-gray-400 mt-1 text-xs">
                            Race: {format(new Date(raceSession.start), 'EEEE, MMMM d, yyyy')} – {format(new Date(raceSession.start), 'HH:mm')} - {format(new Date(raceSession.end), 'HH:mm')}
                          </div>
                        ) : null;
                      })()}
                    </div>
                  )}
                </div>
                {/* Columna derecha: Tarjeta de próxima carrera más compacta */}
                {nextRace && (
                  <div className="w-full bg-[#181824] rounded-2xl p-6 shadow-xl border border-[#232336]">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {(() => {
                          const flagUrl = getFlagUrl(nextRace.round.country);
                          return flagUrl ? (
                            <div className="w-16 h-10 rounded-xl overflow-hidden shadow border border-gray-700">
                              <img src={flagUrl} alt={nextRace.round.country} className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <span className="text-3xl">🏁</span>
                          );
                        })()}
                        <span className="text-2xl font-semibold">{nextRace.round.country}</span>
                      </div>
                      <div className="text-lg text-gray-400 font-medium">
                        {format(new Date(nextRace.round.start), 'LLLL d')}<span className="text-gray-400">–{format(new Date(nextRace.round.end), 'd')}</span>
                      </div>
                    </div>
                    <div className="border-b border-gray-700 my-3" />
                    {/* Grid de días y sesiones más grande */}
                    <div className="grid grid-cols-3 gap-4 w-full mt-4">
                      {(() => {
                        // Obtener todas las sesiones del fin de semana para la numeración correcta
                        const allWeekendSessions = getRaceDays(nextRace.round.sessions)
                          .flatMap(day => day.sessions)
                          .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
                        
                        return ['Friday', 'Saturday', 'Sunday'].map((day) => {
                          const sessions = getRaceDays(nextRace.round.sessions).find(d => d.day === day)?.sessions || [];
                          return (
                            <div key={day}>
                              <div className="font-bold text-white mb-2 text-base">{day}</div>
                              {sessions.length === 0 ? (
                                <div className="text-gray-600 text-xs italic">—</div>
                              ) : (
                                sessions.map((session: any, index: number) => {
                                  // Encontrar el índice global de esta sesión en todas las sesiones del fin de semana
                                  const globalIndex = allWeekendSessions.findIndex(s => 
                                    s.kind === session.kind && 
                                    s.start === session.start && 
                                    s.end === session.end
                                  );
                                  return (
                                    <div key={session.kind + session.start} className="mb-1">
                                      <div className="font-bold text-white text-sm">{getSessionName(session.kind, allWeekendSessions, globalIndex)}</div>
                                      <div className="text-gray-300 text-xs">
                                        {format(new Date(session.start), 'HH:mm')} - {format(new Date(session.end), 'HH:mm')}
                                      </div>
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                )}
              </div>
              {/* Schedule completo debajo, ocupando todo el ancho */}
              <div className="mb-8">
                <div className="space-y-10">
                  {schedule.map((round: any) => (
                    <div key={round.name} className="w-full bg-[#181824] rounded-2xl p-6 shadow-xl border border-[#232336]">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          {(() => {
                            const flagUrl = getFlagUrl(round.country);
                            return flagUrl ? (
                              <img src={flagUrl} alt={round.country} className="w-10 h-7 rounded shadow border border-gray-700" />
                            ) : (
                              <span className="text-3xl">🏁</span>
                            );
                          })()}
                          <span className="text-2xl font-semibold">{round.name}</span>
                          {round.over && <span className="ml-2 text-red-400 text-base font-medium">Over</span>}
                        </div>
                        <div className="text-lg text-gray-300 font-medium">
                          {format(new Date(round.start), 'LLLL d')}<span className="text-gray-400">–{format(new Date(round.end), 'd')}</span>
                        </div>
                      </div>
                      <div className="border-b border-gray-700 my-2" />
                      {/* Grid de días y sesiones */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                        {(() => {
                          // Obtener todas las sesiones del fin de semana para la numeración correcta
                          const allWeekendSessions = getRaceDays(round.sessions)
                            .flatMap(day => day.sessions)
                            .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
                          
                          return ['Friday', 'Saturday', 'Sunday'].map((day) => {
                            const sessions = getRaceDays(round.sessions).find(d => d.day === day)?.sessions || [];
                            return (
                              <div key={day}>
                                <div className="font-semibold text-white mb-2">{day}</div>
                                {sessions.length === 0 ? (
                                  <div className="text-gray-600 text-sm italic">—</div>
                                ) : (
                                  sessions.map((session: any, index: number) => {
                                    // Encontrar el índice global de esta sesión en todas las sesiones del fin de semana
                                    const globalIndex = allWeekendSessions.findIndex(s => 
                                      s.kind === session.kind && 
                                      s.start === session.start && 
                                      s.end === session.end
                                    );
                                    return (
                                      <div key={session.kind + session.start} className="mb-1">
                                        <div className="font-bold text-white text-sm">{getSessionName(session.kind, allWeekendSessions, globalIndex)}</div>
                                        <div className="text-gray-300 text-xs">
                                          {format(new Date(session.start), 'HH:mm')} - {format(new Date(session.end), 'HH:mm')}
                                        </div>
                                      </div>
                                    );
                                  })
                                )}
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper para agrupar sesiones por día (en inglés)
function getRaceDays(sessions: any[]) {
  const daysMap: Record<string, any> = {};
  sessions.forEach(session => {
    // Usar UTC para evitar problemas de zona horaria
    const date = new Date(session.start);
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const day = dayNames[date.getUTCDay()];
    console.log(`Session ${session.kind} on ${day} at ${session.start}`);
    // Mapear días a nombres consistentes
    const dayMapping: Record<string, string> = {
      'Monday': 'Monday',
      'Tuesday': 'Tuesday', 
      'Wednesday': 'Wednesday',
      'Thursday': 'Thursday',
      'Friday': 'Friday',
      'Saturday': 'Saturday',
      'Sunday': 'Sunday'
    };
    const mappedDay = dayMapping[day] || day;
    if (!daysMap[mappedDay]) daysMap[mappedDay] = [];
    daysMap[mappedDay].push(session);
  });
  console.log('Days found:', Object.keys(daysMap));
  return Object.entries(daysMap).map(([day, sessions]) => ({ day, sessions }));
} 