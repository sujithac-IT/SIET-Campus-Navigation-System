import { z } from 'zod';
import { PlaceType } from '@prisma/client';

export const searchPlacesQuerySchema = z.object({
  q: z.string().trim().optional(),
  type: z.nativeEnum(PlaceType).optional(),
  buildingId: z.string().optional(),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? Math.min(Math.max(parseInt(val, 10) || 20, 1), 100) : 20)),
});

export const placeIdParamSchema = z.object({
  id: z.string().min(1, 'Place ID or Code is required'),
});

export const buildingIdParamSchema = z.object({
  id: z.string().min(1, 'Building ID or Code is required'),
});

export const floorRoomsParamSchema = z.object({
  id: z.string().min(1, 'Building ID or Code is required'),
  level: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val), { message: 'Floor level must be an integer' }),
});

export type SearchPlacesQuery = z.infer<typeof searchPlacesQuerySchema>;
