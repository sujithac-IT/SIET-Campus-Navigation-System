'use client';

import React from 'react';
import { User, FacultyUser } from '@/types';
import { Shield, GraduationCap, UserCheck, MapPin } from 'lucide-react';

interface LiveUserMarkerProps {
  user: User;
  isSelf?: boolean;
  onSelectUser?: (user: User) => void;
}

export const LiveUserMarker: React.FC<LiveUserMarkerProps> = ({ user, isSelf, onSelectUser }) => {
  if (!user.liveLocationSharing || !user.currentCoordinates) return null;

  const { x, y } = user.currentCoordinates;
  const isFaculty = user.role === 'faculty';
  const facultyUser = isFaculty ? (user as FacultyUser) : null;

  const getStatusBadge = () => {
    if (!facultyUser) return null;
    switch (facultyUser.status) {
      case 'Available':
        return <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-300 animate-pulse" />;
      case 'In Class':
        return <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-amber-300" />;
      case 'In Meeting':
        return <span className="w-2.5 h-2.5 rounded-full bg-purple-500 ring-2 ring-purple-300" />;
      case 'Away':
      case 'Do Not Disturb':
        return <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-rose-300" />;
      default:
        return null;
    }
  };

  return (
    <div
      style={{ left: `${x}%`, top: `${y}%` }}
      className="absolute -translate-x-1/2 -translate-y-1/2 z-30 cursor-pointer group transition-all duration-700 ease-out"
      onClick={() => onSelectUser && onSelectUser(user)}
    >
      {/* Pulse Beacon Aura */}
      <div
        className={`absolute -inset-2 rounded-full opacity-60 animate-ping ${
          isSelf
            ? 'bg-sky-400'
            : isFaculty
            ? 'bg-purple-400'
            : 'bg-emerald-400'
        }`}
      />

      {/* Avatar Container */}
      <div
        className={`relative flex items-center gap-1.5 p-1 pr-2.5 rounded-full shadow-lg border backdrop-blur-md transition-transform duration-300 group-hover:scale-110 ${
          isSelf
            ? 'bg-sky-900/90 text-sky-100 border-sky-400 ring-2 ring-sky-500/50'
            : isFaculty
            ? 'bg-purple-900/90 text-purple-100 border-purple-400'
            : 'bg-slate-900/90 text-slate-100 border-slate-700'
        }`}
      >
        <div className="relative w-8 h-8 rounded-full overflow-hidden border border-white/30 flex-shrink-0 bg-slate-800 flex items-center justify-center">
          {user.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            <span className="font-bold text-xs">
              {user.name.substring(0, 2).toUpperCase()}
            </span>
          )}
          {getStatusBadge()}
        </div>

        <div className="flex flex-col text-left max-w-[90px] overflow-hidden">
          <span className="text-[11px] font-semibold truncate leading-tight flex items-center gap-1">
            {isFaculty && <Shield className="w-2.5 h-2.5 text-purple-300 inline" />}
            {user.role === 'student' && <GraduationCap className="w-2.5 h-2.5 text-emerald-300 inline" />}
            {isSelf ? 'You' : user.name.split(' ')[0]}
          </span>
          <span className="text-[9px] opacity-75 truncate leading-none">
            {isFaculty ? facultyUser?.status : user.role === 'student' ? 'Student' : 'Campus'}
          </span>
        </div>
      </div>
    </div>
  );
};
