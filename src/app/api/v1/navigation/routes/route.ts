import { NextRequest, NextResponse } from 'next/server';
import { findRoute } from '@/lib/navigation/router';
import { INITIAL_PATH_NODES, INITIAL_PATH_EDGES } from '@/lib/data/seedData';

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await req.json();
    const { origin, destination, preferences } = body;

    if (!origin || !destination) {
      return NextResponse.json(
        { error: 'Origin and destination coordinates or node IDs are required.' },
        { status: 400 }
      );
    }

    const startCoords = origin.coordinates || origin;
    const targetCoords = destination.coordinates || destination;

    // Filter edges if accessible preference specified
    let filteredEdges = INITIAL_PATH_EDGES;
    if (preferences?.avoidStairs) {
      filteredEdges = filteredEdges.filter((e) => e.type !== 'stairs');
    }
    if (preferences?.avoidElevators) {
      filteredEdges = filteredEdges.filter((e) => e.type !== 'elevator');
    }

    const route = findRoute(startCoords, targetCoords, INITIAL_PATH_NODES, filteredEdges);
    const durationMs = Date.now() - startTime;

    return NextResponse.json({
      status: 'success',
      calculationTimeMs: durationMs,
      routeId: `route-${Date.now()}`,
      data: route
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to calculate campus route', details: error.message },
      { status: 500 }
    );
  }
}
