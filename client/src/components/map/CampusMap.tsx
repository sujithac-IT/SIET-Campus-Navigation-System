'use client';

import React, { useState, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Building, Room } from '@/types';
import { FootprintLayer } from './FootprintLayer';
import { LiveUserMarker } from './LiveUserMarker';
import { NavigationRoute } from './NavigationRoute';
import { FloorSelector } from './FloorSelector';
import { QRScannerModal } from './QRScannerModal';
import { useCampusStore } from '@/lib/store/useCampusStore';
import { useSearchParams } from 'next/navigation';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Navigation,
  Compass,
  Building2,
  DoorOpen,
  Moon,
  Sun,
  ShieldCheck,
  CheckCircle2,
  X,
  Info,
  QrCode,
  Accessibility,
  Layers,
  Globe2
} from 'lucide-react';

// Dynamically import the real Leaflet Geospatial Map with SSR disabled
const GeospatialCampusMap = dynamic(
  () => import('./GeospatialCampusMap').then((m) => m.GeospatialCampusMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 text-cyan-400 gap-3">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-bold text-slate-300">Loading SIET Satellite & Geospatial Map...</p>
        <p className="text-xs text-slate-500">Retrieving OpenStreetMap & Esri imagery for Coimbatore campus</p>
      </div>
    )
  }
);

function MapNavParamListener() {
  const store = useCampusStore();
  const searchParams = useSearchParams();

  useEffect(() => {
    const navTarget = searchParams?.get('navigate');
    if (navTarget) {
      store.startNavigationToRoom(navTarget);
    }
  }, [searchParams]);

  return null;
}

interface CampusMapProps {
  onSelectRoomForNavigation?: (roomCode: string) => void;
}

export const CampusMap: React.FC<CampusMapProps> = ({ onSelectRoomForNavigation }) => {
  const store = useCampusStore();
  const [mapMode, setMapMode] = useState<'geographic' | 'schematic'>('geographic');
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDarkMap, setIsDarkMap] = useState(true);
  const [activeBuildingModal, setActiveBuildingModal] = useState<Building | null>(null);
  const [activeRoomModal, setActiveRoomModal] = useState<Room | null>(null);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);

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
    <div className="relative w-full space-y-2">
      {/* Top Map Engine Mode Selector */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl">
          <button
            onClick={() => setMapMode('geographic')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              mapMode === 'geographic'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe2 className="w-3.5 h-3.5" />
            <span>Real Geographic Map (Satellite & OSM)</span>
          </button>
          <button
            onClick={() => setMapMode('schematic')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              mapMode === 'schematic'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Schematic Blueprint Mode</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span>SIET Coimbatore: 11.0403° N, 77.0748° E</span>
        </div>
      </div>

      <div
        className={`relative w-full h-[650px] lg:h-[750px] rounded-3xl overflow-hidden shadow-2xl border transition-colors duration-500 select-none ${
          isDarkMap
            ? 'bg-slate-950 border-slate-800 text-slate-100'
            : 'bg-slate-100 border-slate-300 text-slate-900'
        }`}
      >
        <Suspense fallback={null}>
          <MapNavParamListener />
        </Suspense>
        <QRScannerModal isOpen={isQRScannerOpen} onClose={() => setIsQRScannerOpen(false)} />

        {/* Real Geographic Map Mode */}
        {mapMode === 'geographic' ? (
          <GeospatialCampusMap
            onSelectBuilding={(bld) => {
              setActiveBuildingModal(bld);
              setActiveRoomModal(null);
            }}
            onSelectRoomForNavigation={onSelectRoomForNavigation}
          />
        ) : (
          /* Schematic Blueprint Canvas Mode */
          <div className="w-full h-full relative">
            {/* Map Control Toolbar */}
            <div className="absolute top-4 right-4 flex flex-col gap-2 z-30">
              <button
                onClick={() => setIsQRScannerOpen(true)}
                className="p-2.5 rounded-xl bg-sky-600 backdrop-blur-md border border-sky-400 text-white hover:bg-sky-500 transition shadow-xl animate-pulse"
                title="Scan Indoor QR Location Code"
              >
                <QrCode className="w-4 h-4" />
              </button>
              <button
                onClick={() => store.toggleAccessibilityMode()}
                className={`p-2.5 rounded-xl backdrop-blur-md border transition shadow-lg ${
                  store.isAccessibilityMode
                    ? 'bg-emerald-600 text-white border-emerald-400'
                    : 'bg-slate-900/80 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                }`}
                title="Accessibility Mode"
              >
                <Accessibility className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsDarkMap(!isDarkMap)}
                className="p-2.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700/60 text-slate-200 hover:text-white hover:bg-slate-800 transition shadow-lg"
              >
                {isDarkMap ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-sky-400" />}
              </button>
              <button
                onClick={handleZoomIn}
                className="p-2.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700/60 text-slate-200 hover:text-white hover:bg-slate-800 transition shadow-lg"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={handleZoomOut}
                className="p-2.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700/60 text-slate-200 hover:text-white hover:bg-slate-800 transition shadow-lg"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={handleResetView}
                className="p-2.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700/60 text-slate-200 hover:text-white hover:bg-slate-800 transition shadow-lg"
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

            {/* Schematic SVG Viewport */}
            <div
              className="w-full h-full relative transition-transform duration-300 ease-out"
              style={{
                transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
                transformOrigin: 'center center'
              }}
            >
              <svg className="absolute inset-0 w-full h-full">
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
                <rect x="70%" y="70%" width="22%" height="18%" rx="16" fill={isDarkMap ? '#064e3b' : '#dcfce7'} opacity="0.6" />
                <text x="81%" y="80%" fill={isDarkMap ? '#34d399' : '#166534'} fontSize="12" fontWeight="bold" textAnchor="middle">
                  🏀 SIET Sports Arena
                </text>
                <line x1="15%" y1="88%" x2="25%" y2="70%" stroke={isDarkMap ? '#334155' : '#94a3b8'} strokeWidth="8" strokeDasharray="4,4" />
                <line x1="25%" y1="70%" x2="25%" y2="65%" stroke={isDarkMap ? '#334155' : '#94a3b8'} strokeWidth="8" strokeDasharray="4,4" />
                <line x1="25%" y1="70%" x2="45%" y2="40%" stroke={isDarkMap ? '#334155' : '#94a3b8'} strokeWidth="8" strokeDasharray="4,4" />
                <line x1="45%" y1="40%" x2="50%" y2="55%" stroke={isDarkMap ? '#334155' : '#94a3b8'} strokeWidth="8" strokeDasharray="4,4" />
                <line x1="45%" y1="40%" x2="72%" y2="72%" stroke={isDarkMap ? '#334155' : '#94a3b8'} strokeWidth="8" strokeDasharray="4,4" />
              </svg>

              <FootprintLayer users={store.users} currentUserId={store.currentUser?.id} />

              {/* Schematic Building Pills */}
              {store.buildings.map((building) => {
                const isSelected = store.selectedBuildingId === building.id;
                return (
                  <div
                    key={building.id}
                    style={{ left: `${building.coordinates.x}%`, top: `${building.coordinates.y}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group"
                    onClick={() => handleBuildingClick(building)}
                  >
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

              {store.activeRoute && (
                <NavigationRoute
                  route={store.activeRoute}
                  onClear={store.clearActiveRoute}
                  isAccessibilityMode={store.isAccessibilityMode}
                />
              )}
            </div>
          </div>
        )}

        {/* Building & Room Explorer Modal */}
        {activeBuildingModal && (
          <div className="absolute inset-0 z-40 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
              <div className="p-5 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold text-sm shadow-md"
                    style={{ backgroundColor: activeBuildingModal.color }}
                  >
                    {activeBuildingModal.code}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-base leading-tight">
                      {activeBuildingModal.name}
                    </h3>
                    <p className="text-xs text-slate-400 capitalize">
                      {activeBuildingModal.category} • {activeBuildingModal.floors.length} Floors
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveBuildingModal(null)}
                  className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 overflow-y-auto space-y-4">
                <p className="text-xs text-slate-300 leading-relaxed">
                  {activeBuildingModal.description}
                </p>

                {/* Verification Source Box */}
                <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs space-y-1">
                  <div className="flex items-center gap-2 text-cyan-400 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Geographic Source & Verification</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    Source: {activeBuildingModal.sourceReference || 'OpenStreetMap Ground Survey'}
                  </p>
                  {activeBuildingModal.lat && activeBuildingModal.lng && (
                    <p className="text-slate-400 text-[11px] font-mono">
                      GPS Center: {activeBuildingModal.lat.toFixed(6)}, {activeBuildingModal.lng.toFixed(6)}
                    </p>
                  )}
                </div>

                {/* Floor Breakdown */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Floors & Room Directory
                  </h4>
                  {activeBuildingModal.floors.map((floor) => (
                    <div key={floor.level} className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-cyan-400">
                          {floor.name} (Level {floor.level})
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {floor.rooms.length} Rooms
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {floor.rooms.map((room) => (
                          <button
                            key={room.id}
                            onClick={() => handleNavigateToRoom(room.code)}
                            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 text-left transition flex flex-col justify-between"
                          >
                            <span className="text-xs font-bold text-white truncate">{room.name}</span>
                            <span className="text-[10px] text-cyan-400 font-mono mt-1">{room.code}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
