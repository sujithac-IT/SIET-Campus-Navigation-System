'use client';

import React, { useState } from 'react';
import { useCampusStore } from '@/lib/store/useCampusStore';
import { Search, MapPin, Navigation, Clock, Building2, UserCheck, X, ChevronRight } from 'lucide-react';

export const GlobalSearch: React.FC = () => {
  const store = useCampusStore();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // Search filter across classrooms, buildings, faculty, and facilities
  const getSearchResults = () => {
    if (!query.trim()) return [];

    const q = query.toLowerCase().trim();
    const results: {
      id: string;
      title: string;
      subtitle: string;
      type: 'room' | 'faculty' | 'building' | 'event';
      buildingName: string;
      roomCode?: string;
      coordinates: { x: number; y: number };
      distanceMeters: number;
      timeMinutes: number;
    }[] = [];

    // Search Rooms (e.g. LH25, LH26, Labs, Offices)
    store.buildings.forEach((b) => {
      b.floors.forEach((f) => {
        f.rooms.forEach((r) => {
          if (
            r.code.toLowerCase().includes(q) ||
            r.name.toLowerCase().includes(q) ||
            (r.occupant && r.occupant.toLowerCase().includes(q))
          ) {
            const dist = Math.round(
              Math.sqrt(
                Math.pow(r.coordinates.x - store.userLocation.x, 2) +
                  Math.pow(r.coordinates.y - store.userLocation.y, 2)
              ) * 8
            );
            results.push({
              id: `r-${r.id}`,
              title: `${r.name} (${r.code})`,
              subtitle: `${b.name} • Floor ${r.floor} ${r.occupant ? `• ${r.occupant}` : ''}`,
              type: 'room',
              buildingName: b.name,
              roomCode: r.code,
              coordinates: r.coordinates,
              distanceMeters: dist,
              timeMinutes: Math.ceil(dist / 75)
            });
          }
        });
      });

      // Search Buildings directly
      if (b.name.toLowerCase().includes(q) || b.code.toLowerCase().includes(q)) {
        const dist = Math.round(
          Math.sqrt(
            Math.pow(b.coordinates.x - store.userLocation.x, 2) +
              Math.pow(b.coordinates.y - store.userLocation.y, 2)
          ) * 8
        );
        results.push({
          id: `b-${b.id}`,
          title: b.name,
          subtitle: `${b.category.toUpperCase()} • ${b.floors.length} Floors`,
          type: 'building',
          buildingName: b.name,
          coordinates: b.coordinates,
          distanceMeters: dist,
          timeMinutes: Math.ceil(dist / 75)
        });
      }
    });

    // Search Faculty
    store.users
      .filter((u) => u.role === 'faculty')
      .forEach((fac: any) => {
        if (
          fac.name.toLowerCase().includes(q) ||
          fac.department.toLowerCase().includes(q) ||
          fac.subjects?.some((s: string) => s.toLowerCase().includes(q))
        ) {
          const coords = fac.currentCoordinates || { x: 45, y: 40 };
          const dist = Math.round(
            Math.sqrt(
              Math.pow(coords.x - store.userLocation.x, 2) +
                Math.pow(coords.y - store.userLocation.y, 2)
            ) * 8
          );
          results.push({
            id: `f-${fac.id}`,
            title: fac.name,
            subtitle: `${fac.department} • Room ${fac.roomNumber} (${fac.status})`,
            type: 'faculty',
            buildingName: fac.department,
            coordinates: coords,
            distanceMeters: dist,
            timeMinutes: Math.ceil(dist / 75)
          });
        }
      });

    return results.slice(0, 6);
  };

  const results = getSearchResults();

  const handleSelectResult = (res: any) => {
    if (res.roomCode) {
      store.startNavigationToRoom(res.roomCode);
    } else {
      store.startNavigationToCoords(res.coordinates, res.title);
    }
    setIsOpen(false);
    setQuery('');
  };

  return (
    <div className="relative w-full max-w-xl mx-auto z-40">
      {/* Search Input Bar */}
      <div className="relative flex items-center">
        <Search className="absolute left-4 w-5 h-5 text-sky-400 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder='Where do you want to go? (Try "LH25", "Dr. Prakash", "Canteen")'
          className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-xl transition-all text-sm font-medium"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
            className="absolute right-3.5 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Auto-suggest Search Results Dropdown */}
      {isOpen && query.trim() && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900/95 backdrop-blur-2xl border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden z-50 divide-y divide-slate-800 animate-in fade-in slide-in-from-top-2 duration-200">
          {results.length > 0 ? (
            results.map((res) => (
              <div
                key={res.id}
                onClick={() => handleSelectResult(res)}
                className="p-3.5 hover:bg-slate-800/80 cursor-pointer transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 group-hover:bg-sky-500 group-hover:text-white transition">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-slate-100 group-hover:text-sky-300 transition">
                      {res.title}
                    </h5>
                    <p className="text-xs text-slate-400">{res.subtitle}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs font-semibold text-sky-400">{res.distanceMeters}m</p>
                    <p className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5 inline" /> {res.timeMinutes} min
                    </p>
                  </div>

                  <span className="p-2 rounded-lg bg-sky-600/20 text-sky-300 group-hover:bg-sky-600 group-hover:text-white transition">
                    <Navigation className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-xs text-slate-400">
              No campus location or faculty found matching "{query}".
            </div>
          )}
        </div>
      )}
    </div>
  );
};
