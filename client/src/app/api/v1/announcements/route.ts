import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_ANNOUNCEMENTS } from '@/lib/data/seedData';

export async function GET() {
  return NextResponse.json({
    count: INITIAL_ANNOUNCEMENTS.length,
    data: INITIAL_ANNOUNCEMENTS
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newAnn = {
      id: `ann-${Date.now()}`,
      timestamp: 'Just now',
      ...body
    };
    return NextResponse.json({ status: 'success', data: newAnn });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to publish announcement', details: err.message }, { status: 500 });
  }
}
