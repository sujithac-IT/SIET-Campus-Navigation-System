'use client';

import React from 'react';
import { RouteResult } from '@/types';
import { Navigation, Clock, Footprints, Compass, X } from 'lucide-react';

interface NavigationRouteProps {
  route: RouteResult;
  onClear: () => void;
}

export const NavigationRoute: React.FC<NavigationRouteProps> = ({ route, onClear }) => {
  if (!route || route.nodes.length < 2) return null;

  // Build SVG path data string
  const points = route.nodes.map((node) => `${node.coordinates.x},${node.coordinates.y}`).join(' L ');
  const pathD = `M ${points}`;

  return (
    <>
      {/* Route SVG Overlay */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-20 overflow-visible">
        {/* Glow halo */}
        <path
          d={pathD}
          fill="none"
          stroke="#0284c7"
          strokeWidth="6"
          strokeOpacity="0.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Animated Dashed Route */}
        <path
          d={pathD}
          fill="none"
          stroke="#38bdf8"
          strokeWidth="3.5"
          strokeDasharray="8,6"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="animate-[dash_1.5s_linear_infinite]"
        />

        {/* Node Waypoints */}
        {route.nodes.map((node, index) => (
          <g key={`route-waypoint-${index}`}>
            <circle
              cx={`${node.coordinates.x}%`}
              cy={`${node.coordinates.y}%`}
              r={index === 0 || index === route.nodes.length - 1 ? '6' : '3.5'}
              fill={index === 0 ? '#10b981' : index === route.nodes.length - 1 ? '#ef4444' : '#38bdf8'}
              stroke="#ffffff"
              strokeWidth="1.5"
            />
          </g>
        ))}
      </svg>

      {/* Navigation Floating Control Card */}
      <div className="absolute top-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-slate-900/95 backdrop-blur-xl border border-sky-500/40 text-white rounded-2xl shadow-2xl p-4 z-40 transition-all animate-in fade-in slide-in-from-top-4 duration-300">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400">
              <Navigation className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-100">Live Campus Navigation</h4>
              <p className="text-xs text-sky-400 font-medium flex items-center gap-2">
                <span>{route.totalDistanceMeters} meters</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 inline" /> {route.estimatedTimeMinutes} min walk
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={onClear}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step-by-Step Directions */}
        <div className="mt-3 max-h-48 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {route.instructions.map((inst) => (
            <div
              key={inst.step}
              className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-800/60 border border-slate-700/50 text-xs"
            >
              <div className="w-5 h-5 rounded-full bg-slate-700 text-sky-300 flex items-center justify-center font-bold flex-shrink-0 text-[10px]">
                {inst.step}
              </div>
              <div className="flex-1">
                <p className="text-slate-200 font-medium">{inst.text}</p>
                {inst.floorTransition && (
                  <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px] font-semibold">
                    <Footprints className="w-3 h-3" /> Transition to Floor {inst.floorTransition.toFloor}
                  </span>
                )}
              </div>
              <span className="text-[10px] text-slate-400 font-mono">{inst.distanceMeters}m</span>
            </div>
          ))}
        </div>

        {/* Launch Full Turn-by-Turn Game HUD Mode CTA */}
        <div className="mt-3 pt-3 border-t border-slate-800">
          <a
            href="/navigate"
            className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition"
          >
            <Navigation className="w-4 h-4" />
            <span>Launch Game HUD & Voice Mode</span>
          </a>
        </div>
      </div>
    </>
  );
};
