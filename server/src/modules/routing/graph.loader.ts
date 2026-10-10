import { NodeKind } from '@prisma/client';
import { prisma } from '../../core/database.js';
import { logger } from '../../core/logger.js';

export interface CampusNode {
  id: string;
  label: string | null;
  kind: NodeKind;
  lat: number;
  lng: number;
  x: number;
  y: number;
  floorId: string | null;
  level: number;
}

export interface CampusEdge {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  distanceM: number;
  isAccessible: boolean;
  isIndoor: boolean;
  oneWay: boolean;
  landmarkText: string | null;
}

export interface GraphNeighbor {
  toNode: CampusNode;
  edge: CampusEdge;
}

export interface CampusGraph {
  nodes: Map<string, CampusNode>;
  adjacency: Map<string, GraphNeighbor[]>;
}

// -----------------------------------------------------------------------------
// Realistic SIET Campus Walkable Fallback Topology (Outdoor + 3 Buildings)
// -----------------------------------------------------------------------------
const SIET_LAT = 11.0827;
const SIET_LNG = 77.0607;

const FALLBACK_NODES: CampusNode[] = [
  // Outdoor Gates & Arterials
  { id: 'node-gate-main', label: 'Main Entrance Gate', kind: NodeKind.GATE, lat: SIET_LAT, lng: SIET_LNG, x: 0, y: 0, floorId: null, level: 0 },
  { id: 'node-plaza', label: 'Central Campus Plaza', kind: NodeKind.JUNCTION, lat: SIET_LAT + 0.0004, lng: SIET_LNG + 0.0002, x: 20, y: 44, floorId: null, level: 0 },
  { id: 'node-canteen', label: 'Canteen Promenade', kind: NodeKind.OUTDOOR, lat: SIET_LAT + 0.0003, lng: SIET_LNG - 0.0003, x: -33, y: 33, floorId: null, level: 0 },
  { id: 'node-hostel-cross', label: 'Hostel Avenue Junction', kind: NodeKind.OUTDOOR, lat: SIET_LAT + 0.0009, lng: SIET_LNG - 0.0006, x: -66, y: 100, floorId: null, level: 0 },

  // Building Entrances
  { id: 'node-acad-entry', label: 'Academic Block Porch', kind: NodeKind.DOOR, lat: SIET_LAT + 0.0004, lng: SIET_LNG + 0.0004, x: 44, y: 44, floorId: 'f-acad-0', level: 0 },
  { id: 'node-lib-entry', label: 'Central Library Foyer', kind: NodeKind.DOOR, lat: SIET_LAT + 0.0007, lng: SIET_LNG - 0.0001, x: -11, y: 77, floorId: 'f-lib-0', level: 0 },
  { id: 'node-tech-entry', label: 'Tech Park Lobby Entrance', kind: NodeKind.DOOR, lat: SIET_LAT + 0.0011, lng: SIET_LNG + 0.0005, x: 55, y: 122, floorId: 'f-tech-0', level: 0 },

  // Academic Block Indoors
  { id: 'node-acad-f0', label: 'Acad Ground Floor Corridor', kind: NodeKind.JUNCTION, lat: SIET_LAT + 0.00048, lng: SIET_LNG + 0.00042, x: 46, y: 53, floorId: 'f-acad-0', level: 0 },
  { id: 'node-acad-stairs-f0', label: 'Acad Central Stairs (Ground)', kind: NodeKind.STAIRS, lat: SIET_LAT + 0.00045, lng: SIET_LNG + 0.00045, x: 49, y: 50, floorId: 'f-acad-0', level: 0 },
  { id: 'node-acad-stairs-f1', label: 'Acad Central Stairs (Floor 1)', kind: NodeKind.STAIRS, lat: SIET_LAT + 0.00045, lng: SIET_LNG + 0.00045, x: 49, y: 50, floorId: 'f-acad-1', level: 1 },
  { id: 'node-acad-f1', label: 'Acad 1st Floor Corridor East', kind: NodeKind.JUNCTION, lat: SIET_LAT + 0.00048, lng: SIET_LNG + 0.00048, x: 53, y: 53, floorId: 'f-acad-1', level: 1 },
  { id: 'node-acad-stairs-f2', label: 'Acad Central Stairs (Floor 2)', kind: NodeKind.STAIRS, lat: SIET_LAT + 0.00045, lng: SIET_LNG + 0.00045, x: 49, y: 50, floorId: 'f-acad-2', level: 2 },
  { id: 'node-acad-f2', label: 'Acad 2nd Floor Corridor West', kind: NodeKind.JUNCTION, lat: SIET_LAT + 0.00048, lng: SIET_LNG + 0.00042, x: 46, y: 53, floorId: 'f-acad-2', level: 2 },

  // Tech Park Indoors (with High-Speed Elevator)
  { id: 'node-tech-lift-f0', label: 'Tech Park Elevator (Ground)', kind: NodeKind.LIFT, lat: SIET_LAT + 0.00115, lng: SIET_LNG + 0.00055, x: 60, y: 127, floorId: 'f-tech-0', level: 0 },
  { id: 'node-tech-lift-f1', label: 'Tech Park Elevator (Floor 1)', kind: NodeKind.LIFT, lat: SIET_LAT + 0.00115, lng: SIET_LNG + 0.00055, x: 60, y: 127, floorId: 'f-tech-1', level: 1 },
  { id: 'node-tech-f1', label: 'Tech Park AI Wing Corridor', kind: NodeKind.JUNCTION, lat: SIET_LAT + 0.00118, lng: SIET_LNG + 0.00058, x: 64, y: 130, floorId: 'f-tech-1', level: 1 },
  { id: 'node-tech-lift-f2', label: 'Tech Park Elevator (Floor 2)', kind: NodeKind.LIFT, lat: SIET_LAT + 0.00115, lng: SIET_LNG + 0.00055, x: 60, y: 127, floorId: 'f-tech-2', level: 2 },
  { id: 'node-tech-f2', label: 'Tech Park Cloud Labs Corridor', kind: NodeKind.JUNCTION, lat: SIET_LAT + 0.00118, lng: SIET_LNG + 0.00058, x: 64, y: 130, floorId: 'f-tech-2', level: 2 },
];

const FALLBACK_EDGES: CampusEdge[] = [
  // Gate to Plaza
  { id: 'e-1', fromNodeId: 'node-gate-main', toNodeId: 'node-plaza', distanceM: 48, isAccessible: true, isIndoor: false, oneWay: false, landmarkText: 'Walk straight past the flagpole lawn' },
  { id: 'e-1r', fromNodeId: 'node-plaza', toNodeId: 'node-gate-main', distanceM: 48, isAccessible: true, isIndoor: false, oneWay: false, landmarkText: 'Head straight towards the Main Exit Gate' },

  // Plaza to Canteen & Hostels
  { id: 'e-2', fromNodeId: 'node-plaza', toNodeId: 'node-canteen', distanceM: 35, isAccessible: true, isIndoor: false, oneWay: false, landmarkText: 'Take the paved path toward the Canteen & Food Court' },
  { id: 'e-2r', fromNodeId: 'node-canteen', toNodeId: 'node-plaza', distanceM: 35, isAccessible: true, isIndoor: false, oneWay: false, landmarkText: 'Walk back to Central Plaza' },
  { id: 'e-3', fromNodeId: 'node-canteen', toNodeId: 'node-hostel-cross', distanceM: 45, isAccessible: true, isIndoor: false, oneWay: false, landmarkText: 'Follow the avenue north towards Hostels' },
  { id: 'e-3r', fromNodeId: 'node-hostel-cross', toNodeId: 'node-canteen', distanceM: 45, isAccessible: true, isIndoor: false, oneWay: false, landmarkText: 'Walk south to the Canteen' },

  // Plaza to Buildings
  { id: 'e-4', fromNodeId: 'node-plaza', toNodeId: 'node-acad-entry', distanceM: 25, isAccessible: true, isIndoor: false, oneWay: false, landmarkText: 'Turn right toward Academic Block porch' },
  { id: 'e-4r', fromNodeId: 'node-acad-entry', toNodeId: 'node-plaza', distanceM: 25, isAccessible: true, isIndoor: false, oneWay: false, landmarkText: 'Exit Academic Block toward Central Plaza' },
  { id: 'e-5', fromNodeId: 'node-plaza', toNodeId: 'node-lib-entry', distanceM: 40, isAccessible: true, isIndoor: false, oneWay: false, landmarkText: 'Follow walkway toward Central Library' },
  { id: 'e-5r', fromNodeId: 'node-lib-entry', toNodeId: 'node-plaza', distanceM: 40, isAccessible: true, isIndoor: false, oneWay: false, landmarkText: 'Head south toward Central Plaza' },
  { id: 'e-6', fromNodeId: 'node-plaza', toNodeId: 'node-tech-entry', distanceM: 85, isAccessible: true, isIndoor: false, oneWay: false, landmarkText: 'Walk past the fountain towards Tech Park' },
  { id: 'e-6r', fromNodeId: 'node-tech-entry', toNodeId: 'node-plaza', distanceM: 85, isAccessible: true, isIndoor: false, oneWay: false, landmarkText: 'Walk south toward Central Plaza' },

  // Academic Block Ground Floor
  { id: 'e-7', fromNodeId: 'node-acad-entry', toNodeId: 'node-acad-f0', distanceM: 12, isAccessible: true, isIndoor: true, oneWay: false, landmarkText: 'Enter lobby and pass the water cooler' },
  { id: 'e-7r', fromNodeId: 'node-acad-f0', toNodeId: 'node-acad-entry', distanceM: 12, isAccessible: true, isIndoor: true, oneWay: false, landmarkText: 'Walk towards main exit' },
  { id: 'e-8', fromNodeId: 'node-acad-f0', toNodeId: 'node-acad-stairs-f0', distanceM: 8, isAccessible: true, isIndoor: true, oneWay: false, landmarkText: 'Walk to the central staircase' },
  { id: 'e-8r', fromNodeId: 'node-acad-stairs-f0', toNodeId: 'node-acad-f0', distanceM: 8, isAccessible: true, isIndoor: true, oneWay: false, landmarkText: 'Walk into Ground Floor corridor' },

  // Academic Stairs (Non-accessible multi-floor)
  { id: 'e-stairs-0-1', fromNodeId: 'node-acad-stairs-f0', toNodeId: 'node-acad-stairs-f1', distanceM: 15, isAccessible: false, isIndoor: true, oneWay: false, landmarkText: 'Take the stairs to Floor 1' },
  { id: 'e-stairs-1-0', fromNodeId: 'node-acad-stairs-f1', toNodeId: 'node-acad-stairs-f0', distanceM: 15, isAccessible: false, isIndoor: true, oneWay: false, landmarkText: 'Take the stairs down to Ground Floor' },
  { id: 'e-stairs-1-2', fromNodeId: 'node-acad-stairs-f1', toNodeId: 'node-acad-stairs-f2', distanceM: 15, isAccessible: false, isIndoor: true, oneWay: false, landmarkText: 'Take the stairs to Floor 2' },
  { id: 'e-stairs-2-1', fromNodeId: 'node-acad-stairs-f2', toNodeId: 'node-acad-stairs-f1', distanceM: 15, isAccessible: false, isIndoor: true, oneWay: false, landmarkText: 'Take the stairs down to Floor 1' },

  // Academic Floor Corridors
  { id: 'e-9', fromNodeId: 'node-acad-stairs-f1', toNodeId: 'node-acad-f1', distanceM: 6, isAccessible: true, isIndoor: true, oneWay: false, landmarkText: 'Turn left into 1st Floor East corridor' },
  { id: 'e-9r', fromNodeId: 'node-acad-f1', toNodeId: 'node-acad-stairs-f1', distanceM: 6, isAccessible: true, isIndoor: true, oneWay: false, landmarkText: 'Walk to the staircase' },
  { id: 'e-10', fromNodeId: 'node-acad-stairs-f2', toNodeId: 'node-acad-f2', distanceM: 6, isAccessible: true, isIndoor: true, oneWay: false, landmarkText: 'Turn into 2nd Floor corridor' },
  { id: 'e-10r', fromNodeId: 'node-acad-f2', toNodeId: 'node-acad-stairs-f2', distanceM: 6, isAccessible: true, isIndoor: true, oneWay: false, landmarkText: 'Walk to the staircase' },

  // Tech Park Elevator & Lobby (Fully Accessible Multi-Floor)
  { id: 'e-11', fromNodeId: 'node-tech-entry', toNodeId: 'node-tech-lift-f0', distanceM: 10, isAccessible: true, isIndoor: true, oneWay: false, landmarkText: 'Walk to high-speed elevator directly ahead' },
  { id: 'e-11r', fromNodeId: 'node-tech-lift-f0', toNodeId: 'node-tech-entry', distanceM: 10, isAccessible: true, isIndoor: true, oneWay: false, landmarkText: 'Walk to main entrance' },

  { id: 'e-lift-0-1', fromNodeId: 'node-tech-lift-f0', toNodeId: 'node-tech-lift-f1', distanceM: 20, isAccessible: true, isIndoor: true, oneWay: false, landmarkText: 'Take the elevator to Floor 1' },
  { id: 'e-lift-1-0', fromNodeId: 'node-tech-lift-f1', toNodeId: 'node-tech-lift-f0', distanceM: 20, isAccessible: true, isIndoor: true, oneWay: false, landmarkText: 'Take the elevator down to Ground Floor' },
  { id: 'e-lift-1-2', fromNodeId: 'node-tech-lift-f1', toNodeId: 'node-tech-lift-f2', distanceM: 20, isAccessible: true, isIndoor: true, oneWay: false, landmarkText: 'Take the elevator to Floor 2' },
  { id: 'e-lift-2-1', fromNodeId: 'node-tech-lift-f2', toNodeId: 'node-tech-lift-f1', distanceM: 20, isAccessible: true, isIndoor: true, oneWay: false, landmarkText: 'Take the elevator down to Floor 1' },

  { id: 'e-12', fromNodeId: 'node-tech-lift-f1', toNodeId: 'node-tech-f1', distanceM: 8, isAccessible: true, isIndoor: true, oneWay: false, landmarkText: 'Step out into AI Excellence Wing' },
  { id: 'e-12r', fromNodeId: 'node-tech-f1', toNodeId: 'node-tech-lift-f1', distanceM: 8, isAccessible: true, isIndoor: true, oneWay: false, landmarkText: 'Walk to elevator' },
  { id: 'e-13', fromNodeId: 'node-tech-lift-f2', toNodeId: 'node-tech-f2', distanceM: 8, isAccessible: true, isIndoor: true, oneWay: false, landmarkText: 'Step out into Cloud Innovation Wing' },
  { id: 'e-13r', fromNodeId: 'node-tech-f2', toNodeId: 'node-tech-lift-f2', distanceM: 8, isAccessible: true, isIndoor: true, oneWay: false, landmarkText: 'Walk to elevator' },
];

let lastDbFailure = 0;
function shouldAttemptDb(): boolean {
  if (process.env['NODE_ENV'] === 'test') return false;
  if (Date.now() - lastDbFailure < 30000) return false;
  return true;
}
function markDbFailure() {
  lastDbFailure = Date.now();
}

export class GraphLoader {
  private static cachedGraph: CampusGraph | null = null;

  public static async loadGraph(forceRefresh = false): Promise<CampusGraph> {
    if (this.cachedGraph && !forceRefresh) {
      return this.cachedGraph;
    }

    const nodesMap = new Map<string, CampusNode>();
    const adjacency = new Map<string, GraphNeighbor[]>();

    if (shouldAttemptDb()) {
      try {
        const dbNodes = await prisma.navNode.findMany({
          include: { floor: true },
        });

        const dbEdges = await prisma.navEdge.findMany();

        if (dbNodes.length > 0 && dbEdges.length > 0) {
        for (const n of dbNodes) {
          nodesMap.set(n.id, {
            id: n.id,
            label: n.label,
            kind: n.kind,
            lat: n.lat,
            lng: n.lng,
            x: n.x,
            y: n.y,
            floorId: n.floorId,
            level: n.floor ? n.floor.level : 0,
          });
          adjacency.set(n.id, []);
        }

        for (const e of dbEdges) {
          const toNode = nodesMap.get(e.toNodeId);
          if (toNode && adjacency.has(e.fromNodeId)) {
            adjacency.get(e.fromNodeId)!.push({
              toNode,
              edge: {
                id: e.id,
                fromNodeId: e.fromNodeId,
                toNodeId: e.toNodeId,
                distanceM: e.distanceM,
                isAccessible: e.isAccessible,
                isIndoor: e.isIndoor,
                oneWay: e.oneWay,
                landmarkText: e.landmarkText,
              },
            });
          }
        }

        this.cachedGraph = { nodes: nodesMap, adjacency };
        logger.info(`Loaded campus navigation graph: ${nodesMap.size} nodes, ${dbEdges.length} edges`);
        return this.cachedGraph;
      }
    } catch {
      markDbFailure();
      logger.debug('Database unavailable. Loading built-in SIET campus topology graph.');
    }
  }

    // Fallback graph build
    for (const n of FALLBACK_NODES) {
      nodesMap.set(n.id, n);
      adjacency.set(n.id, []);
    }

    for (const e of FALLBACK_EDGES) {
      const toNode = nodesMap.get(e.toNodeId);
      if (toNode && adjacency.has(e.fromNodeId)) {
        adjacency.get(e.fromNodeId)!.push({ toNode, edge: e });
      }
    }

    this.cachedGraph = { nodes: nodesMap, adjacency };
    logger.info(`Initialized campus graph from fallback topology: ${nodesMap.size} nodes, ${FALLBACK_EDGES.length} edges`);
    return this.cachedGraph;
  }

  public static async refreshGraph(): Promise<CampusGraph> {
    return this.loadGraph(true);
  }

  public static findNearestNode(
    graph: CampusGraph,
    lat: number,
    lng: number,
    floorId?: string | null
  ): CampusNode | null {
    let bestNode: CampusNode | null = null;
    let minDistance = Infinity;

    for (const node of graph.nodes.values()) {
      if (floorId && node.floorId !== floorId) {
        continue;
      }

      // Euclidean approximation for close campus distances
      const dLat = (node.lat - lat) * 111320;
      const dLng = (node.lng - lng) * 111320 * Math.cos((lat * Math.PI) / 180);
      const dist = Math.sqrt(dLat * dLat + dLng * dLng);

      if (dist < minDistance) {
        minDistance = dist;
        bestNode = node;
      }
    }

    return bestNode;
  }
}
