import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app.js';
import { AssistantToolsExecutor } from '../../src/modules/assistant/assistant.tools.js';
import { assistantService } from '../../src/modules/assistant/assistant.service.js';

describe('AI Voice Assistant — Unit Test Suite', () => {
  describe('1. Assistant Tools Executor', () => {
    it('should search places on campus via search_place tool', async () => {
      const result = await AssistantToolsExecutor.executeSearchPlace('library');

      expect(result).toBeDefined();
      expect(result.found).toBe(true);
      expect(result.places.length).toBeGreaterThan(0);
      const top = result.places[0]!;
      expect(
        top.name.toLowerCase().includes('reading') ||
        top.category === 'LIBRARY' ||
        top.building.toLowerCase().includes('library')
      ).toBe(true);
    });

    it('should compute navigation route via get_route tool', async () => {
      const result = await AssistantToolsExecutor.executeGetRoute('GATE-01', 'CANTEEN-01');

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.distance_m).toBeGreaterThan(0);
      expect(result.eta_sec).toBeGreaterThan(0);
      expect(result.summary).toBeDefined();
    });

    it('should retrieve student next class via get_next_class tool', async () => {
      const result = await AssistantToolsExecutor.executeGetNextClass('714022104045', 'CSE', 3, 'A');

      expect(result).toBeDefined();
      expect(result.found).toBe(true);
      expect(result.subjectName).toBeDefined();
      expect(result.placeName).toBeDefined();
    });

    it('should retrieve student exam hall allocation via get_exam_hall tool', async () => {
      const result = await AssistantToolsExecutor.executeGetExamHall('714021104012');

      expect(result).toBeDefined();
      expect(result.found).toBe(true);
      expect(result.seatNumber).toBeDefined();
      expect(result.placeName).toBeDefined();
    });
  });

  describe('2. Assistant Intent Processing & Speakable Response', () => {
    it('should process navigation query and generate max 2 speakable sentences with action', async () => {
      const response = await assistantService.processQuery({
        query: 'Take me to the Canteen',
        from: 'p-gate-1',
      });

      expect(response).toBeDefined();
      expect(response.reply).toBeDefined();
      expect(response.reply.length).toBeGreaterThan(10);

      // Verify speakable length constraint: at most 2 sentences
      const sentences = response.reply.split(/(?<=[.!?])\s+/).filter(Boolean);
      expect(sentences.length).toBeLessThanOrEqual(2);

      // Verify navigation action payload
      expect(response.action).toBeDefined();
      expect(response.action?.type).toBe('start_navigation');
      expect(response.action?.destination?.name.toLowerCase()).toContain('canteen');

      // Verify tool call audit trail
      expect(response.toolCalls.length).toBeGreaterThan(0);
    });

    it('should process timetable inquiry and guide student to classroom', async () => {
      const response = await assistantService.processQuery({
        query: 'What is my next class?',
        rollNo: '714022104045',
        department: 'CSE',
      });

      expect(response).toBeDefined();
      expect(response.reply.toLowerCase()).toMatch(/class|room|cse/i);
      expect(response.action).toBeDefined();
      expect(response.action?.type).toBe('start_navigation');

      const sentences = response.reply.split(/(?<=[.!?])\s+/).filter(Boolean);
      expect(sentences.length).toBeLessThanOrEqual(2);
    });

    it('should process exam hall inquiry and return seating guidance', async () => {
      const response = await assistantService.processQuery({
        query: 'Where is my exam hall?',
        rollNo: '714021104012',
      });

      expect(response).toBeDefined();
      expect(response.reply.toLowerCase()).toMatch(/exam|seat|floor|hall/i);
      expect(response.action?.type).toBe('start_navigation');

      const sentences = response.reply.split(/(?<=[.!?])\s+/).filter(Boolean);
      expect(sentences.length).toBeLessThanOrEqual(2);
    });
  });

  describe('3. Assistant API Route (POST /api/v1/assistant/query)', () => {
    it('should return 200 and valid JSON with speakable reply and action', async () => {
      const res = await request(app)
        .post('/api/v1/assistant/query')
        .send({
          query: 'Directions to Central Library',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('reply');
      expect(res.body.data).toHaveProperty('toolCalls');
      expect(res.body.data.action?.type).toBe('start_navigation');
    });

    it('should return 400 when query is empty', async () => {
      const res = await request(app)
        .post('/api/v1/assistant/query')
        .send({
          query: '',
        });

      expect(res.status).toBe(400);
    });
  });
});
