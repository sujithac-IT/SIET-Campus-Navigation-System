'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CampusMap } from '@/components/map/CampusMap';
import { GlobalSearch } from '@/components/search/GlobalSearch';
import { CategoryFilterChips } from '@/components/map/CategoryFilterChips';
import { PrivacyToggle } from '@/components/privacy/PrivacyToggle';
import { EmergencyButton } from '@/components/emergency/EmergencyModal';
import { NotificationPanel } from '@/components/notifications/NotificationPanel';
import { Compass, ArrowLeft, Sparkles, Navigation, X } from 'lucide-react';

function VisitorBanner() {
  const searchParams = useSearchParams();
  const isVisitor = searchParams?.get('mode') === 'visitor';
  const [dismissed, setDismissed] = useState(false);

  if (!isVisitor || dismissed) return null;

  return (
    <div className="bg-gradient-to-r from-cyan-950/90 via-slate-900/90 to-blue-950/90 border border-cyan-500/30 rounded-2xl p-3 sm:p-4 flex items-center justify-between shadow-xl backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold flex-shrink-0">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <p className="text-xs font-bold text-white">Welcome, Campus Visitor!</p>
          <p className="text-[11px] text-slate-300">
            Enjoy full guest access with no login required. Tap any building, search for a hall, or ask the AI guide for route directions.
          </p>
        </div>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function MapPage() {
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-black">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800 px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-cyan-500/40 transition"
            title="Back to Landing Page"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h1 className="font-extrabold text-sm sm:text-base text-white">SIET Digital Campus Map</h1>
              <p className="text-[10px] text-slate-400 hidden sm:block">Satellite & Indoor Multi-Floor Navigator</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3">
          <Link
            href="/map?navigate=techpark&name=Tech+Park"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500 hover:text-slate-950 text-xs font-bold transition shadow-sm"
          >
            <Navigation className="w-3.5 h-3.5" /> Start HUD
          </Link>
          <EmergencyButton />
          <NotificationPanel />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 space-y-3.5">
        <Suspense fallback={null}>
          <VisitorBanner />
        </Suspense>

        {/* Global Search with Autocomplete */}
        <GlobalSearch />

        {/* Category Filter Chips Bar */}
        <CategoryFilterChips
          activeCategory={selectedCategory}
          onSelectCategory={(cat) => setSelectedCategory(cat)}
        />

        {/* Interactive Campus Map Canvas Viewport */}
        <CampusMap />

        {/* Privacy & Location Sharing Control */}
        <div className="pt-1">
          <PrivacyToggle />
        </div>
      </main>
    </div>
  );
}
