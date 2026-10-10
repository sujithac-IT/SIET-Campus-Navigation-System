'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCampusStore } from '@/lib/store/useCampusStore';
import { CampusEvent, Building } from '@/types';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Sparkles, 
  Navigation,
  CheckCircle2,
  CalendarDays,
  Clock,
  UserCheck
} from 'lucide-react';

const CATEGORIES = [
  { id: 'all', label: 'All Events', color: 'bg-slate-900 border-slate-800' },
  { id: 'academic', label: 'Academic', color: 'bg-sky-500/10 border-sky-500/20 text-sky-400' },
  { id: 'tech', label: 'Tech & Hackathons', color: 'bg-purple-500/10 border-purple-500/20 text-purple-400' },
  { id: 'sports', label: 'Sports', color: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' },
  { id: 'cultural', label: 'Cultural', color: 'bg-pink-500/10 border-pink-500/20 text-pink-400' },
  { id: 'workshop', label: 'Workshops & Talks', color: 'bg-amber-500/10 border-amber-500/20 text-amber-400' }
];

export default function EventsPage() {
  const store = useCampusStore();
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [registeredEvents, setRegisteredEvents] = useState<string[]>([]);

  const eventsList = store.events.filter(
    (ev) => activeCategory === 'all' || ev.category === activeCategory
  );

  const handleRegister = (eventId: string) => {
    if (registeredEvents.includes(eventId)) return;
    store.registerForEvent(eventId);
    setRegisteredEvents((prev) => [...prev, eventId]);
    
    // Add success notification
    store.addNotification({
      roleTarget: 'all',
      title: 'Registered successfully!',
      message: `You registered for "${store.events.find((e) => e.id === eventId)?.title}"`,
      type: 'info'
    });
  };

  const handleNavigate = (event: CampusEvent) => {
    // If the room code is available, navigate to the room. Otherwise, coordinates.
    if (event.venueRoomCode) {
      store.startNavigationToRoom(event.venueRoomCode);
    } else {
      store.startNavigationToCoords(event.coordinates, event.title);
    }
    router.push('/map');
  };

  const getBuildingName = (buildingId: string) => {
    return store.buildings.find((b) => b.id === buildingId)?.name || 'Campus grounds';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div className="text-left space-y-1">
        <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
          <Calendar className="w-6 h-6 text-sky-400" />
          Campus Events Calendar
        </h2>
        <p className="text-xs text-slate-400">
          Explore hackathons, workshops, placement drives, sports selections, and cultural programs. Register and navigate.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex overflow-x-auto gap-2 pb-2 custom-scrollbar text-xs font-bold">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex-shrink-0 px-4 py-2.5 rounded-xl border transition-all ${
                isActive
                  ? 'bg-sky-600 text-white border-sky-500 shadow-lg'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {eventsList.length > 0 ? (
          eventsList.map((event) => {
            const isRegistered = registeredEvents.includes(event.id);
            const matchedCategory = CATEGORIES.find((c) => c.id === event.category) || CATEGORIES[0];
            
            return (
              <div
                key={event.id}
                className="bg-slate-900/40 border border-slate-800 hover:border-slate-700/80 rounded-3xl p-6 shadow-xl transition-all duration-300 flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  {/* Category & Badge */}
                  <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-0.5 rounded-lg border text-[10px] font-extrabold tracking-wider uppercase ${matchedCategory.color}`}>
                      {event.category}
                    </span>
                    <span className="text-[10px] text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded-md font-extrabold flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {event.registeredCount} Registered
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-2">
                    <h3 className="text-base font-extrabold text-slate-100 group-hover:text-sky-400 transition-colors">
                      {event.title}
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {event.description}
                    </p>
                  </div>

                  {/* Meta details */}
                  <div className="grid grid-cols-2 gap-3 text-xs text-slate-400 font-semibold border-t border-slate-800/60 pt-3">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="w-4 h-4 text-sky-400" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-sky-400" />
                      <span>{event.time}</span>
                    </div>
                    <div className="col-span-2 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-sky-400" />
                      <span className="truncate">
                        {event.venueRoomCode} • {getBuildingName(event.venueBuildingId)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-5 mt-5 border-t border-slate-800/60 flex items-center gap-3">
                  <button
                    onClick={() => handleRegister(event.id)}
                    disabled={isRegistered}
                    className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 ${
                      isRegistered
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-default'
                        : 'bg-slate-800 hover:bg-slate-700/80 border border-slate-700/80 text-slate-300 hover:text-white'
                    }`}
                  >
                    {isRegistered ? (
                      <>
                        <UserCheck className="w-4 h-4" />
                        <span>Registered</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <span>Register Now</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleNavigate(event)}
                    className="flex-1 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition shadow-md flex items-center justify-center gap-1.5"
                  >
                    <Navigation className="w-4 h-4 animate-pulse" />
                    <span>Navigate</span>
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-16 text-center bg-slate-900/10 border border-slate-800 border-dashed rounded-3xl">
            <CalendarDays className="w-12 h-12 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-400">No scheduled events in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}
