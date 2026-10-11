export interface Coordinates {
  x: number; // percentage (0-100) or longitude
  y: number; // percentage (0-100) or latitude
}

export interface PositionState {
  coordinates: Coordinates;
  buildingId?: string;
  floor?: number;
  nodeId?: string;
  accuracyMeters: number;
  providerType: 'gps' | 'qr_checkpoint' | 'ble_beacon' | 'wifi_rtt' | 'simulated';
  timestamp: string;
}

export interface IPositionProvider {
  id: string;
  name: string;
  type: PositionState['providerType'];
  isAvailable(): boolean;
  startTracking(callback: (position: PositionState) => void): boolean;
  stopTracking(): void;
  getCurrentPosition(): Promise<PositionState>;
}

export interface QRPayload {
  type: 'campus_position_checkpoint';
  campusId: string;
  buildingId: string;
  floorId: number;
  nodeId: string;
  roomCode?: string;
  coordinates: Coordinates;
  version: number;
}

export class GPSPositionProvider implements IPositionProvider {
  public id = 'gps-provider';
  public name = 'GPS Location Provider';
  public type: PositionState['providerType'] = 'gps';
  private watchId: number | null = null;

  public isAvailable(): boolean {
    return typeof window !== 'undefined' && 'geolocation' in navigator;
  }

  public startTracking(callback: (position: PositionState) => void): boolean {
    if (!this.isAvailable()) return false;

    this.watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const coords = this.mapGPSToCampusCoords(pos.coords.latitude, pos.coords.longitude);
        callback({
          coordinates: coords,
          accuracyMeters: Math.round(pos.coords.accuracy),
          providerType: 'gps',
          timestamp: new Date().toLocaleTimeString()
        });
      },
      (err) => {
        console.warn('GPS tracking unavailable:', err.message);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    );
    return true;
  }

  public stopTracking(): void {
    if (this.watchId !== null && typeof window !== 'undefined') {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  public getCurrentPosition(): Promise<PositionState> {
    return new Promise((resolve, reject) => {
      if (!this.isAvailable()) {
        reject(new Error('GPS geolocation not available'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({
            coordinates: this.mapGPSToCampusCoords(pos.coords.latitude, pos.coords.longitude),
            accuracyMeters: Math.round(pos.coords.accuracy),
            providerType: 'gps',
            timestamp: new Date().toLocaleTimeString()
          });
        },
        (err) => reject(err)
      );
    });
  }

  private mapGPSToCampusCoords(lat: number, lng: number): Coordinates {
    const MIN_LAT = 11.0120;
    const MAX_LAT = 11.0250;
    const MIN_LNG = 76.9500;
    const MAX_LNG = 76.9650;

    const x = Math.max(5, Math.min(95, ((lng - MIN_LNG) / (MAX_LNG - MIN_LNG)) * 100));
    const y = Math.max(5, Math.min(95, (1 - (lat - MIN_LAT) / (MAX_LAT - MIN_LAT)) * 100));

    return { x: Math.round(x), y: Math.round(y) };
  }
}

export class QRPositionProvider implements IPositionProvider {
  public id = 'qr-provider';
  public name = 'QR Checkpoint Provider';
  public type: PositionState['providerType'] = 'qr_checkpoint';
  private callback: ((position: PositionState) => void) | null = null;

  public isAvailable(): boolean {
    return true;
  }

  public startTracking(callback: (position: PositionState) => void): boolean {
    this.callback = callback;
    return true;
  }

  public stopTracking(): void {
    this.callback = null;
  }

  public parseAndScan(payloadString: string): PositionState | null {
    try {
      // 1. Try URL scheme format (e.g. sietnav://pos?node=... or https://...)
      if (payloadString.startsWith('sietnav://') || payloadString.startsWith('http')) {
        const urlObj = new URL(payloadString.replace('sietnav://', 'https://siet.ac.in/'));
        const nodeId = urlObj.searchParams.get('node') || 'n-gate-main';
        const buildingId = urlObj.searchParams.get('building') || 'b-gate';
        const floor = parseInt(urlObj.searchParams.get('floor') || '0', 10);
        const x = parseFloat(urlObj.searchParams.get('x') || '15');
        const y = parseFloat(urlObj.searchParams.get('y') || '88');

        const position: PositionState = {
          coordinates: { x, y },
          buildingId,
          floor,
          nodeId,
          accuracyMeters: 1,
          providerType: 'qr_checkpoint',
          timestamp: new Date().toLocaleTimeString(),
        };
        if (this.callback) this.callback(position);
        return position;
      }

      // 2. Try JSON payload format
      const data: QRPayload = JSON.parse(payloadString);
      if (data.type === 'campus_position_checkpoint') {
        const position: PositionState = {
          coordinates: data.coordinates,
          buildingId: data.buildingId,
          floor: data.floorId,
          nodeId: data.nodeId,
          accuracyMeters: 1,
          providerType: 'qr_checkpoint',
          timestamp: new Date().toLocaleTimeString(),
        };

        if (this.callback) {
          this.callback(position);
        }
        return position;
      }
    } catch {
      // Fallback: check if plain ID matches checkpoint mapping
      const mapping: Record<string, { x: number; y: number; building: string; floor: number }> = {
        'n-gate-main': { x: 15, y: 88, building: 'b-gate', floor: 0 },
        'SIET-QR-GATE': { x: 15, y: 88, building: 'b-gate', floor: 0 },
        'SIET-QR-LH25': { x: 35, y: 55, building: 'b-lib', floor: 2 },
        'SIET-QR-TECHPARK': { x: 75, y: 25, building: 'b-techpark', floor: 1 },
        'SIET-QR-CANTEEN': { x: 45, y: 75, building: 'b-canteen', floor: 0 },
      };
      const found = mapping[payloadString];
      if (found) {
        const pos: PositionState = {
          coordinates: { x: found.x, y: found.y },
          buildingId: found.building,
          floor: found.floor,
          nodeId: payloadString,
          accuracyMeters: 1,
          providerType: 'qr_checkpoint',
          timestamp: new Date().toLocaleTimeString(),
        };
        if (this.callback) this.callback(pos);
        return pos;
      }
    }
    return null;
  }

  public getCurrentPosition(): Promise<PositionState> {
    return Promise.reject(new Error('QR positioning requires scanning a physical checkpoint'));
  }
}

export class BLEBeaconProvider implements IPositionProvider {
  public id = 'ble-provider';
  public name = 'BLE Indoor Beacon Provider (IoT Ready)';
  public type: PositionState['providerType'] = 'ble_beacon';

  public isAvailable(): boolean {
    return typeof navigator !== 'undefined' && 'bluetooth' in navigator;
  }

  public startTracking(): boolean {
    console.info('BLE Beacon Provider initialized. Awaiting beacon scan trigger.');
    return true;
  }

  public stopTracking(): void {}

  public getCurrentPosition(): Promise<PositionState> {
    return Promise.reject(new Error('BLE Beacon Provider scanning requires hardware integration'));
  }
}

export class WiFiRTTProvider implements IPositionProvider {
  public id = 'wifi-rtt-provider';
  public name = 'Wi-Fi RTT Fine Ranging Provider';
  public type: PositionState['providerType'] = 'wifi_rtt';

  public isAvailable(): boolean {
    return false;
  }

  public startTracking(): boolean {
    return false;
  }

  public stopTracking(): void {}

  public getCurrentPosition(): Promise<PositionState> {
    return Promise.reject(new Error('Wi-Fi RTT fine ranging adapter not active on host device'));
  }
}
