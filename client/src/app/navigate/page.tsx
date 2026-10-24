'use client';

import React, { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function NavigateRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Preserve any existing query parameters (to, navigate, name, lat, lng, mode)
    const currentParams = new URLSearchParams(searchParams ? searchParams.toString() : '');
    
    // If 'to' was used, normalize to 'navigate'
    if (currentParams.has('to') && !currentParams.has('navigate')) {
      currentParams.set('navigate', currentParams.get('to') || '');
      currentParams.delete('to');
    }

    if (!currentParams.has('mode')) {
      currentParams.set('mode', 'navigation');
    }

    const query = currentParams.toString();
    const targetUrl = query ? `/map?${query}` : '/map?mode=navigation';
    router.replace(targetUrl);
  }, [router, searchParams]);

  return (
    <div className="w-screen h-screen bg-slate-950 flex flex-col items-center justify-center text-cyan-400 gap-4 select-none">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin"></div>
        <span className="absolute inset-0 flex items-center justify-center text-xs">🛰️</span>
      </div>
      <div className="text-center space-y-1">
        <h2 className="text-base font-bold text-white tracking-wide">
          Launching Real SIET Satellite Navigation
        </h2>
        <p className="text-xs text-slate-400">
          Connecting to Esri Satellite imagery & OpenStreetMap pedestrian network...
        </p>
      </div>
    </div>
  );
}

export default function NavigatePage() {
  return (
    <Suspense
      fallback={
        <div className="w-screen h-screen bg-slate-950 flex items-center justify-center text-cyan-400 font-mono text-xs">
          Loading SIET Geospatial Satellite System...
        </div>
      }
    >
      <NavigateRedirect />
    </Suspense>
  );
}
