'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCampusStore } from '@/lib/store/useCampusStore';
import { TimetableSlot, Building } from '@/types';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Navigation, 
  Lock, 
  GraduationCap, 
  CalendarDays,
  CornerDownRight,
  ArrowRight,
  Info,
  Layers,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';

import { ExamHallLookup } from '@/components/search/ExamHallLookup';
import { Sparkles, Radio } from 'lucide-react';

export default function TimetablePage() {
  const store = useCampusStore();
  const router = useRouter();
  const currentUser = store.currentUser;
  
  const [mainTab, setMainTab] = useState<'classes' | 'exams'>('classes');
  const [activeDay, setActiveDay] = useState<'Today' | 'Tomorrow'>('Today');
  const [timeLeftStr, setTimeLeftStr] = useState('14:59');
  const [isSimulatingRelocation, setIsSimulatingRelocation] = useState(false);

  // Live class countdown timer simulation
  useEffect(() => {
    let seconds = 900; // 15 minutes
    const interval = setInterval(() => {
      if (seconds <= 0) {
        clearInterval(interval);
        return;
      }
      seconds -= 1;
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      setTimeLeftStr(`${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleSimulateRelocation = () => {
    setIsSimulatingRelocation(true);
    store.triggerClassroomReassignment({
      subject: 'Data Structures & Algorithms',
      oldRoomCode: 'LH25',
      newRoomCode: 'TECH-101',
      reason: 'Server Infrastructure & High Performance Computing Lab Session',
    });
    setTimeout(() => setIsSimulatingRelocation(false), 800);
  };

  // Filter timetable slots
  const getTimetableSlots = () => {
    if (!currentUser) return [];
    
    // For student Rahul Sharma
    if (currentUser.role === 'student') {
      return store.timetable?.length 
        ? store.timetable.filter((s: TimetableSlot) => s.day === activeDay)
        : [
            { id: 't1', day: 'Today', time: '09:00 AM - 10:00 AM', subject: 'Data Structures & Algorithms', roomCode: 'LH25', buildingId: 'b-library', facultyName: 'Dr. R. Meenakshi' },
            { id: 't2', day: 'Today', time: '10:00 AM - 11:00 AM', subject: 'Operating Systems', roomCode: 'LH26', buildingId: 'b-library', facultyName: 'Prof. Vignesh' },
            { id: 't3', day: 'Today', time: '11:00 AM - 12:00 PM', subject: 'Computer Networks', roomCode: 'LH25', buildingId: 'b-library', facultyName: 'Dr. Prakash' },
            { id: 't4', day: 'Today', time: '02:00 PM - 03:30 PM', subject: 'AI Workshop', roomCode: '1A-I', buildingId: 'b-techpark', facultyName: 'Dr. R. Meenakshi' },
            { id: 't5', day: 'Tomorrow', time: '09:00 AM - 10:00 AM', subject: 'Database Management Systems', roomCode: 'LH30', buildingId: 'b-civil', facultyName: 'Dr. Prakash' },
            { id: 't6', day: 'Tomorrow', time: '11:00 AM - 01:00 PM', subject: 'Web Development Lab', roomCode: 'PLACE-01', buildingId: 'b-techpark', facultyName: 'Prof. S. Rajesh' }
          ].filter((s: TimetableSlot) => s.day === activeDay);
    }
    
    // For faculty Dr. Prakash
    if (currentUser.role === 'faculty') {
      return [
        { id: 'ft1', day: 'Today', time: '11:00 AM - 12:00 PM', subject: 'Computer Networks (IT-A)', roomCode: 'LH25', buildingId: 'b-library', facultyName: 'Dr. Prakash' },
        { id: 'ft2', day: 'Today', time: '02:00 PM - 04:00 PM', subject: 'Cloud Computing Lab (IT-B)', roomCode: 'PLACE-01', buildingId: 'b-techpark', facultyName: 'Dr. Prakash' },
        { id: 'ft3', day: 'Tomorrow', time: '09:00 AM - 10:00 AM', subject: 'Database Management Systems (CIVIL)', roomCode: 'LH30', buildingId: 'b-civil', facultyName: 'Dr. Prakash' }
      ].filter(s => s.day === activeDay);
    }

    return [];
  };

  const slots = getTimetableSlots();

  // Find next upcoming class
  const getNextClass = () => {
    if (!currentUser) return null;
    
    if (currentUser.role === 'student') {
      return {
        subject: 'Data Structures & Algorithms',
        roomCode: 'TECH-101',
        time: '11:00 AM',
        faculty: 'Dr. R. Meenakshi',
        building: 'Tech Park Block (Floor 1)',
        buildingId: 'b-techpark'
      };
    }
    
    if (currentUser.role === 'faculty') {
      return {
        subject: 'Computer Networks (IT-A)',
        roomCode: 'LH25',
        time: '11:00 AM',
        faculty: 'Dr. Prakash',
        building: 'Central Library Block (Floor 2)',
        buildingId: 'b-library'
      };
    }

    return null;
  };

  const nextClass = getNextClass();

  const handleNavigate = (roomCode: string) => {
    store.startNavigationToRoom(roomCode);
    router.push(`/navigate?to=${encodeURIComponent(roomCode)}`);
  };

  const getBuildingName = (buildingId: string) => {
    return store.buildings.find((b) => b.id === buildingId)?.name || 'Academic block';
  };

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mx-auto shadow-lg animate-pulse">
          <Lock className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-black text-white">College ID Verification Required</h3>
          <p className="text-xs text-slate-400 leading-relaxed px-4">
            Timetable-based smart navigation features are locked for guest users. Register/login using your college ID to retrieve your personalized lecture schedule.
          </p>
        </div>
        <Link
          href="/auth"
          className="w-full max-w-xs py-3 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg transition flex items-center justify-center gap-1.5 mx-auto border border-sky-500/25"
        >
          <span>Sign In / Register</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 pb-12">
      {/* Title & Real-time Broadcast Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="text-left space-y-1">
          <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <Calendar className="w-6 h-6 text-cyan-400" />
            Academic Schedule & Exam Allocator
          </h2>
          <p className="text-xs text-slate-400">
            Real-time timetable synchronization with automated room change alerts and direct HUD navigation.
          </p>
        </div>

        {/* Live Broadcast Simulator Trigger */}
        <button
          onClick={handleSimulateRelocation}
          disabled={isSimulatingRelocation}
          className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-black shadow-lg shadow-rose-950/40 transition flex items-center gap-2 border border-rose-400/40 shrink-0"
        >
          <Radio className="w-4 h-4 animate-pulse text-amber-200" />
          <span>Simulate Live Relocation Alert</span>
        </button>
      </div>

      {/* Main Tab Switcher (Classes vs Exams) */}
      <div className="flex gap-2 p-1.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-bold max-w-md">
        <button
          onClick={() => setMainTab('classes')}
          className={`flex-1 py-2.5 rounded-xl transition flex items-center justify-center gap-2 ${
            mainTab === 'classes'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Weekly Timetable</span>
        </button>
        <button
          onClick={() => setMainTab('exams')}
          className={`flex-1 py-2.5 rounded-xl transition flex items-center justify-center gap-2 ${
            mainTab === 'exams'
              ? 'bg-gradient-to-r from-amber-500 to-rose-600 text-slate-950 font-black shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Exam Hall Schedule</span>
        </button>
      </div>

      {mainTab === 'exams' ? (
        <section className="space-y-6 animate-in fade-in duration-200">
          <ExamHallLookup />
        </section>
      ) : (
        <>
          {/* Next Class Highlight Panel */}
          {nextClass && (
            <section className="bg-gradient-to-r from-cyan-950/80 via-slate-900 to-blue-950/80 border border-cyan-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3 relative z-10">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-[10px] font-black uppercase tracking-wider border border-cyan-500/20">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  Next Class starts in {timeLeftStr}
                </span>
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-white">{nextClass.subject}</h3>
                  <p className="text-xs text-slate-300 flex items-center gap-1.5 font-semibold">
                    <MapPin className="w-4 h-4 text-cyan-400" />
                    <span>
                      {nextClass.roomCode} — {nextClass.building} • Instructor: {nextClass.faculty}
                    </span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleNavigate(nextClass.roomCode)}
                className="px-5 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/30 transition flex items-center justify-center gap-2 shrink-0 border border-cyan-300/40"
              >
                <Navigation className="w-4 h-4 animate-pulse" />
                <span>Navigate to Room</span>
              </button>
            </section>
          )}

          {/* Day Selectors */}
          <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
            <div className="flex gap-2 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold">
              {(['Today', 'Tomorrow'] as const).map((day) => (
                <button
                  key={day}
                  onClick={() => setActiveDay(day)}
                  className={`px-4 py-2 rounded-lg transition ${
                    activeDay === day ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>

            <span className="text-[10px] text-slate-500 font-extrabold uppercase flex items-center gap-1.5">
              <Info className="w-4 h-4 text-slate-600" />
              Linked to SIET Campus Map
            </span>
          </div>

      {/* Schedule Timeline Slots */}
      <div className="space-y-4 max-w-4xl">
        {slots.length > 0 ? (
          slots.map((slot: TimetableSlot, idx: number) => {
            const isSlotChanged = slot.isChanged;

            return (
              <div
                key={slot.id}
                className={`border rounded-2.5xl p-5 shadow-xl transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group ${
                  isSlotChanged
                    ? 'bg-rose-950/30 border-rose-500/50 hover:border-rose-400'
                    : 'bg-slate-900/40 border-slate-800 hover:border-slate-700/80'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Timeline Number indicator */}
                  <div className={`w-8 h-8 rounded-xl border flex items-center justify-center text-xs font-extrabold shrink-0 ${
                    isSlotChanged
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : 'bg-slate-800 border-slate-750 text-slate-400 group-hover:bg-sky-500/10 group-hover:border-sky-500/20 group-hover:text-sky-400'
                  }`}>
                    {idx + 1}
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs text-sky-400 font-extrabold flex items-center gap-1 bg-sky-500/5 px-2.5 py-0.5 rounded-lg border border-sky-500/10">
                        <Clock className="w-3.5 h-3.5 text-sky-400" />
                        {slot.time}
                      </span>
                      
                      {isSlotChanged ? (
                        <span className="px-2.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                          🚨 REASSIGNED ({slot.previousRoomCode || 'LH-25'} ➔ {slot.roomCode})
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-750 text-[10px] font-bold">
                          Room: {slot.roomCode}
                        </span>
                      )}
                    </div>

                    <h4 className="font-extrabold text-sm text-slate-100 group-hover:text-sky-400 transition-colors">
                      {slot.subject}
                    </h4>

                    {isSlotChanged && (
                      <p className="text-[11px] text-rose-300 font-semibold italic bg-rose-950/60 px-3 py-1 rounded-lg border border-rose-500/30">
                        Reason: {slot.changeReason || 'Room Reassignment'} • AI Advisory: Leave 5 minutes earlier to arrive on time.
                      </p>
                    )}

                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-[11px] text-slate-400 font-semibold">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        {getBuildingName(slot.buildingId)}
                      </span>
                      <span className="hidden sm:inline text-slate-600">•</span>
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-500" />
                        {slot.facultyName}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => handleNavigate(slot.roomCode)}
                  className={`py-2.5 px-4 rounded-xl border text-xs font-extrabold transition shadow-md flex items-center justify-center gap-1.5 shrink-0 ${
                    isSlotChanged
                      ? 'bg-rose-600 hover:bg-rose-500 text-white border-rose-400 shadow-rose-950'
                      : 'bg-slate-800 hover:bg-slate-700/80 border-slate-700/80 text-slate-200 hover:text-white group-hover:bg-sky-600 group-hover:border-sky-500 group-hover:text-white'
                  }`}
                >
                  <Navigation className="w-4 h-4 group-hover:animate-bounce" />
                  <span>Navigate to {slot.roomCode}</span>
                </button>
              </div>
            );
          })
        ) : (
          <div className="py-16 text-center bg-slate-900/10 border border-slate-800 border-dashed rounded-3xl">
            <CalendarDays className="w-12 h-12 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-400">No classes scheduled for {activeDay.toLowerCase()}.</p>
          </div>
        )}
      </div>
      </>
      )}
    </div>
  );
}
