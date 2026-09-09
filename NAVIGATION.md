# 🧭 Navigation Engine & Graph Topology

## Overview

The navigation engine calculates optimal indoor and outdoor pathways across the campus graph. It operates strictly under **2 seconds** for any origin-destination pair.

---

## Graph Model

- **Nodes ($V$)**: Represent physical points: building gates, corridor junctions, staircases, elevators, and room doorways.
- **Edges ($E$)**: Represent walkable paths between nodes. Each edge $e = (u, v)$ has:
  - $w_{distance}$: Distance in meters
  - $w_{accessible}$: Boolean flag indicating wheelchair / ramp suitability
  - $w_{type}$: Walkway, Stairs, Elevator, Corridor
  - $w_{closure}$: Temporary closure / maintenance block flag

---

## Pathfinding Algorithm (A* / Dijkstra)

Routing evaluates edge costs $C(e)$:

$$C(e) = w_{distance} \times \text{penalty}_{type} \times \text{weight}_{closure}$$

- **Avoid Stairs Preference**: Penalty multiplier of $\infty$ applied to `stairs` edges.
- **Avoid Elevators Preference**: Penalty multiplier applied to `elevator` edges.
- **Temporary Path Closure**: `closure_status = true` sets weight to $\infty$, forcing path recalculation around blocked corridors or construction zones.

---

## Turn-by-Turn Instruction Generator

Instructions translate path sequences into plain human language:
1. "Walk 80 meters from Main Gate to Central Library Block entrance."
2. "Take elevator to Floor 2 in Central Library Block."
3. "Turn right along corridor; LH-25 is 15 meters ahead on your left."
