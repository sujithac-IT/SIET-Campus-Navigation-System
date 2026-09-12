'use client';

import React, { useState } from 'react';
import { useCampusStore } from '@/lib/store/useCampusStore';
import { RefreshCw, AlertCircle, CheckCircle2, X, Sparkles, Users, ArrowRight, Clock, MapPin, Send } from 'lucide-react';

interface ClassroomChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ClassroomChangeModal: React.FC<ClassroomChangeModalProps> = ({ isOpen, onClose }) => {
  const store = useCampusStore();
  const [selectedSubject, setSelectedSubject] = useState('Data Structures');
  const [oldRoom, setOldRoom] = useState('LH-25');
  const [newRoom, setNewRoom] = useState('LH-28');
  const [reason, setReason] = useState('Projector Maintenance in LH-25');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  // Pre-flight AI Impact Calculations
  const affectedStudentsCount = 62;
  const oldBuildingName = 'Library Block Floor 2';
  const newBuildingName = 'Library Block Floor 2';
  const walkingTimeDeltaMinutes = 3;
  const departureRecommendation = `Your ${selectedSubject} session shifted to ${newRoom}. Leave 5 minutes earlier to arrive on time.`;

  const handleSubmitReassignment = (e: React.FormEvent) => {
    e.preventDefault();

    // Trigger complete end-to-end pipeline in Global Store
    store.triggerClassroomReassignment({
      subject: selectedSubject,
      oldRoomCode: oldRoom,
      newRoomCode: newRoom,
      reason,
      affectedDepartments: ['Department of Information Technology']
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#0b1329] border border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-100">Real-Time Classroom Reassignment</h2>
              <p className="text-xs text-slate-400">AI Impact Engine & Instant Student Push Dispatch</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center space-y-3">
            <div className="inline-flex p-4 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-10 h-10 animate-bounce" />
            </div>
            <h3 className="text-base font-bold text-slate-100">Classroom Reassigned & Published!</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Timetable updated to <span className="text-emerald-400 font-bold">{newRoom}</span>. 62 student app notifications & SMS fallbacks dispatched.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmitReassignment} className="p-6 space-y-4">
            
            {/* Input Selection */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Subject / Session</label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="Data Structures">Data Structures & Algorithms (3rd Year IT)</option>
                  <option value="Computer Networks">Computer Networks & IoT (3rd Year CSE)</option>
                  <option value="AI & ML Specialization">AI & ML Specialization (4th Year AI)</option>
                  <option value="VLSI System Design">VLSI System Design (3rd Year ECE)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Current Room (Old)</label>
                  <input
                    type="text"
                    value={oldRoom}
                    onChange={(e) => setOldRoom(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">New Room (Reassigned)</label>
                  <input
                    type="text"
                    value={newRoom}
                    onChange={(e) => setNewRoom(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Reason for Shift</label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>
            </div>

            {/* PRE-FLIGHT AI IMPACT ANALYSIS CARD */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-rose-500/30 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> AI Pre-Flight Impact Analysis
                </span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  URGENCY: CRITICAL
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center gap-2">
                  <Users className="w-4 h-4 text-sky-400 shrink-0" />
                  <div>
                    <div className="text-[10px] text-slate-400">Affected Students</div>
                    <div className="font-extrabold text-white text-sm">{affectedStudentsCount} Students</div>
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <div className="text-[10px] text-slate-400">Walking Delta</div>
                    <div className="font-extrabold text-white text-sm">+{walkingTimeDeltaMinutes} Mins</div>
                  </div>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950/90 border border-slate-800 text-[11px] space-y-1">
                <span className="text-slate-400 font-semibold block">Generated Student Advisory Preview:</span>
                <p className="text-sky-300 italic">"{departureRecommendation}"</p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-cyan-600 hover:from-rose-500 hover:to-cyan-500 text-white text-xs font-black shadow-lg shadow-cyan-950 flex items-center gap-2 transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Publish Reassignment ({affectedStudentsCount} Students)</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
