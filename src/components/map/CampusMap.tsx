'use client';

import React, { useState } from 'react';
import { Building, Room, User } from '@/types';
import { FootprintLayer } from './FootprintLayer';
import { LiveUserMarker } from './LiveUserMarker';
import { NavigationRoute } from './NavigationRoute';
import { FloorSelector } from './FloorSelector';
import { useCampusStore } from '@/lib/store/useCampusStore';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Navigation,
  Compass,
  Building2,
  DoorOpen,
  UserCheck,
  Moon,
  Sun,
  ShieldCheck,
  CheckCircle2,
  X,
  Info
} from 'lucide-react';

interface CampusMapProps {
  onSelectRoomForNavigation?: (roomCode: string) => void;
}

export const CampusMap: React.FC<CampusMapProps> = ({ onSelectRoomForNavigation }) => {
  const store = useCampusStore();
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDarkMap, setIsDarkMap] = useState(true);
  const [activeBuildingModal, setActiveBuildingModal] = useState<Building | null>(null);
  const [activeRoomModal, setActiveRoomModal] = useState<Room | null>(null);

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.25, 2.5));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.75));
  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleBuildingClick = (building: Building) => {
    store.selectBuilding(building.id);
    setActiveBuildingModal(building);
    setActiveRoomModal(null);
  };

  const handleNavigateToRoom = (roomCode: string) => {
    const success = store.startNavigationToRoom(roomCode);
    if (!success && onSelectRoomForNavigation) {
      onSelectRoomForNavigation(roomCode);
    }
    setActiveBuildingModal(null);
    setActiveRoomModal(null);
  };

  return (
    <div
      className={`relative w-full h-[650px] lg:h-[750px] rounded-3xl overflow-hidden shadow-2xl border transition-colors duration-500 select-none ${
        isDarkMap
          ? 'bg-slate-950 border-slate-800 text-slate-100'
          : 'bg-slate-100 border-slate-300 text-slate-900'
      }`}
    >
      {/* Map Control Toolbar */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-30">
        <button
          onClick={() => setIsDarkMap(!isDarkMap)}
          className="p-2.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700/60 text-slate-200 hover:text-white hover:bg-slate-800 transition shadow-lg"
          title="Toggle Dark/Light Map"
        >
          {isDarkMap ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-sky-400" />}
        </button>
        <button
          onClick={handleZoomIn}
          className="p-2.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700/60 text-slate-200 hover:text-white hover:bg-slate-800 transition shadow-lg"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700/60 text-slate-200 hover:text-white hover:bg-slate-800 transition shadow-lg"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleResetView}
          className="p-2.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700/60 text-slate-200 hover:text-white hover:bg-slate-800 transition shadow-lg"
          title="Reset Center"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Floor Selector Widget */}
      <div className="absolute bottom-4 left-4 z-30">
        <FloorSelector
          currentFloor={store.selectedFloor}
          onSelectFloor={(f) => store.setFloor(f)}
        />
      </div>

      {/* Main Map Container Canvas Viewport */}
      <div
        className="w-full h-full relative transition-transform duration-300 ease-out"
        style={{
          transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
          transformOrigin: 'center center'
        }}
      >
        {/* Background Grid & Greenery Styling */}
        <svg className="absolute inset-0 w-full h-full">
          {/* Subtle Grid Pattern */}
          <pattern id="campus-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke={isDarkMap ? '#1e293b' : '#cbd5e1'}
              strokeWidth="0.8"
              strokeOpacity="0.4"
            />
          </pattern>
          <rect width="100%" height="100%" fill="url(#campus-grid)" />

          {/* Campus Lawns & Sports Ground */}
          <rect x="35%" y="78%" width="25%" height="18%" rx="20" fill={isDarkMap ? '#064e3b' : '#dcfce7'} opacity="0.6" />
          <text x="47%" y="87%" fill={isDarkMap ? '#34d399' : '#166534'} fontSize="12" fontWeight="bold" textAnchor="middle">
            ⚽ SIET Sports Arena
          </text>

          {/* Main Walkway Arteries */}
          {/* Gate to Admin */}
          <line x1="15%" y1="88%" x2="25%" y2="65%" stroke={isDarkMap ? '#334155' : '#94a3b8'} strokeWidth="8" strokeDasharray="4,4" />
          {/* Admin to IT */}
          <line x1="25%" y1="65%" x2="45%" y2="40%" stroke={isDarkMap ? '#334155' : '#94a3b8'} strokeWidth="8" strokeDasharray="4,4" />
          {/* IT to CSE */}
          <line x1="45%" y1="40%" x2="60%" y2="35%" stroke={isDarkMap ? '#334155' : '#94a3b8'} strokeWidth="8" strokeDasharray="4,4" />
          {/* CSE to Tech Park */}
          <line x1="60%" y1="35%" x2="75%" y2="45%" stroke={isDarkMap ? '#334155' : '#94a3b8'} strokeWidth="8" strokeDasharray="4,4" />
          {/* Admin to Auditorium */}
          <line x1="25%" y1="65%" x2="50%" y2="65%" stroke={isDarkMap ? '#334155' : '#94a3b8'} strokeWidth="8" strokeDasharray="4,4" />
          {/* Auditorium to Canteen */}
          <line x1="50%" y1="65%" x2="65%" y2="70%" stroke={isDarkMap ? '#334155' : '#94a3b8'} strokeWidth="8" strokeDasharray="4,4" />
        </svg>

        {/* Footprint Live Trails Layer */}
        <FootprintLayer users={store.users} currentUserId={store.currentUser?.id} />

        {/* Buildings Blueprint Nodes Layer */}
        {store.buildings.map((building) => {
          const isSelected = store.selectedBuildingId === building.id;
          return (
            <div
              key={building.id}
              style={{ left: `${building.coordinates.x}%`, top: `${building.coordinates.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group"
              onClick={() => handleBuildingClick(building)}
            >
              {/* Building Marker Pill */}
              <div
                className={`relative flex items-center gap-2 px-3 py-2 rounded-2xl shadow-xl border backdrop-blur-md transition-all duration-300 group-hover:scale-110 ${
                  isSelected
                    ? 'ring-4 ring-sky-400 bg-sky-950/90 text-white border-sky-400 scale-105'
                    : isDarkMap
                    ? 'bg-slate-900/90 text-slate-100 border-slate-700/80 hover:border-slate-500'
                    : 'bg-white/90 text-slate-800 border-slate-200 hover:border-slate-400'
                }`}
              >
                <div
                  className="w-7 h-7 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-md"
                  style={{ backgroundColor: building.color }}
                >
                  {building.code}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold truncate max-w-[120px]">{building.name}</span>
                  <span className="text-[10px] opacity-75 capitalize">
                    {building.floors.length} Floors • {building.category}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Live User Markers Layer */}
        {store.users.map((user) => (
          <LiveUserMarker
            key={user.id}
            user={user}
            isSelf={user.id === store.currentUser?.id}
            onSelectUser={(u) => {
              if (u.currentCoordinates) {
                store.startNavigationToCoords(u.currentCoordinates, `Target: ${u.name}`);
              }
            }}
          />
        ))}

        {/* Navigation Route Path & Card */}
        {store.activeRoute && (
          <NavigationRoute route={store.activeRoute} onClear={() => store.clearNavigation()} />
        )}
      </div>

      {/* Building Detail Modal Drawer */}
      {activeBuildingModal && (
        <div className="absolute inset-x-4 bottom-4 md:left-auto md:right-4 md:w-96 bg-slate-900/95 backdrop-blur-2xl border border-slate-700 text-white rounded-3xl p-5 shadow-2xl z-50 animate-in slide-in-from-bottom-5 duration-300">
          <div className="flex items-start justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold text-sm shadow-md"
                style={{ backgroundColor: activeBuildingModal.color }}
              >
                {activeBuildingModal.code}
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-100">{activeBuildingModal.name}</h3>
                <p className="text-xs text-slate-400 capitalize">{activeBuildingModal.category} Block</p>
              </div>
            </div>
            <button
              onClick={() => setActiveBuildingModal(null)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="mt-3 text-xs text-slate-300 leading-relaxed">{activeBuildingModal.description}</p>

          {/* Rooms on Selected Floor */}
          <div className="mt-4">
            <h4 className="text-xs font-semibold text-sky-400 uppercase tracking-wider mb-2">
              Rooms on Floor {store.selectedFloor}
            </h4>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
              {activeBuildingModal.floors
                .find((f) => f.level === store.selectedFloor)
                ?.rooms.map((room) => (
                  <div
                    key={room.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-100 flex items-center gap-1.5">
                        <DoorOpen className="w-3.5 h-3.5 text-sky-400" />
                        <span>{room.name}</span>
                        <span className="px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 text-[10px]">
                          {room.code}
                        </span>
                      </div>
                      {room.occupant && (
                        <p className="text-[10px] text-amber-300 mt-0.5">Occupant: {room.occupant}</p>
                      )}
                    </div>

                    <button
                      onClick={() => handleNavigateToRoom(room.code)}
                      className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-[11px] transition shadow-md flex items-center gap-1"
                    >
                      <Navigation className="w-3 h-3" /> Navigate
                    </button>
                  </div>
                ))}
              {(!activeBuildingModal.floors.find((f) => f.level === store.selectedFloor)?.rooms.length) && (
                <p className="text-xs text-slate-500 italic">No registered rooms listed on this floor level.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
