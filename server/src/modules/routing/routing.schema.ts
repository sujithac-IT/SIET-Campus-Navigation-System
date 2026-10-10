import { z } from 'zod';

export const routeRequestSchema = z.object({
  from: z.string().min(1, 'Origin location (from) is required'),
  to: z.string().min(1, 'Destination location (to) is required'),
  accessible: z.boolean().optional().default(false),
});

export type RouteRequestInput = z.infer<typeof routeRequestSchema>;
