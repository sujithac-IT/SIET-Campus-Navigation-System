import { useState, useEffect } from 'react';
import {
  User,
  Building,
  Room,
  RouteResult,
  CampusEvent,
  NotificationItem,
  EmergencyAlert,
  MeetingRequest,
  PrivacyLevel,
  AvailabilityStatus,
  Announcement,
  TimetableSlot
} from '@/types';
import {
  INITIAL_BUILDINGS,
  INITIAL_USERS,
  INITIAL_EVENTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_TIMETABLE,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_PATH_NODES,
  INITIAL_PATH_EDGES
} from '@/lib/data/seedData';
import {
  SIET_GEO_BUILDINGS,
  GEOSPATIAL_PATH_NODES,
  GEOSPATIAL_PATH_EDGES
} from '@/lib/data/sietGeoData';
import { findRoute } from '@/lib/navigation/router';

// In-Memory Global State for real-time reactivity across components
class GlobalState {
  public currentUser: User | null = INITIAL_USERS[0]; // Default to student Sujitha C
  public users: User[] = [...INITIAL_USERS];
  public buildings: Building[] = [...SIET_GEO_BUILDINGS, ...INITIAL_BUILDINGS.filter(b => !SIET_GEO_BUILDINGS.some(g => g.id === b.id || g.code === b.code))];
  public events: CampusEvent[] = [...INITIAL_EVENTS];
  public notifications: NotificationItem[] = [...INITIAL_NOTIFICATIONS];
  public announcements: Announcement[] = [...INITIAL_ANNOUNCEMENTS];
  public timetable: TimetableSlot[] = [...INITIAL_TIMETABLE];
  public activeAlerts: EmergencyAlert[] = [];
  public meetingRequests: MeetingRequest[] = [];
  public selectedBuildingId: string | null = null;
  public selectedFloor: number = 0;
  public selectedRoomCode: string | null = null;
  public userLocation: { x: number; y: number; lat?: number; lng?: number } = { x: 15, y: 88, lat: 11.040913, lng: 77.077493 }; // Main Gate (NH 544) default
  public activeRoute: RouteResult | null = null;
  public destination: { x: number; y: number; lat?: number; lng?: number; name: string } | null = null;
  public isSharingLocation: boolean = true;
  public isAccessibilityMode: boolean = false;
  public latestPushToast: NotificationItem | null = null;
  public fallbackLogs: { id: string; notificationId?: string; title: string; recipientCount: number; channels: string[]; timestamp: string; status: string; sampleRecipient: string }[] = [
    {
      id: 'fb-log-1',
      title: 'Classroom Change Alert: Data Structures',
      recipientCount: 62,
      channels: ['SMS', 'Email'],
      timestamp: 'Today at 08:45 AM',
      status: 'delivered',
      sampleRecipient: '+91 98765 43210 (sujitha.c@siet.ac.in)'
    }
  ];

  private listeners = new Set<() => void>();

  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public notify() {
    this.listeners.forEach((l) => l());
  }

  // Actions
  public setCurrentUser(user: User | null) {
    this.currentUser = user;
    if (user) {
      this.isSharingLocation = user.liveLocationSharing;
    }
    this.notify();
  }

  public toggleAccessibilityMode(status?: boolean) {
    this.isAccessibilityMode = status !== undefined ? status : !this.isAccessibilityMode;
    if (this.destination) {
      // Recalculate active route with accessibility mode
      this.activeRoute = findRoute(this.userLocation, { x: this.destination.x, y: this.destination.y }, INITIAL_PATH_NODES, INITIAL_PATH_EDGES, { isAccessibleOnly: this.isAccessibilityMode });
    }
    this.notify();
  }

  public clearPushToast() {
    this.latestPushToast = null;
    this.notify();
  }

  public toggleLocationSharing(status?: boolean) {
    this.isSharingLocation = status !== undefined ? status : !this.isSharingLocation;
    if (this.currentUser) {
      this.currentUser.liveLocationSharing = this.isSharingLocation;
    }
    this.notify();
  }

  public setPrivacySetting(level: PrivacyLevel) {
    if (this.currentUser) {
      this.currentUser.privacySetting = level;
      this.notify();
    }
  }

  public setFacultyStatus(status: AvailabilityStatus) {
    if (this.currentUser && this.currentUser.role === 'faculty') {
      (this.currentUser as any).status = status;
      this.notify();
    }
  }

  public setFacultyCustomStatus(customStatus: string) {
    if (this.currentUser && this.currentUser.role === 'faculty') {
      (this.currentUser as any).customStatus = customStatus;
      this.notify();
    }
  }

  public addAnnouncement(ann: Omit<Announcement, 'id' | 'timestamp'>) {
    const newAnn: Announcement = {
      ...ann,
      id: `ann-${Date.now()}`,
      timestamp: 'Just now'
    };
    this.announcements.unshift(newAnn);
    
    this.addNotification({
      roleTarget: ann.roleTarget || 'all',
      title: `📢 ${ann.title}`,
      message: ann.message,
      type: ann.category === 'emergency' ? 'emergency' : 'info',
      priority: ann.category === 'emergency' ? 'CRITICAL' : 'LOW'
    });
    
    this.notify();
  }

  public updateUserCoordinates(userId: string, coords: { x: number; y: number }) {
    this.users = this.users.map((u) => {
      if (u.id === userId) {
        return {
          ...u,
          currentCoordinates: coords,
          lastLocationUpdate: 'Just now'
        };
      }
      return u;
    });

    if (this.currentUser?.id === userId) {
      this.userLocation = coords;
      this.currentUser.currentCoordinates = coords;
    }

    this.notify();
  }

  public scanQRCode(qrCodeId: string): { success: boolean; locationName: string; coords: { x: number; y: number } } {
    // Map QR Codes to precise campus locations
    const qrMap: Record<string, { name: string; buildingId: string; floor: number; coords: { x: number; y: number } }> = {
      'SIET-QR-LH25': { name: 'Library Block Floor 2 (LH-25 Entrance)', buildingId: 'b-lib', floor: 2, coords: { x: 71, y: 36 } },
      'SIET-QR-LH28': { name: 'Library Block Floor 2 (LH-28 Entrance)', buildingId: 'b-lib', floor: 2, coords: { x: 74, y: 37 } },
      'SIET-QR-TECHPARK': { name: 'Tech Park Block (Main Lobby)', buildingId: 'b-techpark', floor: 0, coords: { x: 80, y: 70 } },
      'SIET-QR-CANTEEN': { name: 'Central Food Court (Main Door)', buildingId: 'b-canteen', floor: 0, coords: { x: 45, y: 75 } },
      'SIET-QR-GATE': { name: 'SIET Main Security Gate', buildingId: 'b-gate', floor: 0, coords: { x: 15, y: 88 } }
    };

    const target = qrMap[qrCodeId] || qrMap['SIET-QR-LH25'];
    this.userLocation = target.coords;
    if (this.currentUser) {
      this.currentUser.currentCoordinates = target.coords;
    }

    if (this.destination) {
      // Recalculate route from new QR position
      this.activeRoute = findRoute(target.coords, { x: this.destination.x, y: this.destination.y }, INITIAL_PATH_NODES, INITIAL_PATH_EDGES, { isAccessibleOnly: this.isAccessibilityMode });
    }

    this.notify();
    return { success: true, locationName: target.name, coords: target.coords };
  }

  // AI IMPACT ANALYSIS & CLASSROOM REASSIGNMENT ENGINE (CORE USP)
  public triggerClassroomReassignment(params: {
    subject: string;
    oldRoomCode: string;
    newRoomCode: string;
    reason: string;
    affectedDepartments?: string[];
  }) {
    const { subject, oldRoomCode, newRoomCode, reason, affectedDepartments = ['Department of Information Technology'] } = params;

    // 1. Find Room coordinates for AI impact calculation
    let oldCoords = { x: 71, y: 36 };
    let newCoords = { x: 74, y: 37 };
    let oldBuildingName = 'Library Block';
    let newBuildingName = 'Library Block';

    for (const b of this.buildings) {
      for (const f of b.floors) {
        for (const r of f.rooms) {
          if (r.code.toLowerCase() === oldRoomCode.toLowerCase()) {
            oldCoords = r.coordinates;
            oldBuildingName = b.name;
          }
          if (r.code.toLowerCase() === newRoomCode.toLowerCase()) {
            newCoords = r.coordinates;
            newBuildingName = b.name;
          }
        }
      }
    }

    // AI Impact Calculations
    const distanceDeltaMeters = Math.round(
      Math.sqrt(Math.pow(newCoords.x - oldCoords.x, 2) + Math.pow(newCoords.y - oldCoords.y, 2)) * 12
    );
    const walkingTimeDeltaMinutes = Math.max(1, Math.ceil(distanceDeltaMeters / 60));
    const affectedStudentsCount = 62; // IT Dept 3rd Year Section A
    const urgency: 'CRITICAL' | 'HIGH' = 'CRITICAL';
    const departureAdvice = walkingTimeDeltaMinutes > 2
      ? `Class relocated to ${newRoomCode} (${newBuildingName}). Leave ${walkingTimeDeltaMinutes + 3} minutes earlier to arrive on time.`
      : `Class moved from ${oldRoomCode} to ${newRoomCode} (${newBuildingName}). Route updated automatically.`;

    const impactAnalysis = {
      subject,
      previousRoomCode: oldRoomCode,
      newRoomCode,
      affectedStudentsCount,
      urgency,
      distanceDeltaMeters,
      walkingTimeDeltaMinutes,
      departureAdvice,
      affectedDepartments
    };

    // 2. Update Timetable in Global Store
    this.timetable = this.timetable.map((slot) => {
      if (
        slot.roomCode.toLowerCase() === oldRoomCode.toLowerCase() ||
        slot.subject.toLowerCase().includes(subject.toLowerCase())
      ) {
        return {
          ...slot,
          roomCode: newRoomCode,
          isChanged: true,
          previousRoomCode: oldRoomCode,
          changeReason: reason
        };
      }
      return slot;
    });

    // 3. Create Notification Item
    const notification: NotificationItem = {
      id: `notif-reassign-${Date.now()}`,
      roleTarget: 'student',
      title: `🔔 CLASSROOM CHANGED: ${subject}`,
      message: `${subject} has moved from ${oldRoomCode} to ${newRoomCode}. ${departureAdvice}`,
      type: 'class_change',
      priority: 'CRITICAL',
      impactAnalysis,
      actionRoomCode: newRoomCode,
      link: `/map?navigate=${encodeURIComponent(newRoomCode)}`,
      timestamp: 'Just now',
      isRead: false,
      fallbackLog: {
        smsSent: true,
        emailSent: true,
        recipientCount: affectedStudentsCount,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    };

    this.notifications.unshift(notification);
    this.latestPushToast = notification;

    // 4. Log simulated SMS/Email Fallback
    this.fallbackLogs.unshift({
      id: `fb-log-${Date.now()}`,
      notificationId: notification.id,
      title: `${subject} Room Shift: ${oldRoomCode} ➔ ${newRoomCode}`,
      recipientCount: affectedStudentsCount,
      channels: ['SMS', 'Email'],
      timestamp: 'Just now',
      status: 'delivered',
      sampleRecipient: '+91 98765 43210 (sujitha.c@siet.ac.in)'
    });

    // 5. Automatically recalculate navigation target if navigating to oldRoom
    if (this.selectedRoomCode?.toLowerCase() === oldRoomCode.toLowerCase() || (this.destination && this.destination.name.includes(oldRoomCode))) {
      this.startNavigationToRoom(newRoomCode);
    }

    this.notify();
    return impactAnalysis;
  }

  public selectBuilding(buildingId: string | null) {
    this.selectedBuildingId = buildingId;
    this.selectedFloor = 0;
    this.notify();
  }

  public setFloor(floor: number) {
    this.selectedFloor = floor;
    this.notify();
  }

  public startNavigationToRoom(roomCode: string) {
    // Find room coordinates across all buildings
    for (const b of this.buildings) {
      for (const f of b.floors) {
        const room = f.rooms.find((r) => r.code.toLowerCase() === roomCode.toLowerCase() || r.name.toLowerCase().includes(roomCode.toLowerCase()));
        if (room) {
          this.selectedBuildingId = b.id;
          this.selectedFloor = room.floor;
          this.selectedRoomCode = room.code;
          const targetCoords = {
            x: room.coordinates.x,
            y: room.coordinates.y,
            lat: b.entranceCoordinates?.lat || b.lat,
            lng: b.entranceCoordinates?.lng || b.lng,
            name: `${room.name} (${b.name})`
          };
          this.destination = targetCoords;
          this.activeRoute = findRoute(this.userLocation, targetCoords, GEOSPATIAL_PATH_NODES, GEOSPATIAL_PATH_EDGES, { isAccessibleOnly: this.isAccessibilityMode });
          this.notify();
          return true;
        }
      }
    }
    return false;
  }

  public startNavigationToCoords(coords: { x?: number; y?: number; lat?: number; lng?: number }, name: string) {
    const target = {
      x: coords.x ?? 50,
      y: coords.y ?? 50,
      lat: coords.lat,
      lng: coords.lng,
      name
    };
    this.destination = target;
    this.activeRoute = findRoute(this.userLocation, target, GEOSPATIAL_PATH_NODES, GEOSPATIAL_PATH_EDGES, { isAccessibleOnly: this.isAccessibilityMode });
    this.notify();
  }

  public clearActiveRoute() {
    this.activeRoute = null;
    this.destination = null;
    this.selectedRoomCode = null;
    this.notify();
  }

  public clearNavigation() {
    this.clearActiveRoute();
  }

  public triggerEmergencySOS(details?: string) {
    if (!this.currentUser) return;

    const alert: EmergencyAlert = {
      id: `sos-${Date.now()}`,
      userId: this.currentUser.id,
      userName: this.currentUser.name,
      userRole: this.currentUser.role,
      timestamp: new Date().toLocaleTimeString(),
      coordinates: this.userLocation,
      buildingName: 'Campus Grounds',
      status: 'active',
      details: details || 'SOS Emergency Button Activated'
    };

    this.activeAlerts.unshift(alert);

    // Auto navigate to nearest Medical Centre
    const medBuilding = this.buildings.find((b) => b.category === 'medical');
    if (medBuilding) {
      this.startNavigationToCoords(medBuilding.coordinates, 'Medical Centre Emergency Ward');
    }

    // Add broadcast notification
    this.notifications.unshift({
      id: `notif-sos-${Date.now()}`,
      roleTarget: 'all',
      title: '🚨 EMERGENCY SOS ALERT',
      message: `SOS triggered by ${this.currentUser.name}. Medical dispatch routed.`,
      type: 'emergency',
      timestamp: 'Just now',
      isRead: false
    });

    this.notify();
  }

  public resolveEmergency(alertId: string) {
    this.activeAlerts = this.activeAlerts.map((a) => (a.id === alertId ? { ...a, status: 'resolved' as const } : a));
    this.notify();
  }

  public addBuilding(building: Building) {
    this.buildings.push(building);
    this.notify();
  }

  public updateBuilding(building: Building) {
    this.buildings = this.buildings.map((b) => (b.id === building.id ? building : b));
    this.notify();
  }

  public deleteBuilding(id: string) {
    this.buildings = this.buildings.filter((b) => b.id !== id);
    this.notify();
  }

  public addNotification(notif: Omit<NotificationItem, 'id' | 'timestamp' | 'isRead'>) {
    const newNotif: NotificationItem = {
      ...notif,
      id: `notif-${Date.now()}`,
      timestamp: 'Just now',
      isRead: false
    };
    this.notifications.unshift(newNotif);
    this.notify();
  }

  public markNotificationAsRead(id: string) {
    this.notifications = this.notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n));
    this.notify();
  }

  public markAllNotificationsAsRead() {
    this.notifications = this.notifications.map((n) => ({ ...n, isRead: true }));
    this.notify();
  }

  public registerForEvent(eventId: string) {
    this.events = this.events.map((ev) => (ev.id === eventId ? { ...ev, registeredCount: ev.registeredCount + 1 } : ev));
    this.notify();
  }

  public requestFacultyMeeting(facultyId: string, facultyName: string, purpose: string, time: string) {
    if (!this.currentUser) return;

    const req: MeetingRequest = {
      id: `mreq-${Date.now()}`,
      studentId: this.currentUser.id,
      studentName: this.currentUser.name,
      facultyId,
      facultyName,
      requestedTime: time,
      purpose,
      status: 'pending',
      createdAt: new Date().toLocaleTimeString()
    };

    this.meetingRequests.unshift(req);
    this.addNotification({
      roleTarget: 'faculty',
      title: 'New Meeting Request',
      message: `${this.currentUser.name} requested a meeting: "${purpose}" at ${time}.`,
      type: 'status_update'
    });

    this.notify();
  }
}

export const globalState = new GlobalState();

export function useCampusStore() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const unsubscribe = globalState.subscribe(() => {
      setTick((t) => t + 1);
    });
    return unsubscribe;
  }, []);

  return globalState;
}
