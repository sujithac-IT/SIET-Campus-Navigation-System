export interface LocationState {
  coordinates: { x: number; y: number };
  buildingId?: string;
  floor?: number;
  accuracyMeters: number;
  source: 'gps' | 'ble_beacon' | 'wifi' | 'qr_checkpoint' | 'simulated';
  timestamp: string;
}

export class CampusLocationTracker {
  private watchId: number | null = null;
  private currentCoords: { x: number; y: number } = { x: 15, y: 88 }; // Main Gate default
  private listeners: ((location: LocationState) => void)[] = [];
  private isTracking = false;

  public startTracking(callback: (location: LocationState) => void): boolean {
    this.listeners.push(callback);
    this.isTracking = true;

    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      this.watchId = navigator.geolocation.watchPosition(
        (position) => {
          // Map real GPS lat/long to campus percentage relative bounding box
          // SIET Campus bounds simulation
          const newCoords = this.mapGPSCoordinatesToCampus(
            position.coords.latitude,
            position.coords.longitude
          );

          const locState: LocationState = {
            coordinates: newCoords,
            accuracyMeters: Math.round(position.coords.accuracy),
            source: 'gps',
            timestamp: new Date().toLocaleTimeString()
          };

          this.currentCoords = newCoords;
          this.notifyListeners(locState);
        },
        (error) => {
          console.warn('GPS position unavailable, using campus positioning engine', error);
          this.emitSimulatedMovement();
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
      );
    } else {
      this.emitSimulatedMovement();
    }

    return true;
  }

  public stopTracking() {
    if (this.watchId !== null && typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    this.isTracking = false;
    this.listeners = [];
  }

  public updateManualLocation(
    coords: { x: number; y: number },
    buildingId?: string,
    floor?: number,
    source: LocationState['source'] = 'simulated'
  ) {
    this.currentCoords = coords;
    const locState: LocationState = {
      coordinates: coords,
      buildingId,
      floor,
      accuracyMeters: source === 'qr_checkpoint' ? 1 : 5,
      source,
      timestamp: new Date().toLocaleTimeString()
    };
    this.notifyListeners(locState);
  }

  private notifyListeners(location: LocationState) {
    this.listeners.forEach((listener) => listener(location));
  }

  private mapGPSCoordinatesToCampus(lat: number, lng: number): { x: number; y: number } {
    // Map bounding box algorithm for SIET campus region
    // Converts lat/long relative offsets to percentages 0-100
    const CAMPUS_MIN_LAT = 11.0120;
    const CAMPUS_MAX_LAT = 11.0250;
    const CAMPUS_MIN_LNG = 76.9500;
    const CAMPUS_MAX_LNG = 76.9650;

    const x = Math.max(5, Math.min(95, ((lng - CAMPUS_MIN_LNG) / (CAMPUS_MAX_LNG - CAMPUS_MIN_LNG)) * 100));
    const y = Math.max(5, Math.min(95, (1 - (lat - CAMPUS_MIN_LAT) / (CAMPUS_MAX_LAT - CAMPUS_MIN_LAT)) * 100));

    return { x: Math.round(x), y: Math.round(y) };
  }

  private emitSimulatedMovement() {
    const locState: LocationState = {
      coordinates: this.currentCoords,
      accuracyMeters: 3,
      source: 'simulated',
      timestamp: new Date().toLocaleTimeString()
    };
    this.notifyListeners(locState);
  }
}

export const locationTracker = new CampusLocationTracker();
