import { Request, Response, NextFunction } from 'express';
import { routingService } from './routing.service.js';
import { RouteRequestInput } from './routing.schema.js';

export class RoutingController {
  async computeRoute(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { from, to, accessible } = req.body as RouteRequestInput;
      const result = await routingService.getRoute(from, to, accessible);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  async invalidateCache(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await routingService.invalidateRouteCache();
      res.status(200).json({
        success: true,
        message: 'Route cache invalidated successfully',
      });
    } catch (err) {
      next(err);
    }
  }
}

export const routingController = new RoutingController();
