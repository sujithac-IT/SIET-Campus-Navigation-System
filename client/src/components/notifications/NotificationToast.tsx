'use client';

import React, { useEffect } from 'react';
import { useCampusStore } from '@/lib/store/useCampusStore';
import { useRouter } from 'next/navigation';
import { campusSocket } from '@/lib/socket';
import { Bell, Navigation, ArrowRight, X, AlertTriangle, Clock, MapPin } from 'lucide-react';

export const NotificationToast: React.FC = () => {
  const store = useCampusStore();
  const router = useRouter();
  const toast = store.latestPushToast;

  useEffect(() => {
    campusSocket.connect();
  }, []);

  if (!toast) return null;

  const handleNavigate = (roomCode?: string) => {
    const targetRoom = roomCode || toast.actionRoomCode || toast.impactAnalysis?.newRoomCode || 'LH-28';
    store.startNavigationToRoom(targetRoom);
    store.clearPushToast();
    router.push(`/map?navigate=${encodeURIComponent(targetRoom)}`);
  };

  const handleViewDetails = () => {
    store.clearPushToast();
    router.push('/notifications');
  };

  return (
    <div className="fixed top-4 left-4 right-4 z-50 max-w-md mx-auto animate-bounce-in">
      <div className="bg-[#0b1329]/95 backdrop-blur-xl border border-rose-500/40 rounded-2xl shadow-2xl shadow-rose-950/40 p-4 text-slate-100 space-y-3 relative overflow-hidden">
        
        {/* Glowing top line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-amber-400 to-sky-400" />

        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 animate-pulse">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  {toast.priority || 'CRITICAL'} PUSH ALERT
                </span>
                <span className="text-[10px] text-slate-400">{toast.timestamp}</span>
              </div>
              <h4 className="text-sm font-extrabold text-white mt-0.5 leading-tight">{toast.title}</h4>
            </div>
          </div>

          <button
            onClick={() => store.clearPushToast()}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Change diff card */}
        {toast.impactAnalysis && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 space-y-2 text-xs">
            <div className="flex items-center justify-between font-mono font-bold text-slate-200">
              <span className="text-slate-400 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                Previous: <del className="text-slate-500">{toast.impactAnalysis.previousRoomCode}</del>
              </span>
              <ArrowRight className="w-4 h-4 text-rose-400" />
              <span className="text-emerald-400 font-extrabold flex items-center gap-1">
                New: <span className="bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30 text-emerald-300">{toast.impactAnalysis.newRoomCode}</span>
              </span>
            </div>

            <p className="text-[11px] text-sky-300 flex items-start gap-1.5 leading-tight">
              <Clock className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
              <span>{toast.impactAnalysis.departureAdvice}</span>
            </p>
          </div>
        )}

        {!toast.impactAnalysis && (
          <p className="text-xs text-slate-300 leading-snug">{toast.message}</p>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => handleNavigate()}
            className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-extrabold text-xs shadow-lg shadow-rose-950 flex items-center justify-center gap-2 transition active:scale-95"
          >
            <Navigation className="w-3.5 h-3.5 fill-current" />
            <span>NAVIGATE TO {toast.actionRoomCode || toast.impactAnalysis?.newRoomCode || 'LH-28'}</span>
          </button>

          <button
            onClick={handleViewDetails}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs border border-slate-700 transition"
          >
            View Change
          </button>
        </div>
      </div>
    </div>
  );
};
