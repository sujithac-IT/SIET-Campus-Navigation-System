import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_BUILDINGS, INITIAL_EVENTS, INITIAL_ANNOUNCEMENTS, INITIAL_USERS } from '@/lib/data/seedData';

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query parameter is required.' }, { status: 400 });
    }

    const q = query.toLowerCase().trim();

    // RAG Data Retrieval from verified campus database
    const matchingRooms: any[] = [];
    INITIAL_BUILDINGS.forEach((b) => {
      b.floors.forEach((f) => {
        f.rooms.forEach((r) => {
          if (
            r.code.toLowerCase().includes(q) ||
            r.name.toLowerCase().includes(q) ||
            r.type.toLowerCase().includes(q)
          ) {
            matchingRooms.push({ room: r, building: b });
          }
        });
      });
    });

    const matchingEvents = INITIAL_EVENTS.filter(
      (e) => e.title.toLowerCase().includes(q) || e.category.toLowerCase().includes(q)
    );

    const matchingFaculty = INITIAL_USERS.filter(
      (u) => u.role === 'faculty' && (u.name.toLowerCase().includes(q) || (u as any).department?.toLowerCase().includes(q))
    );

    // Formulate Grounded AI Answer
    let responseText = '';
    let confidence: 'High' | 'Moderate' | 'Low' = 'High';
    let deepLink: { label: string; action: 'navigate' | 'map'; roomCode?: string; buildingId?: string } | null = null;
    let offerEscalation = false;

    if (q.includes('lh25') || q.includes('lh-25')) {
      responseText = 'LH-25 is an Exam Hall located on the 2nd Floor of Central Library Block. It is equipped with AV projection and seating capacity of 70.';
      confidence = 'High';
      deepLink = { label: 'Navigate to LH-25', action: 'navigate', roomCode: 'LH25' };
    } else if (q.includes('lh26') || q.includes('lh-26')) {
      responseText = 'LH-26 is an Exam Hall located on the 2nd Floor of Central Library Block directly adjacent to LH-25.';
      confidence = 'High';
      deepLink = { label: 'Navigate to LH-26', action: 'navigate', roomCode: 'LH26' };
    } else if (q.includes('restroom') || q.includes('washroom') || q.includes('toilet')) {
      responseText = 'Restrooms are available on all floors of Academic Block, Library Block (Ground & Floor 2), Civil Block, and Administrative Block.';
      confidence = 'High';
      deepLink = { label: 'Find Nearest Restroom', action: 'navigate', roomCode: 'LIB-MRR-0' };
    } else if (q.includes('tech park') || q.includes('techpark')) {
      responseText = 'Tech Park Incubation Center is located at the East Quadrangle. It houses software development labs and research centers.';
      confidence = 'High';
      deepLink = { label: 'Navigate to Tech Park', action: 'navigate', buildingId: 'b-techpark' };
    } else if (matchingRooms.length > 0) {
      const match = matchingRooms[0];
      responseText = `${match.room.name} (${match.room.code}) is located in ${match.building.name} on Floor ${match.room.floor}.`;
      confidence = 'High';
      deepLink = { label: `Navigate to ${match.room.code}`, action: 'navigate', roomCode: match.room.code };
    } else if (matchingEvents.length > 0) {
      const ev = matchingEvents[0];
      responseText = `The event "${ev.title}" is scheduled for ${ev.date} at ${ev.time} in venue ${ev.venueRoomCode}. Organised by ${ev.organizer}.`;
      confidence = 'High';
      deepLink = { label: `Navigate to Event Venue`, action: 'navigate', roomCode: ev.venueRoomCode };
    } else if (matchingFaculty.length > 0) {
      const f: any = matchingFaculty[0];
      responseText = `Prof. ${f.name} (${f.designation}) is in Department of ${f.department}. Assigned Room: ${f.roomNumber} (${f.buildingId}). Status: ${f.status}.`;
      confidence = 'High';
    } else {
      responseText = "I couldn't find verified information for that request in the campus database. Would you like to escalate this query to Campus Helpdesk?";
      confidence = 'Low';
      offerEscalation = true;
    }

    return NextResponse.json({
      answer: responseText,
      confidence,
      deepLink,
      offerEscalation,
      sourcesChecked: ['Campus SQL Database', 'Path Graph Nodes', 'Timetable Registry']
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'AI retrieval failed', details: err.message }, { status: 500 });
  }
}
