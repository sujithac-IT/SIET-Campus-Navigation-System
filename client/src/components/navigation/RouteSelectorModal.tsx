'use client';

import React, { useState, useMemo } from 'react';
import {
  MapPin,
  Navigation,
  Compass,
  QrCode,
  Accessibility,
  Search,
  Building2,
  X,
  Sparkles,
  ArrowRight,
  Clock,
  Layers,
} from 'lucide-react';
import { Building, Room } from '@/types';

export interface RouteSelectionPayload {
  startType: 'current' | 'qr' | 'manual';
  startCoords: { x: number; y: number };
  startName: string;
  destinationCoords: { x: number; y: number };
  destinationName: string;
  destinationRoomCode?: string;
  isAccessible: boolean;
}

interface RouteSelectorModalProps {
  isOpen: boolean;
  buildings: Building[];
  currentLocationCoords: { x: number; y: number };
  onClose: () => void;
  onSelectRoute: (payload: RouteSelectionPayload) => void;
  onOpenQRScanner: () => void;
}

const PRESET_DESTINATIONS = [
  { name: 'Tech Park Lab 3', code: 'TECH-101', bldg: 'Tech Park Block', coords: { x: 75, y: 25 }, floor: 1, type: 'lab' },
  { name: 'Exam Hall LH 01', code: 'LH01', bldg: 'Main Academic Block', coords: { x: 29, y: 46 }, floor: 0, type: 'exam' },
  { name: 'Exam Hall LH 25', code: 'LH25', bldg: 'Central Library Block', coords: { x: 35, y: 55 }, floor: 2, type: 'exam' },
  { name: 'Central Food Court & Canteen', code: 'CANTEEN', bldg: 'Canteen Complex', coords: { x: 45, y: 75 }, floor: 0, type: 'canteen' },
  { name: 'Central Library Reading Hall', code: 'LIB-HALL', bldg: 'Central Library', coords: { x: 71, y: 36 }, floor: 1, type: 'library' },
  { name: 'Boys Hostel Block A', code: 'BH-01', bldg: 'Boys Hostel', coords: { x: 80, y: 85 }, floor: 0, type: 'hostel' },
  { name: 'Girls Hostel Block B', code: 'GH-01', bldg: 'Girls Hostel', coords: { x: 20, y: 20 }, floor: 0, type: 'hostel' },
  { name: 'Campus Health Centre', code: 'MED-01', bldg: 'Medical Ward', coords: { x: 85, y: 40 }, floor: 0, type: 'medical' },
];

export const RouteSelectorModal: React.FC<RouteSelectorModalProps> = ({
  isOpen,
  buildings,
  currentLocationCoords,
  onClose,
  onSelectRoute,
  onOpenQRScanner,
}) => {
  const [startMode, setStartMode] = useState<'current' | 'qr' | 'manual'>('current');
  const [manualStartCoords, setManualStartCoords] = useState<{ x: number; y: number }>({ x: 15, y: 88 });
  const [manualStartName, setManualStartName] = useState('Main Gate Entrance');
  const [destSearchQuery, setDestSearchQuery] = useState('');
  const [selectedDest, setSelectedDest] = useState(PRESET_DESTINATIONS[0]);
  const [isAccessible, setIsAccessible] = useState(false);

  // Collect all searchable rooms from buildings
  const allRooms = useMemo(() => {
    const list: { room: Room; buildingName: string }[] = [];
    buildings.forEach((b) => {
      b.floors.forEach((f) => {
        f.rooms.forEach((r) => {
          list.push({ room: r, buildingName: b.name });
        });
      });
    });
    return list;
  }, [buildings]);

  // Filtered rooms based on search query
  const filteredRooms = useMemo(() => {
    const q = destSearchQuery.trim().toLowerCase();
    if (!q) return [];
    return allRooms
      .filter(
        ({ room, buildingName }) =>
          room.name.toLowerCase().includes(q) ||
          room.code.toLowerCase().includes(q) ||
          buildingName.toLowerCase().includes(q) ||
          room.type.toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [allRooms, destSearchQuery]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const startCoords =
      startMode === 'current'
        ? currentLocationCoords
        : manualStartCoords;

    const startName =
      startMode === 'current'
        ? 'Current Position'
        : manualStartName;

    onSelectRoute({
      startType: startMode,
      startCoords,
      startName,
      destinationCoords: selectedDest.coords,
      destinationName: `${selectedDest.name} (${selectedDest.bldg})`,
      destinationRoomCode: selectedDest.code,
      isAccessible,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-950 border border-cyan-500/40 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden text-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Navigation className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">Plan Campus Route</h2>
              <p className="text-xs text-slate-400">Select starting point, destination & transit preferences</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5 overflow-y-auto custom-scrollbar flex-1">
          {/* 1. Start Location Mode Picker */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
              1. Choose Starting Point
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setStartMode('current')}
                className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                  startMode === 'current'
                    ? 'bg-cyan-500/20 border-cyan-500/60 text-cyan-300 shadow-md'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Compass className="w-4 h-4 text-cyan-400" />
                  {startMode === 'current' && <span className="w-2 h-2 rounded-full bg-cyan-400"></span>}
                </div>
                <div className="mt-2">
                  <p className="text-xs font-bold text-white">Current GPS</p>
                  <p className="text-[10px] text-slate-400">Auto-detected</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setStartMode('qr');
                  onOpenQRScanner();
                }}
                className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                  startMode === 'qr'
                    ? 'bg-cyan-500/20 border-cyan-500/60 text-cyan-300 shadow-md'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <QrCode className="w-4 h-4 text-sky-400" />
                  {startMode === 'qr' && <span className="w-2 h-2 rounded-full bg-cyan-400"></span>}
                </div>
                <div className="mt-2">
                  <p className="text-xs font-bold text-white">Scan QR Code</p>
                  <p className="text-[10px] text-slate-400">Indoor pinpoint</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setStartMode('manual')}
                className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                  startMode === 'manual'
                    ? 'bg-cyan-500/20 border-cyan-500/60 text-cyan-300 shadow-md'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <MapPin className="w-4 h-4 text-purple-400" />
                  {startMode === 'manual' && <span className="w-2 h-2 rounded-full bg-purple-400"></span>}
                </div>
                <div className="mt-2">
                  <p className="text-xs font-bold text-white">Pick Manually</p>
                  <p className="text-[10px] text-slate-400">Gate / Hall / Lab</p>
                </div>
              </button>
            </div>

            {/* Manual Start Dropdown (if manual mode selected) */}
            {startMode === 'manual' && (
              <div className="mt-3 p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-[11px] text-slate-400 font-semibold">Select Start Landmark:</span>
                <select
                  value={manualStartName}
                  onChange={(e) => {
                    const sel = PRESET_DESTINATIONS.find((p) => p.name === e.target.value) || {
                      name: 'Main Gate Entrance',
                      coords: { x: 15, y: 88 },
                    };
                    setManualStartName(sel.name);
                    setManualStartCoords(sel.coords);
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="Main Gate Entrance">Main Gate Entrance (Ground)</option>
                  {PRESET_DESTINATIONS.map((p, idx) => (
                    <option key={idx} value={p.name}>
                      {p.name} ({p.bldg})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* 2. Destination Search & Selection */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
              2. Destination Room or Building
            </label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search room (e.g. TECH-101, LH 01, Canteen, Library)..."
                value={destSearchQuery}
                onChange={(e) => setDestSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/80 transition"
              />
            </div>

            {/* Live Search Autocomplete Results */}
            {filteredRooms.length > 0 && (
              <div className="mt-2 bg-slate-900 border border-cyan-500/30 rounded-2xl p-2 space-y-1 max-h-44 overflow-y-auto shadow-xl">
                {filteredRooms.map(({ room, buildingName }) => (
                  <button
                    key={room.id}
                    type="button"
                    onClick={() => {
                      setSelectedDest({
                        name: room.name,
                        code: room.code,
                        bldg: buildingName,
                        coords: room.coordinates,
                        floor: room.floor,
                        type: room.type,
                      });
                      setDestSearchQuery('');
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-800 text-left transition"
                  >
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span className="font-mono text-cyan-400">{room.code}</span>
                        <span>•</span>
                        <span>{room.name}</span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {buildingName} • Floor {room.floor}
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      Select
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Popular Shortcut Chips */}
            <div className="mt-3">
              <span className="text-[11px] font-semibold text-slate-400 block mb-2">
                Popular Campus Hotspots:
              </span>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                {PRESET_DESTINATIONS.map((preset, idx) => {
                  const isSelected = selectedDest.code === preset.code;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedDest(preset)}
                      className={`p-2.5 rounded-2xl border text-left transition flex items-center justify-between ${
                        isSelected
                          ? 'bg-cyan-500/20 border-cyan-500/60 text-cyan-300 shadow-sm'
                          : 'bg-slate-900/70 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                      }`}
                    >
                      <div className="truncate mr-2">
                        <p className="text-xs font-bold truncate text-white">{preset.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{preset.bldg}</p>
                      </div>
                      {isSelected ? (
                        <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 3. Accessibility Preference Toggle */}
          <div className="pt-2 border-t border-slate-800/80">
            <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 cursor-pointer hover:border-purple-500/40 transition">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
                  <Accessibility className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Wheelchair & Accessible Route</p>
                  <p className="text-[11px] text-slate-400">
                    Bypass all stairs, utilize elevators and wheelchair ramps
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isAccessible}
                onChange={(e) => setIsAccessible(e.target.checked)}
                className="w-5 h-5 accent-purple-500 rounded cursor-pointer"
              />
            </label>
          </div>

          {/* Selected Route Summary Banner */}
          <div className="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
              <div className="text-xs">
                <span className="text-slate-400">Navigating to:</span>{' '}
                <span className="font-bold text-white">{selectedDest.name}</span>
                <div className="text-[10px] text-cyan-300">
                  Floor {selectedDest.floor} • {selectedDest.bldg}
                </div>
              </div>
            </div>
            <span className="text-[11px] font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded-lg border border-cyan-500/20">
              {isAccessible ? 'Accessible' : 'Standard'}
            </span>
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm shadow-[0_8px_30px_rgba(6,182,212,0.4)] transition flex items-center justify-center gap-2"
          >
            <span>Launch Live HUD Navigation</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
