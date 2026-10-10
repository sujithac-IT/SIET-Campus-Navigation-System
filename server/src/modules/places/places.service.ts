import { PlaceType } from '@prisma/client';
import { placesRepository, PlacesRepository, PlaceWithDetails } from './places.repository.js';
import { NotFoundError } from '../../core/errors.js';

export interface CategoryInfo {
  type: PlaceType;
  label: string;
  count: number;
}

const CATEGORY_LABELS: Record<PlaceType, string> = {
  CLASSROOM: 'Classrooms',
  LAB: 'Laboratories',
  TECHPARK: 'Tech Park Classrooms',
  OFFICE: 'Administrative Offices',
  LIBRARY: 'Libraries',
  WASHROOM: 'Washrooms',
  CANTEEN: 'Canteen',
  FOOD_COURT: 'Food Court',
  HOSTEL_BOYS: 'Boys Hostel',
  HOSTEL_GIRLS: 'Girls Hostel',
  GATE: 'Gates & Entrances',
  PARKING: 'Parking Areas',
};

export class PlacesService {
  constructor(private repo: PlacesRepository = placesRepository) {}

  async searchPlaces(
    query?: string,
    type?: PlaceType,
    buildingId?: string,
    limit = 20
  ): Promise<{ total: number; query?: string; places: PlaceWithDetails[] }> {
    const places = await this.repo.search(query, type, buildingId, limit);

    // If query provided, sort by relevance score
    if (query && query.trim().length > 0) {
      const q = query.trim().toLowerCase();
      places.sort((a, b) => {
        const aCodeMatch = a.code?.toLowerCase() === q ? 100 : 0;
        const bCodeMatch = b.code?.toLowerCase() === q ? 100 : 0;
        const aNamePrefix = a.name.toLowerCase().startsWith(q) ? 50 : 0;
        const bNamePrefix = b.name.toLowerCase().startsWith(q) ? 50 : 0;
        const aAliasMatch = a.aliases.some((al) => al.toLowerCase().includes(q)) ? 25 : 0;
        const bAliasMatch = b.aliases.some((al) => al.toLowerCase().includes(q)) ? 25 : 0;

        const scoreA = aCodeMatch + aNamePrefix + aAliasMatch;
        const scoreB = bCodeMatch + bNamePrefix + bAliasMatch;
        return scoreB - scoreA;
      });
    }

    return {
      total: places.length,
      ...(query ? { query } : {}),
      places,
    };
  }

  async getPlaceById(idOrCode: string): Promise<PlaceWithDetails> {
    const place = await this.repo.findById(idOrCode);
    if (!place) {
      throw new NotFoundError(`Place with ID or code '${idOrCode}' not found`);
    }
    return place;
  }

  async getAllBuildings() {
    return this.repo.findAllBuildings();
  }

  async getBuildingById(idOrCode: string) {
    const building = await this.repo.findBuildingById(idOrCode);
    if (!building) {
      throw new NotFoundError(`Building with ID or code '${idOrCode}' not found`);
    }
    return building;
  }

  async getRoomsByBuildingAndFloor(buildingIdOrCode: string, level: number) {
    const building = await this.repo.findBuildingById(buildingIdOrCode);
    if (!building) {
      throw new NotFoundError(`Building with ID or code '${buildingIdOrCode}' not found`);
    }

    const { floor, rooms } = await this.repo.findRoomsByFloor(building.id, level);
    if (!floor) {
      throw new NotFoundError(
        `Floor level ${level} not found in building '${building.name}' (${building.code})`
      );
    }

    return {
      building: {
        id: building.id,
        name: building.name,
        code: building.code,
      },
      floor: {
        id: floor.id,
        level: floor.level,
        name: floor.name,
        planImageUrl: floor.planImageUrl,
        scale: floor.scale,
      },
      totalRooms: rooms.length,
      rooms,
    };
  }

  async getCategories(): Promise<CategoryInfo[]> {
    const counts = await this.repo.getCategoryCounts();
    return (Object.keys(CATEGORY_LABELS) as PlaceType[]).map((type) => ({
      type,
      label: CATEGORY_LABELS[type],
      count: counts[type] || 0,
    }));
  }
}

export const placesService = new PlacesService();
