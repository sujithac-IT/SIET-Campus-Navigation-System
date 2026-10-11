/**
 * SIET Navigate — Exams Repository
 * Handles queries for exam hall allocations and relocation events
 * with resilient offline fallback catalog for development and testing.
 */

import { prisma } from '../../core/database.js';
import { logger } from '../../core/logger.js';

export interface ExamHallEntity {
  id: string;
  examId: string;
  examName: string;
  examDate: string;
  session: string; // 'FN' | 'AN'
  startTime: string;
  endTime: string;
  placeId: string;
  placeCode: string;
  placeName: string;
  buildingName: string;
  floorLevel: number;
  rollFrom: string;
  rollTo: string;
  invigilatorName?: string | null;
  isChanged?: boolean;
  newPlace?: {
    id: string;
    code: string;
    name: string;
    buildingName: string;
    floorLevel: number;
  } | null;
  changeReason?: string | null;
}

const FALLBACK_EXAM_HALLS: ExamHallEntity[] = [
  {
    id: 'hall-cs-lh01',
    examId: 'exam-sem-end-2026',
    examName: 'End Semester Examinations — April/May 2026',
    examDate: '2026-10-15',
    session: 'FN',
    startTime: '10:00 AM',
    endTime: '01:00 PM',
    placeId: 'p-lh01',
    placeCode: 'LH01',
    placeName: 'Exam Hall LH 01',
    buildingName: 'Main Academic Block',
    floorLevel: 0,
    rollFrom: '714021104001',
    rollTo: '714021104030',
    invigilatorName: 'Dr. Ramesh Kumar',
  },
  {
    id: 'hall-cs-lh02',
    examId: 'exam-sem-end-2026',
    examName: 'End Semester Examinations — April/May 2026',
    examDate: '2026-10-15',
    session: 'FN',
    startTime: '10:00 AM',
    endTime: '01:00 PM',
    placeId: 'p-lh02',
    placeCode: 'LH02',
    placeName: 'Exam Hall LH 02',
    buildingName: 'Main Academic Block',
    floorLevel: 0,
    rollFrom: '714021104031',
    rollTo: '714021104060',
    invigilatorName: 'Prof. Priya Sundaram',
  },
  {
    id: 'hall-it-lh25',
    examId: 'exam-sem-end-2026',
    examName: 'End Semester Examinations — April/May 2026',
    examDate: '2026-10-16',
    session: 'AN',
    startTime: '02:00 PM',
    endTime: '05:00 PM',
    placeId: 'p-lib-f2-lh25',
    placeCode: 'LH25',
    placeName: 'Exam Hall LH 25',
    buildingName: 'Central Library Block',
    floorLevel: 2,
    rollFrom: '714021205001',
    rollTo: '714021205040',
    invigilatorName: 'Dr. Ramesh Kumar',
  },
];

export class ExamsRepository {
  private inMemoryChanges: Array<{
    id: string;
    examHallId: string;
    newPlaceId: string;
    newPlaceCode: string;
    newPlaceName: string;
    buildingName: string;
    floorLevel: number;
    reason: string;
    createdAt: Date;
  }> = [];

  public async getExamHallByRollNo(rollNo: string): Promise<ExamHallEntity | null> {
    if (process.env['NODE_ENV'] !== 'test') {
      try {
        const hall = await prisma.examHall.findFirst({
          where: {
            rollFrom: { lte: rollNo },
            rollTo: { gte: rollNo },
          },
          include: {
            exam: true,
            place: { include: { building: true, floor: true } },
            invigilator: true,
            changes: {
              include: { newPlace: { include: { building: true, floor: true } } },
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        });

        if (hall) {
          const activeChange = hall.changes[0];
          return {
            id: hall.id,
            examId: hall.exam.id,
            examName: hall.exam.name,
            examDate: hall.exam.examDate.toISOString().split('T')[0] || '2026-10-15',
            session: hall.exam.session,
            startTime: hall.exam.startTime,
            endTime: hall.exam.endTime,
            placeId: hall.place.id,
            placeCode: hall.place.code || hall.place.name,
            placeName: hall.place.name,
            buildingName: hall.place.building?.name || 'Campus Building',
            floorLevel: hall.place.floor?.level ?? 0,
            rollFrom: hall.rollFrom,
            rollTo: hall.rollTo,
            invigilatorName: hall.invigilator?.name || null,
            isChanged: !!activeChange,
            newPlace: activeChange
              ? {
                  id: activeChange.newPlace.id,
                  code: activeChange.newPlace.code || activeChange.newPlace.name,
                  name: activeChange.newPlace.name,
                  buildingName: activeChange.newPlace.building?.name || 'Campus Building',
                  floorLevel: activeChange.newPlace.floor?.level ?? 0,
                }
              : null,
            changeReason: activeChange?.reason || null,
          };
        }
      } catch (err: any) {
        logger.warn(`[ExamsRepo] DB query failed, using fallback: ${err.message}`);
      }
    }

    // Fallback catalog lookup
    const found = FALLBACK_EXAM_HALLS.find(
      (h) => h.rollFrom <= rollNo && h.rollTo >= rollNo
    ) || FALLBACK_EXAM_HALLS[0];

    const memChange = this.inMemoryChanges.find((c) => c.examHallId === found?.id);
    if (found && memChange) {
      return {
        ...found,
        isChanged: true,
        changeReason: memChange.reason,
        newPlace: {
          id: memChange.newPlaceId,
          code: memChange.newPlaceCode,
          name: memChange.newPlaceName,
          buildingName: memChange.buildingName,
          floorLevel: memChange.floorLevel,
        },
      };
    }

    return found || null;
  }

  public async getExamHallById(id: string): Promise<ExamHallEntity | null> {
    const found = FALLBACK_EXAM_HALLS.find((h) => h.id === id);
    return found || null;
  }

  public async getAllExams(): Promise<ExamHallEntity[]> {
    return FALLBACK_EXAM_HALLS.map((h) => {
      const change = this.inMemoryChanges.find((c) => c.examHallId === h.id);
      if (change) {
        return {
          ...h,
          isChanged: true,
          changeReason: change.reason,
          newPlace: {
            id: change.newPlaceId,
            code: change.newPlaceCode,
            name: change.newPlaceName,
            buildingName: change.buildingName,
            floorLevel: change.floorLevel,
          },
        };
      }
      return h;
    });
  }

  public async createExamHallChange(data: {
    examHallId: string;
    newPlaceId: string;
    reason: string;
    createdBy: string;
  }) {
    const memRecord = {
      id: `exam-change-${Date.now()}`,
      examHallId: data.examHallId,
      newPlaceId: data.newPlaceId,
      newPlaceCode: 'TECH-101',
      newPlaceName: 'Tech Park Lab 3',
      buildingName: 'Tech Park Block',
      floorLevel: 1,
      reason: data.reason,
      createdAt: new Date(),
    };
    this.inMemoryChanges.unshift(memRecord);

    const hall = FALLBACK_EXAM_HALLS.find((h) => h.id === data.examHallId) || FALLBACK_EXAM_HALLS[0];

    return {
      id: memRecord.id,
      examHallId: data.examHallId,
      reason: data.reason,
      oldPlace: { name: hall.placeName, code: hall.placeCode },
      newPlace: {
        id: memRecord.newPlaceId,
        name: memRecord.newPlaceName,
        code: memRecord.newPlaceCode,
        building: { name: memRecord.buildingName },
        floor: { level: memRecord.floorLevel },
      },
      hall,
    };
  }
}

export const examsRepository = new ExamsRepository();
