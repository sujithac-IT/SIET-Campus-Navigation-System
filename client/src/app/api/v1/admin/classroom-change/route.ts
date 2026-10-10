import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { subject, oldRoom, newRoom, reason, actor } = await req.json();

    if (!subject || !oldRoom || !newRoom) {
      return NextResponse.json({ error: 'Subject, oldRoom, and newRoom are required.' }, { status: 400 });
    }

    const auditEntry = {
      id: `audit-${Date.now()}`,
      actor: actor || 'Admin User',
      action: 'TIMETABLE_ROOM_REASSIGNED',
      entity: 'TimetableSession',
      previousValue: oldRoom,
      newValue: newRoom,
      reason: reason || 'Scheduled room relocation',
      timestamp: new Date().toISOString()
    };

    return NextResponse.json({
      status: 'success',
      message: `Classroom change for ${subject} from ${oldRoom} to ${newRoom} recorded and broadcasted.`,
      auditEntry
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Classroom reassignment failed', details: err.message }, { status: 500 });
  }
}
