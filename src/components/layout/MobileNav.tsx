'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCampusStore } from '@/lib/store/useCampusStore';
import { 
  Home, 
  Map, 
  Calendar, 
  Briefcase, 
  Radio, 
  User, 
  Shield, 
  GraduationCap 
} from 'lucide-react';

export const MobileNav: React.FC = () => {
  const store = useCampusStore();
  const pathname = usePathname();
  const currentUser = store.currentUser;

  // Get active navigation buttons based on user role
  const getMobileLinks = () => {
    if (!currentUser) {
      return [
        { href: '/', label: 'Home', icon: Home },
        { href: '/map', label: 'Map', icon: Map },
        { href: '/facilities', label: 'Facilities', icon: Briefcase },
        { href: '/announcements', label: 'News', icon: Radio },
        { href: '/auth', label: 'Login', icon: User }
      ];
    }

    if (currentUser.role === 'student') {
      return [
        { href: '/', label: 'Home', icon: Home },
        { href: '/map', label: 'Map', icon: Map },
        { href: '/timetable', label: 'Schedule', icon: Calendar },
        { href: '/facilities', label: 'Facilities', icon: Briefcase },
        { href: '/dashboard/student', label: 'Portal', icon: GraduationCap }
      ];
    }

    if (currentUser.role === 'faculty') {
      return [
        { href: '/', label: 'Home', icon: Home },
        { href: '/map', label: 'Map', icon: Map },
        { href: '/timetable', label: 'Teaching', icon: Calendar },
        { href: '/announcements', label: 'News', icon: Radio },
        { href: '/dashboard/faculty', label: 'Portal', icon: Shield }
      ];
    }

    // Admin
    return [
      { href: '/', label: 'Home', icon: Home },
      { href: '/map', label: 'Map', icon: Map },
      { href: '/facilities', label: 'Facilities', icon: Briefcase },
      { href: '/announcements', label: 'News', icon: Radio },
      { href: '/dashboard/admin', label: 'Portal', icon: User }
    ];
  };

  const links = getMobileLinks();

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#080c14]/95 backdrop-blur-2xl border-t border-slate-800/80 px-2 py-2 flex items-center justify-around shadow-2xl safe-bottom">
      {links.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-300 ${
              isActive 
                ? 'text-sky-400 font-extrabold transform scale-105' 
                : 'text-slate-500 hover:text-slate-300 font-medium'
            }`}
          >
            <link.icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'stroke-[2.5px]' : 'stroke-[1.8px]'}`} />
            <span className="text-[9px] mt-1 tracking-tight leading-none">{link.label}</span>
          </Link>
        );
      })}
    </div>
  );
};
