/**
 * SIET Navigate — Timetable Service
 * Handles timetable retrieval and classroom relocation domain events
 * with automated Socket.IO broadcast, BullMQ push queuing, and DB transactions.
 */

import { timetableRepository, TimetableSlotEntity } from './timetable.repository.js';
import { AudienceResolver } from '../notifications/audience.resolver.js';
import { realtimeEmitter } from '../realtime/socket.js';
import { queuePushNotification } from '../../jobs/push.worker.js';
import { prisma } from '../../core/database.js';
import { NotFoundError } from '../../core/errors.js';
import { logger } from '../../core/logger.js';

export class TimetableService {
  /**
   * Retrieve timetable slots for authenticated user (student/faculty) or guest default
   */
  public async getMyTimetable(user?: {
    userId?: string;
    role?: string;
    departmentCode?: string;
    year?: number;
    section?: string;
  }): Promise<TimetableSlotEntity[]> {
    const dept = user?.departmentCode || 'CSE';
    const year = user?.year || 3;
    const sec = user?.section || 'A';

    return timetableRepository.getSlotsByCohort(dept, year, sec);
  }

  /**
   * Classroom Relocation Workflow:
   * 1. Save in DB / repository
   * 2. Resolve audience (dept:year:section + faculty)
   * 3. Emit real-time Socket.IO event to affected cohort room
   * 4. Queue BullMQ FCM push notification for users with app closed
   * 5. Store notification record for in-app notification center
   */
  public async createClassroomChange(params: {
    slotId: string;
    newPlaceId: string;
    reason: string;
    effectiveDate?: Date;
    createdBy: string;
  }) {
    const slot = await timetableRepository.getSlotById(params.slotId);
    if (!slot) {
      throw new NotFoundError(`Timetable slot with ID ${params.slotId} not found`);
    }

    const effectiveDate = params.effectiveDate || new Date();

    // 1. Save Relocation Record
    const change = await timetableRepository.createSlotChange({
      slotId: params.slotId,
      newPlaceId: params.newPlaceId,
      reason: params.reason,
      effectiveDate,
      createdBy: params.createdBy,
    });

    // 2. Resolve Audience Cohort
    const audience = await AudienceResolver.resolveTimetableAudience({
      departmentCode: slot.departmentCode,
      departmentId: (change.slot as any).department?.id || 'dept-cse',
      year: slot.year,
      section: slot.section,
      facultyId: slot.facultyId,
    });

    const newPlaceName = change.newPlace.name;
    const oldPlaceName = slot.placeName;
    const subjectName = slot.subjectName;

    // 3. Emit Socket.IO event to affected rooms (e.g. dept:CSE:yr3:secA)
    realtimeEmitter.emitTimetableChange({
      slotId: slot.id,
      subjectName,
      subjectCode: slot.subjectCode,
      oldRoom: oldPlaceName,
      newRoom: newPlaceName,
      newRoomCoords: {
        x: 75,
        y: 25,
        buildingId: 'b-techpark',
        floor: change.newPlace.floor?.level ?? 1,
      },
      reason: params.reason,
      affectedRooms: audience.targetRooms,
    });

    // 4. Create In-App Notification Record
    const notifTitle = `Classroom Relocated: ${subjectName}`;
    const notifBody = `${subjectName} (${slot.startTime}) shifted from ${oldPlaceName} to ${newPlaceName}. Reason: ${params.reason}`;

    let notificationId = `notif-${Date.now()}`;
    if (process.env['NODE_ENV'] !== 'test') {
      try {
        const notifRecord = await prisma.notification.create({
          data: {
            type: 'TIMETABLE_CHANGE',
            title: notifTitle,
            body: notifBody,
            payload: {
              slotId: slot.id,
              subjectCode: slot.subjectCode,
              oldPlace: oldPlaceName,
              newPlace: newPlaceName,
              actionUrl: `/navigate?to=${encodeURIComponent(change.newPlace.code || newPlaceName)}`,
            },
            audience: {
              cohort: `${audience.deptCode}:yr${audience.year}:sec${audience.section}`,
              targetRooms: audience.targetRooms,
            },
          },
        });
        notificationId = notifRecord.id;
      } catch (err: any) {
        logger.warn(`[TimetableService] Could not store notification: ${err.message}`);
      }
    }

    // 5. Queue BullMQ FCM push notification
    await queuePushNotification({
      notificationId,
      type: 'TIMETABLE_CHANGE',
      title: notifTitle,
      body: notifBody,
      payload: {
        slotId: slot.id,
        newPlace: newPlaceName,
      },
      userIds: audience.userIds,
    });

    logger.info(
      `[TimetableService] Classroom change complete: ${slot.subjectName} -> ${newPlaceName}. Audience: ${audience.targetRooms.join(', ')}`
    );

    return {
      change,
      audience,
      notification: {
        id: notificationId,
        title: notifTitle,
        body: notifBody,
      },
    };
  }
}

export const timetableService = new TimetableService();
