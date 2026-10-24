'use client';

import React, { useState } from 'react';
import { useCampusStore } from '@/lib/store/useCampusStore';
import { Search, MapPin, Navigation, Clock, Building2, BookOpen, Layers, CheckCircle2 } from 'lucide-react';

export const ExamHallLookup: React.FC = () => {
  const store = useCampusStore();
  const [query, setQuery] = useState('');

  // Extract all exam halls from all buildings
  const getAllExamHalls = () => {
    const halls: {
      code: string;
      name: string;
      buildingName: string;
      floorName: string;
      floorLevel: number;
      description: string;
      coordinates: { x: number; y: number };
    }[] = [];

    const seen = new Set<string>();
    store.buildings.forEach((b) => {
      b.floors.forEach((f) => {
        f.rooms.forEach((r) => {
          const isExamOrLab =
            r.code.startsWith('LH') ||
            r.code.startsWith('MELH') ||
            r.code.startsWith('Lab') ||
            r.code.startsWith('SEM') ||
            ['1A', '1B', '1C', '1D', '2A', '2B', '2C', '2D'].includes(r.code) ||
            r.type === 'classroom' ||
            r.type === 'lab' ||
            r.type === 'seminar';

          const key = `${r.code}-${b.id}-${f.level}`;
          if (isExamOrLab && !seen.has(key)) {
            seen.add(key);
            halls.push({
              code: r.code,
              name: r.name,
              buildingName: b.name,
              floorName: f.name,
              floorLevel: r.floor,
              description: r.description || `${b.name} - Floor ${r.floor}`,
              coordinates: r.coordinates
            });
          }
        });
      });
    });

    return halls;
  };

  const allHalls = getAllExamHalls();

  const filteredHalls = query.trim()
    ? allHalls.filter(
        (h) =>
          h.code.toLowerCase().replace(/\s+/g, '').includes(query.toLowerCase().replace(/\s+/g, '')) ||
          h.name.toLowerCase().includes(query.toLowerCase()) ||
          h.buildingName.toLowerCase().includes(query.toLowerCase()) ||
          h.description.toLowerCase().includes(query.toLowerCase())
      )
    : allHalls.slice(0, 8);

  const handleNavigate = (hall: (typeof allHalls)[0]) => {
    store.startNavigationToRoom(hall.code);
  };

  return (
    <div className="bg-slate-900/90 backdrop-blur-2xl border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-400" />
              SIET Controller of Examinations - Hall & Lab Locator
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
              Official Schedule
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Search any exam hall (e.g. "LH 01", "LH 26", "LH 36", "LH 54", "1A", "Lab 01", "Seminar Hall-II")
          </p>
        </div>

        {/* Quick Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1 text-xs">
          {['LH 01', 'LH 24', 'LH 36', 'LH 54', '1A', 'Lab 01', 'Seminar Hall-II'].map((code) => (
            <button
              key={code}
              onClick={() => setQuery(code)}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sky-300 hover:text-white transition font-mono text-[11px]"
            >
              {code}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='Type exam hall or lab (e.g. "LH 01", "LH 26", "LH 36", "1A", "Lab 06", "Tech Park")...'
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
        />
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
        {filteredHalls.map((hall, idx) => {
          const dist = Math.round(
            Math.sqrt(
              Math.pow(hall.coordinates.x - store.userLocation.x, 2) +
                Math.pow(hall.coordinates.y - store.userLocation.y, 2)
            ) * 8
          );

          return (
            <div
              key={`${hall.code}-${hall.buildingName}-${hall.floorLevel}-${idx}`}
              className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 hover:border-amber-500/50 transition flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="font-black text-sm text-amber-300 font-mono group-hover:text-amber-200 transition">
                    {hall.code}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 text-[10px] font-semibold">
                    Floor {hall.floorLevel}
                  </span>
                </div>
                <h5 className="font-bold text-xs text-slate-100">{hall.name}</h5>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{hall.description}</p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-700/60 flex items-center justify-between">
                <span className="text-[10px] text-sky-400 font-semibold">
                  {dist}m • {Math.ceil(dist / 75)} min walk
                </span>
                <button
                  onClick={() => handleNavigate(hall)}
                  className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-[10px] font-bold transition flex items-center gap-1"
                >
                  <Navigation className="w-3 h-3" /> Navigate
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
