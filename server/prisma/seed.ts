/**
 * ============================================================================
 * SIET Smart Campus Navigation — Master Seed Script
 * ============================================================================
 * NOTICE: The dataset below contains realistic sample placeholder data for
 * Sri Shakthi Institute of Engineering & Technology (SIET).
 * MARKED FOR EASY CUSTOMIZATION / REPLACEMENT WITH OFFICIAL CAMPUS DATA.
 * ============================================================================
 */

import { PrismaClient, Role, PlaceType, NodeKind, DayOfWeek } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

// Campus base coordinate anchor (SIET Coimbatore)
const SIET_LAT = 11.0827;
const SIET_LNG = 77.0607;

export async function seedCampusData() {
  console.log('🌱 Starting SIET Campus Database Seeding...');

  // 1. CLEAN EXISTING DATA (Reverse dependency order)
  await prisma.auditLog.deleteMany();
  await prisma.feedback.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.notificationReceipt.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.examHallChange.deleteMany();
  await prisma.examHall.deleteMany();
  await prisma.exam.deleteMany();
  await prisma.timetableChange.deleteMany();
  await prisma.timetableSlot.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.deviceToken.deleteMany();
  await prisma.user.deleteMany();
  await prisma.department.deleteMany();
  await prisma.navEdge.deleteMany();
  await prisma.place.deleteMany();
  await prisma.navNode.deleteMany();
  await prisma.floor.deleteMany();
  await prisma.building.deleteMany();

  // 2. CREATE DEPARTMENTS
  const cseDept = await prisma.department.create({
    data: { name: 'Computer Science & Engineering', code: 'CSE' },
  });
  const itDept = await prisma.department.create({
    data: { name: 'Information Technology', code: 'IT' },
  });
  console.log('✅ Created Departments: CSE, IT');

  // 3. CREATE USERS (Admin, Faculty, Students)
  const defaultPassword = await argon2.hash('Siet@2026Nav!');

  const adminUser = await prisma.user.create({
    data: {
      name: 'Campus Administrator',
      email: 'admin@siet.ac.in',
      passwordHash: defaultPassword,
      role: Role.ADMIN,
    },
  });

  const faculty1 = await prisma.user.create({
    data: {
      name: 'Dr. Ramesh Kumar',
      email: 'ramesh.cse@siet.ac.in',
      passwordHash: defaultPassword,
      role: Role.FACULTY,
      departmentId: cseDept.id,
    },
  });

  const faculty2 = await prisma.user.create({
    data: {
      name: 'Prof. Priya Sundaram',
      email: 'priya.it@siet.ac.in',
      passwordHash: defaultPassword,
      role: Role.FACULTY,
      departmentId: itDept.id,
    },
  });

  const student1 = await prisma.user.create({
    data: {
      name: 'Aravind Swaminathan',
      email: 'aravind.siet@siet.ac.in',
      passwordHash: defaultPassword,
      role: Role.STUDENT,
      departmentId: cseDept.id,
      year: 3,
      section: 'A',
      rollNo: '714021104012',
    },
  });

  const student2 = await prisma.user.create({
    data: {
      name: 'Kavya Dharshini',
      email: 'kavya.siet@siet.ac.in',
      passwordHash: defaultPassword,
      role: Role.STUDENT,
      departmentId: cseDept.id,
      year: 3,
      section: 'A',
      rollNo: '714021104025',
    },
  });
  console.log('✅ Created Users (Admin, 2 Faculty, 2 Students)');

  // 4. CREATE BUILDINGS
  const acadBuilding = await prisma.building.create({
    data: {
      name: 'Main Academic Block',
      code: 'ACAD',
      description: 'Primary lecture halls LH 01 to LH 12 and core engineering labs',
      centerLat: SIET_LAT + 0.0005,
      centerLng: SIET_LNG + 0.0003,
      footprint: {
        type: 'Polygon',
        coordinates: [
          [
            [SIET_LNG + 0.0001, SIET_LAT + 0.0003],
            [SIET_LNG + 0.0005, SIET_LAT + 0.0003],
            [SIET_LNG + 0.0005, SIET_LAT + 0.0007],
            [SIET_LNG + 0.0001, SIET_LAT + 0.0007],
            [SIET_LNG + 0.0001, SIET_LAT + 0.0003],
          ],
        ],
      },
    },
  });

  const libBuilding = await prisma.building.create({
    data: {
      name: 'Central Library & Auditorium Block',
      code: 'LIB',
      description: 'Central reading halls, digital repository & seminar auditoriums',
      centerLat: SIET_LAT + 0.0008,
      centerLng: SIET_LNG - 0.0002,
      footprint: {
        type: 'Polygon',
        coordinates: [
          [
            [SIET_LNG - 0.0004, SIET_LAT + 0.0006],
            [SIET_LNG - 0.0000, SIET_LAT + 0.0006],
            [SIET_LNG - 0.0000, SIET_LAT + 0.0010],
            [SIET_LNG - 0.0004, SIET_LAT + 0.0010],
            [SIET_LNG - 0.0004, SIET_LAT + 0.0006],
          ],
        ],
      },
    },
  });

  const techBuilding = await prisma.building.create({
    data: {
      name: 'Tech Park & Innovation Hub',
      code: 'TECH',
      description: 'AI & Robotics Labs, Incubators and Tech Park lecture halls',
      centerLat: SIET_LAT + 0.0012,
      centerLng: SIET_LNG + 0.0006,
      footprint: {
        type: 'Polygon',
        coordinates: [
          [
            [SIET_LNG + 0.0004, SIET_LAT + 0.0010],
            [SIET_LNG + 0.0008, SIET_LAT + 0.0010],
            [SIET_LNG + 0.0008, SIET_LAT + 0.0014],
            [SIET_LNG + 0.0004, SIET_LAT + 0.0014],
            [SIET_LNG + 0.0004, SIET_LAT + 0.0010],
          ],
        ],
      },
    },
  });
  console.log('✅ Created 3 Campus Buildings: ACAD, LIB, TECH');

  // 5. CREATE FLOORS
  const acadF0 = await prisma.floor.create({ data: { buildingId: acadBuilding.id, level: 0, name: 'Ground Floor' } });
  const acadF1 = await prisma.floor.create({ data: { buildingId: acadBuilding.id, level: 1, name: '1st Floor' } });
  const acadF2 = await prisma.floor.create({ data: { buildingId: acadBuilding.id, level: 2, name: '2nd Floor' } });

  const libF0 = await prisma.floor.create({ data: { buildingId: libBuilding.id, level: 0, name: 'Ground Floor' } });
  const libF1 = await prisma.floor.create({ data: { buildingId: libBuilding.id, level: 1, name: '1st Floor' } });

  const techF0 = await prisma.floor.create({ data: { buildingId: techBuilding.id, level: 0, name: 'Ground Floor' } });
  const techF1 = await prisma.floor.create({ data: { buildingId: techBuilding.id, level: 1, name: '1st Floor' } });
  const techF2 = await prisma.floor.create({ data: { buildingId: techBuilding.id, level: 2, name: '2nd Floor' } });
  console.log('✅ Created 8 Floor levels');

  // 6. CREATE NAVIGATION GRAPH NODES (Outdoor + Multi-Floor Indoor)
  // Outdoor Nodes
  const nodeGateMain = await prisma.navNode.create({
    data: { kind: NodeKind.GATE, label: 'Main Entrance Gate', lat: SIET_LAT, lng: SIET_LNG, x: 0, y: 0 },
  });
  const nodeJunctionPlaza = await prisma.navNode.create({
    data: { kind: NodeKind.JUNCTION, label: 'Central Campus Plaza', lat: SIET_LAT + 0.0004, lng: SIET_LNG + 0.0002, x: 20, y: 44 },
  });
  const nodeCanteenEntry = await prisma.navNode.create({
    data: { kind: NodeKind.OUTDOOR, label: 'Canteen Promenade', lat: SIET_LAT + 0.0003, lng: SIET_LNG - 0.0003, x: -33, y: 33 },
  });
  const nodeHostelCross = await prisma.navNode.create({
    data: { kind: NodeKind.OUTDOOR, label: 'Hostel Avenue Junction', lat: SIET_LAT + 0.0009, lng: SIET_LNG - 0.0006, x: -66, y: 100 },
  });

  // Building Entrances
  const nodeAcadEntry = await prisma.navNode.create({
    data: { floorId: acadF0.id, kind: NodeKind.DOOR, label: 'Academic Block Main Porch', lat: SIET_LAT + 0.0004, lng: SIET_LNG + 0.0004, x: 44, y: 44 },
  });
  const nodeLibEntry = await prisma.navNode.create({
    data: { floorId: libF0.id, kind: NodeKind.DOOR, label: 'Central Library Foyer', lat: SIET_LAT + 0.0007, lng: SIET_LNG - 0.0001, x: -11, y: 77 },
  });
  const nodeTechEntry = await prisma.navNode.create({
    data: { floorId: techF0.id, kind: NodeKind.DOOR, label: 'Tech Park Reception Lobby', lat: SIET_LAT + 0.0011, lng: SIET_LNG + 0.0005, x: 55, y: 122 },
  });

  // Academic Block Indoors
  const nodeAcadStairsF0 = await prisma.navNode.create({
    data: { floorId: acadF0.id, kind: NodeKind.STAIRS, label: 'Acad Block Central Staircase (G)', lat: SIET_LAT + 0.00045, lng: SIET_LNG + 0.00045, x: 49, y: 50 },
  });
  const nodeAcadStairsF1 = await prisma.navNode.create({
    data: { floorId: acadF1.id, kind: NodeKind.STAIRS, label: 'Acad Block Central Staircase (F1)', lat: SIET_LAT + 0.00045, lng: SIET_LNG + 0.00045, x: 49, y: 50 },
  });
  const nodeAcadStairsF2 = await prisma.navNode.create({
    data: { floorId: acadF2.id, kind: NodeKind.STAIRS, label: 'Acad Block Central Staircase (F2)', lat: SIET_LAT + 0.00045, lng: SIET_LNG + 0.00045, x: 49, y: 50 },
  });

  const nodeAcadCorridorF0 = await prisma.navNode.create({
    data: { floorId: acadF0.id, kind: NodeKind.JUNCTION, label: 'Acad Corridor North G', lat: SIET_LAT + 0.00048, lng: SIET_LNG + 0.00042, x: 46, y: 53 },
  });
  const nodeAcadCorridorF1 = await prisma.navNode.create({
    data: { floorId: acadF1.id, kind: NodeKind.JUNCTION, label: 'Acad Corridor F1 East', lat: SIET_LAT + 0.00048, lng: SIET_LNG + 0.00048, x: 53, y: 53 },
  });
  const nodeAcadCorridorF2 = await prisma.navNode.create({
    data: { floorId: acadF2.id, kind: NodeKind.JUNCTION, label: 'Acad Corridor F2 West', lat: SIET_LAT + 0.00048, lng: SIET_LNG + 0.00042, x: 46, y: 53 },
  });

  // Tech Park Indoors
  const nodeTechLiftF0 = await prisma.navNode.create({
    data: { floorId: techF0.id, kind: NodeKind.LIFT, label: 'Tech Park High-Speed Lift (G)', lat: SIET_LAT + 0.00115, lng: SIET_LNG + 0.00055, x: 60, y: 127 },
  });
  const nodeTechLiftF1 = await prisma.navNode.create({
    data: { floorId: techF1.id, kind: NodeKind.LIFT, label: 'Tech Park High-Speed Lift (F1)', lat: SIET_LAT + 0.00115, lng: SIET_LNG + 0.00055, x: 60, y: 127 },
  });
  const nodeTechLiftF2 = await prisma.navNode.create({
    data: { floorId: techF2.id, kind: NodeKind.LIFT, label: 'Tech Park High-Speed Lift (F2)', lat: SIET_LAT + 0.00115, lng: SIET_LNG + 0.00055, x: 60, y: 127 },
  });

  const nodeTechHallF1 = await prisma.navNode.create({
    data: { floorId: techF1.id, kind: NodeKind.JUNCTION, label: 'Tech Park AI Wing Corridor F1', lat: SIET_LAT + 0.00118, lng: SIET_LNG + 0.00058, x: 64, y: 130 },
  });
  const nodeTechHallF2 = await prisma.navNode.create({
    data: { floorId: techF2.id, kind: NodeKind.JUNCTION, label: 'Tech Park Cloud Labs Corridor F2', lat: SIET_LAT + 0.00118, lng: SIET_LNG + 0.00058, x: 64, y: 130 },
  });

  console.log('✅ Created 18 Navigation Nodes');

  // 7. CREATE EDGES WITH METRIC DISTANCES, ACCESSIBILITY & LANDMARK CUES
  const edgesData = [
    // Gate to Central Plaza
    { fromNodeId: nodeGateMain.id, toNodeId: nodeJunctionPlaza.id, distanceM: 48, isAccessible: true, landmarkText: 'Walk straight past the flagpole lawn' },
    { fromNodeId: nodeJunctionPlaza.id, toNodeId: nodeGateMain.id, distanceM: 48, isAccessible: true, landmarkText: 'Walk straight toward Main Exit Gate' },

    // Plaza to Canteen & Hostels
    { fromNodeId: nodeJunctionPlaza.id, toNodeId: nodeCanteenEntry.id, distanceM: 35, isAccessible: true, landmarkText: 'Take the paved path toward the Canteen & Food Court' },
    { fromNodeId: nodeCanteenEntry.id, toNodeId: nodeJunctionPlaza.id, distanceM: 35, isAccessible: true, landmarkText: 'Walk back to Central Plaza' },
    { fromNodeId: nodeCanteenEntry.id, toNodeId: nodeHostelCross.id, distanceM: 45, isAccessible: true, landmarkText: 'Follow the tree-lined path towards Hostel Avenue' },
    { fromNodeId: nodeHostelCross.id, toNodeId: nodeCanteenEntry.id, distanceM: 45, isAccessible: true, landmarkText: 'Head south towards Canteen' },

    // Plaza to Building Entrances
    { fromNodeId: nodeJunctionPlaza.id, toNodeId: nodeAcadEntry.id, distanceM: 25, isAccessible: true, landmarkText: 'Turn right towards the Main Academic Block porch' },
    { fromNodeId: nodeAcadEntry.id, toNodeId: nodeJunctionPlaza.id, distanceM: 25, isAccessible: true, landmarkText: 'Exit porch towards Central Plaza' },

    { fromNodeId: nodeJunctionPlaza.id, toNodeId: nodeLibEntry.id, distanceM: 40, isAccessible: true, landmarkText: 'Turn left along the stone walkway toward Central Library' },
    { fromNodeId: nodeLibEntry.id, toNodeId: nodeJunctionPlaza.id, distanceM: 40, isAccessible: true, landmarkText: 'Walk back towards Central Plaza' },

    { fromNodeId: nodeJunctionPlaza.id, toNodeId: nodeTechEntry.id, distanceM: 85, isAccessible: true, landmarkText: 'Walk north past the fountain towards Tech Park' },
    { fromNodeId: nodeTechEntry.id, toNodeId: nodeJunctionPlaza.id, distanceM: 85, isAccessible: true, landmarkText: 'Walk south toward Central Plaza' },

    // Academic Block Ground Floor
    { fromNodeId: nodeAcadEntry.id, toNodeId: nodeAcadCorridorF0.id, distanceM: 12, isAccessible: true, isIndoor: true, landmarkText: 'Enter Academic Lobby and pass the water cooler' },
    { fromNodeId: nodeAcadCorridorF0.id, toNodeId: nodeAcadEntry.id, distanceM: 12, isAccessible: true, isIndoor: true, landmarkText: 'Walk to Academic Main Exit' },
    { fromNodeId: nodeAcadCorridorF0.id, toNodeId: nodeAcadStairsF0.id, distanceM: 8, isAccessible: true, isIndoor: true, landmarkText: 'Walk to the central staircase' },
    { fromNodeId: nodeAcadStairsF0.id, toNodeId: nodeAcadCorridorF0.id, distanceM: 8, isAccessible: true, isIndoor: true, landmarkText: 'Turn into Ground Floor corridor' },

    // Academic Stairs Multi-Floor Connections (Not accessible for wheelchair)
    { fromNodeId: nodeAcadStairsF0.id, toNodeId: nodeAcadStairsF1.id, distanceM: 15, isAccessible: false, isIndoor: true, landmarkText: 'Take the stairs up to Floor 1' },
    { fromNodeId: nodeAcadStairsF1.id, toNodeId: nodeAcadStairsF0.id, distanceM: 15, isAccessible: false, isIndoor: true, landmarkText: 'Take the stairs down to Ground Floor' },
    { fromNodeId: nodeAcadStairsF1.id, toNodeId: nodeAcadStairsF2.id, distanceM: 15, isAccessible: false, isIndoor: true, landmarkText: 'Take the stairs up to Floor 2' },
    { fromNodeId: nodeAcadStairsF2.id, toNodeId: nodeAcadStairsF1.id, distanceM: 15, isAccessible: false, isIndoor: true, landmarkText: 'Take the stairs down to Floor 1' },

    // Academic Floor Corridors
    { fromNodeId: nodeAcadStairsF1.id, toNodeId: nodeAcadCorridorF1.id, distanceM: 6, isAccessible: true, isIndoor: true, landmarkText: 'Turn left after the stairs into 1st Floor East corridor' },
    { fromNodeId: nodeAcadCorridorF1.id, toNodeId: nodeAcadStairsF1.id, distanceM: 6, isAccessible: true, isIndoor: true, landmarkText: 'Walk to the central staircase' },
    { fromNodeId: nodeAcadStairsF2.id, toNodeId: nodeAcadCorridorF2.id, distanceM: 6, isAccessible: true, isIndoor: true, landmarkText: 'Turn left into 2nd Floor corridor' },
    { fromNodeId: nodeAcadCorridorF2.id, toNodeId: nodeAcadStairsF2.id, distanceM: 6, isAccessible: true, isIndoor: true, landmarkText: 'Walk to the central staircase' },

    // Tech Park Ground Lobby & Elevator Connections (Fully Accessible)
    { fromNodeId: nodeTechEntry.id, toNodeId: nodeTechLiftF0.id, distanceM: 10, isAccessible: true, isIndoor: true, landmarkText: 'Enter Tech Park lobby; high-speed elevator is directly ahead' },
    { fromNodeId: nodeTechLiftF0.id, toNodeId: nodeTechEntry.id, distanceM: 10, isAccessible: true, isIndoor: true, landmarkText: 'Head to Tech Park Main Entrance' },

    // Tech Park Lift (Multi-Floor Accessible)
    { fromNodeId: nodeTechLiftF0.id, toNodeId: nodeTechLiftF1.id, distanceM: 20, isAccessible: true, isIndoor: true, landmarkText: 'Take the elevator to Floor 1' },
    { fromNodeId: nodeTechLiftF1.id, toNodeId: nodeTechLiftF0.id, distanceM: 20, isAccessible: true, isIndoor: true, landmarkText: 'Take the elevator down to Ground Floor' },
    { fromNodeId: nodeTechLiftF1.id, toNodeId: nodeTechLiftF2.id, distanceM: 20, isAccessible: true, isIndoor: true, landmarkText: 'Take the elevator to Floor 2' },
    { fromNodeId: nodeTechLiftF2.id, toNodeId: nodeTechLiftF1.id, distanceM: 20, isAccessible: true, isIndoor: true, landmarkText: 'Take the elevator down to Floor 1' },

    // Tech Park Corridors
    { fromNodeId: nodeTechLiftF1.id, toNodeId: nodeTechHallF1.id, distanceM: 8, isAccessible: true, isIndoor: true, landmarkText: 'Step out of lift into AI Excellence Wing' },
    { fromNodeId: nodeTechHallF1.id, toNodeId: nodeTechLiftF1.id, distanceM: 8, isAccessible: true, isIndoor: true, landmarkText: 'Walk to elevator lobby' },
    { fromNodeId: nodeTechLiftF2.id, toNodeId: nodeTechHallF2.id, distanceM: 8, isAccessible: true, isIndoor: true, landmarkText: 'Step out of lift into Cloud Innovation Wing' },
    { fromNodeId: nodeTechHallF2.id, toNodeId: nodeTechLiftF2.id, distanceM: 8, isAccessible: true, isIndoor: true, landmarkText: 'Walk to elevator lobby' },
  ];

  for (const edge of edgesData) {
    await prisma.navEdge.create({ data: edge });
  }
  console.log(`✅ Created ${edgesData.length} Walkable Navigation Edges`);

  // 8. CREATE ~40 PLACES (Rooms, Labs, Amenities, Canteen, Hostels, Washrooms)
  const placesList = [
    // OUTDOOR & CAMPUS LEVEL
    { name: 'Main Security Gate & Visitor Checkpoint', code: 'GATE-01', type: PlaceType.GATE, nodeId: nodeGateMain.id, lat: SIET_LAT, lng: SIET_LNG, aliases: ['Main Gate', 'Arch', 'Security'], tags: ['entrance', 'visitor'] },
    { name: 'Student Canteen', code: 'CANTEEN-01', type: PlaceType.CANTEEN, nodeId: nodeCanteenEntry.id, lat: SIET_LAT + 0.0003, lng: SIET_LNG - 0.0003, aliases: ['Cafeteria', 'Snack Bar'], tags: ['food', 'refreshment'] },
    { name: 'Campus Food Court & Nescafe Corner', code: 'FOOD-COURT-01', type: PlaceType.FOOD_COURT, nodeId: nodeCanteenEntry.id, lat: SIET_LAT + 0.00032, lng: SIET_LNG - 0.00032, aliases: ['Juice Point', 'Coffee Shop'], tags: ['food'] },
    { name: 'Boys Hostel — Kaveri Block', code: 'HOSTEL-B-01', type: PlaceType.HOSTEL_BOYS, nodeId: nodeHostelCross.id, lat: SIET_LAT + 0.0010, lng: SIET_LNG - 0.0007, aliases: ['Boys Hostel', 'Gents Hostel'], tags: ['hostel'] },
    { name: 'Girls Hostel — Bhavani Block', code: 'HOSTEL-G-01', type: PlaceType.HOSTEL_GIRLS, nodeId: nodeHostelCross.id, lat: SIET_LAT + 0.0011, lng: SIET_LNG - 0.0005, aliases: ['Girls Hostel', 'Ladies Hostel'], tags: ['hostel'] },
    { name: 'Visitor & Staff Vehicle Parking', code: 'PARK-MAIN', type: PlaceType.PARKING, nodeId: nodeGateMain.id, lat: SIET_LAT + 0.0001, lng: SIET_LNG + 0.0001, aliases: ['Bike Parking', 'Car Parking'], tags: ['parking'] },

    // ACADEMIC BLOCK GROUND FLOOR
    { name: 'Lecture Hall 01', code: 'LH-01', type: PlaceType.CLASSROOM, buildingId: acadBuilding.id, floorId: acadF0.id, nodeId: nodeAcadCorridorF0.id, lat: SIET_LAT + 0.00047, lng: SIET_LNG + 0.00041, aliases: ['LH 1', 'Room 101'], tags: ['classroom'] },
    { name: 'Lecture Hall 02', code: 'LH-02', type: PlaceType.CLASSROOM, buildingId: acadBuilding.id, floorId: acadF0.id, nodeId: nodeAcadCorridorF0.id, lat: SIET_LAT + 0.00048, lng: SIET_LNG + 0.00042, aliases: ['LH 2'], tags: ['classroom'] },
    { name: 'Lecture Hall 03', code: 'LH-03', type: PlaceType.CLASSROOM, buildingId: acadBuilding.id, floorId: acadF0.id, nodeId: nodeAcadCorridorF0.id, lat: SIET_LAT + 0.00049, lng: SIET_LNG + 0.00043, aliases: ['LH 3'], tags: ['classroom'] },
    { name: 'Lecture Hall 04', code: 'LH-04', type: PlaceType.CLASSROOM, buildingId: acadBuilding.id, floorId: acadF0.id, nodeId: nodeAcadCorridorF0.id, lat: SIET_LAT + 0.00050, lng: SIET_LNG + 0.00044, aliases: ['LH 4'], tags: ['classroom'] },
    { name: 'Engineering Physics Laboratory', code: 'LAB-PHY', type: PlaceType.LAB, buildingId: acadBuilding.id, floorId: acadF0.id, nodeId: nodeAcadCorridorF0.id, lat: SIET_LAT + 0.00046, lng: SIET_LNG + 0.00043, aliases: ['Physics Lab'], tags: ['lab'] },
    { name: 'Academic Office & Principal Chamber', code: 'OFF-ADMIN', type: PlaceType.OFFICE, buildingId: acadBuilding.id, floorId: acadF0.id, nodeId: nodeAcadEntry.id, lat: SIET_LAT + 0.00043, lng: SIET_LNG + 0.00044, aliases: ['Admin Office'], tags: ['office'] },
    { name: 'Academic Block Restrooms (Ground Floor)', code: 'REST-ACAD-G', type: PlaceType.WASHROOM, buildingId: acadBuilding.id, floorId: acadF0.id, nodeId: nodeAcadCorridorF0.id, lat: SIET_LAT + 0.00045, lng: SIET_LNG + 0.00040, aliases: ['Toilet G', 'Restroom G'], tags: ['washroom'] },

    // ACADEMIC BLOCK FLOOR 1
    { name: 'Lecture Hall 05', code: 'LH-05', type: PlaceType.CLASSROOM, buildingId: acadBuilding.id, floorId: acadF1.id, nodeId: nodeAcadCorridorF1.id, lat: SIET_LAT + 0.00047, lng: SIET_LNG + 0.00047, aliases: ['LH 5'], tags: ['classroom'] },
    { name: 'Lecture Hall 06', code: 'LH-06', type: PlaceType.CLASSROOM, buildingId: acadBuilding.id, floorId: acadF1.id, nodeId: nodeAcadCorridorF1.id, lat: SIET_LAT + 0.00048, lng: SIET_LNG + 0.00048, aliases: ['LH 6'], tags: ['classroom'] },
    { name: 'Lecture Hall 07', code: 'LH-07', type: PlaceType.CLASSROOM, buildingId: acadBuilding.id, floorId: acadF1.id, nodeId: nodeAcadCorridorF1.id, lat: SIET_LAT + 0.00049, lng: SIET_LNG + 0.00049, aliases: ['LH 7'], tags: ['classroom'] },
    { name: 'Lecture Hall 08', code: 'LH-08', type: PlaceType.CLASSROOM, buildingId: acadBuilding.id, floorId: acadF1.id, nodeId: nodeAcadCorridorF1.id, lat: SIET_LAT + 0.00050, lng: SIET_LNG + 0.00050, aliases: ['LH 8'], tags: ['classroom'] },
    { name: 'Data Structures Laboratory', code: 'LAB-DS', type: PlaceType.LAB, buildingId: acadBuilding.id, floorId: acadF1.id, nodeId: nodeAcadCorridorF1.id, lat: SIET_LAT + 0.00051, lng: SIET_LNG + 0.00048, aliases: ['CSE Lab 1'], tags: ['lab'] },
    { name: 'CSE Department Faculty Chamber', code: 'OFF-CSE-FAC', type: PlaceType.OFFICE, buildingId: acadBuilding.id, floorId: acadF1.id, nodeId: nodeAcadCorridorF1.id, lat: SIET_LAT + 0.00046, lng: SIET_LNG + 0.00047, aliases: ['HOD CSE', 'Faculty Room'], tags: ['office'] },
    { name: 'Academic Block Restrooms (1st Floor)', code: 'REST-ACAD-F1', type: PlaceType.WASHROOM, buildingId: acadBuilding.id, floorId: acadF1.id, nodeId: nodeAcadCorridorF1.id, lat: SIET_LAT + 0.00045, lng: SIET_LNG + 0.00049, aliases: ['Toilet F1'], tags: ['washroom'] },

    // ACADEMIC BLOCK FLOOR 2
    { name: 'Lecture Hall 09', code: 'LH-09', type: PlaceType.CLASSROOM, buildingId: acadBuilding.id, floorId: acadF2.id, nodeId: nodeAcadCorridorF2.id, lat: SIET_LAT + 0.00047, lng: SIET_LNG + 0.00041, aliases: ['LH 9'], tags: ['classroom'] },
    { name: 'Lecture Hall 10', code: 'LH-10', type: PlaceType.CLASSROOM, buildingId: acadBuilding.id, floorId: acadF2.id, nodeId: nodeAcadCorridorF2.id, lat: SIET_LAT + 0.00048, lng: SIET_LNG + 0.00042, aliases: ['LH 10'], tags: ['classroom'] },
    { name: 'Lecture Hall 11', code: 'LH-11', type: PlaceType.CLASSROOM, buildingId: acadBuilding.id, floorId: acadF2.id, nodeId: nodeAcadCorridorF2.id, lat: SIET_LAT + 0.00049, lng: SIET_LNG + 0.00043, aliases: ['LH 11'], tags: ['classroom'] },
    { name: 'Lecture Hall 12', code: 'LH-12', type: PlaceType.CLASSROOM, buildingId: acadBuilding.id, floorId: acadF2.id, nodeId: nodeAcadCorridorF2.id, lat: SIET_LAT + 0.00050, lng: SIET_LNG + 0.00044, aliases: ['LH 12'], tags: ['classroom'] },
    { name: 'Database & Web Engineering Lab', code: 'LAB-DBMS', type: PlaceType.LAB, buildingId: acadBuilding.id, floorId: acadF2.id, nodeId: nodeAcadCorridorF2.id, lat: SIET_LAT + 0.00052, lng: SIET_LNG + 0.00042, aliases: ['DBMS Lab'], tags: ['lab'] },
    { name: 'Academic Block Restrooms (2nd Floor)', code: 'REST-ACAD-F2', type: PlaceType.WASHROOM, buildingId: acadBuilding.id, floorId: acadF2.id, nodeId: nodeAcadCorridorF2.id, lat: SIET_LAT + 0.00045, lng: SIET_LNG + 0.00040, aliases: ['Toilet F2'], tags: ['washroom'] },

    // CENTRAL LIBRARY BLOCK
    { name: 'Central Reading Hall & Books Stack', code: 'LIB-STACK', type: PlaceType.LIBRARY, buildingId: libBuilding.id, floorId: libF0.id, nodeId: nodeLibEntry.id, lat: SIET_LAT + 0.00072, lng: SIET_LNG - 0.00012, aliases: ['Library', 'Books Section'], tags: ['library'] },
    { name: 'Digital Library & E-Resources Centre', code: 'LIB-DIGI', type: PlaceType.LIBRARY, buildingId: libBuilding.id, floorId: libF0.id, nodeId: nodeLibEntry.id, lat: SIET_LAT + 0.00075, lng: SIET_LNG - 0.00015, aliases: ['E-Library'], tags: ['library'] },
    { name: 'Central Seminar Hall I', code: 'AUD-SEM1', type: PlaceType.OFFICE, buildingId: libBuilding.id, floorId: libF1.id, nodeId: nodeLibEntry.id, lat: SIET_LAT + 0.00078, lng: SIET_LNG - 0.00010, aliases: ['Seminar Hall 1', 'Audi 1'], tags: ['hall'] },
    { name: 'Central Seminar Hall II', code: 'AUD-SEM2', type: PlaceType.OFFICE, buildingId: libBuilding.id, floorId: libF1.id, nodeId: nodeLibEntry.id, lat: SIET_LAT + 0.00080, lng: SIET_LNG - 0.00010, aliases: ['Seminar Hall 2'], tags: ['hall'] },
    { name: 'Library Washroom', code: 'REST-LIB', type: PlaceType.WASHROOM, buildingId: libBuilding.id, floorId: libF0.id, nodeId: nodeLibEntry.id, lat: SIET_LAT + 0.00070, lng: SIET_LNG - 0.00018, aliases: ['Library Toilet'], tags: ['washroom'] },

    // TECH PARK & INNOVATION HUB
    { name: 'Tech Park Smart Classroom 201', code: 'TECH-201', type: PlaceType.TECHPARK, buildingId: techBuilding.id, floorId: techF1.id, nodeId: nodeTechHallF1.id, lat: SIET_LAT + 0.00117, lng: SIET_LNG + 0.00057, aliases: ['TP 201'], tags: ['techpark', 'classroom'] },
    { name: 'Tech Park Smart Classroom 202', code: 'TECH-202', type: PlaceType.TECHPARK, buildingId: techBuilding.id, floorId: techF1.id, nodeId: nodeTechHallF1.id, lat: SIET_LAT + 0.00118, lng: SIET_LNG + 0.00059, aliases: ['TP 202'], tags: ['techpark', 'classroom'] },
    { name: 'Tech Park Smart Classroom 203', code: 'TECH-203', type: PlaceType.TECHPARK, buildingId: techBuilding.id, floorId: techF1.id, nodeId: nodeTechHallF1.id, lat: SIET_LAT + 0.00119, lng: SIET_LNG + 0.00060, aliases: ['TP 203'], tags: ['techpark', 'classroom'] },
    { name: 'Tech Park Smart Classroom 204', code: 'TECH-204', type: PlaceType.TECHPARK, buildingId: techBuilding.id, floorId: techF1.id, nodeId: nodeTechHallF1.id, lat: SIET_LAT + 0.00120, lng: SIET_LNG + 0.00061, aliases: ['TP 204'], tags: ['techpark', 'classroom'] },
    { name: 'Artificial Intelligence & Robotics Lab', code: 'TECH-AI-LAB', type: PlaceType.LAB, buildingId: techBuilding.id, floorId: techF1.id, nodeId: nodeTechHallF1.id, lat: SIET_LAT + 0.00121, lng: SIET_LNG + 0.00063, aliases: ['AI Lab', 'Robotics Center'], tags: ['techpark', 'lab'] },
    { name: 'Cloud Computing & DevOps Lab', code: 'TECH-CLOUD-LAB', type: PlaceType.LAB, buildingId: techBuilding.id, floorId: techF2.id, nodeId: nodeTechHallF2.id, lat: SIET_LAT + 0.00122, lng: SIET_LNG + 0.00059, aliases: ['Cloud Lab', 'AWS Lab'], tags: ['techpark', 'lab'] },
    { name: 'Tech Park Smart Classroom 301', code: 'TECH-301', type: PlaceType.TECHPARK, buildingId: techBuilding.id, floorId: techF2.id, nodeId: nodeTechHallF2.id, lat: SIET_LAT + 0.00123, lng: SIET_LNG + 0.00061, aliases: ['TP 301'], tags: ['techpark', 'classroom'] },
    { name: 'Tech Park Smart Classroom 302', code: 'TECH-302', type: PlaceType.TECHPARK, buildingId: techBuilding.id, floorId: techF2.id, nodeId: nodeTechHallF2.id, lat: SIET_LAT + 0.00124, lng: SIET_LNG + 0.00062, aliases: ['TP 302'], tags: ['techpark', 'classroom'] },
    { name: 'Student Startup Incubation Cell', code: 'TECH-INCUBATION', type: PlaceType.OFFICE, buildingId: techBuilding.id, floorId: techF0.id, nodeId: nodeTechLiftF0.id, lat: SIET_LAT + 0.00114, lng: SIET_LNG + 0.00053, aliases: ['Incubator', 'E-Cell'], tags: ['techpark'] },
    { name: 'Tech Park Executive Washrooms', code: 'REST-TECH', type: PlaceType.WASHROOM, buildingId: techBuilding.id, floorId: techF1.id, nodeId: nodeTechHallF1.id, lat: SIET_LAT + 0.00116, lng: SIET_LNG + 0.00064, aliases: ['Tech Toilet'], tags: ['washroom'] },
  ];

  const createdPlacesMap: Record<string, string> = {};
  for (const p of placesList) {
    const pl = await prisma.place.create({
      data: {
        name: p.name,
        code: p.code,
        type: p.type,
        buildingId: p.buildingId,
        floorId: p.floorId,
        nodeId: p.nodeId,
        lat: p.lat,
        lng: p.lng,
        aliases: p.aliases,
        tags: p.tags,
      },
    });
    createdPlacesMap[p.code] = pl.id;
  }
  console.log(`✅ Created ${placesList.length} Places (Classrooms, Labs, Tech Park, Hostels, Canteen, Washrooms)`);

  // 9. CREATE SUBJECTS
  const subDsa = await prisma.subject.create({
    data: { name: 'Data Structures and Algorithms', code: 'CS8391', departmentId: cseDept.id },
  });
  const subDbms = await prisma.subject.create({
    data: { name: 'Database Management Systems', code: 'CS8492', departmentId: cseDept.id },
  });
  const subOs = await prisma.subject.create({
    data: { name: 'Operating Systems', code: 'CS8493', departmentId: cseDept.id },
  });
  const subWt = await prisma.subject.create({
    data: { name: 'Web Technology & Cloud Applications', code: 'IT8501', departmentId: itDept.id },
  });
  console.log('✅ Created 4 Academic Subjects');

  // 10. CREATE TIMETABLE SLOTS FOR CSE 3rd YEAR SEC A
  const slot1 = await prisma.timetableSlot.create({
    data: {
      departmentId: cseDept.id,
      year: 3,
      section: 'A',
      day: DayOfWeek.MONDAY,
      period: 1,
      startTime: '09:00',
      endTime: '09:50',
      subjectId: subDsa.id,
      facultyId: faculty1.id,
      placeId: createdPlacesMap['LH-05']!,
    },
  });

  const slot2 = await prisma.timetableSlot.create({
    data: {
      departmentId: cseDept.id,
      year: 3,
      section: 'A',
      day: DayOfWeek.MONDAY,
      period: 2,
      startTime: '10:00',
      endTime: '10:50',
      subjectId: subDbms.id,
      facultyId: faculty1.id,
      placeId: createdPlacesMap['LH-06']!,
    },
  });

  const slot3 = await prisma.timetableSlot.create({
    data: {
      departmentId: cseDept.id,
      year: 3,
      section: 'A',
      day: DayOfWeek.TUESDAY,
      period: 1,
      startTime: '09:00',
      endTime: '09:50',
      subjectId: subOs.id,
      facultyId: faculty2.id,
      placeId: createdPlacesMap['TECH-201']!,
    },
  });

  const slot4 = await prisma.timetableSlot.create({
    data: {
      departmentId: cseDept.id,
      year: 3,
      section: 'A',
      day: DayOfWeek.TUESDAY,
      period: 2,
      startTime: '10:00',
      endTime: '10:50',
      subjectId: subWt.id,
      facultyId: faculty2.id,
      placeId: createdPlacesMap['TECH-AI-LAB']!,
    },
  });
  console.log('✅ Created 4 Sample Timetable Slots');

  // 11. CREATE SAMPLE EXAM WITH ALLOCATIONS
  const exam = await prisma.exam.create({
    data: {
      name: 'Semester End Theory Examinations — May 2026',
      examDate: new Date('2026-05-18T00:00:00.000Z'),
      session: 'FN',
      startTime: '10:00',
      endTime: '13:00',
    },
  });

  await prisma.examHall.create({
    data: {
      examId: exam.id,
      placeId: createdPlacesMap['LH-01']!,
      rollFrom: '714021104001',
      rollTo: '714021104020',
      invigilatorId: faculty1.id,
    },
  });

  await prisma.examHall.create({
    data: {
      examId: exam.id,
      placeId: createdPlacesMap['LH-02']!,
      rollFrom: '714021104021',
      rollTo: '714021104040',
      invigilatorId: faculty2.id,
    },
  });
  console.log('✅ Created Sample Exam with 2 Hall Allocations');

  console.log('🎉 SIET Campus Seeding Complete! Database is fully populated.');
}

// Execute directly if run as a script
if (require.main === module) {
  seedCampusData()
    .catch((err) => {
      console.error('❌ Seeding failed:', err);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
