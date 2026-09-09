# 🌐 API v1 Documentation — Smart Campus Navigator

All API routes are versioned under `/api/v1/...`.

---

## Endpoints Summary

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/navigation/routes` | Calculates A* shortest route (< 2s) | No |
| `GET` | `/api/v1/search?q={query}` | Unified multi-entity search | No |
| `GET` | `/api/v1/facilities?category={cat}`| Campus facilities directory | No |
| `GET` | `/api/v1/events` | Published campus events | No |
| `GET` | `/api/v1/announcements` | Official announcements feed | No |
| `POST` | `/api/v1/assistant` | Grounded RAG AI query endpoint | No (Public) / Yes (Personal) |
| `POST` | `/api/v1/auth/login` | Authenticate user with cookie | No |
| `POST` | `/api/v1/auth/register` | Register user with email validation | No |
| `POST` | `/api/v1/admin/classroom-change`| Reassign room & broadcast alert | Yes (Admin/Faculty) |
| `GET` | `/api/v1/audit` | Fetch security and data audit logs | Yes (Admin) |

---

## Endpoint Details

### 1. Route Calculation
`POST /api/v1/navigation/routes`

**Request Body:**
```json
{
  "origin": { "x": 15, "y": 88 },
  "destination": { "x": 35, "y": 55 },
  "preferences": {
    "avoidStairs": false,
    "avoidElevators": false
  }
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "calculationTimeMs": 12,
  "routeId": "route-1787985400000",
  "data": {
    "nodes": [...],
    "totalDistanceMeters": 250,
    "estimatedTimeMinutes": 4,
    "instructions": [
      {
        "step": 1,
        "text": "Walk from Main Gate to Central Library Entrance",
        "distanceMeters": 180
      },
      {
        "step": 2,
        "text": "Take elevator to Floor 2 in Central Library Block",
        "distanceMeters": 20,
        "floorTransition": { "fromFloor": 0, "toFloor": 2, "type": "elevator" }
      }
    ]
  }
}
```
