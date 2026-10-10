import { GraphLoader, CampusNode } from './graph.loader.js';
import { AStarEngine } from './astar.engine.js';
import { InstructionsGenerator, RouteStep } from './instructions.generator.js';
import { placesRepository } from '../places/places.repository.js';
import { cache } from '../../core/redis.js';
import { NotFoundError } from '../../core/errors.js';
import { logger } from '../../core/logger.js';

export interface RouteResponseData {
  from: {
    id: string;
    name: string;
    lat: number;
    lng: number;
    floorLevel: number;
  };
  to: {
    id: string;
    name: string;
    lat: number;
    lng: number;
    floorLevel: number;
  };
  distance_m: number;
  eta_sec: number;
  accessible: boolean;
  polyline: [number, number][];
  steps: RouteStep[];
}

export class RoutingService {
  /**
   * Resolves arbitrary location input (UUID, Place code, Node ID, or "lat,lng") into a concrete CampusNode and label.
   */
  private async resolveLocation(
    input: string
  ): Promise<{ node: CampusNode; name: string }> {
    const graph = await GraphLoader.loadGraph();

    // 1. Direct GPS coordinates: "lat,lng" e.g. "11.0827,77.0607"
    if (input.includes(',')) {
      const parts = input.split(',').map((p) => parseFloat(p.trim()));
      if (parts.length === 2 && !isNaN(parts[0]!) && !isNaN(parts[1]!)) {
        const lat = parts[0]!;
        const lng = parts[1]!;
        const nearest = GraphLoader.findNearestNode(graph, lat, lng);
        if (nearest) {
          return { node: nearest, name: 'Current Location' };
        }
      }
    }

    // 2. Direct Node ID match
    if (graph.nodes.has(input)) {
      const node = graph.nodes.get(input)!;
      return { node, name: node.label || 'Waypoint' };
    }

    // 3. Place by ID or Code (e.g. "LH-05", "CANTEEN-01", "p-lh01")
    const place = await placesRepository.findById(input);
    if (place) {
      if (place.nodeId && graph.nodes.has(place.nodeId)) {
        return {
          node: graph.nodes.get(place.nodeId)!,
          name: place.name,
        };
      }

      // Snap to nearest node on the same floor level
      const nearest = GraphLoader.findNearestNode(
        graph,
        place.lat,
        place.lng,
        place.floorId
      );
      if (nearest) {
        return { node: nearest, name: place.name };
      }
    }

    // 4. Case-insensitive search across node labels
    const lower = input.toLowerCase();
    for (const node of graph.nodes.values()) {
      if (node.label && node.label.toLowerCase().includes(lower)) {
        return { node, name: node.label };
      }
    }

    throw new NotFoundError(`Could not resolve location for '${input}'`);
  }

  /**
   * Computes shortest turn-by-turn route between two campus waypoints with Redis caching.
   */
  async getRoute(
    fromInput: string,
    toInput: string,
    accessible = false
  ): Promise<RouteResponseData> {
    const cacheKey = `route:${fromInput.trim()}:${toInput.trim()}:${accessible}`;

    // 1. Check Redis Cache
    const cached = await cache.get(cacheKey);
    if (cached) {
      logger.debug(`Route cache hit: ${cacheKey}`);
      return JSON.parse(cached) as RouteResponseData;
    }

    // 2. Resolve origin and destination nodes
    const fromResolved = await this.resolveLocation(fromInput);
    const toResolved = await this.resolveLocation(toInput);

    const graph = await GraphLoader.loadGraph();

    // 3. Run A* Shortest Path
    const pathResult = AStarEngine.findPath(
      graph,
      fromResolved.node.id,
      toResolved.node.id,
      accessible
    );

    if (!pathResult) {
      throw new NotFoundError(
        `No walkable route found between '${fromResolved.name}' and '${toResolved.name}' (accessible=${accessible})`
      );
    }

    // 4. Generate turn instructions & landmark cues
    const steps = InstructionsGenerator.generateInstructions(
      pathResult.nodes,
      pathResult.edges,
      toResolved.name
    );

    // 5. Build Polyline coordinates: [[lat, lng], ...]
    const polyline: [number, number][] = pathResult.nodes.map((n) => [n.lat, n.lng]);

    // 6. Calculate ETA (1.2 m/s average walking speed + vertical pause)
    let etaSec = Math.round(pathResult.totalDistanceM / 1.2);
    for (const step of steps) {
      if (step.maneuver === 'stairs_up' || step.maneuver === 'stairs_down') {
        etaSec += 10;
      } else if (step.maneuver === 'lift') {
        etaSec += 25;
      }
    }

    const responseData: RouteResponseData = {
      from: {
        id: fromResolved.node.id,
        name: fromResolved.name,
        lat: fromResolved.node.lat,
        lng: fromResolved.node.lng,
        floorLevel: fromResolved.node.level,
      },
      to: {
        id: toResolved.node.id,
        name: toResolved.name,
        lat: toResolved.node.lat,
        lng: toResolved.node.lng,
        floorLevel: toResolved.node.level,
      },
      distance_m: pathResult.totalDistanceM,
      eta_sec: Math.max(etaSec, 15),
      accessible,
      polyline,
      steps,
    };

    // 7. Store in Redis cache (1 hour TTL)
    await cache.set(cacheKey, JSON.stringify(responseData), 3600);

    return responseData;
  }

  /**
   * Invalidates cached routes when map or topology changes.
   */
  async invalidateRouteCache(): Promise<void> {
    await cache.del('route:*');
    await GraphLoader.refreshGraph();
    logger.info('Route cache invalidated and graph refreshed');
  }
}

export const routingService = new RoutingService();
