import { Request, Response, NextFunction } from 'express';
import { placesService } from './places.service.js';
import { SearchPlacesQuery } from './places.schema.js';

export class PlacesController {
  async search(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query as unknown as SearchPlacesQuery;
      const result = await placesService.searchPlaces(
        query.q,
        query.type,
        query.buildingId,
        query.limit
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const idOrCode = req.params['id'] as string;
      const place = await placesService.getPlaceById(idOrCode);

      res.status(200).json({
        success: true,
        data: { place },
      });
    } catch (err) {
      next(err);
    }
  }

  async getCategories(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await placesService.getCategories();

      res.status(200).json({
        success: true,
        data: { categories },
      });
    } catch (err) {
      next(err);
    }
  }

  async getAllBuildings(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const buildings = await placesService.getAllBuildings();

      res.status(200).json({
        success: true,
        data: {
          total: buildings.length,
          buildings,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  async getBuildingById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const idOrCode = req.params['id'] as string;
      const building = await placesService.getBuildingById(idOrCode);

      res.status(200).json({
        success: true,
        data: { building },
      });
    } catch (err) {
      next(err);
    }
  }

  async getFloorRooms(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const buildingIdOrCode = req.params['id'] as string;
      const level = parseInt(req.params['level'] as string, 10);

      const result = await placesService.getRoomsByBuildingAndFloor(buildingIdOrCode, level);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
}

export const placesController = new PlacesController();
