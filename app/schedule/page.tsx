"use client";
import { useSchedule } from '../../hooks/useSchedule';
import { format } from 'date-fns';
import { Countdown } from '../../components/Countdown';
import { Navbar } from '../../components/Navbar';
import { useThemeOptimized } from '../../hooks/useThemeOptimized';

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
  Monaco: 'mon',
  Netherlands: 'ned',
  Qatar: 'qat',
  SaudiArabia: 'ksa',
  Singapore: 'sgp',
  USA: 'usa',
  UnitedStates: 'usa',
  Miami: 'usa',
  LasVegas: 'usa',
  AbuDhabi: 'uae',
  UnitedArabEmirates: 'uae',
};

function getFlagUrl(country: string, country_key?: string) {
  let code = country_key;
  if (!code) {
    code = countryNameToCode[country.replace(/\s/g, '')] || '';
  }
  return code ? `/country-flags/${code.toLowerCase()}.svg` : undefined;
}

function getSessionName(kind: string, allSessions: any[], currentIndex: number) {
  if (kind === 'Pract' || kind === 'Prac' || kind === 'Practice' || kind.toLowerCase().includes('practice')) {
    let practiceCount = 0;
    for (let i = 0; i < currentIndex; i++) {
      if (allSessions[i] && (allSessions[i].kind === 'Pract' || allSessions[i].kind === 'Prac' || allSessions[i].kind === 'Practice' || allSessions[i].kind.toLowerCase().includes('practice'))) {
        practiceCount++;
      }
    }
    return `Practice ${practiceCount + 1}`;
  }
  
  if (kind === 'Sprint' || kind === 'Sp' || kind === 'Spri' || kind === 'Sprint R') {
    const hasSprintAfter = allSessions.slice(currentIndex + 1).some(session => 
      session && (session.kind === 'Sprint' || session.kind === 'Sp' || session.kind === 'Spri' || session.kind === 'Sprint R')
    );
    return hasSprintAfter ? 'Sprint Qualification' : 'Sprint Race';
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
    'Sprint Qualifying': 'Sprint Qualification',
    'Sprint Race': 'Sprint Race'
  };
  
  return sessionNames[kind] || kind;
}

function getRaceDays(sessions: any[]) {
  const daysMap: Record<string, any[]> = {};
  sessions.forEach(session => {
    const date = new Date(session.start);
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const day = dayNames[date.getUTCDay()];
    if (!daysMap[day]) daysMap[day] = [];
    daysMap[day].push(session);
  });
  return Object.entries(daysMap).map(([day, sessions]) => ({ day, sessions }));
}

export default function SchedulePage() {
  const { schedule, loading, error, nextSession, nextRace } = useSchedule();
  const { theme } = useThemeOptimized();

  return (
    <div className={`min-h-screen w-full relative font-inter ${theme === 'light' ? 'bg-gray-50' : 'bg-black'}`}>
      <div
        className="absolute inset-0 z-0"
        style={{
          background: theme === 'light'
            ? "linear-gradient(180deg, #f0f8ff 0%, #cce7ff 100%)"
            : "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(120, 180, 255, 0.25), transparent 70%), #000000"
        }}
      />
      <div className={`relative z-10 flex flex-col min-h-screen ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
        <Navbar />
        <div className="flex-1 p-6">
          <h1 className={`text-3xl font-bold mb-0 ${theme === 'light' ? 'text-black' : 'text-white'}`}>Schedule</h1>
          <div className={`text-xs mb-4 ${theme === 'light' ? 'text-gray-700' : 'text-gray-400'}`}>All times are local time</div>
          
          {loading && <div className={theme === 'light' ? 'text-black' : 'text-gray-300'}>Loading...</div>}
          {error && <div className="text-red-500">{error}</div>}
          
          {!loading && !error && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start mb-8">
                <div className="pr-2">
                  {nextSession && (
                    <div className="mb-3">
                      <div className={`text-lg font-semibold mb-1 ${theme === 'light' ? 'text-black' : 'text-white'}`}>Next session in</div>
                      <Countdown targetDate={nextSession.start} label={undefined} className="mb-1" />
                      <div className={`mt-1 text-xs ${theme === 'light' ? 'text-gray-800' : 'text-gray-400'}`}>
                        {nextSession.kind}: {format(new Date(nextSession.start), 'EEEE, MMMM d, yyyy')} – {format(new Date(nextSession.start), 'HH:mm')} - {format(new Date(nextSession.end), 'HH:mm')}
                      </div>
                    </div>
                  )}
                  <div className={`border-b my-2 ${theme === 'light' ? 'border-gray-300' : 'border-gray-700'}`} />
                  {nextRace && (
                    <div className="mb-1">
                      <div className={`text-lg font-semibold mb-1 ${theme === 'light' ? 'text-black' : 'text-white'}`}>Next race in</div>
                      <Countdown targetDate={nextRace.start} label={undefined} className="mb-1" />
                      {(() => {
                        const raceSession = nextRace.round.sessions.find((s: any) => s.kind && s.kind.toLowerCase() === 'race');
                        return raceSession ? (
                          <div className={`mt-1 text-xs ${theme === 'light' ? 'text-gray-800' : 'text-gray-400'}`}>
                            Race: {format(new Date(raceSession.start), 'EEEE, MMMM d, yyyy')} – {format(new Date(raceSession.start), 'HH:mm')} - {format(new Date(raceSession.end), 'HH:mm')}
                          </div>
                        ) : null;
                      })()}
                    </div>
                  )}
                </div>
                
                {/* Next Race Card - Same style as schedule cards */}
                {nextRace && (
                  <div 
                    className="w-full rounded-2xl overflow-hidden font-inter"
                    style={{
                      background: theme === 'light' 
                        ? 'linear-gradient(145deg, rgba(255,255,255,0.95), rgba(245,245,250,0.98))'
                        : 'linear-gradient(145deg, rgba(22,22,38,0.98), rgba(16,16,28,0.99))',
                      boxShadow: theme === 'light'
                        ? '0 4px 24px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)'
                        : '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.02)'
                    }}
                  >
                    <div className="p-4 pb-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className={`relative flex-shrink-0 w-10 h-7 rounded-md overflow-hidden ${
                            theme === 'light' ? 'shadow-md ring-1 ring-gray-200' : 'shadow-lg ring-1 ring-white/10'
                          }`}>
                            {(() => {
                              const flagUrl = getFlagUrl(nextRace.round.country);
                              return flagUrl ? (
                                <img src={flagUrl} alt={nextRace.round.country} className="w-full h-full object-cover" />
                              ) : (
                                <div className={`w-full h-full flex items-center justify-center ${theme === 'light' ? 'bg-gray-100' : 'bg-gray-800'}`}>
                                  <span className="text-sm">🏁</span>
                                </div>
                              );
                            })()}
                          </div>
                          <h3 className={`text-base font-bold leading-tight tracking-tight truncate ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                            {nextRace.round.country}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold uppercase tracking-wider text-blue-400 font-inter">
                            Next Session
                          </span>
                          <span className={`text-xs font-medium ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
                            {format(new Date(nextRace.round.start), 'MMMM d')}–{format(new Date(nextRace.round.end), 'd')}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className={`mx-4 h-px ${theme === 'light' ? 'bg-gray-100' : 'bg-white/5'}`} />
                    
                    <div className="p-4 pt-3">
                      <div className="grid grid-cols-3 gap-3">
                        {(() => {
                          const allWeekendSessions = getRaceDays(nextRace.round.sessions)
                            .flatMap(day => day.sessions)
                            .sort((a: any, b: any) => new Date(a.start).getTime() - new Date(b.start).getTime());
                          
                          return ['Friday', 'Saturday', 'Sunday'].map((dayName) => {
                            const dayData = getRaceDays(nextRace.round.sessions).find(d => d.day === dayName);
                            const sessions = dayData?.sessions || [];
                            
                            return (
                              <div key={dayName} className="min-w-0">
                                <div className={`text-[11px] font-bold mb-2 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                                  {dayName}
                                </div>
                                
                                <div className="space-y-2">
                                  {sessions.length === 0 ? (
                                    <div className={`text-[10px] ${theme === 'light' ? 'text-gray-400' : 'text-gray-600'}`}>—</div>
                                  ) : (
                                    sessions.map((session: any) => {
                                      const globalIndex = allWeekendSessions.findIndex((s: any) => 
                                        s.kind === session.kind && s.start === session.start
                                      );
                                      const sessionName = getSessionName(session.kind, allWeekendSessions, globalIndex);
                                      const isRace = session.kind.toLowerCase() === 'race';
                                      const isSprint = sessionName.toLowerCase().includes('sprint');
                                      
                                      return (
                                        <div key={session.kind + session.start}>
                                          <div className={`text-[11px] leading-tight ${
                                            isRace || isSprint ? 'font-semibold' : 'font-medium'
                                          } ${
                                            theme === 'light' 
                                              ? isRace ? 'text-gray-900' : 'text-gray-700'
                                              : isRace ? 'text-white' : 'text-gray-300'
                                          }`}>
                                            {sessionName}
                                          </div>
                                          <div className={`text-[10px] ${theme === 'light' ? 'text-gray-400' : 'text-gray-500'}`}>
                                            {format(new Date(session.start), 'HH:mm')} - {format(new Date(session.end), 'HH:mm')}
                                          </div>
                                        </div>
                                      );
                                    })
                                  )}
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {schedule.map((round: any) => {
                    const flagUrl = getFlagUrl(round.country);
                    const allWeekendSessions = getRaceDays(round.sessions)
                      .flatMap(day => day.sessions)
                      .sort((a: any, b: any) => new Date(a.start).getTime() - new Date(b.start).getTime());
                    
                    const dateStr = `${format(new Date(round.start), 'MMMM d')}–${format(new Date(round.end), 'd')}`;
                    
                    return (
                      <div 
                        key={round.name} 
                        className={`group relative w-full rounded-2xl overflow-hidden transition-all duration-300 font-inter ${
                          round.over ? 'opacity-50 hover:opacity-80' : 'hover:scale-[1.02] hover:shadow-2xl'
                        }`}
                        style={{
                          background: theme === 'light' 
                            ? 'linear-gradient(145deg, rgba(255,255,255,0.95), rgba(245,245,250,0.98))'
                            : 'linear-gradient(145deg, rgba(22,22,38,0.98), rgba(16,16,28,0.99))',
                          boxShadow: theme === 'light'
                            ? '0 4px 24px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)'
                            : '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.02)'
                        }}
                      >
                        {!round.over && (
                          <div 
                            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                            style={{ background: 'radial-gradient(circle at 50% 0%, rgba(156,249,254,0.1), transparent 50%)' }}
                          />
                        )}
                        
                        <div className="relative p-4 pb-3">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <div className={`relative flex-shrink-0 w-10 h-7 rounded-md overflow-hidden ${
                                theme === 'light' ? 'shadow-md ring-1 ring-gray-200' : 'shadow-lg ring-1 ring-white/10'
                              }`}>
                                {flagUrl ? (
                                  <img src={flagUrl} alt={round.country} className="w-full h-full object-cover" />
                                ) : (
                                  <div className={`w-full h-full flex items-center justify-center ${theme === 'light' ? 'bg-gray-100' : 'bg-gray-800'}`}>
                                    <span className="text-sm">🏁</span>
                                  </div>
                                )}
                              </div>
                              <h3 className={`text-base font-bold leading-tight tracking-tight truncate ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                                {round.country}
                              </h3>
                            </div>
                            
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {round.over && (
                                <div className={`px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider ${
                                  theme === 'light' ? 'bg-gray-100 text-gray-400' : 'bg-white/5 text-gray-500'
                                }`}>
                                  Done
                                </div>
                              )}
                              <span className={`text-xs font-medium ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
                                {dateStr}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className={`mx-4 h-px ${theme === 'light' ? 'bg-gray-100' : 'bg-white/5'}`} />
                        
                        <div className="p-4 pt-3">
                          <div className="grid grid-cols-3 gap-3">
                            {['Friday', 'Saturday', 'Sunday'].map((dayName) => {
                              const dayData = getRaceDays(round.sessions).find(d => d.day === dayName);
                              const sessions = dayData?.sessions || [];
                              
                              return (
                                <div key={dayName} className="min-w-0">
                                  <div className={`text-[11px] font-bold mb-2 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                                    {dayName}
                                  </div>
                                  
                                  <div className="space-y-2">
                                    {sessions.length === 0 ? (
                                      <div className={`text-[10px] ${theme === 'light' ? 'text-gray-400' : 'text-gray-600'}`}>—</div>
                                    ) : (
                                      sessions.map((session: any) => {
                                        const globalIndex = allWeekendSessions.findIndex((s: any) => 
                                          s.kind === session.kind && s.start === session.start
                                        );
                                        const sessionName = getSessionName(session.kind, allWeekendSessions, globalIndex);
                                        const isRace = session.kind.toLowerCase() === 'race';
                                        const isSprint = sessionName.toLowerCase().includes('sprint');
                                        
                                        return (
                                          <div key={session.kind + session.start}>
                                            <div className={`text-[11px] leading-tight ${
                                              isRace || isSprint ? 'font-semibold' : 'font-medium'
                                            } ${
                                              theme === 'light' 
                                                ? isRace ? 'text-gray-900' : 'text-gray-700'
                                                : isRace ? 'text-white' : 'text-gray-300'
                                            }`}>
                                              {sessionName}
                                            </div>
                                            <div className={`text-[10px] ${theme === 'light' ? 'text-gray-400' : 'text-gray-500'}`}>
                                              {format(new Date(session.start), 'HH:mm')} - {format(new Date(session.end), 'HH:mm')}
                                            </div>
                                          </div>
                                        );
                                      })
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
