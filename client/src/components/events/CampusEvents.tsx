'use client';

import React, { useState } from 'react';
import { useCampusStore } from '@/lib/store/useCampusStore';
import { Calendar, MapPin, Clock, Users, Navigation, CheckCircle2, Sparkles } from 'lucide-react';

export const CampusEvents: React.FC = () => {
  const store = useCampusStore();
  const [registeredIds, setRegisteredIds] = useState<string[]>([]);

  const handleRegister = (eventId: string) => {
    store.registerForEvent(eventId);
    setRegisteredIds((prev) => [...prev, eventId]);
  };

  const handleNavigateToVenue = (coords: { x: number; y: number }, venueName: string) => {
    store.startNavigationToCoords(coords, `Event Venue: ${venueName}`);
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            Upcoming Campus Events & Hackathons
          </h3>
          <p className="text-xs text-slate-400">Discover workshops, symposiums, and cultural events.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {store.events.map((event) => {
          const isRegistered = registeredIds.includes(event.id);

          return (
            <div
              key={event.id}
              className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between hover:border-sky-500/40 transition-all duration-300"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold uppercase tracking-wider">
                    {event.category}
                  </span>
                  <span className="text-xs text-amber-400 font-semibold flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" /> {event.registeredCount} Registered
                  </span>
                </div>

                <h4 className="text-base font-bold text-slate-100">{event.title}</h4>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">{event.description}</p>

                <div className="mt-4 space-y-1.5 text-xs text-slate-400">
                  <p className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-sky-400" />
                    <span>{event.date} • {event.time}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-rose-400" />
                    <span>{event.venueRoomCode}</span>
                  </p>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-800 flex items-center gap-3">
                <button
                  onClick={() => handleNavigateToVenue(event.coordinates, event.venueRoomCode)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 font-bold text-xs transition flex items-center justify-center gap-1.5"
                >
                  <Navigation className="w-3.5 h-3.5" /> Navigate to Venue
                </button>

                <button
                  onClick={() => handleRegister(event.id)}
                  disabled={isRegistered}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition shadow-md flex items-center justify-center gap-1.5 ${
                    isRegistered
                      ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40'
                      : 'bg-gradient-to-r from-sky-600 to-purple-600 hover:from-sky-500 hover:to-purple-500 text-white'
                  }`}
                >
                  {isRegistered ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Registered
                    </>
                  ) : (
                    'Register Now'
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
