'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCampusStore } from '@/lib/store/useCampusStore';
import { Room, Building } from '@/types';
import { 
  Footprints, 
  Utensils, 
  DollarSign, 
  Droplet, 
  Car, 
  ArrowUpDown, 
  Shield, 
  Activity, 
  BookOpen, 
  Building2,
  Navigation,
  Map,
  CornerDownRight,
  ShieldCheck,
  DoorOpen,
  Briefcase
} from 'lucide-react';

const CATEGORIES = [
  { id: 'all', label: 'All Facilities', icon: Building2, color: 'text-sky-400 bg-sky-500/10 border-sky-500/20' },
  { id: 'restroom', label: '🚻 Restrooms', icon: Footprints, color: 'text-pink-400 bg-pink-500/10 border-pink-500/20' },
  { id: 'canteen', label: '🍴 Canteen', icon: Utensils, color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
  { id: 'atm', label: '🏧 ATMs', icon: DollarSign, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  { id: 'water', label: '💧 Drinking Water', icon: Droplet, color: 'text-sky-400 bg-sky-500/10 border-sky-500/20' },
  { id: 'parking', label: '🚗 Parking', icon: Car, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  { id: 'lift', label: '🛗 Lifts', icon: ArrowUpDown, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
  { id: 'security', label: '🛡️ Security', icon: Shield, color: 'text-teal-400 bg-teal-500/10 border-teal-500/20' },
  { id: 'medical', label: '🏥 Medical', icon: Activity, color: 'text-red-400 bg-red-500/10 border-red-500/20' },
  { id: 'library', label: '📚 Library', icon: BookOpen, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  { id: 'emergency_exit', label: '🚪 Emergency Exits', icon: ShieldAlertIcon, color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
  { id: 'staircase', label: '🪜 Staircases', icon: StaircaseIcon, color: 'text-slate-400 bg-slate-500/10 border-slate-500/20' }
];

function ShieldAlertIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function StaircaseIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 21h18" />
      <path d="M3 21v-4h4v-4h4v-4h4v-4h4v-4" />
    </svg>
  );
}

function FacilitiesContent() {
  const store = useCampusStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryCategory = searchParams.get('category') || 'all';

  const [activeCategory, setActiveCategory] = useState<string>(queryCategory);

  useEffect(() => {
    if (searchParams.get('category')) {
      setActiveCategory(searchParams.get('category') || 'all');
    }
  }, [searchParams]);

  // Extract all rooms of building matching category
  const getFacilities = () => {
    const list: { room: Room; building: Building }[] = [];
    store.buildings.forEach((b) => {
      b.floors.forEach((f) => {
        f.rooms.forEach((r) => {
          if (activeCategory === 'all') {
            // Include only facility type rooms
            const facilityTypes = ['restroom', 'canteen', 'atm', 'water', 'parking', 'lift', 'security', 'medical', 'library', 'emergency_exit', 'staircase'];
            if (facilityTypes.includes(r.type)) {
              list.push({ room: r, building: b });
            }
          } else if (r.type === activeCategory) {
            list.push({ room: r, building: b });
          }
        });
      });
    });
    return list;
  };

  const facilitiesList = getFacilities();

  const handleViewOnMap = (room: Room, building: Building) => {
    store.selectBuilding(building.id);
    store.setFloor(room.floor);
    store.selectedRoomCode = room.code;
    store.destination = null;
    store.activeRoute = null;
    router.push('/map');
  };

  const handleNavigate = (room: Room) => {
    store.startNavigationToRoom(room.code);
    router.push('/map');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div className="text-left space-y-1">
        <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
          <Briefcase className="w-6 h-6 text-sky-400" />
          Campus Facilities Locator
        </h2>
        <p className="text-xs text-slate-400">
          Find and navigate to restrooms, ATMs, lifts, RO water points, and other emergency amenities instantly. No login required.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex overflow-x-auto gap-2 pb-2 custom-scrollbar text-xs font-bold scroll-smooth">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id;
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id);
                router.replace(`/facilities?category=${cat.id}`);
              }}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-xl border transition-all ${
                isActive
                  ? 'bg-sky-600 text-white border-sky-500 shadow-lg shadow-sky-500/10'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {facilitiesList.length > 0 ? (
          facilitiesList.map(({ room, building }) => {
            const matchedCategory = CATEGORIES.find(c => c.id === room.type) || CATEGORIES[0];
            const Icon = matchedCategory.icon;
            
            return (
              <div
                key={room.id}
                className="bg-slate-900/40 border border-slate-800 hover:border-slate-700/80 rounded-2.5xl p-5 shadow-xl transition-all duration-300 flex flex-col justify-between hover:translate-y-[-2px] group"
              >
                <div className="space-y-3">
                  {/* Card Header Category badge */}
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[10px] font-extrabold tracking-wide uppercase ${matchedCategory.color}`}>
                      <Icon className="w-3.5 h-3.5" />
                      {room.type.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] text-slate-500 font-extrabold uppercase">
                      Code: {room.code}
                    </span>
                  </div>

                  {/* Title & Location details */}
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-sm text-slate-100 group-hover:text-sky-400 transition-colors">
                      {room.name}
                    </h4>
                    <p className="text-xs text-slate-400 flex items-center gap-1 font-semibold">
                      <Building2 className="w-3.5 h-3.5 text-slate-500" />
                      <span>{building.name} • Floor {room.floor}</span>
                    </p>
                    {room.description && (
                      <p className="text-[11px] text-slate-300 leading-relaxed pt-1 flex items-start gap-1">
                        <CornerDownRight className="w-3 h-3 text-sky-400 flex-shrink-0 mt-0.5" />
                        <span>{room.description}</span>
                      </p>
                    )}
                  </div>

                  {/* Amenities / Accessibility tags */}
                  {(room.accessibilityInfo || room.openingHours) && (
                    <div className="pt-2 flex flex-wrap gap-1.5 text-[9px] font-bold">
                      {room.accessibilityInfo && (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          ♿ {room.accessibilityInfo}
                        </span>
                      )}
                      {room.openingHours && (
                        <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          🕒 Open: {room.openingHours}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="pt-4 mt-4 border-t border-slate-800/60 flex items-center gap-2">
                  <button
                    onClick={() => handleViewOnMap(room, building)}
                    className="flex-1 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 text-slate-300 hover:text-white font-bold text-xs transition flex items-center justify-center gap-1"
                  >
                    <Map className="w-3.5 h-3.5 text-sky-400" />
                    <span>View Map</span>
                  </button>
                  <button
                    onClick={() => handleNavigate(room)}
                    className="flex-1 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition shadow-md flex items-center justify-center gap-1"
                  >
                    <Navigation className="w-3.5 h-3.5 animate-pulse" />
                    <span>Navigate</span>
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-12 text-center bg-slate-900/10 border border-slate-800 rounded-3xl border-dashed">
            <DoorOpen className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-400">No facility markers of this category registered.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function FacilitiesPage() {
  return (
    <Suspense fallback={<div className="text-white text-xs p-8">Loading Facilities locator...</div>}>
      <FacilitiesContent />
    </Suspense>
  );
}
