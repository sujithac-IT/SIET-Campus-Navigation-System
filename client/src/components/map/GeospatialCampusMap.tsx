'use client';

import React, { useEffect, useRef, useState } from 'react';
import type { Map as LeafletMap, TileLayer, Polygon, Polyline, Marker, LayerGroup } from 'leaflet';
import { useCampusStore } from '@/lib/store/useCampusStore';
import {
  SIET_CAMPUS_BOUNDS,
  SIET_BOUNDARY_POLYGON,
  SIET_GEO_BUILDINGS,
  GEOSPATIAL_PATH_NODES,
  GEOSPATIAL_PATH_EDGES,
  MAP_LAYERS
} from '@/lib/data/sietGeoData';
import { Building, Room, PathNode } from '@/types';
import {
  Layers,
  MapPin,
  Navigation,
  Compass,
  Maximize2,
  Accessibility,
  Eye,
  Info,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Building2,
  GraduationCap,
  Trophy,
  Coffee,
  Car,
  Camera,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  X
} from 'lucide-react';

interface GeospatialCampusMapProps {
  onSelectBuilding?: (building: Building) => void;
  onSelectRoomForNavigation?: (roomCode: string) => void;
  className?: string;
}

// Guided Waypoints Progression as requested (Entrance -> Avenue -> Main Block -> Academic Block -> Tech Park -> Sports)
export const CAMPUS_WAYPOINTS = [
  {
    id: 'wp-gate',
    name: '1. College Entrance Gateway (NH 544)',
    lat: 11.040913,
    lng: 77.077493,
    zoom: 18.5,
    photo: '/references/siet_entrance_gateway.jpg',
    googleMapsUrl: 'https://maps.app.goo.gl/k3634HaQ6AtTbMcP7',
    description: 'Grand entrance arch on Coimbatore L&T By-Pass (Salem–Kochi Highway). Security check, visitor parking & main campus entry.',
    badge: 'Entrance Gate Arch (Verified)'
  },
  {
    id: 'wp-avenue',
    name: '2. Palm Avenue & Boulevard',
    lat: 11.040926,
    lng: 77.075120,
    zoom: 18,
    photo: '/references/siet_campus_satellite_internal_road.jpg',
    googleMapsUrl: 'https://maps.app.goo.gl/5AiAAHCBH23NXr3s6',
    description: 'Tree-lined central campus driveway leading from gate past roundabout towards the administrative lawn.',
    badge: 'Central Driveway'
  },
  {
    id: 'wp-main',
    name: '3. Main Administrative Block',
    lat: 11.039940,
    lng: 77.074923,
    zoom: 18.5,
    photo: '/references/siet_main_block_glass.jpg',
    googleMapsUrl: 'https://maps.app.goo.gl/ee39AaW9UTeK58R68',
    description: 'Signature glass-fronted administrative center. Houses Principal, COE Office, and Exam Halls LH 24 to LH 68.',
    badge: 'Admin & Exam Halls LH 24-68'
  },
  {
    id: 'wp-acad',
    name: '4. Multi-Storey Academic Block',
    lat: 11.040404,
    lng: 77.074018,
    zoom: 18.5,
    photo: '/references/siet_academic_building.jpg',
    googleMapsUrl: 'https://maps.app.goo.gl/iXihKqeHzW7J3VK38',
    description: 'Premier 5-level Academic Block (18m height) housing Exam Halls LH 01 to LH 23, AI Research Center, and computing labs.',
    badge: 'Academic Halls LH 01-23'
  },
  {
    id: 'wp-tech',
    name: '5. New Block (Tech Park)',
    lat: 11.040150,
    lng: 77.075400,
    zoom: 18.5,
    photo: '/references/siet_campus_satellite_internal_road.jpg',
    googleMapsUrl: 'https://maps.app.goo.gl/ee39AaW9UTeK58R68',
    description: 'Modern New Block housing Smart Lecture Halls 1A, 1B, 1C, 1D, 2A, 2B, 2C, 2D and student startup incubators.',
    badge: 'Tech Park Halls 1A-2D'
  },
  {
    id: 'wp-sports',
    name: '6. Sports Arena & Synthetic Courts',
    lat: 11.039450,
    lng: 77.073400,
    zoom: 18.5,
    photo: '/references/siet_basketball_court.jpg',
    googleMapsUrl: 'https://maps.app.goo.gl/ee39AaW9UTeK58R68',
    description: 'Synthetic FIBA-standard Basketball Court and official Handball Court for collegiate championships.',
    badge: 'Sports Complex'
  }
];

export const GeospatialCampusMap: React.FC<GeospatialCampusMapProps> = ({
  onSelectBuilding,
  onSelectRoomForNavigation,
  className = ''
}) => {
  const store = useCampusStore();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);

  // Layers and overlay refs
  const currentTileLayerRef = useRef<TileLayer | null>(null);
  const routeLayerRef = useRef<Polyline | null>(null);
  const pathNetworkLayerRef = useRef<LayerGroup | null>(null);
  const buildingPolygonsRef = useRef<Map<string, Polygon>>(new Map());
  const markersLayerRef = useRef<LayerGroup | null>(null);
  const userMarkerRef = useRef<Marker | null>(null);
  const tourMarkerRef = useRef<Marker | null>(null);

  // UI state
  const [activeLayer, setActiveLayer] = useState<'osm' | 'satellite' | 'dark'>('satellite');
  const [showPaths, setShowPaths] = useState(true);
  const [showLegend, setShowLegend] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [gpsActive, setGpsActive] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(17);

  // College Gate Zoom-in Feature State
  const [showGateCard, setShowGateCard] = useState(false);
  const [isNearGate, setIsNearGate] = useState(false);

  // Guided Navigation / Flythrough State
  const [isTourActive, setIsTourActive] = useState(false);
  const [currentWaypointIdx, setCurrentWaypointIdx] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);

  // Haversine helper
  const computeDistanceMeters = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371000;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  // Fly to college gate and open photo view
  const handleZoomToCollegeGate = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo([11.040913, 77.077493], 19, {
      animate: true,
      duration: 1.5
    });
    setShowGateCard(true);
  };

  // Fly to specific waypoint in the sequence
  const handleFlyToWaypoint = (idx: number) => {
    if (!mapInstanceRef.current || idx < 0 || idx >= CAMPUS_WAYPOINTS.length) return;
    const wp = CAMPUS_WAYPOINTS[idx]!;
    setCurrentWaypointIdx(idx);
    setIsTourActive(true);

    mapInstanceRef.current.flyTo([wp.lat, wp.lng], wp.zoom || 18.5, {
      animate: true,
      duration: 1.6
    });

    // Update tour marker position
    import('leaflet').then((L) => {
      if (tourMarkerRef.current && mapInstanceRef.current) {
        tourMarkerRef.current.setLatLng([wp.lat, wp.lng]);
      } else if (mapInstanceRef.current) {
        const icon = L.divIcon({
          className: 'tour-pulse-marker',
          html: `
            <div class="relative w-8 h-8 flex items-center justify-center">
              <span class="absolute w-8 h-8 rounded-full bg-cyan-400 opacity-75 animate-ping"></span>
              <span class="w-5 h-5 rounded-full bg-cyan-500 border-2 border-white shadow-2xl flex items-center justify-center text-[10px] text-slate-950 font-black">
                📍
              </span>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });
        tourMarkerRef.current = L.marker([wp.lat, wp.lng], { icon }).addTo(mapInstanceRef.current);
      }
    });
  };

  // Auto-play timer for waypoint tour
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isTourActive && isAutoPlaying) {
      timer = setInterval(() => {
        setCurrentWaypointIdx((prev) => {
          const next = (prev + 1) % CAMPUS_WAYPOINTS.length;
          handleFlyToWaypoint(next);
          return next;
        });
      }, 4000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isTourActive, isAutoPlaying]);

  // Initialize Leaflet Map
  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (!mapContainerRef.current || mapInstanceRef.current) return;

      const L = (await import('leaflet')).default;

      // Fix icon resolution in bundler
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
      });

      // Create map instance
      const map = L.map(mapContainerRef.current, {
        center: SIET_CAMPUS_BOUNDS.center,
        zoom: SIET_CAMPUS_BOUNDS.defaultZoom,
        minZoom: SIET_CAMPUS_BOUNDS.minZoom,
        maxZoom: SIET_CAMPUS_BOUNDS.maxZoom,
        zoomControl: false,
        attributionControl: true
      });

      mapInstanceRef.current = map;

      // Monitor zoom and movement for Gate Zoom Card triggering
      map.on('zoomend moveend', () => {
        const z = map.getZoom();
        setCurrentZoom(z);
        const center = map.getCenter();
        const distToGate = computeDistanceMeters(center.lat, center.lng, 11.040913, 77.077493);
        const near = distToGate < 220;
        setIsNearGate(near);
        if (z >= 18 && near) {
          setShowGateCard(true);
        }
      });

      // Initial Base Tile Layer (Satellite by default with maxNativeZoom: 19)
      const initialLayerConfig = MAP_LAYERS[activeLayer];
      const tileLayer = L.tileLayer(initialLayerConfig.url, {
        attribution: initialLayerConfig.attribution,
        maxZoom: initialLayerConfig.maxZoom || 21,
        maxNativeZoom: initialLayerConfig.maxNativeZoom || 19
      }).addTo(map);
      currentTileLayerRef.current = tileLayer;

      // Add Zoom Control at bottom right
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // 1. Campus Boundary Layer
      L.polygon(SIET_BOUNDARY_POLYGON, {
        color: '#06b6d4',
        weight: 3,
        opacity: 0.85,
        fillColor: '#0284c7',
        fillOpacity: 0.08,
        dashArray: '6, 6'
      })
        .addTo(map)
        .bindPopup(`
          <div class="p-2 text-slate-100 max-w-xs">
            <div class="flex items-center gap-2 mb-1">
              <span class="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
              <h4 class="font-bold text-sm text-cyan-300">SIET Campus Boundary</h4>
            </div>
            <p class="text-xs text-slate-300">Sri Shakthi Institute of Engineering and Technology</p>
            <p class="text-[11px] text-slate-400 mt-1">Autonomous • Coimbatore Bypass, NH 544</p>
          </div>
        `);

      // 2. Pedestrian Path Network Layer
      const pathGroup = L.layerGroup();
      GEOSPATIAL_PATH_EDGES.forEach((edge) => {
        const fromNode = GEOSPATIAL_PATH_NODES.find((n) => n.id === edge.from);
        const toNode = GEOSPATIAL_PATH_NODES.find((n) => n.id === edge.to);

        if (fromNode?.lat && fromNode?.lng && toNode?.lat && toNode?.lng) {
          const polyline = L.polyline(
            [
              [fromNode.lat, fromNode.lng],
              [toNode.lat, toNode.lng]
            ],
            {
              color: '#38bdf8',
              weight: edge.isAccessible ? 3 : 2,
              opacity: 0.45,
              dashArray: '4, 4'
            }
          );

          polyline.bindTooltip(
            `<div class="text-[11px] font-sans"><b>Walkway:</b> ${edge.landmarkText || 'Campus path'} (${edge.distanceMeters}m)</div>`,
            { sticky: true }
          );

          pathGroup.addLayer(polyline);
        }
      });
      pathGroup.addTo(map);
      pathNetworkLayerRef.current = pathGroup;

      // 3. Building Footprint Polygons and Labels
      const markerGroup = L.layerGroup();

      SIET_GEO_BUILDINGS.forEach((bld) => {
        if (bld.polygon && bld.polygon.length > 0) {
          const poly = L.polygon(bld.polygon, {
            color: bld.color,
            weight: 2.5,
            fillColor: bld.color,
            fillOpacity: 0.35
          }).addTo(map);

          poly.on('mouseover', () => {
            poly.setStyle({ fillOpacity: 0.65, weight: 3.5 });
          });

          poly.on('mouseout', () => {
            poly.setStyle({ fillOpacity: 0.35, weight: 2.5 });
          });

          poly.on('click', () => {
            store.selectBuilding(bld.id);
            setSelectedBuilding(bld);
            if (onSelectBuilding) onSelectBuilding(bld);
          });

          buildingPolygonsRef.current.set(bld.id, poly);
        }

        // Add Marker Pill at Building Center
        if (bld.lat && bld.lng) {
          const isGate = bld.id === 'b-gate';
          const bldIcon = L.divIcon({
            className: 'custom-bld-icon',
            html: `
              <div class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl shadow-2xl border backdrop-blur-md cursor-pointer transition-all hover:scale-110 ${isGate ? 'ring-2 ring-cyan-400 animate-pulse' : ''}"
                   style="background-color: rgba(15, 23, 42, 0.92); border-color: ${bld.color}; color: #ffffff;">
                <div class="w-5 h-5 rounded-lg flex items-center justify-center font-black text-[10px] text-white" style="background-color: ${bld.color};">
                  ${isGate ? '🚪' : bld.code}
                </div>
                <div class="flex flex-col text-left whitespace-nowrap">
                  <span class="text-[11px] font-bold leading-tight">${bld.name.replace(/\\s*\\(.*?\\)/, '')}</span>
                  <span class="text-[9px] text-slate-300 font-medium">${isGate ? 'NH 544 GATE' : bld.category.toUpperCase()}</span>
                </div>
              </div>
            `,
            iconSize: [120, 32],
            iconAnchor: [60, 16]
          });

          const marker = L.marker([bld.lat, bld.lng], { icon: bldIcon });
          marker.on('click', () => {
            store.selectBuilding(bld.id);
            setSelectedBuilding(bld);
            if (isGate) setShowGateCard(true);
            if (onSelectBuilding) onSelectBuilding(bld);
          });

          markerGroup.addLayer(marker);
        }

        // Add Entrance Door Marker
        if (bld.entranceCoordinates) {
          const doorIcon = L.divIcon({
            className: 'custom-door-icon',
            html: `
              <div class="w-6 h-6 rounded-full bg-emerald-500/90 border-2 border-white flex items-center justify-center text-white shadow-lg hover:scale-125 transition" title="Entrance: ${bld.name}">
                <span class="text-[9px] font-bold">🚪</span>
              </div>
            `,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          });

          const doorMarker = L.marker([bld.entranceCoordinates.lat, bld.entranceCoordinates.lng], { icon: doorIcon });
          doorMarker.bindPopup(`
            <div class="p-2 text-slate-100 text-xs">
              <p class="font-bold text-emerald-400">Verified Entrance Door</p>
              <p class="text-slate-200 font-medium">${bld.name}</p>
              <p class="text-[10px] text-slate-400 mt-1">${bld.accessibilityInfo || 'Accessible porch'}</p>
            </div>
          `);
          markerGroup.addLayer(doorMarker);
        }
      });

      markerGroup.addTo(map);
      markersLayerRef.current = markerGroup;

      if (isMounted) {
        setMapLoaded(true);
      }
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Handle Base Layer Switcher (Street / Satellite / Dark)
  useEffect(() => {
    if (!mapInstanceRef.current || !mapLoaded) return;

    import('leaflet').then((L) => {
      if (currentTileLayerRef.current) {
        mapInstanceRef.current?.removeLayer(currentTileLayerRef.current);
      }

      const layerConfig = MAP_LAYERS[activeLayer];
      const newTileLayer = L.tileLayer(layerConfig.url, {
        attribution: layerConfig.attribution,
        maxZoom: layerConfig.maxZoom || 21,
        maxNativeZoom: layerConfig.maxNativeZoom || 19
      }).addTo(mapInstanceRef.current!);

      currentTileLayerRef.current = newTileLayer;
    });
  }, [activeLayer, mapLoaded]);

  // Handle Walking Route Display (Draws cyan glowing polyline)
  useEffect(() => {
    if (!mapInstanceRef.current || !mapLoaded) return;

    import('leaflet').then((L) => {
      // Remove old route
      if (routeLayerRef.current) {
        mapInstanceRef.current?.removeLayer(routeLayerRef.current);
        routeLayerRef.current = null;
      }

      const activeRoute = store.activeRoute;
      if (!activeRoute || activeRoute.nodes.length < 2) return;

      const latLngs: [number, number][] = activeRoute.nodes
        .map((node) => {
          if (node.lat && node.lng) return [node.lat, node.lng] as [number, number];
          // Fallback if only x/y
          return [11.040913 - (node.coordinates.y / 100) * 0.003, 77.077493 - (node.coordinates.x / 100) * 0.005] as [number, number];
        })
        .filter(Boolean);

      if (latLngs.length >= 2) {
        const polyline = L.polyline(latLngs, {
          color: '#06b6d4',
          weight: 6,
          opacity: 0.9,
          lineJoin: 'round',
          className: 'animate-route-flow'
        }).addTo(mapInstanceRef.current!);

        routeLayerRef.current = polyline;

        // Auto zoom/pan to fit the active route
        mapInstanceRef.current?.fitBounds(polyline.getBounds(), { padding: [50, 50] });
      }
    });
  }, [store.activeRoute, mapLoaded]);

  // Toggle Geolocation
  const handleToggleGPS = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }

    if (gpsActive) {
      setGpsActive(false);
      if (userMarkerRef.current && mapInstanceRef.current) {
        mapInstanceRef.current.removeLayer(userMarkerRef.current);
        userMarkerRef.current = null;
      }
      return;
    }

    setGpsError(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        setGpsActive(true);

        const L = (await import('leaflet')).default;

        if (mapInstanceRef.current) {
          if (userMarkerRef.current) {
            mapInstanceRef.current.removeLayer(userMarkerRef.current);
          }

          const userIcon = L.divIcon({
            className: 'user-gps-pulse',
            html: `
              <div class="relative w-7 h-7 flex items-center justify-center">
                <span class="absolute w-7 h-7 rounded-full bg-cyan-400 opacity-75 animate-ping"></span>
                <span class="w-4 h-4 rounded-full bg-cyan-500 border-2 border-white shadow-xl"></span>
              </div>
            `,
            iconSize: [28, 28],
            iconAnchor: [14, 14]
          });

          const userMarker = L.marker([latitude, longitude], { icon: userIcon }).addTo(mapInstanceRef.current);
          userMarker.bindPopup(`
            <div class="p-2 text-xs">
              <p class="font-bold text-cyan-400">Current Position</p>
              <p class="text-slate-300">Accuracy: ±${Math.round(accuracy)} meters</p>
            </div>
          `);

          userMarkerRef.current = userMarker;
          mapInstanceRef.current.setView([latitude, longitude], 18);
        }
      },
      (err) => {
        setGpsError(`GPS Error: ${err.message}. Using Campus Entrance as start position.`);
        setGpsActive(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const currentWp = CAMPUS_WAYPOINTS[currentWaypointIdx] || CAMPUS_WAYPOINTS[0]!;

  return (
    <div className={`relative w-full h-full rounded-2xl overflow-hidden ${className}`}>
      {/* Map Viewport Container */}
      <div ref={mapContainerRef} className="w-full h-full bg-slate-950 z-0" />

      {/* Top Left Navigation Toolbar */}
      <div className="absolute top-4 left-4 z-30 flex flex-wrap items-center gap-2">
        {/* Layer Switcher */}
        <div className="flex items-center gap-1 bg-slate-950/90 backdrop-blur-xl border border-slate-700/80 rounded-xl p-1 shadow-2xl">
          <button
            onClick={() => setActiveLayer('satellite')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeLayer === 'satellite'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Camera className="w-3.5 h-3.5" /> Satellite
          </button>
          <button
            onClick={() => setActiveLayer('osm')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeLayer === 'osm'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" /> Street Map
          </button>
          <button
            onClick={() => setActiveLayer('dark')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeLayer === 'dark'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🌙 Dark
          </button>
        </div>

        {/* Zoom to College Gate Button */}
        <button
          onClick={handleZoomToCollegeGate}
          className="px-3.5 py-1.5 rounded-xl bg-slate-950/90 backdrop-blur-xl border border-cyan-500/50 hover:border-cyan-400 text-cyan-300 hover:text-white text-xs font-extrabold transition shadow-2xl flex items-center gap-1.5"
          title="Zoom directly into the SIET Entrance Gateway Arch (NH 544)"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span>Zoom to College Gate</span>
        </button>

        {/* Start Guided Progression Tour (Entrance -> Main Block -> Academic Block) */}
        <button
          onClick={() => {
            if (isTourActive) {
              setIsTourActive(false);
              setIsAutoPlaying(false);
            } else {
              handleFlyToWaypoint(0);
            }
          }}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition shadow-2xl flex items-center gap-1.5 ${
            isTourActive
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-amber-500/20'
              : 'bg-slate-950/90 backdrop-blur-xl border border-slate-700 hover:border-cyan-400 text-slate-200'
          }`}
          title="Flythrough progression: Entrance -> Main Block -> Academic Block"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{isTourActive ? 'Exit Waypoint Tour' : 'Guided Campus Tour'}</span>
        </button>

        {/* Toggle Walkways Button */}
        <button
          onClick={() => {
            const next = !showPaths;
            setShowPaths(next);
            if (pathNetworkLayerRef.current && mapInstanceRef.current) {
              if (next) {
                pathNetworkLayerRef.current.addTo(mapInstanceRef.current);
              } else {
                mapInstanceRef.current.removeLayer(pathNetworkLayerRef.current);
              }
            }
          }}
          className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition shadow-lg ${
            showPaths
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
              : 'bg-slate-950/80 text-slate-400 border-slate-700 hover:text-white'
          }`}
        >
          {showPaths ? '✓ Walkways On' : 'Walkways Off'}
        </button>
      </div>

      {/* Top Right Map Control Icons */}
      <div className="absolute top-4 right-4 z-30 flex flex-col gap-2">
        <button
          onClick={() => {
            if (mapInstanceRef.current) {
              mapInstanceRef.current.setView(SIET_CAMPUS_BOUNDS.center, SIET_CAMPUS_BOUNDS.defaultZoom);
            }
          }}
          className="w-9 h-9 rounded-xl bg-slate-950/90 backdrop-blur-xl border border-slate-700 text-slate-300 hover:text-white hover:border-cyan-400 flex items-center justify-center shadow-2xl transition"
          title="Reset Campus View"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        <button
          onClick={handleToggleGPS}
          className={`w-9 h-9 rounded-xl border flex items-center justify-center shadow-2xl transition ${
            gpsActive
              ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-cyan-500/40'
              : 'bg-slate-950/90 backdrop-blur-xl border-slate-700 text-slate-300 hover:text-white hover:border-cyan-400'
          }`}
          title="GPS My Location"
        >
          <Navigation className={`w-4 h-4 ${gpsActive ? 'animate-spin-slow' : ''}`} />
        </button>

        <button
          onClick={() => setShowLegend(!showLegend)}
          className="w-9 h-9 rounded-xl bg-slate-950/90 backdrop-blur-xl border border-slate-700 text-slate-300 hover:text-white hover:border-cyan-400 flex items-center justify-center shadow-2xl transition"
          title="Toggle Legend"
        >
          <Info className="w-4 h-4" />
        </button>
      </div>

      {/* GPS Error Notification */}
      {gpsError && (
        <div className="absolute top-16 left-4 right-4 sm:left-auto sm:right-16 z-30 max-w-sm bg-amber-950/90 border border-amber-500/40 text-amber-200 p-2.5 rounded-xl text-xs flex items-center gap-2 shadow-2xl backdrop-blur-xl animate-in fade-in duration-300">
          <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>{gpsError}</span>
        </div>
      )}

      {/* Map Legend Overlay */}
      {showLegend && (
        <div className="absolute top-16 right-4 z-30 bg-slate-950/95 backdrop-blur-2xl border border-slate-700/80 rounded-2xl p-4 w-64 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-300 text-xs">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
            <h4 className="font-bold text-white flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" /> Campus Map Legend
            </h4>
            <button onClick={() => setShowLegend(false)} className="text-slate-400 hover:text-white">
              ✕
            </button>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded bg-sky-600/60 border border-sky-400"></span>
              <span className="text-slate-300">Main Admin Block (LH 24-68)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded bg-teal-600/60 border border-teal-400"></span>
              <span className="text-slate-300">Academic Block (LH 01-23)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded bg-sky-500/60 border border-sky-300"></span>
              <span className="text-slate-300">New Block Tech Park (1A-2D)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded bg-purple-600/60 border border-purple-400"></span>
              <span className="text-slate-300">Central Library & Seminar</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded bg-yellow-500/60 border border-yellow-400"></span>
              <span className="text-slate-300">Synthetic Basketball/Handball</span>
            </div>
            <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border border-white"></span>
              <span className="text-slate-300">Verified Building Entrance</span>
            </div>
          </div>
        </div>
      )}

      {/* College Gate Zoom-in Overlay Card (Requested Feature #1) */}
      {showGateCard && (
        <div className="absolute top-16 left-4 z-30 max-w-sm w-[90%] sm:w-84 bg-slate-950/95 backdrop-blur-2xl border-2 border-cyan-500/60 rounded-2xl p-4 shadow-2xl animate-in slide-in-from-top-3 duration-300 text-slate-100">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Ground-Truth Gate View
              </span>
              <h3 className="font-extrabold text-sm text-white mt-1">SIET Entrance Gateway Arch</h3>
              <p className="text-[11px] text-slate-400">Coimbatore Bypass (NH 544 Salem-Kochi Highway)</p>
            </div>
            <button
              onClick={() => setShowGateCard(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Real Photo Thumbnail */}
          <div className="relative w-full h-36 rounded-xl overflow-hidden border border-slate-700/80 mb-3 group">
            <img
              src="/references/siet_entrance_gateway.jpg"
              alt="Sri Shakthi Institute of Engineering and Technology Entrance Arch"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2.5">
              <span className="text-[10px] font-bold text-white flex items-center gap-1">
                <Camera className="w-3 h-3 text-cyan-400" /> Real Campus Entrance Photo
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed mb-3">
            Grand arrival archway for Sri Shakthi Institute of Engineering and Technology on Coimbatore L&T By-Pass, featuring 24/7 security checkpoint and pedestrian access.
          </p>

          <div className="space-y-2">
            <a
              href="https://maps.app.goo.gl/k3634HaQ6AtTbMcP7"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2 px-3 rounded-xl bg-cyan-600/30 hover:bg-cyan-600/50 border border-cyan-500/40 text-cyan-200 text-xs font-bold flex items-center justify-center gap-1.5 transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open 360° Google Street View Arch</span>
            </a>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  store.startNavigationToCoords({ x: 25, y: 65, lat: 11.04005, lng: 77.07505 }, 'Main Block');
                  setShowGateCard(false);
                }}
                className="py-1.5 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-[11px] font-bold text-center transition"
              >
                ➔ To Main Block
              </button>
              <button
                onClick={() => {
                  store.startNavigationToCoords({ x: 45, y: 40, lat: 11.04045, lng: 77.07425 }, 'Academic Block');
                  setShowGateCard(false);
                }}
                className="py-1.5 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-[11px] font-bold text-center transition"
              >
                ➔ To Academic Block
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Guided Progression Tour HUD Bar (Requested Feature #2: Entrance -> Main Block -> Academic Block) */}
      {isTourActive && (
        <div className="absolute bottom-4 left-4 right-4 sm:left-1/2 sm:-translate-x-1/2 sm:w-[620px] z-30 bg-slate-950/95 backdrop-blur-2xl border-2 border-cyan-500/50 rounded-2xl p-4 shadow-2xl animate-in slide-in-from-bottom-4 duration-300 text-slate-100">
          <div className="flex items-start justify-between gap-3 mb-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-black">
                <Compass className="w-4 h-4 animate-spin-slow" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-400">
                  Campus Waypoint Tour • Step {currentWaypointIdx + 1} of {CAMPUS_WAYPOINTS.length}
                </span>
                <h3 className="text-sm font-extrabold text-white leading-tight">{currentWp.name}</h3>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                  isAutoPlaying
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-850 border border-slate-700 text-slate-300 hover:text-white'
                }`}
              >
                {isAutoPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                <span>{isAutoPlaying ? 'Pause' : 'Auto-Fly'}</span>
              </button>
              <button
                onClick={() => setIsTourActive(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Real photo thumbnail preview */}
            <div className="w-full sm:w-36 h-24 rounded-xl overflow-hidden border border-slate-700 flex-shrink-0 relative">
              <img
                src={currentWp.photo}
                alt={currentWp.name}
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-bold text-white">
                {currentWp.badge}
              </span>
            </div>

            <div className="flex-1 space-y-1.5 text-left">
              <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                {currentWp.description}
              </p>
              <a
                href={currentWp.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan-400 hover:text-cyan-300"
              >
                <span>View Real Google Maps 360° Panorama</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              {/* Tour Navigation Controls */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  disabled={currentWaypointIdx === 0}
                  onClick={() => handleFlyToWaypoint(currentWaypointIdx - 1)}
                  className="py-1 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-40 border border-slate-700 text-xs font-bold text-slate-200 flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Previous
                </button>
                <button
                  disabled={currentWaypointIdx === CAMPUS_WAYPOINTS.length - 1}
                  onClick={() => handleFlyToWaypoint(currentWaypointIdx + 1)}
                  className="py-1 px-4 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-slate-950 text-xs font-black flex items-center gap-1 shadow-md shadow-cyan-600/20"
                >
                  <span>Next Location</span> <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Selected Building Details Bottom Card */}
      {selectedBuilding && !isTourActive && (
        <div className="absolute bottom-4 left-4 right-4 sm:left-4 sm:right-auto sm:max-w-md z-30 bg-slate-950/95 backdrop-blur-2xl border border-cyan-500/40 rounded-2xl p-4 shadow-2xl animate-in slide-in-from-bottom-3 duration-300 text-slate-100">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-sm shadow-lg flex-shrink-0"
                style={{ backgroundColor: selectedBuilding.color }}
              >
                {selectedBuilding.code}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-extrabold text-white leading-tight">
                    {selectedBuilding.name}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Verified
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5 capitalize">
                  {selectedBuilding.floors.length} Floors • {selectedBuilding.category}
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedBuilding(null)}
              className="text-slate-400 hover:text-white p-1 rounded-lg"
            >
              ✕
            </button>
          </div>

          <p className="text-xs text-slate-300 mt-2.5 line-clamp-2">
            {selectedBuilding.description}
          </p>

          {/* Department & Accessibility Badges */}
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {selectedBuilding.department && (
              <span className="px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-700 text-[10px] text-cyan-300">
                🏢 {selectedBuilding.department}
              </span>
            )}
            {selectedBuilding.accessibilityInfo && (
              <span className="px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-700 text-[10px] text-emerald-300 flex items-center gap-1">
                <Accessibility className="w-3 h-3" /> Step-Free Ramp / Lift
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 mt-3.5 pt-3 border-t border-slate-800">
            <button
              onClick={() => {
                if (selectedBuilding.entranceCoordinates) {
                  store.startNavigationToCoords(
                    {
                      x: selectedBuilding.coordinates.x,
                      y: selectedBuilding.coordinates.y,
                      lat: selectedBuilding.entranceCoordinates.lat,
                      lng: selectedBuilding.entranceCoordinates.lng
                    },
                    selectedBuilding.name
                  );
                }
              }}
              className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-500/20 transition"
            >
              <Navigation className="w-3.5 h-3.5" /> Navigate to Entrance
            </button>
            <button
              onClick={() => {
                const firstRoom = selectedBuilding.floors[0]?.rooms[0];
                if (firstRoom && onSelectRoomForNavigation) {
                  onSelectRoomForNavigation(firstRoom.code);
                }
              }}
              className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold transition"
            >
              Explore Rooms ({selectedBuilding.floors.reduce((acc, f) => acc + f.rooms.length, 0)})
            </button>
          </div>
        </div>
      )}

      {/* Active Navigation Floating Ribbon */}
      {store.activeRoute && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-slate-950/95 backdrop-blur-2xl border border-cyan-400/50 rounded-2xl px-4 py-2.5 shadow-2xl flex items-center gap-4 text-xs font-bold animate-in fade-in slide-in-from-top-3 duration-300">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-black">
              <Navigation className="w-4 h-4 animate-bounce" />
            </div>
            <div>
              <p className="text-[10px] text-cyan-400 uppercase tracking-wider font-extrabold">Active Walking Route</p>
              <p className="text-white text-xs truncate max-w-[160px] sm:max-w-xs">{store.destination?.name || 'Selected Destination'}</p>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-800" />

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-slate-200">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span>{store.activeRoute.totalDistanceMeters} m</span>
            </div>
            <div className="flex items-center gap-1 text-slate-200">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>~{store.activeRoute.estimatedTimeMinutes} min</span>
            </div>
          </div>

          <button
            onClick={() => store.clearActiveRoute()}
            className="text-slate-400 hover:text-white p-1 rounded-lg ml-1"
            title="Cancel Navigation"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};
