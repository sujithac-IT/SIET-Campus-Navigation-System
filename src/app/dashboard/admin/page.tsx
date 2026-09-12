'use client';

import React, { useState } from 'react';
import { useCampusStore } from '@/lib/store/useCampusStore';
import { CampusMap } from '@/components/map/CampusMap';
import { NotificationPanel } from '@/components/notifications/NotificationPanel';
import { EmergencyButton } from '@/components/emergency/EmergencyModal';
import { ClassroomChangeModal } from '@/components/admin/ClassroomChangeModal';
import { Building, Room } from '@/types';
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
  Sparkles
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const store = useCampusStore();
  const [activeTab, setActiveTab] = useState<'analytics' | 'buildings' | 'users' | 'broadcast' | 'sos'>('analytics');
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

  const handleAddBuilding = (e: React.FormEvent) => {
    e.preventDefault();
    const building: Building = {
      id: `b-custom-${Date.now()}`,
      name: newBldName || 'New Science Block',
      code: newBldCode || 'SCI',
      category: newBldCategory,
      description: 'Newly added administrative & research building.',
      coordinates: { x: Number(newBldX), y: Number(newBldY) },
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
    }, 1500);
  };

  const activeUsersCount = store.users.length;
  const facultyOnlineCount = store.users.filter((u) => u.role === 'faculty').length;
  const studentsOnlineCount = store.users.filter((u) => u.role === 'student').length;
  const locationSharersCount = store.users.filter((u) => u.liveLocationSharing).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800 px-4 lg:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black">
              <Layers className="w-5 h-5" />
            </div>
            <h1 className="font-extrabold text-lg text-white">
              Admin<span className="text-amber-400">Portal</span>
            </h1>
          </Link>
        </div>

        {/* Tab Selector */}
        <div className="hidden md:flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs font-bold">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3.5 py-1.5 rounded-lg transition ${
              activeTab === 'analytics' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('buildings')}
            className={`px-3.5 py-1.5 rounded-lg transition ${
              activeTab === 'buildings' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Digital Twin Manager
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3.5 py-1.5 rounded-lg transition ${
              activeTab === 'users' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            User Directory
          </button>
          <button
            onClick={() => setActiveTab('broadcast')}
            className={`px-3.5 py-1.5 rounded-lg transition ${
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
                <h3 className="text-xl font-black text-white">Classroom & Timetable Change Dispatcher</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Trigger instant timetable mutations (e.g. <strong>LH-25 ➔ LH-28</strong>). The AI Impact Analysis Engine identifies affected students, calculates distance/walking deltas (+3 mins), sends push alerts, and auto-opens student navigation routes.
                </p>
              </div>

              <button
                onClick={() => setIsShiftModalOpen(true)}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-cyan-600 hover:from-rose-500 hover:to-cyan-500 text-white font-extrabold text-xs shadow-xl shadow-rose-950 flex items-center justify-center gap-2 shrink-0 transition active:scale-95 border border-rose-400/30"
              >
                <RefreshCw className="w-4 h-4 animate-spin-slow" />
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
                    <p className="text-[11px] text-sky-400 mt-2 font-medium">
                      Map Coords: ({b.coordinates.x}%, {b.coordinates.y}%)
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
