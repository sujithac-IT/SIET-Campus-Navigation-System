'use client';

import React, { useState } from 'react';
import { useCampusStore } from '@/lib/store/useCampusStore';
import { FacultyUser } from '@/types';
import {
  Search,
  Shield,
  MapPin,
  Clock,
  Navigation,
  MessageSquare,
  Calendar,
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const FacultyFinder: React.FC = () => {
  const store = useCampusStore();
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [activeFacultyModal, setActiveFacultyModal] = useState<FacultyUser | null>(null);
  const [meetingPurpose, setMeetingPurpose] = useState('');
  const [meetingTime, setMeetingTime] = useState('11:30 AM');
  const [requestSent, setRequestSent] = useState(false);

  const facultyList = store.users.filter((u) => u.role === 'faculty') as FacultyUser[];

  const filteredFaculty = facultyList.filter((fac) => {
    const matchesSearch =
      fac.name.toLowerCase().includes(search.toLowerCase()) ||
      fac.department.toLowerCase().includes(search.toLowerCase()) ||
      fac.roomNumber.toLowerCase().includes(search.toLowerCase());
    const matchesDept = departmentFilter === 'all' || fac.department === departmentFilter;
    return matchesSearch && matchesDept;
  });

  const handleNavigate = (fac: FacultyUser) => {
    if (fac.currentCoordinates) {
      store.startNavigationToCoords(fac.currentCoordinates, `${fac.name} (${fac.roomNumber})`);
    } else {
      store.startNavigationToRoom(`IT-HOD-${fac.roomNumber}`);
    }
  };

  const handleSendMeetingRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFacultyModal || !meetingPurpose.trim()) return;

    store.requestFacultyMeeting(
      activeFacultyModal.id,
      activeFacultyModal.name,
      meetingPurpose,
      meetingTime
    );

    setRequestSent(true);
    setTimeout(() => {
      setRequestSent(false);
      setActiveFacultyModal(null);
      setMeetingPurpose('');
    }, 1500);
  };

  return (
    <div className="w-full space-y-6">
      {/* Search & Filter Header */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-900/90 backdrop-blur-xl border border-slate-800 p-4 rounded-2xl shadow-xl">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sky-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder='Search faculty by name (e.g. "Dr. Prakash"), room, subject...'
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <select
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
        >
          <option value="all">All Departments</option>
          <option value="Information Technology">Information Technology</option>
          <option value="Computer Science">Computer Science</option>
        </select>
      </div>

      {/* Faculty Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredFaculty.map((fac) => {
          const coords = fac.currentCoordinates || { x: 45, y: 40 };
          const dist = Math.round(
            Math.sqrt(
              Math.pow(coords.x - store.userLocation.x, 2) +
                Math.pow(coords.y - store.userLocation.y, 2)
            ) * 8
          );

          return (
            <div
              key={fac.id}
              className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 hover:border-sky-500/50 rounded-2xl p-5 shadow-xl transition-all duration-300 hover:shadow-2xl flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-800 border border-slate-700 flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={fac.avatar} alt={fac.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-100 group-hover:text-sky-300 transition flex items-center gap-1.5">
                        {fac.name}
                        <Shield className="w-3.5 h-3.5 text-purple-400" />
                      </h4>
                      <p className="text-xs text-slate-400">{fac.designation}</p>
                      <p className="text-[11px] text-sky-400 font-medium">{fac.department}</p>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      fac.status === 'Available'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {fac.status}
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Room Number</span>
                    <span className="font-semibold text-slate-200">Room {fac.roomNumber}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Distance & ETA</span>
                    <span className="font-semibold text-sky-400">
                      {dist}m • {Math.ceil(dist / 75)} min walk
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center gap-2">
                <button
                  onClick={() => handleNavigate(fac)}
                  className="flex-1 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition shadow-md flex items-center justify-center gap-1.5"
                >
                  <Navigation className="w-3.5 h-3.5" /> Navigate
                </button>
                <button
                  onClick={() => setActiveFacultyModal(fac)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition flex items-center justify-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5 text-purple-400" /> Request Meeting
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Meeting Request Modal */}
      {activeFacultyModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full shadow-2xl text-white relative">
            <button
              onClick={() => setActiveFacultyModal(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-400" />
              Request Meeting with {activeFacultyModal.name}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {activeFacultyModal.department} • Room {activeFacultyModal.roomNumber}
            </p>

            {requestSent ? (
              <div className="my-8 text-center p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Meeting Request Dispatched!
              </div>
            ) : (
              <form onSubmit={handleSendMeetingRequest} className="mt-4 space-y-3">
                <div>
                  <label className="text-[11px] text-slate-400 font-semibold block mb-1">
                    Meeting Purpose / Subject
                  </label>
                  <input
                    type="text"
                    required
                    value={meetingPurpose}
                    onChange={(e) => setMeetingPurpose(e.target.value)}
                    placeholder="e.g. Project Guidance / Doubts in Networks"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 font-semibold block mb-1">
                    Preferred Time Slot
                  </label>
                  <select
                    value={meetingTime}
                    onChange={(e) => setMeetingTime(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="11:30 AM">11:30 AM (Post Class)</option>
                    <option value="01:30 PM">01:30 PM (Lunch Break)</option>
                    <option value="04:15 PM">04:15 PM (Evening Hours)</option>
                  </select>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveFacultyModal(null)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 font-bold text-xs text-slate-300 hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 font-bold text-xs text-white shadow-lg shadow-purple-600/30"
                  >
                    Submit Request
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
