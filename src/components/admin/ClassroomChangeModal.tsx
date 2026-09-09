'use client';

import React, { useState } from 'react';
import { useCampusStore } from '@/lib/store/useCampusStore';
import { RefreshCw, AlertCircle, CheckCircle2, X, Building2, Layers, ArrowRight } from 'lucide-react';

interface ClassroomChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ClassroomChangeModal: React.FC<ClassroomChangeModalProps> = ({ isOpen, onClose }) => {
  const store = useCampusStore();
  const [selectedSubject, setSelectedSubject] = useState('Data Structures');
  const [oldRoom, setOldRoom] = useState('LH-25');
  const [newRoom, setNewRoom] = useState('LH-26');
  const [reason, setReason] = useState('Projector Maintenance in LH-25');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmitReassignment = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Update timetable in store
    store.timetable = store.timetable.map((slot) => {
      if (slot.roomCode.toLowerCase() === oldRoom.toLowerCase() || slot.subject.includes(selectedSubject)) {
        return {
          ...slot,
          roomCode: newRoom
        };
      }
      return slot;
    });

    // 2. Broadcast real-time notification
    store.addNotification({
      roleTarget: 'all',
      title: '🚨 REAL-TIME CLASSROOM REASSIGNED',
      message: `${selectedSubject} relocated: ${oldRoom} ➔ ${newRoom}. Reason: ${reason}.`,
      type: 'class_change'
    });

    // 3. Add announcement
    store.addAnnouncement({
      title: `Classroom Shift: ${selectedSubject}`,
      message: `Attention students: Today's ${selectedSubject} session is shifted from ${oldRoom} to ${newRoom}. Please update your routes.`,
      category: 'academic',
      roleTarget: 'all',
      author: store.currentUser?.name || 'Academic Administrator'
    });

    // 4. Recalculate active navigation if navigating to oldRoom
    if (store.destination && store.selectedRoomCode?.toLowerCase() === oldRoom.toLowerCase()) {
      store.startNavigationToRoom(newRoom);
    }

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#0d1526] border border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Real-Time Classroom Reassignment</h2>
              <p className="text-xs text-slate-400">Relocate class & instantly notify affected students</p>
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
            <div className="inline-flex p-4 rounded-full bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-10 h-10 animate-bounce" />
            </div>
            <h3 className="text-base font-bold text-slate-100">Classroom Reassigned!</h3>
            <p className="text-xs text-slate-400">
              Students notified via WebSockets & timetable updated to {newRoom}.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmitReassignment} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Subject / Session</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="Data Structures">Data Structures & Algorithms</option>
                <option value="Computer Networks">Computer Networks & IoT</option>
                <option value="AI & ML Lab">AI & ML Specialization</option>
                <option value="VLSI System Design">VLSI System Design</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Current Venue</label>
                <input
                  type="text"
                  value={oldRoom}
                  onChange={(e) => setOldRoom(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">New Venue</label>
                <input
                  type="text"
                  value={newRoom}
                  onChange={(e) => setNewRoom(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Reason for Reassignment</label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Submitting will trigger instant student alert & auto route recalculation.</span>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-950 transition-colors"
              >
                Broadcast Reassignment
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
