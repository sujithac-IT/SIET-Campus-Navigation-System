# 📍 Positioning Architecture & Adapters

## Strategy

The navigation system avoids hard-coupling to GPS signal alone, recognizing that indoor satellite accuracy degrades inside multi-story concrete academic blocks.

---

## `PositionProvider` Interface

All position sources implement a unified interface:

```typescript
export interface IPositionProvider {
  id: string;
  name: string;
  type: 'gps' | 'qr_checkpoint' | 'ble_beacon' | 'wifi_rtt' | 'simulated';
  isAvailable(): boolean;
  startTracking(callback: (pos: PositionState) => void): boolean;
  stopTracking(): void;
  getCurrentPosition(): Promise<PositionState>;
}
```

---

## Position Providers

1. **`GPSPositionProvider`**: Uses HTML5 Geolocation API. Maps latitude/longitude to campus bounding canvas percentages. Precision: 5-15m.
2. **`QRPositionProvider`**: Decodes standard campus QR code payloads placed on pillars, doors, and stair landings. Precision: **1m**.
3. **`BLEBeaconProvider`**: Adapter for Bluetooth Low Energy iBeacon / EddyStone trilateration.
4. **`WiFiRTTProvider`**: Adapter for Wi-Fi Round Trip Time fine ranging (IEEE 802.11mc).

---

## QR Checkpoint Payload Format

Public, non-sensitive JSON payload encoded into physical QR stickers:

```json
{
  "type": "campus_position_checkpoint",
  "campusId": "campus_siet_01",
  "buildingId": "b-library",
  "floorId": 2,
  "nodeId": "n-lib-f2-lh25",
  "roomCode": "LH25",
  "coordinates": { "x": 35, "y": 55 },
  "version": 1
}
```
