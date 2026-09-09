'use client';

import React from 'react';
import { Layers } from 'lucide-react';

interface FloorSelectorProps {
  currentFloor: number;
  availableFloors?: number[];
  onSelectFloor: (floor: number) => void;
}

export const FloorSelector: React.FC<FloorSelectorProps> = ({
  currentFloor,
  availableFloors = [0, 1, 2, 3],
  onSelectFloor
}) => {
  return (
    <div className="flex flex-col bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl shadow-xl p-1.5 z-30">
      <div className="flex items-center gap-1 px-2 py-1 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800 mb-1">
        <Layers className="w-3 h-3 text-sky-400" />
        <span>Floors</span>
      </div>
      <div className="flex flex-col gap-1">
        {availableFloors.map((floor) => {
          const isSelected = currentFloor === floor;
          return (
            <button
              key={floor}
              onClick={() => onSelectFloor(floor)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-between ${
                isSelected
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span>{floor === 0 ? 'Ground' : `${floor}${floor === 1 ? 'st' : floor === 2 ? 'nd' : 'rd'} Floor`}</span>
              {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};
