'use client';

import React, { useState, useEffect } from 'react';
import { WifiOff, Database } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    if (typeof window !== 'undefined') {
      setIsOffline(!navigator.onLine);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2.5 px-4 py-2 rounded-xl bg-amber-500/90 text-slate-950 font-bold text-xs shadow-xl backdrop-blur-md animate-bounce">
      <WifiOff className="w-4 h-4 text-slate-950" />
      <span>OFFLINE MODE • Using Cached Campus Graph & Local Data</span>
      <Database className="w-3.5 h-3.5 opacity-80" />
    </div>
  );
};
