/**
 * SIET Navigate — Real-time Socket.IO Module
 * Handles WebSocket connections, user room subscriptions (dept, year, section, roll number),
 * and domain event broadcasts for instant room relocation alerts.
 */

import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from '../../core/config.js';
import { logger } from '../../core/logger.js';

let io: SocketIOServer | null = null;

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  departmentCode?: string;
  year?: number;
  section?: string;
  rollNo?: string;
}

export function initSocketIO(httpServer: HttpServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: [config.CLIENT_URL, 'http://localhost:3000'],
      credentials: true,
      methods: ['GET', 'POST'],
    },
    pingTimeout: 30000,
    pingInterval: 10000,
  });

  io.use((socket: Socket, next) => {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.replace('Bearer ', '');

    if (token) {
      try {
        const decoded = jwt.verify(token, config.JWT_ACCESS_SECRET) as TokenPayload;
        socket.data.user = decoded;
      } catch {
        logger.warn(`[Socket.IO] Invalid auth token on socket ${socket.id}, continuing as guest`);
      }
    }
    next();
  });

  io.on('connection', (socket: Socket) => {
    const user = socket.data.user as TokenPayload | undefined;
    logger.info(`[Socket.IO] Client connected: ${socket.id} (user: ${user?.userId || 'guest'})`);

    // 1. Join Public Campus Broadcast Room
    socket.join('campus:all');

    if (user) {
      // 2. Join User Private Room
      socket.join(`user:${user.userId}`);

      // 3. Join Role Room
      socket.join(`role:${user.role}`);

      // 4. Join Department + Academic Cohort Room (e.g. dept:CSE:yr3:secA)
      if (user.departmentCode) {
        socket.join(`dept:${user.departmentCode.toUpperCase()}`);

        if (user.year && user.section) {
          const cohortRoom = `dept:${user.departmentCode.toUpperCase()}:yr${user.year}:sec${user.section.toUpperCase()}`;
          socket.join(cohortRoom);
          logger.info(`[Socket.IO] Socket ${socket.id} joined cohort: ${cohortRoom}`);
        }
      }

      // 5. Join Roll Number Room for exam hall lookup
      if (user.rollNo) {
        socket.join(`roll:${user.rollNo}`);
      }
    }

    // Allow client to dynamically subscribe to rooms (e.g. for guest demo testing)
    socket.on('subscribe', (roomName: string) => {
      socket.join(roomName);
      logger.info(`[Socket.IO] Socket ${socket.id} joined custom room: ${roomName}`);
    });

    socket.on('unsubscribe', (roomName: string) => {
      socket.leave(roomName);
    });

    socket.on('disconnect', (reason) => {
      logger.info(`[Socket.IO] Client disconnected: ${socket.id} (${reason})`);
    });
  });

  return io;
}

export function getIO(): SocketIOServer | null {
  return io;
}

export const realtimeEmitter = {
  /**
   * Broadcast an event to one or more Socket.IO rooms
   */
  emitToRooms(rooms: string[], event: string, payload: unknown) {
    if (!io) {
      logger.warn(`[Socket.IO] Cannot emit event "${event}": Socket.IO not initialized`);
      return;
    }

    rooms.forEach((room) => {
      io!.to(room).emit(event, payload);
    });
    logger.info(`[Socket.IO] Broadcasted event "${event}" to rooms: [${rooms.join(', ')}]`);
  },

  /**
   * Timetable slot relocated event
   */
  emitTimetableChange(payload: {
    slotId: string;
    subjectName: string;
    subjectCode: string;
    oldRoom: string;
    newRoom: string;
    newRoomCoords?: { x: number; y: number; buildingId: string; floor: number };
    reason: string;
    affectedRooms: string[];
  }) {
    this.emitToRooms(payload.affectedRooms, 'timetable:changed', payload);
  },

  /**
   * Exam Hall relocation event
   */
  emitExamHallChange(payload: {
    examHallId: string;
    examName: string;
    oldHall: string;
    newHall: string;
    newHallCoords?: { x: number; y: number; buildingId: string; floor: number };
    rollFrom: string;
    rollTo: string;
    reason: string;
    affectedRooms: string[];
  }) {
    this.emitToRooms(payload.affectedRooms, 'exam:changed', payload);
  },

  /**
   * Campus-wide Announcement event
   */
  emitAnnouncement(payload: {
    id: string;
    title: string;
    content: string;
    category: string;
    createdAt: string;
  }) {
    this.emitToRooms(['campus:all'], 'announcement:new', payload);
  },
};
