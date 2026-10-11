'use client';

import React, { useState } from 'react';
import { useCampusStore } from '@/lib/store/useCampusStore';
import { Bell, X, Info, AlertTriangle, CheckCircle2, Navigation } from 'lucide-react';

export const NotificationPanel: React.FC = () => {
  const store = useCampusStore();
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = store.notifications.filter((n) => !n.isRead).length;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white font-extrabold text-[10px] flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-slate-900/95 backdrop-blur-2xl border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden z-50 animate-in slide-in-from-top-3 duration-200">
          <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <h4 className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <Bell className="w-4 h-4 text-cyan-400" /> Notifications & Alerts
            </h4>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={() => store.markAllNotificationsAsRead()}
                  className="text-[10px] text-cyan-400 hover:text-cyan-300 font-semibold"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/80 custom-scrollbar">
            {store.notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => store.markNotificationAsRead(notif.id)}
                className={`p-3.5 hover:bg-slate-800/60 transition cursor-pointer flex items-start gap-3 ${
                  !notif.isRead ? 'bg-sky-950/20' : ''
                }`}
              >
                <div className="mt-0.5">
                  {notif.type === 'emergency' ? (
                    <AlertTriangle className="w-4 h-4 text-rose-500" />
                  ) : notif.type === 'class_change' || notif.type === 'exam_alert' ? (
                    <Navigation className="w-4 h-4 text-amber-400 animate-pulse" />
                  ) : (
                    <Info className="w-4 h-4 text-sky-400" />
                  )}
                </div>
                <div className="flex-1">
                  <h5 className="text-xs font-bold text-slate-100">{notif.title}</h5>
                  <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                    {notif.message}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[9px] text-slate-500">{notif.timestamp}</span>
                    {(notif.actionRoomCode || notif.link) && (
                      <a
                        href={notif.link || `/navigate?to=${encodeURIComponent(notif.actionRoomCode || '')}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500 hover:text-slate-950 text-[10px] font-bold transition shadow-sm"
                      >
                        <Navigation className="w-3 h-3" />
                        <span>Navigate</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {store.notifications.length === 0 && (
              <div className="p-6 text-center text-xs text-slate-400">
                No notifications right now.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
