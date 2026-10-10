import { describe, it, expect, beforeEach } from 'vitest';
import { NodeKind } from '@prisma/client';
import { InstructionsGenerator } from '../../src/modules/routing/instructions.generator.js';
import { AStarEngine } from '../../src/modules/routing/astar.engine.js';
import { GraphLoader, CampusGraph, CampusNode, CampusEdge } from '../../src/modules/routing/graph.loader.js';
import { RoutingService } from '../../src/modules/routing/routing.service.js';
import { cache } from '../../src/core/redis.js';

describe('Routing Engine — Unit Test Suite', () => {
  describe('1. Bearing and Turn-Angle Classification', () => {
    it('should compute compass bearing accurately', () => {
      // Due North (lat increases)
      const bearingNorth = InstructionsGenerator.calculateBearing(11.0800, 77.0600, 11.0850, 77.0600);
      expect(Math.round(bearingNorth)).toBe(0);

      // Due East (lng increases)
      const bearingEast = InstructionsGenerator.calculateBearing(11.0800, 77.0600, 11.0800, 77.0650);
      expect(Math.round(bearingEast)).toBe(90);

      // Due South (lat decreases)
      const bearingSouth = InstructionsGenerator.calculateBearing(11.0850, 77.0600, 11.0800, 77.0600);
      expect(Math.round(bearingSouth)).toBe(180);

      // Due West (lng decreases)
      const bearingWest = InstructionsGenerator.calculateBearing(11.0800, 77.0650, 11.0800, 77.0600);
      expect(Math.round(bearingWest)).toBe(-90);
    });

    it('should classify angles into directional maneuvers correctly per spec', () => {
      // -20 to +20 degrees = straight
      expect(InstructionsGenerator.classifyTurn(0)).toBe('straight');
      expect(InstructionsGenerator.classifyTurn(15)).toBe('straight');
      expect(InstructionsGenerator.classifyTurn(-18)).toBe('straight');

      // 20 to 135 degrees = right
      expect(InstructionsGenerator.classifyTurn(45)).toBe('right');
      expect(InstructionsGenerator.classifyTurn(90)).toBe('right');
      expect(InstructionsGenerator.classifyTurn(135)).toBe('right');

      // -135 to -20 degrees = left
      expect(InstructionsGenerator.classifyTurn(-45)).toBe('left');
      expect(InstructionsGenerator.classifyTurn(-90)).toBe('left');
      expect(InstructionsGenerator.classifyTurn(-135)).toBe('left');

      // Beyond that = U-turn
      expect(InstructionsGenerator.classifyTurn(160)).toBe('u_turn');
      expect(InstructionsGenerator.classifyTurn(-170)).toBe('u_turn');
      expect(InstructionsGenerator.classifyTurn(180)).toBe('u_turn');
    });

    it('should calculate signed deflection angle between consecutive vectors', () => {
      // Heading North (0 deg), then turn East (90 deg) -> +90 deg right
      expect(InstructionsGenerator.calculateTurnAngle(0, 90)).toBe(90);

      // Heading East (90 deg), then turn North (0 deg) -> -90 deg left
      expect(InstructionsGenerator.calculateTurnAngle(90, 0)).toBe(-90);

      // Heading North (0 deg), then turn South (180 deg) -> 180 deg u-turn
      expect(InstructionsGenerator.calculateTurnAngle(0, 180)).toBe(180);
    });
  });

  describe('2. Turn-by-Turn Instruction Generator with Consecutive Merge', () => {
    it('should generate instructions and merge consecutive straight steps', () => {
      const mockNodes: CampusNode[] = [
        { id: 'n1', label: 'Start Point', kind: NodeKind.OUTDOOR, lat: 11.080, lng: 77.060, x: 0, y: 0, floorId: null, level: 0 },
        { id: 'n2', label: 'Mid Waypoint', kind: NodeKind.OUTDOOR, lat: 11.081, lng: 77.060, x: 0, y: 10, floorId: null, level: 0 },
        { id: 'n3', label: 'End Waypoint', kind: NodeKind.OUTDOOR, lat: 11.082, lng: 77.060, x: 0, y: 20, floorId: null, level: 0 },
      ];

      const mockEdges: CampusEdge[] = [
        { id: 'e1', fromNodeId: 'n1', toNodeId: 'n2', distanceM: 30, isAccessible: true, isIndoor: false, oneWay: false, landmarkText: 'Flagpole' },
        { id: 'e2', fromNodeId: 'n2', toNodeId: 'n3', distanceM: 30, isAccessible: true, isIndoor: false, oneWay: false, landmarkText: 'Fountain' },
      ];

      const steps = InstructionsGenerator.generateInstructions(mockNodes, mockEdges, 'Final Lab');

      // First two straight steps along due North should merge into one continuous straight walk
      expect(steps.length).toBe(2); // 1 merged straight step + 1 arrive step
      expect(steps[0]?.maneuver).toBe('straight');
      expect(steps[0]?.dist).toBe(60); // 30 + 30 merged
      expect(steps[1]?.maneuver).toBe('arrive');
      expect(steps[1]?.text).toContain('Final Lab');
    });

    it('should generate stairs and elevator maneuvers with destination side', () => {
      const mockNodes: CampusNode[] = [
        { id: 'n1', label: 'Corridor G', kind: NodeKind.JUNCTION, lat: 11.080, lng: 77.060, x: 0, y: 0, floorId: 'f0', level: 0 },
        { id: 'n2', label: 'Stairs Landing', kind: NodeKind.STAIRS, lat: 11.0801, lng: 77.060, x: 0, y: 10, floorId: 'f0', level: 0 },
        { id: 'n3', label: 'Floor 1 Landing', kind: NodeKind.STAIRS, lat: 11.0801, lng: 77.060, x: 0, y: 10, floorId: 'f1', level: 1 },
      ];

      const mockEdges: CampusEdge[] = [
        { id: 'e1', fromNodeId: 'n1', toNodeId: 'n2', distanceM: 10, isAccessible: true, isIndoor: true, oneWay: false, landmarkText: null },
        { id: 'e2', fromNodeId: 'n2', toNodeId: 'n3', distanceM: 15, isAccessible: false, isIndoor: true, oneWay: false, landmarkText: null },
      ];

      const steps = InstructionsGenerator.generateInstructions(mockNodes, mockEdges, 'Room 204');
      const stairsStep = steps.find((s) => s.maneuver === 'stairs_up');

      expect(stairsStep).toBeDefined();
      expect(stairsStep?.text).toContain('Floor 1');
    });
  });

  describe('3. A* 3D Shortest Path and Accessibility Filtering', () => {
    let testGraph: CampusGraph;

    beforeEach(() => {
      // Build a test graph with:
      // A (Ground) -> B (Stairs, Inaccessible) -> C (Floor 1) [Total distance: 20m]
      // A (Ground) -> D (Elevator, Accessible) -> E (Floor 1) -> C (Floor 1) [Total distance: 35m]
      const nodes = new Map<string, CampusNode>([
        ['A', { id: 'A', label: 'Lobby', kind: NodeKind.JUNCTION, lat: 11.0827, lng: 77.0607, x: 0, y: 0, floorId: 'f0', level: 0 }],
        ['B', { id: 'B', label: 'Stairs G', kind: NodeKind.STAIRS, lat: 11.0828, lng: 77.0607, x: 0, y: 10, floorId: 'f0', level: 0 }],
        ['C', { id: 'C', label: 'Dest F1', kind: NodeKind.DOOR, lat: 11.0828, lng: 77.0608, x: 10, y: 10, floorId: 'f1', level: 1 }],
        ['D', { id: 'D', label: 'Elevator G', kind: NodeKind.LIFT, lat: 11.0827, lng: 77.0609, x: 20, y: 0, floorId: 'f0', level: 0 }],
        ['E', { id: 'E', label: 'Elevator F1', kind: NodeKind.LIFT, lat: 11.0827, lng: 77.0609, x: 20, y: 0, floorId: 'f1', level: 1 }],
      ]);

      const adjacency = new Map<string, Array<{ toNode: CampusNode; edge: CampusEdge }>>([
        [
          'A',
          [
            { toNode: nodes.get('B')!, edge: { id: 'eAB', fromNodeId: 'A', toNodeId: 'B', distanceM: 10, isAccessible: true, isIndoor: true, oneWay: false, landmarkText: null } },
            { toNode: nodes.get('D')!, edge: { id: 'eAD', fromNodeId: 'A', toNodeId: 'D', distanceM: 20, isAccessible: true, isIndoor: true, oneWay: false, landmarkText: null } },
          ],
        ],
        [
          'B',
          [
            // Inaccessible stairs edge
            { toNode: nodes.get('C')!, edge: { id: 'eBC', fromNodeId: 'B', toNodeId: 'C', distanceM: 10, isAccessible: false, isIndoor: true, oneWay: false, landmarkText: 'Stairs' } },
          ],
        ],
        [
          'D',
          [
            // Accessible elevator edge
            { toNode: nodes.get('E')!, edge: { id: 'eDE', fromNodeId: 'D', toNodeId: 'E', distanceM: 5, isAccessible: true, isIndoor: true, oneWay: false, landmarkText: 'Lift' } },
          ],
        ],
        [
          'E',
          [
            { toNode: nodes.get('C')!, edge: { id: 'eEC', fromNodeId: 'E', toNodeId: 'C', distanceM: 10, isAccessible: true, isIndoor: true, oneWay: false, landmarkText: null } },
          ],
        ],
        ['C', []],
      ]);

      testGraph = { nodes, adjacency };
    });

    it('should choose shorter stairs route when accessible=false', () => {
      const result = AStarEngine.findPath(testGraph, 'A', 'C', false);
      expect(result).not.toBeNull();
      const nodeIds = result!.nodes.map((n) => n.id);
      expect(nodeIds).toEqual(['A', 'B', 'C']);
    });

    it('should bypass stairs and select accessible elevator route when accessible=true', () => {
      const result = AStarEngine.findPath(testGraph, 'A', 'C', true);
      expect(result).not.toBeNull();
      const nodeIds = result!.nodes.map((n) => n.id);
      expect(nodeIds).toEqual(['A', 'D', 'E', 'C']);
      expect(result!.edges.every((e) => e.isAccessible)).toBe(true);
    });

    it('should return null if no accessible path exists', () => {
      // Disconnect elevator
      testGraph.adjacency.set('D', []);
      const result = AStarEngine.findPath(testGraph, 'A', 'C', true);
      expect(result).toBeNull();
    });
  });

  describe('4. Full Routing Service with Caching', () => {
    const service = new RoutingService();

    beforeEach(async () => {
      await cache.clear();
    });

    it('should compute campus route from Main Gate to Canteen with polyline and steps', async () => {
      const route = await service.getRoute('GATE-01', 'CANTEEN-01', false);

      expect(route).toBeDefined();
      expect(route.distance_m).toBeGreaterThan(0);
      expect(route.eta_sec).toBeGreaterThan(0);
      expect(route.polyline.length).toBeGreaterThanOrEqual(3);
      expect(route.steps.length).toBeGreaterThanOrEqual(2);
      expect(route.steps[route.steps.length - 1]?.maneuver).toBe('arrive');
    });

    it('should cache computed route in Redis/memory and serve on subsequent request', async () => {
      const route1 = await service.getRoute('GATE-01', 'CANTEEN-01', false);
      const cached = await cache.get('route:GATE-01:CANTEEN-01:false');

      expect(cached).not.toBeNull();
      const parsed = JSON.parse(cached!);
      expect(parsed.distance_m).toBe(route1.distance_m);

      const route2 = await service.getRoute('GATE-01', 'CANTEEN-01', false);
      expect(route2.distance_m).toBe(route1.distance_m);
    });

    it('should clear cached routes on invalidateRouteCache()', async () => {
      await service.getRoute('GATE-01', 'CANTEEN-01', false);
      await service.invalidateRouteCache();

      const cached = await cache.get('route:GATE-01:CANTEEN-01:false');
      expect(cached).toBeNull();
    });
  });
});
