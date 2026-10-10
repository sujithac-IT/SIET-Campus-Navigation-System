import { NextResponse } from 'next/server';

export async function GET() {
  const mockAuditLogs = [
    {
      id: 'audit-001',
      actor: 'Admin (admin@siet.ac.in)',
      action: 'ROOM_REASSIGNED',
      entity: 'Room LH-25',
      previousValue: 'LH-25 (Library Block)',
      newValue: 'LH-26 (Library Block)',
      timestamp: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 'audit-002',
      actor: 'Faculty (prof.smith@siet.ac.in)',
      action: 'STATUS_UPDATED',
      entity: 'FacultyProfile',
      previousValue: 'Available',
      newValue: 'In Class',
      timestamp: new Date(Date.now() - 7200000).toISOString()
    },
    {
      id: 'audit-003',
      actor: 'Security Dispatch',
      action: 'EMERGENCY_BROADCAST',
      entity: 'EmergencyAlert',
      previousValue: 'None',
      newValue: 'Campus Weather Advisory',
      timestamp: new Date(Date.now() - 14400000).toISOString()
    }
  ];

  return NextResponse.json({
    count: mockAuditLogs.length,
    data: mockAuditLogs
  });
}
