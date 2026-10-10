'use client';

import React from 'react';
import Link from 'next/link';
import { HeroCanvas } from './HeroCanvas';
import { MapPin, ShieldCheck, ChevronRight } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden py-16" id="hero">
      <div className="container mx-auto px-4 flex flex-col lg:flex-row items-center gap-12">
        <div className="lg:w-1/2 space-y-6 text-center lg:text-left">
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Navigate SIET Campus <span className="text-cyan-400">Like a Game.</span>
          </h1>
          <p className="text-base text-slate-300">
            Turn-by-turn voice directions to classrooms, floors, labs, Tech Park, canteen, and hostels with real-time room shift alerts.
          </p>
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
            <Link
              href="/map?focus=search"
              className="px-6 py-3.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold rounded-2xl shadow-lg shadow-cyan-400/20 transition flex items-center gap-2"
            >
              <MapPin className="w-4 h-4" /> Find a Place
            </Link>
            <Link
              href="/map?mode=visitor"
              className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold rounded-2xl transition flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-cyan-400" /> I'm a Visitor
            </Link>
            <Link
              href="/auth"
              className="px-6 py-3.5 bg-transparent hover:bg-slate-900 border border-slate-800 text-slate-300 rounded-2xl transition flex items-center gap-1.5"
            >
              <span>Login</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
        <div className="lg:w-1/2 w-full flex justify-center">
          <HeroCanvas />
        </div>
      </div>
    </section>
  );
}
