'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Vector2D } from '@/lib/location/deadReckoning';
import { Building, PathNode } from '@/types';
import { ZoomIn, ZoomOut, Maximize2, MapPin, Compass, Sparkles } from 'lucide-react';

interface RouteNodeItem {
  id: string;
  name: string;
  coordinates: { x: number; y: number };
  landmark?: string | null;
}

interface NavigationCanvasProps {
  buildings: Building[];
  routeNodes: RouteNodeItem[];
  userLocation: Vector2D;
  headingDegrees: number;
  isHeadingLocked: boolean;
  destinationCoords: Vector2D | null;
  destinationName: string;
  currentStepIndex: number;
}

export const NavigationCanvas: React.FC<NavigationCanvasProps> = ({
  buildings,
  routeNodes,
  userLocation,
  headingDegrees,
  isHeadingLocked,
  destinationCoords,
  destinationName,
  currentStepIndex,
}) => {
  const [zoom, setZoom] = useState(1.4);
  const [isSatellite, setIsSatellite] = useState(false);

  // SVG viewBox calculation
  // Campus coordinate system: 0 to 100 on X and Y
  // Centering on user:
  const targetX = userLocation.x;
  const targetY = userLocation.y;

  // Viewport dimensions in campus percentage units
  const baseWidth = 80 / zoom;
  const baseHeight = 80 / zoom;
  const minX = Math.max(-10, Math.min(110 - baseWidth, targetX - baseWidth / 2));
  const minY = Math.max(-10, Math.min(110 - baseHeight, targetY - baseHeight / 2));

  // Build SVG path for route
  const polylineD = React.useMemo(() => {
    if (!routeNodes || routeNodes.length < 2) return '';
    return routeNodes.map((n, idx) => `${idx === 0 ? 'M' : 'L'} ${n.coordinates.x} ${n.coordinates.y}`).join(' ');
  }, [routeNodes]);

  // Transform rotation if heading locked
  const mapRotationDeg = isHeadingLocked ? -headingDegrees : 0;

  return (
    <div className="relative w-full h-full min-h-[500px] overflow-hidden bg-[#070c18] select-none">
      {/* Dynamic Background Grid Pattern */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(6,182,212,0.15) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(6,182,212,0.15) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Floating Canvas Controls (Top Right) */}
      <div className="absolute top-24 right-4 flex flex-col gap-2 z-30">
        <button
          onClick={() => setZoom((z) => Math.min(z + 0.3, 3.0))}
          className="p-2.5 rounded-2xl bg-slate-900/90 border border-slate-700/80 text-slate-200 hover:text-white hover:border-cyan-500/50 shadow-xl backdrop-blur-xl transition"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(z - 0.3, 0.8))}
          className="p-2.5 rounded-2xl bg-slate-900/90 border border-slate-700/80 text-slate-200 hover:text-white hover:border-cyan-500/50 shadow-xl backdrop-blur-xl transition"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={() => setIsSatellite((s) => !s)}
          className={`p-2.5 rounded-2xl border shadow-xl backdrop-blur-xl transition text-[11px] font-black ${
            isSatellite
              ? 'bg-cyan-500 text-slate-950 border-cyan-400'
              : 'bg-slate-900/90 text-slate-300 border-slate-700 hover:text-white'
          }`}
          title="Toggle Satellite Imagery Mode"
        >
          SAT
        </button>
      </div>

      {/* Main SVG Vector Viewport */}
      <div
        className="w-full h-full transition-transform duration-500 ease-out origin-center"
        style={{
          transform: `rotate(${mapRotationDeg}deg)`,
        }}
      >
        <svg
          viewBox={`${minX} ${minY} ${baseWidth} ${baseHeight}`}
          className="w-full h-full transition-all duration-300 ease-out"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Route Glow Filter */}
            <filter id="routeGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            {/* Neon Linear Gradient for Active Route */}
            <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="50%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>

            {/* User Heading Radar Cone */}
            <radialGradient id="userRadarGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.6" />
              <stop offset="60%" stopColor="#06b6d4" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Campus Grounds / Lawn Patches */}
          <rect x="-20" y="-20" width="140" height="140" fill={isSatellite ? '#0d1b1e' : '#080e1c'} />

          {/* Campus Walkways Network Grid */}
          <g stroke="#1e293b" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" opacity="0.6">
            <line x1="15" y1="88" x2="30" y2="45" />
            <line x1="30" y1="45" x2="71" y2="36" />
            <line x1="71" y1="36" x2="80" y2="70" />
            <line x1="30" y1="45" x2="45" y2="75" />
            <line x1="45" y1="75" x2="80" y2="70" />
            <line x1="15" y1="88" x2="45" y2="75" />
            <line x1="71" y1="36" x2="25" y2="20" />
            <line x1="30" y1="45" x2="25" y2="20" />
          </g>

          {/* Buildings Footprint Polygons */}
          {buildings.map((bldg) => {
            const bx = bldg.coordinates.x;
            const by = bldg.coordinates.y;
            const bw = 14;
            const bh = 10;
            return (
              <g key={bldg.id} className="transition-opacity duration-300">
                {/* Building Footprint Box */}
                <rect
                  x={bx - bw / 2}
                  y={by - bh / 2}
                  width={bw}
                  height={bh}
                  rx="2.5"
                  fill={isSatellite ? '#1e293b' : '#0f172a'}
                  stroke="#334155"
                  strokeWidth="0.8"
                  opacity="0.9"
                />
                {/* Building Roof Highlight Accent */}
                <rect
                  x={bx - bw / 2 + 0.6}
                  y={by - bh / 2 + 0.6}
                  width={bw - 1.2}
                  height={bh - 1.2}
                  rx="2"
                  fill="none"
                  stroke={bldg.color || '#38bdf8'}
                  strokeWidth="0.4"
                  strokeOpacity="0.4"
                />
                {/* Building Code Label */}
                <text
                  x={bx}
                  y={by}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="2.4"
                  fontWeight="bold"
                  fill="#f8fafc"
                  letterSpacing="0.05em"
                >
                  {bldg.code}
                </text>
                <text
                  x={bx}
                  y={by + 2.4}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="1.3"
                  fill="#94a3b8"
                >
                  {bldg.name.split(' ')[0]}
                </text>
              </g>
            );
          })}

          {/* =========================================================================
              ACTIVE NAVIGATION ROUTE POLYLINE
          ========================================================================= */}
          {polylineD && (
            <g>
              {/* Outer Glow Halo */}
              <path
                d={polylineD}
                fill="none"
                stroke="#06b6d4"
                strokeWidth="4.2"
                strokeOpacity="0.3"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#routeGlow)"
              />

              {/* Core Solid Route Line */}
              <path
                d={polylineD}
                fill="none"
                stroke="url(#routeGradient)"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Animated Glowing Directional Chevrons / Dashes */}
              <path
                d={polylineD}
                fill="none"
                stroke="#ffffff"
                strokeWidth="1.2"
                strokeDasharray="2,3"
                strokeLinecap="round"
                className="animate-[dash_1.2s_linear_infinite]"
              />

              {/* Route Waypoint Nodes */}
              {routeNodes.map((n, idx) => {
                const isStart = idx === 0;
                const isEnd = idx === routeNodes.length - 1;
                const isCurrent = idx === currentStepIndex;

                if (isStart || isEnd) return null; // Rendered with custom pins

                return (
                  <g key={n.id || `node-${idx}`}>
                    <circle
                      cx={n.coordinates.x}
                      cy={n.coordinates.y}
                      r={isCurrent ? '1.4' : '0.9'}
                      fill={isCurrent ? '#38bdf8' : '#0284c7'}
                      stroke="#ffffff"
                      strokeWidth="0.4"
                    />
                    {n.landmark && (
                      <g>
                        <rect
                          x={n.coordinates.x + 1.2}
                          y={n.coordinates.y - 1.8}
                          width="12"
                          height="3.2"
                          rx="0.8"
                          fill="#0f172a"
                          stroke="#06b6d4"
                          strokeWidth="0.3"
                          opacity="0.95"
                        />
                        <text
                          x={n.coordinates.x + 2}
                          y={n.coordinates.y + 0.3}
                          fontSize="1.3"
                          fontWeight="bold"
                          fill="#38bdf8"
                        >
                          ✦ {n.landmark.slice(0, 14)}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </g>
          )}

          {/* =========================================================================
              DESTINATION MARKER PIN
          ========================================================================= */}
          {destinationCoords && (
            <g transform={`translate(${destinationCoords.x}, ${destinationCoords.y})`}>
              {/* Destination Pulsing Waves */}
              <circle r="4.5" fill="none" stroke="#ef4444" strokeWidth="0.5" strokeOpacity="0.4" className="animate-ping" />
              <circle r="2.8" fill="#ef4444" fillOpacity="0.2" stroke="#ef4444" strokeWidth="0.8" />
              {/* Center Bullseye */}
              <circle r="1.2" fill="#ffffff" />
              <circle r="0.6" fill="#ef4444" />

              {/* Destination Tag */}
              <rect
                x="-12"
                y="-7.5"
                width="24"
                height="4.2"
                rx="1.2"
                fill="#0f172a"
                stroke="#ef4444"
                strokeWidth="0.4"
                opacity="0.95"
              />
              <text
                x="0"
                y="-4.8"
                textAnchor="middle"
                fontSize="1.6"
                fontWeight="900"
                fill="#ffffff"
              >
                🏁 {destinationName.slice(0, 16)}
              </text>
            </g>
          )}

          {/* =========================================================================
              LIVE USER POSITION MARKER WITH HEADING CONE
          ========================================================================= */}
          <g
            transform={`translate(${userLocation.x}, ${userLocation.y}) rotate(${headingDegrees})`}
            className="transition-transform duration-300 ease-out"
          >
            {/* Heading Radar Cone (Direction of travel) */}
            <path
              d="M 0 0 L -4 -12 A 12 12 0 0 1 4 -12 Z"
              fill="url(#userRadarGlow)"
              opacity="0.75"
            />

            {/* Pulsing Ripple Halo */}
            <circle r="3.2" fill="none" stroke="#06b6d4" strokeWidth="0.5" className="animate-ping" />

            {/* Outer Blue Aura Circle */}
            <circle r="2.0" fill="#06b6d4" fillOpacity="0.25" stroke="#38bdf8" strokeWidth="0.5" />

            {/* Solid Puck Center */}
            <circle r="1.3" fill="#ffffff" stroke="#0284c7" strokeWidth="0.5" />

            {/* Direction Pointer Arrowhead */}
            <path
              d="M 0 -2.6 L 0.9 -0.6 L -0.9 -0.6 Z"
              fill="#0284c7"
            />
          </g>
        </svg>
      </div>

      {/* Compass Badge (Top Left of Map) */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-slate-800 text-xs">
        <Compass
          className="w-4 h-4 text-cyan-400 transition-transform duration-300"
          style={{ transform: `rotate(${headingDegrees}deg)` }}
        />
        <span className="font-mono font-bold text-slate-200">
          {headingDegrees}°
        </span>
        <span className="text-[10px] text-slate-400 uppercase font-semibold">
          {headingDegrees >= 315 || headingDegrees < 45
            ? 'N'
            : headingDegrees >= 45 && headingDegrees < 135
            ? 'E'
            : headingDegrees >= 135 && headingDegrees < 225
            ? 'S'
            : 'W'}
        </span>
      </div>
    </div>
  );
};
