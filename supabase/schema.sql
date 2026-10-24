-- =============================================================================
-- SIET SmartNav — Supabase Database Schema & Seed Data
-- Sri Shakthi Institute of Engineering and Technology (SIET), Coimbatore
-- =============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. BUILDINGS TABLE
create table if not exists public.buildings (
  id text primary key,
  name text not null,
  code text not null,
  category text not null check (category in ('academic', 'admin', 'facility', 'sports', 'hostel', 'gate', 'parking', 'medical')),
  description text,
  lat double precision not null,
  lng double precision not null,
  entrance_lat double precision,
  entrance_lng double precision,
  polygon jsonb,
  icon text default 'Building',
  color text default '#0284c7',
  department text,
  facilities text[],
  accessibility_info text,
  photo_url text,
  verification_status text default 'verified',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. FLOORS TABLE
create table if not exists public.floors (
  id text primary key,
  building_id text references public.buildings(id) on delete cascade,
  level integer not null,
  name text not null,
  plan_image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. ROOMS & EXAM HALLS TABLE
create table if not exists public.rooms (
  id text primary key,
  building_id text references public.buildings(id) on delete cascade,
  floor_id text,
  floor_level integer not null default 0,
  code text not null,
  name text not null,
  type text not null check (type in ('classroom', 'lab', 'office', 'restroom', 'library', 'canteen', 'auditorium', 'seminar', 'lift', 'stairs', 'emergency_exit', 'water', 'atm', 'security', 'sports', 'facility')),
  description text,
  is_available boolean default true,
  capacity integer default 40,
  accessibility_info text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. PATH NODES (Navigation Graph)
create table if not exists public.path_nodes (
  id text primary key,
  name text not null,
  lat double precision not null,
  lng double precision not null,
  kind text default 'junction',
  building_id text references public.buildings(id) on delete set null,
  verification_status text default 'verified'
);

-- 5. PATH EDGES (Walkways)
create table if not exists public.path_edges (
  id uuid default uuid_generate_v4() primary key,
  from_node text references public.path_nodes(id) on delete cascade,
  to_node text references public.path_nodes(id) on delete cascade,
  distance_meters double precision not null,
  is_accessible boolean default true,
  type text default 'walkway',
  surface text default 'asphalt',
  landmark_text text
);

-- 6. TIMETABLE SLOTS
create table if not exists public.timetables (
  id uuid default uuid_generate_v4() primary key,
  day_of_week text not null,
  start_time time not null,
  end_time time not null,
  subject text not null,
  room_code text not null,
  building_id text references public.buildings(id),
  faculty_name text not null,
  department text not null,
  semester integer default 4,
  is_active boolean default true
);

-- 7. ANNOUNCEMENTS
create table if not exists public.announcements (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  content text not null,
  priority text default 'normal' check (priority in ('low', 'normal', 'urgent')),
  category text default 'general',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS) on all tables with public read access
alter table public.buildings enable row level security;
alter table public.floors enable row level security;
alter table public.rooms enable row level security;
alter table public.path_nodes enable row level security;
alter table public.path_edges enable row level security;
alter table public.timetables enable row level security;
alter table public.announcements enable row level security;

create policy "Public read buildings" on public.buildings for select using (true);
create policy "Public read floors" on public.floors for select using (true);
create policy "Public read rooms" on public.rooms for select using (true);
create policy "Public read path_nodes" on public.path_nodes for select using (true);
create policy "Public read path_edges" on public.path_edges for select using (true);
create policy "Public read timetables" on public.timetables for select using (true);
create policy "Public read announcements" on public.announcements for select using (true);

-- =============================================================================
-- SEED DATA (Corrected SIET Campus Geo Data)
-- =============================================================================

insert into public.buildings (id, name, code, category, description, lat, lng, entrance_lat, entrance_lng, icon, color, department, facilities)
values
  (
    'b-main-block',
    'Main Block (Five-Storey Academic & Lab Complex)',
    'MAIN',
    'academic',
    'Primary 5-storey edifice on the west lawn housing Exam Halls LH 01 to LH 23, AI Research Center, computing laboratories, and departmental faculty chambers.',
    11.040404,
    77.074018,
    11.040450,
    77.074250,
    'Building2',
    '#0284c7',
    'CSE, IT, AI & Data Science, ECE',
    array['LH 01 to LH 23 Exam Halls', 'High-Speed Elevators', 'AI Research Lab', 'Computing Center', 'Restrooms every floor']
  ),
  (
    'b-academic-block',
    'Academic Block (COE & Engineering Wing)',
    'ACAD',
    'admin',
    'Signature glass-fronted administrative center housing Controller of Examinations (COE), Principal Secretariat, Exam Halls LH 24 to LH 68, and Engineering Laboratories.',
    11.039940,
    77.074923,
    11.040050,
    77.075050,
    'GraduationCap',
    '#0d9488',
    'Controller of Examinations, Mechanical, Civil, Agri, EEE',
    array['COE Autonomous Exam Wing', 'LH 24 to LH 68 Exam Halls', 'Principal Secretariat', 'Seminar Hall II', 'Labs 01-13']
  ),
  (
    'b-techpark',
    'Tech Park (New Innovation & Computing Block)',
    'TECH',
    'academic',
    'Premier innovation hub housing Exam Halls 1A to 2D, Incubation Center, AI & Robotics Lab, and Cloud Computing Laboratories.',
    11.040734,
    77.074880,
    11.040680,
    77.074800,
    'Cpu',
    '#8b5cf6',
    'Tech Park & Innovation Wing',
    array['Exam Halls 1A, 1B, 1C, 1D, 2A, 2B, 2C, 2D', 'Startup Incubator', 'Cloud Computing Lab', 'Robotics Lab']
  ),
  (
    'b-amphitheatre',
    'Open Air Amphitheatre',
    'AMPHI',
    'facility',
    'Circular tiered open-air amphitheatre located between Main Block and Tech Park for college cultural festivals, hackathons, and student assemblies.',
    11.040320,
    77.074400,
    11.040320,
    77.074400,
    'Sparkles',
    '#ec4899',
    'Student Affairs & Cultural Wing',
    array['Acoustic Stage Shell', 'Circular Tiered Seating', 'Cultural Event Stage', 'Wi-Fi Hotspot']
  ),
  (
    'b-girls-hostel',
    'Girls Hostel Complex',
    'G-HOSTEL',
    'hostel',
    'Secure residential quarters for female students featuring furnished rooms, dining hall, study lounge, and 24/7 security warden.',
    11.038450,
    77.073900,
    11.038540,
    77.073950,
    'Home',
    '#f43f5e',
    'Hostel Administration',
    array['Female Student Dormitories', 'Resident Warden Office', 'Dining Hall', 'RO Water Dispensers', '24/7 Security Desk']
  ),
  (
    'b-boys-hostel',
    'Boys Hostel Complex',
    'B-HOSTEL',
    'hostel',
    'Residential quarters for male students with recreational sports room, study hall, and dining services.',
    11.038200,
    77.073200,
    11.038300,
    77.073350,
    'Home',
    '#6366f1',
    'Hostel Administration',
    array['Male Student Dormitories', 'Dining Facility', 'Recreation Room', 'Wi-Fi Study Lounge']
  ),
  (
    'b-gate',
    'Main Campus Entrance Gateway',
    'GATE',
    'gate',
    'Grand entrance archway on NH 544 (Coimbatore By-Pass) with security checkpoint, visitor registration, and barrier controls.',
    11.040913,
    77.077493,
    11.040913,
    77.077493,
    'ShieldCheck',
    '#0284c7',
    'Campus Security & Estate Office',
    array['24/7 Security Post', 'Visitor Registration Counter', 'Emergency Reporting Point']
  ),
  (
    'b-foodcourt',
    'Campus Food Court & Cafeteria',
    'CAFE',
    'facility',
    'Multi-cuisine dining facility serving south Indian, north Indian, healthy juices, and beverages.',
    11.039469,
    77.075457,
    11.039554,
    77.075100,
    'Coffee',
    '#f59e0b',
    'Student Welfare & Catering',
    array['500-seat Dining Hall', 'Juice Bar', 'FSSAI Certified Kitchen']
  ),
  (
    'b-sports-arena',
    'SIET Sports Arena & Outdoor Courts',
    'SPORTS',
    'sports',
    'Synthetic FIBA-standard Basketball Court, regulation Handball Court, and athletic sprint tracks.',
    11.039450,
    77.073400,
    11.039500,
    77.073700,
    'Trophy',
    '#eab308',
    'Department of Physical Education',
    array['Synthetic Basketball Court', 'Handball Court', 'Volleyball Court', 'Athletic Track']
  ),
  (
    'b-parking',
    'Surface Parking Grounds',
    'PRK',
    'parking',
    'Dedicated surface parking bays for college buses, faculty vehicles, and student two-wheelers.',
    11.041210,
    77.076217,
    11.041063,
    77.076238,
    'Car',
    '#64748b',
    'Transport Department',
    array['Bus Terminal Bay', 'Staff Four-Wheeler Parking', 'Two-Wheeler Shed']
  ),
  (
    'b-mech-workshops',
    'Mechanical & Heavy Engineering Workshops',
    'MECH',
    'academic',
    'Precision engineering workshops, CNC machining centers, automotive research labs, and foundry.',
    11.040978,
    77.073547,
    11.040920,
    77.073650,
    'Wrench',
    '#f97316',
    'Mechanical & Mechatronics',
    array['CNC Machining Center', 'Automotive Dyno Lab', 'Foundry & Welding Bay']
  )
on conflict (id) do update set
  name = excluded.name,
  code = excluded.code,
  category = excluded.category,
  description = excluded.description,
  lat = excluded.lat,
  lng = excluded.lng,
  facilities = excluded.facilities;

-- SEED KEY EXAM HALLS
insert into public.rooms (id, building_id, floor_level, code, name, type, description)
values
  ('r-lh01', 'b-main-block', 0, 'LH 01', 'Exam Hall LH 01', 'classroom', 'Ground Floor - Main Block'),
  ('r-lh02', 'b-main-block', 0, 'LH 02', 'Exam Hall LH 02', 'classroom', 'Ground Floor - Main Block'),
  ('r-lh12', 'b-main-block', 1, 'LH 12', 'Exam Hall LH 12', 'classroom', '1st Floor - Main Block'),
  ('r-lh24', 'b-academic-block', 0, 'LH 24', 'Exam Hall LH 24', 'classroom', 'Ground Floor - Academic Block'),
  ('r-lh25', 'b-academic-block', 0, 'LH 25', 'Exam Hall LH 25', 'classroom', 'Ground Floor - Academic Block'),
  ('r-lh54', 'b-academic-block', 3, 'LH 54', 'Exam Hall LH 54', 'classroom', '3rd Floor - Academic Block'),
  ('r-tp-1a', 'b-techpark', 1, '1A', 'Exam Hall 1A', 'classroom', '1st Floor - Tech Park'),
  ('r-tp-2a', 'b-techpark', 2, '2A', 'Exam Hall 2A', 'classroom', '2nd Floor - Tech Park'),
  ('r-amphi-stage', 'b-amphitheatre', 0, 'AMPHI-STAGE', 'Amphitheatre Stage Arena', 'auditorium', 'Main Cultural Stage between Main Block and Tech Park'),
  ('r-gh-warden', 'b-girls-hostel', 0, 'GH-WARDEN', 'Girls Hostel Warden Office', 'office', 'Ground Floor - Girls Hostel')
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description;
