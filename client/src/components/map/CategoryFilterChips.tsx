'use client';

import React from 'react';
import {
  Compass,
  DoorOpen,
  Cpu,
  Coffee,
  BookOpen,
  Home,
  Bath,
  MapPin,
  Sparkles,
} from 'lucide-react';

export interface CategoryChip {
  id: string;
  label: string;
  icon: React.ReactNode;
  count?: number;
}

export const CATEGORY_CHIPS: CategoryChip[] = [
  { id: 'ALL', label: 'All Places', icon: <Compass className="w-3.5 h-3.5" /> },
  { id: 'CLASSROOM', label: 'Classrooms', icon: <DoorOpen className="w-3.5 h-3.5" />, count: 16 },
  { id: 'TECHPARK', label: 'Tech Park', icon: <Cpu className="w-3.5 h-3.5" />, count: 10 },
  { id: 'CANTEEN', label: 'Canteen & Food', icon: <Coffee className="w-3.5 h-3.5" />, count: 2 },
  { id: 'LIBRARY', label: 'Library', icon: <BookOpen className="w-3.5 h-3.5" />, count: 2 },
  { id: 'HOSTEL', label: 'Girls & Boys Hostels', icon: <Home className="w-3.5 h-3.5" />, count: 2 },
  { id: 'AMPHI', label: 'Amphitheatre & Plaza', icon: <Sparkles className="w-3.5 h-3.5" />, count: 1 },
  { id: 'WASHROOM', label: 'Washrooms', icon: <Bath className="w-3.5 h-3.5" />, count: 4 },
  { id: 'GATE', label: 'Gates & Parking', icon: <MapPin className="w-3.5 h-3.5" />, count: 2 },
];

interface Props {
  activeCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

export const CategoryFilterChips: React.FC<Props> = ({
  activeCategory,
  onSelectCategory,
}) => {
  return (
    <div className="w-full overflow-x-auto pb-1 custom-scrollbar">
      <div className="flex items-center gap-2 min-w-max px-1">
        {CATEGORY_CHIPS.map((chip) => {
          const isActive = activeCategory === chip.id;
          return (
            <button
              key={chip.id}
              onClick={() => onSelectCategory(chip.id)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 border backdrop-blur-md shadow-sm ${
                isActive
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold shadow-cyan-500/25 scale-105'
                  : 'bg-slate-900/80 text-slate-300 border-slate-700/80 hover:text-white hover:border-slate-500 hover:bg-slate-800'
              }`}
            >
              <span className={isActive ? 'text-slate-950' : 'text-cyan-400'}>{chip.icon}</span>
              <span>{chip.label}</span>
              {chip.count !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {chip.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
