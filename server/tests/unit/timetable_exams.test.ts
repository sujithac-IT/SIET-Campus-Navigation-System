import { describe, it, expect, beforeEach } from 'vitest';
import { timetableService } from '../../src/modules/timetable/timetable.service.js';
import { examsService } from '../../src/modules/exams/exams.service.js';
import { notificationsRepository } from '../../src/modules/notifications/notifications.repository.js';
import { AudienceResolver } from '../../src/modules/notifications/audience.resolver.js';

describe('Timetable, Exams & Real-Time Alerts — Unit Test Suite', () => {
  describe('1. Timetable Slot Retrieval & Relocation', () => {
    it('should retrieve weekly timetable for CSE 3rd Year Section A', async () => {
      const slots = await timetableService.getMyTimetable({
        departmentCode: 'CSE',
        year: 3,
        section: 'A',
      });

      expect(slots).toBeDefined();
      expect(slots.length).toBeGreaterThanOrEqual(3);
      expect(slots[0]).toHaveProperty('subjectCode');
      expect(slots[0]).toHaveProperty('startTime');
      expect(slots[0]).toHaveProperty('placeName');
    });

    it('should execute classroom relocation and resolve target audience cohort', async () => {
      const changeResult = await timetableService.createClassroomChange({
        slotId: 'slot-cse-mon-1',
        newPlaceId: 'p-tech-lab3',
        reason: 'Project Demo & Lab Equipment Setup',
        createdBy: 'fac-ramesh',
      });

      expect(changeResult).toBeDefined();
      expect(changeResult.change).toBeDefined();
      expect(changeResult.audience).toBeDefined();

      // Check audience targeting
      expect(changeResult.audience.targetRooms).toContain('dept:CSE:yr3:secA');
      expect(changeResult.audience.targetRooms).toContain('user:fac-ramesh');

      // Check notification creation
      expect(changeResult.notification.title).toContain('Classroom Relocated');
      expect(changeResult.notification.body).toContain('Tech Park Lab 3');
    });

    it('should show isChanged=true and newPlace details on relocated timetable slots', async () => {
      const slots = await timetableService.getMyTimetable({
        departmentCode: 'CSE',
        year: 3,
        section: 'A',
      });

      const updatedSlot = slots.find((s) => s.id === 'slot-cse-mon-1');
      expect(updatedSlot).toBeDefined();
      expect(updatedSlot?.isChanged).toBe(true);
      expect(updatedSlot?.newPlace?.name).toBe('Tech Park Lab 3');
    });
  });

  describe('2. Exam Hall Allocation & Hall Relocation', () => {
    it('should lookup student exam hall allocation by roll number', async () => {
      const rollNo = '714021104012';
      const hall = await examsService.getMyExamHall(rollNo);

      expect(hall).toBeDefined();
      expect(hall.examName).toContain('End Semester Examinations');
      expect(hall.placeName).toBe('Exam Hall LH 01');
      expect(hall.rollFrom <= rollNo && hall.rollTo >= rollNo).toBe(true);
    });

    it('should relocate exam hall and resolve affected students by roll range', async () => {
      const result = await examsService.createExamHallChange({
        examHallId: 'hall-cs-lh01',
        newPlaceId: 'p-tech-lab3',
        reason: 'Air conditioning repairs in progress',
        createdBy: 'admin-1',
      });

      expect(result).toBeDefined();
      expect(result.audience.targetRooms).toContain('roll:714021104001');
      expect(result.notification.title).toContain('Exam Hall Relocated');
    });
  });

  describe('3. Audience Resolver Logic', () => {
    it('should generate standardized cohort room strings', async () => {
      const audience = await AudienceResolver.resolveTimetableAudience({
        departmentCode: 'it',
        departmentId: 'dept-it-id',
        year: 2,
        section: 'b',
        facultyId: 'fac-priya',
      });

      expect(audience.targetRooms).toContain('dept:IT:yr2:secB');
      expect(audience.targetRooms).toContain('user:fac-priya');
    });

    it('should map roll range boundaries to exam rooms', async () => {
      const audience = await AudienceResolver.resolveExamAudience({
        examId: 'exam-2026',
        rollFrom: '714021104001',
        rollTo: '714021104030',
      });

      expect(audience.targetRooms).toContain('roll:714021104001');
      expect(audience.targetRooms).toContain('exam:exam-2026');
    });
  });

  describe('4. Notification Center & Device Registry', () => {
    it('should fetch user notifications and compute unread count', async () => {
      const notifs = await notificationsRepository.getUserNotifications('test-user');
      expect(Array.isArray(notifs)).toBe(true);
      expect(notifs.length).toBeGreaterThan(0);
    });

    it('should mark notification as read', async () => {
      const success = await notificationsRepository.markAsRead('notif-fb-1');
      expect(success).toBe(true);
    });

    it('should register FCM device token successfully', async () => {
      const res = await notificationsRepository.registerDeviceToken(
        'student-1',
        'fcm-sample-token-999',
        'web'
      );
      expect(res.success).toBe(true);
      expect(res.fcmToken).toBe('fcm-sample-token-999');
    });
  });
});
