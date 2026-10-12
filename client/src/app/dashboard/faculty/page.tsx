'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCampusStore } from '@/lib/store/useCampusStore';
import { CampusMap } from '@/components/map/CampusMap';
import { PrivacyToggle } from '@/components/privacy/PrivacyToggle';
import { NotificationPanel } from '@/components/notifications/NotificationPanel';
import { EmergencyButton } from '@/components/emergency/EmergencyModal';
import { FacultyUser, AvailabilityStatus } from '@/types';
import {
  Shield,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  MessageSquare,
  LogOut,
  UserCheck,
  Navigation,
  Lock,
  ChevronRight,
  Edit2,
  Check
} from 'lucide-react';
import Link from 'next/link';

export default function FacultyDashboard() {
  const store = useCampusStore();
  const router = useRouter();
  const currentUser = store.currentUser;
  
  const currentFaculty = (currentUser as FacultyUser) || null;
  const [activeStatus, setActiveStatus] = useState<AvailabilityStatus>(currentFaculty?.status || 'Available');
  const [customStatus, setCustomStatus] = useState<string>((currentFaculty as any)?.customStatus || '');
  const [isEditingCustom, setIsEditingCustom] = useState(false);
  const [timeLeftStr, setTimeLeftStr] = useState('11:59');

  // Live countdown timer simulation
  useEffect(() => {
    let seconds = 720; // 12 mins
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

  // Redirect if not faculty
  if (!currentUser || currentUser.role !== 'faculty') {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mx-auto shadow-lg animate-pulse">
          <Lock className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-black text-white">Faculty Verification Required</h3>
          <p className="text-xs text-slate-400 leading-relaxed px-4">
            You must be registered and signed in as a faculty member using a valid employee ID to access the Faculty Portal.
          </p>
        </div>
        <Link
          href="/auth?role=faculty"
          className="w-full max-w-xs py-3 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg transition flex items-center justify-center gap-1.5 mx-auto border border-sky-500/25"
        >
          <span>Sign In / Register</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const handleStatusChange = (newStatus: AvailabilityStatus) => {
    setActiveStatus(newStatus);
    store.setFacultyStatus(newStatus);

    store.addNotification({
      roleTarget: 'all',
      title: 'Status Updated',
      message: `Your status has been updated to: ${newStatus}`,
      type: 'status_update'
    });
  };

  const handleCustomStatusSave = () => {
    store.setFacultyCustomStatus(customStatus);
    setIsEditingCustom(false);

    store.addNotification({
      roleTarget: 'all',
      title: 'Status Update',
      message: `Your status text has been set to: "${customStatus}"`,
      type: 'status_update'
    });
  };

  const handleLogout = () => {
    store.setCurrentUser(null);
    router.push('/');
  };

  const handleNavigateToClass = (roomCode: string) => {
    store.startNavigationToRoom(roomCode);
    router.push('/map');
  };

  const nextLecture = {
    classSection: 'CSE-B',
    subject: 'Computer Networks',
    roomCode: 'LH25',
    time: '11:00 AM',
    building: 'Central Library Block (Floor 2)',
    startsInMinutes: 12
  };

  const getStatusColor = (st: AvailabilityStatus) => {
    switch (st) {
      case 'Available': return 'bg-emerald-500 ring-emerald-500/20';
      case 'In Class': return 'bg-amber-500 ring-amber-500/20';
      case 'In Meeting': return 'bg-purple-500 ring-purple-500/20';
      case 'Away': return 'bg-blue-500 ring-blue-500/20';
      default: return 'bg-red-500 ring-red-500/20'; // DND
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-12">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800 px-4 lg:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-black">
              <Shield className="w-5 h-5" />
            </div>
            <h1 className="font-extrabold text-lg text-white">
              Faculty<span className="text-purple-400">Portal</span>
            </h1>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <EmergencyButton />
          <NotificationPanel />
          <button onClick={handleLogout} className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Profile & Live Status Control Card */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-purple-950/30 border border-slate-850 rounded-3xl p-6 shadow-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-800 border-2 border-purple-500/40 shadow-lg flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentFaculty.avatar}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                Welcome, {currentFaculty.name}
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {currentFaculty.designation}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {currentFaculty.department} • Room {currentFaculty.roomNumber} (Library Block Floor 2)
              </p>
              
              {/* Custom Status Display */}
              <div className="flex items-center gap-2 pt-1">
                {isEditingCustom ? (
                  <div className="flex items-center gap-1 text-[11px]">
                    <input
                      type="text"
                      value={customStatus}
                      onChange={(e) => setCustomStatus(e.target.value)}
                      placeholder="e.g. Available after 2 PM"
                      className="px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-purple-500 text-xs font-semibold w-48"
                    />
                    <button
                      onClick={handleCustomStatusSave}
                      className="p-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold bg-slate-900 border border-slate-850 px-2.5 py-1 rounded-lg">
                    <span>Status: <strong className="text-purple-300 font-bold">{customStatus || 'Not set'}</strong></span>
                    <button
                      onClick={() => setIsEditingCustom(true)}
                      className="text-slate-500 hover:text-slate-200 transition"
                      title="Edit custom status message"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Availability Status Selector */}
          <div className="flex flex-col gap-2 shrink-0">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 pl-1">Set Availability Status</span>
            <div className="bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800 flex flex-wrap gap-1 text-xs font-bold shadow-inner">
              {(['Available', 'In Class', 'In Meeting', 'Away', 'Do Not Disturb'] as AvailabilityStatus[]).map((st) => {
                const isActive = activeStatus === st;
                return (
                  <button
                    key={st}
                    onClick={() => handleStatusChange(st)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition ${
                      isActive
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ring-4 ${getStatusColor(st)}`} />
                    <span>{st}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Location Privacy Toggle */}
        <PrivacyToggle />

        {/* Next Lecture countdown */}
        {nextLecture && (
          <section className="bg-gradient-to-r from-purple-950/70 via-slate-900 to-slate-900 border border-purple-500/30 rounded-3xl p-6 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
            <div className="space-y-3 z-10">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-[10px] font-black uppercase tracking-wider border border-purple-500/20">
                <Clock className="w-3.5 h-3.5 text-purple-400" />
                Next Lecture starts in {timeLeftStr}
              </span>
              <div className="space-y-1">
                <h3 className="text-xl font-black text-white">
                  Class: {nextLecture.classSection} • {nextLecture.subject}
                </h3>
                <p className="text-xs text-slate-300 flex items-center gap-1.5 font-semibold">
                  <MapPin className="w-4 h-4 text-purple-400" />
                  <span>Room {nextLecture.roomCode} — {nextLecture.building}</span>
                </p>
              </div>
            </div>

            <button
              onClick={() => handleNavigateToClass(nextLecture.roomCode)}
              className="px-5 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs shadow-lg shadow-purple-600/30 transition flex items-center justify-center gap-2 shrink-0 border border-purple-400/30"
            >
              <Navigation className="w-4 h-4 animate-pulse" />
              <span>NAVIGATE TO ROOM</span>
            </button>
          </section>
        )}

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Interactive Map View */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="font-bold text-sm text-slate-200">Live Campus Digital Twin Map</h3>
            <CampusMap />
          </div>

          {/* Sidebar: Student Meeting Requests & Today's Timetable */}
          <div className="space-y-6">
            {/* Student Meeting Requests */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2 border-b border-slate-800/60 pb-3">
                <MessageSquare className="w-4 h-4 text-purple-400" />
                Student Meeting Requests
              </h3>

              <div className="space-y-3 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                {store.meetingRequests.length > 0 ? (
                  store.meetingRequests.map((req) => (
                    <div
                      key={req.id}
                      className="p-3.5 rounded-2xl bg-slate-850 border border-slate-800 text-xs space-y-2 font-semibold"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-100">{req.studentName}</span>
                        <span className="text-[10px] text-purple-300 font-semibold">{req.requestedTime}</span>
                      </div>
                      <p className="text-[11px] text-slate-300 font-medium">"{req.purpose}"</p>
                      
                      <div className="pt-1.5 flex gap-2">
                        <button 
                          onClick={() => {
                            store.resolveEmergency(req.id);
                            store.addNotification({
                              roleTarget: 'student',
                              title: 'Meeting Accepted',
                              message: `Your meeting request with Dr. Prakash has been ACCEPTED for ${req.requestedTime}.`,
                              type: 'status_update'
                            });
                          }}
                          className="flex-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] transition shadow-md"
                        >
                          Accept
                        </button>
                        <button 
                          onClick={() => {
                            store.addNotification({
                              roleTarget: 'student',
                              title: 'Meeting Declined',
                              message: `Your meeting request with Dr. Prakash has been DECLINED.`,
                              type: 'status_update'
                            });
                          }}
                          className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[10px] transition"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 italic text-center py-6">
                    No pending student meeting requests.
                  </p>
                )}
              </div>
            </div>

            {/* Assigned Timetable */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2 border-b border-slate-800/60 pb-3">
                <Calendar className="w-4 h-4 text-sky-400" /> Today's Teaching Schedule
              </h3>
              <div className="space-y-2.5 text-xs font-bold">
                <div className="p-3.5 rounded-2xl bg-slate-850 border border-slate-800 flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-slate-100">Computer Networks (IT-A)</h5>
                    <p className="text-[10px] text-slate-400">LH25 (Library Block Floor 2)</p>
                  </div>
                  <span className="text-[10px] font-black text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/10 shrink-0">
                    11:00 AM
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-850 border border-slate-800 flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-slate-100">Cloud Computing Lab (IT-B)</h5>
                    <p className="text-[10px] text-slate-400">PLACE-01 (Tech Park Ground)</p>
                  </div>
                  <span className="text-[10px] font-black text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/10 shrink-0">
                    02:00 PM
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
