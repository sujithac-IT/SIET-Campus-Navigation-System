/**
 * SIET Navigate — Assistant Express Routes
 * POST /api/v1/assistant/query
 */

import { Router, Request, Response, NextFunction } from 'express';
import { AssistantQueryInputSchema } from './assistant.schema.js';
import { assistantService } from './assistant.service.js';

export const assistantRoutes = Router();

/**
 * @openapi
 * /api/v1/assistant/query:
 *   post:
 *     summary: Ask SIET Campus AI Voice Assistant
 *     description: Submit natural language query (voice or text). Returns speakable 2-sentence reply, navigation action, and executed tools.
 *     tags:
 *       - Assistant
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - query
 *             properties:
 *               query:
 *                 type: string
 *                 example: "Take me to Central Library"
 *               rollNo:
 *                 type: string
 *                 example: "714022104045"
 *               department:
 *                 type: string
 *                 example: "CSE"
 *               from:
 *                 type: string
 *                 example: "p-gate-1"
 *     responses:
 *       200:
 *         description: AI voice response and navigation payload
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     reply:
 *                       type: string
 *                     action:
 *                       type: object
 *                     source:
 *                       type: string
 */
assistantRoutes.post(
  '/query',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = AssistantQueryInputSchema.parse(req.body);
      const result = await assistantService.processQuery(parsed);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
);
