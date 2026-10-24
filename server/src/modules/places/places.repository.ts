import { Place, Building, Floor, PlaceType } from '@prisma/client';
import { prisma } from '../../core/database.js';
import { logger } from '../../core/logger.js';

export interface PlaceWithDetails extends Place {
  building?: Building | null;
  floor?: Floor | null;
}

export interface BuildingWithFloors extends Building {
  floors: Floor[];
  _count?: {
    places: number;
  };
}

// -----------------------------------------------------------------------------
// Fallback in-memory catalog for offline / disconnected dev environments
// -----------------------------------------------------------------------------
const FALLBACK_BUILDINGS: BuildingWithFloors[] = [
  {
    id: 'b-main',
    name: 'Main Block (Academic & Computing Complex)',
    code: 'MAIN',
    description: 'Premier 5-storey edifice on the west lawn housing Exam Halls LH 01 to LH 23, AI labs, and departmental faculty chambers',
    centerLat: 11.040404,
    centerLng: 77.074018,
    footprint: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    floors: [
      { id: 'f-main-0', buildingId: 'b-main', level: 0, name: 'Ground Floor', planImageUrl: null, scale: 1, originOffsetX: 0, originOffsetY: 0, createdAt: new Date(), updatedAt: new Date() },
      { id: 'f-main-1', buildingId: 'b-main', level: 1, name: '1st Floor', planImageUrl: null, scale: 1, originOffsetX: 0, originOffsetY: 0, createdAt: new Date(), updatedAt: new Date() },
      { id: 'f-main-2', buildingId: 'b-main', level: 2, name: '2nd Floor', planImageUrl: null, scale: 1, originOffsetX: 0, originOffsetY: 0, createdAt: new Date(), updatedAt: new Date() },
      { id: 'f-main-3', buildingId: 'b-main', level: 3, name: '3rd Floor', planImageUrl: null, scale: 1, originOffsetX: 0, originOffsetY: 0, createdAt: new Date(), updatedAt: new Date() },
      { id: 'f-main-4', buildingId: 'b-main', level: 4, name: '4th Floor', planImageUrl: null, scale: 1, originOffsetX: 0, originOffsetY: 0, createdAt: new Date(), updatedAt: new Date() },
    ],
    _count: { places: 24 },
  },
  {
    id: 'b-acad',
    name: 'Academic Block (COE & Engineering Wing)',
    code: 'ACAD',
    description: 'Signature glass-fronted building housing Controller of Examinations (COE), Principal Secretariat, Exam Halls LH 24 to LH 68, and Engineering Laboratories',
    centerLat: 11.039940,
    centerLng: 77.074923,
    footprint: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    floors: [
      { id: 'f-acad-0', buildingId: 'b-acad', level: 0, name: 'Ground Floor', planImageUrl: null, scale: 1, originOffsetX: 0, originOffsetY: 0, createdAt: new Date(), updatedAt: new Date() },
      { id: 'f-acad-1', buildingId: 'b-acad', level: 1, name: '1st Floor', planImageUrl: null, scale: 1, originOffsetX: 0, originOffsetY: 0, createdAt: new Date(), updatedAt: new Date() },
      { id: 'f-acad-2', buildingId: 'b-acad', level: 2, name: '2nd Floor', planImageUrl: null, scale: 1, originOffsetX: 0, originOffsetY: 0, createdAt: new Date(), updatedAt: new Date() },
      { id: 'f-acad-3', buildingId: 'b-acad', level: 3, name: '3rd Floor', planImageUrl: null, scale: 1, originOffsetX: 0, originOffsetY: 0, createdAt: new Date(), updatedAt: new Date() },
    ],
    _count: { places: 45 },
  },
  {
    id: 'b-tech',
    name: 'Tech Park (New Innovation & Computing Block)',
    code: 'TECH',
    description: 'Modern innovation center housing Exam Halls 1A to 2D, Incubation Center, Robotics, and Cloud Computing Laboratories',
    centerLat: 11.040734,
    centerLng: 77.074880,
    footprint: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    floors: [
      { id: 'f-tech-0', buildingId: 'b-tech', level: 0, name: 'Ground Floor', planImageUrl: null, scale: 1, originOffsetX: 0, originOffsetY: 0, createdAt: new Date(), updatedAt: new Date() },
      { id: 'f-tech-1', buildingId: 'b-tech', level: 1, name: '1st Floor', planImageUrl: null, scale: 1, originOffsetX: 0, originOffsetY: 0, createdAt: new Date(), updatedAt: new Date() },
      { id: 'f-tech-2', buildingId: 'b-tech', level: 2, name: '2nd Floor', planImageUrl: null, scale: 1, originOffsetX: 0, originOffsetY: 0, createdAt: new Date(), updatedAt: new Date() },
    ],
    _count: { places: 12 },
  },
  {
    id: 'b-amphi',
    name: 'Open Air Amphitheatre',
    code: 'AMPHI',
    description: 'Central circular tiered open-air amphitheatre situated between Main Block and Tech Park for cultural events and hackathons',
    centerLat: 11.040320,
    centerLng: 77.074400,
    footprint: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    floors: [
      { id: 'f-amphi-0', buildingId: 'b-amphi', level: 0, name: 'Ground Level Arena', planImageUrl: null, scale: 1, originOffsetX: 0, originOffsetY: 0, createdAt: new Date(), updatedAt: new Date() },
    ],
    _count: { places: 2 },
  },
];

const FALLBACK_PLACES: PlaceWithDetails[] = [
  // Campus Outdoor
  { id: 'p-gate-1', name: 'Main Security Gate & Visitor Checkpoint', code: 'GATE-01', type: PlaceType.GATE, buildingId: null, floorId: null, nodeId: 'node-gate-main', lat: 11.040913, lng: 77.077493, aliases: ['Main Gate', 'Arch', 'Security'], tags: ['entrance', 'visitor'], openHours: null, description: null, createdAt: new Date(), updatedAt: new Date() },
  { id: 'p-cant-1', name: 'Student Canteen', code: 'CANTEEN-01', type: PlaceType.CANTEEN, buildingId: null, floorId: null, nodeId: 'node-canteen', lat: 11.039554, lng: 77.075400, aliases: ['Cafeteria', 'Snack Bar'], tags: ['food', 'refreshment'], openHours: null, description: null, createdAt: new Date(), updatedAt: new Date() },
  { id: 'p-fc-1', name: 'Campus Food Court & Nescafe Corner', code: 'FOOD-COURT-01', type: PlaceType.FOOD_COURT, buildingId: null, floorId: null, nodeId: 'node-canteen', lat: 11.039560, lng: 77.075410, aliases: ['Juice Point', 'Coffee Shop'], tags: ['food'], openHours: null, description: null, createdAt: new Date(), updatedAt: new Date() },
  { id: 'p-hb-1', name: 'Boys Hostel — Kaveri Block', code: 'HOSTEL-B-01', type: PlaceType.HOSTEL_BOYS, buildingId: null, floorId: null, nodeId: 'node-hostel-cross', lat: 11.038540, lng: 77.073722, aliases: ['Boys Hostel', 'Gents Hostel'], tags: ['hostel'], openHours: null, description: null, createdAt: new Date(), updatedAt: new Date() },
  { id: 'p-hg-1', name: 'Girls Hostel — Bhavani Block', code: 'HOSTEL-G-01', type: PlaceType.HOSTEL_GIRLS, buildingId: null, floorId: null, nodeId: 'node-hostel-cross', lat: 11.038600, lng: 77.073800, aliases: ['Girls Hostel', 'Ladies Hostel'], tags: ['hostel'], openHours: null, description: null, createdAt: new Date(), updatedAt: new Date() },
  { id: 'p-pk-1', name: 'Visitor & Staff Vehicle Parking', code: 'PARK-MAIN', type: PlaceType.PARKING, buildingId: null, floorId: null, nodeId: 'node-gate-main', lat: 11.041210, lng: 77.076217, aliases: ['Bike Parking', 'Car Parking'], tags: ['parking'], openHours: null, description: null, createdAt: new Date(), updatedAt: new Date() },

  // Main Block (LH 01 - LH 23)
  { id: 'p-lh-01', name: 'Lecture Hall 01', code: 'LH-01', type: PlaceType.CLASSROOM, buildingId: 'b-main', floorId: 'f-main-0', nodeId: 'node-main-f0', lat: 11.040404, lng: 77.074018, aliases: ['LH 1', 'Main LH 01'], tags: ['classroom'], openHours: null, description: null, createdAt: new Date(), updatedAt: new Date(), building: FALLBACK_BUILDINGS[0], floor: FALLBACK_BUILDINGS[0]?.floors[0] },
  { id: 'p-lh-02', name: 'Lecture Hall 02', code: 'LH-02', type: PlaceType.CLASSROOM, buildingId: 'b-main', floorId: 'f-main-0', nodeId: 'node-main-f0', lat: 11.040410, lng: 77.074025, aliases: ['LH 2', 'Main LH 02'], tags: ['classroom'], openHours: null, description: null, createdAt: new Date(), updatedAt: new Date(), building: FALLBACK_BUILDINGS[0], floor: FALLBACK_BUILDINGS[0]?.floors[0] },
  { id: 'p-lh-05', name: 'Lecture Hall 05', code: 'LH-05', type: PlaceType.CLASSROOM, buildingId: 'b-main', floorId: 'f-main-1', nodeId: 'node-main-f1', lat: 11.040420, lng: 77.074030, aliases: ['LH 5', 'Main LH 05'], tags: ['classroom'], openHours: null, description: null, createdAt: new Date(), updatedAt: new Date(), building: FALLBACK_BUILDINGS[0], floor: FALLBACK_BUILDINGS[0]?.floors[1] },
  { id: 'p-lh-06', name: 'Lecture Hall 06', code: 'LH-06', type: PlaceType.CLASSROOM, buildingId: 'b-main', floorId: 'f-main-1', nodeId: 'node-main-f1', lat: 11.040425, lng: 77.074035, aliases: ['LH 6', 'Main LH 06'], tags: ['classroom'], openHours: null, description: null, createdAt: new Date(), updatedAt: new Date(), building: FALLBACK_BUILDINGS[0], floor: FALLBACK_BUILDINGS[0]?.floors[1] },

  // Academic Block (COE & Engineering Wing)
  { id: 'p-lab-ds', name: 'Data Structures Laboratory', code: 'LAB-DS', type: PlaceType.LAB, buildingId: 'b-acad', floorId: 'f-acad-1', nodeId: 'node-acad-f1', lat: 11.039940, lng: 77.074923, aliases: ['CSE Lab 1'], tags: ['lab'], openHours: null, description: null, createdAt: new Date(), updatedAt: new Date(), building: FALLBACK_BUILDINGS[1], floor: FALLBACK_BUILDINGS[1]?.floors[1] },
  { id: 'p-off-cse', name: 'CSE Department Faculty Chamber', code: 'OFF-CSE-FAC', type: PlaceType.OFFICE, buildingId: 'b-acad', floorId: 'f-acad-1', nodeId: 'node-acad-f1', lat: 11.039950, lng: 77.074930, aliases: ['HOD CSE', 'Faculty Room'], tags: ['office'], openHours: null, description: null, createdAt: new Date(), updatedAt: new Date(), building: FALLBACK_BUILDINGS[1], floor: FALLBACK_BUILDINGS[1]?.floors[1] },
  { id: 'p-wr-acad-f1', name: 'Academic Block Restrooms (1st Floor)', code: 'REST-ACAD-F1', type: PlaceType.WASHROOM, buildingId: 'b-acad', floorId: 'f-acad-1', nodeId: 'node-acad-f1', lat: 11.039930, lng: 77.074910, aliases: ['Toilet F1'], tags: ['washroom'], openHours: null, description: null, createdAt: new Date(), updatedAt: new Date(), building: FALLBACK_BUILDINGS[1], floor: FALLBACK_BUILDINGS[1]?.floors[1] },

  // Tech Park & Central Library
  { id: 'p-lib-stk', name: 'Central Reading Hall & Books Stack', code: 'LIB-STACK', type: PlaceType.LIBRARY, buildingId: 'b-tech', floorId: 'f-tech-0', nodeId: 'node-tech-f0', lat: 11.040730, lng: 77.074870, aliases: ['Library', 'Books Section'], tags: ['library'], openHours: null, description: null, createdAt: new Date(), updatedAt: new Date(), building: FALLBACK_BUILDINGS[2], floor: FALLBACK_BUILDINGS[2]?.floors[0] },
  { id: 'p-lib-dig', name: 'Digital Library & E-Resources Centre', code: 'LIB-DIGI', type: PlaceType.LIBRARY, buildingId: 'b-tech', floorId: 'f-tech-0', nodeId: 'node-tech-f0', lat: 11.040740, lng: 77.074880, aliases: ['E-Library'], tags: ['library'], openHours: null, description: null, createdAt: new Date(), updatedAt: new Date(), building: FALLBACK_BUILDINGS[2], floor: FALLBACK_BUILDINGS[2]?.floors[0] },
  { id: 'p-tp-201', name: 'Tech Park Smart Classroom 201', code: 'TECH-201', type: PlaceType.TECHPARK, buildingId: 'b-tech', floorId: 'f-tech-1', nodeId: 'node-tech-f1', lat: 11.040734, lng: 77.074880, aliases: ['TP 201'], tags: ['techpark', 'classroom'], openHours: null, description: null, createdAt: new Date(), updatedAt: new Date(), building: FALLBACK_BUILDINGS[2], floor: FALLBACK_BUILDINGS[2]?.floors[1] },
  { id: 'p-tp-ai', name: 'Artificial Intelligence & Robotics Lab', code: 'TECH-AI-LAB', type: PlaceType.LAB, buildingId: 'b-tech', floorId: 'f-tech-1', nodeId: 'node-tech-f1', lat: 11.040750, lng: 77.074890, aliases: ['AI Lab', 'Robotics Center'], tags: ['techpark', 'lab'], openHours: null, description: null, createdAt: new Date(), updatedAt: new Date(), building: FALLBACK_BUILDINGS[2], floor: FALLBACK_BUILDINGS[2]?.floors[1] },
  { id: 'p-tp-cld', name: 'Cloud Computing & DevOps Lab', code: 'TECH-CLOUD-LAB', type: PlaceType.LAB, buildingId: 'b-tech', floorId: 'f-tech-2', nodeId: 'node-tech-f2', lat: 11.040760, lng: 77.074900, aliases: ['Cloud Lab', 'AWS Lab'], tags: ['techpark', 'lab'], openHours: null, description: null, createdAt: new Date(), updatedAt: new Date(), building: FALLBACK_BUILDINGS[2], floor: FALLBACK_BUILDINGS[2]?.floors[2] },

  // Amphitheatre
  { id: 'p-amphi-1', name: 'Open Air Amphitheatre Arena', code: 'AMPHI-01', type: 'COMMON_AREA' as unknown as PlaceType, buildingId: 'b-amphi', floorId: 'f-amphi-0', nodeId: 'node-amphi', lat: 11.040320, lng: 77.074400, aliases: ['Amphitheatre', 'Plaza', 'Stage'], tags: ['amphitheatre', 'events'], openHours: null, description: null, createdAt: new Date(), updatedAt: new Date(), building: FALLBACK_BUILDINGS[3], floor: FALLBACK_BUILDINGS[3]?.floors[0] },
];

let lastDbFailure = 0;
function shouldAttemptDb(): boolean {
  if (process.env['NODE_ENV'] === 'test') return false;
  if (Date.now() - lastDbFailure < 30000) return false;
  return true;
}
function markDbFailure() {
  lastDbFailure = Date.now();
}

export class PlacesRepository {
  async search(
    query?: string,
    type?: PlaceType,
    buildingId?: string,
    limit = 20
  ): Promise<PlaceWithDetails[]> {
    if (shouldAttemptDb()) {
      try {
        const whereClause: Record<string, unknown> = {};
        if (type) whereClause['type'] = type;
        if (buildingId) whereClause['buildingId'] = buildingId;
        if (query && query.trim().length > 0) {
          const q = query.trim();
          whereClause['OR'] = [
            { name: { contains: q, mode: 'insensitive' } },
            { code: { contains: q, mode: 'insensitive' } },
            { aliases: { has: q } },
            { tags: { has: q.toLowerCase() } },
          ];
        }

        return await prisma.place.findMany({
          where: whereClause,
          include: { building: true, floor: true },
          take: limit,
          orderBy: { name: 'asc' },
        });
      } catch {
        markDbFailure();
        logger.debug('Using fallback in-memory places catalog (offline database mode)');
      }
    }

    let results = [...FALLBACK_PLACES];
    if (type) results = results.filter((p) => p.type === type);
    if (buildingId) results = results.filter((p) => p.buildingId === buildingId);
    if (query && query.trim().length > 0) {
      const q = query.trim().toLowerCase();
      results = results.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.code?.toLowerCase().includes(q) ||
          p.aliases.some((al) => al.toLowerCase().includes(q) || q.includes(al.toLowerCase())) ||
          p.tags.some((t) => t.toLowerCase().includes(q) || q.includes(t.toLowerCase())) ||
          (p.building?.name && (p.building.name.toLowerCase().includes(q) || q.includes(p.building.name.toLowerCase())))
      );
    }
    return results.slice(0, limit);
  }

  async findById(idOrCode: string): Promise<PlaceWithDetails | null> {
    if (shouldAttemptDb()) {
      try {
        const place = await prisma.place.findFirst({
          where: {
            OR: [{ id: idOrCode }, { code: idOrCode }],
          },
          include: { building: true, floor: true, node: true },
        });
        if (place) return place;
      } catch {
        markDbFailure();
        logger.debug('Using fallback in-memory places catalog for findById');
      }
    }

    return (
      FALLBACK_PLACES.find(
        (p) => p.id === idOrCode || p.code?.toLowerCase() === idOrCode.toLowerCase()
      ) || null
    );
  }

  async findAllBuildings(): Promise<BuildingWithFloors[]> {
    try {
      return await prisma.building.findMany({
        include: {
          floors: { orderBy: { level: 'asc' } },
          _count: { select: { places: true } },
        },
        orderBy: { name: 'asc' },
      });
    } catch {
      logger.debug('Using fallback in-memory buildings catalog');
      return FALLBACK_BUILDINGS;
    }
  }

  async findBuildingById(idOrCode: string): Promise<BuildingWithFloors | null> {
    try {
      const building = await prisma.building.findFirst({
        where: {
          OR: [{ id: idOrCode }, { code: idOrCode }],
        },
        include: {
          floors: { orderBy: { level: 'asc' } },
          _count: { select: { places: true } },
        },
      });
      if (building) return building;
    } catch {
      logger.debug('Using fallback in-memory building for findBuildingById');
    }

    return (
      FALLBACK_BUILDINGS.find(
        (b) => b.id === idOrCode || b.code?.toLowerCase() === idOrCode.toLowerCase()
      ) || null
    );
  }

  async findRoomsByFloor(
    buildingIdOrCode: string,
    level: number
  ): Promise<{ floor: Floor | null; rooms: Place[] }> {
    try {
      const building = await prisma.building.findFirst({
        where: {
          OR: [{ id: buildingIdOrCode }, { code: buildingIdOrCode }],
        },
      });

      if (building) {
        const floor = await prisma.floor.findUnique({
          where: {
            buildingId_level: {
              buildingId: building.id,
              level,
            },
          },
        });

        if (floor) {
          const rooms = await prisma.place.findMany({
            where: {
              buildingId: building.id,
              floorId: floor.id,
            },
            include: { node: true },
            orderBy: { name: 'asc' },
          });

          return { floor, rooms };
        }
      }
    } catch {
      logger.debug('Using fallback in-memory rooms for findRoomsByFloor');
    }

    const fb = await this.findBuildingById(buildingIdOrCode);
    if (!fb) return { floor: null, rooms: [] };

    const floor = fb.floors.find((f) => f.level === level) || null;
    if (!floor) return { floor: null, rooms: [] };

    const rooms = FALLBACK_PLACES.filter(
      (p) => p.buildingId === fb.id && p.floorId === floor.id
    );

    return { floor, rooms };
  }

  async getCategoryCounts(): Promise<Record<string, number>> {
    try {
      const counts = await prisma.place.groupBy({
        by: ['type'],
        _count: { id: true },
      });

      const result: Record<string, number> = {};
      for (const item of counts) {
        result[item.type] = item._count.id;
      }
      return result;
    } catch {
      logger.debug('Using fallback in-memory category counts');
      const counts: Record<string, number> = {};
      for (const p of FALLBACK_PLACES) {
        counts[p.type] = (counts[p.type] || 0) + 1;
      }
      return counts;
    }
  }
}

export const placesRepository = new PlacesRepository();
