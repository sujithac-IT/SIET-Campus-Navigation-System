'use client';

import React from 'react';
import {
  ArrowUp,
  ArrowUpRight,
  ArrowRight,
  ArrowDownRight,
  ArrowDown,
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpLeft,
  CornerUpRight,
  CornerUpLeft,
  RotateCcw,
  Footprints,
  Volume2,
  VolumeX,
  Compass,
  Accessibility,
  QrCode,
  Play,
  Pause,
  AlertTriangle,
  X,
  CheckCircle2,
  Layers,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

export interface ManeuverInfo {
  maneuver: string; // 'straight' | 'left' | 'right' | 'u_turn' | 'stairs_up' | 'stairs_down' | 'lift' | 'arrive'
  text: string;
  distMeters: number;
  floor?: number;
  landmark?: string | null;
}

interface NavigationHUDProps {
  currentManeuver: ManeuverInfo;
  nextManeuver?: ManeuverInfo | null;
  totalDistanceMeters: number;
  remainingDistanceMeters: number;
  etaMinutes: number;
  destinationName: string;
  currentFloor: number;
  isVoiceMuted: boolean;
  isVoiceSpeaking: boolean;
  isAccessible: boolean;
  isHeadingLocked: boolean;
  isSimulating: boolean;
  isOffRoute: boolean;
  offRouteDistance: number;
  onToggleVoice: () => void;
  onToggleAccessible: () => void;
  onToggleHeadingLock: () => void;
  onToggleSimulation: () => void;
  onStepForward: () => void;
  onSimulateDeviation: () => void;
  onOpenQRScanner: () => void;
  onManualReroute: () => void;
  onExitNavigation: () => void;
}

export const NavigationHUD: React.FC<NavigationHUDProps> = ({
  currentManeuver,
  nextManeuver,
  totalDistanceMeters,
  remainingDistanceMeters,
  etaMinutes,
  destinationName,
  currentFloor,
  isVoiceMuted,
  isVoiceSpeaking,
  isAccessible,
  isHeadingLocked,
  isSimulating,
  isOffRoute,
  offRouteDistance,
  onToggleVoice,
  onToggleAccessible,
  onToggleHeadingLock,
  onToggleSimulation,
  onStepForward,
  onSimulateDeviation,
  onOpenQRScanner,
  onManualReroute,
  onExitNavigation,
}) => {
  // Compute trip progress percentage (0 - 100)
  const completedMeters = Math.max(0, totalDistanceMeters - remainingDistanceMeters);
  const progressPct = totalDistanceMeters > 0
    ? Math.min(100, Math.round((completedMeters / totalDistanceMeters) * 100))
    : 0;

  // Compute estimated arrival clock time (HH:MM AM/PM)
  const arrivalTime = React.useMemo(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + Math.max(1, etaMinutes));
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, [etaMinutes]);

  // Maneuver icon resolver
  const renderManeuverIcon = (maneuver: string, className = 'w-9 h-9') => {
    const m = maneuver.toLowerCase();
    if (m.includes('stairs_up') || m.includes('stairs up')) {
      return <Footprints className={className} />;
    }
    if (m.includes('stairs_down') || m.includes('stairs down')) {
      return <Footprints className={`${className} rotate-180`} />;
    }
    if (m.includes('lift') || m.includes('elevator')) {
      return <Layers className={className} />;
    }
    if (m.includes('arrive') || m.includes('destination')) {
      return <CheckCircle2 className={`${className} text-emerald-400`} />;
    }
    if (m.includes('u_turn') || m.includes('uturn')) {
      return <RotateCcw className={className} />;
    }
    if (m.includes('sharp_left') || m.includes('sharp left')) {
      return <CornerUpLeft className={className} />;
    }
    if (m.includes('sharp_right') || m.includes('sharp right')) {
      return <CornerUpRight className={className} />;
    }
    if (m.includes('left')) {
      return <ArrowLeft className={className} />;
    }
    if (m.includes('right')) {
      return <ArrowRight className={className} />;
    }
    return <ArrowUp className={className} />;
  };

  return (
    <>
      {/* =========================================================================
          TOP HUD: Turn Maneuver Direction Banner
      ========================================================================= */}
      <div className="absolute top-4 left-3 right-3 sm:left-6 sm:right-6 max-w-2xl mx-auto z-40 select-none animate-in fade-in slide-in-from-top-4 duration-300">
        {/* Off-Route Alert Callout Banner */}
        {isOffRoute && (
          <div className="mb-2 p-3 rounded-2xl bg-gradient-to-r from-amber-600 via-rose-600 to-amber-600 border border-amber-300 text-white shadow-2xl flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-200 shrink-0" />
              <div>
                <p className="text-xs font-black tracking-wide uppercase">
                  Deviation Detected ({Math.round(offRouteDistance)}m off path)
                </p>
                <p className="text-[11px] text-amber-100">
                  Auto-recalculating fresh path to destination...
                </p>
              </div>
            </div>
            <button
              onClick={onManualReroute}
              className="px-3 py-1 bg-white text-slate-950 rounded-xl text-xs font-bold shadow-md hover:bg-slate-100 transition flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Reroute Now
            </button>
          </div>
        )}

        {/* Primary Turn Card */}
        <div className="relative overflow-hidden rounded-3xl bg-slate-950/90 backdrop-blur-2xl border border-cyan-500/40 shadow-[0_12px_40px_rgba(6,182,212,0.25)] p-4 sm:p-5">
          {/* Subtle neon glow backdrops */}
          <div className="absolute -top-12 -left-12 w-32 h-32 bg-cyan-500/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-blue-600/20 rounded-full blur-2xl pointer-events-none" />

          <div className="relative flex items-center justify-between gap-3">
            {/* Left: Direction Icon & Next Turn Distance */}
            <div className="flex items-center gap-3.5 sm:gap-4 flex-1 min-w-0">
              <div className="relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-slate-950 shadow-lg shadow-cyan-500/30 shrink-0">
                {renderManeuverIcon(currentManeuver.maneuver, 'w-8 h-8 sm:w-9 sm:h-9 stroke-[2.5]')}
                {isVoiceSpeaking && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-300 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-400"></span>
                  </span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                {/* Distance to Maneuver */}
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-black tracking-tight text-white font-mono">
                    {Math.round(currentManeuver.distMeters)}
                  </span>
                  <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
                    meters
                  </span>
                </div>

                {/* Primary Step Text */}
                <h2 className="text-sm sm:text-base font-bold text-slate-100 truncate leading-snug">
                  {currentManeuver.text}
                </h2>

                {/* Attached Landmark or Floor transition tag */}
                {currentManeuver.landmark && (
                  <p className="text-[11px] text-cyan-300 flex items-center gap-1 mt-0.5">
                    <Sparkles className="w-3 h-3 text-cyan-400 shrink-0" />
                    <span>Pass landmark: {currentManeuver.landmark}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Quick Actions (Voice Mute & Exit) */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={onToggleVoice}
                className={`p-2.5 rounded-2xl border transition-all ${
                  isVoiceMuted
                    ? 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
                    : 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 shadow-md shadow-cyan-500/20'
                }`}
                title={isVoiceMuted ? 'Unmute Turn Voice' : 'Mute Voice Guidance'}
              >
                {isVoiceMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>

              <button
                onClick={onExitNavigation}
                className="p-2.5 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-300 hover:bg-rose-500 hover:text-white transition shadow-md"
                title="End Navigation"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Secondary Upcoming Maneuver Sneak Peek (Like Google Maps) */}
          {nextManeuver && (
            <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-2 truncate">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  Then
                </span>
                <div className="w-4 h-4 text-cyan-400 shrink-0">
                  {renderManeuverIcon(nextManeuver.maneuver, 'w-4 h-4')}
                </div>
                <span className="text-slate-300 truncate">{nextManeuver.text}</span>
              </div>
              <span className="text-[11px] font-mono text-slate-400 shrink-0 ml-2">
                {Math.round(nextManeuver.distMeters)}m
              </span>
            </div>
          )}

          {/* Glowing Trip Progress Bar */}
          <div className="mt-3 w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 transition-all duration-500 rounded-full shadow-[0_0_8px_rgba(56,189,248,0.8)]"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* =========================================================================
          BOTTOM HUD: Trip Stats, ETA, Controls & Simulator Drawer
      ========================================================================= */}
      <div className="absolute bottom-4 left-3 right-3 sm:left-6 sm:right-6 max-w-2xl mx-auto z-40 select-none animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="rounded-3xl bg-slate-950/90 backdrop-blur-2xl border border-cyan-500/30 shadow-[0_16px_50px_rgba(0,0,0,0.6)] p-4 sm:p-5">
          {/* Main Stats Row */}
          <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-3">
            {/* ETA */}
            <div className="flex flex-col">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
                  {Math.max(1, etaMinutes)}
                </span>
                <span className="text-xs font-bold text-emerald-300 uppercase">min</span>
              </div>
              <span className="text-[11px] text-slate-400">
                Arrive ~{arrivalTime}
              </span>
            </div>

            {/* Total Remaining Distance */}
            <div className="text-center">
              <span className="text-base sm:text-lg font-black text-white font-mono">
                {Math.round(remainingDistanceMeters)} m
              </span>
              <p className="text-[10px] text-cyan-400 uppercase tracking-wider font-semibold">
                remaining
              </p>
            </div>

            {/* Destination Name & Floor */}
            <div className="text-right max-w-[140px] sm:max-w-[180px] truncate">
              <span className="text-xs sm:text-sm font-black text-white truncate block">
                {destinationName}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 mt-0.5">
                <Layers className="w-2.5 h-2.5" /> Floor {currentFloor}
              </span>
            </div>
          </div>

          {/* Quick Control Toggles Bar */}
          <div className="pt-3 flex items-center justify-between gap-1.5 flex-wrap">
            {/* Compass / Heading Lock */}
            <button
              onClick={onToggleHeadingLock}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                isHeadingLocked
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
              title="Toggle Camera Follow Heading vs North Up"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>{isHeadingLocked ? 'Heading Up' : 'North Up'}</span>
            </button>

            {/* Accessible Route Toggle */}
            <button
              onClick={onToggleAccessible}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                isAccessible
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/50 shadow-sm'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
              title="Avoid stairs / Prioritize elevators & ramps"
            >
              <Accessibility className="w-3.5 h-3.5" />
              <span>{isAccessible ? 'Accessible' : 'Standard'}</span>
            </button>

            {/* QR Recalibrate Checkpoint */}
            <button
              onClick={onOpenQRScanner}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-sky-600/30 text-sky-300 border border-sky-500/40 hover:bg-sky-500/40 transition shadow-sm"
              title="Scan QR checkpoint to recalibrate position"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Scan QR</span>
            </button>

            {/* Virtual Walk Simulator (Desktop / Demo test) */}
            <div className="flex items-center gap-1 ml-auto">
              <button
                onClick={onStepForward}
                className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-[11px] font-bold text-slate-300 hover:text-white transition"
                title="Take 1 step forward in current heading"
              >
                +1 Step
              </button>

              <button
                onClick={onToggleSimulation}
                className={`p-1.5 rounded-xl border transition ${
                  isSimulating
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 animate-pulse'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
                title={isSimulating ? 'Pause walking simulation' : 'Auto-walk simulation (1.2m/s)'}
              >
                {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={onSimulateDeviation}
                className="px-2 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-[11px] font-bold text-amber-300 transition"
                title="Drift 20m off-route to test auto-rerouting"
              >
                Deviate
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
