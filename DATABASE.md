# 🗄️ Database Documentation — PostgreSQL & PostGIS

Smart Campus Navigator utilizes PostgreSQL with the PostGIS extension for spatial querying, bounding polygons, geofencing, and room coordinate indexing.

---

## Entity Relationship Topology

```
Campus (1) ───< Building (N) ───< Floor (N) ───< Room (N) ───< Facility (1)
                                                     │
                                           NavigationNode (N) ───< NavigationEdge (N)
```

---

## Primary Tables & Schema Definitions

1. **`campuses`**: Stores overall campus bounding polygon and metadata.
2. **`buildings`**: Stores building code, category (`academic`, `admin`, `facility`, `medical`, `gate`), coordinates, and GIS footprint.
3. **`floors`**: Level numbers (0 = Ground, 1, 2, 3) and map floor plans.
4. **`rooms`**: Specific rooms (including `LH25`, `LH26`), capacities, amenities, accessibility metadata, and GIS points.
5. **`navigation_nodes`**: Graph nodes for entrances, intersections, corridors, stairs, and elevators.
6. **`navigation_edges`**: Edge weights, distances in meters, accessibility flags, and temporary closure flags.
7. **`users`**, **`student_profiles`**, **`faculty_profiles`**: RBAC user accounts, register numbers, employee IDs, and availability statuses.
8. **`timetable_sessions`**: Weekly class schedules mapping subjects to rooms and faculty.
9. **`events`**, **`announcements`**, **`notifications`**, **`emergency_alerts`**: Real-time broadcast and operational feeds.
10. **`qr_checkpoints`**: Stores QR payload checkpoint mappings for 1m indoor position recalibration.
11. **`audit_logs`**: System audit trails for room changes, user revocations, emergency dispatches, and schedule edits.

---

## Spatial Indexing Strategy

Spatial columns use GIST indexes for ultra-fast distance calculations:
```sql
CREATE INDEX idx_buildings_geom ON buildings USING GIST(geom);
CREATE INDEX idx_rooms_geom ON rooms USING GIST(geom);
```
