// Edge Runtime Configuration for F1 API (required for Cloudflare Pages)
export const runtime = 'edge';

import { NextResponse } from "next/server"

interface ChartDataPoint {
  round: number;
  raceName: string;
  isFinished?: boolean;
  hasSprint?: boolean;
  ranks?: Record<string, number>;
  [key: string]: number | string | boolean | undefined | Record<string, number>; // Driver codes and their points
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const year = parseInt(searchParams.get("year") || "2025")

  try {
    // Simple in-memory cache
    const CACHE_DURATION = 60 * 60 * 1000; // 1 hour
    const cacheKey = `championship-progress-${year}`;
    
    // @ts-ignore
    const globalCache = globalThis as any;
    if (!globalCache._f1Cache) {
      globalCache._f1Cache = new Map();
    }
    const cache = globalCache._f1Cache;

    const cached = cache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
      return NextResponse.json(cached.data);
    }

    // Helper to delay execution
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    // Helper function to fetch all results with pagination and rate limiting
    const fetchAllResults = async (url: string) => {
      const limit = 100;
      let offset = 0;
      let allRaces: any[] = [];
      let total = 0;

      const fetchWithRetry = async (fetchUrl: string, retries = 3) => {
        for (let i = 0; i < retries; i++) {
          try {
            const res = await fetch(fetchUrl);
            if (res.ok) return res;
            if (res.status === 429) {
              const waitTime = 1000 * Math.pow(2, i); // Exponential backoff: 1s, 2s, 4s
              console.warn(`Rate limit hit, retrying in ${waitTime}ms...`);
              await delay(waitTime);
              continue;
            }
            throw new Error(`API error: ${res.statusText}`);
          } catch (e) {
            if (i === retries - 1) throw e;
            await delay(1000);
          }
        }
        throw new Error("Max retries exceeded");
      };

      // Initial fetch
      const initialResponse = await fetchWithRetry(`${url}?limit=${limit}&offset=${offset}`);
      const initialData = await initialResponse.json();
      
      const raceTable = initialData.MRData.RaceTable;
      allRaces = [...raceTable.Races];
      total = parseInt(initialData.MRData.total);

      // Fetch remaining pages
      for (offset = limit; offset < total; offset += limit) {
        await delay(100); // Reduced delay between pages
        const response = await fetchWithRetry(`${url}?limit=${limit}&offset=${offset}`);
        const data = await response.json();
        allRaces = [...allRaces, ...data.MRData.RaceTable.Races];
      }

      return allRaces;
    };

    // Helper to merge split races (API might return same race across multiple pages)
    const mergeRaces = (racesList: any[]) => {
      const merged: Record<number, any> = {};
      racesList.forEach(race => {
        const round = parseInt(race.round);
        if (!merged[round]) {
          merged[round] = { ...race, Results: [...(race.Results || [])], SprintResults: [...(race.SprintResults || [])] };
        } else {
          if (race.Results) {
            merged[round].Results.push(...race.Results);
          }
          if (race.SprintResults) {
            merged[round].SprintResults.push(...race.SprintResults);
          }
        }
      });
      return Object.values(merged);
    };

    // Fetch full schedule first
    const scheduleRaw = await fetchAllResults(`https://api.jolpi.ca/ergast/f1/${year}.json`);
    const schedule = mergeRaces(scheduleRaw);

    // Fetch race results
    const racesRaw = await fetchAllResults(`https://api.jolpi.ca/ergast/f1/${year}/results.json`);
    
    // Then fetch sprint results (if any)
    let sprintsRaw: any[] = [];
    try {
      await delay(100); // Reduced delay to avoid rate limits
      sprintsRaw = await fetchAllResults(`https://api.jolpi.ca/ergast/f1/${year}/sprint.json`);
    } catch (e) {
      console.warn("Failed to fetch sprints, retrying...", e);
      try {
        await delay(1000);
        sprintsRaw = await fetchAllResults(`https://api.jolpi.ca/ergast/f1/${year}/sprint.json`);
      } catch (retryErr) {
        console.error("Retry failed for sprints", retryErr);
        sprintsRaw = [];
      }
    }

    const races = mergeRaces(racesRaw).sort((a: any, b: any) => parseInt(a.round) - parseInt(b.round));
    const sprints = mergeRaces(sprintsRaw).sort((a: any, b: any) => parseInt(a.round) - parseInt(b.round));

    // Map to store cumulative points for each driver
    const driverPoints: Record<string, number> = {};
    const chartData: ChartDataPoint[] = [];

    // Get all unique driver codes to initialize
    const allDrivers = new Set<string>();
    const driverNames: Record<string, string> = {};
    const driverTeams: Record<string, string> = {};

    // Helper to process driver info
    const processDriverInfo = (result: any) => {
      if (result.Driver.code) {
        allDrivers.add(result.Driver.code);
        if (!driverNames[result.Driver.code]) {
          driverNames[result.Driver.code] = `${result.Driver.givenName} ${result.Driver.familyName}`;
        }
        // Store/Update team (will end up with the team from the last race processed)
        if (result.Constructor && result.Constructor.constructorId) {
          driverTeams[result.Driver.code] = result.Constructor.constructorId;
        }
      }
    };

    // Initialize drivers from race results
    races.forEach((race: any) => {
      if (race.Results) {
        race.Results.forEach(processDriverInfo);
      }
    });

    // Initialize drivers from sprint results (in case a driver only did a sprint)
    sprints.forEach((sprint: any) => {
      if (sprint.SprintResults) {
        sprint.SprintResults.forEach(processDriverInfo);
      }
    });

    // Initialize points
    allDrivers.forEach(code => {
      driverPoints[code] = 0;
    });

    // Use schedule to determine max round
    const maxRound = schedule.length > 0 
      ? Math.max(...schedule.map((r: any) => parseInt(r.round))) 
      : 0;
    
    // Create a map of races by round for easy access
    const scheduleByRound: Record<number, any> = {};
    schedule.forEach((race: any) => scheduleByRound[parseInt(race.round)] = race);

    const racesByRound: Record<number, any> = {};
    races.forEach((race: any) => racesByRound[parseInt(race.round)] = race);

    const sprintsByRound: Record<number, any> = {};
    sprints.forEach((sprint: any) => sprintsByRound[parseInt(sprint.round)] = sprint);

    const raceResultsByRound: Record<number, Record<string, any>> = {};
    const driverPositionCounts: Record<string, Record<number, number>> = {};

    for (let round = 1; round <= maxRound; round++) {
      const scheduledRace = scheduleByRound[round];
      const race = racesByRound[round];
      const sprint = sprintsByRound[round];

      raceResultsByRound[round] = {};

      // Add sprint points if any
      if (sprint && sprint.SprintResults) {
        sprint.SprintResults.forEach((result: any) => {
          const code = result.Driver.code;
          if (code) {
            driverPoints[code] = (driverPoints[code] || 0) + parseFloat(result.points);
          }
        });
      }

      // Add race points and capture results
      if (race && race.Results) {
        race.Results.forEach((result: any) => {
          const code = result.Driver.code;
          if (code) {
            driverPoints[code] = (driverPoints[code] || 0) + parseFloat(result.points);
            
            // Update position counts for tie-breaker
            const pos = parseInt(result.position);
            if (!isNaN(pos)) {
                if (!driverPositionCounts[code]) driverPositionCounts[code] = {};
                driverPositionCounts[code][pos] = (driverPositionCounts[code][pos] || 0) + 1;
            }

            // Capture raw result for the table
            raceResultsByRound[round][code] = {
              position: result.position,
              positionText: result.positionText,
              status: result.status,
              points: result.points
            };
          }
        });
      }

      // Calculate ranks for this round with tie-breaker logic
      const currentDrivers = Array.from(allDrivers);
      currentDrivers.sort((a, b) => {
        const pointsA = driverPoints[a] || 0;
        const pointsB = driverPoints[b] || 0;
        if (pointsA !== pointsB) return pointsB - pointsA;

        // Tie-breaker: Countback
        const countsA = driverPositionCounts[a] || {};
        const countsB = driverPositionCounts[b] || {};
        
        for (let i = 1; i <= 25; i++) { // Check positions 1-25
            const cA = countsA[i] || 0;
            const cB = countsB[i] || 0;
            if (cA !== cB) return cB - cA;
        }
        return 0;
      });

      const roundRanks: Record<string, number> = {};
      currentDrivers.forEach((driver, index) => {
        roundRanks[driver] = index + 1;
      });

      // Create data point for this round
      // Use scheduled race name
      const raceName = scheduledRace ? scheduledRace.raceName : `Round ${round}`;
      
      const dataPoint: ChartDataPoint = {
        round: round,
        raceName: raceName,
        isFinished: !!race,
        hasSprint: !!(sprint && sprint.SprintResults),
        ranks: roundRanks,
        ...driverPoints
      };

      chartData.push(dataPoint);
    }

    const responseData = {
      data: chartData,
      raceResults: raceResultsByRound,
      drivers: Array.from(allDrivers),
      driverNames: driverNames,
      driverTeams: driverTeams,
      success: true,
      debug: {
        racesFetched: races.length,
        maxRound: maxRound,
        totalRaces: races.length
      }
    };

    // Cache the result
    cache.set(cacheKey, {
      data: responseData,
      timestamp: Date.now()
    });

    return NextResponse.json(responseData);

  } catch (error) {
    console.error("F1 API error:", error)
    return NextResponse.json({ 
      error: `Failed to fetch championship progress: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 })
  }
}
