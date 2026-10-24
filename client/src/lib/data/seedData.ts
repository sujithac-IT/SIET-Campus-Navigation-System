import { Building, Room, PathNode, PathEdge, User, CampusEvent, NotificationItem, EmergencyAlert, TimetableSlot, MeetingRequest, Announcement } from '@/types';

export const INITIAL_BUILDINGS: Building[] = [
  {
    id: 'b-gate',
    name: 'Main Gate',
    code: 'GATE',
    category: 'gate',
    description: 'Primary campus entrance with 24/7 security checkpoint and parking zones.',
    coordinates: { x: 15, y: 88 },
    icon: 'ShieldCheck',
    color: '#3b82f6',
    floors: [
      {
        level: 0,
        name: 'Ground Floor',
        rooms: [
          {
            id: 'r-security-post',
            code: 'SEC-01',
            name: 'Main Security Checkpost',
            type: 'security',
            buildingId: 'b-gate',
            floor: 0,
            isAvailable: true,
            coordinates: { x: 15, y: 88 },
            description: 'Visitor badges and entry verification. Open 24/7.',
            accessibilityInfo: 'Wheelchair accessible entrance.'
          },
          {
            id: 'r-gate-prk-vis',
            code: 'PRK-VIS',
            name: 'Visitor Parking Zone',
            type: 'parking',
            buildingId: 'b-gate',
            floor: 0,
            isAvailable: true,
            coordinates: { x: 12, y: 90 },
            description: 'Designated parking for guests, parents, and visitors.',
            accessibilityInfo: 'Includes 4 designated accessible parking spaces.'
          },
          {
            id: 'r-gate-prk-bike',
            code: 'PRK-BIKE',
            name: 'Student Bike Parking',
            type: 'parking',
            buildingId: 'b-gate',
            floor: 0,
            isAvailable: true,
            coordinates: { x: 17, y: 90 },
            description: 'Two-wheeler parking zone for students.',
          },
          {
            id: 'r-gate-prk-car',
            code: 'PRK-CAR',
            name: 'Faculty Car Parking',
            type: 'parking',
            buildingId: 'b-gate',
            floor: 0,
            isAvailable: true,
            coordinates: { x: 15, y: 92 },
            description: 'Reserved parking slots for college staff and faculty.',
          }
        ]
      }
    ]
  },
  {
    id: 'b-[#academic]',
    name: 'Main Academic Block',
    code: 'ACAD',
    category: 'academic',
    description: 'Primary lecture hall complex housing Exam Halls LH 01 to LH 23, lifts, and restrooms.',
    coordinates: { x: 30, y: 45 },
    icon: 'BookOpen',
    color: '#6366f1',
    floors: [
      {
        level: 0,
        name: 'Ground Floor',
        rooms: [
          { id: 'r-lh01', code: 'LH01', name: 'Exam Hall LH 01', type: 'classroom', buildingId: 'b-[#academic]', floor: 0, isAvailable: true, coordinates: { x: 29, y: 46 }, description: 'Academic Block - Ground Floor' },
          { id: 'r-lh02', code: 'LH02', name: 'Exam Hall LH 02', type: 'classroom', buildingId: 'b-[#academic]', floor: 0, isAvailable: true, coordinates: { x: 29, y: 45 }, description: 'Academic Block - Ground Floor' },
          { id: 'r-lh03', code: 'LH03', name: 'Exam Hall LH 03', type: 'classroom', buildingId: 'b-[#academic]', floor: 0, isAvailable: true, coordinates: { x: 30, y: 46 }, description: 'Academic Block - Ground Floor' },
          { id: 'r-lh04', code: 'LH04', name: 'Exam Hall LH 04', type: 'classroom', buildingId: 'b-[#academic]', floor: 0, isAvailable: true, coordinates: { x: 30, y: 45 }, description: 'Academic Block - Ground Floor' },
          { id: 'r-lh05', code: 'LH05', name: 'Exam Hall LH 05', type: 'classroom', buildingId: 'b-[#academic]', floor: 0, isAvailable: true, coordinates: { x: 31, y: 46 }, description: 'Academic Block - Ground Floor' },
          { id: 'r-lh06', code: 'LH06', name: 'Exam Hall LH 06', type: 'classroom', buildingId: 'b-[#academic]', floor: 0, isAvailable: true, coordinates: { x: 31, y: 45 }, description: 'Academic Block - Ground Floor' },
          { id: 'r-acad-mrr-0', code: 'ACAD-MRR-0', name: 'Men’s Restroom (Ground)', type: 'restroom', buildingId: 'b-[#academic]', floor: 0, isAvailable: true, coordinates: { x: 28, y: 44 }, description: 'Restroom for men - Ground Floor Academic Block' },
          { id: 'r-acad-wrr-0', code: 'ACAD-WRR-0', name: 'Women’s Restroom (Ground)', type: 'restroom', buildingId: 'b-[#academic]', floor: 0, isAvailable: true, coordinates: { x: 32, y: 44 }, description: 'Restroom for women - Ground Floor Academic Block' },
          { id: 'r-acad-wd-0', code: 'ACAD-WD-0', name: 'RO Drinking Water Point', type: 'water', buildingId: 'b-[#academic]', floor: 0, isAvailable: true, coordinates: { x: 30, y: 44 }, description: 'RO purified drinking water station' },
          { id: 'r-acad-lift-0', code: 'ACAD-LIFT', name: 'Academic Block Elevator', type: 'lift', buildingId: 'b-[#academic]', floor: 0, isAvailable: true, coordinates: { x: 28, y: 45 }, description: 'High speed elevator linking all floors', accessibilityInfo: 'Wheelchair friendly buttons and announcements' },
          { id: 'r-acad-stairs-1', code: 'ACAD-ST-1', name: 'East Staircase', type: 'staircase', buildingId: 'b-[#academic]', floor: 0, isAvailable: true, coordinates: { x: 32, y: 45 }, description: 'Main staircase connecting to upper floors' },
          { id: 'r-acad-exit-1', code: 'ACAD-EX-1', name: 'Academic Block Emergency Exit', type: 'emergency_exit', buildingId: 'b-[#academic]', floor: 0, isAvailable: true, coordinates: { x: 30, y: 47 }, description: 'Rear emergency fire exit' }
        ]
      },
      {
        level: 1,
        name: '1st Floor',
        rooms: [
          { id: 'r-lh07', code: 'LH07', name: 'Exam Hall LH 07', type: 'classroom', buildingId: 'b-[#academic]', floor: 1, isAvailable: true, coordinates: { x: 29, y: 46 }, description: 'Academic Block - 1st Floor' },
          { id: 'r-lh08', code: 'LH08', name: 'Exam Hall LH 08', type: 'classroom', buildingId: 'b-[#academic]', floor: 1, isAvailable: true, coordinates: { x: 29, y: 45 }, description: 'Academic Block - 1st Floor' },
          { id: 'r-lh09', code: 'LH09', name: 'Exam Hall LH 09', type: 'classroom', buildingId: 'b-[#academic]', floor: 1, isAvailable: true, coordinates: { x: 30, y: 46 }, description: 'Academic Block - 1st Floor' },
          { id: 'r-lh10', code: 'LH10', name: 'Exam Hall LH 10', type: 'classroom', buildingId: 'b-[#academic]', floor: 1, isAvailable: true, coordinates: { x: 30, y: 45 }, description: 'Academic Block - 1st Floor' },
          { id: 'r-lh11', code: 'LH11', name: 'Exam Hall LH 11', type: 'classroom', buildingId: 'b-[#academic]', floor: 1, isAvailable: true, coordinates: { x: 31, y: 46 }, description: 'Academic Block - 1st Floor' },
          { id: 'r-lh12', code: 'LH12', name: 'Exam Hall LH 12', type: 'classroom', buildingId: 'b-[#academic]', floor: 1, isAvailable: true, coordinates: { x: 31, y: 45 }, description: 'Academic Block - 1st Floor' },
          { id: 'r-acad-mrr-1', code: 'ACAD-MRR-1', name: 'Men’s Restroom (1st Floor)', type: 'restroom', buildingId: 'b-[#academic]', floor: 1, isAvailable: true, coordinates: { x: 28, y: 44 } },
          { id: 'r-acad-wrr-1', code: 'ACAD-WRR-1', name: 'Women’s Restroom (1st Floor)', type: 'restroom', buildingId: 'b-[#academic]', floor: 1, isAvailable: true, coordinates: { x: 32, y: 44 } },
          { id: 'r-acad-wd-1', code: 'ACAD-WD-1', name: 'RO Drinking Water Point', type: 'water', buildingId: 'b-[#academic]', floor: 1, isAvailable: true, coordinates: { x: 30, y: 44 } }
        ]
      },
      {
        level: 2,
        name: '2nd Floor',
        rooms: [
          { id: 'r-lh13', code: 'LH13', name: 'Exam Hall LH 13', type: 'classroom', buildingId: 'b-[#academic]', floor: 2, isAvailable: true, coordinates: { x: 29, y: 46 }, description: 'Academic Block - 2nd Floor' },
          { id: 'r-lh14', code: 'LH14', name: 'Exam Hall LH 14', type: 'classroom', buildingId: 'b-[#academic]', floor: 2, isAvailable: true, coordinates: { x: 29, y: 45 }, description: 'Academic Block - 2nd Floor' },
          { id: 'r-lh15', code: 'LH15', name: 'Exam Hall LH 15', type: 'classroom', buildingId: 'b-[#academic]', floor: 2, isAvailable: true, coordinates: { x: 30, y: 46 }, description: 'Academic Block - 2nd Floor' },
          { id: 'r-lh16', code: 'LH16', name: 'Exam Hall LH 16', type: 'classroom', buildingId: 'b-[#academic]', floor: 2, isAvailable: true, coordinates: { x: 30, y: 45 }, description: 'Academic Block - 2nd Floor' },
          { id: 'r-acad-mrr-2', code: 'ACAD-MRR-2', name: 'Men’s Restroom (2nd Floor)', type: 'restroom', buildingId: 'b-[#academic]', floor: 2, isAvailable: true, coordinates: { x: 28, y: 44 } },
          { id: 'r-acad-wrr-2', code: 'ACAD-WRR-2', name: 'Women’s Restroom (2nd Floor)', type: 'restroom', buildingId: 'b-[#academic]', floor: 2, isAvailable: true, coordinates: { x: 32, y: 44 } },
          { id: 'r-acad-wd-2', code: 'ACAD-WD-2', name: 'RO Drinking Water Point', type: 'water', buildingId: 'b-[#academic]', floor: 2, isAvailable: true, coordinates: { x: 30, y: 44 } }
        ]
      },
      {
        level: 3,
        name: '3rd Floor',
        rooms: [
          { id: 'r-lh17', code: 'LH17', name: 'Exam Hall LH 17', type: 'classroom', buildingId: 'b-[#academic]', floor: 3, isAvailable: true, coordinates: { x: 29, y: 46 }, description: 'Academic Block - 3rd Floor' },
          { id: 'r-lh18', code: 'LH18', name: 'Exam Hall LH 18', type: 'classroom', buildingId: 'b-[#academic]', floor: 3, isAvailable: true, coordinates: { x: 29, y: 45 }, description: 'Academic Block - 3rd Floor' },
          { id: 'r-lh19', code: 'LH19', name: 'Exam Hall LH 19', type: 'classroom', buildingId: 'b-[#academic]', floor: 3, isAvailable: true, coordinates: { x: 30, y: 46 }, description: 'Academic Block - 3rd Floor' },
          { id: 'r-lh20', code: 'LH20', name: 'Exam Hall LH 20', type: 'classroom', buildingId: 'b-[#academic]', floor: 3, isAvailable: true, coordinates: { x: 30, y: 45 }, description: 'Academic Block - 3rd Floor' },
          { id: 'r-lh21', code: 'LH21', name: 'Exam Hall LH 21', type: 'classroom', buildingId: 'b-[#academic]', floor: 3, isAvailable: true, coordinates: { x: 31, y: 46 }, description: 'Academic Block - 3rd Floor' },
          { id: 'r-lh22', code: 'LH22', name: 'Exam Hall LH 22', type: 'classroom', buildingId: 'b-[#academic]', floor: 3, isAvailable: true, coordinates: { x: 31, y: 45 }, description: 'Academic Block - 3rd Floor' },
          { id: 'r-lh23', code: 'LH23', name: 'Exam Hall LH 23', type: 'classroom', buildingId: 'b-[#academic]', floor: 3, isAvailable: true, coordinates: { x: 31, y: 44 }, description: 'Academic Block - 3rd Floor' },
          { id: 'r-acad-mrr-3', code: 'ACAD-MRR-3', name: 'Men’s Restroom (3rd Floor)', type: 'restroom', buildingId: 'b-[#academic]', floor: 3, isAvailable: true, coordinates: { x: 28, y: 44 } },
          { id: 'r-acad-wrr-3', code: 'ACAD-WRR-3', name: 'Women’s Restroom (3rd Floor)', type: 'restroom', buildingId: 'b-[#academic]', floor: 3, isAvailable: true, coordinates: { x: 32, y: 44 } }
        ]
      }
    ]
  },
  {
    id: 'b-library',
    name: 'Central Library Block',
    code: 'LIB',
    category: 'facility',
    description: 'Central Library & Exam Halls LH 24-28, Seminar Hall-II, SBI ATM, water coolers, and accessible lift.',
    coordinates: { x: 35, y: 55 },
    icon: 'BookOpen',
    color: '#10b981',
    floors: [
      {
        level: 0,
        name: 'Ground Floor',
        rooms: [
          { id: 'r-lib-main', code: 'LIB-G', name: 'Central Library Reference', type: 'library', buildingId: 'b-library', floor: 0, isAvailable: true, coordinates: { x: 35, y: 55 }, openingHours: '08:00 AM - 08:00 PM', accessibilityInfo: 'Ramp at entrance' },
          { id: 'r-sem-hall-2', code: 'SEM-HALL-2', name: 'Seminar Hall-II', type: 'seminar', buildingId: 'b-library', floor: 0, isAvailable: true, coordinates: { x: 35, y: 56 }, description: 'Ground Floor - Library' },
          { id: 'r-lib-atm-0', code: 'LIB-ATM-SBI', name: 'SBI ATM Point', type: 'atm', buildingId: 'b-library', floor: 0, isAvailable: true, coordinates: { x: 33, y: 56 }, description: 'SBI ATM machine with 24/7 service' },
          { id: 'r-lib-mrr-0', code: 'LIB-MRR-0', name: 'Library Men’s Restroom', type: 'restroom', buildingId: 'b-library', floor: 0, isAvailable: true, coordinates: { x: 37, y: 54 } },
          { id: 'r-lib-wrr-0', code: 'LIB-WRR-0', name: 'Library Women’s Restroom', type: 'restroom', buildingId: 'b-library', floor: 0, isAvailable: true, coordinates: { x: 37, y: 56 } },
          { id: 'r-lib-wd-0', code: 'LIB-WD-0', name: 'RO Drinking Water dispenser', type: 'water', buildingId: 'b-library', floor: 0, isAvailable: true, coordinates: { x: 34, y: 54 } },
          { id: 'r-lib-lift-0', code: 'LIB-LIFT', name: 'Library Elevator', type: 'lift', buildingId: 'b-library', floor: 0, isAvailable: true, coordinates: { x: 33, y: 55 }, accessibilityInfo: 'Fully accessible' }
        ]
      },
      {
        level: 2,
        name: '2nd Floor (above Library)',
        rooms: [
          { id: 'r-lh24', code: 'LH24', name: 'Exam Hall LH 24', type: 'classroom', buildingId: 'b-library', floor: 2, isAvailable: true, coordinates: { x: 35, y: 54 }, description: '2nd floor (above Library)' },
          { id: 'r-lh25', code: 'LH25', name: 'Exam Hall LH 25', type: 'classroom', buildingId: 'b-library', floor: 2, isAvailable: true, coordinates: { x: 35, y: 55 }, description: '2nd floor (above Library)' },
          { id: 'r-lh26', code: 'LH26', name: 'Exam Hall LH 26', type: 'classroom', buildingId: 'b-library', floor: 2, isAvailable: true, coordinates: { x: 35, y: 56 }, description: '2nd floor (above Library)' },
          { id: 'r-lib-mrr-2', code: 'LIB-MRR-2', name: 'Restroom (2nd Floor Library)', type: 'restroom', buildingId: 'b-library', floor: 2, isAvailable: true, coordinates: { x: 37, y: 54 } },
          { id: 'r-lib-wrr-2', code: 'LIB-WRR-2', name: 'Restroom (2nd Floor Library)', type: 'restroom', buildingId: 'b-library', floor: 2, isAvailable: true, coordinates: { x: 37, y: 56 } }
        ]
      },
      {
        level: 3,
        name: '3rd Floor (above Library)',
        rooms: [
          { id: 'r-lh27', code: 'LH27', name: 'Exam Hall LH 27', type: 'classroom', buildingId: 'b-library', floor: 3, isAvailable: true, coordinates: { x: 35, y: 54 }, description: '3rd floor (above Library)' },
          { id: 'r-lh28', code: 'LH28', name: 'Exam Hall LH 28', type: 'classroom', buildingId: 'b-library', floor: 3, isAvailable: true, coordinates: { x: 35, y: 55 }, description: '3rd floor (above Library)' },
          { id: 'r-lib-mrr-3', code: 'LIB-MRR-3', name: 'Restroom (3rd Floor Library)', type: 'restroom', buildingId: 'b-library', floor: 3, isAvailable: true, coordinates: { x: 37, y: 54 } },
          { id: 'r-lib-exit-3', code: 'LIB-EX-3', name: 'Library Emergency Exit 3', type: 'emergency_exit', buildingId: 'b-library', floor: 3, isAvailable: true, coordinates: { x: 33, y: 56 } }
        ]
      }
    ]
  },
  {
    id: 'b-civil',
    name: 'Civil Engineering Block',
    code: 'CIVIL',
    category: 'academic',
    description: 'Civil Dept & Exam Halls LH 30, 32-35, 50, 53-55 with restrooms and water points.',
    coordinates: { x: 50, y: 30 },
    icon: 'Building',
    color: '#f59e0b',
    floors: [
      {
        level: 0,
        name: 'Ground Floor',
        rooms: [
          { id: 'r-lh50', code: 'LH50', name: 'Exam Hall LH 50', type: 'classroom', buildingId: 'b-civil', floor: 0, isAvailable: true, coordinates: { x: 50, y: 30 }, description: 'Ground Floor (CIVIL Dept.)' },
          { id: 'r-civil-mrr-0', code: 'CIVIL-MRR-0', name: 'Civil Block Men’s Restroom', type: 'restroom', buildingId: 'b-civil', floor: 0, isAvailable: true, coordinates: { x: 48, y: 31 } },
          { id: 'r-civil-wrr-0', code: 'CIVIL-WRR-0', name: 'Civil Block Women’s Restroom', type: 'restroom', buildingId: 'b-civil', floor: 0, isAvailable: true, coordinates: { x: 52, y: 31 } },
          { id: 'r-civil-wd-0', code: 'CIVIL-WD-0', name: 'Drinking Water Station', type: 'water', buildingId: 'b-civil', floor: 0, isAvailable: true, coordinates: { x: 50, y: 29 } }
        ]
      },
      {
        level: 1,
        name: '1st Floor (above CIVIL Dept.)',
        rooms: [
          { id: 'r-lh30', code: 'LH30', name: 'Exam Hall LH 30', type: 'classroom', buildingId: 'b-civil', floor: 1, isAvailable: true, coordinates: { x: 50, y: 30 }, description: '1st floor (above CIVIL Dept.)' }
        ]
      },
      {
        level: 2,
        name: '2nd Floor (above CIVIL Dept.)',
        rooms: [
          { id: 'r-lh32', code: 'LH32', name: 'Exam Hall LH 32', type: 'classroom', buildingId: 'b-civil', floor: 2, isAvailable: true, coordinates: { x: 49, y: 30 }, description: '2nd floor (above CIVIL Dept.)' },
          { id: 'r-lh33', code: 'LH33', name: 'Exam Hall LH 33', type: 'classroom', buildingId: 'b-civil', floor: 2, isAvailable: true, coordinates: { x: 50, y: 30 }, description: '2nd floor (above CIVIL Dept.)' },
          { id: 'r-lh53', code: 'LH53', name: 'Exam Hall LH 53', type: 'classroom', buildingId: 'b-civil', floor: 2, isAvailable: true, coordinates: { x: 50, y: 31 }, description: '2nd floor (above CIVIL Dept.)' },
          { id: 'r-lh54', code: 'LH54', name: 'Exam Hall LH 54', type: 'classroom', buildingId: 'b-civil', floor: 2, isAvailable: true, coordinates: { x: 51, y: 30 }, description: '2nd floor (above CIVIL Dept.)' },
          { id: 'r-lh55', code: 'LH55', name: 'Exam Hall LH 55', type: 'classroom', buildingId: 'b-civil', floor: 2, isAvailable: true, coordinates: { x: 51, y: 31 }, description: '2nd floor (above CIVIL Dept.)' }
        ]
      },
      {
        level: 3,
        name: '3rd Floor (above CIVIL Dept.)',
        rooms: [
          { id: 'r-lh34', code: 'LH34', name: 'Exam Hall LH 34', type: 'classroom', buildingId: 'b-civil', floor: 3, isAvailable: true, coordinates: { x: 49, y: 30 }, description: '3rd floor (above CIVIL Dept.)' },
          { id: 'r-lh34a', code: 'LH34A', name: 'Exam Hall LH 34A', type: 'classroom', buildingId: 'b-civil', floor: 3, isAvailable: true, coordinates: { x: 49, y: 31 }, description: '3rd floor (above CIVIL Dept.)' },
          { id: 'r-lh34b', code: 'LH34B', name: 'Exam Hall LH 34B', type: 'classroom', buildingId: 'b-civil', floor: 3, isAvailable: true, coordinates: { x: 50, y: 30 }, description: '3rd floor (above CIVIL Dept.)' },
          { id: 'r-lh34c', code: 'LH34C', name: 'Exam Hall LH 34C', type: 'classroom', buildingId: 'b-civil', floor: 3, isAvailable: true, coordinates: { x: 50, y: 31 }, description: '3rd floor (above CIVIL Dept.)' },
          { id: 'r-lh35', code: 'LH35', name: 'Exam Hall LH 35', type: 'classroom', buildingId: 'b-civil', floor: 3, isAvailable: true, coordinates: { x: 51, y: 30 }, description: '3rd floor (above CIVIL Dept.)' }
        ]
      }
    ]
  },
  {
    id: 'b-admin',
    name: 'Administration Block',
    code: 'ADMIN',
    category: 'admin',
    description: 'Central administrative offices, Exam cell, Principal Office, Exam Halls LH 36 to 41, elevators, and RO water filter.',
    coordinates: { x: 25, y: 65 },
    icon: 'Building2',
    color: '#6366f1',
    floors: [
      {
        level: 0,
        name: 'Ground Floor',
        rooms: [
          { id: 'r-exam-cell', code: 'EXAM-101', name: 'Office of Controller of Examinations', type: 'office', buildingId: 'b-admin', floor: 0, isAvailable: true, occupant: 'Controller of Exams', coordinates: { x: 24, y: 66 }, description: 'Exam Hall Seating Plan & Controller Office' },
          { id: 'r-reception', code: 'ADM-REC', name: 'Main Reception & Accounts', type: 'office', buildingId: 'b-admin', floor: 0, isAvailable: true, coordinates: { x: 26, y: 64 } },
          { id: 'r-admin-mrr-0', code: 'ADMIN-MRR-0', name: 'Admin Block Men’s Restroom', type: 'restroom', buildingId: 'b-admin', floor: 0, isAvailable: true, coordinates: { x: 23, y: 65 } },
          { id: 'r-admin-wrr-0', code: 'ADMIN-WRR-0', name: 'Admin Block Women’s Restroom', type: 'restroom', buildingId: 'b-admin', floor: 0, isAvailable: true, coordinates: { x: 27, y: 65 } },
          { id: 'r-admin-wd-0', code: 'ADMIN-WD-0', name: 'RO Water Unit', type: 'water', buildingId: 'b-admin', floor: 0, isAvailable: true, coordinates: { x: 25, y: 63 } },
          { id: 'r-admin-lift', code: 'ADMIN-LIFT', name: 'Admin Block Elevator', type: 'lift', buildingId: 'b-admin', floor: 0, isAvailable: true, coordinates: { x: 23, y: 66 } }
        ]
      },
      {
        level: 1,
        name: '1st Floor (above Office)',
        rooms: [
          { id: 'r-principal-office', code: 'PRIN-201', name: 'Principal Office', type: 'office', buildingId: 'b-admin', floor: 1, isAvailable: true, occupant: 'Dr. K. Swaminathan', coordinates: { x: 25, y: 65 } },
          { id: 'r-lh36', code: 'LH36', name: 'Exam Hall LH 36', type: 'classroom', buildingId: 'b-admin', floor: 1, isAvailable: true, coordinates: { x: 25, y: 64 }, description: '1st floor (above office)' },
          { id: 'r-lh37', code: 'LH37', name: 'Exam Hall LH 37', type: 'classroom', buildingId: 'b-admin', floor: 1, isAvailable: true, coordinates: { x: 26, y: 65 }, description: '1st floor (above office)' }
        ]
      },
      {
        level: 2,
        name: '2nd Floor (above Office)',
        rooms: [
          { id: 'r-lh38', code: 'LH38', name: 'Exam Hall LH 38', type: 'classroom', buildingId: 'b-admin', floor: 2, isAvailable: true, coordinates: { x: 25, y: 64 }, description: '2nd floor (above office)' },
          { id: 'r-lh39', code: 'LH39', name: 'Exam Hall LH 39', type: 'classroom', buildingId: 'b-admin', floor: 2, isAvailable: true, coordinates: { x: 26, y: 65 }, description: '2nd floor (above office)' }
        ]
      },
      {
        level: 3,
        name: '3rd Floor (above Office)',
        rooms: [
          { id: 'r-lh40', code: 'LH40', name: 'Exam Hall LH 40', type: 'classroom', buildingId: 'b-admin', floor: 3, isAvailable: true, coordinates: { x: 25, y: 64 }, description: '3rd floor (above office)' },
          { id: 'r-lh41', code: 'LH41', name: 'Exam Hall LH 41', type: 'classroom', buildingId: 'b-admin', floor: 3, isAvailable: true, coordinates: { x: 26, y: 65 }, description: '3rd floor (above office)' }
        ]
      }
    ]
  },
  {
    id: 'b-agri',
    name: 'Agriculture Department Block',
    code: 'AGRI',
    category: 'academic',
    description: 'Agricultural Engineering Dept & Exam Halls LH 42-45, MELH 09 & 10.',
    coordinates: { x: 65, y: 25 },
    icon: 'Sprout',
    color: '#84cc16',
    floors: [
      {
        level: 2,
        name: '2nd Floor (above AGRI Dept.)',
        rooms: [
          { id: 'r-lh42', code: 'LH42', name: 'Exam Hall LH 42', type: 'classroom', buildingId: 'b-agri', floor: 2, isAvailable: true, coordinates: { x: 65, y: 25 }, description: '2nd floor (above AGRI Dept.)' },
          { id: 'r-lh43', code: 'LH43', name: 'Exam Hall LH 43', type: 'classroom', buildingId: 'b-agri', floor: 2, isAvailable: true, coordinates: { x: 66, y: 25 }, description: '2nd floor (above AGRI Dept.)' },
          { id: 'r-melh09', code: 'MELH09', name: 'Exam Hall MELH 09', type: 'classroom', buildingId: 'b-agri', floor: 2, isAvailable: true, coordinates: { x: 65, y: 26 }, description: '2nd floor (above AGRI Dept.)' },
          { id: 'r-melh10', code: 'MELH10', name: 'Exam Hall MELH 10', type: 'classroom', buildingId: 'b-agri', floor: 2, isAvailable: true, coordinates: { x: 66, y: 26 }, description: '2nd floor (above AGRI Dept.)' },
          { id: 'r-agri-mrr-2', code: 'AGRI-MRR-2', name: 'Agri Block Restroom', type: 'restroom', buildingId: 'b-agri', floor: 2, isAvailable: true, coordinates: { x: 64, y: 26 } },
          { id: 'r-agri-wd-2', code: 'AGRI-WD-2', name: 'Agri Water Dispenser', type: 'water', buildingId: 'b-agri', floor: 2, isAvailable: true, coordinates: { x: 65, y: 24 } }
        ]
      },
      {
        level: 3,
        name: '3rd Floor (above AGRI Dept.)',
        rooms: [
          { id: 'r-lh44', code: 'LH44', name: 'Exam Hall LH 44', type: 'classroom', buildingId: 'b-agri', floor: 3, isAvailable: true, coordinates: { x: 65, y: 25 }, description: '3rd floor (above AGRI Dept.)' },
          { id: 'r-lh45', code: 'LH45', name: 'Exam Hall LH 45', type: 'classroom', buildingId: 'b-agri', floor: 3, isAvailable: true, coordinates: { x: 66, y: 25 }, description: '3rd floor (above AGRI Dept.)' }
        ]
      }
    ]
  },
  {
    id: 'b-eee',
    name: 'Electrical & Electronics (EEE) Block',
    code: 'EEE',
    category: 'academic',
    description: 'EEE Dept & Exam Halls LH 46-49, MELH 12, MELH 13 & 14.',
    coordinates: { x: 55, y: 55 },
    icon: 'Zap',
    color: '#06b6d4',
    floors: [
      {
        level: 1,
        name: '1st Floor (above EEE Dept.)',
        rooms: [
          { id: 'r-lh46', code: 'LH46', name: 'Exam Hall LH 46', type: 'classroom', buildingId: 'b-eee', floor: 1, isAvailable: true, coordinates: { x: 55, y: 55 }, description: '1st floor (above EEE Dept.)' },
          { id: 'r-lh47', code: 'LH47', name: 'Exam Hall LH 47', type: 'classroom', buildingId: 'b-eee', floor: 1, isAvailable: true, coordinates: { x: 56, y: 55 }, description: '1st floor (above EEE Dept.)' },
          { id: 'r-melh12', code: 'MELH12', name: 'Exam Hall MELH 12', type: 'classroom', buildingId: 'b-eee', floor: 1, isAvailable: true, coordinates: { x: 55, y: 56 }, description: '1st floor (above EEE Dept.)' },
          { id: 'r-eee-mrr-1', code: 'EEE-MRR-1', name: 'EEE block Restroom', type: 'restroom', buildingId: 'b-eee', floor: 1, isAvailable: true, coordinates: { x: 54, y: 55 } },
          { id: 'r-eee-wd-1', code: 'EEE-WD-1', name: 'EEE water dispenser', type: 'water', buildingId: 'b-eee', floor: 1, isAvailable: true, coordinates: { x: 56, y: 56 } }
        ]
      },
      {
        level: 2,
        name: '2nd Floor (above EEE Dept.)',
        rooms: [
          { id: 'r-lh48', code: 'LH48', name: 'Exam Hall LH 48', type: 'classroom', buildingId: 'b-eee', floor: 2, isAvailable: true, coordinates: { x: 55, y: 55 }, description: '2nd floor (above EEE Dept.)' },
          { id: 'r-lh49', code: 'LH49', name: 'Exam Hall LH 49', type: 'classroom', buildingId: 'b-eee', floor: 2, isAvailable: true, coordinates: { x: 56, y: 55 }, description: '2nd floor (above EEE Dept.)' },
          { id: 'r-melh13', code: 'MELH13', name: 'Exam Hall MELH 13', type: 'classroom', buildingId: 'b-eee', floor: 2, isAvailable: true, coordinates: { x: 55, y: 56 }, description: '2nd floor (above EEE Dept.)' },
          { id: 'r-melh14', code: 'MELH14', name: 'Exam Hall MELH 14', type: 'classroom', buildingId: 'b-eee', floor: 2, isAvailable: true, coordinates: { x: 56, y: 56 }, description: '2nd floor (above EEE Dept.)' }
        ]
      }
    ]
  },
  {
    id: 'b-mech',
    name: 'Mechanical Engineering Block',
    code: 'MECH',
    category: 'academic',
    description: 'Mechanical Engineering Dept & Exam Halls LH 51 & LH 52 with restrooms.',
    coordinates: { x: 70, y: 60 },
    icon: 'Wrench',
    color: '#f97316',
    floors: [
      {
        level: 0,
        name: 'Ground Floor',
        rooms: [
          { id: 'r-lh51', code: 'LH51', name: 'Exam Hall LH 51', type: 'classroom', buildingId: 'b-mech', floor: 0, isAvailable: true, coordinates: { x: 70, y: 60 }, description: 'Ground Floor - Mechanical Dept.' },
          { id: 'r-lh52', code: 'LH52', name: 'Exam Hall LH 52', type: 'classroom', buildingId: 'b-mech', floor: 0, isAvailable: true, coordinates: { x: 71, y: 60 }, description: 'Ground Floor - Mechanical Dept.' },
          { id: 'r-mech-mrr-0', code: 'MECH-MRR-0', name: 'Mechanical Men’s Restroom', type: 'restroom', buildingId: 'b-mech', floor: 0, isAvailable: true, coordinates: { x: 69, y: 60 } },
          { id: 'r-mech-wrr-0', code: 'MECH-WRR-0', name: 'Mechanical Women’s Restroom', type: 'restroom', buildingId: 'b-mech', floor: 0, isAvailable: true, coordinates: { x: 72, y: 60 } },
          { id: 'r-mech-wd-0', code: 'MECH-WD-0', name: 'Water Point', type: 'water', buildingId: 'b-mech', floor: 0, isAvailable: true, coordinates: { x: 70, y: 59 } }
        ]
      }
    ]
  },
  {
    id: 'b-techpark',
    name: 'Tech Park (New Block)',
    code: 'TECH',
    category: 'academic',
    description: 'Advanced innovation labs, Placement Cell, ICICI ATM, Tech Park security desk, lifts, and fire escape.',
    coordinates: { x: 75, y: 45 },
    icon: 'Cpu',
    color: '#ec4899',
    floors: [
      {
        level: 0,
        name: 'Ground Floor',
        rooms: [
          { id: 'r-placement-cell', code: 'PLACE-01', name: 'Placement Cell', type: 'office', buildingId: 'b-techpark', floor: 0, isAvailable: true, occupant: 'Prof. S. Rajesh (Training Officer)', coordinates: { x: 74, y: 46 }, description: 'Campus placements, interview cabins, and resume support.' },
          { id: 'r-tech-atm', code: 'TECH-ATM-ICICI', name: 'ICICI Bank ATM', type: 'atm', buildingId: 'b-techpark', floor: 0, isAvailable: true, coordinates: { x: 76, y: 46 }, description: 'ICICI Bank 24/7 ATM kiosk' },
          { id: 'r-tech-sec', code: 'TECH-SEC-01', name: 'Tech Park Security Desk', type: 'security', buildingId: 'b-techpark', floor: 0, isAvailable: true, coordinates: { x: 75, y: 44 }, description: 'Security checkpoint and visitor check-in' },
          { id: 'r-tech-mrr-0', code: 'TECH-MRR-0', name: 'Tech Park Men’s Restroom', type: 'restroom', buildingId: 'b-techpark', floor: 0, isAvailable: true, coordinates: { x: 73, y: 45 } },
          { id: 'r-tech-wrr-0', code: 'TECH-WRR-0', name: 'Tech Park Women’s Restroom', type: 'restroom', buildingId: 'b-techpark', floor: 0, isAvailable: true, coordinates: { x: 77, y: 45 } },
          { id: 'r-tech-wd-0', code: 'TECH-WD-0', name: 'RO Drinking Water point', type: 'water', buildingId: 'b-techpark', floor: 0, isAvailable: true, coordinates: { x: 75, y: 43 } },
          { id: 'r-tech-lift', code: 'TECH-LIFT', name: 'Tech Park Accessible Elevator', type: 'lift', buildingId: 'b-techpark', floor: 0, isAvailable: true, coordinates: { x: 73, y: 46 }, accessibilityInfo: 'Fully equipped for students with disabilities' }
        ]
      },
      {
        level: 1,
        name: '1st floor (Tech Park) - New Block',
        rooms: [
          { id: 'r-hall-1a1', code: '1A-I', name: 'Exam Hall 1A (Section I)', type: 'classroom', buildingId: 'b-techpark', floor: 1, isAvailable: true, coordinates: { x: 74, y: 45 }, description: '1st floor (Tech Park) - New Block' },
          { id: 'r-hall-1a2', code: '1A-II', name: 'Exam Hall 1A (Section II)', type: 'classroom', buildingId: 'b-techpark', floor: 1, isAvailable: true, coordinates: { x: 74, y: 46 }, description: '1st floor (Tech Park) - New Block' },
          { id: 'r-hall-1b1', code: '1B-I', name: 'Exam Hall 1B (Section I)', type: 'classroom', buildingId: 'b-techpark', floor: 1, isAvailable: true, coordinates: { x: 75, y: 45 }, description: '1st floor (Tech Park) - New Block' },
          { id: 'r-hall-1b2', code: '1B-II', name: 'Exam Hall 1B (Section II)', type: 'classroom', buildingId: 'b-techpark', floor: 1, isAvailable: true, coordinates: { x: 75, y: 46 }, description: '1st floor (Tech Park) - New Block' },
          { id: 'r-hall-1b3', code: '1B-III', name: 'Exam Hall 1B (Section III)', type: 'classroom', buildingId: 'b-techpark', floor: 1, isAvailable: true, coordinates: { x: 75, y: 47 }, description: '1st floor (Tech Park) - New Block' },
          { id: 'r-hall-1c1', code: '1C-I', name: 'Exam Hall 1C (Section I)', type: 'classroom', buildingId: 'b-techpark', floor: 1, isAvailable: true, coordinates: { x: 76, y: 45 }, description: '1st floor (Tech Park) - New Block' },
          { id: 'r-hall-1c2', code: '1C-II', name: 'Exam Hall 1C (Section II)', type: 'classroom', buildingId: 'b-techpark', floor: 1, isAvailable: true, coordinates: { x: 76, y: 46 }, description: '1st floor (Tech Park) - New Block' },
          { id: 'r-hall-1c3', code: '1C-III', name: 'Exam Hall 1C (Section III)', type: 'classroom', buildingId: 'b-techpark', floor: 1, isAvailable: true, coordinates: { x: 76, y: 47 }, description: '1st floor (Tech Park) - New Block' },
          { id: 'r-tech-mrr-1', code: 'TECH-MRR-1', name: 'Restroom (1st Floor Tech Park)', type: 'restroom', buildingId: 'b-techpark', floor: 1, isAvailable: true, coordinates: { x: 73, y: 45 } }
        ]
      },
      {
        level: 2,
        name: '2nd floor (Tech Park) - New Block',
        rooms: [
          { id: 'r-hall-2a1', code: '2A-I', name: 'Exam Hall 2A (Section I)', type: 'classroom', buildingId: 'b-techpark', floor: 2, isAvailable: true, coordinates: { x: 74, y: 45 }, description: '2nd floor (Tech Park) - New Block' },
          { id: 'r-hall-2a2', code: '2A-II', name: 'Exam Hall 2A (Section II)', type: 'classroom', buildingId: 'b-techpark', floor: 2, isAvailable: true, coordinates: { x: 74, y: 46 }, description: '2nd floor (Tech Park) - New Block' },
          { id: 'r-hall-2b1', code: '2B-I', name: 'Exam Hall 2B (Section I)', type: 'classroom', buildingId: 'b-techpark', floor: 2, isAvailable: true, coordinates: { x: 75, y: 45 }, description: '2nd floor (Tech Park) - New Block' },
          { id: 'r-hall-2b2', code: '2B-II', name: 'Exam Hall 2B (Section II)', type: 'classroom', buildingId: 'b-techpark', floor: 2, isAvailable: true, coordinates: { x: 75, y: 46 }, description: '2nd floor (Tech Park) - New Block' },
          { id: 'r-hall-2b3', code: '2B-III', name: 'Exam Hall 2B (Section III)', type: 'classroom', buildingId: 'b-techpark', floor: 2, isAvailable: true, coordinates: { x: 75, y: 47 }, description: '2nd floor (Tech Park) - New Block' },
          { id: 'r-hall-2c1', code: '2C-I', name: 'Exam Hall 2C (Section I)', type: 'classroom', buildingId: 'b-techpark', floor: 2, isAvailable: true, coordinates: { x: 76, y: 45 }, description: '2nd floor (Tech Park) - New Block' },
          { id: 'r-hall-2c2', code: '2C-II', name: 'Exam Hall 2C (Section II)', type: 'classroom', buildingId: 'b-techpark', floor: 2, isAvailable: true, coordinates: { x: 76, y: 46 }, description: '2nd floor (Tech Park) - New Block' },
          { id: 'r-hall-2c3', code: '2C-III', name: 'Exam Hall 2C (Section III)', type: 'classroom', buildingId: 'b-techpark', floor: 2, isAvailable: true, coordinates: { x: 76, y: 47 }, description: '2nd floor (Tech Park) - New Block' },
          { id: 'r-tech-mrr-2', code: 'TECH-MRR-2', name: 'Restroom (2nd Floor Tech Park)', type: 'restroom', buildingId: 'b-techpark', floor: 2, isAvailable: true, coordinates: { x: 73, y: 45 } },
          { id: 'r-tech-exit-2', code: 'TECH-EX-2', name: 'Tech Park Emergency Exit', type: 'emergency_exit', buildingId: 'b-techpark', floor: 2, isAvailable: true, coordinates: { x: 77, y: 47 } }
        ]
      }
    ]
  },
  {
    id: 'b-auditorium',
    name: 'Main Auditorium & Seminar Hall',
    code: 'AUD',
    category: 'facility',
    description: '1500-seat multi-purpose hall for campus symposiums, cultural activities, and events.',
    coordinates: { x: 50, y: 65 },
    icon: 'Sparkles',
    color: '#f59e0b',
    floors: [
      {
        level: 0,
        name: 'Ground Floor',
        rooms: [
          { id: 'r-audi-main', code: 'AUD-MAIN', name: 'Grand Auditorium', type: 'auditorium', buildingId: 'b-auditorium', floor: 0, capacity: 1500, isAvailable: true, coordinates: { x: 49, y: 66 }, accessibilityInfo: 'Double door entry, wheelchair ramps to main stage' },
          { id: 'r-seminar-hall', code: 'SEM-101', name: 'Kavimani Seminar Hall', type: 'seminar', buildingId: 'b-auditorium', floor: 0, capacity: 250, isAvailable: true, coordinates: { x: 51, y: 64 }, description: 'Ground Floor - Auditorium Block' },
          { id: 'r-audi-mrr-0', code: 'AUD-MRR-0', name: 'Auditorium Men’s Restroom', type: 'restroom', buildingId: 'b-auditorium', floor: 0, isAvailable: true, coordinates: { x: 48, y: 64 } },
          { id: 'r-audi-wrr-0', code: 'AUD-WRR-0', name: 'Auditorium Women’s Restroom', type: 'restroom', buildingId: 'b-auditorium', floor: 0, isAvailable: true, coordinates: { x: 52, y: 66 } }
        ]
      }
    ]
  },
  {
    id: 'b-canteen',
    name: 'Campus Canteen & Food Court',
    code: 'FOOD',
    category: 'facility',
    description: 'Multi-cuisine food court, juice bar, coffee lounge, restrooms, and drinking water facilities.',
    coordinates: { x: 65, y: 70 },
    icon: 'Utensils',
    color: '#f97316',
    floors: [
      {
        level: 0,
        name: 'Ground Floor',
        rooms: [
          { id: 'r-canteen-main', code: 'CAN-01', name: 'Central Food Court', type: 'canteen', buildingId: 'b-canteen', floor: 0, capacity: 350, isAvailable: true, coordinates: { x: 65, y: 70 }, openingHours: '08:00 AM - 07:00 PM' },
          { id: 'r-canteen-mrr-0', code: 'CAN-MRR-0', name: 'Canteen Restroom', type: 'restroom', buildingId: 'b-canteen', floor: 0, isAvailable: true, coordinates: { x: 63, y: 70 } },
          { id: 'r-canteen-wd-0', code: 'CAN-WD-0', name: 'Canteen Water Point', type: 'water', buildingId: 'b-canteen', floor: 0, isAvailable: true, coordinates: { x: 67, y: 70 } }
        ]
      }
    ]
  },
  {
    id: 'b-boys-hostel',
    name: 'Boys Hostel Complex',
    code: 'BHOST',
    category: 'hostel',
    description: 'Residential quarters for male students with mess, RO water points, and restrooms.',
    coordinates: { x: 85, y: 25 },
    icon: 'Home',
    color: '#06b6d4',
    floors: [
      {
        level: 0,
        name: 'Ground Floor',
        rooms: [
          { id: 'r-bhostel-warden', code: 'BH-WARDEN', name: 'Boys Hostel Warden Office', type: 'office', buildingId: 'b-boys-hostel', floor: 0, isAvailable: true, coordinates: { x: 85, y: 25 } },
          { id: 'r-bhostel-mrr-0', code: 'BH-MRR-0', name: 'Hostel Block Restrooms', type: 'restroom', buildingId: 'b-boys-hostel', floor: 0, isAvailable: true, coordinates: { x: 84, y: 25 } },
          { id: 'r-bhostel-wd-0', code: 'BH-WD-0', name: 'Hostel RO Purifier', type: 'water', buildingId: 'b-boys-hostel', floor: 0, isAvailable: true, coordinates: { x: 86, y: 25 } }
        ]
      }
    ]
  },
  {
    id: 'b-girls-hostel',
    name: 'Girls Hostel Complex',
    code: 'G-HOSTEL',
    category: 'hostel',
    description: 'Secure residential quarters for female students with dining hall, RO water, and restrooms.',
    coordinates: { x: 85, y: 75 },
    icon: 'Home',
    color: '#f43f5e',
    floors: [
      {
        level: 0,
        name: 'Ground Floor',
        rooms: [
          { id: 'r-ghostel-warden', code: 'GH-WARDEN', name: 'Girls Hostel Warden Office', type: 'office', buildingId: 'b-girls-hostel', floor: 0, isAvailable: true, coordinates: { x: 85, y: 75 } },
          { id: 'r-ghostel-mrr-0', code: 'GH-MRR-0', name: 'Hostel Restroom Block', type: 'restroom', buildingId: 'b-girls-hostel', floor: 0, isAvailable: true, coordinates: { x: 84, y: 75 } },
          { id: 'r-ghostel-wd-0', code: 'GH-WD-0', name: 'Hostel RO Purifier', type: 'water', buildingId: 'b-girls-hostel', floor: 0, isAvailable: true, coordinates: { x: 86, y: 75 } }
        ]
      }
    ]
  },
  {
    id: 'b-medical',
    name: 'Campus Medical Centre',
    code: 'MED',
    category: 'medical',
    description: '24/7 First aid, emergency medical unit, paramedic room, and ambulance station.',
    coordinates: { x: 20, y: 40 },
    icon: 'Cross',
    color: '#ef4444',
    floors: [
      {
        level: 0,
        name: 'Ground Floor',
        rooms: [
          { id: 'r-med-emergency', code: 'MED-EMERGENCY', name: 'Emergency Medical Ward', type: 'medical', buildingId: 'b-medical', floor: 0, isAvailable: true, occupant: 'Dr. A. Anand (Resident Medical Officer)', coordinates: { x: 20, y: 40 }, description: 'Emergency response, oxygen supply, and paramedic assistance. Call 108 from campus extension.' },
          { id: 'r-med-mrr', code: 'MED-MRR', name: 'Clinic Restroom', type: 'restroom', buildingId: 'b-medical', floor: 0, isAvailable: true, coordinates: { x: 19, y: 41 } }
        ]
      }
    ]
  },
  {
    id: 'b-sports',
    name: 'Sports Complex & Ground',
    code: 'SPORT',
    category: 'sports',
    description: 'Football field, basketball courts, athletics track, and physical education department office.',
    coordinates: { x: 40, y: 85 },
    icon: 'Trophy',
    color: '#84cc16',
    floors: [
      {
        level: 0,
        name: 'Ground Level',
        rooms: [
          { id: 'r-sports-office', code: 'SPORT-OFF', name: 'Physical Education Office', type: 'office', buildingId: 'b-sports', floor: 0, isAvailable: true, occupant: 'Coach G. Selvam', coordinates: { x: 40, y: 85 } },
          { id: 'r-sport-mrr', code: 'SPORT-MRR', name: 'Sports Restroom Area', type: 'restroom', buildingId: 'b-sports', floor: 0, isAvailable: true, coordinates: { x: 39, y: 86 } },
          { id: 'r-sport-wd', code: 'SPORT-WD', name: 'Water Dispenser', type: 'water', buildingId: 'b-sports', floor: 0, isAvailable: true, coordinates: { x: 41, y: 84 } }
        ]
      }
    ]
  }
];

export const INITIAL_PATH_NODES: PathNode[] = [
  { id: 'n-gate', name: 'Main Gate Crossing', coordinates: { x: 15, y: 85 } },
  { id: 'n-admin', name: 'Admin Block Entrance', coordinates: { x: 25, y: 65 } },
  { id: 'n-acad', name: 'Academic Block Entrance', coordinates: { x: 30, y: 45 } },
  { id: 'n-med', name: 'Medical Center Entrance', coordinates: { x: 20, y: 40 } },
  { id: 'n-lib', name: 'Library Plaza', coordinates: { x: 35, y: 55 } },
  { id: 'n-civil', name: 'Civil Dept Quad', coordinates: { x: 50, y: 30 } },
  { id: 'n-agri', name: 'Agri Dept Entrance', coordinates: { x: 65, y: 25 } },
  { id: 'n-eee', name: 'EEE Dept Corridor', coordinates: { x: 55, y: 55 } },
  { id: 'n-mech', name: 'Mechanical Block Gate', coordinates: { x: 70, y: 60 } },
  { id: 'n-tech', name: 'Tech Park Plaza', coordinates: { x: 75, y: 45 } },
  { id: 'n-audi', name: 'Auditorium Foyer', coordinates: { x: 50, y: 65 } },
  { id: 'n-canteen', name: 'Food Court Plaza', coordinates: { x: 65, y: 70 } },
  { id: 'n-bhostel', name: 'Boys Hostel Entrance', coordinates: { x: 85, y: 25 } },
  { id: 'n-ghostel', name: 'Girls Hostel Entrance', coordinates: { x: 85, y: 75 } },
  { id: 'n-sports', name: 'Sports Stadium Gate', coordinates: { x: 40, y: 85 } }
];

export const INITIAL_PATH_EDGES: PathEdge[] = [
  { from: 'n-gate', to: 'n-admin', distanceMeters: 120, isAccessible: true, type: 'walkway' },
  { from: 'n-gate', to: 'n-sports', distanceMeters: 150, isAccessible: true, type: 'walkway' },
  { from: 'n-admin', to: 'n-med', distanceMeters: 90, isAccessible: true, type: 'walkway' },
  { from: 'n-admin', to: 'n-lib', distanceMeters: 75, isAccessible: true, type: 'walkway' },
  { from: 'n-admin', to: 'n-acad', distanceMeters: 80, isAccessible: true, type: 'walkway' },
  { from: 'n-acad', to: 'n-civil', distanceMeters: 110, isAccessible: true, type: 'walkway' },
  { from: 'n-civil', to: 'n-agri', distanceMeters: 95, isAccessible: true, type: 'walkway' },
  { from: 'n-agri', to: 'n-tech', distanceMeters: 100, isAccessible: true, type: 'walkway' },
  { from: 'n-lib', to: 'n-eee', distanceMeters: 85, isAccessible: true, type: 'walkway' },
  { from: 'n-eee', to: 'n-mech', distanceMeters: 90, isAccessible: true, type: 'walkway' },
  { from: 'n-tech', to: 'n-bhostel', distanceMeters: 140, isAccessible: true, type: 'walkway' },
  { from: 'n-audi', to: 'n-canteen', distanceMeters: 70, isAccessible: true, type: 'walkway' },
  { from: 'n-canteen', to: 'n-ghostel', distanceMeters: 130, isAccessible: true, type: 'walkway' },
  { from: 'n-sports', to: 'n-audi', distanceMeters: 120, isAccessible: true, type: 'walkway' }
];

export const INITIAL_USERS: User[] = [
  {
    id: 'u-student-1',
    name: 'Rahul Sharma',
    email: 'rahul.21it105@siet.edu.in',
    role: 'student',
    registerNumber: '7376211IT105',
    department: 'Information Technology',
    year: 3,
    section: 'A',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    liveLocationSharing: true,
    privacySetting: 'campus',
    currentCoordinates: { x: 35, y: 55, buildingId: 'b-library', floor: 2 },
    lastLocationUpdate: 'Just now'
  },
  {
    id: 'u-faculty-1',
    name: 'Dr. Prakash',
    email: 'prakash.it@siet.edu.in',
    role: 'faculty',
    employeeId: 'EMP-IT-402',
    department: 'Information Technology',
    designation: 'HOD & Professor',
    roomNumber: 'LH25 / Office 204',
    buildingId: 'b-library',
    subjects: ['Computer Networks', 'Cloud Computing Architecture'],
    status: 'Available',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    liveLocationSharing: true,
    privacySetting: 'campus',
    currentCoordinates: { x: 35, y: 55, buildingId: 'b-library', floor: 2 },
    lastLocationUpdate: '10 seconds ago'
  },
  {
    id: 'u-faculty-2',
    name: 'Dr. R. Meenakshi',
    email: 'meenakshi.cse@siet.edu.in',
    role: 'faculty',
    employeeId: 'EMP-CSE-301',
    department: 'Computer Science',
    designation: 'Professor & Head',
    roomNumber: 'LH 34A',
    buildingId: 'b-civil',
    subjects: ['Artificial Intelligence', 'Machine Learning'],
    status: 'In Meeting',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    liveLocationSharing: false,
    privacySetting: 'friends',
    currentCoordinates: { x: 50, y: 30, buildingId: 'b-civil', floor: 3 },
    lastLocationUpdate: '2 mins ago'
  },
  {
    id: 'u-admin-1',
    name: 'Prof. Vignesh (Admin)',
    email: 'admin.campus@siet.edu.in',
    role: 'admin',
    permissions: ['all'],
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    liveLocationSharing: true,
    privacySetting: 'campus',
    currentCoordinates: { x: 25, y: 65, buildingId: 'b-admin', floor: 1 }
  }
];

export const INITIAL_TIMETABLE: TimetableSlot[] = [
  {
    id: 't1',
    day: 'Today',
    time: '09:00 AM - 10:00 AM',
    subject: 'Data Structures & Algorithms',
    roomCode: 'LH25',
    buildingId: 'b-library',
    facultyName: 'Dr. R. Meenakshi'
  },
  {
    id: 't2',
    day: 'Today',
    time: '10:00 AM - 11:00 AM',
    subject: 'Operating Systems',
    roomCode: 'LH26',
    buildingId: 'b-library',
    facultyName: 'Prof. Vignesh'
  },
  {
    id: 't3',
    day: 'Today',
    time: '11:00 AM - 12:00 PM',
    subject: 'Computer Networks',
    roomCode: 'LH25',
    buildingId: 'b-library',
    facultyName: 'Dr. Prakash'
  },
  {
    id: 't4',
    day: 'Today',
    time: '02:00 PM - 03:30 PM',
    subject: 'AI Workshop',
    roomCode: '1A-I',
    buildingId: 'b-techpark',
    facultyName: 'Dr. R. Meenakshi'
  },
  {
    id: 't5',
    day: 'Tomorrow',
    time: '09:00 AM - 10:00 AM',
    subject: 'Database Management Systems',
    roomCode: 'LH30',
    buildingId: 'b-civil',
    facultyName: 'Dr. Prakash'
  },
  {
    id: 't6',
    day: 'Tomorrow',
    time: '11:00 AM - 01:00 PM',
    subject: 'Web Development Lab',
    roomCode: 'PLACE-01',
    buildingId: 'b-techpark',
    facultyName: 'Prof. S. Rajesh'
  }
];

export const INITIAL_EVENTS: CampusEvent[] = [
  {
    id: 'ev-1',
    title: 'Semester Autonomous End Examination - Hall Allocation Published',
    description: 'Official Exam Hall Seating arrangement released by Controller of Examinations for LH01 to LH55, MELH, and Tech Park.',
    date: 'Today',
    time: '09:30 AM onwards',
    venueBuildingId: 'b-admin',
    venueRoomCode: 'EXAM-101',
    organizer: 'Office of the Controller of Examinations',
    category: 'academic',
    registeredCount: 850,
    coordinates: { x: 25, y: 65 }
  },
  {
    id: 'ev-2',
    title: 'HackCampus 2026 - National AI Hackathon',
    description: '24-hour national hackathon in Tech Park 1st floor exam halls 1A & 1B.',
    date: 'Aug 15, 2026',
    time: '09:00 AM',
    venueBuildingId: 'b-techpark',
    venueRoomCode: '1A-I',
    organizer: 'SIET Tech Incubation Cell',
    category: 'tech',
    registeredCount: 320,
    coordinates: { x: 75, y: 45 }
  },
  {
    id: 'ev-3',
    title: 'Sports Day Athletics Selection',
    description: 'Track and field athletics selections for the annual sports meet. Open to all students.',
    date: 'Aug 18, 2026',
    time: '03:00 PM',
    venueBuildingId: 'b-sports',
    venueRoomCode: 'SPORT-OFF',
    organizer: 'Physical Education Department',
    category: 'sports',
    registeredCount: 150,
    coordinates: { x: 40, y: 85 }
  },
  {
    id: 'ev-4',
    title: 'Entrepreneurship & Startup Seminar',
    description: 'Interactive talk by successful alumni founders on how to kickstart your business idea.',
    date: 'Aug 20, 2026',
    time: '11:00 AM',
    venueBuildingId: 'b-auditorium',
    venueRoomCode: 'SEM-101',
    organizer: 'SIET ED Cell',
    category: 'workshop',
    registeredCount: 180,
    coordinates: { x: 50, y: 65 }
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n1',
    roleTarget: 'all',
    title: '📋 Exam Hall Location Allotment Released!',
    message: 'Official Exam Hall Locations (LH 01-55, MELH 09-14, Tech Park 1A-2C) updated on CampusPulse.',
    type: 'info',
    timestamp: 'Just now',
    isRead: false
  },
  {
    id: 'n2',
    roleTarget: 'student',
    title: 'Exam Hall Allotted: LH 25',
    message: 'Your exam/class is at LH 25 (Library Block Floor 2). Click to Navigate.',
    type: 'class_change',
    timestamp: '5 mins ago',
    isRead: false,
    link: 'LH25'
  },
  {
    id: 'n3',
    roleTarget: 'faculty',
    title: 'Meeting Request: Rahul Sharma',
    message: 'Student Rahul Sharma has requested a project review meeting in your office.',
    type: 'status_update',
    timestamp: '1 hour ago',
    isRead: false
  }
];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    title: 'Welcome to SIET Smart Campus Portal',
    message: 'We are thrilled to launch the CampusPulse Smart Navigation system. Use it to find classrooms, facilities, and track faculty availability in real-time.',
    timestamp: '2 hours ago',
    category: 'general',
    roleTarget: 'all',
    author: 'Principal Office'
  },
  {
    id: 'ann-2',
    title: 'End Semester University Exam Guidelines',
    message: 'Students are requested to report to their assigned exam halls (LH01 - LH55) 15 minutes before the exam time. Carry your ID card.',
    timestamp: 'Today, 08:00 AM',
    category: 'academic',
    roleTarget: 'student',
    author: 'Controller of Examinations'
  },
  {
    id: 'ann-3',
    title: 'Availability Status Updates for Faculty',
    message: 'Please update your Availability status on the dashboard during class sessions or meetings to help students plan their visits.',
    timestamp: 'Yesterday',
    category: 'general',
    roleTarget: 'faculty',
    author: 'Dean Academics'
  },
  {
    id: 'ann-4',
    title: 'Emergency Medical SOS Simulation Drill',
    message: 'A campus-wide emergency SOS response simulation drill will be conducted next Friday at 03:00 PM.',
    timestamp: '3 days ago',
    category: 'emergency',
    roleTarget: 'all',
    author: 'Campus Security & Health Office'
  }
];
