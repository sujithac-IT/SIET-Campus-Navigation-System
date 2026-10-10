import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_TIMETABLE } from '@/lib/data/seedData';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const day = searchParams.get('day');

  let slots = INITIAL_TIMETABLE;
  if (day) {
    slots = slots.filter((s) => s.day.toLowerCase() === day.toLowerCase());
  }

  return NextResponse.json({
    count: slots.length,
    day: day || 'all',
    data: slots
  });
}
