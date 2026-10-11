import { describe, it, expect } from 'vitest';

describe('Navigation Mode, Positioning & Dead Reckoning — Unit Test Suite', () => {
  describe('1. Indoor Dead Reckoning Coordinate Projection', () => {
    const METERS_PER_PERCENT = 4.5;
    const stride = 0.75; // meters

    function projectStep(
      start: { x: number; y: number },
      headingDeg: number,
      distMeters: number
    ): { x: number; y: number } {
      const rad = (headingDeg * Math.PI) / 180;
      const dxM = distMeters * Math.sin(rad);
      const dyM = -distMeters * Math.cos(rad);
      return {
        x: Math.round((start.x + dxM / METERS_PER_PERCENT) * 100) / 100,
        y: Math.round((start.y + dyM / METERS_PER_PERCENT) * 100) / 100,
      };
    }

    it('should project northward movement correctly (heading 0° decreases Y)', () => {
      const start = { x: 50, y: 50 };
      const next = projectStep(start, 0, 4.5); // 4.5m = 1%
      expect(next.x).toBe(50);
      expect(next.y).toBe(49);
    });

    it('should project eastward movement correctly (heading 90° increases X)', () => {
      const start = { x: 50, y: 50 };
      const next = projectStep(start, 90, 4.5); // 4.5m = 1%
      expect(next.x).toBe(51);
      expect(next.y).toBe(50);
    });

    it('should project southward movement correctly (heading 180° increases Y)', () => {
      const start = { x: 50, y: 50 };
      const next = projectStep(start, 180, 4.5);
      expect(next.x).toBe(50);
      expect(next.y).toBe(51);
    });

    it('should project westward movement correctly (heading 270° decreases X)', () => {
      const start = { x: 50, y: 50 };
      const next = projectStep(start, 270, 4.5);
      expect(next.x).toBe(49);
      expect(next.y).toBe(50);
    });
  });

  describe('2. Path Deviation & Reroute Threshold Calculation', () => {
    const METERS_PER_PERCENT = 4.5;

    function distToSegmentMeters(
      p: { x: number; y: number },
      v: { x: number; y: number },
      w: { x: number; y: number }
    ): number {
      const l2 =
        Math.pow((v.x - w.x) * METERS_PER_PERCENT, 2) +
        Math.pow((v.y - w.y) * METERS_PER_PERCENT, 2);
      if (l2 === 0) {
        const dx = (p.x - v.x) * METERS_PER_PERCENT;
        const dy = (p.y - v.y) * METERS_PER_PERCENT;
        return Math.sqrt(dx * dx + dy * dy);
      }
      const t = Math.max(
        0,
        Math.min(
          1,
          (((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) *
            Math.pow(METERS_PER_PERCENT, 2)) /
            l2
        )
      );
      const proj = {
        x: v.x + t * (w.x - v.x),
        y: v.y + t * (w.y - v.y),
      };
      const dx = (p.x - proj.x) * METERS_PER_PERCENT;
      const dy = (p.y - proj.y) * METERS_PER_PERCENT;
      return Math.round(Math.sqrt(dx * dx + dy * dy) * 10) / 10;
    }

    it('should calculate 0m deviation when user is on route segment', () => {
      const v = { x: 10, y: 10 };
      const w = { x: 10, y: 30 };
      const user = { x: 10, y: 20 }; // Exact midpoint
      const dist = distToSegmentMeters(user, v, w);
      expect(dist).toBe(0);
    });

    it('should detect when user is within acceptable threshold (<= 15m)', () => {
      const v = { x: 10, y: 10 };
      const w = { x: 10, y: 30 };
      // User is shifted by 2 units in X = 2 * 4.5m = 9m
      const user = { x: 12, y: 20 };
      const dist = distToSegmentMeters(user, v, w);
      expect(dist).toBe(9);
      expect(dist <= 15).toBe(true); // Should NOT trigger reroute
    });

    it('should trigger reroute flag when user deviates beyond 15m (> 15m)', () => {
      const v = { x: 10, y: 10 };
      const w = { x: 10, y: 30 };
      // User is shifted by 5 units in X = 5 * 4.5m = 22.5m
      const user = { x: 15, y: 20 };
      const dist = distToSegmentMeters(user, v, w);
      expect(dist).toBe(22.5);
      expect(dist > 15).toBe(true); // Must trigger auto-reroute
    });
  });

  describe('3. QR Positioning Checkpoint Parser', () => {
    function parseQRCheckpoint(raw: string) {
      if (raw.startsWith('sietnav://')) {
        const u = new URL(raw.replace('sietnav://', 'https://siet.ac.in/'));
        return {
          nodeId: u.searchParams.get('node'),
          buildingId: u.searchParams.get('building'),
          floor: parseInt(u.searchParams.get('floor') || '0', 10),
          coordinates: {
            x: parseFloat(u.searchParams.get('x') || '0'),
            y: parseFloat(u.searchParams.get('y') || '0'),
          },
        };
      }
      const data = JSON.parse(raw);
      return {
        nodeId: data.nodeId,
        buildingId: data.buildingId,
        floor: data.floorId,
        coordinates: data.coordinates,
      };
    }

    it('should parse URL schema sietnav://pos properly', () => {
      const url = 'sietnav://pos?node=n-tech-f1&building=b-techpark&floor=1&x=75&y=25';
      const parsed = parseQRCheckpoint(url);
      expect(parsed.nodeId).toBe('n-tech-f1');
      expect(parsed.buildingId).toBe('b-techpark');
      expect(parsed.floor).toBe(1);
      expect(parsed.coordinates).toEqual({ x: 75, y: 25 });
    });

    it('should parse JSON checkpoint format accurately', () => {
      const payload = JSON.stringify({
        type: 'campus_position_checkpoint',
        campusId: 'campus_siet_01',
        buildingId: 'b-library',
        floorId: 2,
        nodeId: 'n-lib-f2-lh25',
        roomCode: 'LH25',
        coordinates: { x: 35, y: 55 },
        version: 1,
      });
      const parsed = parseQRCheckpoint(payload);
      expect(parsed.nodeId).toBe('n-lib-f2-lh25');
      expect(parsed.buildingId).toBe('b-library');
      expect(parsed.floor).toBe(2);
      expect(parsed.coordinates).toEqual({ x: 35, y: 55 });
    });
  });

  describe('4. Turn Voice Announcement Logic', () => {
    function determineVoiceCue(distMeters: number): 'now' | 'approach_30m' | 'none' {
      if (distMeters <= 10) return 'now';
      if (distMeters <= 30) return 'approach_30m';
      return 'none';
    }

    it('should cue imminent turn announcement at <= 10m', () => {
      expect(determineVoiceCue(8)).toBe('now');
      expect(determineVoiceCue(10)).toBe('now');
    });

    it('should cue advance warning at <= 30m', () => {
      expect(determineVoiceCue(25)).toBe('approach_30m');
      expect(determineVoiceCue(30)).toBe('approach_30m');
    });

    it('should remain quiet when turn is far away (> 30m)', () => {
      expect(determineVoiceCue(55)).toBe('none');
    });
  });
});
