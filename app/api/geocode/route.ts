import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");
  if (!q) {
    return NextResponse.json({ error: "Missing query parameter 'q'" }, { status: 400 });
  }
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`;
    const geoRes = await fetch(url, {
      headers: { "User-Agent": "ATLab/1.0 (contacto@atlab.com)" },
      cache: "no-store"
    });
    const geoData = await geoRes.json();
    if (!geoData[0]) {
      return NextResponse.json({ error: "No results found" }, { status: 404 });
    }
    return NextResponse.json({
      lat: geoData[0].lat,
      lon: geoData[0].lon,
      display_name: geoData[0].display_name,
      raw: geoData[0],
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Error fetching geocode" }, { status: 500 });
  }
} 