import { PathNode, PathEdge, RouteResult } from '@/types';
import { GEOSPATIAL_PATH_NODES, GEOSPATIAL_PATH_EDGES } from '@/lib/data/sietGeoData';
import { INITIAL_PATH_NODES, INITIAL_PATH_EDGES } from '@/lib/data/seedData';

export type CoordinatePoint = {
  lat?: number;
  lng?: number;
  x?: number;
  y?: number;
};

/**
 * Calculates geodesic distance between two points in meters using Haversine formula
 * falls back to relative 2D percentage scaling if lat/lng are absent.
 */
export function calculateDistanceMeters(a: CoordinatePoint, b: CoordinatePoint): number {
  if (a.lat !== undefined && a.lng !== undefined && b.lat !== undefined && b.lng !== undefined) {
    const R = 6371000; // Earth radius in meters
    const dLat = ((b.lat - a.lat) * Math.PI) / 180;
    const dLng = ((b.lng - a.lng) * Math.PI) / 180;
    const lat1 = (a.lat * Math.PI) / 180;
    const lat2 = (b.lat * Math.PI) / 180;

    const sinDlat = Math.sin(dLat / 2);
    const sinDlng = Math.sin(dLng / 2);
    const h = sinDlat * sinDlat + Math.cos(lat1) * Math.cos(lat2) * sinDlng * sinDlng;
    return Math.round(2 * R * Math.asin(Math.sqrt(Math.min(1, h))));
  }

  // Fallback schematic grid: ~8 meters per 1% canvas coordinate
  const dx = (b.x ?? 0) - (a.x ?? 0);
  const dy = (b.y ?? 0) - (a.y ?? 0);
  return Math.round(Math.sqrt(dx * dx + dy * dy) * 8);
}

/**
 * Calculates compass bearing from point A to point B in degrees (0 - 360)
 */
export function calculateBearing(a: CoordinatePoint, b: CoordinatePoint): number {
  if (a.lat !== undefined && a.lng !== undefined && b.lat !== undefined && b.lng !== undefined) {
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const toDeg = (rad: number) => (rad * 180) / Math.PI;

    const phi1 = toRad(a.lat);
    const phi2 = toRad(b.lat);
    const deltaLambda = toRad(b.lng - a.lng);

    const y = Math.sin(deltaLambda) * Math.cos(phi2);
    const x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);

    let bearing = toDeg(Math.atan2(y, x));
    return (bearing + 360) % 360;
  }
  const dx = (b.x ?? 0) - (a.x ?? 0);
  const dy = (b.y ?? 0) - (a.y ?? 0);
  let angle = (Math.atan2(dx, -dy) * 180) / Math.PI;
  return (angle + 360) % 360;
}

/**
 * Snaps any coordinate to the closest graph node
 */
export function findNearestNode(
  coords: CoordinatePoint,
  nodes: PathNode[]
): PathNode | null {
  if (!nodes || nodes.length === 0) return null;

  let closest: PathNode | null = null;
  let minDistance = Infinity;

  for (const node of nodes) {
    const dist = calculateDistanceMeters(coords, {
      lat: node.lat,
      lng: node.lng,
      x: node.coordinates?.x,
      y: node.coordinates?.y
    });

    if (dist < minDistance) {
      minDistance = dist;
      closest = node;
    }
  }

  return closest;
}

/**
 * Computes shortest pedestrian path using Dijkstra's Algorithm
 * on verified campus geospatial network.
 */
export function findRoute(
  startCoordinates: CoordinatePoint,
  targetCoordinates: CoordinatePoint,
  nodes: PathNode[] = GEOSPATIAL_PATH_NODES.length > 0 ? GEOSPATIAL_PATH_NODES : INITIAL_PATH_NODES,
  edges: PathEdge[] = GEOSPATIAL_PATH_EDGES.length > 0 ? GEOSPATIAL_PATH_EDGES : INITIAL_PATH_EDGES,
  options?: { isAccessibleOnly?: boolean; walkingSpeedMetersPerMinute?: number }
): RouteResult {
  const speed = options?.walkingSpeedMetersPerMinute || 78; // Standard 1.3 m/s = ~78m/min

  // Filter edges for wheelchair/accessibility mode
  const validEdges = options?.isAccessibleOnly
    ? edges.filter((e) => e.isAccessible !== false && e.type !== 'stairs')
    : edges;

  // Snap start and target to nearest valid nodes
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

    // Neighbors along valid undirected edges
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

  // Path reconstruction
  const pathNodes: PathNode[] = [];
  let curr: string | null = targetNode.id;

  while (curr !== null) {
    const nodeObj = nodes.find((n) => n.id === curr);
    if (nodeObj) {
      pathNodes.unshift(nodeObj);
    }
    curr = previous[curr];
  }

  // Direct line fallback if graph disconnected
  if (pathNodes.length === 0 || pathNodes[0].id !== startNode.id) {
    const directDistance = calculateDistanceMeters(startCoordinates, targetCoordinates);
    const estimatedTime = Math.max(1, Math.ceil(directDistance / speed));

    return {
      nodes: [
        {
          id: 'start-direct',
          name: 'Starting Point',
          coordinates: { x: startCoordinates.x ?? 0, y: startCoordinates.y ?? 0 },
          lat: startCoordinates.lat,
          lng: startCoordinates.lng
        },
        {
          id: 'target-direct',
          name: 'Destination Point',
          coordinates: { x: targetCoordinates.x ?? 0, y: targetCoordinates.y ?? 0 },
          lat: targetCoordinates.lat,
          lng: targetCoordinates.lng
        }
      ],
      totalDistanceMeters: Math.max(15, directDistance),
      estimatedTimeMinutes: estimatedTime,
      instructions: [
        {
          step: 1,
          text: `Follow campus path directly towards destination (${Math.max(15, directDistance)} m)`,
          distanceMeters: Math.max(15, directDistance)
        }
      ]
    };
  }

  // Step-by-step turn guidance with distance, maneuver, and destination arrival
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

    const dist = edge ? edge.distanceMeters : calculateDistanceMeters(
      { lat: fromNode.lat, lng: fromNode.lng, x: fromNode.coordinates?.x, y: fromNode.coordinates?.y },
      { lat: toNode.lat, lng: toNode.lng, x: toNode.coordinates?.x, y: toNode.coordinates?.y }
    );
    totalDist += dist;

    // Calculate dynamic turn maneuver
    const bCurrent = calculateBearing(
      { lat: fromNode.lat, lng: fromNode.lng, x: fromNode.coordinates?.x, y: fromNode.coordinates?.y },
      { lat: toNode.lat, lng: toNode.lng, x: toNode.coordinates?.x, y: toNode.coordinates?.y }
    );

    let maneuver: RouteResult['instructions'][0]['maneuver'] = 'straight';
    let turnAction = 'Continue straight';

    if (i === 0) {
      turnAction = 'Head straight';
      maneuver = 'straight';
    } else {
      const prevNode = pathNodes[i - 1];
      const bPrev = calculateBearing(
        { lat: prevNode.lat, lng: prevNode.lng, x: prevNode.coordinates?.x, y: prevNode.coordinates?.y },
        { lat: fromNode.lat, lng: fromNode.lng, x: fromNode.coordinates?.x, y: fromNode.coordinates?.y }
      );
      const turnAngle = (bCurrent - bPrev + 540) % 360 - 180;

      if (turnAngle > 35 && turnAngle <= 65) {
        maneuver = 'slight_right';
        turnAction = 'Bear slightly right';
      } else if (turnAngle > 65 && turnAngle <= 125) {
        maneuver = 'right';
        turnAction = 'Turn right';
      } else if (turnAngle > 125) {
        maneuver = 'sharp_right';
        turnAction = 'Take sharp right';
      } else if (turnAngle < -35 && turnAngle >= -65) {
        maneuver = 'slight_left';
        turnAction = 'Bear slightly left';
      } else if (turnAngle < -65 && turnAngle >= -125) {
        maneuver = 'left';
        turnAction = 'Turn left';
      } else if (turnAngle < -125) {
        maneuver = 'sharp_left';
        turnAction = 'Take sharp left';
      } else {
        maneuver = 'straight';
        turnAction = 'Continue straight';
      }
    }

    let text = edge?.landmarkText
      ? (i > 0 && turnAction !== 'Continue straight'
          ? `${turnAction} and ${edge.landmarkText.charAt(0).toLowerCase() + edge.landmarkText.slice(1)}`
          : edge.landmarkText)
      : `${turnAction} towards ${toNode.name}`;

    let floorTransition;
    if (toNode.isStairsOrElevator && toNode.floor !== undefined) {
      const isElevator = edge?.type === 'elevator';
      maneuver = 'straight';
      text = `Take ${isElevator ? 'elevator' : 'stairs'} to Floor ${toNode.floor} in ${toNode.buildingId || 'Block'}`;
      floorTransition = {
        fromFloor: fromNode.floor || 0,
        toFloor: toNode.floor,
        type: (isElevator ? 'elevator' : 'stairs') as 'stairs' | 'elevator'
      };
    }

    instructions.push({
      step: i + 1,
      text,
      distanceMeters: dist,
      maneuver,
      landmark: edge?.landmarkText || undefined,
      targetNodeName: toNode.name,
      lat: toNode.lat,
      lng: toNode.lng,
      floorTransition
    });
  }

  // Final destination arrival step (Google Maps style)
  instructions.push({
    step: pathNodes.length,
    text: `Your destination has arrived: ${targetNode.name}`,
    distanceMeters: 0,
    maneuver: 'arrive',
    landmark: `Arrived at ${targetNode.name}`,
    targetNodeName: targetNode.name,
    lat: targetNode.lat,
    lng: targetNode.lng
  });

  const estimatedTimeMinutes = Math.max(1, Math.ceil(totalDist / speed));

  return {
    nodes: pathNodes,
    totalDistanceMeters: totalDist,
    estimatedTimeMinutes,
    instructions
  };
}
