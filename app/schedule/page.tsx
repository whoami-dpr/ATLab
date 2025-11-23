"use client";
import { useSchedule } from '../../hooks/useSchedule';
import { format } from 'date-fns';
import { Countdown } from '../../components/Countdown';
import { Navbar } from '../../components/Navbar';
import { useThemeOptimized } from '../../hooks/useThemeOptimized';

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
  const { theme } = useThemeOptimized();
  const now = new Date();

  return (
    <div className={`min-h-screen w-full relative font-inter ${
      theme === 'light' ? 'bg-gray-50' : 'bg-black'
    }`}>
      {/* Background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: theme === 'light'
            ? "linear-gradient(180deg, #f0f8ff 0%, #cce7ff 100%)"
            : "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(120, 180, 255, 0.25), transparent 70%), #000000"
        }}
      />
      <div className={`relative z-10 flex flex-col min-h-screen ${
        theme === 'light' ? 'text-gray-900' : 'text-white'
      }`}>
        <Navbar />
        <div className="flex-1 p-6">
          <h1 className={`text-3xl font-bold mb-0 ${
            theme === 'light' ? 'text-black' : 'text-white'
          }`}>Schedule</h1>
          <div className={`text-xs mb-4 ${
            theme === 'light' ? 'text-gray-700' : 'text-gray-400'
          }`}>All times are local time</div>
          {loading && <div className={theme === 'light' ? 'text-black' : 'text-gray-300'}>Loading...</div>}
          {error && <div className="text-red-500">{error}</div>}
          {!loading && !error && (
            <>
              {/* Fila superior: Up Next y Próxima carrera */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start mb-8">
                {/* Columna izquierda: Countdowns */}
                <div className="pr-2">
                  {nextSession && (
                    <div className="mb-3">
                      <div className={`text-lg font-semibold mb-1 ${
                        theme === 'light' ? 'text-black' : 'text-white'
                      }`}>Next session in</div>
                      <Countdown
                        targetDate={nextSession.start}
                        label={undefined}
                        className="mb-1"
                      />
                      <div className={`mt-1 text-xs ${
                        theme === 'light' ? 'text-gray-800' : 'text-gray-400'
                      }`}>
                        {nextSession.kind}: {format(new Date(nextSession.start), 'EEEE, MMMM d, yyyy')} – {format(new Date(nextSession.start), 'HH:mm')} - {format(new Date(nextSession.end), 'HH:mm')}
                      </div>
                    </div>
                  )}
                  <div className={`border-b my-2 ${
                    theme === 'light' ? 'border-gray-300' : 'border-gray-700'
                  }`} />
                  {nextRace && (
                    <div className="mb-1">
                      <div className={`text-lg font-semibold mb-1 ${
                        theme === 'light' ? 'text-black' : 'text-white'
                      }`}>Next race in</div>
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
                          <div className={`mt-1 text-xs ${
                            theme === 'light' ? 'text-gray-800' : 'text-gray-400'
                          }`}>
                            Race: {format(new Date(raceSession.start), 'EEEE, MMMM d, yyyy')} – {format(new Date(raceSession.start), 'HH:mm')} - {format(new Date(raceSession.end), 'HH:mm')}
                          </div>
                        ) : null;
                      })()}
                    </div>
                  )}
                </div>
                {/* Columna derecha: Tarjeta de próxima carrera más compacta */}
                {nextRace && (
                  <div className={`w-full rounded-xl p-4 shadow-xl border ${
                    theme === 'light' 
                      ? 'bg-white border-gray-200 shadow-gray-200/50' 
                      : 'bg-[#181824] border-[#232336]'
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {(() => {
                          const flagUrl = getFlagUrl(nextRace.round.country);
                          return flagUrl ? (
                            <div className={`w-12 h-8 rounded-lg overflow-hidden shadow border ${
                              theme === 'light' ? 'border-gray-300' : 'border-gray-700'
                            }`}>
                              <img src={flagUrl} alt={nextRace.round.country} className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <span className="text-2xl">🏁</span>
                          );
                        })()}
                        <span className={`text-xl font-semibold ${
                          theme === 'light' ? 'text-black' : 'text-white'
                        }`}>{nextRace.round.country}</span>
                      </div>
                      <div className={`text-sm font-medium ${
                        theme === 'light' ? 'text-gray-800' : 'text-gray-400'
                      }`}>
                        {format(new Date(nextRace.round.start), 'LLLL d')}<span className={theme === 'light' ? 'text-gray-700' : 'text-gray-400'}>–{format(new Date(nextRace.round.end), 'd')}</span>
                      </div>
                    </div>
                    <div className={`border-b my-2 ${
                      theme === 'light' ? 'border-gray-200' : 'border-gray-700'
                    }`} />
                    {/* Grid de días y sesiones más grande */}
                    <div className="grid grid-cols-3 gap-3 w-full mt-3">
                      {(() => {
                        // Obtener todas las sesiones del fin de semana para la numeración correcta
                        const allWeekendSessions = getRaceDays(nextRace.round.sessions)
                          .flatMap(day => day.sessions)
                          .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
                        
                        return ['Friday', 'Saturday', 'Sunday'].map((day) => {
                          const sessions = getRaceDays(nextRace.round.sessions).find(d => d.day === day)?.sessions || [];
                          return (
                            <div key={day}>
                              <div className={`font-bold mb-1 text-sm ${
                                theme === 'light' ? 'text-black' : 'text-white'
                              }`}>{day}</div>
                              {sessions.length === 0 ? (
                                <div className={`text-xs italic ${
                                  theme === 'light' ? 'text-gray-700' : 'text-gray-600'
                                }`}>—</div>
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
                                      <div className={`font-semibold text-xs ${
                                        theme === 'light' ? 'text-black' : 'text-white'
                                      }`}>{getSessionName(session.kind, allWeekendSessions, globalIndex)}</div>
                                      <div className={`text-xs ${
                                        theme === 'light' ? 'text-gray-800' : 'text-gray-300'
                                      }`}>
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
              <div className="mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {schedule.map((round: any) => (
                    <div key={round.name} className={`w-full rounded-xl p-4 shadow-xl border flex flex-col h-full ${
                      theme === 'light' 
                        ? 'bg-white border-gray-200 shadow-gray-200/50' 
                        : 'bg-[#181824] border-[#232336]'
                    }`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            {(() => {
                              const flagUrl = getFlagUrl(round.country);
                              return flagUrl ? (
                                <img src={flagUrl} alt={round.country} className={`w-6 h-4 rounded shadow border ${
                                  theme === 'light' ? 'border-gray-300' : 'border-gray-700'
                                }`} />
                              ) : (
                                <span className="text-xl">🏁</span>
                              );
                            })()}
                            <span className={`text-lg font-bold leading-tight ${
                              theme === 'light' ? 'text-black' : 'text-white'
                            }`}>{round.country}</span>
                          </div>
                          <div className={`text-xs font-medium ${
                            theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                          }`}>
                            {format(new Date(round.start), 'MMM d')} – {format(new Date(round.end), 'MMM d')}
                          </div>
                        </div>
                        {round.over && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-500/10 text-red-500 border border-red-500/20">
                            Done
                          </span>
                        )}
                      </div>
                      
                      <div className={`w-full h-px mb-3 ${
                        theme === 'light' ? 'bg-gray-100' : 'bg-gray-800'
                      }`} />

                      {/* Lista compacta de sesiones */}
                      <div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar">
                        {(() => {
                          const allWeekendSessions = getRaceDays(round.sessions)
                            .flatMap(day => day.sessions)
                            .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
                          
                          // Agrupar por día pero mostrar en lista vertical compacta
                          return getRaceDays(round.sessions).map(({ day, sessions }) => (
                            <div key={day} className="mb-2 last:mb-0">
                              <div className={`text-[10px] font-bold uppercase tracking-wider mb-1 opacity-70 ${
                                theme === 'light' ? 'text-gray-500' : 'text-gray-500'
                              }`}>{day}</div>
                              <div className="space-y-1">
                                {sessions.map((session: any) => {
                                  const globalIndex = allWeekendSessions.findIndex(s => 
                                    s.kind === session.kind && 
                                    s.start === session.start
                                  );
                                  const isRace = session.kind.toLowerCase().includes('race');
                                  return (
                                    <div key={session.kind + session.start} className={`flex justify-between items-center text-xs ${
                                      isRace ? 'font-bold' : ''
                                    } ${theme === 'light' ? 'text-gray-800' : 'text-gray-300'}`}>
                                      <span className="truncate mr-2">
                                        {getSessionName(session.kind, allWeekendSessions, globalIndex).replace('Practice', 'FP').replace('Qualifying', 'Quali')}
                                      </span>
                                      <span className={`font-mono whitespace-nowrap ${
                                        theme === 'light' ? 'text-gray-500' : 'text-gray-500'
                                      }`}>
                                        {format(new Date(session.start), 'HH:mm')}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ));
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