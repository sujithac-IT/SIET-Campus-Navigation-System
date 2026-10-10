import { Router } from 'express';
import { placesController } from './places.controller.js';
import { buildingIdParamSchema, floorRoomsParamSchema } from './places.schema.js';
import { validate } from '../../core/middleware/validate.middleware.js';

const router = Router();

// GET /api/v1/buildings
router.get('/', (req, res, next) => {
  placesController.getAllBuildings(req, res, next);
});

// GET /api/v1/buildings/:id
router.get('/:id', validate({ params: buildingIdParamSchema }), (req, res, next) => {
  placesController.getBuildingById(req, res, next);
});

// GET /api/v1/buildings/:id/floors/:level/rooms
router.get('/:id/floors/:level/rooms', validate({ params: floorRoomsParamSchema }), (req, res, next) => {
  placesController.getFloorRooms(req, res, next);
});

export const buildingsRoutes = router;
