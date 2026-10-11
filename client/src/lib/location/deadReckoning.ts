/**
 * SIET Navigate — Indoor Dead Reckoning & Step Detection Engine
 * Integrates DeviceMotion (accelerometer peak detection) + DeviceOrientation (compass heading)
 * with fallback virtual step generator and polyline deviation calculation.
 */

export interface Vector2D {
  x: number;
  y: number;
}

export interface DeadReckoningState {
  currentCoords: Vector2D;
  headingDegrees: number; // 0 = North, 90 = East, 180 = South, 270 = West
  totalSteps: number;
  distanceTraveledMeters: number;
  isSimulating: boolean;
  driftMeters: number;
}

export type DeviationCallback = (distanceOffPathMeters: number) => void;

export class DeadReckoningEngine {
  private coords: Vector2D = { x: 15, y: 88 }; // Default Main Gate
  private heading: number = 0; // Degrees
  private totalSteps: number = 0;
  private stepLengthMeters: number = 0.72; // Average stride length
  private isListeningSensors: boolean = false;
  private isSimulating: boolean = false;
  private simulationInterval: NodeJS.Timeout | null = null;
  private stateListeners: Set<(state: DeadReckoningState) => void> = new Set();
  private deviationListeners: Set<DeviationCallback> = new Set();

  // Accelerometer peak detection state
  private lastAccelMagnitude: number = 9.8;
  private lastStepTime: number = 0;
  private readonly STEP_THRESHOLD = 11.8; // Peak acceleration threshold (~1.2g)
  private readonly STEP_REFRACTORY_MS = 320; // Minimum time between consecutive strides

  // SIET Campus coordinate scale: 100% width/height maps to ~450m x ~450m campus area
  private readonly CAMPUS_METERS_PER_PERCENT = 4.5;

  constructor() {
    this.handleMotion = this.handleMotion.bind(this);
    this.handleOrientation = this.handleOrientation.bind(this);
  }

  public subscribe(listener: (state: DeadReckoningState) => void): () => void {
    this.stateListeners.add(listener);
    listener(this.getState());
    return () => this.stateListeners.delete(listener);
  }

  public onDeviation(callback: DeviationCallback): () => void {
    this.deviationListeners.add(callback);
    return () => this.deviationListeners.delete(callback);
  }

  public getState(): DeadReckoningState {
    return {
      currentCoords: { ...this.coords },
      headingDegrees: Math.round(this.heading),
      totalSteps: this.totalSteps,
      distanceTraveledMeters: Math.round(this.totalSteps * this.stepLengthMeters * 10) / 10,
      isSimulating: this.isSimulating,
      driftMeters: 0,
    };
  }

  private notify() {
    const st = this.getState();
    this.stateListeners.forEach((l) => l(st));
  }

  /**
   * Recalibrate position directly (e.g. from GPS snap or QR checkpoint scan)
   */
  public calibratePosition(coords: Vector2D, headingDeg?: number) {
    this.coords = { ...coords };
    if (headingDeg !== undefined) {
      this.heading = headingDeg;
    }
    this.notify();
  }

  public setHeading(degrees: number) {
    this.heading = (degrees + 360) % 360;
    this.notify();
  }

  /**
   * Start listening to device hardware sensors
   */
  public startSensors(): boolean {
    if (typeof window === 'undefined') return false;

    if ('DeviceMotionEvent' in window && !this.isListeningSensors) {
      // iOS 13+ permission request
      const anyMotion = window.DeviceMotionEvent as unknown as {
        requestPermission?: () => Promise<'granted' | 'denied'>;
      };
      if (typeof anyMotion.requestPermission === 'function') {
        anyMotion
          .requestPermission()
          .then((res) => {
            if (res === 'granted') {
              this.bindSensorEvents();
            }
          })
          .catch(() => {});
      } else {
        this.bindSensorEvents();
      }
      return true;
    }
    return false;
  }

  private bindSensorEvents() {
    window.addEventListener('devicemotion', this.handleMotion);
    window.addEventListener('deviceorientation', this.handleOrientation);
    this.isListeningSensors = true;
  }

  public stopSensors() {
    if (typeof window !== 'undefined' && this.isListeningSensors) {
      window.removeEventListener('devicemotion', this.handleMotion);
      window.removeEventListener('deviceorientation', this.handleOrientation);
      this.isListeningSensors = false;
    }
  }

  private handleMotion(event: DeviceMotionEvent) {
    const acc = event.accelerationIncludingGravity;
    if (!acc || acc.x === null || acc.y === null || acc.z === null) return;

    const magnitude = Math.sqrt(acc.x * acc.x + acc.y * acc.y + acc.z * acc.z);
    const now = Date.now();

    // Step detection: peak detection above threshold with cooldown
    if (
      magnitude > this.STEP_THRESHOLD &&
      this.lastAccelMagnitude <= this.STEP_THRESHOLD &&
      now - this.lastStepTime > this.STEP_REFRACTORY_MS
    ) {
      this.lastStepTime = now;
      this.stepTaken();
    }

    this.lastAccelMagnitude = magnitude;
  }

  private handleOrientation(event: DeviceOrientationEvent) {
    // webkitCompassHeading on iOS, otherwise alpha on Android
    const iosCompass = (event as unknown as { webkitCompassHeading?: number }).webkitCompassHeading;
    if (typeof iosCompass === 'number') {
      this.heading = iosCompass;
    } else if (event.alpha !== null) {
      // Convert compass 360 - alpha
      this.heading = (360 - event.alpha) % 360;
    }
    this.notify();
  }

  /**
   * Advance position by 1 step in the current heading direction
   */
  public stepTaken(customDistanceMeters?: number) {
    const dist = customDistanceMeters ?? this.stepLengthMeters;
    const rad = (this.heading * Math.PI) / 180;

    // Heading: 0=North(dy < 0 in canvas), 90=East(dx > 0), 180=South(dy > 0), 270=West(dx < 0)
    const dxMeters = dist * Math.sin(rad);
    const dyMeters = -dist * Math.cos(rad);

    const deltaXPercent = dxMeters / this.CAMPUS_METERS_PER_PERCENT;
    const deltaYPercent = dyMeters / this.CAMPUS_METERS_PER_PERCENT;

    this.coords = {
      x: Math.max(2, Math.min(98, Math.round((this.coords.x + deltaXPercent) * 100) / 100)),
      y: Math.max(2, Math.min(98, Math.round((this.coords.y + deltaYPercent) * 100) / 100)),
    };
    this.totalSteps += 1;
    this.notify();
  }

  /**
   * Continuous walk simulation along path or heading (useful for desktop test/demo)
   */
  public startSimulation(speedMetersPerSec = 1.25) {
    if (this.isSimulating) return;

    this.isSimulating = true;
    const intervalMs = 250;
    const distancePerTick = speedMetersPerSec * (intervalMs / 1000);

    this.simulationInterval = setInterval(() => {
      this.stepTaken(distancePerTick);
    }, intervalMs);

    this.notify();
  }

  public stopSimulation() {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }
    this.isSimulating = false;
    this.notify();
  }

  public toggleSimulation(): boolean {
    if (this.isSimulating) {
      this.stopSimulation();
      return false;
    } else {
      this.startSimulation();
      return true;
    }
  }

  /**
   * Intentionally simulate off-route drift deviation to test automatic rerouting
   */
  public simulateDeviation(driftMeters = 22) {
    // Shift perpendicular to current heading by driftMeters
    const perpHeading = (this.heading + 90) % 360;
    const rad = (perpHeading * Math.PI) / 180;

    const dxMeters = driftMeters * Math.sin(rad);
    const dyMeters = -driftMeters * Math.cos(rad);

    this.coords = {
      x: Math.max(2, Math.min(98, this.coords.x + dxMeters / this.CAMPUS_METERS_PER_PERCENT)),
      y: Math.max(2, Math.min(98, this.coords.y + dyMeters / this.CAMPUS_METERS_PER_PERCENT)),
    };
    this.notify();

    // Trigger deviation listeners immediately
    this.deviationListeners.forEach((cb) => cb(driftMeters));
  }

  /**
   * Calculate shortest perpendicular distance in meters from point to polyline
   */
  public calculateDistanceToPolyline(polyline: Vector2D[]): number {
    if (polyline.length === 0) return 0;
    if (polyline.length === 1) {
      return this.distanceBetweenMeters(this.coords, polyline[0]);
    }

    let minDistanceMeters = Infinity;

    for (let i = 0; i < polyline.length - 1; i++) {
      const p1 = polyline[i];
      const p2 = polyline[i + 1];
      const dist = this.distToSegmentMeters(this.coords, p1, p2);
      if (dist < minDistanceMeters) {
        minDistanceMeters = dist;
      }
    }

    return Math.round(minDistanceMeters * 10) / 10;
  }

  private distanceBetweenMeters(p1: Vector2D, p2: Vector2D): number {
    const dx = (p1.x - p2.x) * this.CAMPUS_METERS_PER_PERCENT;
    const dy = (p1.y - p2.y) * this.CAMPUS_METERS_PER_PERCENT;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private distToSegmentMeters(p: Vector2D, v: Vector2D, w: Vector2D): number {
    const l2 = Math.pow((v.x - w.x) * this.CAMPUS_METERS_PER_PERCENT, 2) +
               Math.pow((v.y - w.y) * this.CAMPUS_METERS_PER_PERCENT, 2);
    if (l2 === 0) return this.distanceBetweenMeters(p, v);

    // Consider the line extending the segment, parameterized as v + t (w - v).
    // We find projection of point p onto the line.
    const t = Math.max(0, Math.min(1,
      (((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) *
        Math.pow(this.CAMPUS_METERS_PER_PERCENT, 2)) / l2
    ));

    const projection: Vector2D = {
      x: v.x + t * (w.x - v.x),
      y: v.y + t * (w.y - v.y),
    };

    return this.distanceBetweenMeters(p, projection);
  }
}

export const deadReckoning = new DeadReckoningEngine();
