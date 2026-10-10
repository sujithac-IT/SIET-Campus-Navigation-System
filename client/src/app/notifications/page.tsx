'use client';

import React, { useState } from 'react';
import { useCampusStore } from '@/lib/store/useCampusStore';
import { useRouter } from 'next/navigation';
import { 
  Bell, 
  AlertTriangle, 
  Navigation, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Mail, 
  Smartphone, 
  Filter,
  ShieldCheck
} from 'lucide-react';
import { NotificationPriority } from '@/types';

export default function NotificationsPage() {
  const store = useCampusStore();
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | NotificationPriority>('ALL');
  const [activeTab, setActiveTab] = useState<'app' | 'fallback'>('app');

  const notifications = store.notifications;
  const fallbackLogs = store.fallbackLogs;

  const filteredNotifications = notifications.filter((n) => {
    if (selectedFilter === 'ALL') return true;
    return (n.priority || 'LOW') === selectedFilter;
  });

  const handleNavigate = (roomCode?: string) => {
    const targetRoom = roomCode || 'LH-28';
    store.startNavigationToRoom(targetRoom);
    router.push(`/map?navigate=${encodeURIComponent(targetRoom)}`);
  };

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 p-4 sm:p-6 pb-24 max-w-4xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <Bell className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white">Instant AI Notifications</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time schedule changes, classroom relocations, and AI impact advisories.
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
          <button
            onClick={() => setActiveTab('app')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              activeTab === 'app'
                ? 'bg-rose-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            App Push ({notifications.length})
          </button>
          <button
            onClick={() => setActiveTab('fallback')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              activeTab === 'fallback'
                ? 'bg-rose-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            SMS / Email Logs ({fallbackLogs.length})
          </button>
        </div>
      </div>

      {activeTab === 'app' && (
        <>
          {/* Priority Filters */}
          <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-2 text-xs">
            <span className="text-slate-500 font-semibold flex items-center gap-1 shrink-0">
              <Filter className="w-3.5 h-3.5" /> Filter:
            </span>
            {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((pri) => (
              <button
                key={pri}
                onClick={() => setSelectedFilter(pri)}
                className={`px-3 py-1 rounded-full font-extrabold transition shrink-0 ${
                  selectedFilter === pri
                    ? pri === 'CRITICAL'
                      ? 'bg-rose-500 text-white shadow-lg shadow-rose-950'
                      : pri === 'HIGH'
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-sky-500 text-white'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {pri}
              </button>
            ))}
          </div>

          {/* Notifications List */}
          <div className="space-y-4">
            {filteredNotifications.length === 0 ? (
              <div className="p-12 text-center bg-slate-900/50 border border-slate-800 rounded-3xl space-y-2">
                <CheckCircle2 className="w-10 h-10 text-slate-600 mx-auto" />
                <h3 className="text-sm font-bold text-slate-300">No Notifications</h3>
                <p className="text-xs text-slate-500">You are all caught up with your timetable alerts.</p>
              </div>
            ) : (
              filteredNotifications.map((notif) => {
                const priority = notif.priority || (notif.type === 'class_change' ? 'CRITICAL' : 'LOW');
                const isCritical = priority === 'CRITICAL';
                const isHigh = priority === 'HIGH';

                return (
                  <div
                    key={notif.id}
                    className={`p-5 rounded-2xl border transition-all duration-300 space-y-3 shadow-xl ${
                      isCritical
                        ? 'bg-gradient-to-br from-rose-950/40 via-slate-900 to-slate-900 border-rose-500/40 hover:border-rose-500'
                        : isHigh
                        ? 'bg-gradient-to-br from-amber-950/30 via-slate-900 to-slate-900 border-amber-500/40 hover:border-amber-500'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                            isCritical
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                              : isHigh
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                              : 'bg-sky-500/20 text-sky-300 border-sky-500/30'
                          }`}
                        >
                          {priority}
                        </span>
                        <span className="text-[11px] text-slate-400">{notif.timestamp}</span>
                      </div>

                      {!notif.isRead && (
                        <button
                          onClick={() => store.markNotificationAsRead(notif.id)}
                          className="text-[10px] font-bold text-sky-400 hover:underline"
                        >
                          Mark Read
                        </button>
                      )}
                    </div>

                    <h3 className="text-base font-extrabold text-white leading-tight">{notif.title}</h3>

                    {/* Change Diff Banner if available */}
                    {notif.impactAnalysis && (
                      <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
                        <div className="flex items-center justify-between font-mono font-bold">
                          <span className="text-slate-400 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-500" />
                            Previous: <del className="text-slate-500">{notif.impactAnalysis.previousRoomCode}</del>
                          </span>
                          <ArrowRight className="w-4 h-4 text-rose-400" />
                          <span className="text-emerald-400 font-black flex items-center gap-1">
                            New: <span className="bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30 text-emerald-300">{notif.impactAnalysis.newRoomCode}</span>
                          </span>
                        </div>

                        <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-300 text-[11px] flex items-start gap-2">
                          <Clock className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                          <span>AI Advisory: {notif.impactAnalysis.departureAdvice}</span>
                        </div>
                      </div>
                    )}

                    <p className="text-xs text-slate-300 leading-relaxed">{notif.message}</p>

                    {/* Action buttons */}
                    <div className="flex items-center gap-3 pt-1">
                      <button
                        onClick={() => handleNavigate(notif.actionRoomCode || notif.impactAnalysis?.newRoomCode)}
                        className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs shadow-lg shadow-rose-950 flex items-center gap-2 transition"
                      >
                        <Navigation className="w-3.5 h-3.5 fill-current" />
                        <span>Navigate to {notif.actionRoomCode || notif.impactAnalysis?.newRoomCode || 'Class'}</span>
                      </button>

                      {notif.fallbackLog && (
                        <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 font-semibold flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" /> SMS & Email Delivered
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

      {activeTab === 'fallback' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1 text-xs text-slate-400">
            <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              Fallback SMS & Email Dispatch Audit Log
            </h3>
            <p>
              When critical classroom changes are published, the system automatically triggers fallback SMS & Email dispatches to affected students' registered phones and college email accounts.
            </p>
          </div>

          <div className="space-y-3">
            {fallbackLogs.map((log) => (
              <div
                key={log.id}
                className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2 text-xs shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
                    STATUS: DELIVERED
                  </span>
                  <span className="text-slate-500">{log.timestamp}</span>
                </div>

                <h4 className="font-bold text-slate-100 text-sm">{log.title}</h4>

                <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-slate-400">
                  <div>Recipients: <span className="text-slate-200 font-bold">{log.recipientCount} Students</span></div>
                  <div>Channels: <span className="text-sky-300 font-bold">{log.channels.join(' & ')}</span></div>
                  <div className="col-span-2 text-slate-500 truncate">
                    Sample Address: <span className="text-slate-300 font-mono">{log.sampleRecipient}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
