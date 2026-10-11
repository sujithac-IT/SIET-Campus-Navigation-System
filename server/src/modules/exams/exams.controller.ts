/**
 * SIET Navigate — Exams Controller
 */

import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { examsService } from './exams.service.js';

export const createExamHallChangeSchema = z.object({
  examHallId: z.string().min(1, 'examHallId is required'),
  newPlaceId: z.string().min(1, 'newPlaceId is required'),
  reason: z.string().min(3, 'Reason must be at least 3 characters'),
});

export class ExamsController {
  public async getMyExamHall(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rollNo =
        (req.query['rollNo'] as string) ||
        (req.user as any)?.rollNo ||
        '714021104012'; // Default sample student roll number

      const hall = await examsService.getMyExamHall(rollNo);
      res.status(200).json({
        success: true,
        data: {
          hall,
          queriedRollNo: rollNo,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  public async getAllExams(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const exams = await examsService.getAllExams();
      res.status(200).json({
        success: true,
        data: { exams },
      });
    } catch (err) {
      next(err);
    }
  }

  public async createChange(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = createExamHallChangeSchema.parse(req.body);
      const createdBy = req.user?.id || 'admin-user';

      const result = await examsService.createExamHallChange({
        examHallId: parsed.examHallId,
        newPlaceId: parsed.newPlaceId,
        reason: parsed.reason,
        createdBy,
      });

      res.status(201).json({
        success: true,
        message: 'Exam hall relocated and real-time alert sent to affected students',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
}

export const examsController = new ExamsController();
