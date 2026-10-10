'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CampusMap } from '@/components/map/CampusMap';
import { GlobalSearch } from '@/components/search/GlobalSearch';
import { ExamHallLookup } from '@/components/search/ExamHallLookup';
import { CampusAIBot } from '@/components/ai/CampusAIBot';
import { PrivacyToggle } from '@/components/privacy/PrivacyToggle';
import { ConstellationBackground } from '@/components/layout/ConstellationBackground';
import { NextClassIntelligence } from '@/components/student/NextClassIntelligence';
import { useCampusStore } from '@/lib/store/useCampusStore';
import {
  Compass,
  GraduationCap,
  Shield,
  UserCheck,
  Building2,
  Sparkles,
  ArrowRight,
  Radio,
  MapPin,
  Lock,
  Layers,
  Search,
  CheckCircle2,
  Footprints,
  Cpu,
  Clock,
  Navigation,
  Globe,
  Zap,
  BookOpen,
  Utensils,
  DollarSign,
  Droplet,
  Car,
  ArrowUpDown,
  Activity,
  Github,
  Linkedin,
  Mail,
  ChevronDown
} from 'lucide-react';

export default function LandingPage() {
  const store = useCampusStore();
  const currentUser = store.currentUser;
  const router = useRouter();
  const [liveTickerIndex, setLiveTickerIndex] = useState(0);

  const tickerMessages = [
    '🟢 14 Faculty Members Online • Real-time status active',
    '👣 Footprint Radar: 128 Students navigating SIET campus right now',
    '📍 LH26: Computer Networks class in session (Library Block Floor 2)',
    '🚀 HackCampus 2026 registration open at Tech Park Incubation Center',
    '⚡ Medical Ward Ambulance Unit on standby at Campus Health Center'
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setLiveTickerIndex((prev) => (prev + 1) % tickerMessages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [tickerMessages.length]);

  // Quick navigation categories
  const quickNavCategories = [
    { label: 'Restrooms', icon: Footprints, category: 'restroom', color: 'text-pink-400 bg-pink-500/10 border-pink-500/20' },
    { label: 'Canteen', icon: Utensils, category: 'canteen', color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
    { label: 'ATM', icon: DollarSign, category: 'atm', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
    { label: 'Drinking Water', icon: Droplet, category: 'water', color: 'text-sky-400 bg-sky-500/10 border-sky-500/20' },
    { label: 'Parking', icon: Car, category: 'parking', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
    { label: 'Lifts', icon: ArrowUpDown, category: 'lift', color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
    { label: 'Security', icon: Shield, category: 'security', color: 'text-teal-400 bg-teal-500/10 border-teal-500/20' },
    { label: 'Medical', icon: Activity, category: 'medical', color: 'text-red-400 bg-red-500/10 border-red-500/20' },
    { label: 'Library', icon: BookOpen, category: 'library', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
    { label: 'Classrooms', icon: Building2, category: 'classroom', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' }
  ];

  const handleQuickNavClick = (category: string) => {
    router.push(`/facilities?category=${category}`);
  };

  const scrollToExplore = () => {
    const el = document.getElementById('explore-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#080c14] text-slate-100 font-sans relative overflow-x-hidden pb-12">
      {/* Interactive Constellation Node-Pathway Background (Dynamic Canvas) */}
      <ConstellationBackground />

      {/* Hero Section Container */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 py-16 space-y-8 z-10">
        {/* Glow Radar Badge (emulating Sujitha's Open to collaboration badge) */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#10b981]/5 border border-[#10b981]/20 text-[#10b981] text-xs font-semibold shadow-lg shadow-emerald-950/20">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Live Footprint Radar Active</span>
        </div>

        {/* Brand Heading (emulating Sujitha's name text style) */}
        <div className="space-y-4 max-w-4xl mx-auto">
          <h2 className="text-4xl sm:text-7xl font-black text-white tracking-tight leading-none">
            Navigate <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-sky-400 bg-clip-text text-transparent">SIET Campus</span>
          </h2>

          {/* Subtitle (emulating Sujitha's skills text) */}
          <h3 className="text-base sm:text-xl font-bold tracking-widest uppercase text-purple-400/95">
            Dijkstra Pathfinding • Multi-Floor Blueprint • Live Tracking
          </h3>

          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed pt-2">
            Experience our dynamic campus digital twin. Instantly pinpoint lecture halls like <strong>LH25 &amp; LH26</strong>, check real-time faculty availability, explore multi-floor layout plans, and calculate seamless walkway routing.
          </p>
        </div>

        {/* Call to Actions (emulating Sujitha's buttons) */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 w-full max-w-xs sm:max-w-md">
          <button
            onClick={scrollToExplore}
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 font-extrabold text-xs text-white transition shadow-lg shadow-purple-600/35 flex items-center justify-center gap-2 border border-purple-400/20"
          >
            <span>Explore Campus Map</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <Link
            href="/auth"
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-transparent hover:bg-slate-900 border border-slate-700/80 hover:border-slate-500 text-xs font-extrabold text-slate-200 hover:text-white transition flex items-center justify-center"
          >
            Sign In / Register
          </Link>
        </div>

        {/* Social connections (emulating Sujitha's footer icons) */}
        <div className="flex items-center justify-center gap-5 pt-8">
          <Link href="https://github.com" target="_blank" className="text-slate-500 hover:text-slate-200 transition">
            <Github className="w-5 h-5" />
          </Link>
          <Link href="https://linkedin.com" target="_blank" className="text-slate-500 hover:text-slate-200 transition">
            <Linkedin className="w-5 h-5" />
          </Link>
          <Link href="mailto:support@siet.edu.in" className="text-slate-500 hover:text-slate-200 transition">
            <Mail className="w-5 h-5" />
          </Link>
        </div>

        {/* Scroll down indicator */}
        <div 
          onClick={scrollToExplore}
          className="absolute bottom-8 cursor-pointer flex flex-col items-center gap-1.5 text-slate-500 hover:text-sky-400 transition-colors"
        >
          <span className="text-[10px] font-bold tracking-widest uppercase opacity-70">Scroll</span>
          <ChevronDown className="w-4 h-4 animate-bounce" />
        </div>
      </section>

      {/* Main Content Area (Separated into its own block) */}
      <div id="explore-section" className="relative z-10 w-full bg-[#080c14]/90 border-t border-slate-900 pt-16">

        {/* Live Broadcast Ticker */}
        <div className="w-full bg-slate-900/90 border-b border-slate-800/80 px-4 py-2.5 text-xs font-semibold text-sky-300 flex items-center justify-center gap-2 overflow-hidden shadow-inner mb-10">
          <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse flex-shrink-0" />
          <span className="truncate max-w-3xl text-center transition-all duration-500">
            {tickerMessages[liveTickerIndex]}
          </span>
        </div>

        <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

          {/* DEMO FAST ROLE SWITCHER BAR */}
          <div className="max-w-4xl mx-auto p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs shadow-xl">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-slate-400 font-bold">Active Role:</span>
              <span className="px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-extrabold border border-sky-500/30 capitalize">
                {currentUser?.role || 'Visitor (Logged Out)'}
              </span>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-slate-500 font-semibold">Switch Persona:</span>
              <button
                onClick={() => store.setCurrentUser(store.users[0])} // Sujitha C (Student)
                className={`px-3 py-1 rounded-xl text-[11px] font-extrabold transition ${
                  currentUser?.role === 'student'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Student (Sujitha C)
              </button>
              <button
                onClick={() => store.setCurrentUser(store.users[1])} // Dr. Prakash (Faculty)
                className={`px-3 py-1 rounded-xl text-[11px] font-extrabold transition ${
                  currentUser?.role === 'faculty'
                    ? 'bg-purple-600 text-white shadow'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Faculty
              </button>
              <button
                onClick={() => store.setCurrentUser(store.users[2])} // Admin
                className={`px-3 py-1 rounded-xl text-[11px] font-extrabold transition ${
                  currentUser?.role === 'admin'
                    ? 'bg-amber-600 text-white shadow'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Admin
              </button>
              <button
                onClick={() => store.setCurrentUser(null)} // Visitor
                className={`px-3 py-1 rounded-xl text-[11px] font-extrabold transition ${
                  !currentUser
                    ? 'bg-sky-600 text-white shadow'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Visitor
              </button>
            </div>
          </div>

          {/* STUDENT LOGGED IN MOBILE APP HOME SECTION */}
          {currentUser && currentUser.role === 'student' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              {/* Student Header Info Pill */}
              <div className="p-5 rounded-3xl bg-gradient-to-r from-slate-900 via-sky-950/40 to-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
                <div className="flex items-center gap-3.5">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-12 h-12 rounded-2xl object-cover ring-2 ring-sky-400/40 shadow-lg"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-extrabold text-white">{currentUser.name}</h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                        {(currentUser as any).registerNumber || '732821104050'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      {(currentUser as any).department || 'Department of Information Technology'} • Year {(currentUser as any).year || 3}, Sec {(currentUser as any).section || 'A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href="/timetable"
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition"
                  >
                    Full Timetable
                  </Link>
                  <Link
                    href="/dashboard/student"
                    className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs shadow-md transition"
                  >
                    Student Portal
                  </Link>
                </div>
              </div>

              {/* AI CLASSROOM SHIFT ALERT BANNER (IF CHANGE OCCURRED) */}
              {store.timetable.some((t) => t.isChanged) && (
                <div className="p-5 rounded-3xl bg-gradient-to-r from-rose-950/80 via-slate-900 to-slate-900 border border-rose-500/50 shadow-2xl space-y-3 animate-pulse-subtle">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
                        <Radio className="w-5 h-5 animate-pulse" />
                      </div>
                      <h4 className="text-sm font-extrabold text-rose-300">
                        🚨 AI REAL-TIME CLASSROOM SHIFT DETECTED
                      </h4>
                    </div>
                    <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      CRITICAL ALERT
                    </span>
                  </div>

                  {store.timetable
                    .filter((t) => t.isChanged)
                    .map((slot) => (
                      <div key={slot.id} className="p-3 rounded-2xl bg-slate-950/80 border border-rose-500/30 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-white text-sm">{slot.subject}</span>
                          <span className="text-slate-400 font-mono">{slot.time}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-300 font-mono">
                          <span>Previous: <del className="text-slate-500">{slot.previousRoomCode || 'LH-25'}</del></span>
                          <ArrowRight className="w-4 h-4 text-rose-400" />
                          <span className="text-emerald-400 font-extrabold">New Room: {slot.roomCode}</span>
                        </div>
                        <p className="text-[11px] text-sky-300 italic">
                          AI Advisory: Class shifted to {slot.roomCode}. Leave 5 minutes earlier to arrive on time.
                        </p>
                        <button
                          onClick={() => {
                            store.startNavigationToRoom(slot.roomCode);
                            router.push(`/map?navigate=${encodeURIComponent(slot.roomCode)}`);
                          }}
                          className="w-full mt-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs shadow-lg shadow-rose-950 flex items-center justify-center gap-2 transition"
                        >
                          <Navigation className="w-3.5 h-3.5 fill-current" />
                          <span>NAVIGATE TO NEW VENUE ({slot.roomCode})</span>
                        </button>
                      </div>
                    ))}
                </div>
              )}

              {/* NEXT CLASS INTELLIGENCE HERO COMPONENT */}
              <NextClassIntelligence />

              {/* TODAY'S TIMETABLE SCHEDULE LIST */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-xs font-black tracking-wider uppercase text-slate-400 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-sky-400" />
                    Today's Academic Schedule
                  </h3>
                  <span className="text-[11px] text-sky-400 font-semibold">
                    {store.timetable.length} Sessions Scheduled
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {store.timetable.map((slot) => (
                    <div
                      key={slot.id}
                      className={`p-4 rounded-2xl border transition-all duration-300 space-y-2.5 shadow-lg ${
                        slot.isChanged
                          ? 'bg-rose-950/20 border-rose-500/40 hover:border-rose-500'
                          : 'bg-slate-900/80 border-slate-800 hover:border-sky-500/40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-white flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-sky-400" />
                          {slot.subject}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">{slot.time}</span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-rose-400" />
                          <span className="font-bold text-slate-100">{slot.roomCode}</span>
                          {slot.isChanged && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                              REASSIGNED
                            </span>
                          )}
                        </div>
                        <span className="text-slate-400 text-[11px]">{slot.facultyName}</span>
                      </div>

                      <button
                        onClick={() => {
                          store.startNavigationToRoom(slot.roomCode);
                          router.push(`/map?navigate=${encodeURIComponent(slot.roomCode)}`);
                        }}
                        className="w-full py-2 rounded-xl bg-slate-800 hover:bg-sky-600 text-slate-200 hover:text-white font-bold text-xs transition flex items-center justify-center gap-1.5"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>Navigate to {slot.roomCode}</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Global Search Bar Widget */}
          <div className="space-y-4 max-w-4xl mx-auto pt-4">
            <GlobalSearch />

            {/* Category Filter Shortcuts */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs">
              <span className="text-slate-500 font-semibold text-[11px] mr-1">Quick Search Chips:</span>
              {[{
                id: 'lh28', label: 'LH 28 (Reassigned Room)'
              }, {
                id: 'lh25', label: 'LH 25 (2nd Floor Library)'
              }, {
                id: 'lh34a', label: 'LH 34A (Civil Block)'
              }, {
                id: '1b', label: '1B (Tech Park)'
              }, {
                id: 'prakash', label: 'Dr. Prakash (HOD)'
              }, {
                id: 'canteen', label: 'Central Food Court'
              }].map((chip) => (
                <button
                  key={chip.id}
                  onClick={() => {
                    const inputEl = document.querySelector('input[type="text"]') as HTMLInputElement;
                    if (inputEl) {
                      inputEl.value = chip.label.split(' ')[0];
                      inputEl.dispatchEvent(new Event('input', { bubbles: true }));
                      inputEl.focus();
                    }
                  }}
                  className="px-3 py-1 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-sky-500/40 text-slate-300 hover:text-sky-300 transition text-[11px] font-medium"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {/* QUICK NAVIGATION SECTION */}
          <section className="max-w-4xl mx-auto space-y-4 pt-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-black tracking-wider uppercase text-slate-400 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                Quick Navigation
              </h3>
              <span className="text-[10px] text-sky-400 bg-sky-500/10 px-2.5 py-0.5 rounded-full font-extrabold border border-sky-500/20">
                Visitor Access Enabled
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {quickNavCategories.map((cat) => (
                <button
                  key={cat.label}
                  onClick={() => handleQuickNavClick(cat.category)}
                  className={`flex flex-col items-center justify-center p-4 rounded-2.5xl border text-center transition-all duration-300 hover:scale-105 hover:bg-slate-900 shadow-lg group ${cat.color}`}
                >
                  <cat.icon className="w-6 h-6 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold text-slate-200 group-hover:text-white transition">{cat.label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Official Controller of Examinations Exam Hall Locator */}
          <ExamHallLookup />

          {/* Privacy & Location Status Toggle */}
          <PrivacyToggle />

          {/* Interactive Digital Twin Map Engine */}
          <div className="space-y-4 pt-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 px-1">
              <div>
                <h3 className="text-lg font-extrabold text-slate-100 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-sky-400" />
                  SIET Campus Digital Twin Blueprint Map
                </h3>
                <p className="text-xs text-slate-400">
                  Click any building or room marker to view details, floor plans, and start Dijkstra pathfinding routing.
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  {store.users.length} Live Users Online
                </span>
              </div>
            </div>

            <CampusMap />
          </div>

          {/* Professional Feature Matrix Cards */}
          <div className="space-y-6 pt-4">
            <div className="text-center max-w-2xl mx-auto">
              <h3 className="text-2xl font-black text-white">Engineered for Smart College Campuses</h3>
              <p className="text-xs text-slate-400 mt-1">
                Combining spatial GIS digital twin blueprints, pathfinding graph algorithms, and real-time footprint tracking.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Feature 1: Marauder's Map Footprint Engine */}
              <div className="bg-slate-900/80 border border-slate-800 hover:border-sky-500/40 rounded-3xl p-6 shadow-xl transition-all duration-300 space-y-3 group">
                <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Footprints className="w-6 h-6 animate-pulse" />
                </div>
                <h4 className="text-base font-bold text-white group-hover:text-sky-300 transition">
                  Animated Footprint Trails 👣
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Experience step trails trailing behind active users moving across campus walkways, showing live student movement patterns across the campus grounds.
                </p>
              </div>

              {/* Feature 2: Multi-Floor Dijkstra A* Navigation */}
              <div className="bg-slate-900/80 border border-slate-800 hover:border-purple-500/40 rounded-3xl p-6 shadow-xl transition-all duration-300 space-y-3 group">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Navigation className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-white group-hover:text-purple-300 transition">
                  Multi-Floor Dijkstra Navigation
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Calculates precise walking distances and ETAs while seamlessly guiding users across ground floors, staircases, and elevators to reach classrooms like LH25 &amp; LH26.
                </p>
              </div>

              {/* Feature 3: Context-Aware AI Campus Assistant */}
              <div className="bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 rounded-3xl p-6 shadow-xl transition-all duration-300 space-y-3 group">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-white group-hover:text-emerald-300 transition">
                  AI Campus Bot
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Ask questions like "Where is LH25?" or "Is Dr. Prakash available?" and receive real database-backed responses with inline clickable navigation shortcuts.
                </p>
              </div>
            </div>
          </div>

          {/* Role Portal Selection Cards */}
          <div className="space-y-4 pt-4 pb-8">
            <div className="text-center">
              <h3 className="text-2xl font-black text-white">Select Your Campus Portal</h3>
              <p className="text-xs text-slate-400 mt-1">Access role-specific features tailored for students, faculty, visitors, and administrators.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Student Login Card */}
              <Link
                href="/auth?role=student"
                className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900 transition-all duration-300 shadow-xl group flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-3xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-base text-slate-100 group-hover:text-emerald-300 transition">
                    Student Portal
                  </h4>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                    View daily timetable, navigate to next class (LH26), search free lecture halls, and manage live location privacy.
                  </p>
                </div>
                <span className="mt-5 text-xs font-bold text-emerald-400 flex items-center gap-1">
                  Student Sign In <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>

              {/* Faculty Login Card */}
              <Link
                href="/auth?role=faculty"
                className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-purple-500/50 hover:bg-slate-900 transition-all duration-300 shadow-xl group flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-3xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Shield className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-base text-slate-100 group-hover:text-purple-300 transition">
                    Faculty / Staff
                  </h4>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                    Update live availability status (Available, In Class, In Meeting), view assigned classrooms, and manage student requests.
                  </p>
                </div>
                <span className="mt-5 text-xs font-bold text-purple-400 flex items-center gap-1">
                  Faculty Sign In <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>

              {/* Visitor Mode Card */}
              <Link
                href="/map"
                className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-sky-500/50 hover:bg-slate-900 transition-all duration-300 shadow-xl group flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-3xl bg-sky-500/20 text-sky-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-base text-slate-100 group-hover:text-sky-300 transition">
                    Visitor Mode
                  </h4>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                    Instant guest access to explore SIET campus buildings, auditoriums, canteen, hostels, and sports grounds.
                  </p>
                </div>
                <span className="mt-5 text-xs font-bold text-sky-400 flex items-center gap-1">
                  Explore as Visitor <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>

              {/* Admin Login Card */}
              <Link
                href="/auth?role=admin"
                className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-900 transition-all duration-300 shadow-xl group flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-3xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Layers className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-base text-slate-100 group-hover:text-amber-300 transition">
                    Admin Control
                  </h4>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                    Manage digital twin buildings, classrooms, path nodes, send broadcast notifications, and monitor emergency alerts.
                  </p>
                </div>
                <span className="mt-5 text-xs font-bold text-amber-400 flex items-center gap-1">
                  Admin Portal <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            </div>
          </div>
        </main>
      </div>

      {/* Floating AI Assistant Bot */}
      <CampusAIBot />

      {/* Google-Style Footer */}
      <footer className="relative z-10 border-t border-slate-800/80 bg-[#060910] py-8 text-center text-xs text-slate-400 space-y-2">
        <p className="font-semibold text-slate-300">
          CampusPulse Smart Campus Navigation Engine • Sri Shakthi Institute of Engineering and Technology (SIET)
        </p>
        <p className="text-[11px] text-slate-500">
          Digital Twin Blueprint Map • Dijkstra Navigation Engine • Privacy-First Real-Time Location System
        </p>
      </footer>
    </div>
  );
}
