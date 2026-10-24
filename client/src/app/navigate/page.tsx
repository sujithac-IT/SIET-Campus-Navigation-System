'use client';

import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useCampusStore } from '@/lib/store/useCampusStore';
import { apiClient } from '@/lib/api';
import { findRoute } from '@/lib/navigation/router';
import { INITIAL_PATH_NODES, INITIAL_PATH_EDGES } from '@/lib/data/seedData';
import { deadReckoning, DeadReckoningState, Vector2D } from '@/lib/location/deadReckoning';
import { voiceGuidance } from '@/lib/speech/voiceGuidance';
import { NavigationHUD, ManeuverInfo } from '@/components/navigation/NavigationHUD';
import { NavigationCanvas } from '@/components/navigation/NavigationCanvas';
import { RouteSelectorModal, RouteSelectionPayload } from '@/components/navigation/RouteSelectorModal';
import { QRScannerModal } from '@/components/location/QRScannerModal';
import {
  Compass,
  ArrowLeft,
  Navigation,
  SlidersHorizontal,
  RotateCcw,
  Sparkles,
  QrCode,
  CheckCircle2,
} from 'lucide-react';
import { RouteResult, PathNode } from '@/types';

function NavigateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const store = useCampusStore();

  // Route State
  const [activeRoute, setActiveRoute] = useState<RouteResult | null>(store.activeRoute);
  const [destinationName, setDestinationName] = useState<string>(
    store.destination?.name || 'Tech Park Lab 3 (Tech Park Block)'
  );
  const [destinationCoords, setDestinationCoords] = useState<Vector2D | null>(
    store.destination ? { x: store.destination.x, y: store.destination.y } : { x: 75, y: 25 }
  );
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isAccessible, setIsAccessible] = useState<boolean>(store.isAccessibilityMode);

  // Positioning & Sensors State
  const [userCoords, setUserCoords] = useState<Vector2D>(store.userLocation);
  const [headingDegrees, setHeadingDegrees] = useState<number>(0);
  const [isHeadingLocked, setIsHeadingLocked] = useState<boolean>(true);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Voice Guidance State
  const [isVoiceMuted, setIsVoiceMuted] = useState<boolean>(voiceGuidance.isMute());
  const [isVoiceSpeaking, setIsVoiceSpeaking] = useState<boolean>(false);

  // Deviation & Rerouting State
  const [isOffRoute, setIsOffRoute] = useState<boolean>(false);
  const [offRouteDistance, setOffRouteDistance] = useState<number>(0);
  const rerouteTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Modals
  const [isRouteSelectorOpen, setIsRouteSelectorOpen] = useState<boolean>(false);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState<boolean>(false);

  // Arrival Dialog State
  const [hasArrived, setHasArrived] = useState<boolean>(false);

  // Initialize Route calculation helper
  const computeAndSetRoute = useCallback(
    async (
      start: Vector2D,
      target: Vector2D,
      targetName: string,
      accessibleMode: boolean
    ) => {
      // 1. Try server routing engine first
      const serverResult = await apiClient.getRoute(
        `${start.x},${start.y}`,
        `${target.x},${target.y}`,
        accessibleMode
      );

      if (serverResult && serverResult.steps && serverResult.steps.length > 0) {
        // Map server steps to RouteResult format
        const clientSteps = serverResult.steps.map((st, idx) => ({
          step: idx + 1,
          text: st.text,
          distanceMeters: st.dist,
          floorTransition: undefined,
          landmark: st.landmark || undefined,
          maneuver: (st.maneuver as any) || 'straight',
        }));

        const nodes: PathNode[] = serverResult.polyline.map((p, idx) => ({
          id: `srv-node-${idx}`,
          name: idx === 0 ? 'Start' : idx === serverResult.polyline.length - 1 ? targetName : `Waypoint ${idx}`,
          coordinates: { x: p[1], y: p[0] }, // Map lat/lng or x/y
        }));

        const newRouteResult: RouteResult = {
          nodes,
          totalDistanceMeters: serverResult.distance_m,
          estimatedTimeMinutes: Math.max(1, Math.round(serverResult.eta_sec / 60)),
          instructions: clientSteps,
        };

        setActiveRoute(newRouteResult);
        setCurrentStepIndex(0);
        setDestinationName(targetName);
        setDestinationCoords(target);
        setHasArrived(false);

        voiceGuidance.announceRouteStart(
          targetName,
          clientSteps[0]?.text || 'Head toward destination',
          clientSteps[0]?.distanceMeters || 30
        );
        return;
      }

      // 2. Fallback to resilient client Dijkstra router
      const localResult = findRoute(
        start,
        target,
        INITIAL_PATH_NODES,
        INITIAL_PATH_EDGES,
        { isAccessibleOnly: accessibleMode }
      );

      setActiveRoute(localResult);
      setCurrentStepIndex(0);
      setDestinationName(targetName);
      setDestinationCoords(target);
      setHasArrived(false);

      const firstStep = localResult.instructions[0];
      voiceGuidance.announceRouteStart(
        targetName,
        firstStep ? firstStep.text : 'Head forward',
        firstStep ? firstStep.distanceMeters : 25
      );
    },
    []
  );

  // Subscribe to dead reckoning & device motion
  useEffect(() => {
    deadReckoning.startSensors();

    const unsubscribeDR = deadReckoning.subscribe((st: DeadReckoningState) => {
      setUserCoords(st.currentCoords);
      setHeadingDegrees(st.headingDegrees);
      setIsSimulating(st.isSimulating);
      store.updateUserCoordinates(store.currentUser?.id || 'guest', st.currentCoords);
    });

    const unsubscribeVoice = voiceGuidance.subscribe((speaking: boolean) => {
      setIsVoiceSpeaking(speaking);
    });

    return () => {
      deadReckoning.stopSensors();
      deadReckoning.stopSimulation();
      unsubscribeDR();
      unsubscribeVoice();
      voiceGuidance.stop();
    };
  }, []);

  // Handle URL query parameters on initial mount
  useEffect(() => {
    const toParam = searchParams?.get('to') || searchParams?.get('navigate');
    const accessibleParam = searchParams?.get('accessible') === 'true';

    if (accessibleParam) {
      setIsAccessible(true);
    }

    if (toParam) {
      // Find room in store buildings
      let foundCoords: Vector2D | null = null;
      let foundName = toParam;

      for (const b of store.buildings) {
        for (const f of b.floors) {
          const r = f.rooms.find(
            (room) =>
              room.code.toLowerCase() === toParam.toLowerCase() ||
              room.name.toLowerCase().includes(toParam.toLowerCase())
          );
          if (r) {
            foundCoords = r.coordinates;
            foundName = `${r.name} (${b.name})`;
            break;
          }
        }
        if (foundCoords) break;
      }

      if (foundCoords) {
        computeAndSetRoute(userCoords, foundCoords, foundName, accessibleParam);
      } else {
        // Default target
        computeAndSetRoute(userCoords, { x: 75, y: 25 }, 'Tech Park Lab 3', accessibleParam);
      }
    } else if (!activeRoute) {
      // Default to Tech Park Lab 3 demo route
      computeAndSetRoute(userCoords, { x: 75, y: 25 }, 'Tech Park Lab 3 (Tech Park Block)', isAccessible);
    }
  }, [searchParams]);

  // Turn polyline coordinates list
  const polylineCoords = React.useMemo<Vector2D[]>(() => {
    if (!activeRoute || !activeRoute.nodes) return [];
    return activeRoute.nodes.map((n) => ({ x: n.coordinates.x, y: n.coordinates.y }));
  }, [activeRoute]);

  // Deviation & Auto-Rerouting Monitor
  useEffect(() => {
    if (!activeRoute || polylineCoords.length < 2 || hasArrived) return;

    const distOffPath = deadReckoning.calculateDistanceToPolyline(polylineCoords);

    if (distOffPath > 15) {
      setIsOffRoute(true);
      setOffRouteDistance(distOffPath);

      // Start automatic rerouting after 2.5 seconds of sustained deviation
      if (!rerouteTimerRef.current) {
        rerouteTimerRef.current = setTimeout(() => {
          if (destinationCoords) {
            voiceGuidance.announceReroute();
            computeAndSetRoute(userCoords, destinationCoords, destinationName, isAccessible);
          }
          rerouteTimerRef.current = null;
          setIsOffRoute(false);
        }, 2500);
      }
    } else {
      setIsOffRoute(false);
      if (rerouteTimerRef.current) {
        clearTimeout(rerouteTimerRef.current);
        rerouteTimerRef.current = null;
      }
    }
  }, [userCoords, polylineCoords, activeRoute, destinationCoords, destinationName, isAccessible, hasArrived, computeAndSetRoute]);

  // Turn-by-Turn Waypoint Proximity & Step Advancement Monitor
  useEffect(() => {
    if (!activeRoute || !activeRoute.instructions || activeRoute.instructions.length === 0 || hasArrived) return;

    // Check arrival at final destination (within ~7m)
    if (destinationCoords) {
      const distToDest = Math.sqrt(
        Math.pow((destinationCoords.x - userCoords.x) * 4.5, 2) +
        Math.pow((destinationCoords.y - userCoords.y) * 4.5, 2)
      );

      if (distToDest <= 7) {
        setHasArrived(true);
        deadReckoning.stopSimulation();
        voiceGuidance.announceArrival(destinationName);
        return;
      }
    }

    // Check proximity to current waypoint
    const currentStep = activeRoute.instructions[currentStepIndex];
    const targetNode = activeRoute.nodes[currentStepIndex + 1];

    if (targetNode) {
      const distToNextNodeMeters = Math.sqrt(
        Math.pow((targetNode.coordinates.x - userCoords.x) * 4.5, 2) +
        Math.pow((targetNode.coordinates.y - userCoords.y) * 4.5, 2)
      );

      // 30-meter advance warning
      if (distToNextNodeMeters <= 30 && distToNextNodeMeters > 12) {
        voiceGuidance.announceApproachingTurn(currentStepIndex, currentStep?.text || 'Continue forward', distToNextNodeMeters);
      }

      // 10-meter imminent turn warning
      if (distToNextNodeMeters <= 12 && distToNextNodeMeters > 5) {
        voiceGuidance.announceTurnNow(currentStepIndex, currentStep?.text || 'Turn now');
      }

      // Step reached: advance step index
      if (distToNextNodeMeters <= 5 && currentStepIndex < activeRoute.instructions.length - 1) {
        setCurrentStepIndex((prev) => prev + 1);
      }
    }
  }, [userCoords, activeRoute, currentStepIndex, destinationCoords, destinationName, hasArrived]);

  // HUD Maneuver Computation
  const currentManeuver: ManeuverInfo = React.useMemo(() => {
    if (!activeRoute || !activeRoute.instructions || activeRoute.instructions.length === 0) {
      return {
        maneuver: 'straight',
        text: 'Proceed to destination',
        distMeters: 40,
      };
    }

    const step = activeRoute.instructions[currentStepIndex] || activeRoute.instructions[0];
    const targetNode = activeRoute.nodes[currentStepIndex + 1];
    let dist = step.distanceMeters;

    if (targetNode) {
      dist = Math.round(
        Math.sqrt(
          Math.pow((targetNode.coordinates.x - userCoords.x) * 4.5, 2) +
          Math.pow((targetNode.coordinates.y - userCoords.y) * 4.5, 2)
        )
      );
    }

    return {
      maneuver: (step as unknown as { maneuver?: string }).maneuver || 'straight',
      text: step.text,
      distMeters: Math.max(1, dist),
      landmark: (step as unknown as { landmark?: string | null }).landmark,
    };
  }, [activeRoute, currentStepIndex, userCoords]);

  const nextManeuver: ManeuverInfo | null = React.useMemo(() => {
    if (!activeRoute || currentStepIndex + 1 >= activeRoute.instructions.length) {
      return null;
    }
    const nextStep = activeRoute.instructions[currentStepIndex + 1];
    return {
      maneuver: (nextStep as unknown as { maneuver?: string }).maneuver || 'straight',
      text: nextStep.text,
      distMeters: nextStep.distanceMeters,
    };
  }, [activeRoute, currentStepIndex]);

  // Total Remaining Distance & ETA calculation
  const remainingDistanceMeters = React.useMemo(() => {
    if (!activeRoute) return 0;
    if (destinationCoords) {
      const directMeters = Math.sqrt(
        Math.pow((destinationCoords.x - userCoords.x) * 4.5, 2) +
        Math.pow((destinationCoords.y - userCoords.y) * 4.5, 2)
      );
      return Math.round(directMeters);
    }
    return activeRoute.totalDistanceMeters;
  }, [activeRoute, userCoords, destinationCoords]);

  const etaMinutes = Math.max(1, Math.ceil(remainingDistanceMeters / 75)); // ~75m/min walking speed

  // Handlers
  const handleToggleVoice = () => {
    const isMuted = voiceGuidance.toggleMute();
    setIsVoiceMuted(isMuted);
  };

  const handleToggleAccessible = () => {
    const nextAccessible = !isAccessible;
    setIsAccessible(nextAccessible);
    if (destinationCoords) {
      computeAndSetRoute(userCoords, destinationCoords, destinationName, nextAccessible);
    }
  };

  const handleManualReroute = () => {
    if (destinationCoords) {
      computeAndSetRoute(userCoords, destinationCoords, destinationName, isAccessible);
    }
  };

  const handleSelectRouteFromModal = (payload: RouteSelectionPayload) => {
    setIsAccessible(payload.isAccessible);
    deadReckoning.calibratePosition(payload.startCoords);
    computeAndSetRoute(
      payload.startCoords,
      payload.destinationCoords,
      payload.destinationName,
      payload.isAccessible
    );
  };

  const handleQRCalibrated = (coords: Vector2D, buildingId?: string, floor?: number) => {
    deadReckoning.calibratePosition(coords);
    if (destinationCoords) {
      computeAndSetRoute(coords, destinationCoords, destinationName, isAccessible);
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 text-slate-100 flex flex-col select-none">
      {/* Top Floating App Bar */}
      <header className="absolute top-4 left-4 z-40 flex items-center gap-2">
        <Link
          href="/map"
          className="p-3 rounded-2xl bg-slate-950/90 border border-slate-800 text-slate-300 hover:text-white hover:border-cyan-500/50 shadow-2xl backdrop-blur-xl transition"
          title="Return to Campus Map"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>

        <button
          onClick={() => setIsRouteSelectorOpen(true)}
          className="px-3.5 py-2.5 rounded-2xl bg-slate-950/90 border border-slate-800 hover:border-cyan-500/50 text-xs font-bold text-slate-200 hover:text-white shadow-2xl backdrop-blur-xl transition flex items-center gap-2"
          title="Change Destination or Route Options"
        >
          <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
          <span className="hidden sm:inline">Change Route</span>
        </button>
      </header>

      {/* Main Vector / Satellite Navigation Canvas Viewport */}
      <main className="relative flex-1 w-full h-full">
        <NavigationCanvas
          buildings={store.buildings}
          routeNodes={activeRoute?.nodes || []}
          userLocation={userCoords}
          headingDegrees={headingDegrees}
          isHeadingLocked={isHeadingLocked}
          destinationCoords={destinationCoords}
          destinationName={destinationName}
          currentStepIndex={currentStepIndex}
        />

        {/* Turn-by-Turn Game HUD Overlay */}
        <NavigationHUD
          currentManeuver={currentManeuver}
          nextManeuver={nextManeuver}
          totalDistanceMeters={activeRoute?.totalDistanceMeters || 120}
          remainingDistanceMeters={remainingDistanceMeters}
          etaMinutes={etaMinutes}
          destinationName={destinationName}
          currentFloor={store.selectedFloor}
          isVoiceMuted={isVoiceMuted}
          isVoiceSpeaking={isVoiceSpeaking}
          isAccessible={isAccessible}
          isHeadingLocked={isHeadingLocked}
          isSimulating={isSimulating}
          isOffRoute={isOffRoute}
          offRouteDistance={offRouteDistance}
          onToggleVoice={handleToggleVoice}
          onToggleAccessible={handleToggleAccessible}
          onToggleHeadingLock={() => setIsHeadingLocked((l) => !l)}
          onToggleSimulation={() => deadReckoning.toggleSimulation()}
          onStepForward={() => deadReckoning.stepTaken(1.2)}
          onSimulateDeviation={() => deadReckoning.simulateDeviation(22)}
          onOpenQRScanner={() => setIsQRScannerOpen(true)}
          onManualReroute={handleManualReroute}
          onExitNavigation={() => router.push('/map')}
        />
      </main>

      {/* Route Selector Modal */}
      <RouteSelectorModal
        isOpen={isRouteSelectorOpen}
        buildings={store.buildings}
        currentLocationCoords={userCoords}
        onClose={() => setIsRouteSelectorOpen(false)}
        onSelectRoute={handleSelectRouteFromModal}
        onOpenQRScanner={() => {
          setIsRouteSelectorOpen(false);
          setIsQRScannerOpen(true);
        }}
      />

      {/* QR Positioning Scanner Modal */}
      <QRScannerModal
        isOpen={isQRScannerOpen}
        onClose={() => setIsQRScannerOpen(false)}
      />

      {/* Destination Arrival Celebration Modal */}
      {hasArrived && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-300">
          <div className="relative w-full max-w-sm bg-slate-950 border border-emerald-500/50 rounded-3xl p-6 text-center space-y-4 shadow-[0_20px_70px_rgba(16,185,129,0.35)]">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shadow-lg">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Your Destination Has Arrived!</h2>
              <p className="text-xs text-emerald-400 font-semibold mt-1">
                {destinationName}
              </p>
              <p className="text-[11px] text-slate-400 mt-2">
                Turn-by-turn guidance complete. You are now at your destination doorway.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => router.push('/map')}
                className="flex-1 py-3 rounded-2xl bg-slate-900 border border-slate-700 text-xs font-bold text-slate-200 hover:text-white transition"
              >
                Back to Map
              </button>
              <button
                onClick={() => {
                  setHasArrived(false);
                  setIsRouteSelectorOpen(true);
                }}
                className="flex-1 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black shadow-lg transition"
              >
                New Route
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function NavigatePage() {
  return (
    <Suspense fallback={
      <div className="w-screen h-screen bg-slate-950 flex items-center justify-center text-cyan-400 font-mono text-sm">
        Initializing SIET HUD Navigator...
      </div>
    }>
      <NavigateContent />
    </Suspense>
  );
}
