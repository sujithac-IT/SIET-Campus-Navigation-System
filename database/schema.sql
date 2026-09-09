-- PostgreSQL + PostGIS Schema DDL for Smart Campus Navigator
-- Enables PostGIS extension for spatial queries and geofencing

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Campus Table
CREATE TABLE IF NOT EXISTS campuses (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(32) NOT NULL UNIQUE,
    description TEXT,
    bounding_polygon GEOMETRY(Polygon, 4326),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Building Table
CREATE TABLE IF NOT EXISTS buildings (
    id VARCHAR(64) PRIMARY KEY,
    campus_id VARCHAR(64) REFERENCES campuses(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(32) NOT NULL UNIQUE,
    category VARCHAR(64) NOT NULL, -- 'academic' | 'admin' | 'facility' | 'hostel' | 'sports' | 'medical' | 'gate'
    description TEXT,
    coordinates_x DOUBLE PRECISION NOT NULL,
    coordinates_y DOUBLE PRECISION NOT NULL,
    geom GEOMETRY(Point, 4326),
    footprint GEOMETRY(Polygon, 4326),
    icon VARCHAR(64),
    color VARCHAR(32),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Floor Table
CREATE TABLE IF NOT EXISTS floors (
    id VARCHAR(64) PRIMARY KEY,
    building_id VARCHAR(64) NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
    level INT NOT NULL,
    name VARCHAR(128) NOT NULL,
    map_image_url TEXT,
    UNIQUE (building_id, level)
);

-- 4. Room Table
CREATE TABLE IF NOT EXISTS rooms (
    id VARCHAR(64) PRIMARY KEY,
    building_id VARCHAR(64) NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
    floor_level INT NOT NULL,
    code VARCHAR(64) NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(64) NOT NULL, -- 'classroom' | 'lab' | 'office' | 'auditorium' | 'seminar' | 'canteen' | 'hostel_room' | 'facility' | 'medical' | 'restroom' | 'atm' | 'water' | 'parking' | 'lift' | 'staircase' | 'security' | 'library' | 'emergency_exit'
    capacity INT,
    is_available BOOLEAN DEFAULT TRUE,
    occupant VARCHAR(255),
    coordinates_x DOUBLE PRECISION NOT NULL,
    coordinates_y DOUBLE PRECISION NOT NULL,
    geom GEOMETRY(Point, 4326),
    description TEXT,
    amenities TEXT[],
    accessibility_info TEXT,
    opening_hours VARCHAR(128),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Facility Table
CREATE TABLE IF NOT EXISTS facilities (
    id VARCHAR(64) PRIMARY KEY,
    room_id VARCHAR(64) REFERENCES rooms(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(64) NOT NULL,
    operating_hours VARCHAR(128),
    verification_status VARCHAR(32) DEFAULT 'verified'
);

-- 6. NavigationNode Table
CREATE TABLE IF NOT EXISTS navigation_nodes (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    building_id VARCHAR(64) REFERENCES buildings(id) ON DELETE SET NULL,
    floor_level INT,
    coordinates_x DOUBLE PRECISION NOT NULL,
    coordinates_y DOUBLE PRECISION NOT NULL,
    geom GEOMETRY(Point, 4326),
    is_stairs_or_elevator BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. NavigationEdge Table
CREATE TABLE IF NOT EXISTS navigation_edges (
    id VARCHAR(64) PRIMARY KEY,
    from_node_id VARCHAR(64) NOT NULL REFERENCES navigation_nodes(id) ON DELETE CASCADE,
    to_node_id VARCHAR(64) NOT NULL REFERENCES navigation_nodes(id) ON DELETE CASCADE,
    distance_meters DOUBLE PRECISION NOT NULL,
    is_accessible BOOLEAN DEFAULT TRUE,
    type VARCHAR(32) NOT NULL DEFAULT 'walkway', -- 'walkway' | 'stairs' | 'elevator' | 'corridor'
    closure_status BOOLEAN DEFAULT FALSE,
    temporary_weight DOUBLE PRECISION DEFAULT 1.0
);

-- 8. Users & Profiles
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(32) NOT NULL, -- 'student' | 'faculty' | 'admin' | 'visitor'
    avatar_url TEXT,
    phone VARCHAR(32),
    live_location_sharing BOOLEAN DEFAULT TRUE,
    privacy_setting VARCHAR(32) DEFAULT 'campus',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS student_profiles (
    user_id VARCHAR(64) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    register_number VARCHAR(64) UNIQUE NOT NULL,
    department VARCHAR(128) NOT NULL,
    year INT NOT NULL,
    section VARCHAR(16) NOT NULL
);

CREATE TABLE IF NOT EXISTS faculty_profiles (
    user_id VARCHAR(64) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    employee_id VARCHAR(64) UNIQUE NOT NULL,
    department VARCHAR(128) NOT NULL,
    designation VARCHAR(128) NOT NULL,
    room_number VARCHAR(64),
    building_id VARCHAR(64) REFERENCES buildings(id) ON DELETE SET NULL,
    status VARCHAR(64) DEFAULT 'Available'
);

-- 9. Timetable Sessions Table
CREATE TABLE IF NOT EXISTS timetable_sessions (
    id VARCHAR(64) PRIMARY KEY,
    day VARCHAR(32) NOT NULL, -- 'Monday', 'Tuesday', ...
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    subject VARCHAR(255) NOT NULL,
    room_code VARCHAR(64) NOT NULL,
    building_id VARCHAR(64) REFERENCES buildings(id) ON DELETE CASCADE,
    faculty_user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    faculty_name VARCHAR(255) NOT NULL
);

-- 10. Events Table
CREATE TABLE IF NOT EXISTS events (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    event_time VARCHAR(64) NOT NULL,
    venue_building_id VARCHAR(64) REFERENCES buildings(id) ON DELETE CASCADE,
    venue_room_code VARCHAR(64) NOT NULL,
    organizer VARCHAR(255) NOT NULL,
    category VARCHAR(64) NOT NULL,
    registered_count INT DEFAULT 0,
    coordinates_x DOUBLE PRECISION NOT NULL,
    coordinates_y DOUBLE PRECISION NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Announcements Table
CREATE TABLE IF NOT EXISTS announcements (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    category VARCHAR(64) NOT NULL DEFAULT 'general', -- 'general' | 'academic' | 'event' | 'emergency'
    priority VARCHAR(32) DEFAULT 'NORMAL',
    role_target VARCHAR(32) DEFAULT 'all',
    author VARCHAR(255) NOT NULL,
    published_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE
);

-- 12. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    role_target VARCHAR(32) DEFAULT 'all',
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(32) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. Emergency Alerts Table
CREATE TABLE IF NOT EXISTS emergency_alerts (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    user_name VARCHAR(255) NOT NULL,
    user_role VARCHAR(32) NOT NULL,
    coordinates_x DOUBLE PRECISION NOT NULL,
    coordinates_y DOUBLE PRECISION NOT NULL,
    building_name VARCHAR(255),
    status VARCHAR(32) DEFAULT 'active',
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. QR Checkpoints Table
CREATE TABLE IF NOT EXISTS qr_checkpoints (
    id VARCHAR(64) PRIMARY KEY,
    campus_id VARCHAR(64) REFERENCES campuses(id) ON DELETE CASCADE,
    building_id VARCHAR(64) REFERENCES buildings(id) ON DELETE CASCADE,
    floor_level INT NOT NULL,
    node_id VARCHAR(64) REFERENCES navigation_nodes(id) ON DELETE CASCADE,
    room_code VARCHAR(64),
    payload JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 15. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    actor VARCHAR(255) NOT NULL,
    action VARCHAR(128) NOT NULL,
    entity VARCHAR(128) NOT NULL,
    previous_value TEXT,
    new_value TEXT,
    reason TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_buildings_code ON buildings(code);
CREATE INDEX IF NOT EXISTS idx_rooms_code ON rooms(code);
CREATE INDEX IF NOT EXISTS idx_rooms_building_floor ON rooms(building_id, floor_level);
CREATE INDEX IF NOT EXISTS idx_nav_nodes_coords ON navigation_nodes(coordinates_x, coordinates_y);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_announcements_expiry ON announcements(expires_at);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_buildings_geom ON buildings USING GIST(geom);
CREATE INDEX IF NOT EXISTS idx_rooms_geom ON rooms USING GIST(geom);
