'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCampusStore } from '@/lib/store/useCampusStore';
import { CampusMap } from '@/components/map/CampusMap';
import { FacultyFinder } from '@/components/faculty/FacultyFinder';
import { StudentFinder } from '@/components/student/StudentFinder';
import { CampusEvents } from '@/components/events/CampusEvents';
import { PrivacyToggle } from '@/components/privacy/PrivacyToggle';
import { NotificationPanel } from '@/components/notifications/NotificationPanel';
import { EmergencyButton } from '@/components/emergency/EmergencyModal';
import { CampusAIBot } from '@/components/ai/CampusAIBot';
import { ExamHallLookup } from '@/components/search/ExamHallLookup';
import {
  GraduationCap,
  Calendar,
  Clock,
  MapPin,
  Navigation,
  Search,
  Users,
  Sparkles,
  ArrowRight,
  User,
  Compass,
  LogOut,
  Radio,
  BookOpen,
  Briefcase,
  Bot,
  Lock,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';

export default function StudentDashboard() {
  const store = useCampusStore();
  const router = useRouter();
  const currentUser = store.currentUser;
  
  const [activeTab, setActiveTab] = useState<'overview' | 'map' | 'faculty' | 'students' | 'events'>('overview');
  const [timeLeftStr, setTimeLeftStr] = useState('14:59');

  // Live countdown timer simulation
  useEffect(() => {
    let seconds = 900; // 15 mins
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

  // Redirect if not student
  if (!currentUser || currentUser.role !== 'student') {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mx-auto shadow-lg animate-pulse">
          <Lock className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-black text-white">Student Verification Required</h3>
          <p className="text-xs text-slate-400 leading-relaxed px-4">
            You must be registered and signed in as a student using a valid college ID to access the Student Portal.
          </p>
        </div>
        <Link
          href="/auth?role=student"
          className="w-full max-w-xs py-3 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg transition flex items-center justify-center gap-1.5 mx-auto border border-sky-500/25"
        >
          <span>Sign In / Register</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const nextClass = {
    subject: 'Data Structures & Algorithms',
    roomCode: 'LH25',
    time: '09:00 AM',
    faculty: 'Dr. R. Meenakshi',
    building: 'Central Library Block (Floor 2)',
    walkingTimeMinutes: 5,
    distanceMeters: 250
  };

  const todaySchedule = [
    { time: '09:00 AM', subject: 'Data Structures', roomCode: 'LH25' },
    { time: '10:00 AM', subject: 'Operating Systems', roomCode: 'LH26' },
    { time: '11:00 AM', subject: 'Computer Networks', roomCode: 'LH25' },
    { time: '02:00 PM', subject: 'AI Workshop', roomCode: '1A-I' }
  ];

  const quickActions = [
    { label: 'Campus Map', icon: Compass, href: '/map', desc: 'Full digital twin map' },
    { label: 'Navigate', icon: Navigation, action: () => store.startNavigationToRoom('LH25'), desc: 'Start route to next class' },
    { label: 'Timetable', icon: Calendar, href: '/timetable', desc: 'Weekly class schedule' },
    { label: 'Events', icon: Sparkles, href: '/events', desc: 'Workshops & hackathons' },
    { label: 'Announcements', icon: Radio, href: '/announcements', desc: 'Broadcast notifications' },
    { label: 'Facilities', icon: Briefcase, href: '/facilities', desc: 'Find restrooms, ATMs, lifts' },
  ];

  const handleAction = (action: typeof quickActions[0]) => {
    if (action.action) {
      action.action();
      router.push('/map');
    } else if (action.href) {
      router.push(action.href);
    }
  };

  const handleLogout = () => {
    store.setCurrentUser(null);
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-12">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800 px-4 lg:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h1 className="font-extrabold text-lg text-white">
              Student<span className="text-emerald-400">Portal</span>
            </h1>
          </Link>
        </div>

        {/* Tab Navigation */}
        <div className="hidden md:flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs font-bold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-1.5 rounded-lg transition ${
              activeTab === 'overview' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('map')}
            className={`px-3.5 py-1.5 rounded-lg transition ${
              activeTab === 'map' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Digital Map
          </button>
          <button
            onClick={() => setActiveTab('faculty')}
            className={`px-3.5 py-1.5 rounded-lg transition ${
              activeTab === 'faculty' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Find Faculty
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`px-3.5 py-1.5 rounded-lg transition ${
              activeTab === 'students' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Students
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`px-3.5 py-1.5 rounded-lg transition ${
              activeTab === 'events' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Events
          </button>
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
        {/* User Profile Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/30 border border-slate-850 rounded-3xl p-6 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-800 border-2 border-emerald-500/40 shadow-lg flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentUser.avatar}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                Good Morning, {currentUser.name.split(' ')[0]}!
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  IT Student
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {currentUser.department} • Year {currentUser.year} (Section {currentUser.section}) • Roll No: {currentUser.registerNumber}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('map')}
              className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 border border-sky-500/25"
            >
              <Compass className="w-4 h-4 animate-spin-slow" /> 
              <span>Open Campus Twin</span>
            </button>
          </div>
        </div>

        {/* Location Privacy Bar */}
        <PrivacyToggle />

        {/* Official Controller of Examinations Exam Hall Locator */}
        <ExamHallLookup />

        {/* Dynamic Tab Views */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            
            {/* NEXT CLASS & TODAY SCHEDULE DUAL VIEW */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Next Class Highlight Card (Takes 2 columns) */}
              <div className="lg:col-span-2 bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900 border border-emerald-500/40 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[220px]">
                <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
                
                <div className="space-y-2 relative z-10">
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-wider border border-emerald-500/20">
                    Next Class Starts In {timeLeftStr}
                  </span>
                  <h3 className="text-2xl font-black text-white mt-1">{nextClass.subject}</h3>
                  <p className="text-xs text-slate-300 flex items-center gap-1.5 font-semibold">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    <span>
                      Room {nextClass.roomCode} — {nextClass.building} • Instructor: {nextClass.faculty}
                    </span>
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-800/60 mt-4">
                  <div className="text-slate-400 text-xs font-semibold">
                    Walking time: <strong className="text-emerald-400">{nextClass.walkingTimeMinutes} mins</strong> ({nextClass.distanceMeters} meters)
                  </div>
                  
                  <button
                    onClick={() => {
                      store.startNavigationToRoom(nextClass.roomCode);
                      setActiveTab('map');
                    }}
                    className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2 border border-emerald-400/30"
                  >
                    <Navigation className="w-4 h-4 animate-pulse" /> 
                    <span>NAVIGATE TO CLASS</span>
                  </button>
                </div>
              </div>

              {/* Today's Schedule Card (Takes 1 column) */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4 flex flex-col justify-between">
                <h3 className="font-extrabold text-sm text-slate-100 flex items-center gap-2 border-b border-slate-800/60 pb-3">
                  <Calendar className="w-4 h-4 text-sky-400" />
                  Today's Schedule
                </h3>

                <div className="space-y-3 flex-1 overflow-y-auto max-h-[160px] pr-1 custom-scrollbar text-xs font-bold">
                  {todaySchedule.map((slot) => (
                    <div key={slot.time} className="flex items-center justify-between p-2 rounded-xl bg-slate-850/80 border border-slate-800/50">
                      <div>
                        <div className="text-slate-200">{slot.subject}</div>
                        <div className="text-[10px] text-slate-400">Room: {slot.roomCode}</div>
                      </div>
                      <span className="text-[10px] text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/10 shrink-0">
                        {slot.time.split(' ')[0]}
                      </span>
                    </div>
                  ))}
                </div>

                <Link
                  href="/timetable"
                  className="w-full text-center py-2 bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-xs rounded-xl border border-slate-800 transition block mt-3"
                >
                  View Full Timetable
                </Link>
              </div>

            </div>

            {/* QUICK ACTIONS SECTION */}
            <div className="space-y-3">
              <h3 className="font-extrabold text-sm text-slate-200">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {quickActions.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => handleAction(action)}
                    className="flex flex-col items-center justify-center p-4 rounded-2.5xl bg-slate-900/40 border border-slate-800 hover:border-sky-500/30 hover:bg-slate-900 transition-all duration-300 shadow-xl group text-center"
                  >
                    <div className="w-10 h-10 rounded-xl bg-slate-800/80 text-sky-400 flex items-center justify-center mb-2 group-hover:scale-110 group-hover:bg-sky-500/10 group-hover:text-sky-400 transition-all shadow-inner">
                      <action.icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-extrabold text-slate-200 group-hover:text-white transition">{action.label}</span>
                    <span className="text-[9px] text-slate-500 mt-1 leading-tight group-hover:text-slate-400 transition-colors hidden sm:block">
                      {action.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Action Grid Preview panels */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Campus Digital Map Viewport */}
              <div className="space-y-3">
                <h3 className="font-bold text-sm text-slate-200">Interactive Map Preview</h3>
                <CampusMap />
              </div>

              {/* Faculty Quick Lookup */}
              <div className="space-y-3">
                <h3 className="font-bold text-sm text-slate-200">Quick Faculty Directory</h3>
                <FacultyFinder />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'map' && <CampusMap />}
        {activeTab === 'faculty' && <FacultyFinder />}
        {activeTab === 'students' && <StudentFinder />}
        {activeTab === 'events' && <CampusEvents />}
      </main>

      <CampusAIBot />
    </div>
  );
}
