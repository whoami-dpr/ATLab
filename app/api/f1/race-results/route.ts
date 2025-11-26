// Edge Runtime Configuration for F1 API (required for Cloudflare Pages)
export const runtime = 'edge';

import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const year = searchParams.get("year") || "2024";

  try {
    // Simple in-memory cache
    const CACHE_DURATION = 60 * 60 * 1000; // 1 hour
    const cacheKey = `race-results-${year}`;
    
    // @ts-ignore
    const globalCache = globalThis as any;
    if (!globalCache._f1Cache) {
      globalCache._f1Cache = new Map();
    }
    const cache = globalCache._f1Cache;

    const cached = cache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
      console.log(`Returning cached data for ${year}`);
      return NextResponse.json(cached.data);
    }

    console.log(`Fetching fresh data for year ${year}...`);

    // Fetch driver standings to get list of drivers and their total points
    const standingsUrl = `https://api.jolpica.ergast/f1/${year}/driverStandings.json?limit=100`;
    console.log('Fetching driver standings from:', standingsUrl);
    
    const standingsResponse = await fetch(standingsUrl);
    if (!standingsResponse.ok) {
      throw new Error(`Standings fetch failed: ${standingsResponse.statusText}`);
    }
    
    const standingsData = await standingsResponse.json();
    const standings = standingsData.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings || [];
    
    if (standings.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: `No driver standings found for year ${year}` 
      }, { status: 404 });
    }

    console.log(`Found ${standings.length} drivers`);

    // Get all races for the season
    const racesUrl = `https://api.jolpica.ergast/f1/${year}/results.json?limit=1000`;
    console.log('Fetching all race results from:', racesUrl);
    
    const racesResponse = await fetch(racesUrl);
    if (!racesResponse.ok) {
      throw new Error(`Races fetch failed: ${racesResponse.statusText}`);
    }
    
    const racesData = await racesResponse.json();
    const allRaces = racesData.MRData?.RaceTable?.Races || [];
    
    if (allRaces.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: `No race results found for year ${year}` 
      }, { status: 404 });
    }

    console.log(`Found ${allRaces.length} races with results`);

    // Build driver points map
    const driverPoints: Record<string, number> = {};
    standings.forEach((standing: any) => {
      driverPoints[standing.Driver.code] = parseFloat(standing.points);
    });

    // Build races array with simplified structure
    const races = allRaces.map((race: any) => ({
      round: parseInt(race.round),
      raceName: race.raceName,
      date: race.date,
      circuit: race.Circuit?.circuitName || '',
      country: race.Circuit?.Location?.country || '',
      results: (race.Results || []).map((result: any) => ({
        position: result.position,
        driverCode: result.Driver?.code || '',
        driverName: `${result.Driver?.givenName || ''} ${result.Driver?.familyName || ''}`.trim(),
        constructorId: result.Constructor?.constructorId || '',
        constructorName: result.Constructor?.name || '',
        points: parseFloat(result.points || '0'),
        status: result.status || '',
        grid: result.grid || '',
      })),
    }));

    const responseData = {
      success: true,
      year,
      races,
      driverPoints,
    };

    // Cache the result
    cache.set(cacheKey, {
      data: responseData,
      timestamp: Date.now(),
    });

    console.log(`Successfully fetched and cached data for ${year}`);
    return NextResponse.json(responseData);
    
  } catch (error) {
    console.error('Error in race-results API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    );
  }
}
