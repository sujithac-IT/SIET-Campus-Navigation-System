import { Building, PathNode, PathEdge } from '@/types';

/**
 * ============================================================================
 * SIET SmartNav — Geographically Grounded Campus Data Layer
 * Sri Shakthi Institute of Engineering and Technology (SIET), Coimbatore
 *
 * Ground Truth References:
 * 1. OpenStreetMap (OSM Way 240742622, Way 240742620, Ways 1243485332-1243485338)
 * 2. Google Maps Verified Entrance Gate Arch: https://maps.app.goo.gl/k3634HaQ6AtTbMcP7 (11.040913, 77.077493)
 * 3. Google Maps Central Avenue: https://maps.app.goo.gl/5AiAAHCBH23NXr3s6 (11.0409819, 77.0763129)
 * 4. Google Maps Main Block: https://maps.app.goo.gl/ee39AaW9UTeK58R68 (11.0402273, 77.0742571)
 * 5. Google Maps Academic Block: https://maps.app.goo.gl/iXihKqeHzW7J3VK38 (11.040404, 77.074018)
 * 6. Controller of Examinations Official Hall Location Table (LH 01-68, 1A-2D, Lab 01-13)
 * ============================================================================
 */

export const SIET_CAMPUS_BOUNDS = {
  center: [11.04035, 77.07485] as [number, number],
  defaultZoom: 17,
  minZoom: 15,
  maxZoom: 21,
  bounds: [
    [11.0375, 77.0715],
    [11.0435, 77.0785]
  ] as [[number, number], [number, number]]
};

// Verified Campus Boundary Polygon (from OSM Way 240742622)
export const SIET_BOUNDARY_POLYGON: [number, number][] = [
  [11.040913, 77.077493],
  [11.040973, 77.076930],
  [11.040989, 77.076246],
  [11.041063, 77.076238],
  [11.041210, 77.076217],
  [11.041628, 77.076158],
  [11.041628, 77.076098],
  [11.041623, 77.075646],
  [11.041643, 77.074566],
  [11.041503, 77.074325],
  [11.041395, 77.074296],
  [11.040776, 77.074315],
  [11.040724, 77.073681],
  [11.040970, 77.073663],
  [11.041286, 77.073644],
  [11.040978, 77.073547],
  [11.039507, 77.073776],
  [11.038032, 77.073722],
  [11.038065, 77.072926],
  [11.039489, 77.072961],
  [11.040172, 77.072727],
  [11.040547, 77.072611],
  [11.040756, 77.072348],
  [11.040963, 77.072390],
  [11.041541, 77.072424],
  [11.041738, 77.072494],
  [11.040913, 77.077493]
];

// Verified Building Footprints & GeoJSON Details
export const SIET_GEO_BUILDINGS: Building[] = [
  {
    id: 'b-gate',
    name: 'Main Campus Entrance Gateway',
    code: 'GATE',
    category: 'gate',
    description: 'Grand entrance arch on Coimbatore Bypass (NH 544 / L&T By-Pass) with security post and visitor registration.',
    coordinates: { x: 15, y: 88 },
    lat: 11.040913,
    lng: 77.077493,
    entranceCoordinates: { lat: 11.040913, lng: 77.077493 },
    polygon: [
      [11.040850, 77.077400],
      [11.040980, 77.077400],
      [11.040980, 77.077550],
      [11.040850, 77.077550]
    ],
    icon: 'ShieldCheck',
    color: '#0284c7',
    department: 'Campus Security & Estate Office',
    facilities: ['24/7 Security Post', 'Visitor ID Verification', 'Emergency Contact Post', 'Speed Barrier'],
    accessibilityInfo: 'Step-free access with wide vehicle and pedestrian lanes',
    verificationStatus: 'verified',
    sourceReference: 'Google Maps Entrance Arch Photo: https://maps.app.goo.gl/k3634HaQ6AtTbMcP7',
    photoUrl: '/references/siet_entrance_gateway.jpg',
    floors: [
      {
        level: 0,
        name: 'Ground Floor',
        rooms: [
          {
            id: 'r-sec-01',
            code: 'SEC-01',
            name: 'Central Security Checkpoint',
            type: 'security',
            buildingId: 'b-gate',
            floor: 0,
            isAvailable: true,
            coordinates: { x: 15, y: 88 },
            description: 'Main security desk for visitor passes, parking passes, and emergency reporting.',
            accessibilityInfo: 'Ground level, accessible ramp.'
          }
        ]
      }
    ]
  },
  {
    id: 'b-main-block',
    name: 'Main Block (Administrative Headquarters)',
    code: 'MAIN',
    category: 'admin',
    description: 'Signature glass-fronted administrative center housing the Principal’s Office, COE, Exam Halls LH 24 to LH 68, and Engineering Laboratories.',
    coordinates: { x: 25, y: 65 },
    lat: 11.039940,
    lng: 77.074923,
    entranceCoordinates: { lat: 11.040050, lng: 77.075050 },
    polygon: [
      [11.039800, 77.074750],
      [11.040100, 77.074750],
      [11.040100, 77.075100],
      [11.039800, 77.075100]
    ],
    icon: 'Building2',
    color: '#0369a1',
    department: 'Controller of Examinations, Mechanical, Civil, Agri, EEE, Office',
    facilities: ['COE Exam Wing', 'Principal Secretariat', 'Seminar Hall-II', 'Labs 01-13', 'Admissions Cell', 'Visitor Reception'],
    accessibilityInfo: 'Equipped with entrance wheelchair ramp and passenger elevator',
    verificationStatus: 'verified',
    sourceReference: 'Controller of Examinations Official Hall Allocation Table & Google Maps Photo: https://maps.app.goo.gl/ee39AaW9UTeK58R68',
    photoUrl: '/references/siet_main_block_glass.jpg',
    floors: [
      {
        level: 0,
        name: 'Ground Floor',
        rooms: [
          { id: 'r-lh24', code: 'LH 24', name: 'Exam Hall LH 24', type: 'classroom', buildingId: 'b-main-block', floor: 0, isAvailable: true, coordinates: { x: 25, y: 64 }, description: 'Ground Floor (Mechanical Dept.)' },
          { id: 'r-lh25', code: 'LH 25', name: 'Exam Hall LH 25', type: 'classroom', buildingId: 'b-main-block', floor: 0, isAvailable: true, coordinates: { x: 25, y: 65 }, description: 'Ground Floor (Mechanical Dept.)' },
          { id: 'r-lh26', code: 'LH 26', name: 'Exam Hall LH 26', type: 'classroom', buildingId: 'b-main-block', floor: 0, isAvailable: true, coordinates: { x: 26, y: 65 }, description: 'Ground Floor (CIVIL Dept.)' },
          { id: 'r-sem-hall-2', code: 'SEM-02', name: 'Seminar Hall-II', type: 'seminar', buildingId: 'b-main-block', floor: 0, isAvailable: true, coordinates: { x: 26, y: 66 }, description: 'Ground Floor - Library Wing' },
          { id: 'r-adm-rec', code: 'ADM-REC', name: 'Main Reception & Visitor Foyer', type: 'office', buildingId: 'b-main-block', floor: 0, isAvailable: true, coordinates: { x: 25, y: 65 }, description: 'Visitor helpdesk, campus directory, and enquiry counter.' },
          { id: 'r-adm-admission', code: 'ADM-CELL', name: 'Admissions Office', type: 'office', buildingId: 'b-main-block', floor: 0, isAvailable: true, coordinates: { x: 25, y: 66 }, description: 'Undergraduate & Postgraduate admission counseling.' },
          { id: 'r-adm-accounts', code: 'ADM-ACC', name: 'Accounts & Fee Office', type: 'office', buildingId: 'b-main-block', floor: 0, isAvailable: true, coordinates: { x: 26, y: 65 }, description: 'Student fees, scholarships, and transport pass counter.' }
        ]
      },
      {
        level: 1,
        name: '1st Floor',
        rooms: [
          { id: 'r-lh27', code: 'LH 27', name: 'Exam Hall LH 27', type: 'classroom', buildingId: 'b-main-block', floor: 1, isAvailable: true, coordinates: { x: 24, y: 64 }, description: '1st floor (above AGRI Dept.)' },
          { id: 'r-lh28', code: 'LH 28', name: 'Exam Hall LH 28', type: 'classroom', buildingId: 'b-main-block', floor: 1, isAvailable: true, coordinates: { x: 24, y: 65 }, description: '1st floor (above AGRI Dept.)' },
          { id: 'r-lh29', code: 'LH 29', name: 'Exam Hall LH 29', type: 'classroom', buildingId: 'b-main-block', floor: 1, isAvailable: true, coordinates: { x: 25, y: 64 }, description: '1st floor (above EEE Dept.)' },
          { id: 'r-lh30', code: 'LH 30', name: 'Exam Hall LH 30', type: 'classroom', buildingId: 'b-main-block', floor: 1, isAvailable: true, coordinates: { x: 25, y: 65 }, description: '1st floor (above EEE Dept.)' },
          { id: 'r-lh31', code: 'LH 31', name: 'Exam Hall LH 31', type: 'classroom', buildingId: 'b-main-block', floor: 1, isAvailable: true, coordinates: { x: 25, y: 66 }, description: '1st floor (above EEE Dept.)' },
          { id: 'r-lh32', code: 'LH 32', name: 'Exam Hall LH 32', type: 'classroom', buildingId: 'b-main-block', floor: 1, isAvailable: true, coordinates: { x: 26, y: 64 }, description: '1st floor (above EEE Dept.)' },
          { id: 'r-lh33', code: 'LH 33', name: 'Exam Hall LH 33', type: 'classroom', buildingId: 'b-main-block', floor: 1, isAvailable: true, coordinates: { x: 26, y: 65 }, description: '1st floor (above CIVIL Dept.)' },
          { id: 'r-lh34', code: 'LH 34', name: 'Exam Hall LH 34', type: 'classroom', buildingId: 'b-main-block', floor: 1, isAvailable: true, coordinates: { x: 26, y: 66 }, description: '1st floor (above office)' },
          { id: 'r-lh35', code: 'LH 35', name: 'Exam Hall LH 35', type: 'classroom', buildingId: 'b-main-block', floor: 1, isAvailable: true, coordinates: { x: 27, y: 65 }, description: '1st floor (above office)' },
          { id: 'r-lab01', code: 'Lab 01', name: 'Laboratory 01', type: 'lab', buildingId: 'b-main-block', floor: 1, isAvailable: true, coordinates: { x: 27, y: 64 }, description: '1st Floor - above Office' },
          { id: 'r-lab07', code: 'Lab 07', name: 'Laboratory 07', type: 'lab', buildingId: 'b-main-block', floor: 1, isAvailable: true, coordinates: { x: 27, y: 66 }, description: '1st Floor - Above Library' },
          { id: 'r-adm-principal', code: 'PRIN-OFF', name: 'Principal’s Secretariat', type: 'office', buildingId: 'b-main-block', floor: 1, isAvailable: true, coordinates: { x: 25, y: 65 }, description: 'Office of the Principal.' },
          { id: 'r-adm-boardroom', code: 'BOARD-1', name: 'Governing Council Boardroom', type: 'seminar', buildingId: 'b-main-block', floor: 1, isAvailable: true, coordinates: { x: 26, y: 65 }, description: 'Executive boardroom.' }
        ]
      },
      {
        level: 2,
        name: '2nd Floor',
        rooms: [
          { id: 'r-lh36', code: 'LH 36', name: 'Exam Hall LH 36', type: 'classroom', buildingId: 'b-main-block', floor: 2, isAvailable: true, coordinates: { x: 24, y: 63 }, description: '2nd floor (above AGRI Dept.)' },
          { id: 'r-lh37', code: 'LH 37', name: 'Exam Hall LH 37', type: 'classroom', buildingId: 'b-main-block', floor: 2, isAvailable: true, coordinates: { x: 24, y: 64 }, description: '2nd floor (above AGRI Dept.)' },
          { id: 'r-lh38', code: 'LH 38', name: 'Exam Hall LH 38', type: 'classroom', buildingId: 'b-main-block', floor: 2, isAvailable: true, coordinates: { x: 24, y: 65 }, description: '2nd floor (above AGRI Dept.)' },
          { id: 'r-lh39', code: 'LH 39', name: 'Exam Hall LH 39', type: 'classroom', buildingId: 'b-main-block', floor: 2, isAvailable: true, coordinates: { x: 24, y: 66 }, description: '2nd floor (above AGRI Dept.)' },
          { id: 'r-lh40', code: 'LH 40', name: 'Exam Hall LH 40', type: 'classroom', buildingId: 'b-main-block', floor: 2, isAvailable: true, coordinates: { x: 25, y: 63 }, description: '2nd floor (above EEE Dept.)' },
          { id: 'r-lh41', code: 'LH 41', name: 'Exam Hall LH 41', type: 'classroom', buildingId: 'b-main-block', floor: 2, isAvailable: true, coordinates: { x: 25, y: 64 }, description: '2nd floor (above EEE Dept.)' },
          { id: 'r-lh42', code: 'LH 42', name: 'Exam Hall LH 42', type: 'classroom', buildingId: 'b-main-block', floor: 2, isAvailable: true, coordinates: { x: 25, y: 65 }, description: '2nd floor (above EEE Dept.)' },
          { id: 'r-lh43', code: 'LH 43', name: 'Exam Hall LH 43', type: 'classroom', buildingId: 'b-main-block', floor: 2, isAvailable: true, coordinates: { x: 25, y: 66 }, description: '2nd floor (above Library)' },
          { id: 'r-lh44', code: 'LH 44', name: 'Exam Hall LH 44', type: 'classroom', buildingId: 'b-main-block', floor: 2, isAvailable: true, coordinates: { x: 26, y: 63 }, description: '2nd floor (above Library)' },
          { id: 'r-lh45', code: 'LH 45', name: 'Exam Hall LH 45', type: 'classroom', buildingId: 'b-main-block', floor: 2, isAvailable: true, coordinates: { x: 26, y: 64 }, description: '2nd floor (above Library)' },
          { id: 'r-lh46', code: 'LH 46', name: 'Exam Hall LH 46', type: 'classroom', buildingId: 'b-main-block', floor: 2, isAvailable: true, coordinates: { x: 26, y: 65 }, description: '2nd floor (above Library)' },
          { id: 'r-lh47', code: 'LH 47', name: 'Exam Hall LH 47', type: 'classroom', buildingId: 'b-main-block', floor: 2, isAvailable: true, coordinates: { x: 26, y: 66 }, description: '2nd floor (above CIVIL Dept.)' },
          { id: 'r-lh48', code: 'LH 48', name: 'Exam Hall LH 48', type: 'classroom', buildingId: 'b-main-block', floor: 2, isAvailable: true, coordinates: { x: 27, y: 63 }, description: '2nd floor (above CIVIL Dept.)' },
          { id: 'r-lh49', code: 'LH 49', name: 'Exam Hall LH 49', type: 'classroom', buildingId: 'b-main-block', floor: 2, isAvailable: true, coordinates: { x: 27, y: 64 }, description: '2nd floor (above CIVIL Dept.)' },
          { id: 'r-lh50', code: 'LH 50', name: 'Exam Hall LH 50', type: 'classroom', buildingId: 'b-main-block', floor: 2, isAvailable: true, coordinates: { x: 27, y: 65 }, description: '2nd floor (above CIVIL Dept.)' },
          { id: 'r-lh51', code: 'LH 51', name: 'Exam Hall LH 51', type: 'classroom', buildingId: 'b-main-block', floor: 2, isAvailable: true, coordinates: { x: 27, y: 66 }, description: '2nd floor (above CIVIL Dept.)' },
          { id: 'r-lh52', code: 'LH 52', name: 'Exam Hall LH 52', type: 'classroom', buildingId: 'b-main-block', floor: 2, isAvailable: true, coordinates: { x: 28, y: 64 }, description: '2nd floor (above Office)' },
          { id: 'r-lh53', code: 'LH 53', name: 'Exam Hall LH 53', type: 'classroom', buildingId: 'b-main-block', floor: 2, isAvailable: true, coordinates: { x: 28, y: 65 }, description: '2nd floor (above Office)' },
          { id: 'r-lab02', code: 'Lab 02', name: 'Laboratory 02', type: 'lab', buildingId: 'b-main-block', floor: 2, isAvailable: true, coordinates: { x: 28, y: 66 }, description: '2nd Floor - above Office' },
          { id: 'r-lab03', code: 'Lab 03', name: 'Laboratory 03', type: 'lab', buildingId: 'b-main-block', floor: 2, isAvailable: true, coordinates: { x: 29, y: 64 }, description: '2nd Floor - above Office' },
          { id: 'r-lab06', code: 'Lab 06', name: 'Laboratory 06', type: 'lab', buildingId: 'b-main-block', floor: 2, isAvailable: true, coordinates: { x: 29, y: 65 }, description: '2nd Floor - above EEE Dept.' },
          { id: 'r-lab09', code: 'Lab 09', name: 'Laboratory 09', type: 'lab', buildingId: 'b-main-block', floor: 2, isAvailable: true, coordinates: { x: 29, y: 66 }, description: '2nd Floor - above MECH Dept.' },
          { id: 'r-lab10', code: 'Lab 10', name: 'Laboratory 10', type: 'lab', buildingId: 'b-main-block', floor: 2, isAvailable: true, coordinates: { x: 30, y: 64 }, description: '2nd Floor - above MECH Dept.' },
          { id: 'r-lab13', code: 'Lab 13', name: 'Laboratory 13', type: 'lab', buildingId: 'b-main-block', floor: 2, isAvailable: true, coordinates: { x: 30, y: 65 }, description: '2nd Floor - Above Library' },
          { id: 'r-adm-coe', code: 'COE-OFF', name: 'Controller of Examinations (COE)', type: 'office', buildingId: 'b-main-block', floor: 2, isAvailable: true, coordinates: { x: 25, y: 65 }, description: 'Autonomous examinations, transcript issuance, and evaluation wing.' }
        ]
      },
      {
        level: 3,
        name: '3rd Floor',
        rooms: [
          { id: 'r-lh54', code: 'LH 54', name: 'Exam Hall LH 54', type: 'classroom', buildingId: 'b-main-block', floor: 3, isAvailable: true, coordinates: { x: 24, y: 63 }, description: '3rd floor (above AGRI Dept.)' },
          { id: 'r-lh55', code: 'LH 55', name: 'Exam Hall LH 55', type: 'classroom', buildingId: 'b-main-block', floor: 3, isAvailable: true, coordinates: { x: 24, y: 64 }, description: '3rd floor (above AGRI Dept.)' },
          { id: 'r-lh56', code: 'LH 56', name: 'Exam Hall LH 56', type: 'classroom', buildingId: 'b-main-block', floor: 3, isAvailable: true, coordinates: { x: 24, y: 65 }, description: '3rd floor (above AGRI Dept.)' },
          { id: 'r-lh57', code: 'LH 57', name: 'Exam Hall LH 57', type: 'classroom', buildingId: 'b-main-block', floor: 3, isAvailable: true, coordinates: { x: 24, y: 66 }, description: '3rd floor (above AGRI Dept.)' },
          { id: 'r-lh58', code: 'LH 58', name: 'Exam Hall LH 58', type: 'classroom', buildingId: 'b-main-block', floor: 3, isAvailable: true, coordinates: { x: 25, y: 64 }, description: '3rd floor (above Library)' },
          { id: 'r-lh59', code: 'LH 59', name: 'Exam Hall LH 59', type: 'classroom', buildingId: 'b-main-block', floor: 3, isAvailable: true, coordinates: { x: 25, y: 65 }, description: '3rd floor (above Library)' },
          { id: 'r-lh60', code: 'LH 60', name: 'Exam Hall LH 60', type: 'classroom', buildingId: 'b-main-block', floor: 3, isAvailable: true, coordinates: { x: 26, y: 63 }, description: '3rd floor (above CIVIL Dept.)' },
          { id: 'r-lh61', code: 'LH 61', name: 'Exam Hall LH 61', type: 'classroom', buildingId: 'b-main-block', floor: 3, isAvailable: true, coordinates: { x: 26, y: 64 }, description: '3rd floor (above CIVIL Dept.)' },
          { id: 'r-lh62', code: 'LH 62', name: 'Exam Hall LH 62', type: 'classroom', buildingId: 'b-main-block', floor: 3, isAvailable: true, coordinates: { x: 26, y: 65 }, description: '3rd floor (above CIVIL Dept.)' },
          { id: 'r-lh63', code: 'LH 63', name: 'Exam Hall LH 63', type: 'classroom', buildingId: 'b-main-block', floor: 3, isAvailable: true, coordinates: { x: 26, y: 66 }, description: '3rd floor (above CIVIL Dept.)' },
          { id: 'r-lh64', code: 'LH 64', name: 'Exam Hall LH 64', type: 'classroom', buildingId: 'b-main-block', floor: 3, isAvailable: true, coordinates: { x: 27, y: 64 }, description: '3rd floor (above CIVIL Dept.)' },
          { id: 'r-lh65', code: 'LH 65', name: 'Exam Hall LH 65', type: 'classroom', buildingId: 'b-main-block', floor: 3, isAvailable: true, coordinates: { x: 27, y: 65 }, description: '3rd floor (above Office)' },
          { id: 'r-lh66', code: 'LH 66', name: 'Exam Hall LH 66', type: 'classroom', buildingId: 'b-main-block', floor: 3, isAvailable: true, coordinates: { x: 28, y: 64 }, description: '3rd floor (above Office)' },
          { id: 'r-lh67', code: 'LH 67', name: 'Exam Hall LH 67', type: 'classroom', buildingId: 'b-main-block', floor: 3, isAvailable: true, coordinates: { x: 28, y: 65 }, description: '3rd floor (above Office)' },
          { id: 'r-lh68', code: 'LH 68', name: 'Exam Hall LH 68', type: 'classroom', buildingId: 'b-main-block', floor: 3, isAvailable: true, coordinates: { x: 28, y: 66 }, description: '3rd floor (above Office)' }
        ]
      }
    ]
  },
  {
    id: 'b-academic-block',
    name: 'Multi-Storey Academic Block',
    code: 'ACAD',
    category: 'academic',
    description: 'Premier 5-storey academic edifice (height: 18m) housing lecture halls LH 01 to LH 23, smart seminar spaces, computer labs, and departmental faculty chambers.',
    coordinates: { x: 45, y: 40 },
    lat: 11.040404,
    lng: 77.074018,
    entranceCoordinates: { lat: 11.040450, lng: 77.074250 },
    polygon: [
      [11.040150, 77.073650],
      [11.040650, 77.073650],
      [11.040650, 77.074350],
      [11.040150, 77.074350]
    ],
    icon: 'GraduationCap',
    color: '#0d9488',
    department: 'CSE, IT, AI & Data Science, ECE',
    facilities: ['LH 01 to LH 23 Exam Halls', 'Core Computing Labs', 'AI Research Center', 'High-Speed Elevators', 'Restrooms every floor', 'RO Water Dispensers'],
    accessibilityInfo: 'Dual elevator banks, tactile signage, ramp at eastern and southern porches',
    verificationStatus: 'verified',
    sourceReference: 'Controller of Examinations Official Hall Allocation Table & Google Maps Photo: https://maps.app.goo.gl/iXihKqeHzW7J3VK38',
    photoUrl: '/references/siet_academic_building.jpg',
    floors: [
      {
        level: 0,
        name: 'Ground Floor',
        rooms: [
          { id: 'r-lh01', code: 'LH 01', name: 'Exam Hall LH 01', type: 'classroom', buildingId: 'b-academic-block', floor: 0, isAvailable: true, coordinates: { x: 44, y: 39 }, description: 'Ground Floor - Academic Block' },
          { id: 'r-lh02', code: 'LH 02', name: 'Exam Hall LH 02', type: 'classroom', buildingId: 'b-academic-block', floor: 0, isAvailable: true, coordinates: { x: 44, y: 40 }, description: 'Ground Floor - Academic Block' },
          { id: 'r-lh03', code: 'LH 03', name: 'Exam Hall LH 03', type: 'classroom', buildingId: 'b-academic-block', floor: 0, isAvailable: true, coordinates: { x: 45, y: 39 }, description: 'Ground Floor - Academic Block' },
          { id: 'r-lh04', code: 'LH 04', name: 'Exam Hall LH 04', type: 'classroom', buildingId: 'b-academic-block', floor: 0, isAvailable: true, coordinates: { x: 45, y: 40 }, description: 'Ground Floor - Academic Block' },
          { id: 'r-lh05', code: 'LH 05', name: 'Exam Hall LH 05', type: 'classroom', buildingId: 'b-academic-block', floor: 0, isAvailable: true, coordinates: { x: 46, y: 39 }, description: 'Ground Floor - Academic Block' },
          { id: 'r-lh06', code: 'LH 06', name: 'Exam Hall LH 06', type: 'classroom', buildingId: 'b-academic-block', floor: 0, isAvailable: true, coordinates: { x: 46, y: 40 }, description: 'Ground Floor - Academic Block' },
          { id: 'r-acad-lift-0', code: 'LIFT-ACAD', name: 'Academic Block Elevator', type: 'lift', buildingId: 'b-academic-block', floor: 0, isAvailable: true, coordinates: { x: 45, y: 40 }, description: 'High-speed elevator connecting ground through 4th floor.', accessibilityInfo: 'Braille keypad and audio chime.' }
        ]
      },
      {
        level: 1,
        name: '1st Floor',
        rooms: [
          { id: 'r-lh07', code: 'LH 07', name: 'Exam Hall LH 07', type: 'classroom', buildingId: 'b-academic-block', floor: 1, isAvailable: true, coordinates: { x: 44, y: 39 }, description: '1st floor - Academic Block' },
          { id: 'r-lh08', code: 'LH 08', name: 'Exam Hall LH 08', type: 'classroom', buildingId: 'b-academic-block', floor: 1, isAvailable: true, coordinates: { x: 44, y: 40 }, description: '1st floor - Academic Block' },
          { id: 'r-lh09', code: 'LH 09', name: 'Exam Hall LH 09', type: 'classroom', buildingId: 'b-academic-block', floor: 1, isAvailable: true, coordinates: { x: 45, y: 39 }, description: '1st floor - Academic Block' },
          { id: 'r-lh10', code: 'LH 10', name: 'Exam Hall LH 10', type: 'classroom', buildingId: 'b-academic-block', floor: 1, isAvailable: true, coordinates: { x: 45, y: 40 }, description: '1st floor - Academic Block' },
          { id: 'r-lh11', code: 'LH 11', name: 'Exam Hall LH 11', type: 'classroom', buildingId: 'b-academic-block', floor: 1, isAvailable: true, coordinates: { x: 46, y: 39 }, description: '1st floor - Academic Block' },
          { id: 'r-lh12', code: 'LH 12', name: 'Exam Hall LH 12', type: 'classroom', buildingId: 'b-academic-block', floor: 1, isAvailable: true, coordinates: { x: 46, y: 40 }, description: '1st floor - Academic Block' },
          { id: 'r-cse-hod', code: 'CSE-HOD', name: 'HOD Chamber - Computer Science', type: 'office', buildingId: 'b-academic-block', floor: 1, isAvailable: true, coordinates: { x: 46, y: 40 }, description: 'Office of Head of Computer Science & Engineering.' }
        ]
      },
      {
        level: 2,
        name: '2nd Floor',
        rooms: [
          { id: 'r-lh13', code: 'LH 13', name: 'Exam Hall LH 13', type: 'classroom', buildingId: 'b-academic-block', floor: 2, isAvailable: true, coordinates: { x: 44, y: 39 }, description: '2nd floor - Academic Block' },
          { id: 'r-lh14', code: 'LH 14', name: 'Exam Hall LH 14', type: 'classroom', buildingId: 'b-academic-block', floor: 2, isAvailable: true, coordinates: { x: 44, y: 40 }, description: '2nd floor - Academic Block' },
          { id: 'r-lh15', code: 'LH 15', name: 'Exam Hall LH 15', type: 'classroom', buildingId: 'b-academic-block', floor: 2, isAvailable: true, coordinates: { x: 45, y: 39 }, description: '2nd floor - Academic Block' },
          { id: 'r-lh16', code: 'LH 16', name: 'Exam Hall LH 16', type: 'classroom', buildingId: 'b-academic-block', floor: 2, isAvailable: true, coordinates: { x: 45, y: 40 }, description: '2nd floor - Academic Block' },
          { id: 'r-it-hod', code: 'IT-HOD', name: 'HOD Chamber - Information Technology', type: 'office', buildingId: 'b-academic-block', floor: 2, isAvailable: true, coordinates: { x: 46, y: 40 }, description: 'Office of Head of Information Technology.' }
        ]
      },
      {
        level: 3,
        name: '3rd Floor',
        rooms: [
          { id: 'r-lh17', code: 'LH 17', name: 'Exam Hall LH 17', type: 'classroom', buildingId: 'b-academic-block', floor: 3, isAvailable: true, coordinates: { x: 44, y: 39 }, description: '3rd floor - Academic Block' },
          { id: 'r-lh18', code: 'LH 18', name: 'Exam Hall LH 18', type: 'classroom', buildingId: 'b-academic-block', floor: 3, isAvailable: true, coordinates: { x: 44, y: 40 }, description: '3rd floor - Academic Block' },
          { id: 'r-lh19', code: 'LH 19', name: 'Exam Hall LH 19', type: 'classroom', buildingId: 'b-academic-block', floor: 3, isAvailable: true, coordinates: { x: 45, y: 39 }, description: '3rd floor - Academic Block' },
          { id: 'r-lh20', code: 'LH 20', name: 'Exam Hall LH 20', type: 'classroom', buildingId: 'b-academic-block', floor: 3, isAvailable: true, coordinates: { x: 45, y: 40 }, description: '3rd floor - Academic Block' },
          { id: 'r-lh21', code: 'LH 21', name: 'Exam Hall LH 21', type: 'classroom', buildingId: 'b-academic-block', floor: 3, isAvailable: true, coordinates: { x: 46, y: 39 }, description: '3rd floor - Academic Block' },
          { id: 'r-lh22', code: 'LH 22', name: 'Exam Hall LH 22', type: 'classroom', buildingId: 'b-academic-block', floor: 3, isAvailable: true, coordinates: { x: 46, y: 40 }, description: '3rd floor - Academic Block' },
          { id: 'r-lh23', code: 'LH 23', name: 'Exam Hall LH 23', type: 'classroom', buildingId: 'b-academic-block', floor: 3, isAvailable: true, coordinates: { x: 47, y: 39 }, description: '3rd floor - Academic Block' }
        ]
      },
      {
        level: 4,
        name: '4th Floor',
        rooms: [
          { id: 'r-ai-lab', code: 'AI-LAB', name: 'Center of Excellence in AI & Deep Learning', type: 'lab', buildingId: 'b-academic-block', floor: 4, isAvailable: true, coordinates: { x: 45, y: 40 }, description: 'High Performance GPU Cluster Lab for AI & Machine Learning.' }
        ]
      }
    ]
  },
  {
    id: 'b-techpark',
    name: 'New Block (Tech Park)',
    code: 'TECH',
    category: 'academic',
    description: 'Modern New Block housing Exam Halls 1A to 2D, Innovation Incubation Hub, Cloud Computing Center, and Department Laboratories.',
    coordinates: { x: 30, y: 66 },
    lat: 11.040150,
    lng: 77.075400,
    entranceCoordinates: { lat: 11.040200, lng: 77.075300 },
    polygon: [
      [11.040050, 77.075250],
      [11.040350, 77.075250],
      [11.040350, 77.075600],
      [11.040050, 77.075600]
    ],
    icon: 'Cpu',
    color: '#0ea5e9',
    department: 'Tech Park & Innovation Wing',
    facilities: ['Exam Halls 1A-2D', 'AI & Robotics Lab', 'Cloud Computing Lab', 'Elevator', 'Modern Restrooms'],
    accessibilityInfo: 'Step-free entrance and accessible elevator',
    verificationStatus: 'verified',
    sourceReference: 'Controller of Examinations Official Hall Allocation Table',
    photoUrl: '/references/siet_campus_satellite_internal_road.jpg',
    floors: [
      {
        level: 0,
        name: 'Ground Floor',
        rooms: [
          { id: 'r-tp-foyer', code: 'TP-FOYER', name: 'Tech Park Foyer & Incubation Center', type: 'office', buildingId: 'b-techpark', floor: 0, isAvailable: true, coordinates: { x: 30, y: 66 }, description: 'Student startup incubation and innovation showcase.' }
        ]
      },
      {
        level: 1,
        name: '1st Floor',
        rooms: [
          { id: 'r-tp-1a', code: '1A', name: 'Exam Hall 1A', type: 'classroom', buildingId: 'b-techpark', floor: 1, isAvailable: true, coordinates: { x: 29, y: 66 }, description: '1st floor - New Block (Tech Park)' },
          { id: 'r-tp-1b', code: '1B', name: 'Exam Hall 1B', type: 'classroom', buildingId: 'b-techpark', floor: 1, isAvailable: true, coordinates: { x: 30, y: 66 }, description: '1st floor - New Block (Tech Park)' },
          { id: 'r-tp-1c', code: '1C', name: 'Exam Hall 1C', type: 'classroom', buildingId: 'b-techpark', floor: 1, isAvailable: true, coordinates: { x: 31, y: 66 }, description: '1st floor - New Block (Tech Park)' },
          { id: 'r-tp-1d', code: '1D', name: 'Exam Hall 1D', type: 'classroom', buildingId: 'b-techpark', floor: 1, isAvailable: true, coordinates: { x: 31, y: 67 }, description: '1st floor - New Block (Tech Park)' }
        ]
      },
      {
        level: 2,
        name: '2nd Floor',
        rooms: [
          { id: 'r-tp-2a', code: '2A', name: 'Exam Hall 2A', type: 'classroom', buildingId: 'b-techpark', floor: 2, isAvailable: true, coordinates: { x: 29, y: 66 }, description: '2nd floor - New Block (Tech Park)' },
          { id: 'r-tp-2b', code: '2B', name: 'Exam Hall 2B', type: 'classroom', buildingId: 'b-techpark', floor: 2, isAvailable: true, coordinates: { x: 30, y: 66 }, description: '2nd floor - New Block (Tech Park)' },
          { id: 'r-tp-2c', code: '2C', name: 'Exam Hall 2C', type: 'classroom', buildingId: 'b-techpark', floor: 2, isAvailable: true, coordinates: { x: 31, y: 66 }, description: '2nd floor - New Block (Tech Park)' },
          { id: 'r-tp-2d', code: '2D', name: 'Exam Hall 2D', type: 'classroom', buildingId: 'b-techpark', floor: 2, isAvailable: true, coordinates: { x: 31, y: 67 }, description: '2nd floor - New Block (Tech Park)' }
        ]
      }
    ]
  },
  {
    id: 'b-sports-arena',
    name: 'SIET Sports Arena & Outdoor Courts',
    code: 'SPORTS',
    category: 'sports',
    description: 'Comprehensive sports facility featuring state-of-the-art synthetic Basketball Court, official Handball Court, volleyball court, and athletic perimeter.',
    coordinates: { x: 75, y: 75 },
    lat: 11.039450,
    lng: 77.073400,
    entranceCoordinates: { lat: 11.039500, lng: 77.073700 },
    polygon: [
      [11.039050, 77.073150],
      [11.039750, 77.073150],
      [11.039750, 77.073650],
      [11.039050, 77.073650]
    ],
    icon: 'Trophy',
    color: '#eab308',
    department: 'Department of Physical Education',
    facilities: ['Synthetic Basketball Court', 'Handball Court', 'Volleyball Court', 'Athletic Track', 'Sports Equipment Room', 'Spectator Seating'],
    accessibilityInfo: 'Paved perimeter walkway with ramp access to player zones',
    verificationStatus: 'verified',
    sourceReference: 'User Reference Photos 5 (Basketball Court) & 6 (Handball Court) and OSM recreational bounds',
    photoUrl: '/references/siet_basketball_court.jpg',
    floors: [
      {
        level: 0,
        name: 'Ground Level',
        rooms: [
          { id: 'r-sp-bball', code: 'CRT-BBALL', name: 'FIBA Standard Basketball Court', type: 'facility', buildingId: 'b-sports-arena', floor: 0, isAvailable: true, coordinates: { x: 75, y: 73 }, description: 'Synthetic court with LED floodlighting and tournament scoreboards.' },
          { id: 'r-sp-hball', code: 'CRT-HBALL', name: 'Official Handball Court', type: 'facility', buildingId: 'b-sports-arena', floor: 0, isAvailable: true, coordinates: { x: 75, y: 76 }, description: 'Regulation court for collegiate and zonal championships.' },
          { id: 'r-sp-ped', code: 'PED-OFF', name: 'Physical Director’s Office', type: 'office', buildingId: 'b-sports-arena', floor: 0, isAvailable: true, coordinates: { x: 76, y: 75 }, description: 'Sports registration, equipment checkout, and team coaching.' }
        ]
      }
    ]
  },
  {
    id: 'b-library',
    name: 'Central Library & Seminar Complex',
    code: 'LIB',
    category: 'facility',
    description: 'Modern two-storey resource hub housing digital repository, reference stacks, journal section, and Seminar Halls I & II.',
    coordinates: { x: 50, y: 55 },
    lat: 11.040734,
    lng: 77.074880,
    entranceCoordinates: { lat: 11.040680, lng: 77.074800 },
    polygon: [
      [11.040600, 77.074700],
      [11.040850, 77.074700],
      [11.040850, 77.075050],
      [11.040600, 77.075050]
    ],
    icon: 'BookOpen',
    color: '#8b5cf6',
    department: 'Central Library & Information Center',
    facilities: ['Over 50,000 Volumes', 'Digital Library (100 Nodes)', 'Seminar Hall I (Capacity: 350)', 'IEEE / ScienceDirect Access', 'Quiet Reading Lounge'],
    accessibilityInfo: 'Step-free entrance ramp and ground-floor accessible circulation desk',
    verificationStatus: 'verified',
    sourceReference: 'OSM Way 1243485318 & Campus Building Directory',
    photoUrl: '/references/siet_campus_satellite_internal_road.jpg',
    floors: [
      {
        level: 0,
        name: 'Ground Floor',
        rooms: [
          { id: 'r-lib-circ', code: 'LIB-G', name: 'Circulation Desk & Reference Stacks', type: 'library', buildingId: 'b-library', floor: 0, isAvailable: true, coordinates: { x: 50, y: 55 }, description: 'Book lending, returns, student card registration, and general stacks.' },
          { id: 'r-sem-hall-1', code: 'SEM-1', name: 'Dr. APJ Abdul Kalam Seminar Hall', type: 'auditorium', buildingId: 'b-library', floor: 0, isAvailable: true, coordinates: { x: 51, y: 55 }, description: 'Acoustically treated 350-seat auditorium with Dolby audio.' }
        ]
      },
      {
        level: 1,
        name: '1st Floor',
        rooms: [
          { id: 'r-lib-digital', code: 'LIB-DIG', name: 'Digital Library & E-Learning Lab', type: 'lab', buildingId: 'b-library', floor: 1, isAvailable: true, coordinates: { x: 50, y: 55 }, description: '100 multimedia workstations with NPTEL and online journal access.' },
          { id: 'r-sem-hall-2-lib', code: 'SEM-2', name: 'Seminar Hall II', type: 'seminar', buildingId: 'b-library', floor: 1, isAvailable: true, coordinates: { x: 51, y: 55 }, description: 'Department presentations, guest lectures, and student symposiums.' }
        ]
      }
    ]
  },
  {
    id: 'b-mech-workshops',
    name: 'Mechanical & Heavy Engineering Workshops',
    code: 'MECH',
    category: 'academic',
    description: 'High-bay manufacturing and prototyping facilities including Machine Shop, Foundry, Welding, Automotive, and Thermal Engineering Labs.',
    coordinates: { x: 35, y: 30 },
    lat: 11.040978,
    lng: 77.073547,
    entranceCoordinates: { lat: 11.040920, lng: 77.073650 },
    polygon: [
      [11.040850, 77.073400],
      [11.041150, 77.073400],
      [11.041150, 77.073700],
      [11.040850, 77.073700]
    ],
    icon: 'Wrench',
    color: '#f97316',
    department: 'Mechanical Engineering & Mechatronics',
    facilities: ['CNC Machining Center', 'Additive Manufacturing 3D Printing', 'Automotive Dyno Testbed', 'Materials Testing Lab'],
    accessibilityInfo: 'Ground level with roll-in industrial equipment access',
    verificationStatus: 'verified',
    sourceReference: 'OSM Way 240742706 & Department Records',
    floors: [
      {
        level: 0,
        name: 'Ground Level',
        rooms: [
          { id: 'r-mech-ws1', code: 'WS-01', name: 'Central Machine Shop & CNC Facility', type: 'lab', buildingId: 'b-mech-workshops', floor: 0, isAvailable: true, coordinates: { x: 35, y: 30 }, description: 'Precision lathe, milling, and 5-axis CNC machining centers.' },
          { id: 'r-mech-dyno', code: 'AUTO-LAB', name: 'Automotive & Engine Research Lab', type: 'lab', buildingId: 'b-mech-workshops', floor: 0, isAvailable: true, coordinates: { x: 36, y: 30 }, description: 'Engine testing bed and vehicle chassis dynamometer.' }
        ]
      }
    ]
  },
  {
    id: 'b-parking',
    name: 'Surface Parking Grounds',
    code: 'PRK',
    category: 'parking',
    description: 'Organized parking complex with designated bays for college buses, faculty four-wheelers, student bikes, and accessible reserved stalls.',
    coordinates: { x: 18, y: 78 },
    lat: 11.041210,
    lng: 77.076217,
    entranceCoordinates: { lat: 11.041063, lng: 77.076238 },
    polygon: [
      [11.041050, 77.075900],
      [11.041400, 77.075900],
      [11.041400, 77.076450],
      [11.041050, 77.076450]
    ],
    icon: 'Car',
    color: '#64748b',
    department: 'Transport & Facilities Office',
    facilities: ['Bus Terminal Bay', 'Staff Four-Wheeler Parking', 'Student Two-Wheeler Shed', 'EV Charging Outlets (4 Points)', 'Accessible Disabled Stalls'],
    accessibilityInfo: 'Located adjacent to entrance walkway with zero kerb barriers',
    verificationStatus: 'verified',
    sourceReference: 'OSM Way 240742613 ("amenity: parking, parking: surface")',
    floors: [
      {
        level: 0,
        name: 'Ground Level',
        rooms: [
          { id: 'r-prk-fac', code: 'PRK-FAC', name: 'Faculty Reserved Parking', type: 'parking', buildingId: 'b-parking', floor: 0, isAvailable: true, coordinates: { x: 18, y: 78 } },
          { id: 'r-prk-bus', code: 'PRK-BUS', name: 'College Bus Fleet Terminal', type: 'parking', buildingId: 'b-parking', floor: 0, isAvailable: true, coordinates: { x: 19, y: 78 } }
        ]
      }
    ]
  },
  {
    id: 'b-foodcourt',
    name: 'Campus Food Court & Cafeteria',
    code: 'CAFE',
    category: 'facility',
    description: 'Central dining complex serving breakfast, meals, snacks, fresh juices, and specialty coffee.',
    coordinates: { x: 40, y: 68 },
    lat: 11.039469,
    lng: 77.075457,
    entranceCoordinates: { lat: 11.039554, lng: 77.075100 },
    polygon: [
      [11.039350, 77.075300],
      [11.039600, 77.075300],
      [11.039600, 77.075600],
      [11.039350, 77.075600]
    ],
    icon: 'Coffee',
    color: '#f59e0b',
    department: 'Student Welfare & Hospitality',
    facilities: ['Multi-cuisine Food Counters', 'FSSAI Certified Kitchen', '500-seat Dining Hall', 'Outdoor Garden Seating'],
    accessibilityInfo: 'Step-free ramp entry and wide aisles',
    verificationStatus: 'verified',
    sourceReference: 'OSM Way 1243485317 & Campus Surveys',
    floors: [
      {
        level: 0,
        name: 'Ground Floor',
        rooms: [
          { id: 'r-cafe-main', code: 'CAFE-01', name: 'Main Dining Hall', type: 'canteen', buildingId: 'b-foodcourt', floor: 0, isAvailable: true, coordinates: { x: 40, y: 68 }, description: 'Student & staff dining hall with hygienic kitchen.' }
        ]
      }
    ]
  },
  {
    id: 'b-hostels',
    name: 'Student Residential Hostels',
    code: 'HOSTEL',
    category: 'hostel',
    description: 'On-campus student residence halls offering furnished rooms, Wi-Fi connectivity, recreation rooms, and round-the-clock wardens.',
    coordinates: { x: 80, y: 40 },
    lat: 11.038549,
    lng: 77.073568,
    entranceCoordinates: { lat: 11.038540, lng: 77.073722 },
    polygon: [
      [11.038200, 77.073300],
      [11.038800, 77.073300],
      [11.038800, 77.073800],
      [11.038200, 77.073800]
    ],
    icon: 'BedDouble',
    color: '#a855f7',
    department: 'Hostel Administration',
    facilities: ['Boys & Girls Residential Wings', 'Study Halls', 'Gymnasium', 'Solar Water Heaters', 'Resident Doctor Clinic'],
    accessibilityInfo: 'Ground floor accessible rooms reserved for mobility-impaired students',
    verificationStatus: 'verified',
    sourceReference: 'OSM Way 1243485321 & Student Affairs',
    floors: [
      {
        level: 0,
        name: 'Ground Floor',
        rooms: [
          { id: 'r-hst-wrd', code: 'HST-OFF', name: 'Chief Warden Office & First Aid Cell', type: 'office', buildingId: 'b-hostels', floor: 0, isAvailable: true, coordinates: { x: 80, y: 40 } }
        ]
      }
    ]
  }
];

// High-Precision Graph Nodes for Pedestrian Navigation (Nodes at every verified junction & door)
export const GEOSPATIAL_PATH_NODES: PathNode[] = [
  // Gateway & Approach Arteries
  { id: 'gn-gate', name: 'Main Entrance Gate (NH 544)', coordinates: { x: 15, y: 88 }, lat: 11.040913, lng: 77.077493, kind: 'gate', verificationStatus: 'verified' },
  { id: 'gn-avenue-east', name: 'Palm Avenue East', coordinates: { x: 18, y: 80 }, lat: 11.040989, lng: 77.076246, kind: 'junction', verificationStatus: 'verified' },
  { id: 'gn-prk-junction', name: 'Parking Approach Junction', coordinates: { x: 20, y: 78 }, lat: 11.041063, lng: 77.076238, kind: 'junction', verificationStatus: 'verified' },
  { id: 'gn-prk-entry', name: 'Surface Parking Entrance', coordinates: { x: 20, y: 76 }, lat: 11.041210, lng: 77.076217, kind: 'outdoor', verificationStatus: 'verified' },

  // Central Boulevard & Roundabout
  { id: 'gn-roundabout', name: 'Central Campus Roundabout', coordinates: { x: 25, y: 70 }, lat: 11.040926, lng: 77.075120, kind: 'junction', verificationStatus: 'verified' },
  { id: 'gn-admin-porch', name: 'Main Administrative Block Porch', coordinates: { x: 25, y: 65 }, lat: 11.040050, lng: 77.075050, kind: 'door', buildingId: 'b-main-block', verificationStatus: 'verified' },
  { id: 'gn-tech-porch', name: 'New Block (Tech Park) Entrance', coordinates: { x: 30, y: 66 }, lat: 11.040200, lng: 77.075300, kind: 'door', buildingId: 'b-techpark', verificationStatus: 'verified' },
  { id: 'gn-cafe-junction', name: 'Food Court Promenade', coordinates: { x: 35, y: 68 }, lat: 11.039601, lng: 77.075060, kind: 'junction', verificationStatus: 'verified' },
  { id: 'gn-cafe-door', name: 'Food Court Main Entrance', coordinates: { x: 38, y: 68 }, lat: 11.039554, lng: 77.075400, kind: 'door', buildingId: 'b-foodcourt', verificationStatus: 'verified' },

  // Library & North Crossway
  { id: 'gn-lib-cross', name: 'Library Crossway North', coordinates: { x: 48, y: 60 }, lat: 11.040849, lng: 77.075120, kind: 'junction', verificationStatus: 'verified' },
  { id: 'gn-lib-door', name: 'Central Library Foyer', coordinates: { x: 50, y: 55 }, lat: 11.040680, lng: 77.074800, kind: 'door', buildingId: 'b-library', verificationStatus: 'verified' },

  // Academic Corridor Network
  { id: 'gn-acad-east-junc', name: 'Academic Block East Intersection', coordinates: { x: 40, y: 45 }, lat: 11.040776, lng: 77.074315, kind: 'junction', verificationStatus: 'verified' },
  { id: 'gn-acad-main-door', name: 'Academic Block Main Porch', coordinates: { x: 45, y: 40 }, lat: 11.040450, lng: 77.074250, kind: 'door', buildingId: 'b-academic-block', verificationStatus: 'verified' },
  { id: 'gn-acad-central-cross', name: 'Academic Plaza West', coordinates: { x: 48, y: 38 }, lat: 11.040404, lng: 77.074018, kind: 'junction', verificationStatus: 'verified' },
  { id: 'gn-acad-west-junc', name: 'Academic Block West Walkway', coordinates: { x: 52, y: 36 }, lat: 11.040724, lng: 77.073681, kind: 'junction', verificationStatus: 'verified' },

  // Mechanical Workshop Approach
  { id: 'gn-mech-junc', name: 'Workshop Avenue Junction', coordinates: { x: 35, y: 32 }, lat: 11.040970, lng: 77.073663, kind: 'junction', verificationStatus: 'verified' },
  { id: 'gn-mech-door', name: 'Mechanical High-Bay Workshop Entry', coordinates: { x: 35, y: 30 }, lat: 11.040920, lng: 77.073650, kind: 'door', buildingId: 'b-mech-workshops', verificationStatus: 'verified' },

  // Sports Complex & Hostel Links
  { id: 'gn-sports-junc', name: 'Sports Arena Entry Point', coordinates: { x: 72, y: 72 }, lat: 11.039507, lng: 77.073776, kind: 'junction', verificationStatus: 'verified' },
  { id: 'gn-bball-court', name: 'Basketball Court Pavilion', coordinates: { x: 75, y: 73 }, lat: 11.039450, lng: 77.073400, kind: 'court', buildingId: 'b-sports-arena', verificationStatus: 'verified' },
  { id: 'gn-hball-court', name: 'Handball Court Stand', coordinates: { x: 75, y: 76 }, lat: 11.039150, lng: 77.073350, kind: 'court', buildingId: 'b-sports-arena', verificationStatus: 'verified' },
  { id: 'gn-hostel-junc', name: 'Hostel Avenue Junction', coordinates: { x: 78, y: 45 }, lat: 11.038540, lng: 77.073722, kind: 'junction', verificationStatus: 'verified' },
  { id: 'gn-hostel-door', name: 'Hostel Main Reception', coordinates: { x: 80, y: 40 }, lat: 11.038549, lng: 77.073568, kind: 'door', buildingId: 'b-hostels', verificationStatus: 'verified' }
];

// Connected Walking Edges with Measured Distances and Accessibility Details
export const GEOSPATIAL_PATH_EDGES: PathEdge[] = [
  // Gate to Avenue East
  { from: 'gn-gate', to: 'gn-avenue-east', distanceMeters: 138, isAccessible: true, type: 'walkway', surface: 'asphalt', landmarkText: 'Enter through the main archway and proceed straight on the tree-lined boulevard', verificationStatus: 'verified' },
  { from: 'gn-avenue-east', to: 'gn-gate', distanceMeters: 138, isAccessible: true, type: 'walkway', surface: 'asphalt', landmarkText: 'Walk east toward the Main Campus Exit Gate', verificationStatus: 'verified' },

  // Avenue East to Parking
  { from: 'gn-avenue-east', to: 'gn-prk-junction', distanceMeters: 15, isAccessible: true, type: 'walkway', surface: 'asphalt', landmarkText: 'Turn right towards the Parking Area', verificationStatus: 'verified' },
  { from: 'gn-prk-junction', to: 'gn-avenue-east', distanceMeters: 15, isAccessible: true, type: 'walkway', surface: 'asphalt', landmarkText: 'Return to Main Boulevard', verificationStatus: 'verified' },
  { from: 'gn-prk-junction', to: 'gn-prk-entry', distanceMeters: 22, isAccessible: true, type: 'walkway', surface: 'asphalt', landmarkText: 'Enter surface parking grounds and bus terminal', verificationStatus: 'verified' },
  { from: 'gn-prk-entry', to: 'gn-prk-junction', distanceMeters: 22, isAccessible: true, type: 'walkway', surface: 'asphalt', landmarkText: 'Exit parking lot to central boulevard', verificationStatus: 'verified' },

  // Avenue East to Central Roundabout
  { from: 'gn-avenue-east', to: 'gn-roundabout', distanceMeters: 124, isAccessible: true, type: 'walkway', surface: 'asphalt', landmarkText: 'Follow the palm avenue past the administrative lawn to the roundabout', verificationStatus: 'verified' },
  { from: 'gn-roundabout', to: 'gn-avenue-east', distanceMeters: 124, isAccessible: true, type: 'walkway', surface: 'asphalt', landmarkText: 'Head east toward the parking and campus gate', verificationStatus: 'verified' },

  // Roundabout to Main Administrative Block & Tech Park
  { from: 'gn-roundabout', to: 'gn-admin-porch', distanceMeters: 98, isAccessible: true, type: 'walkway', surface: 'paved', landmarkText: 'Turn south along the curved driveway toward the glass-fronted Main Block', verificationStatus: 'verified' },
  { from: 'gn-admin-porch', to: 'gn-roundabout', distanceMeters: 98, isAccessible: true, type: 'walkway', surface: 'paved', landmarkText: 'Walk north toward the central campus roundabout', verificationStatus: 'verified' },
  { from: 'gn-admin-porch', to: 'gn-tech-porch', distanceMeters: 35, isAccessible: true, type: 'walkway', surface: 'paved', landmarkText: 'Walk east from Main Block porch to Tech Park entrance', verificationStatus: 'verified' },
  { from: 'gn-tech-porch', to: 'gn-admin-porch', distanceMeters: 35, isAccessible: true, type: 'walkway', surface: 'paved', landmarkText: 'Walk west toward Main Block porch', verificationStatus: 'verified' },
  { from: 'gn-roundabout', to: 'gn-tech-porch', distanceMeters: 95, isAccessible: true, type: 'walkway', surface: 'paved', landmarkText: 'Head south-east toward New Block (Tech Park)', verificationStatus: 'verified' },
  { from: 'gn-tech-porch', to: 'gn-roundabout', distanceMeters: 95, isAccessible: true, type: 'walkway', surface: 'paved', landmarkText: 'Head north toward central roundabout', verificationStatus: 'verified' },

  // Main Block to Food Court
  { from: 'gn-admin-porch', to: 'gn-cafe-junction', distanceMeters: 55, isAccessible: true, type: 'walkway', surface: 'concrete', landmarkText: 'Walk past the administrative gardens toward the food court', verificationStatus: 'verified' },
  { from: 'gn-cafe-junction', to: 'gn-admin-porch', distanceMeters: 55, isAccessible: true, type: 'walkway', surface: 'concrete', landmarkText: 'Head toward Main Block administrative porch', verificationStatus: 'verified' },
  { from: 'gn-cafe-junction', to: 'gn-cafe-door', distanceMeters: 38, isAccessible: true, type: 'walkway', surface: 'paved', landmarkText: 'Walk up to Food Court entrance', verificationStatus: 'verified' },
  { from: 'gn-cafe-door', to: 'gn-cafe-junction', distanceMeters: 38, isAccessible: true, type: 'walkway', surface: 'paved', landmarkText: 'Step out of Food Court onto main promenade', verificationStatus: 'verified' },

  // Roundabout to Library Crossway
  { from: 'gn-roundabout', to: 'gn-lib-cross', distanceMeters: 18, isAccessible: true, type: 'walkway', surface: 'asphalt', landmarkText: 'Proceed north across the plaza toward the Central Library', verificationStatus: 'verified' },
  { from: 'gn-lib-cross', to: 'gn-roundabout', distanceMeters: 18, isAccessible: true, type: 'walkway', surface: 'asphalt', landmarkText: 'Step into central roundabout', verificationStatus: 'verified' },
  { from: 'gn-lib-cross', to: 'gn-lib-door', distanceMeters: 42, isAccessible: true, type: 'walkway', surface: 'concrete', landmarkText: 'Take the paved walkway leading into the Central Library porch', verificationStatus: 'verified' },
  { from: 'gn-lib-door', to: 'gn-lib-cross', distanceMeters: 42, isAccessible: true, type: 'walkway', surface: 'concrete', landmarkText: 'Exit Central Library toward the plaza', verificationStatus: 'verified' },

  // Library Cross to Academic East
  { from: 'gn-lib-cross', to: 'gn-acad-east-junc', distanceMeters: 92, isAccessible: true, type: 'walkway', surface: 'concrete', landmarkText: 'Follow the covered pedestrian walkway connecting Library to Academic Block', verificationStatus: 'verified' },
  { from: 'gn-acad-east-junc', to: 'gn-lib-cross', distanceMeters: 92, isAccessible: true, type: 'walkway', surface: 'concrete', landmarkText: 'Walk toward the Central Library and Seminar Hall complex', verificationStatus: 'verified' },

  // Academic East to Academic Main Door & Central Plaza
  { from: 'gn-acad-east-junc', to: 'gn-acad-main-door', distanceMeters: 38, isAccessible: true, type: 'walkway', surface: 'concrete', landmarkText: 'Turn into Academic Block main porch entrance', verificationStatus: 'verified' },
  { from: 'gn-acad-main-door', to: 'gn-acad-east-junc', distanceMeters: 38, isAccessible: true, type: 'walkway', surface: 'concrete', landmarkText: 'Exit Academic Block eastward', verificationStatus: 'verified' },
  { from: 'gn-acad-main-door', to: 'gn-acad-central-cross', distanceMeters: 28, isAccessible: true, type: 'walkway', surface: 'concrete', landmarkText: 'Proceed along the ground floor colonnade', verificationStatus: 'verified' },
  { from: 'gn-acad-central-cross', to: 'gn-acad-main-door', distanceMeters: 28, isAccessible: true, type: 'walkway', surface: 'concrete', landmarkText: 'Walk toward main porch', verificationStatus: 'verified' },
  { from: 'gn-acad-central-cross', to: 'gn-acad-west-junc', distanceMeters: 52, isAccessible: true, type: 'walkway', surface: 'concrete', landmarkText: 'Walk through west academic wing walkway', verificationStatus: 'verified' },
  { from: 'gn-acad-west-junc', to: 'gn-acad-central-cross', distanceMeters: 52, isAccessible: true, type: 'walkway', surface: 'concrete', landmarkText: 'Head into Academic Block central foyer', verificationStatus: 'verified' },

  // Academic West to Mechanical Workshops
  { from: 'gn-acad-west-junc', to: 'gn-mech-junc', distanceMeters: 32, isAccessible: true, type: 'walkway', surface: 'asphalt', landmarkText: 'Head north towards the Mechanical Workshops', verificationStatus: 'verified' },
  { from: 'gn-mech-junc', to: 'gn-acad-west-junc', distanceMeters: 32, isAccessible: true, type: 'walkway', surface: 'asphalt', landmarkText: 'Walk south to the Academic Block', verificationStatus: 'verified' },
  { from: 'gn-mech-junc', to: 'gn-mech-door', distanceMeters: 12, isAccessible: true, type: 'walkway', surface: 'concrete', landmarkText: 'Enter Mechanical Engineering workshop high-bay doors', verificationStatus: 'verified' },
  { from: 'gn-mech-door', to: 'gn-mech-junc', distanceMeters: 12, isAccessible: true, type: 'walkway', surface: 'concrete', landmarkText: 'Step out to the workshop avenue', verificationStatus: 'verified' },

  // Academic West / Food Court to Sports Complex
  { from: 'gn-cafe-junction', to: 'gn-sports-junc', distanceMeters: 135, isAccessible: true, type: 'walkway', surface: 'asphalt', landmarkText: 'Follow the western avenue down towards the Sports Arena', verificationStatus: 'verified' },
  { from: 'gn-sports-junc', to: 'gn-cafe-junction', distanceMeters: 135, isAccessible: true, type: 'walkway', surface: 'asphalt', landmarkText: 'Walk up the avenue towards Food Court and Main Block', verificationStatus: 'verified' },
  { from: 'gn-acad-west-junc', to: 'gn-sports-junc', distanceMeters: 140, isAccessible: true, type: 'walkway', surface: 'asphalt', landmarkText: 'Walk south along the sports perimeter road', verificationStatus: 'verified' },
  { from: 'gn-sports-junc', to: 'gn-acad-west-junc', distanceMeters: 140, isAccessible: true, type: 'walkway', surface: 'asphalt', landmarkText: 'Walk north toward Academic Block west entrance', verificationStatus: 'verified' },

  // Sports Arena Courts
  { from: 'gn-sports-junc', to: 'gn-bball-court', distanceMeters: 42, isAccessible: true, type: 'walkway', surface: 'concrete', landmarkText: 'Walk into the floodlit Basketball Court pavilion', verificationStatus: 'verified' },
  { from: 'gn-bball-court', to: 'gn-sports-junc', distanceMeters: 42, isAccessible: true, type: 'walkway', surface: 'concrete', landmarkText: 'Step onto the sports perimeter path', verificationStatus: 'verified' },
  { from: 'gn-bball-court', to: 'gn-hball-court', distanceMeters: 35, isAccessible: true, type: 'walkway', surface: 'concrete', landmarkText: 'Walk along the court divider to the Handball Court', verificationStatus: 'verified' },
  { from: 'gn-hball-court', to: 'gn-bball-court', distanceMeters: 35, isAccessible: true, type: 'walkway', surface: 'concrete', landmarkText: 'Walk back to the Basketball Court', verificationStatus: 'verified' },
  { from: 'gn-sports-junc', to: 'gn-hball-court', distanceMeters: 55, isAccessible: true, type: 'walkway', surface: 'concrete', landmarkText: 'Follow the spectator path to the Handball Court', verificationStatus: 'verified' },
  { from: 'gn-hball-court', to: 'gn-sports-junc', distanceMeters: 55, isAccessible: true, type: 'walkway', surface: 'concrete', landmarkText: 'Walk to the sports avenue junction', verificationStatus: 'verified' },

  // Sports Complex to Hostels
  { from: 'gn-sports-junc', to: 'gn-hostel-junc', distanceMeters: 110, isAccessible: true, type: 'walkway', surface: 'asphalt', landmarkText: 'Proceed south along the avenue toward student residential hostels', verificationStatus: 'verified' },
  { from: 'gn-hostel-junc', to: 'gn-sports-junc', distanceMeters: 110, isAccessible: true, type: 'walkway', surface: 'asphalt', landmarkText: 'Walk north toward the Sports Arena and courts', verificationStatus: 'verified' },
  { from: 'gn-hostel-junc', to: 'gn-hostel-door', distanceMeters: 25, isAccessible: true, type: 'walkway', surface: 'paved', landmarkText: 'Enter student residential hostel reception', verificationStatus: 'verified' },
  { from: 'gn-hostel-door', to: 'gn-hostel-junc', distanceMeters: 25, isAccessible: true, type: 'walkway', surface: 'paved', landmarkText: 'Exit hostel to campus avenue', verificationStatus: 'verified' }
];

export const MAP_LAYERS = {
  satellite: {
    name: 'Esri World Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics',
    maxZoom: 21,
    maxNativeZoom: 19
  },
  osm: {
    name: 'OpenStreetMap Carto',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
    maxZoom: 21,
    maxNativeZoom: 19
  },
  dark: {
    name: 'CartoDB Dark Matter',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 21,
    maxNativeZoom: 19
  }
};
