/**
 * SIET Navigate — Frontend API Client
 * Seamlessly interfaces with http://localhost:5000/api/v1
 * with automatic fallback to static campus seed dataset when offline.
 */

const API_BASE_URL =
  process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:5000/api/v1';

export interface ApiPlace {
  id: string;
  name: string;
  code: string | null;
  type: string;
  lat: number;
  lng: number;
  buildingId: string | null;
  floorId: string | null;
  nodeId: string | null;
  aliases: string[];
  tags: string[];
  building?: { id: string; name: string; code: string } | null;
  floor?: { id: string; level: number; name: string | null } | null;
}

export interface ApiBuilding {
  id: string;
  name: string;
  code: string;
  description: string | null;
  centerLat: number;
  centerLng: number;
  footprint?: unknown;
  floors: {
    id: string;
    level: number;
    name: string | null;
    scale: number;
    planImageUrl: string | null;
  }[];
  _count?: { places: number };
}

export interface ApiCategory {
  type: string;
  label: string;
  count: number;
}

export interface ApiRouteResponse {
  from: { id: string; name: string; lat: number; lng: number; floorLevel: number };
  to: { id: string; name: string; lat: number; lng: number; floorLevel: number };
  distance_m: number;
  eta_sec: number;
  accessible: boolean;
  polyline: [number, number][];
  steps: {
    maneuver: string;
    text: string;
    dist: number;
    floor: number;
    landmark?: string | null;
  }[];
}

// -----------------------------------------------------------------------------
// Offline Fallback Seed Dataset
// -----------------------------------------------------------------------------
const SIET_LAT = 11.0827;
const SIET_LNG = 77.0607;

const STATIC_BUILDINGS: ApiBuilding[] = [
  {
    id: 'b-acad',
    name: 'Main Academic Block',
    code: 'ACAD',
    description: 'Lecture Halls LH 01 to LH 12 and core engineering labs',
    centerLat: SIET_LAT + 0.0005,
    centerLng: SIET_LNG + 0.0003,
    floors: [
      { id: 'f-acad-0', level: 0, name: 'Ground Floor', scale: 1, planImageUrl: null },
      { id: 'f-acad-1', level: 1, name: '1st Floor', scale: 1, planImageUrl: null },
      { id: 'f-acad-2', level: 2, name: '2nd Floor', scale: 1, planImageUrl: null },
    ],
    _count: { places: 14 },
  },
  {
    id: 'b-lib',
    name: 'Central Library & Auditorium',
    code: 'LIB',
    description: 'Central reading halls, digital repository & auditoriums',
    centerLat: SIET_LAT + 0.0008,
    centerLng: SIET_LNG - 0.0002,
    floors: [
      { id: 'f-lib-0', level: 0, name: 'Ground Floor', scale: 1, planImageUrl: null },
      { id: 'f-lib-1', level: 1, name: '1st Floor', scale: 1, planImageUrl: null },
    ],
    _count: { places: 5 },
  },
  {
    id: 'b-tech',
    name: 'Tech Park & Innovation Hub',
    code: 'TECH',
    description: 'AI & Robotics Labs, software incubators, and smart lecture halls',
    centerLat: SIET_LAT + 0.0012,
    centerLng: SIET_LNG + 0.0006,
    floors: [
      { id: 'f-tech-0', level: 0, name: 'Ground Floor', scale: 1, planImageUrl: null },
      { id: 'f-tech-1', level: 1, name: '1st Floor', scale: 1, planImageUrl: null },
      { id: 'f-tech-2', level: 2, name: '2nd Floor', scale: 1, planImageUrl: null },
    ],
    _count: { places: 10 },
  },
];

const STATIC_PLACES: ApiPlace[] = [
  { id: 'p-gate', name: 'Main Security Gate & Visitor Checkpoint', code: 'GATE-01', type: 'GATE', lat: SIET_LAT, lng: SIET_LNG, buildingId: null, floorId: null, nodeId: 'node-gate-main', aliases: ['Main Gate', 'Arch', 'Security'], tags: ['entrance', 'visitor'] },
  { id: 'p-canteen', name: 'Student Canteen', code: 'CANTEEN-01', type: 'CANTEEN', lat: SIET_LAT + 0.0003, lng: SIET_LNG - 0.0003, buildingId: null, floorId: null, nodeId: 'node-canteen', aliases: ['Cafeteria', 'Snack Bar'], tags: ['food'] },
  { id: 'p-foodcourt', name: 'Campus Food Court & Nescafe Corner', code: 'FOOD-COURT-01', type: 'FOOD_COURT', lat: SIET_LAT + 0.00032, lng: SIET_LNG - 0.00032, buildingId: null, floorId: null, nodeId: 'node-canteen', aliases: ['Juice Point', 'Coffee Shop'], tags: ['food'] },
  { id: 'p-lh01', name: 'Lecture Hall 01', code: 'LH-01', type: 'CLASSROOM', lat: SIET_LAT + 0.00047, lng: SIET_LNG + 0.00041, buildingId: 'b-acad', floorId: 'f-acad-0', nodeId: 'node-acad-f0', aliases: ['LH 1', 'Room 101'], tags: ['classroom'] },
  { id: 'p-lh05', name: 'Lecture Hall 05', code: 'LH-05', type: 'CLASSROOM', lat: SIET_LAT + 0.00047, lng: SIET_LNG + 0.00047, buildingId: 'b-acad', floorId: 'f-acad-1', nodeId: 'node-acad-f1', aliases: ['LH 5'], tags: ['classroom'] },
  { id: 'p-lh06', name: 'Lecture Hall 06', code: 'LH-06', type: 'CLASSROOM', lat: SIET_LAT + 0.00048, lng: SIET_LNG + 0.00048, buildingId: 'b-acad', floorId: 'f-acad-1', nodeId: 'node-acad-f1', aliases: ['LH 6'], tags: ['classroom'] },
  { id: 'p-tp201', name: 'Tech Park Smart Classroom 201', code: 'TECH-201', type: 'TECHPARK', lat: SIET_LAT + 0.00117, lng: SIET_LNG + 0.00057, buildingId: 'b-tech', floorId: 'f-tech-1', nodeId: 'node-tech-f1', aliases: ['TP 201'], tags: ['techpark', 'classroom'] },
  { id: 'p-ailab', name: 'Artificial Intelligence & Robotics Lab', code: 'TECH-AI-LAB', type: 'LAB', lat: SIET_LAT + 0.00121, lng: SIET_LNG + 0.00063, buildingId: 'b-tech', floorId: 'f-tech-1', nodeId: 'node-tech-f1', aliases: ['AI Lab'], tags: ['lab'] },
  { id: 'p-lib', name: 'Central Reading Hall & Books Stack', code: 'LIB-STACK', type: 'LIBRARY', lat: SIET_LAT + 0.00072, lng: SIET_LNG - 0.00012, buildingId: 'b-lib', floorId: 'f-lib-0', nodeId: 'node-lib-entry', aliases: ['Library'], tags: ['library'] },
  { id: 'p-hostel-b', name: 'Boys Hostel — Kaveri Block', code: 'HOSTEL-B-01', type: 'HOSTEL_BOYS', lat: SIET_LAT + 0.0010, lng: SIET_LNG - 0.0007, buildingId: null, floorId: null, nodeId: 'node-hostel-cross', aliases: ['Boys Hostel'], tags: ['hostel'] },
  { id: 'p-hostel-g', name: 'Girls Hostel — Bhavani Block', code: 'HOSTEL-G-01', type: 'HOSTEL_GIRLS', lat: SIET_LAT + 0.0011, lng: SIET_LNG - 0.0005, buildingId: null, floorId: null, nodeId: 'node-hostel-cross', aliases: ['Girls Hostel'], tags: ['hostel'] },
  { id: 'p-wash-acad', name: 'Academic Block Restrooms (1st Floor)', code: 'REST-ACAD-F1', type: 'WASHROOM', lat: SIET_LAT + 0.00045, lng: SIET_LNG + 0.00049, buildingId: 'b-acad', floorId: 'f-acad-1', nodeId: 'node-acad-f1', aliases: ['Toilet'], tags: ['washroom'] },
];

export const api = {
  async searchPlaces(query?: string, type?: string, buildingId?: string): Promise<ApiPlace[]> {
    try {
      const params = new URLSearchParams();
      if (query) params.set('q', query);
      if (type && type !== 'ALL') params.set('type', type);
      if (buildingId) params.set('buildingId', buildingId);

      const res = await fetch(`${API_BASE_URL}/places/search?${params.toString()}`, {
        cache: 'no-store',
      });
      if (res.ok) {
        const json = await res.json();
        return json.data?.places || [];
      }
    } catch {
      // Fallback
    }

    // Static Fallback
    let filtered = [...STATIC_PLACES];
    if (type && type !== 'ALL') {
      filtered = filtered.filter((p) => p.type === type);
    }
    if (buildingId) {
      filtered = filtered.filter((p) => p.buildingId === buildingId);
    }
    if (query && query.trim().length > 0) {
      const q = query.trim().toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.code?.toLowerCase().includes(q) ||
          p.aliases.some((al) => al.toLowerCase().includes(q))
      );
    }
    return filtered;
  },

  async getBuildings(): Promise<ApiBuilding[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/buildings`, { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        return json.data?.buildings || [];
      }
    } catch {
      // Fallback
    }
    return STATIC_BUILDINGS;
  },

  async getBuildingById(idOrCode: string): Promise<ApiBuilding | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/buildings/${idOrCode}`);
      if (res.ok) {
        const json = await res.json();
        return json.data?.building || null;
      }
    } catch {
      // Fallback
    }
    return (
      STATIC_BUILDINGS.find(
        (b) => b.id === idOrCode || b.code.toLowerCase() === idOrCode.toLowerCase()
      ) || null
    );
  },

  async getFloorRooms(buildingCode: string, level: number): Promise<ApiPlace[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/buildings/${buildingCode}/floors/${level}/rooms`);
      if (res.ok) {
        const json = await res.json();
        return json.data?.rooms || [];
      }
    } catch {
      // Fallback
    }
    const bldg = STATIC_BUILDINGS.find(
      (b) => b.code.toLowerCase() === buildingCode.toLowerCase() || b.id === buildingCode
    );
    if (!bldg) return [];
    return STATIC_PLACES.filter((p) => p.buildingId === bldg.id);
  },

  async getRoute(from: string, to: string, accessible = false): Promise<ApiRouteResponse | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/route`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from, to, accessible }),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data as ApiRouteResponse;
      }
    } catch {
      // Fallback
    }
    return null;
  },
};
