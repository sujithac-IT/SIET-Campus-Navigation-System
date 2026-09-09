-- PostgreSQL + PostGIS Seed Data for SIET Smart Campus Navigator

INSERT INTO campuses (id, name, code, description) VALUES
('campus_siet_01', 'Sri Shakthi Institute of Engineering & Technology', 'SIET', 'Main Academic Campus')
ON CONFLICT (id) DO NOTHING;

INSERT INTO buildings (id, campus_id, name, code, category, description, coordinates_x, coordinates_y, icon, color) VALUES
('b-gate', 'campus_siet_01', 'Main Gate Security & Visitor Hub', 'GATE', 'gate', 'Primary entrance with 24/7 security & visitor parking', 15, 88, 'ShieldCheck', '#3b82f6'),
('b-[#academic]', 'campus_siet_01', 'Main Academic Block', 'ACAD', 'academic', 'Lecture Hall Complex housing LH 01 - LH 23 and Exam Cells', 30, 45, 'BookOpen', '#6366f1'),
('b-library', 'campus_siet_01', 'Central Library & LH Block', 'LIB', 'facility', 'Central Library, LH 24-28, Seminar Hall II & SBI ATM', 35, 55, 'BookOpen', '#10b981'),
('b-civil', 'campus_siet_01', 'Civil Engineering Block', 'CIVIL', 'academic', 'Civil Engineering Dept, LH 30, 32-35, 50, 53-55', 50, 30, 'Building', '#f59e0b'),
('b-techpark', 'campus_siet_01', 'Tech Park & Innovation Center', 'TECH', 'academic', 'R&D Labs, Software Incubation & AI/ML Excellence Center', 75, 25, 'Cpu', '#ec4899')
ON CONFLICT (id) DO NOTHING;

INSERT INTO floors (id, building_id, level, name) VALUES
('f-lib-0', 'b-library', 0, 'Ground Floor'),
('f-lib-2', 'b-library', 2, '2nd Floor'),
('f-lib-3', 'b-library', 3, '3rd Floor')
ON CONFLICT (id) DO NOTHING;

INSERT INTO rooms (id, building_id, floor_level, code, name, type, coordinates_x, coordinates_y, description) VALUES
('r-lh25', 'b-library', 2, 'LH25', 'Exam Hall LH 25', 'classroom', 35, 55, 'Central Library Block - Floor 2'),
('r-lh26', 'b-library', 2, 'LH26', 'Exam Hall LH 26', 'classroom', 35, 56, 'Central Library Block - Floor 2'),
('r-lib-ref', 'b-library', 0, 'LIB-G', 'Central Library Reference Ward', 'library', 35, 55, 'Central Reading Room with 50,000+ volumes'),
('r-lib-atm', 'b-library', 0, 'LIB-ATM-SBI', 'SBI ATM Point', 'atm', 33, 56, '24/7 ATM facility')
ON CONFLICT (id) DO NOTHING;

INSERT INTO users (id, name, email, password_hash, role, avatar_url) VALUES
('u-student-01', 'Aravind Kumar', 'aravind.siet@siet.ac.in', '$argon2id$v=19$m=65536,t=3,p=4$demo_hash_student', 'student', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'),
('u-faculty-01', 'Dr. R. Meenakshi', 'meenakshi.r@siet.ac.in', '$argon2id$v=19$m=65536,t=3,p=4$demo_hash_faculty', 'faculty', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'),
('u-admin-01', 'Campus Administrator', 'admin@siet.ac.in', '$argon2id$v=19$m=65536,t=3,p=4$demo_hash_admin', 'admin', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150')
ON CONFLICT (id) DO NOTHING;

INSERT INTO student_profiles (user_id, register_number, department, year, section) VALUES
('u-student-01', '714021104012', 'Computer Science & Engineering', 3, 'A')
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO faculty_profiles (user_id, employee_id, department, designation, room_number, building_id, status) VALUES
('u-faculty-01', 'SIET-FAC-204', 'Computer Science & Engineering', 'Associate Professor', 'IT-HOD-204', 'b-library', 'Available')
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO timetable_sessions (id, day, start_time, end_time, subject, room_code, building_id, faculty_user_id, faculty_name) VALUES
('ts-01', 'Monday', '09:00:00', '10:00:00', 'Data Structures & Algorithms', 'LH25', 'b-library', 'u-faculty-01', 'Dr. R. Meenakshi'),
('ts-02', 'Monday', '10:00:00', '11:00:00', 'Computer Networks', 'LH26', 'b-library', 'u-faculty-01', 'Dr. R. Meenakshi')
ON CONFLICT (id) DO NOTHING;
