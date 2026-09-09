'use client';

import React from 'react';
import { useCampusStore } from '@/lib/store/useCampusStore';
import { PrivacyLevel } from '@/types';
import { Shield, ShieldAlert, Radio, Eye, Lock } from 'lucide-react';

export const PrivacyToggle: React.FC = () => {
  const store = useCampusStore();
  const isSharing = store.isSharingLocation;
  const currentPrivacy = store.currentUser?.privacySetting || 'campus';

  const handleToggle = () => {
    store.toggleLocationSharing();
  };

  const handlePrivacyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    store.setPrivacySetting(e.target.value as PrivacyLevel);
  };

  return (
    <div className="w-full bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl p-4 shadow-xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`p-2.5 rounded-xl ${
              isSharing
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
            }`}
          >
            {isSharing ? <Radio className="w-5 h-5 animate-pulse" /> : <Lock className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-100">
                {isSharing ? 'Live Location Sharing is ON' : 'Location Sharing is PAUSED'}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                  isSharing ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                }`}
              >
                {isSharing ? 'Active' : 'Off'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {isSharing
                ? `Visible to ${currentPrivacy} users on the digital twin map.`
                : 'Your live position is hidden from other campus users.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Privacy Level Dropdown */}
          <div className="relative">
            <select
              value={currentPrivacy}
              onChange={handlePrivacyChange}
              disabled={!isSharing}
              className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50 font-medium"
            >
              <option value="nobody">Nobody (Private)</option>
              <option value="friends">Friends Only</option>
              <option value="faculty">Faculty & Staff</option>
              <option value="campus">Campus Users</option>
              <option value="emergency">Emergency SOS Only</option>
            </select>
          </div>

          {/* Toggle Button */}
          <button
            onClick={handleToggle}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition shadow-md flex items-center gap-1.5 ${
              isSharing
                ? 'bg-rose-600 hover:bg-rose-500 text-white'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {isSharing ? 'Pause Sharing' : 'Turn ON Sharing'}
          </button>
        </div>
      </div>
    </div>
  );
};
