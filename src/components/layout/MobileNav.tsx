'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCampusStore } from '@/lib/store/useCampusStore';
import { 
  Home, 
  Map, 
  Calendar, 
  Bell, 
  Sparkles,
  Shield,
  UserCheck
} from 'lucide-react';

export const MobileNav: React.FC = () => {
  const store = useCampusStore();
  const pathname = usePathname();
  const unreadCount = store.notifications.filter((n) => !n.isRead).length;
  const currentUser = store.currentUser;

  const links = [
    { href: '/', label: 'Home', icon: Home, badge: null },
    { href: '/map', label: 'Map', icon: Map, badge: null },
    { href: '/timetable', label: 'Timetable', icon: Calendar, badge: null },
    { href: '/notifications', label: 'Notifications', icon: Bell, badge: unreadCount > 0 ? unreadCount : null },
    { href: '/assistant', label: 'AI Assistant', icon: Sparkles, badge: null }
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#080c14]/95 backdrop-blur-2xl border-t border-slate-800/80 px-2 py-2 flex items-center justify-around shadow-2xl safe-bottom">
      {links.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-300 ${
              isActive 
                ? 'text-sky-400 font-extrabold transform scale-105' 
                : 'text-slate-500 hover:text-slate-300 font-medium'
            }`}
          >
            <div className="relative">
              <link.icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'stroke-[2.5px]' : 'stroke-[1.8px]'}`} />
              {link.badge && (
                <span className="absolute -top-1.5 -right-2 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center animate-pulse shadow-md">
                  {link.badge > 9 ? '9+' : link.badge}
                </span>
              )}
            </div>
            <span className="text-[9px] mt-1 tracking-tight leading-none">{link.label}</span>
          </Link>
        );
      })}
    </div>
  );
};

