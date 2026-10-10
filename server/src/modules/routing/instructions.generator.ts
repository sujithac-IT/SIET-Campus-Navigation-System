import { CampusNode, CampusEdge } from './graph.loader.js';

export type ManeuverType =
  | 'straight'
  | 'left'
  | 'right'
  | 'u_turn'
  | 'stairs_up'
  | 'stairs_down'
  | 'lift'
  | 'arrive';

export interface RouteStep {
  maneuver: ManeuverType;
  text: string;
  dist: number;
  floor: number;
  landmark?: string | null;
}

export class InstructionsGenerator {
  /**
   * Calculates initial compass bearing in degrees between two geographic points (-180 to +180).
   */
  public static calculateBearing(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number {
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const toDeg = (rad: number) => (rad * 180) / Math.PI;

    const phi1 = toRad(lat1);
    const phi2 = toRad(lat2);
    const deltaLambda = toRad(lng2 - lng1);

    const y = Math.sin(deltaLambda) * Math.cos(phi2);
    const x =
      Math.cos(phi1) * Math.sin(phi2) -
      Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);

    let bearing = toDeg(Math.atan2(y, x));
    // Normalize into -180 to +180
    if (bearing > 180) bearing -= 360;
    if (bearing < -180) bearing += 360;
    return bearing;
  }

  /**
   * Calculates signed deflection angle from vector AB to vector BC (-180 to +180).
   */
  public static calculateTurnAngle(
    bearingAB: number,
    bearingBC: number
  ): number {
    let delta = bearingBC - bearingAB;
    while (delta > 180) delta -= 360;
    while (delta < -180) delta += 360;
    return delta;
  }

  /**
   * Classifies turn angle into directional maneuver.
   */
  public static classifyTurn(angle: number): 'straight' | 'right' | 'left' | 'u_turn' {
    if (angle >= -20 && angle <= 20) {
      return 'straight';
    }
    if (angle > 20 && angle <= 135) {
      return 'right';
    }
    if (angle >= -135 && angle < -20) {
      return 'left';
    }
    return 'u_turn';
  }

  /**
   * Generates formatted turn-by-turn navigation instructions from ordered nodes and edges.
   */
  public static generateInstructions(
    nodes: CampusNode[],
    edges: CampusEdge[],
    destinationName?: string
  ): RouteStep[] {
    if (nodes.length === 0) return [];

    if (nodes.length === 1) {
      return [
        {
          maneuver: 'arrive',
          text: `You have arrived at ${destinationName || 'your destination'}.`,
          dist: 0,
          floor: nodes[0]!.level,
        },
      ];
    }

    const rawSteps: RouteStep[] = [];

    // First Segment
    const firstNode = nodes[0]!;
    const secondNode = nodes[1]!;
    const firstEdge = edges[0];
    const initialDist = firstEdge ? firstEdge.distanceM : 10;
    const initialLandmark = firstEdge?.landmarkText;

    let initialText = `Head toward ${secondNode.label || 'next waypoint'}`;
    if (initialLandmark) {
      initialText += ` (${initialLandmark})`;
    }

    rawSteps.push({
      maneuver: 'straight',
      text: initialText,
      dist: initialDist,
      floor: firstNode.level,
      landmark: initialLandmark,
    });

    // Intermediate Triplet Maneuvers (A -> B -> C)
    for (let i = 1; i < nodes.length - 1; i++) {
      const nodeA = nodes[i - 1]!;
      const nodeB = nodes[i]!;
      const nodeC = nodes[i + 1]!;
      const currentEdge = edges[i];
      const dist = currentEdge ? currentEdge.distanceM : 10;
      const landmark = currentEdge?.landmarkText;

      // 1. Multi-Floor Vertical Transitions (Stairs / Elevators)
      if (nodeB.level !== nodeC.level) {
        if (nodeB.kind === 'STAIRS' || nodeC.kind === 'STAIRS') {
          const isUp = nodeC.level > nodeB.level;
          rawSteps.push({
            maneuver: isUp ? 'stairs_up' : 'stairs_down',
            text: `Take the stairs ${isUp ? 'up' : 'down'} to Floor ${nodeC.level}`,
            dist,
            floor: nodeC.level,
            landmark,
          });
          continue;
        }

        if (nodeB.kind === 'LIFT' || nodeC.kind === 'LIFT') {
          rawSteps.push({
            maneuver: 'lift',
            text: `Take the elevator to Floor ${nodeC.level}`,
            dist,
            floor: nodeC.level,
            landmark,
          });
          continue;
        }
      }

      // 2. Horizontal Turns
      const bearingAB = this.calculateBearing(nodeA.lat, nodeA.lng, nodeB.lat, nodeB.lng);
      const bearingBC = this.calculateBearing(nodeB.lat, nodeB.lng, nodeC.lat, nodeC.lng);
      const angle = this.calculateTurnAngle(bearingAB, bearingBC);
      const maneuver = this.classifyTurn(angle);

      let text = '';
      if (maneuver === 'right') {
        text = landmark ? `Turn right ${landmark.toLowerCase()}` : `Turn right toward ${nodeC.label || 'next corridor'}`;
      } else if (maneuver === 'left') {
        text = landmark ? `Turn left ${landmark.toLowerCase()}` : `Turn left toward ${nodeC.label || 'next corridor'}`;
      } else if (maneuver === 'u_turn') {
        text = `Make a U-turn toward ${nodeC.label || 'path'}`;
      } else {
        text = landmark ? `Continue straight, ${landmark.toLowerCase()}` : `Continue straight toward ${nodeC.label || 'next section'}`;
      }

      rawSteps.push({
        maneuver,
        text,
        dist,
        floor: nodeB.level,
        landmark,
      });
    }

    // Merge consecutive straight segments on same floor
    const mergedSteps: RouteStep[] = [];
    for (const step of rawSteps) {
      const prev = mergedSteps[mergedSteps.length - 1];
      if (prev && prev.maneuver === 'straight' && step.maneuver === 'straight' && prev.floor === step.floor) {
        prev.dist += step.dist;
        if (step.landmark && !prev.text.includes(step.landmark)) {
          prev.text = `Walk ${Math.round(prev.dist)} m, ${step.landmark.toLowerCase()}`;
        } else {
          prev.text = `Walk ${Math.round(prev.dist)} m straight`;
        }
      } else {
        mergedSteps.push({ ...step });
      }
    }

    // Final Arrival Step
    const lastNode = nodes[nodes.length - 1]!;
    const secondLastNode = nodes[nodes.length - 2]!;
    const finalBearing = this.calculateBearing(
      secondLastNode.lat,
      secondLastNode.lng,
      lastNode.lat,
      lastNode.lng
    );

    // Destination side heuristic based on bearing
    const side = finalBearing > 45 ? 'right' : finalBearing < -45 ? 'left' : 'ahead';
    const destLabel = destinationName || lastNode.label || 'your destination';

    mergedSteps.push({
      maneuver: 'arrive',
      text: `Arrive at ${destLabel} on your ${side}.`,
      dist: 0,
      floor: lastNode.level,
    });

    return mergedSteps;
  }
}
