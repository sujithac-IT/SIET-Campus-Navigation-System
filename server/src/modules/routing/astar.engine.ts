import { CampusGraph, CampusNode, CampusEdge } from './graph.loader.js';

export interface RoutePathResult {
  nodes: CampusNode[];
  edges: CampusEdge[];
  totalDistanceM: number;
}

export class AStarEngine {
  private static FLOOR_HEIGHT_M = 3.8;
  private static STAIRS_PENALTY_M = 15.0;
  private static LIFT_PENALTY_M = 20.0;

  /**
   * 3D Euclidean distance heuristic taking floor elevation difference into account.
   */
  public static calculateHeuristic(a: CampusNode, b: CampusNode): number {
    const latMid = ((a.lat + b.lat) / 2) * (Math.PI / 180);
    const dx = (b.lng - a.lng) * 111320 * Math.cos(latMid);
    const dy = (b.lat - a.lat) * 111320;
    const dz = (b.level - a.level) * this.FLOOR_HEIGHT_M;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  /**
   * Finds optimal shortest 3D path using A* search.
   */
  public static findPath(
    graph: CampusGraph,
    startNodeId: string,
    targetNodeId: string,
    accessible = false
  ): RoutePathResult | null {
    const startNode = graph.nodes.get(startNodeId);
    const targetNode = graph.nodes.get(targetNodeId);

    if (!startNode || !targetNode) {
      return null;
    }

    if (startNodeId === targetNodeId) {
      return {
        nodes: [startNode],
        edges: [],
        totalDistanceM: 0,
      };
    }

    const openSet = new Set<string>([startNodeId]);
    const cameFrom = new Map<string, { fromNodeId: string; edge: CampusEdge }>();

    const gScore = new Map<string, number>();
    gScore.set(startNodeId, 0);

    const fScore = new Map<string, number>();
    fScore.set(startNodeId, this.calculateHeuristic(startNode, targetNode));

    while (openSet.size > 0) {
      // Find node in openSet with lowest fScore
      let currentId: string | null = null;
      let lowestF = Infinity;

      for (const nodeId of openSet) {
        const score = fScore.get(nodeId) ?? Infinity;
        if (score < lowestF) {
          lowestF = score;
          currentId = nodeId;
        }
      }

      if (!currentId) break;

      // Check if target reached
      if (currentId === targetNodeId) {
        return this.reconstructPath(graph, cameFrom, currentId, gScore.get(currentId) ?? 0);
      }

      openSet.delete(currentId);
      const currentNode = graph.nodes.get(currentId)!;
      const neighbors = graph.adjacency.get(currentId) || [];

      for (const neighbor of neighbors) {
        const edge = neighbor.edge;
        const neighborNode = neighbor.toNode;

        // Skip non-accessible pathways if wheelchair/accessible mode is active
        if (accessible && !edge.isAccessible) {
          continue;
        }

        // Calculate transition cost with vertical penalties
        let edgeCost = edge.distanceM;
        if (currentNode.level !== neighborNode.level) {
          if (currentNode.kind === 'STAIRS' || neighborNode.kind === 'STAIRS') {
            edgeCost += this.STAIRS_PENALTY_M;
          } else if (currentNode.kind === 'LIFT' || neighborNode.kind === 'LIFT') {
            edgeCost += this.LIFT_PENALTY_M;
          }
        }

        const tentativeG = (gScore.get(currentId) ?? Infinity) + edgeCost;

        if (tentativeG < (gScore.get(neighborNode.id) ?? Infinity)) {
          cameFrom.set(neighborNode.id, { fromNodeId: currentId, edge });
          gScore.set(neighborNode.id, tentativeG);
          const h = this.calculateHeuristic(neighborNode, targetNode);
          fScore.set(neighborNode.id, tentativeG + h);
          openSet.add(neighborNode.id);
        }
      }
    }

    return null; // Path not found
  }

  private static reconstructPath(
    graph: CampusGraph,
    cameFrom: Map<string, { fromNodeId: string; edge: CampusEdge }>,
    currentId: string,
    totalDistanceM: number
  ): RoutePathResult {
    const nodes: CampusNode[] = [];
    const edges: CampusEdge[] = [];
    let curr = currentId;

    while (cameFrom.has(curr)) {
      const node = graph.nodes.get(curr);
      if (node) nodes.unshift(node);
      const link = cameFrom.get(curr)!;
      edges.unshift(link.edge);
      curr = link.fromNodeId;
    }

    const startNode = graph.nodes.get(curr);
    if (startNode) nodes.unshift(startNode);

    // Recalculate true physical distance without vertical artificial heuristic penalties
    const truePhysicalDistance = edges.reduce((sum, e) => sum + e.distanceM, 0);

    return {
      nodes,
      edges,
      totalDistanceM: Math.round(truePhysicalDistance || totalDistanceM),
    };
  }
}
