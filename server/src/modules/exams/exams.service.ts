/**
 * SIET Navigate — Exams Service
 */

import { examsRepository, ExamHallEntity } from './exams.repository.js';
import { AudienceResolver } from '../notifications/audience.resolver.js';
import { realtimeEmitter } from '../realtime/socket.js';
import { queuePushNotification } from '../../jobs/push.worker.js';
import { NotFoundError } from '../../core/errors.js';
import { logger } from '../../core/logger.js';

export class ExamsService {
  public async getMyExamHall(rollNo: string): Promise<ExamHallEntity> {
    const hall = await examsRepository.getExamHallByRollNo(rollNo);
    if (!hall) {
      throw new NotFoundError(`No exam hall allocation found for roll number: ${rollNo}`);
    }
    return hall;
  }

  public async getAllExams(): Promise<ExamHallEntity[]> {
    return examsRepository.getAllExams();
  }

  public async createExamHallChange(params: {
    examHallId: string;
    newPlaceId: string;
    reason: string;
    createdBy: string;
  }) {
    const hall = await examsRepository.getExamHallById(params.examHallId);
    if (!hall) {
      throw new NotFoundError(`Exam hall with ID ${params.examHallId} not found`);
    }

    // 1. Create Change Record
    const result = await examsRepository.createExamHallChange(params);

    // 2. Resolve Affected Students by Roll Number Range
    const audience = await AudienceResolver.resolveExamAudience({
      examId: hall.examId,
      rollFrom: hall.rollFrom,
      rollTo: hall.rollTo,
      invigilatorId: null,
    });

    const newHallName = result.newPlace.name;
    const oldHallName = hall.placeName;

    // 3. Emit Real-time Socket.IO Event
    realtimeEmitter.emitExamHallChange({
      examHallId: hall.id,
      examName: hall.examName,
      oldHall: oldHallName,
      newHall: newHallName,
      newHallCoords: {
        x: 75,
        y: 25,
        buildingId: 'b-techpark',
        floor: result.newPlace.floor.level,
      },
      rollFrom: hall.rollFrom,
      rollTo: hall.rollTo,
      reason: params.reason,
      affectedRooms: audience.targetRooms,
    });

    // 4. Queue BullMQ FCM Push Notification
    const notifTitle = `Exam Hall Relocated: ${hall.examName}`;
    const notifBody = `Your Exam Hall has shifted from ${oldHallName} to ${newHallName} (Rolls: ${hall.rollFrom} - ${hall.rollTo}). Reason: ${params.reason}`;
    const notifId = `exam-notif-${Date.now()}`;

    await queuePushNotification({
      notificationId: notifId,
      type: 'EXAM_HALL_CHANGE',
      title: notifTitle,
      body: notifBody,
      payload: {
        examId: hall.examId,
        newPlace: newHallName,
        actionUrl: `/navigate?to=${encodeURIComponent(result.newPlace.code || newHallName)}`,
      },
      userIds: audience.userIds,
    });

    logger.info(
      `[ExamsService] Exam hall shifted: ${oldHallName} -> ${newHallName}. Audience: ${audience.targetRooms.join(', ')}`
    );

    return {
      change: result,
      audience,
      notification: {
        id: notifId,
        title: notifTitle,
        body: notifBody,
      },
    };
  }
}

export const examsService = new ExamsService();
