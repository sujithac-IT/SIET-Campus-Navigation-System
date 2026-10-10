'use client';

import React, { useState } from 'react';
import { useCampusStore } from '@/lib/store/useCampusStore';
import { Announcement, UserRole } from '@/types';
import { 
  Radio, 
  User, 
  Clock, 
  Send, 
  AlertTriangle, 
  Info, 
  Calendar, 
  Lock,
  Plus,
  X
} from 'lucide-react';
import Link from 'next/link';

export default function AnnouncementsPage() {
  const store = useCampusStore();
  const currentUser = store.currentUser;
  
  // Create Announcement Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState<Announcement['category']>('general');
  const [roleTarget, setRoleTarget] = useState<UserRole | 'all'>('all');

  // Filter announcements based on user role
  const getVisibleAnnouncements = () => {
    if (!currentUser) {
      // Guests see only public announcements
      return store.announcements.filter((ann) => ann.roleTarget === 'all' || !ann.roleTarget);
    }
    
    // Students or Faculty see their target announcements + public ones
    return store.announcements.filter(
      (ann) => ann.roleTarget === 'all' || ann.roleTarget === currentUser.role
    );
  };

  const visibleAnnouncements = getVisibleAnnouncements();

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;

    store.addAnnouncement({
      title,
      message,
      category,
      roleTarget,
      author: currentUser?.name || 'Authorized Staff'
    });

    // Reset Form
    setTitle('');
    setMessage('');
    setCategory('general');
    setRoleTarget('all');
    setShowAddForm(false);
  };

  const getCategoryStyles = (cat: Announcement['category']) => {
    switch (cat) {
      case 'emergency':
        return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'academic':
        return 'text-sky-400 bg-sky-500/10 border-sky-500/20';
      case 'event':
        return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
      default:
        return 'text-slate-300 bg-slate-800/40 border-slate-700/60';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-12">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/60 pb-5">
        <div className="space-y-1">
          <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <Radio className="w-6 h-6 text-sky-400 animate-pulse" />
            Campus Broadcasts & News
          </h2>
          <p className="text-xs text-slate-400">
            Stay updated with classroom allocations, syllabus adjustments, exam schedules, and department meetings.
          </p>
        </div>

        {/* Faculty Broadcast creation button */}
        {currentUser && (currentUser.role === 'faculty' || currentUser.role === 'admin') && (
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition shadow-md flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Post Announcement</span>
          </button>
        )}
      </div>

      {/* Faculty Add Announcement Modal Drawer */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative space-y-5 animate-in scale-in duration-300">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                <Radio className="w-5 h-5 text-sky-400" />
                Post Authorized Announcement
              </h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAnnouncement} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-slate-400 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Computer Networks Practical Room Shifted"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-850 border border-slate-700 text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Content / Message</label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Provide precise details, dates, and locations if applicable."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-850 border border-slate-700 text-white focus:ring-2 focus:ring-sky-500 focus:outline-none resize-none font-medium text-xs leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Announcement['category'])}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-850 border border-slate-700 text-white focus:ring-2 focus:ring-sky-500 focus:outline-none font-bold"
                  >
                    <option value="general">General</option>
                    <option value="academic">Academic</option>
                    <option value="event">Event</option>
                    <option value="emergency">Emergency Alert</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Audience Target</label>
                  <select
                    value={roleTarget}
                    onChange={(e) => setRoleTarget(e.target.value as UserRole | 'all')}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-850 border border-slate-700 text-white focus:ring-2 focus:ring-sky-500 focus:outline-none font-bold"
                  >
                    <option value="all">Everyone (Public)</option>
                    <option value="student">Students Only</option>
                    <option value="faculty">Faculty Only</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs shadow-lg transition flex items-center justify-center gap-1.5"
              >
                <Send className="w-4 h-4" />
                <span>Publish Broadcast</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Announcements List (Left 2 Columns) */}
        <div className="lg:col-span-2 space-y-4">
          {visibleAnnouncements.length > 0 ? (
            visibleAnnouncements.map((ann) => (
              <div
                key={ann.id}
                className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3.5 relative overflow-hidden group"
              >
                {ann.category === 'emergency' && (
                  <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-red-500" />
                )}

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-lg border text-[9px] font-black uppercase tracking-wider ${getCategoryStyles(ann.category)}`}>
                      {ann.category}
                    </span>
                    <span className="text-[10px] text-slate-400 bg-slate-800/45 px-2 py-0.5 rounded-md font-bold">
                      Audience: {ann.roleTarget === 'all' ? 'Public' : `${ann.roleTarget}s`}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>{ann.timestamp}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h4 className="font-extrabold text-sm text-slate-100 group-hover:text-sky-400 transition-colors">
                    {ann.title}
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed font-medium">
                    {ann.message}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400 font-bold">
                  <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    Posted by: <strong className="text-slate-300">{ann.author}</strong>
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="py-16 text-center bg-slate-900/10 border border-slate-800 border-dashed rounded-3xl">
              <Radio className="w-12 h-12 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-400">No active broadcasts listed.</p>
            </div>
          )}
        </div>

        {/* Personalized Announcements Lock Overlay (Right 1 Column) */}
        {!currentUser && (
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-center text-center space-y-4 min-h-[300px]">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mx-auto shadow-md">
              <Lock className="w-6 h-6 animate-pulse" />
            </div>
            <div className="space-y-1.5">
              <h4 className="font-extrabold text-sm text-slate-200">Personalized Updates Locked</h4>
              <p className="text-xs text-slate-400 leading-relaxed px-4">
                Verify your College ID status to unlock student/faculty specific announcements, timetable updates, and departmental notifications.
              </p>
            </div>
            <Link
              href="/auth"
              className="py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs transition shadow-md block"
            >
              Sign In with College ID
            </Link>
          </div>
        )}

        {currentUser && (
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h4 className="font-extrabold text-sm text-slate-200 flex items-center gap-2">
              <Info className="w-4 h-4 text-sky-400" />
              Active Target Role
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed font-semibold">
              You are logged in as a <span className="text-sky-400 font-extrabold uppercase bg-sky-500/10 px-2 py-0.5 rounded-md border border-sky-500/20 text-[10px] tracking-wider">{currentUser.role}</span>.
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your broadcast view includes both public campus notices and specialized {currentUser.role}-only updates.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
