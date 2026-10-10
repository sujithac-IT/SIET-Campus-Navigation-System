export type UserRole = 'student' | 'faculty' | 'admin' | 'visitor';

export type AvailabilityStatus = 'Available' | 'In Class' | 'In Meeting' | 'Away' | 'Do Not Disturb';

export type PrivacyLevel = 'nobody' | 'friends' | 'faculty' | 'campus' | 'emergency';

export interface BaseUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  phone?: string;
  liveLocationSharing: boolean;
  privacySetting: PrivacyLevel;
  currentCoordinates?: { x: number; y: number; buildingId?: string; floor?: number };
  lastLocationUpdate?: string;
}

export interface StudentUser extends BaseUser {
  role: 'student';
  registerNumber: string;
  department: string;
  year: number;
  section: string;
}

export interface FacultyUser extends BaseUser {
  role: 'faculty';
  employeeId: string;
  department: string;
  designation: string;
  roomNumber: string;
  buildingId: string;
  subjects: string[];
  status: AvailabilityStatus;
}

export interface AdminUser extends BaseUser {
  role: 'admin';
  permissions: string[];
}

export interface VisitorUser extends BaseUser {
  role: 'visitor';
  purpose?: string;
}

export type User = StudentUser | FacultyUser | AdminUser | VisitorUser;

export interface Room {
  id: string;
  code: string; // e.g. "LH25", "IT-HOD-204"
  name: string;
  type: 'classroom' | 'lab' | 'office' | 'auditorium' | 'seminar' | 'canteen' | 'hostel_room' | 'facility' | 'medical' | 'restroom' | 'atm' | 'water' | 'parking' | 'lift' | 'staircase' | 'security' | 'library' | 'emergency_exit';
  buildingId: string;
  floor: number;
  capacity?: number;
  isAvailable: boolean;
  occupant?: string;
  coordinates: { x: number; y: number }; // Percentage relative to map canvas (0-100)
  description?: string;
  amenities?: string[];
  accessibilityInfo?: string;
  openingHours?: string;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  category: 'general' | 'academic' | 'event' | 'emergency';
  roleTarget?: UserRole | 'all';
  author: string;
}

export interface Floor {
  level: number;
  name: string;
  mapImage?: string;
  rooms: Room[];
}

export interface Building {
  id: string;
  name: string;
  code: string;
  category: 'academic' | 'admin' | 'facility' | 'hostel' | 'sports' | 'medical' | 'gate';
  description: string;
  coordinates: { x: number; y: number }; // Center position on campus map
  footprintPolygon?: { x: number; y: number }[];
  floors: Floor[];
  icon: string;
  color: string;
}

export interface PathNode {
  id: string;
  name: string;
  coordinates: { x: number; y: number };
  buildingId?: string;
  floor?: number;
  isStairsOrElevator?: boolean;
}

export interface PathEdge {
  from: string;
  to: string;
  distanceMeters: number;
  isAccessible: boolean;
  type: 'walkway' | 'stairs' | 'elevator' | 'corridor';
}

export interface RouteResult {
  nodes: PathNode[];
  totalDistanceMeters: number;
  estimatedTimeMinutes: number;
  instructions: {
    step: number;
    text: string;
    distanceMeters: number;
    floorTransition?: { fromFloor: number; toFloor: number; type: 'stairs' | 'elevator' };
  }[];
}

export interface CampusEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  venueBuildingId: string;
  venueRoomCode: string;
  organizer: string;
  category: 'academic' | 'tech' | 'sports' | 'cultural' | 'workshop';
  registeredCount: number;
  coordinates: { x: number; y: number };
}

export type NotificationPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface AIImpactAnalysis {
  subject: string;
  previousRoomCode: string;
  newRoomCode: string;
  affectedStudentsCount: number;
  urgency: NotificationPriority;
  distanceDeltaMeters: number;
  walkingTimeDeltaMinutes: number;
  departureAdvice: string;
  affectedDepartments: string[];
}

export interface QRCodeLocation {
  id: string;
  name: string;
  buildingId: string;
  buildingName: string;
  floor: number;
  roomCode?: string;
  coordinates: { x: number; y: number };
  description: string;
}

export interface FallbackLog {
  id: string;
  notificationId: string;
  title: string;
  recipientCount: number;
  channels: ('SMS' | 'Email')[];
  timestamp: string;
  status: 'delivered' | 'queued';
  sampleRecipient: string;
}

export interface NotificationItem {
  id: string;
  userId?: string;
  roleTarget?: UserRole | 'all';
  title: string;
  message: string;
  type: 'info' | 'class_change' | 'status_update' | 'emergency' | 'event';
  priority?: NotificationPriority;
  impactAnalysis?: AIImpactAnalysis;
  actionRoomCode?: string;
  timestamp: string;
  isRead: boolean;
  link?: string;
  fallbackLog?: {
    smsSent: boolean;
    emailSent: boolean;
    recipientCount: number;
    timestamp: string;
  };
}

export interface EmergencyAlert {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  timestamp: string;
  coordinates: { x: number; y: number };
  buildingName?: string;
  status: 'active' | 'resolved';
  details?: string;
}

export interface TimetableSlot {
  id: string;
  day: string;
  time: string;
  subject: string;
  roomCode: string;
  buildingId: string;
  facultyName: string;
  section?: string;
  department?: string;
  isChanged?: boolean;
  previousRoomCode?: string;
  changeReason?: string;
}

export interface MeetingRequest {
  id: string;
  studentId: string;
  studentName: string;
  facultyId: string;
  facultyName: string;
  requestedTime: string;
  purpose: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
}

