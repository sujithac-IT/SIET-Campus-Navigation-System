import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_BUILDINGS, INITIAL_EVENTS, INITIAL_ANNOUNCEMENTS, INITIAL_USERS } from '@/lib/data/seedData';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')?.toLowerCase().trim() || '';

  if (!q) {
    return NextResponse.json({ results: [] });
  }

  const results: any[] = [];

  // Search Buildings & Rooms
  INITIAL_BUILDINGS.forEach((b) => {
    if (b.name.toLowerCase().includes(q) || b.code.toLowerCase().includes(q)) {
      results.push({
        id: b.id,
        type: 'BUILDING',
        title: b.name,
        subtitle: `Building Code: ${b.code}`,
        category: b.category,
        coordinates: b.coordinates,
        buildingId: b.id,
        floor: 0
      });
    }

    b.floors.forEach((f) => {
      f.rooms.forEach((r) => {
        if (
          r.name.toLowerCase().includes(q) ||
          r.code.toLowerCase().includes(q) ||
          r.type.toLowerCase().includes(q)
        ) {
          results.push({
            id: r.id,
            type: r.type === 'classroom' || r.code.startsWith('LH') ? 'ROOM' : 'FACILITY',
            title: `${r.name} (${r.code})`,
            subtitle: `${b.name} • Floor ${r.floor}`,
            category: r.type,
            coordinates: r.coordinates,
            buildingId: b.id,
            floor: r.floor
          });
        }
      });
    });
  });

  // Search Events
  INITIAL_EVENTS.forEach((ev) => {
    if (ev.title.toLowerCase().includes(q) || ev.description.toLowerCase().includes(q)) {
      results.push({
        id: ev.id,
        type: 'EVENT',
        title: ev.title,
        subtitle: `Venue: ${ev.venueRoomCode} • Date: ${ev.date}`,
        category: ev.category,
        coordinates: ev.coordinates
      });
    }
  });

  // Search Announcements
  INITIAL_ANNOUNCEMENTS.forEach((ann) => {
    if (ann.title.toLowerCase().includes(q) || ann.message.toLowerCase().includes(q)) {
      results.push({
        id: ann.id,
        type: 'ANNOUNCEMENT',
        title: ann.title,
        subtitle: `Published by ${ann.author}`,
        category: ann.category
      });
    }
  });

  // Search Faculty Directory
  INITIAL_USERS.filter((u) => u.role === 'faculty').forEach((f: any) => {
    if (
      f.name.toLowerCase().includes(q) ||
      f.department.toLowerCase().includes(q) ||
      f.designation.toLowerCase().includes(q)
    ) {
      results.push({
        id: f.id,
        type: 'FACULTY',
        title: `${f.name} (${f.designation})`,
        subtitle: `Dept: ${f.department} • Room: ${f.roomNumber}`,
        category: 'faculty'
      });
    }
  });

  return NextResponse.json({
    query: q,
    count: results.length,
    results: results.slice(0, 25)
  });
}
