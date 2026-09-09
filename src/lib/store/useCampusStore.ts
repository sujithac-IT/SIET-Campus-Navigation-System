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
  INITIAL_ANNOUNCEMENTS
} from '@/lib/data/seedData';
import { findRoute } from '@/lib/navigation/router';

// In-Memory Global State for real-time reactivity across components
class GlobalState {
  public currentUser: User | null = null; // Default to guest/visitor mode for navigation-first experience
  public users: User[] = [...INITIAL_USERS];
  public buildings: Building[] = [...INITIAL_BUILDINGS];
  public events: CampusEvent[] = [...INITIAL_EVENTS];
  public notifications: NotificationItem[] = [...INITIAL_NOTIFICATIONS];
  public announcements: Announcement[] = [...INITIAL_ANNOUNCEMENTS];
  public timetable: TimetableSlot[] = [...INITIAL_TIMETABLE];
  public activeAlerts: EmergencyAlert[] = [];
  public meetingRequests: MeetingRequest[] = [];
  public selectedBuildingId: string | null = null;
  public selectedFloor: number = 0;
  public selectedRoomCode: string | null = null;
  public userLocation: { x: number; y: number } = { x: 15, y: 88 }; // Main Gate default
  public activeRoute: RouteResult | null = null;
  public destination: { x: number; y: number; name: string } | null = null;
  public isSharingLocation: boolean = true;

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
      type: ann.category === 'emergency' ? 'emergency' : 'info'
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
          this.destination = { x: room.coordinates.x, y: room.coordinates.y, name: `${room.name} (${b.name})` };
          this.activeRoute = findRoute(this.userLocation, room.coordinates);
          this.notify();
          return true;
        }
      }
    }
    return false;
  }

  public startNavigationToCoords(coords: { x: number; y: number }, name: string) {
    this.destination = { ...coords, name };
    this.activeRoute = findRoute(this.userLocation, coords);
    this.notify();
  }

  public clearNavigation() {
    this.activeRoute = null;
    this.destination = null;
    this.selectedRoomCode = null;
    this.notify();
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
