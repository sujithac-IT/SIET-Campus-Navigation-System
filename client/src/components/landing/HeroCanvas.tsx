'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Compass, Sparkles, Navigation2, Building2, MapPin, Cpu, BookOpen, Coffee } from 'lucide-react';

interface Waypoint {
  id: string;
  name: string;
  code: string;
  x: number;
  y: number;
  icon: React.ReactNode;
  color: string;
  detail: string;
}

const LANDMARKS: Waypoint[] = [
  { id: 'gate', name: 'Main Security Gate', code: 'GATE-01', x: 120, y: 440, icon: <MapPin className="w-3.5 h-3.5" />, color: '#06b6d4', detail: 'Primary Campus Checkpoint' },
  { id: 'canteen', name: 'Student Canteen', code: 'CANTEEN-01', x: 260, y: 390, icon: <Coffee className="w-3.5 h-3.5" />, color: '#f59e0b', detail: 'Food Court & Refreshments' },
  { id: 'acad', name: 'Main Academic Block', code: 'ACAD', x: 420, y: 310, icon: <Building2 className="w-3.5 h-3.5" />, color: '#3b82f6', detail: 'LH 01 - LH 12 & Science Labs' },
  { id: 'lib', name: 'Central Library', code: 'LIB', x: 300, y: 190, icon: <BookOpen className="w-3.5 h-3.5" />, color: '#10b981', detail: 'Digital Repository & Seminars' },
  { id: 'tech', name: 'Tech Park & AI Hub', code: 'TECH', x: 580, y: 140, icon: <Cpu className="w-3.5 h-3.5" />, color: '#ec4899', detail: 'AI, IoT Labs & Smart Classrooms' },
];

// Continuous Route Polyline through campus waypoints
const ROUTE_POINTS: [number, number][] = [
  [120, 440], // Main Gate
  [210, 410], // Entrance Drive
  [260, 390], // Canteen
  [340, 350], // Central Plaza
  [420, 310], // Academic Block
  [480, 240], // North Quad
  [580, 140], // Tech Park AI Hub
];

export const HeroCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pinProgress, setPinProgress] = useState(0);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [activeLandmark, setActiveLandmark] = useState<Waypoint | null>(LANDMARKS[4] || null);

  // 60fps Smooth Animation Loop for Traveler Pin along the Polyline
  useEffect(() => {
    let animId: number;
    let start = performance.now();

    const loop = (time: number) => {
      const elapsed = time - start;
      const progress = (elapsed % 8000) / 8000; // 8-second circuit loop
      setPinProgress(progress);
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Compute Current Coordinates of Traveling Pin along polyline segments
  const calculatePinPos = (t: number): { x: number; y: number; angle: number } => {
    const totalSegments = ROUTE_POINTS.length - 1;
    const scaledT = t * totalSegments;
    const segIdx = Math.min(Math.floor(scaledT), totalSegments - 1);
    const segProgress = scaledT - segIdx;

    const p0 = ROUTE_POINTS[segIdx]!;
    const p1 = ROUTE_POINTS[segIdx + 1]!;

    const x = p0[0] + (p1[0] - p0[0]) * segProgress;
    const y = p0[1] + (p1[1] - p0[1]) * segProgress;
    const angle = (Math.atan2(p1[1] - p0[1], p1[0] - p0[0]) * 180) / Math.PI;

    return { x, y, angle };
  };

  const pinPos = calculatePinPos(pinProgress);

  // Mouse Tilt 3D Parallax Effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 16;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -16;
    setTilt({ x, y });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  // Convert points to SVG polyline string
  const polylineStr = ROUTE_POINTS.map((pt) => `${pt[0]},${pt[1]}`).join(' ');

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full aspect-[4/3] max-w-[650px] mx-auto rounded-3xl overflow-hidden glass-panel border border-cyan-500/20 shadow-2xl transition-transform duration-200 ease-out select-none"
      style={{
        transform: `perspective(1000px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`,
      }}
    >
      {/* Dynamic HUD Header inside the live canvas */}
      <div className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-cyan-500/30 text-cyan-400 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>SIET DIGITAL TWIN • 60 FPS LIVE</span>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-700/60 text-slate-300 backdrop-blur-md">
          <Compass className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '8s' }} />
          <span>A* ROUTE ENGAGED</span>
        </div>
      </div>

      {/* SVG Canvas Map Layer */}
      <svg
        viewBox="0 0 700 520"
        className="w-full h-full"
        style={{ background: 'radial-gradient(circle at 60% 40%, #0c1b33 0%, #020617 100%)' }}
      >
        <defs>
          {/* Cyber Grid Pattern */}
          <pattern id="hero-grid" width="35" height="35" patternUnits="userSpaceOnUse">
            <path d="M 35 0 L 0 0 0 35" fill="none" stroke="#1e293b" strokeWidth="0.7" strokeOpacity="0.6" />
            <circle cx="0" cy="0" r="1" fill="#38bdf8" fillOpacity="0.3" />
          </pattern>

          {/* Neon Route Glow Filter */}
          <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Linear Gradient for Walkway Artery */}
          <linearGradient id="route-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="50%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>

          {/* Radar Sweep Gradient */}
          <radialGradient id="radar-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.25" />
            <stop offset="80%" stopColor="#06b6d4" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Cyber Grid Background */}
        <rect width="100%" height="100%" fill="url(#hero-grid)" />

        {/* Rotating Radar Sweep Cone */}
        <g transform="translate(350, 260)" className="animate-radar">
          <path d="M 0 0 L 280 -80 A 300 300 0 0 1 240 180 Z" fill="url(#radar-grad)" />
          <circle cx="0" cy="0" r="180" fill="none" stroke="#06b6d4" strokeWidth="1" strokeDasharray="3,6" strokeOpacity="0.3" />
          <circle cx="0" cy="0" r="260" fill="none" stroke="#38bdf8" strokeWidth="0.8" strokeOpacity="0.2" />
        </g>

        {/* Campus Landscaping & Green Quad Zones */}
        <path
          d="M 180 260 Q 220 200 310 240 T 400 290 Q 340 360 250 330 Z"
          fill="#064e3b"
          fillOpacity="0.35"
          stroke="#10b981"
          strokeWidth="0.8"
          strokeOpacity="0.4"
        />
        <text x="290" y="280" fill="#34d399" fontSize="10" fontWeight="bold" opacity="0.7">
          🌳 SIET Central Green Lawn
        </text>

        {/* Building Footprint Polygons (Glassmorphic Blueprint) */}
        {/* Main Academic Complex */}
        <rect x="380" y="280" width="110" height="70" rx="8" fill="#1e293b" fillOpacity="0.7" stroke="#38bdf8" strokeWidth="1.5" />
        <rect x="390" y="290" width="90" height="50" rx="4" fill="#0f172a" fillOpacity="0.8" />
        <text x="435" y="320" fill="#bae6fd" fontSize="11" fontWeight="bold" textAnchor="middle">ACAD BLOCK</text>

        {/* Central Library */}
        <polygon points="260,160 350,150 360,220 270,230" fill="#1e293b" fillOpacity="0.7" stroke="#10b981" strokeWidth="1.5" />
        <text x="310" y="195" fill="#a7f3d0" fontSize="11" fontWeight="bold" textAnchor="middle">CENTRAL LIB</text>

        {/* Tech Park & Innovation Hub */}
        <polygon points="530,90 640,110 620,180 520,160" fill="#1e293b" fillOpacity="0.7" stroke="#ec4899" strokeWidth="1.5" />
        <text x="575" y="140" fill="#fbcfe8" fontSize="11" fontWeight="bold" textAnchor="middle">TECH PARK</text>

        {/* Canteen & Food Court */}
        <rect x="220" y="360" width="80" height="50" rx="8" fill="#1e293b" fillOpacity="0.7" stroke="#f59e0b" strokeWidth="1.5" />
        <text x="260" y="390" fill="#fde68a" fontSize="10" fontWeight="bold" textAnchor="middle">CANTEEN</text>

        {/* Secondary Campus Walkway Network (Subtle dashed paths) */}
        <line x1="260" y1="390" x2="310" y2="195" stroke="#475569" strokeWidth="2" strokeDasharray="4,4" opacity="0.5" />
        <line x1="360" y1="220" x2="420" y2="310" stroke="#475569" strokeWidth="2" strokeDasharray="4,4" opacity="0.5" />
        <line x1="420" y1="310" x2="575" y2="140" stroke="#475569" strokeWidth="2" strokeDasharray="4,4" opacity="0.5" />

        {/* Active Glowing Turn-by-Turn Route Polyline */}
        {/* Glow backdrop */}
        <polyline
          points={polylineStr}
          fill="none"
          stroke="url(#route-gradient)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.3"
          filter="url(#neon-glow)"
        />
        {/* Solid route artery */}
        <polyline
          points={polylineStr}
          fill="none"
          stroke="url(#route-gradient)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Moving Dash Flow */}
        <polyline
          points={polylineStr}
          fill="none"
          stroke="#ffffff"
          strokeWidth="2.5"
          strokeDasharray="8,12"
          strokeLinecap="round"
          className="animate-route-flow"
          opacity="0.9"
        />

        {/* Landmark Waypoint Rings */}
        {LANDMARKS.map((lm) => (
          <g key={lm.id} transform={`translate(${lm.x}, ${lm.y})`}>
            <circle r="14" fill="#0f172a" stroke={lm.color} strokeWidth="2" />
            <circle r="5" fill={lm.color} />
          </g>
        ))}

        {/* Traveling Navigator Pin (Smooth 60fps Motion Along Route) */}
        <g transform={`translate(${pinPos.x}, ${pinPos.y})`}>
          {/* Luminous Pulsing Radar Ring */}
          <circle r="22" fill={activeLandmark?.color || '#06b6d4'} fillOpacity="0.2" className="animate-pulse-ring" />
          <circle r="12" fill="#0f172a" stroke="#ffffff" strokeWidth="2.5" filter="url(#neon-glow)" />
          {/* Directional Heading Needle */}
          <g transform={`rotate(${pinPos.angle})`}>
            <polygon points="0,-8 6,6 0,3 -6,6" fill="#38bdf8" />
          </g>
        </g>
      </svg>

      {/* Floating Interactive Landmark Cards on Hover/Tap */}
      <div className="absolute bottom-4 left-4 right-4 z-30">
        <div className="flex items-center gap-3 overflow-x-auto pb-1 custom-scrollbar">
          {LANDMARKS.map((lm) => (
            <button
              key={lm.id}
              onClick={() => setActiveLandmark(lm)}
              className={`flex-shrink-0 flex items-center gap-2.5 px-3.5 py-2 rounded-2xl border backdrop-blur-xl transition-all duration-300 text-left ${
                activeLandmark?.id === lm.id
                  ? 'bg-slate-900/95 border-cyan-400 text-white shadow-lg scale-105'
                  : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-600'
              }`}
            >
              <div
                className="w-7 h-7 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow"
                style={{ backgroundColor: lm.color }}
              >
                {lm.icon}
              </div>
              <div>
                <p className="text-xs font-bold leading-tight text-white">{lm.name}</p>
                <p className="text-[10px] text-slate-400 font-mono">{lm.code}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
