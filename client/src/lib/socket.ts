/**
 * SIET Navigate — Client-Side Socket.IO Real-Time Engine
 * Connects to http://localhost:5000 and listens for timetable shifts,
 * exam hall relocations, and campus announcements in real-time.
 */

import { io, Socket } from 'socket.io-client';
import { globalState } from './store/useCampusStore';
import { voiceGuidance } from './speech/voiceGuidance';

const SOCKET_URL =
  process.env['NEXT_PUBLIC_SOCKET_URL'] || 'http://localhost:5000';

class CampusSocketService {
  private socket: Socket | null = null;
  private isConnected = false;
  private listeners = new Set<(event: string, data: any) => void>();

  public connect(token?: string) {
    if (this.socket || typeof window === 'undefined') return;

    this.socket = io(SOCKET_URL, {
      auth: token ? { token } : undefined,
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    this.socket.on('connect', () => {
      this.isConnected = true;
      console.info(`[Socket.IO] Connected to SIET Realtime Server: ${this.socket?.id}`);

      // Auto-join CSE 3rd Year cohort by default for student experience
      this.socket?.emit('subscribe', 'dept:CSE:yr3:secA');
      this.socket?.emit('subscribe', 'dept:IT:yr3:secA');
      this.socket?.emit('subscribe', 'campus:all');
    });

    this.socket.on('disconnect', () => {
      this.isConnected = false;
      console.warn('[Socket.IO] Disconnected from realtime server');
    });

    // 1. Timetable Slot Relocated Event
    this.socket.on('timetable:changed', (data: {
      slotId: string;
      subjectName: string;
      subjectCode: string;
      oldRoom: string;
      newRoom: string;
      newRoomCoords?: { x: number; y: number; buildingId: string; floor: number };
      reason: string;
    }) => {
      console.info('[Socket.IO] Timetable change received:', data);

      // Trigger store classroom reassignment
      globalState.triggerClassroomReassignment({
        subject: data.subjectName,
        oldRoomCode: data.oldRoom,
        newRoomCode: data.newRoom,
        reason: data.reason,
      });

      // Voice alert
      voiceGuidance.speak(
        `Attention: ${data.subjectName} has shifted from ${data.oldRoom} to ${data.newRoom}. Route updated.`,
        true
      );

      this.notifyListeners('timetable:changed', data);
    });

    // 2. Exam Hall Relocated Event
    this.socket.on('exam:changed', (data: {
      examHallId: string;
      examName: string;
      oldHall: string;
      newHall: string;
      rollFrom: string;
      rollTo: string;
      reason: string;
    }) => {
      console.info('[Socket.IO] Exam hall change received:', data);

      globalState.addNotification({
        roleTarget: 'student',
        title: `🚨 EXAM HALL RELOCATED: ${data.examName}`,
        message: `Exam Hall shifted from ${data.oldHall} to ${data.newHall} (Roll Numbers: ${data.rollFrom} to ${data.rollTo}). Reason: ${data.reason}`,
        type: 'exam_alert',
        priority: 'CRITICAL',
        link: `/map?navigate=${encodeURIComponent(data.newHall)}`,
      });

      voiceGuidance.speak(
        `Exam hall alert: Your exam has shifted to ${data.newHall}. Tap notification to navigate.`,
        true
      );

      this.notifyListeners('exam:changed', data);
    });

    // 3. General Campus Announcement
    this.socket.on('announcement:new', (data: {
      id: string;
      title: string;
      content: string;
      category: string;
    }) => {
      globalState.addAnnouncement({
        title: data.title,
        message: data.content,
        category: (data.category as any) || 'general',
        author: 'Campus Administration',
      });

      this.notifyListeners('announcement:new', data);
    });
  }

  public subscribe(listener: (event: string, data: any) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(event: string, data: any) {
    this.listeners.forEach((cb) => cb(event, data));
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  public getStatus(): boolean {
    return this.isConnected;
  }
}

export const campusSocket = new CampusSocketService();
