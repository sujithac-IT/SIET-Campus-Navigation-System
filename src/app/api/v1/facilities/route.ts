import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_BUILDINGS } from '@/lib/data/seedData';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');

  const facilities: any[] = [];

  INITIAL_BUILDINGS.forEach((b) => {
    b.floors.forEach((f) => {
      f.rooms.forEach((r) => {
        if (!category || category === 'all' || r.type === category) {
          facilities.push({
            ...r,
            buildingName: b.name,
            buildingCode: b.code,
            buildingCategory: b.category
          });
        }
      });
    });
  });

  return NextResponse.json({
    count: facilities.length,
    category: category || 'all',
    data: facilities
  });
}
