import { describe, it, expect } from 'vitest';
import { PlaceType } from '@prisma/client';
import { PlacesService } from '../../src/modules/places/places.service.js';
import { PlacesRepository, PlaceWithDetails, BuildingWithFloors } from '../../src/modules/places/places.repository.js';
import { NotFoundError } from '../../src/core/errors.js';
import {
  searchPlacesQuerySchema,
  floorRoomsParamSchema,
  placeIdParamSchema,
} from '../../src/modules/places/places.schema.js';

// Mock repository implementation with realistic sample campus places
class MockPlacesRepository extends PlacesRepository {
  private sampleBuildings: BuildingWithFloors[] = [
    {
      id: 'bldg-acad',
      name: 'Main Academic Block',
      code: 'ACAD',
      description: 'Primary lecture halls and labs',
      centerLat: 11.0832,
      centerLng: 77.0610,
      footprint: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      floors: [
        {
          id: 'fl-acad-0',
          buildingId: 'bldg-acad',
          level: 0,
          name: 'Ground Floor',
          planImageUrl: null,
          scale: 1,
          originOffsetX: 0,
          originOffsetY: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'fl-acad-1',
          buildingId: 'bldg-acad',
          level: 1,
          name: '1st Floor',
          planImageUrl: null,
          scale: 1,
          originOffsetX: 0,
          originOffsetY: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      _count: { places: 4 },
    },
    {
      id: 'bldg-tech',
      name: 'Tech Park & Innovation Hub',
      code: 'TECH',
      description: 'AI & Robotics Labs, Tech Park Classrooms',
      centerLat: 11.0839,
      centerLng: 77.0613,
      footprint: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      floors: [
        {
          id: 'fl-tech-1',
          buildingId: 'bldg-tech',
          level: 1,
          name: '1st Floor',
          planImageUrl: null,
          scale: 1,
          originOffsetX: 0,
          originOffsetY: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      _count: { places: 2 },
    },
  ];

  private samplePlaces: PlaceWithDetails[] = [
    {
      id: 'p-lh01',
      name: 'Lecture Hall 01',
      code: 'LH-01',
      type: PlaceType.CLASSROOM,
      buildingId: 'bldg-acad',
      floorId: 'fl-acad-0',
      nodeId: 'node-1',
      lat: 11.0831,
      lng: 77.0611,
      aliases: ['LH 1', 'Room 101'],
      tags: ['classroom', 'lecture'],
      openHours: null,
      description: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'p-lh05',
      name: 'Lecture Hall 05',
      code: 'LH-05',
      type: PlaceType.CLASSROOM,
      buildingId: 'bldg-acad',
      floorId: 'fl-acad-1',
      nodeId: 'node-5',
      lat: 11.0832,
      lng: 77.0612,
      aliases: ['LH 5', 'Floor 1 Hall'],
      tags: ['classroom'],
      openHours: null,
      description: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'p-canteen',
      name: 'Student Canteen',
      code: 'CANTEEN-01',
      type: PlaceType.CANTEEN,
      buildingId: null,
      floorId: null,
      nodeId: 'node-canteen',
      lat: 11.0830,
      lng: 77.0604,
      aliases: ['Cafeteria', 'Snack Bar'],
      tags: ['food', 'refreshment'],
      openHours: null,
      description: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'p-ailab',
      name: 'Artificial Intelligence & Robotics Lab',
      code: 'TECH-AI-LAB',
      type: PlaceType.LAB,
      buildingId: 'bldg-tech',
      floorId: 'fl-tech-1',
      nodeId: 'node-ai',
      lat: 11.0841,
      lng: 77.0615,
      aliases: ['AI Lab', 'Robotics Center'],
      tags: ['techpark', 'lab', 'research'],
      openHours: null,
      description: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  override async search(query?: string, type?: PlaceType, buildingId?: string, limit = 20) {
    let results = [...this.samplePlaces];

    if (type) {
      results = results.filter((p) => p.type === type);
    }
    if (buildingId) {
      results = results.filter((p) => p.buildingId === buildingId);
    }
    if (query && query.trim().length > 0) {
      const q = query.trim().toLowerCase();
      results = results.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.code?.toLowerCase().includes(q) ||
          p.aliases.some((al) => al.toLowerCase().includes(q)) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    return results.slice(0, limit);
  }

  override async findById(idOrCode: string) {
    return (
      this.samplePlaces.find((p) => p.id === idOrCode || p.code?.toLowerCase() === idOrCode.toLowerCase()) || null
    );
  }

  override async findAllBuildings() {
    return this.sampleBuildings;
  }

  override async findBuildingById(idOrCode: string) {
    return (
      this.sampleBuildings.find((b) => b.id === idOrCode || b.code?.toLowerCase() === idOrCode.toLowerCase()) || null
    );
  }

  override async findRoomsByFloor(buildingIdOrCode: string, level: number) {
    const building = await this.findBuildingById(buildingIdOrCode);
    if (!building) return { floor: null, rooms: [] };

    const floor = building.floors.find((f) => f.level === level) || null;
    if (!floor) return { floor: null, rooms: [] };

    const rooms = this.samplePlaces.filter((p) => p.buildingId === building.id && p.floorId === floor.id);
    return { floor, rooms };
  }

  override async getCategoryCounts(): Promise<Record<string, number>> {
    const counts: Record<string, number> = {};
    for (const p of this.samplePlaces) {
      counts[p.type] = (counts[p.type] || 0) + 1;
    }
    return counts;
  }
}

describe('Places & Buildings Module — Unit Tests', () => {
  const service = new PlacesService(new MockPlacesRepository());

  describe('1. Search & Filter Places', () => {
    it('should search places matching query string', async () => {
      const res = await service.searchPlaces('Lecture');
      expect(res.total).toBe(2);
      expect(res.places.every((p) => p.name.includes('Lecture'))).toBe(true);
    });

    it('should match places by alias (e.g. "Cafeteria" -> Canteen)', async () => {
      const res = await service.searchPlaces('Cafeteria');
      expect(res.total).toBe(1);
      expect(res.places[0]?.name).toBe('Student Canteen');
    });

    it('should match places by code with top ranking (e.g. "LH-05")', async () => {
      const res = await service.searchPlaces('LH-05');
      expect(res.total).toBeGreaterThanOrEqual(1);
      expect(res.places[0]?.code).toBe('LH-05');
    });

    it('should filter places by category type', async () => {
      const res = await service.searchPlaces(undefined, PlaceType.LAB);
      expect(res.total).toBe(1);
      expect(res.places[0]?.code).toBe('TECH-AI-LAB');
    });

    it('should filter places by building', async () => {
      const res = await service.searchPlaces(undefined, undefined, 'bldg-acad');
      expect(res.total).toBe(2);
      expect(res.places.every((p) => p.buildingId === 'bldg-acad')).toBe(true);
    });
  });

  describe('2. Lookup Place by ID or Code', () => {
    it('should retrieve place by code successfully', async () => {
      const place = await service.getPlaceById('LH-01');
      expect(place.id).toBe('p-lh01');
      expect(place.name).toBe('Lecture Hall 01');
    });

    it('should throw NotFoundError for non-existent place', async () => {
      await expect(service.getPlaceById('NON_EXISTENT_ROOM')).rejects.toThrow(NotFoundError);
    });
  });

  describe('3. Campus Buildings and Floor Rooms', () => {
    it('should return all campus buildings', async () => {
      const buildings = await service.getAllBuildings();
      expect(buildings.length).toBe(2);
      expect(buildings.map((b) => b.code)).toContain('ACAD');
      expect(buildings.map((b) => b.code)).toContain('TECH');
    });

    it('should return building details by code', async () => {
      const building = await service.getBuildingById('TECH');
      expect(building.name).toBe('Tech Park & Innovation Hub');
      expect(building.floors.length).toBe(1);
    });

    it('should return rooms on a specific floor level', async () => {
      const result = await service.getRoomsByBuildingAndFloor('ACAD', 0);
      expect(result.floor.level).toBe(0);
      expect(result.totalRooms).toBe(1);
      expect(result.rooms[0]?.code).toBe('LH-01');
    });

    it('should throw NotFoundError if floor level does not exist in building', async () => {
      await expect(service.getRoomsByBuildingAndFloor('ACAD', 99)).rejects.toThrow(NotFoundError);
    });
  });

  describe('4. Categories and Counts', () => {
    it('should return all categories with corresponding item counts', async () => {
      const categories = await service.getCategories();
      expect(categories.length).toBe(12);

      const classroomCat = categories.find((c) => c.type === PlaceType.CLASSROOM);
      expect(classroomCat?.count).toBe(2);

      const canteenCat = categories.find((c) => c.type === PlaceType.CANTEEN);
      expect(canteenCat?.count).toBe(1);
    });
  });

  describe('5. Zod Schema Validation', () => {
    it('should clamp limit parameter in search query', () => {
      const parsedHigh = searchPlacesQuerySchema.parse({ limit: '500' });
      expect(parsedHigh.limit).toBe(100);

      const parsedLow = searchPlacesQuerySchema.parse({ limit: '-5' });
      expect(parsedLow.limit).toBe(1);

      const parsedDefault = searchPlacesQuerySchema.parse({});
      expect(parsedDefault.limit).toBe(20);
    });

    it('should parse floor rooms parameters', () => {
      const valid = floorRoomsParamSchema.parse({ id: 'TECH', level: '1' });
      expect(valid.id).toBe('TECH');
      expect(valid.level).toBe(1);

      expect(() => floorRoomsParamSchema.parse({ id: 'TECH', level: 'abc' })).toThrow();
    });

    it('should validate place ID param', () => {
      expect(placeIdParamSchema.parse({ id: 'LH-01' }).id).toBe('LH-01');
      expect(() => placeIdParamSchema.parse({ id: '' })).toThrow();
    });
  });
});
