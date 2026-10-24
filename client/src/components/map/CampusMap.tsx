'use client';

import React, { useState, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Building, Room } from '@/types';
import { QRScannerModal } from './QRScannerModal';
import { useCampusStore } from '@/lib/store/useCampusStore';
import { useSearchParams } from 'next/navigation';
import {
  Navigation,
  Compass,
  Building2,
  DoorOpen,
  ShieldCheck,
  CheckCircle2,
  X,
  Info,
  QrCode,
  Accessibility,
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
  const [activeBuildingModal, setActiveBuildingModal] = useState<Building | null>(null);
  const [activeRoomModal, setActiveRoomModal] = useState<Room | null>(null);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);

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
      {/* Top Map Status Banner */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2 p-1.5 px-3 rounded-2xl bg-slate-900/90 border border-cyan-500/30 backdrop-blur-xl shadow-lg">
          <Globe2 className="w-4 h-4 text-cyan-400 animate-spin-slow" />
          <span className="text-xs font-black bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
            Real Satellite Imagery & Turn-by-Turn GPS
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
            LIVE SATELLITE
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-300 bg-slate-900/80 px-3 py-1.5 rounded-2xl border border-slate-800">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span>SIET Coimbatore: 11.0403° N, 77.0748° E</span>
        </div>
      </div>

      <div
        className="relative w-full h-[650px] lg:h-[750px] rounded-3xl overflow-hidden shadow-2xl border border-slate-800 bg-slate-950 text-slate-100 select-none"
      >
        <Suspense fallback={null}>
          <MapNavParamListener />
        </Suspense>
        <QRScannerModal isOpen={isQRScannerOpen} onClose={() => setIsQRScannerOpen(false)} />

        {/* Real Geographic Satellite Map */}
        <GeospatialCampusMap
          onSelectBuilding={(bld) => {
            setActiveBuildingModal(bld);
            setActiveRoomModal(null);
          }}
          onSelectRoomForNavigation={onSelectRoomForNavigation}
        />

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
