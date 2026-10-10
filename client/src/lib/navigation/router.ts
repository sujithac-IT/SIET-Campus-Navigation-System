import { PathNode, PathEdge, RouteResult } from '@/types';
import { INITIAL_PATH_NODES, INITIAL_PATH_EDGES } from '@/lib/data/seedData';

export function findRoute(
  startCoordinates: { x: number; y: number },
  targetCoordinates: { x: number; y: number },
  nodes: PathNode[] = INITIAL_PATH_NODES,
  edges: PathEdge[] = INITIAL_PATH_EDGES,
  options?: { isAccessibleOnly?: boolean }
): RouteResult {
  // Filter edges if accessibility mode is enabled
  const validEdges = options?.isAccessibleOnly
    ? edges.filter((e) => e.isAccessible !== false && e.type !== 'stairs')
    : edges;

  // Find nearest starting node
  const startNode = findNearestNode(startCoordinates, nodes);
  const targetNode = findNearestNode(targetCoordinates, nodes);

  if (!startNode || !targetNode) {
    return {
      nodes: [],
      totalDistanceMeters: 0,
      estimatedTimeMinutes: 0,
      instructions: []
    };
  }

  // Dijkstra's Shortest Path Algorithm
  const distances: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  const unvisited = new Set<string>();

  nodes.forEach((node) => {
    distances[node.id] = Infinity;
    previous[node.id] = null;
    unvisited.add(node.id);
  });

  distances[startNode.id] = 0;

  while (unvisited.size > 0) {
    // Find node with minimum distance in unvisited
    let currentNodeId: string | null = null;
    let minDistance = Infinity;

    unvisited.forEach((nodeId) => {
      if (distances[nodeId] < minDistance) {
        minDistance = distances[nodeId];
        currentNodeId = nodeId;
      }
    });

    if (!currentNodeId || currentNodeId === targetNode.id || minDistance === Infinity) {
      break;
    }

    unvisited.delete(currentNodeId);

    // Find all neighbors of currentNode
    const connectedEdges = validEdges.filter(
      (e) => e.from === currentNodeId || e.to === currentNodeId
    );

    for (const edge of connectedEdges) {
      const neighborId = edge.from === currentNodeId ? edge.to : edge.from;
      if (!unvisited.has(neighborId)) continue;

      const alt = distances[currentNodeId] + edge.distanceMeters;
      if (alt < distances[neighborId]) {
        distances[neighborId] = alt;
        previous[neighborId] = currentNodeId;
      }
    }
  }

  // Reconstruct path
  const pathNodes: PathNode[] = [];
  let curr: string | null = targetNode.id;

  while (curr !== null) {
    const nodeObj = nodes.find((n) => n.id === curr);
    if (nodeObj) {
      pathNodes.unshift(nodeObj);
    }
    curr = previous[curr];
  }

  // If path doesn't start at startNode, fallback to direct line
  if (pathNodes.length === 0 || pathNodes[0].id !== startNode.id) {
    const directDistance = Math.round(
      Math.sqrt(
        Math.pow(targetCoordinates.x - startCoordinates.x, 2) +
          Math.pow(targetCoordinates.y - startCoordinates.y, 2)
      ) * 8
    );

    return {
      nodes: [
        { id: 'start-direct', name: 'Current Location', coordinates: startCoordinates },
        { id: 'target-direct', name: 'Destination', coordinates: targetCoordinates }
      ],
      totalDistanceMeters: Math.max(20, directDistance),
      estimatedTimeMinutes: Math.ceil(Math.max(20, directDistance) / 75), // Average walking speed ~75m/min
      instructions: [
        {
          step: 1,
          text: `Head directly towards destination`,
          distanceMeters: Math.max(20, directDistance)
        }
      ]
    };
  }

  // Compute total distance & steps
  let totalDist = 0;
  const instructions: RouteResult['instructions'] = [];

  for (let i = 0; i < pathNodes.length - 1; i++) {
    const fromNode = pathNodes[i];
    const toNode = pathNodes[i + 1];

    const edge = edges.find(
      (e) =>
        (e.from === fromNode.id && e.to === toNode.id) ||
        (e.from === toNode.id && e.to === fromNode.id)
    );

    const dist = edge ? edge.distanceMeters : 40;
    totalDist += dist;

    let text = `Walk from ${fromNode.name} to ${toNode.name}`;
    let floorTransition;

    if (toNode.isStairsOrElevator && toNode.floor !== undefined) {
      text = `Take ${edge?.type === 'elevator' ? 'elevator' : 'stairs'} to Floor ${toNode.floor} in ${toNode.buildingId ? 'building' : 'block'}`;
      floorTransition = {
        fromFloor: fromNode.floor || 0,
        toFloor: toNode.floor,
        type: (edge?.type === 'elevator' ? 'elevator' : 'stairs') as 'stairs' | 'elevator'
      };
    }

    instructions.push({
      step: i + 1,
      text,
      distanceMeters: dist,
      floorTransition
    });
  }

  const estimatedTimeMinutes = Math.max(1, Math.ceil(totalDist / 75));

  return {
    nodes: pathNodes,
    totalDistanceMeters: totalDist,
    estimatedTimeMinutes,
    instructions
  };
}

function findNearestNode(
  coords: { x: number; y: number },
  nodes: PathNode[]
): PathNode | null {
  if (nodes.length === 0) return null;

  let closest: PathNode | null = null;
  let minSqDist = Infinity;

  for (const node of nodes) {
    const sqDist =
      Math.pow(node.coordinates.x - coords.x, 2) +
      Math.pow(node.coordinates.y - coords.y, 2);
    if (sqDist < minSqDist) {
      minSqDist = sqDist;
      closest = node;
    }
  }

  return closest;
}
