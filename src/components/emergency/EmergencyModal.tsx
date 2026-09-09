'use client';

import React, { useState } from 'react';
import { useCampusStore } from '@/lib/store/useCampusStore';
import { ShieldAlert, AlertTriangle, Cross, Phone, Navigation, X } from 'lucide-react';

export const EmergencyButton: React.FC = () => {
  const store = useCampusStore();
  const [showConfirm, setShowConfirm] = useState(false);
  const [isActivated, setIsActivated] = useState(false);

  const handleTriggerSOS = () => {
    store.triggerEmergencySOS('Medical or Security Assistance Request');
    setIsActivated(true);
    setShowConfirm(false);
  };

  return (
    <>
      {/* Red SOS Floating / Dashboard Trigger Button */}
      <button
        onClick={() => setShowConfirm(true)}
        className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-extrabold text-xs shadow-lg shadow-rose-600/30 flex items-center gap-2 animate-pulse hover:scale-105 transition"
      >
        <ShieldAlert className="w-4 h-4" />
        <span>SOS Emergency</span>
      </button>

      {/* SOS Confirmation Popup */}
      {showConfirm && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-rose-500/50 rounded-3xl p-6 max-w-md w-full text-center shadow-2xl text-white relative">
            <div className="w-14 h-14 rounded-full bg-rose-500/20 text-rose-500 flex items-center justify-center mx-auto mb-4 border border-rose-500/40">
              <AlertTriangle className="w-8 h-8 animate-bounce" />
            </div>

            <h3 className="text-xl font-bold text-slate-100">Activate Emergency SOS?</h3>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              This will broadcast your live coordinates to SIET Security & Medical Centre and automatically calculate the fastest navigation route to the Medical Emergency Ward.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-xs text-slate-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleTriggerSOS}
                className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 font-extrabold text-xs text-white shadow-lg shadow-rose-600/40 transition"
              >
                CONFIRM SOS BROADCAST
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Emergency Broadcast Control Window */}
      {isActivated && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 w-96 max-w-[calc(100vw-32px)] bg-slate-900 border-2 border-rose-500 rounded-3xl p-4 shadow-2xl z-50 text-white animate-in slide-in-from-top-5 duration-300">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-500 text-white animate-ping">
                <Cross className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-rose-400">EMERGENCY SOS ACTIVE</h4>
                <p className="text-[11px] text-slate-300">Security Dispatched • Route Active</p>
              </div>
            </div>
            <button
              onClick={() => setIsActivated(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3 p-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-xs space-y-1">
            <p className="text-slate-200 font-semibold flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              Security Hotline: +91 98765 43210
            </p>
            <p className="text-slate-400 text-[10px]">
              Route calculated to Campus Medical Centre Emergency Ward.
            </p>
          </div>

          <button
            onClick={() => {
              const med = store.buildings.find((b) => b.category === 'medical');
              if (med) store.startNavigationToCoords(med.coordinates, 'Medical Centre');
              setIsActivated(false);
            }}
            className="mt-3 w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 font-bold text-xs text-white transition flex items-center justify-center gap-2"
          >
            <Navigation className="w-4 h-4" /> Show Emergency Route on Map
          </button>
        </div>
      )}
    </>
  );
};
