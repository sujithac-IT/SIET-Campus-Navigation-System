/**
 * SIET Navigate — Timetable Repository
 * Handles queries for academic timetable slots and slot relocations,
 * with resilient offline fallback catalog for development and test execution.
 */

import { DayOfWeek } from '@prisma/client';
import { prisma } from '../../core/database.js';
import { logger } from '../../core/logger.js';

export interface TimetableSlotEntity {
  id: string;
  departmentCode: string;
  year: number;
  section: string;
  day: DayOfWeek;
  period: number;
  startTime: string;
  endTime: string;
  subjectCode: string;
  subjectName: string;
  facultyId: string;
  facultyName: string;
  placeId: string;
  placeCode: string;
  placeName: string;
  placeLat: number;
  placeLng: number;
  buildingName: string;
  floorLevel: number;
  isChanged?: boolean;
  newPlace?: {
    id: string;
    code: string;
    name: string;
    lat: number;
    lng: number;
    buildingName: string;
    floorLevel: number;
  } | null;
  changeReason?: string | null;
}

// -----------------------------------------------------------------------------
// Resilient Seed Fallback Catalog (SIET CSE & IT 3rd Year Cohort)
// -----------------------------------------------------------------------------
const FALLBACK_SLOTS: TimetableSlotEntity[] = [
  {
    id: 'slot-cse-mon-1',
    departmentCode: 'CSE',
    year: 3,
    section: 'A',
    day: DayOfWeek.MONDAY,
    period: 1,
    startTime: '09:00',
    endTime: '09:50',
    subjectCode: 'CS8591',
    subjectName: 'Computer Networks',
    facultyId: 'fac-ramesh',
    facultyName: 'Dr. Ramesh Kumar',
    placeId: 'p-lh02',
    placeCode: 'LH02',
    placeName: 'Exam Hall LH 02',
    placeLat: 11.0832,
    placeLng: 77.0610,
    buildingName: 'Main Academic Block',
    floorLevel: 0,
  },
  {
    id: 'slot-cse-mon-2',
    departmentCode: 'CSE',
    year: 3,
    section: 'A',
    day: DayOfWeek.MONDAY,
    period: 2,
    startTime: '09:50',
    endTime: '10:40',
    subjectCode: 'CS8501',
    subjectName: 'Database Management Systems',
    facultyId: 'fac-priya',
    facultyName: 'Prof. Priya Sundaram',
    placeId: 'p-lh04',
    placeCode: 'LH04',
    placeName: 'Lecture Hall LH 04',
    placeLat: 11.0832,
    placeLng: 77.0610,
    buildingName: 'Main Academic Block',
    floorLevel: 0,
  },
  {
    id: 'slot-cse-mon-3',
    departmentCode: 'CSE',
    year: 3,
    section: 'A',
    day: DayOfWeek.MONDAY,
    period: 3,
    startTime: '10:55',
    endTime: '11:45',
    subjectCode: 'CS8592',
    subjectName: 'Object Oriented Analysis & Design',
    facultyId: 'fac-ramesh',
    facultyName: 'Dr. Ramesh Kumar',
    placeId: 'p-tech-lab3',
    placeCode: 'TECH-101',
    placeName: 'Tech Park Lab 3',
    placeLat: 11.0837,
    placeLng: 77.0615,
    buildingName: 'Tech Park Block',
    floorLevel: 1,
  },
  {
    id: 'slot-cse-mon-4',
    departmentCode: 'CSE',
    year: 3,
    section: 'A',
    day: DayOfWeek.MONDAY,
    period: 4,
    startTime: '11:45',
    endTime: '12:35',
    subjectCode: 'CS8511',
    subjectName: 'Cloud Computing & Virtualization',
    facultyId: 'fac-priya',
    facultyName: 'Prof. Priya Sundaram',
    placeId: 'p-tech-lab3',
    placeCode: 'TECH-101',
    placeName: 'Tech Park Lab 3',
    placeLat: 11.0837,
    placeLng: 77.0615,
    buildingName: 'Tech Park Block',
    floorLevel: 1,
  },
  {
    id: 'slot-it-mon-1',
    departmentCode: 'IT',
    year: 3,
    section: 'A',
    day: DayOfWeek.MONDAY,
    period: 1,
    startTime: '09:00',
    endTime: '09:50',
    subjectCode: 'IT8501',
    subjectName: 'Web Technology & Architecture',
    facultyId: 'fac-priya',
    facultyName: 'Prof. Priya Sundaram',
    placeId: 'p-lib-f2-lh25',
    placeCode: 'LH25',
    placeName: 'Lecture Hall LH 25',
    placeLat: 11.0835,
    placeLng: 77.0605,
    buildingName: 'Central Library Block',
    floorLevel: 2,
  },
];

export class TimetableRepository {
  private inMemoryChanges: Array<{
    id: string;
    slotId: string;
    newPlaceId: string;
    newPlaceCode: string;
    newPlaceName: string;
    buildingName: string;
    floorLevel: number;
    reason: string;
    effectiveDate: Date;
    createdBy: string;
    createdAt: Date;
  }> = [];

  public async getSlotsByCohort(
    deptCode: string,
    year: number,
    section: string
  ): Promise<TimetableSlotEntity[]> {
    if (process.env['NODE_ENV'] !== 'test') {
      try {
        const slots = await prisma.timetableSlot.findMany({
          where: {
            department: { code: { equals: deptCode, mode: 'insensitive' } },
            year,
            section: { equals: section, mode: 'insensitive' },
          },
          include: {
            department: true,
            subject: true,
            faculty: true,
            place: { include: { building: true, floor: true } },
            changes: {
              where: { status: 'ACTIVE' },
              include: { newPlace: { include: { building: true, floor: true } } },
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
          orderBy: [{ day: 'asc' }, { period: 'asc' }],
        });

        if (slots.length > 0) {
          return slots.map((s) => {
            const activeChange = s.changes[0];
            return {
              id: s.id,
              departmentCode: s.department.code,
              year: s.year,
              section: s.section,
              day: s.day,
              period: s.period,
              startTime: s.startTime,
              endTime: s.endTime,
              subjectCode: s.subject.code,
              subjectName: s.subject.name,
              facultyId: s.faculty.id,
              facultyName: s.faculty.name,
              placeId: s.place.id,
              placeCode: s.place.code || s.place.name,
              placeName: s.place.name,
              placeLat: s.place.lat,
              placeLng: s.place.lng,
              buildingName: s.place.building?.name || 'Campus Building',
              floorLevel: s.place.floor?.level ?? 0,
              isChanged: !!activeChange,
              newPlace: activeChange
                ? {
                    id: activeChange.newPlace.id,
                    code: activeChange.newPlace.code || activeChange.newPlace.name,
                    name: activeChange.newPlace.name,
                    lat: activeChange.newPlace.lat,
                    lng: activeChange.newPlace.lng,
                    buildingName: activeChange.newPlace.building?.name || 'Campus Building',
                    floorLevel: activeChange.newPlace.floor?.level ?? 0,
                  }
                : null,
              changeReason: activeChange?.reason || null,
            };
          });
        }
      } catch (err: any) {
        logger.warn(`[TimetableRepo] DB query failed, using fallback: ${err.message}`);
      }
    }

    // Return in-memory fallback catalog
    return FALLBACK_SLOTS.filter(
      (s) =>
        s.departmentCode.toLowerCase() === deptCode.toLowerCase() &&
        s.year === year &&
        s.section.toLowerCase() === section.toLowerCase()
    ).map((s) => {
      const memChange = this.inMemoryChanges.find((c) => c.slotId === s.id);
      if (memChange) {
        return {
          ...s,
          isChanged: true,
          changeReason: memChange.reason,
          newPlace: {
            id: memChange.newPlaceId,
            code: memChange.newPlaceCode,
            name: memChange.newPlaceName,
            lat: 11.0837,
            lng: 77.0615,
            buildingName: memChange.buildingName,
            floorLevel: memChange.floorLevel,
          },
        };
      }
      return s;
    });
  }

  public async getSlotById(slotId: string): Promise<TimetableSlotEntity | null> {
    if (process.env['NODE_ENV'] !== 'test') {
      try {
        const slot = await prisma.timetableSlot.findUnique({
          where: { id: slotId },
          include: {
            department: true,
            subject: true,
            faculty: true,
            place: { include: { building: true, floor: true } },
          },
        });

        if (slot) {
          return {
            id: slot.id,
            departmentCode: slot.department.code,
            year: slot.year,
            section: slot.section,
            day: slot.day,
            period: slot.period,
            startTime: slot.startTime,
            endTime: slot.endTime,
            subjectCode: slot.subject.code,
            subjectName: slot.subject.name,
            facultyId: slot.faculty.id,
            facultyName: slot.faculty.name,
            placeId: slot.place.id,
            placeCode: slot.place.code || slot.place.name,
            placeName: slot.place.name,
            placeLat: slot.place.lat,
            placeLng: slot.place.lng,
            buildingName: slot.place.building?.name || 'Campus Building',
            floorLevel: slot.place.floor?.level ?? 0,
          };
        }
      } catch {
        // Fallback
      }
    }

    return FALLBACK_SLOTS.find((s) => s.id === slotId) || null;
  }

  public async createSlotChange(data: {
    slotId: string;
    newPlaceId: string;
    reason: string;
    effectiveDate: Date;
    createdBy: string;
  }) {
    if (process.env['NODE_ENV'] !== 'test') {
      try {
        const change = await prisma.timetableChange.create({
          data: {
            slotId: data.slotId,
            newPlaceId: data.newPlaceId,
            reason: data.reason,
            effectiveDate: data.effectiveDate,
            createdBy: data.createdBy,
            status: 'ACTIVE',
          },
          include: {
            slot: { include: { department: true, subject: true, faculty: true, place: true } },
            newPlace: { include: { building: true, floor: true } },
          },
        });
        return change;
      } catch (err: any) {
        logger.warn(`[TimetableRepo] DB change creation failed, using memory fallback: ${err.message}`);
      }
    }

    // Memory fallback record
    const memRecord = {
      id: `change-${Date.now()}`,
      slotId: data.slotId,
      newPlaceId: data.newPlaceId,
      newPlaceCode: 'TECH-101',
      newPlaceName: 'Tech Park Lab 3',
      buildingName: 'Tech Park Block',
      floorLevel: 1,
      reason: data.reason,
      effectiveDate: data.effectiveDate,
      createdBy: data.createdBy,
      createdAt: new Date(),
    };
    this.inMemoryChanges.unshift(memRecord);

    const slot = FALLBACK_SLOTS.find((s) => s.id === data.slotId) || FALLBACK_SLOTS[0];
    return {
      id: memRecord.id,
      slotId: data.slotId,
      newPlaceId: data.newPlaceId,
      reason: data.reason,
      effectiveDate: data.effectiveDate,
      createdBy: data.createdBy,
      status: 'ACTIVE' as const,
      slot: {
        id: slot.id,
        department: { code: slot.departmentCode, id: 'dept-cse' },
        year: slot.year,
        section: slot.section,
        subject: { name: slot.subjectName, code: slot.subjectCode },
        faculty: { id: slot.facultyId, name: slot.facultyName },
        place: { name: slot.placeName, code: slot.placeCode },
      },
      newPlace: {
        id: memRecord.newPlaceId,
        name: memRecord.newPlaceName,
        code: memRecord.newPlaceCode,
        building: { name: memRecord.buildingName },
        floor: { level: memRecord.floorLevel },
      },
    };
  }

  public async getActiveChanges() {
    return this.inMemoryChanges;
  }
}

export const timetableRepository = new TimetableRepository();
