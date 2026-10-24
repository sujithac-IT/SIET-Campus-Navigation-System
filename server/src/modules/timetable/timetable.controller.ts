/**
 * SIET Navigate — Timetable Controller
 */

import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { timetableService } from './timetable.service.js';
import { timetableRepository } from './timetable.repository.js';

export const createClassroomChangeSchema = z.object({
  slotId: z.string().min(1, 'slotId is required'),
  newPlaceId: z.string().min(1, 'newPlaceId is required'),
  reason: z.string().min(3, 'Reason must be at least 3 characters'),
  effectiveDate: z.string().optional(),
});

export class TimetableController {
  public async getMyTimetable(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user;
      const slots = await timetableService.getMyTimetable(
        user
          ? {
              userId: user.id,
              role: user.role,
              departmentCode: (user as any).departmentCode || 'CSE',
              year: (user as any).year || 3,
              section: (user as any).section || 'A',
            }
          : undefined
      );

      res.status(200).json({
        success: true,
        data: {
          slots,
          total: slots.length,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  public async getChanges(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const changes = await timetableRepository.getActiveChanges();
      res.status(200).json({
        success: true,
        data: { changes },
      });
    } catch (err) {
      next(err);
    }
  }

  public async createChange(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = createClassroomChangeSchema.parse(req.body);
      const createdBy = req.user?.id || 'admin-user';

      const result = await timetableService.createClassroomChange({
        slotId: parsed.slotId,
        newPlaceId: parsed.newPlaceId,
        reason: parsed.reason,
        effectiveDate: parsed.effectiveDate ? new Date(parsed.effectiveDate) : undefined,
        createdBy,
      });

      res.status(201).json({
        success: true,
        message: 'Classroom relocated successfully and real-time notification broadcasted',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
}

export const timetableController = new TimetableController();
