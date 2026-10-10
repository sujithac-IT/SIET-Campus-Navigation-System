'use client';

import React from 'react';
import Link from 'next/link';
import { CampusMap } from '@/components/map/CampusMap';
import { GlobalSearch } from '@/components/search/GlobalSearch';
import { PrivacyToggle } from '@/components/privacy/PrivacyToggle';
import { EmergencyButton } from '@/components/emergency/EmergencyModal';
import { NotificationPanel } from '@/components/notifications/NotificationPanel';
import { CampusAIBot } from '@/components/ai/CampusAIBot';
import { Compass, ArrowLeft } from 'lucide-react';

export default function MapPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800 px-4 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
              <Compass className="w-4 h-4" />
            </div>
            <h1 className="font-extrabold text-base text-white">Campus Digital Twin Map</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <EmergencyButton />
          <NotificationPanel />
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 space-y-4">
        <GlobalSearch />
        <PrivacyToggle />
        <CampusMap />
      </main>

      <CampusAIBot />
    </div>
  );
}
