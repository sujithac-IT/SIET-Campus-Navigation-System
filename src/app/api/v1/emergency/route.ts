import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, userName, userRole, coordinates, details } = body;

    const alert = {
      id: `sos-${Date.now()}`,
      userId: userId || 'guest',
      userName: userName || 'Campus User',
      userRole: userRole || 'visitor',
      timestamp: new Date().toLocaleTimeString(),
      coordinates: coordinates || { x: 15, y: 88 },
      status: 'active',
      details: details || 'SOS Triggered'
    };

    return NextResponse.json({
      status: 'dispatched',
      message: 'Emergency SOS alert broadcasted to Campus Security & Health Center.',
      alert
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Emergency dispatch failed', details: err.message }, { status: 500 });
  }
}
