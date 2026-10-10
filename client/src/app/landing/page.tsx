'use client';

import React from 'react';
import Link from 'next/link';
import { HeroCanvas } from '@/components/landing/HeroCanvas';
import {
  Compass,
  Navigation,
  MapPin,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Accessibility,
  Cpu,
  Layers,
  ChevronRight,
  Smartphone,
  CheckCircle2,
  Volume2,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-black">
      {/* Top Floating Glass Navigation Header */}
      <header className="sticky top-0 z-50 w-full px-4 sm:px-8 py-3.5 bg-slate-950/80 backdrop-blur-xl border-b border-cyan-500/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* SIET Branding Placeholder */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform duration-300">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-white group-hover:text-cyan-400 transition-colors">
                  SIET <span className="text-cyan-400">Navigate</span>
                </span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-400">
                  Campus OS
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">Sri Shakthi Institute of Engineering & Technology</p>
            </div>
          </Link>

          {/* Quick Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/map"
              className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-cyan-400 transition"
            >
              <Navigation className="w-3.5 h-3.5" /> Campus Map
            </Link>
            <Link
              href="/timetable"
              className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-cyan-400 transition"
            >
              <Calendar className="w-3.5 h-3.5" /> Timetable
            </Link>
            <Link
              href="/auth"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 border border-slate-700/80 text-slate-200 hover:text-white hover:border-cyan-400/50 hover:bg-slate-800 transition shadow-sm"
            >
              Login
            </Link>
            <Link
              href="/map?mode=visitor"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold transition shadow-lg shadow-cyan-500/20 flex items-center gap-1.5"
            >
              Explore Map <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 pt-10 pb-16 flex flex-col lg:flex-row items-center gap-12 lg:gap-8 justify-between">
        {/* Left Column: Game-Style Typography & High-Energy CTAs */}
        <div className="flex-1 max-w-2xl space-y-7 text-center lg:text-left z-10">
          {/* Subtitle Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-400 text-xs font-mono font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>SUB-METER 3D CAMPUS NAVIGATION • ZERO DELAY</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-white">
            Navigate SIET Campus{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
              Like a Game.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed max-w-xl mx-auto lg:mx-0">
            Turn-by-turn voice guidance to classrooms, labs, Tech Park, canteen, hostels, and gates.
            Instant real-time alerts when your lectures or exam halls change venue.
          </p>

          {/* Three Primary CTAs Per Specification */}
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-2">
            {/* CTA 1: Find a place */}
            <Link
              href="/map?focus=search"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-sm transition-all duration-300 shadow-xl shadow-cyan-400/25 flex items-center justify-center gap-2 group"
            >
              <MapPin className="w-4 h-4 text-slate-950 group-hover:scale-110 transition-transform" />
              <span>Find a Place</span>
            </Link>

            {/* CTA 2: I'm a visitor */}
            <Link
              href="/map?mode=visitor"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-cyan-400/50 text-white font-bold text-sm transition-all duration-300 shadow-lg backdrop-blur-md flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>I'm a Visitor</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                No Login
              </span>
            </Link>

            {/* CTA 3: Login */}
            <Link
              href="/auth"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-950/60 hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-white font-semibold text-sm transition flex items-center justify-center gap-1.5"
            >
              <span>Student / Staff Login</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Key Assurance Indicators */}
          <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Installable PWA (Offline Ready)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Volume2 className="w-4 h-4 text-cyan-400" />
              <span>Spoken Turn-by-Turn Voice</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Accessibility className="w-4 h-4 text-indigo-400" />
              <span>Wheelchair / Lift Accessible</span>
            </div>
          </div>
        </div>

        {/* Right Column: Live Animated 60fps Hero Canvas */}
        <div className="flex-1 w-full max-w-lg lg:max-w-none flex justify-center">
          <HeroCanvas />
        </div>
      </section>

      {/* Bento Feature Grid */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-16 border-t border-slate-800/60">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Engineered for Campus Realities
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Built from the ground up for students, professors, and outside guests visiting SIET.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1 */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 transition-all duration-300 group">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Turn-by-Turn Natural Guidance</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Directional prompts with physical landmarks: "Turn left after the water cooler, take stairs to Floor 2."
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 transition-all duration-300 group">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Live Room Shift Radar</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Real-time WebSocket alerts instantly re-route you when classes move from LH 05 to Tech Park AI Lab.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 transition-all duration-300 group">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">3D Multi-Floor Overlay</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Seamlessly switch between Ground, 1st, and 2nd floor plans with precise indoor room boundaries.
            </p>
          </div>

          {/* Card 4 */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-pink-500/40 transition-all duration-300 group">
            <div className="w-10 h-10 rounded-2xl bg-pink-500/20 text-pink-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Grounded AI Voice Agent</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Speak naturally to ask "Where is my 10 AM class?" Spoken replies with direct navigation deep links.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-slate-900 bg-slate-950 py-8 px-4 text-center text-xs text-slate-500">
        <p>© 2026 Sri Shakthi Institute of Engineering & Technology (SIET). Smart Campus Navigation System.</p>
        <p className="mt-1 font-mono text-[10px] text-slate-600">Built with Next.js PWA • PostGIS • MapLibre GL • Express Monolith</p>
      </footer>
    </div>
  );
}
