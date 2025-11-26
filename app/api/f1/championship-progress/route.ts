// Edge Runtime Configuration for F1 API (required for Cloudflare Pages)
export const runtime = 'edge';

import { NextResponse } from "next/server"

interface ChartDataPoint {
  round: number;
  raceName: string;
  [key: string]: number | string; // Driver codes and their points
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const year = parseInt(searchParams.get("year") || "2025")

  try {
    // Helper to delay execution
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    // Helper function to fetch all results with pagination and rate limiting
    const fetchAllResults = async (url: string) => {
      const limit = 100; // API hard limit seems to be 100
      let offset = 0;
      let allRaces: any[] = [];
      let total = 0;

      // Initial fetch to get total and first batch
      const initialResponse = await fetch(`${url}?limit=${limit}&offset=${offset}`);
      if (!initialResponse.ok) {
        if (initialResponse.status === 429) {
           throw new Error("API Rate Limit Exceeded");
        }
        throw new Error(`API error: ${initialResponse.statusText}`);
      }
      const initialData = await initialResponse.json();
      
      const raceTable = initialData.MRData.RaceTable;
      allRaces = [...raceTable.Races];
      total = parseInt(initialData.MRData.total);

      // Fetch remaining pages sequentially to avoid rate limits
      for (offset = limit; offset < total; offset += limit) {
        await delay(200); // Wait 200ms between requests
        const response = await fetch(`${url}?limit=${limit}&offset=${offset}`);
        if (!response.ok) {
           if (response.status === 429) {
             // Simple retry once after longer delay
             await delay(1000);
             const retryResponse = await fetch(`${url}?limit=${limit}&offset=${offset}`);
             if (!retryResponse.ok) continue; // Skip if still failing
             const retryData = await retryResponse.json();
             allRaces = [...allRaces, ...retryData.MRData.RaceTable.Races];
             continue;
           }
           continue; // Skip failed pages
        }
        const data = await response.json();
        allRaces = [...allRaces, ...data.MRData.RaceTable.Races];
      }

      return allRaces;
    };

    // Fetch race results first
    const racesRaw = await fetchAllResults(`https://api.jolpi.ca/ergast/f1/${year}/results.json`);
    
    // Then fetch sprint results (if any)
    let sprintsRaw: any[] = [];
    try {
      await delay(200);
      sprintsRaw = await fetchAllResults(`https://api.jolpi.ca/ergast/f1/${year}/sprint.json`);
    } catch (e) {
      console.warn("Failed to fetch sprints or no sprints available", e);
      sprintsRaw = [];
    }

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

    const races = mergeRaces(racesRaw);
    const sprints = mergeRaces(sprintsRaw);

    // Map to store cumulative points for each driver
    const driverPoints: Record<string, number> = {};
    const chartData: ChartDataPoint[] = [];

    // Get all unique driver codes to initialize
    const allDrivers = new Set<string>();
    const driverNames: Record<string, string> = {};

    races.forEach((race: any) => {
      if (race.Results) {
        race.Results.forEach((result: any) => {
          if (result.Driver.code) {
            allDrivers.add(result.Driver.code);
            if (!driverNames[result.Driver.code]) {
              driverNames[result.Driver.code] = `${result.Driver.givenName} ${result.Driver.familyName}`;
            }
          }
        });
      }
    });

    // Initialize points
    allDrivers.forEach(code => {
      driverPoints[code] = 0;
    });

    // Calculate max round robustly
    const maxRound = races.length > 0 
      ? Math.max(...races.map((r: any) => parseInt(r.round))) 
      : 0;
    
    // Create a map of races by round for easy access
    const racesByRound: Record<number, any> = {};
    races.forEach((race: any) => racesByRound[parseInt(race.round)] = race);

    const sprintsByRound: Record<number, any> = {};
    sprints.forEach((sprint: any) => sprintsByRound[parseInt(sprint.round)] = sprint);

    for (let round = 1; round <= maxRound; round++) {
      const race = racesByRound[round];
      const sprint = sprintsByRound[round];

      // Add sprint points if any
      if (sprint && sprint.SprintResults) {
        sprint.SprintResults.forEach((result: any) => {
          const code = result.Driver.code;
          if (code) {
            driverPoints[code] = (driverPoints[code] || 0) + parseFloat(result.points);
          }
        });
      }

      // Add race points
      if (race && race.Results) {
        race.Results.forEach((result: any) => {
          const code = result.Driver.code;
          if (code) {
            driverPoints[code] = (driverPoints[code] || 0) + parseFloat(result.points);
          }
        });
      }

      // Create data point for this round
      // Use race name if available, otherwise "Round X"
      const raceName = race ? race.raceName : `Round ${round}`;
      
      const dataPoint: ChartDataPoint = {
        round: round,
        raceName: raceName,
        ...driverPoints
      };

      chartData.push(dataPoint);
    }

    return NextResponse.json({
      data: chartData,
      drivers: Array.from(allDrivers),
      driverNames: driverNames,
      success: true,
      debug: {
        racesFetched: races.length,
        maxRound: maxRound,
        totalRaces: races.length
      }
    })

  } catch (error) {
    console.error("F1 API error:", error)
    return NextResponse.json({ 
      error: `Failed to fetch championship progress: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 })
  }
}
