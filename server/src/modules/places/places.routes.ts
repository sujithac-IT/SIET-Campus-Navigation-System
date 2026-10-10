import { Router } from 'express';
import { placesController } from './places.controller.js';
import { searchPlacesQuerySchema, placeIdParamSchema } from './places.schema.js';
import { validate } from '../../core/middleware/validate.middleware.js';

const router = Router();

// GET /api/v1/places/search?q=&type=&buildingId=&limit=
router.get('/search', validate({ query: searchPlacesQuerySchema }), (req, res, next) => {
  placesController.search(req, res, next);
});

// GET /api/v1/places/categories
router.get('/categories', (req, res, next) => {
  placesController.getCategories(req, res, next);
});

// GET /api/v1/places/:id
router.get('/:id', validate({ params: placeIdParamSchema }), (req, res, next) => {
  placesController.getById(req, res, next);
});

export const placesRoutes = router;
