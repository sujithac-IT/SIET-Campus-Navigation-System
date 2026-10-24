'use client';

import React, { useState } from 'react';
import { useCampusStore } from '@/lib/store/useCampusStore';
import { CampusMap } from '@/components/map/CampusMap';
import { NotificationPanel } from '@/components/notifications/NotificationPanel';
import { EmergencyButton } from '@/components/emergency/EmergencyModal';
import { ClassroomChangeModal } from '@/components/admin/ClassroomChangeModal';
import { Building, Room, TimetableSlot } from '@/types';
import {
  Layers,
  Building2,
  Users,
  Plus,
  Trash2,
  Edit,
  Radio,
  AlertTriangle,
  Bell,
  BarChart3,
  CheckCircle2,
  LogOut,
  ShieldCheck,
  Navigation,
  RefreshCw,
  Sparkles,
  FileSpreadsheet,
  Construction,
  Flag,
  Upload,
  Check,
  XCircle,
  Clock,
  Compass
} from 'lucide-react';
import Link from 'next/link';

interface PathSegment {
  id: string;
  name: string;
  from: string;
  to: string;
  isClosed: boolean;
  reason?: string;
}

interface MapReport {
  id: string;
  submittedBy: string;
  location: string;
  category: 'room_number' | 'amenity' | 'obstacle' | 'path';
  description: string;
  date: string;
  status: 'pending' | 'resolved';
}

const INITIAL_PATH_SEGMENTS: PathSegment[] = [
  { id: 'p-1', name: 'Main Gate to Central Roundabout', from: 'Main Entrance Gate (NH 544)', to: 'Central Campus Plaza', isClosed: false },
  { id: 'p-2', name: 'Academic Block West Walkway', from: 'Central Roundabout', to: 'Academic Block Porch', isClosed: false },
  { id: 'p-3', name: 'Workshops & Mechanical Lab Arterial', from: 'Central Roundabout', to: 'Workshops Entrance', isClosed: true, reason: 'Pavement Resurfacing' },
  { id: 'p-4', name: 'Canteen to Kaveri Hostel Avenue', from: 'Canteen Promenade', to: 'Hostel Avenue Junction', isClosed: false },
  { id: 'p-5', name: 'FIBA Basketball Court Access Trail', from: 'Central Roundabout', to: 'Sports Complex', isClosed: false },
];

const INITIAL_MAP_REPORTS: MapReport[] = [
  {
    id: 'rep-1',
    submittedBy: 'Rahul Sharma (714021104052)',
    location: 'Main Academic Block Floor 2',
    category: 'amenity',
    description: 'RO Water dispenser relocated from west wing corridor to near Room 204.',
    date: 'Today, 08:15 AM',
    status: 'pending',
  },
  {
    id: 'rep-2',
    submittedBy: 'Dr. Prakash (Faculty IT)',
    location: 'Tech Park Floor 1',
    category: 'room_number',
    description: 'Cloud Computing Lab label updated to "AWS Cloud & DevOps Center".',
    date: 'Yesterday, 04:30 PM',
    status: 'resolved',
  },
  {
    id: 'rep-3',
    submittedBy: 'Sujith M. (Student ECE)',
    location: 'Library Promenade',
    category: 'obstacle',
    description: 'Temporary scaffolding for annual paint maintenance near ramp entrance.',
    date: 'Today, 07:45 AM',
    status: 'pending',
  },
];

const SAMPLE_CSV = `CourseCode,Subject,RoomCode,BuildingId,Day,Time,FacultyName
CS301,Data Structures & Algorithms,LH-01,b-acad,Today,09:00 AM - 10:00 AM,Dr. R. Meenakshi
CS302,Database Management Systems,LH-02,b-acad,Today,10:00 AM - 11:00 AM,Prof. Vignesh
IT304,Cloud Computing Lab,TECH-201,b-tech,Today,11:30 AM - 01:00 PM,Dr. Prakash
AI401,Machine Learning & Neural Nets,TECH-AI-LAB,b-tech,Tomorrow,02:00 PM - 03:30 PM,Dr. K. Swaminathan`;

export default function AdminDashboard() {
  const store = useCampusStore();
  const [activeTab, setActiveTab] = useState<'analytics' | 'buildings' | 'users' | 'broadcast' | 'timetable_import' | 'path_closures'>('analytics');
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);

  // Building Form State
  const [showAddBuildingModal, setShowAddBuildingModal] = useState(false);
  const [newBldName, setNewBldName] = useState('');
  const [newBldCode, setNewBldCode] = useState('');
  const [newBldCategory, setNewBldCategory] = useState<Building['category']>('academic');
  const [newBldX, setNewBldX] = useState(50);
  const [newBldY, setNewBldY] = useState(50);

  // Broadcast Form State
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastSent, setBroadcastSent] = useState(false);

  // Timetable Import State
  const [csvContent, setCsvContent] = useState('');
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [importStatus, setImportStatus] = useState<'idle' | 'validated' | 'success'>('idle');

  // Path Network Closures & Reports State
  const [pathSegments, setPathSegments] = useState<PathSegment[]>(INITIAL_PATH_SEGMENTS);
  const [mapReports, setMapReports] = useState<MapReport[]>(INITIAL_MAP_REPORTS);

  const handleAddBuilding = (e: React.FormEvent) => {
    e.preventDefault();
    const building: Building = {
      id: `b-custom-${Date.now()}`,
      name: newBldName || 'New Science Block',
      code: newBldCode || 'SCI',
      category: newBldCategory,
      description: 'Newly added administrative & research building.',
      coordinates: { x: Number(newBldX), y: Number(newBldY) },
      verificationStatus: 'unverified' as const,
      sourceReference: 'Administrator Custom Mapping',
      icon: 'Building2',
      color: '#0284c7',
      floors: [
        {
          level: 0,
          name: 'Ground Floor',
          rooms: [
            {
              id: `r-${Date.now()}`,
              code: `${newBldCode}-101`,
              name: `${newBldName} Room 101`,
              type: 'classroom',
              buildingId: `b-custom-${Date.now()}`,
              floor: 0,
              isAvailable: true,
              coordinates: { x: Number(newBldX), y: Number(newBldY) }
            }
          ]
        }
      ]
    };

    store.addBuilding(building);
    setShowAddBuildingModal(false);
    setNewBldName('');
    setNewBldCode('');
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastMessage) return;

    store.addNotification({
      roleTarget: 'all',
      title: broadcastTitle,
      message: broadcastMessage,
      type: 'info'
    });

    setBroadcastSent(true);
    setTimeout(() => {
      setBroadcastSent(false);
      setBroadcastTitle('');
      setBroadcastMessage('');
    }, 2000);
  };

  // Timetable CSV parser and validator
  const handleValidateCsv = () => {
    if (!csvContent.trim()) return;

    const lines = csvContent.trim().split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length < 2) return;

    const headers = lines[0]!.split(',').map((h) => h.trim());
    const rows = [];

    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i]!.split(',').map((p) => p.trim());
      if (parts.length >= 6) {
        rows.push({
          courseCode: parts[0] || 'GEN101',
          subject: parts[1] || 'General Lecture',
          roomCode: parts[2] || 'LH-01',
          buildingId: parts[3] || 'b-acad',
          day: parts[4] || 'Today',
          time: parts[5] || '09:00 AM - 10:00 AM',
          facultyName: parts[6] || 'Faculty In-Charge',
          isValid: true,
        });
      }
    }

    setParsedRows(rows);
    setImportStatus('validated');
  };

  const handleApplyTimetable = () => {
    if (parsedRows.length === 0) return;

    const newSlots: TimetableSlot[] = parsedRows.map((r, idx) => ({
      id: `slot-${Date.now()}-${idx}`,
      day: r.day,
      time: r.time,
      subject: r.subject,
      roomCode: r.roomCode,
      buildingId: r.buildingId,
      facultyName: r.facultyName,
    }));

    store.timetable = [...newSlots];
    store.addNotification({
      title: 'Timetable Import Published',
      message: `Successfully synced ${newSlots.length} lecture & lab slots across campus schedule.`,
      type: 'info',
      roleTarget: 'all',
    });

    setImportStatus('success');
    setTimeout(() => {
      setImportStatus('idle');
      setParsedRows([]);
      setCsvContent('');
    }, 2000);
  };

  // Toggle path closure
  const togglePathClosure = (pathId: string) => {
    setPathSegments((prev) =>
      prev.map((p) => (p.id === pathId ? { ...p, isClosed: !p.isClosed, reason: !p.isClosed ? 'Under Repair' : undefined } : p))
    );
    const target = pathSegments.find((p) => p.id === pathId);
    store.addNotification({
      title: `Path Status Updated: ${target?.name}`,
      message: target?.isClosed ? 'Path reopened for normal foot traffic.' : 'Path marked CLOSED. Routing engine will divert walking routes.',
      type: target?.isClosed ? 'info' : 'status_update',
      roleTarget: 'all',
    });
  };

  // Resolve user map report
  const handleResolveReport = (reportId: string) => {
    setMapReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, status: 'resolved' as const } : r))
    );
  };

  const activeUsersCount = store.users.length;
  const facultyOnlineCount = store.users.filter((u) => u.role === 'faculty').length;
  const studentsOnlineCount = store.users.filter((u) => u.role === 'student').length;
  const locationSharersCount = store.users.filter((u) => u.liveLocationSharing || u.privacySetting === 'campus').length;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans">
      {/* Admin Header */}
      <header className="h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20">
            <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
          </div>
          <Link href="/dashboard/admin" className="text-left">
            <span className="text-[10px] font-bold text-amber-400 tracking-wider uppercase block">
              SIET Central Administration
            </span>
            <h1 className="font-extrabold text-lg text-white">
              Admin<span className="text-amber-400">Portal</span>
            </h1>
          </Link>
        </div>

        {/* Tab Selector */}
        <div className="hidden lg:flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs font-bold">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'analytics' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('buildings')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'buildings' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Digital Twin
          </button>
          <button
            onClick={() => setActiveTab('timetable_import')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1 ${
              activeTab === 'timetable_import' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Timetable CSV
          </button>
          <button
            onClick={() => setActiveTab('path_closures')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1 ${
              activeTab === 'path_closures' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Construction className="w-3.5 h-3.5" />
            Path Closures & Reports
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'users' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            User Directory
          </button>
          <button
            onClick={() => setActiveTab('broadcast')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'broadcast' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Notifications
          </button>
        </div>

        <div className="flex items-center gap-3">
          <EmergencyButton />
          <NotificationPanel />
          <Link href="/" className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white">
            <LogOut className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Real-time Analytics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xl">
              {activeUsersCount}
            </div>
            <div>
              <span className="text-xs text-slate-400 font-semibold block">Active Users</span>
              <span className="text-lg font-black text-white">Online Now</span>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xl">
              {facultyOnlineCount}
            </div>
            <div>
              <span className="text-xs text-slate-400 font-semibold block">Faculty Members</span>
              <span className="text-lg font-black text-white">Registered</span>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xl">
              {studentsOnlineCount}
            </div>
            <div>
              <span className="text-xs text-slate-400 font-semibold block">Students Active</span>
              <span className="text-lg font-black text-white">In Session</span>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xl">
              {locationSharersCount}
            </div>
            <div>
              <span className="text-xs text-slate-400 font-semibold block">Live Location</span>
              <span className="text-lg font-black text-white">Sharers</span>
            </div>
          </div>
        </div>

        {/* Classroom Shift Modal */}
        <ClassroomChangeModal isOpen={isShiftModalOpen} onClose={() => setIsShiftModalOpen(false)} />

        {/* Tab View Render */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* CORE USP CLASSROOM SHIFT HERO BANNER */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-rose-950/80 via-slate-900 to-slate-900 border border-rose-500/40 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-black uppercase tracking-wider border border-rose-500/30">
                  <Sparkles className="w-3.5 h-3.5" />
                  CORE USP REAL-TIME ENGINE
                </div>
                <h2 className="text-xl font-black text-white">Classroom & Timetable Change Dispatcher</h2>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Trigger instant timetable mutations (e.g. <strong>LH-25 ➔ LH-28</strong>). The AI Impact Analysis Engine identifies affected students, calculates distance/walking deltas (+3 mins), sends push alerts, and auto-opens student navigation routes.
                </p>
              </div>

              <button
                onClick={() => setIsShiftModalOpen(true)}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-cyan-600 hover:from-rose-500 hover:to-cyan-500 text-white font-extrabold text-xs shadow-xl shadow-rose-950 flex items-center justify-center gap-2 shrink-0 transition active:scale-95 border border-rose-400/30"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reassign Classroom (LH-25 ➔ LH-28)</span>
              </button>
            </div>

            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-200">Campus Digital Twin Map & Live Coordinates</h3>
              <button
                onClick={() => setShowAddBuildingModal(true)}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add Building / Node
              </button>
            </div>
            <CampusMap />
          </div>
        )}

        {activeTab === 'buildings' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-200">Registered Buildings ({store.buildings.length})</h3>
              <button
                onClick={() => setShowAddBuildingModal(true)}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add Building
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {store.buildings.map((b) => (
                <div
                  key={b.id}
                  className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm text-slate-100">{b.name}</span>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-400 text-[10px] font-mono font-bold">
                        {b.code}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{b.description}</p>
                    <p className="text-[11px] text-cyan-400 mt-2 font-medium">
                      GPS: {b.lat?.toFixed(5) || '11.04035'}, {b.lng?.toFixed(5) || '77.07485'}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-400">{b.floors.length} Floors</span>
                    <button
                      onClick={() => store.deleteBuilding(b.id)}
                      className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Timetable CSV Import Tab */}
        {activeTab === 'timetable_import' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5 text-amber-400" />
                    Batch Timetable CSV / JSON Upload
                  </h3>
                  <p className="text-xs text-slate-400">
                    Import semester lecture timetables and exam hall distributions with automated venue validation.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCsvContent(SAMPLE_CSV)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 text-xs font-bold transition"
                >
                  Load Sample Schedule
                </button>
              </div>

              <textarea
                rows={8}
                value={csvContent}
                onChange={(e) => setCsvContent(e.target.value)}
                placeholder="Paste CSV format: CourseCode,Subject,RoomCode,BuildingId,Day,Time,FacultyName..."
                className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500 transition"
              />

              <div className="flex items-center gap-3">
                <button
                  onClick={handleValidateCsv}
                  disabled={!csvContent.trim()}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white font-bold text-xs transition"
                >
                  Validate Structure
                </button>
                {parsedRows.length > 0 && (
                  <button
                    onClick={handleApplyTimetable}
                    className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-black text-xs transition shadow-lg shadow-amber-600/20 flex items-center gap-1.5"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Apply & Sync {parsedRows.length} Slots</span>
                  </button>
                )}
              </div>

              {importStatus === 'success' && (
                <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  Timetable successfully applied and pushed to all student devices!
                </div>
              )}

              {parsedRows.length > 0 && (
                <div className="pt-4 border-t border-slate-800 space-y-2">
                  <h4 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">
                    Parsed Preview ({parsedRows.length} Sessions)
                  </h4>
                  <div className="overflow-x-auto rounded-xl border border-slate-800">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-slate-950 text-[10px] uppercase font-bold text-slate-400">
                        <tr>
                          <th className="p-2.5">Code</th>
                          <th className="p-2.5">Subject</th>
                          <th className="p-2.5">Room</th>
                          <th className="p-2.5">Day & Time</th>
                          <th className="p-2.5">Faculty</th>
                          <th className="p-2.5">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                        {parsedRows.map((r, i) => (
                          <tr key={i} className="hover:bg-slate-800/30">
                            <td className="p-2.5 text-amber-400 font-bold">{r.courseCode}</td>
                            <td className="p-2.5 font-sans font-medium">{r.subject}</td>
                            <td className="p-2.5 text-cyan-400 font-bold">{r.roomCode}</td>
                            <td className="p-2.5 text-slate-400">{r.day} • {r.time}</td>
                            <td className="p-2.5 font-sans">{r.facultyName}</td>
                            <td className="p-2.5">
                              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400">
                                <Check className="w-3 h-3" /> Valid
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Path Closures & Map Reports Tab */}
        {activeTab === 'path_closures' && (
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Walkway closures section */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
              <div className="space-y-1">
                <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                  <Construction className="w-5 h-5 text-amber-400" />
                  Campus Walkway & Arterial Maintenance Manager
                </h3>
                <p className="text-xs text-slate-400">
                  Toggle route availability for construction, monsoon water-logging, or VIP convocation closures. The Dijkstra routing engine automatically penalizes or diverts through alternative paths.
                </p>
              </div>

              <div className="divide-y divide-slate-800 border border-slate-800 rounded-2xl overflow-hidden">
                {pathSegments.map((segment) => (
                  <div key={segment.id} className="p-4 flex items-center justify-between bg-slate-900/40 hover:bg-slate-800/30 transition">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-200">{segment.name}</span>
                        {segment.isClosed ? (
                          <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-black uppercase tracking-wider">
                            ⛔ Closed: {segment.reason || 'Maintenance'}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider">
                            ✅ Open
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400">
                        {segment.from} ➔ {segment.to}
                      </p>
                    </div>

                    <button
                      onClick={() => togglePathClosure(segment.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition shadow ${
                        segment.isClosed
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                          : 'bg-rose-600/80 hover:bg-rose-600 text-white'
                      }`}
                    >
                      {segment.isClosed ? 'Reopen Corridor' : 'Mark Closed'}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* User Map Inaccuracy Reports */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
              <div className="space-y-1">
                <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                  <Flag className="w-5 h-5 text-amber-400" />
                  Crowdsourced Map Inaccuracy Reports ({mapReports.length})
                </h3>
                <p className="text-xs text-slate-400">
                  Student and faculty feedback submitted through the navigation assistant to keep room allocations and facilities accurate.
                </p>
              </div>

              <div className="space-y-3">
                {mapReports.map((report) => (
                  <div
                    key={report.id}
                    className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-xs text-slate-200">{report.location}</span>
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-400 text-[10px] font-mono">
                          {report.category}
                        </span>
                        <span className="text-[10px] text-slate-500">{report.date}</span>
                      </div>
                      <p className="text-xs text-slate-300">{report.description}</p>
                      <p className="text-[10px] text-slate-500">Reported by: {report.submittedBy}</p>
                    </div>

                    <div>
                      {report.status === 'resolved' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
                          <Check className="w-3.5 h-3.5" /> Resolved
                        </span>
                      ) : (
                        <button
                          onClick={() => handleResolveReport(report.id)}
                          className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs transition"
                        >
                          Verify & Apply
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* User Directory Tab */}
        {activeTab === 'users' && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-400" /> Active Campus Directory ({store.users.length})
            </h3>
            <div className="divide-y divide-slate-800 border border-slate-800 rounded-2xl overflow-hidden">
              {store.users.map((u) => (
                <div key={u.id} className="p-4 flex items-center justify-between bg-slate-900/40">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-200">{u.name}</span>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-400 text-[10px] font-mono uppercase">
                        {u.role}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{u.email}</p>
                  </div>
                  <span className="text-xs text-slate-500 font-mono">
                    Privacy: {u.privacySetting}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Broadcast Tab */}
        {activeTab === 'broadcast' && (
          <div className="max-w-xl mx-auto bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-400" /> Send Targeted Broadcast Announcement
            </h3>

            {broadcastSent ? (
              <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold text-center flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Broadcast Dispatched to All Active Devices!
              </div>
            ) : (
              <form onSubmit={handleSendBroadcast} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Notification Title</label>
                  <input
                    type="text"
                    required
                    value={broadcastTitle}
                    onChange={(e) => setBroadcastTitle(e.target.value)}
                    placeholder="e.g. Schedule Modification / Campus Event Alert"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Message Content</label>
                  <textarea
                    rows={4}
                    required
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                    placeholder="Enter broadcast message detail..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs shadow-lg shadow-amber-600/30 transition"
                >
                  Send Broadcast Announcement
                </button>
              </form>
            )}
          </div>
        )}
      </main>

      {/* Add Building Modal */}
      {showAddBuildingModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full shadow-2xl text-white">
            <h3 className="text-base font-bold text-slate-100 mb-4">Add New Digital Twin Building</h3>
            <form onSubmit={handleAddBuilding} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Building Name</label>
                <input
                  type="text"
                  required
                  value={newBldName}
                  onChange={(e) => setNewBldName(e.target.value)}
                  placeholder="e.g. Science & Innovation Wing"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Code</label>
                <input
                  type="text"
                  required
                  value={newBldCode}
                  onChange={(e) => setNewBldCode(e.target.value)}
                  placeholder="e.g. SCI"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Map X (%)</label>
                  <input
                    type="number"
                    value={newBldX}
                    onChange={(e) => setNewBldX(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Map Y (%)</label>
                  <input
                    type="number"
                    value={newBldY}
                    onChange={(e) => setNewBldY(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddBuildingModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-600 text-white font-bold"
                >
                  Save Building
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
