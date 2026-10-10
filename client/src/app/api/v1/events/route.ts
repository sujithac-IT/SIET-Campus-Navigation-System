import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_EVENTS } from '@/lib/data/seedData';

export async function GET() {
  return NextResponse.json({
    count: INITIAL_EVENTS.length,
    data: INITIAL_EVENTS
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newEvent = {
      id: `ev-${Date.now()}`,
      ...body,
      registeredCount: 0
    };
    return NextResponse.json({ status: 'success', data: newEvent });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to create event', details: err.message }, { status: 500 });
  }
}
