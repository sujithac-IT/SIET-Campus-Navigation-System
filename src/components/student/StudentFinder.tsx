'use client';

import React, { useState } from 'react';
import { useCampusStore } from '@/lib/store/useCampusStore';
import { StudentUser } from '@/types';
import { Search, GraduationCap, MapPin, Radio, Lock, Navigation } from 'lucide-react';

export const StudentFinder: React.FC = () => {
  const store = useCampusStore();
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');

  const studentList = store.users.filter((u) => u.role === 'student') as StudentUser[];

  const filteredStudents = studentList.filter((stu) => {
    const matchesSearch =
      stu.name.toLowerCase().includes(search.toLowerCase()) ||
      stu.registerNumber.toLowerCase().includes(search.toLowerCase());
    const matchesDept = deptFilter === 'all' || stu.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="w-full space-y-6">
      {/* Header Search & Filter */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-900/90 backdrop-blur-xl border border-slate-800 p-4 rounded-2xl shadow-xl">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sky-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder='Search student by name or register number (e.g. "7376211IT105")...'
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
        >
          <option value="all">All Departments</option>
          <option value="Information Technology">Information Technology</option>
          <option value="Computer Science">Computer Science</option>
        </select>
      </div>

      {/* Student List Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredStudents.map((stu) => {
          const canSeeLiveLocation = stu.liveLocationSharing && stu.privacySetting !== 'nobody';

          return (
            <div
              key={stu.id}
              className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl p-5 shadow-xl flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-800 border border-slate-700 flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={stu.avatar} alt={stu.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
                    {stu.name}
                    <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
                  </h4>
                  <p className="text-xs text-slate-400">{stu.registerNumber}</p>
                  <p className="text-[11px] text-sky-400 font-medium">
                    {stu.department} • Year {stu.year} (Sec {stu.section})
                  </p>
                </div>
              </div>

              {/* Privacy-Aware Location Status */}
              <div>
                {canSeeLiveLocation ? (
                  <button
                    onClick={() => {
                      if (stu.currentCoordinates) {
                        store.startNavigationToCoords(stu.currentCoordinates, `Student: ${stu.name}`);
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold hover:bg-emerald-500 hover:text-white transition flex items-center gap-1.5"
                  >
                    <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
                    <span>Live Map</span>
                  </button>
                ) : (
                  <span className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-400 text-xs font-medium flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Private</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
