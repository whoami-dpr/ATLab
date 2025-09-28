/* TEMPORARILY DISABLED - F1 TEST API
// Node.js Runtime Configuration
export const runtime = 'nodejs';

import { NextResponse } from "next/server"
import f1Api from "f1-api-node"

export async function GET() {
  try {
    console.log("Testing F1 API...");
    
    // Test simple API call
    const driverLineup = await f1Api.getDriverLineup();
    
    return NextResponse.json({
      success: true,
      message: "F1 API is working",
      data: {
        totalDrivers: driverLineup.length,
        sampleDriver: driverLineup[0]
      }
    });
  } catch (error) {
    console.error("F1 API test error:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}


// TEMPORARY PLACEHOLDER - F1 TEST API DISABLED
export async function GET() {
  return new Response(JSON.stringify({ 
    error: "F1 Test API temporarily disabled" 
  }), {
    status: 503,
    headers: { 'Content-Type': 'application/json' }
  });
}
*/