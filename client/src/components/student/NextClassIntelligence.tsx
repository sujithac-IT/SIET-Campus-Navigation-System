'use client';

import React from 'react';
import { useCampusStore } from '@/lib/store/useCampusStore';
import { Clock, MapPin, Navigation, AlertTriangle, CheckCircle2, ArrowRight, BookOpen } from 'lucide-react';
import { findRoute } from '@/lib/navigation/router';

export const NextClassIntelligence: React.FC = () => {
  const store = useCampusStore();
  const currentUser = store.currentUser;
  const userLocation = store.userLocation;
  const timetable = store.timetable;

  if (!currentUser || currentUser.role !== 'student') {
    return null;
  }

  // Get current day name & time
  const now = new Date();
  const currentDay = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][now.getDay()];
  const currentHour = now.getHours();
  const currentMin = now.getMinutes();

  // Find next upcoming timetable slot for today
  // For demo consistency, pick the first or next scheduled class from timetable
  const todaySlots = timetable.filter((slot) => slot.day.toLowerCase() === currentDay.toLowerCase() || slot.day === 'Monday');
  const nextSlot = todaySlots[0] || timetable[0];

  if (!nextSlot) {
    return (
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 text-slate-300 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">No More Classes Today</h3>
            <p className="text-xs text-slate-400">Your timetable is clear for the rest of the day.</p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate target coordinates for room
  let targetCoords = { x: 35, y: 55 }; // Default LH25 coords
  for (const b of store.buildings) {
    for (const f of b.floors) {
      const room = f.rooms.find((r) => r.code.toLowerCase() === nextSlot.roomCode.toLowerCase());
      if (room) {
        targetCoords = room.coordinates;
        break;
      }
    }
  }

  // Calculate route and walking time
  const route = findRoute(userLocation, targetCoords);
  const estimatedWalkTimeMins = route.estimatedTimeMinutes || 4;

  // Calculate mock countdown (e.g. 18 mins until class)
  const minsUntilClass = 18; 
  const safetyBufferMins = minsUntilClass - estimatedWalkTimeMins;

  let statusText = 'ON TIME';
  let statusColor = 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
  let badgeText = 'Normal Departure Window';

  if (safetyBufferMins <= 2 && safetyBufferMins > 0) {
    statusText = 'LEAVE NOW';
    statusColor = 'bg-amber-500/10 border-amber-500/40 text-amber-400 animate-pulse';
    badgeText = 'Leave Immediately to Arrive On Time';
  } else if (safetyBufferMins <= 0) {
    statusText = 'YOU MAY BE LATE';
    statusColor = 'bg-rose-500/10 border-rose-500/40 text-rose-400 animate-bounce';
    badgeText = 'Class Starts Shortly • Expedited Route Recommended';
  }

  const handleNavigateToClass = () => {
    store.startNavigationToRoom(nextSlot.roomCode);
  };

  return (
    <div className="relative p-6 rounded-2xl bg-gradient-to-br from-[#0f172a] to-[#0d1424] border border-cyan-500/30 shadow-xl overflow-hidden text-slate-100 space-y-4">
      {/* Background Accent glow */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400">
          <Clock className="w-4 h-4" />
          <span>Next Class Intelligence</span>
        </div>
        <span className={`px-3 py-1 text-[11px] font-bold rounded-full border ${statusColor}`}>
          {statusText}
        </span>
      </div>

      {/* Main Content */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/80 border border-slate-800">
        <div className="space-y-1">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span>Subject: {nextSlot.subject}</span>
          </div>
          <div className="text-lg font-extrabold text-slate-100 flex items-center gap-2">
            <span>{nextSlot.roomCode}</span>
            <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-300">
              Starts in {minsUntilClass} mins
            </span>
          </div>
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span className="flex items-center gap-1 text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              Building: {nextSlot.buildingId}
            </span>
            <span>•</span>
            <span>Faculty: {nextSlot.facultyName}</span>
          </div>
        </div>

        {/* Walk metrics & action */}
        <div className="flex flex-col sm:items-end gap-2 shrink-0">
          <div className="text-xs text-slate-300 font-medium text-right">
            Walking time: <span className="text-cyan-300 font-bold">{estimatedWalkTimeMins} mins</span> ({route.totalDistanceMeters}m)
          </div>
          <button
            onClick={handleNavigateToClass}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-950 transition-all hover:scale-105"
          >
            <Navigation className="w-4 h-4" />
            <span>NAVIGATE TO CLASS</span>
          </button>
        </div>
      </div>

      <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
        <AlertTriangle className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
        <span>{badgeText}</span>
      </div>
    </div>
  );
};
