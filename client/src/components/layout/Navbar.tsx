'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCampusStore } from '@/lib/store/useCampusStore';
import { EmergencyButton } from '@/components/emergency/EmergencyModal';
import { NotificationPanel } from '@/components/notifications/NotificationPanel';
import { 
  Compass, 
  Home, 
  Map, 
  Calendar, 
  Briefcase, 
  Radio, 
  User, 
  Shield, 
  GraduationCap, 
  Layers, 
  LogOut,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const store = useCampusStore();
  const pathname = usePathname();
  const currentUser = store.currentUser;
  const [isOpen, setIsOpen] = React.useState(false);

  // Define navigation items based on role
  const getNavLinks = () => {
    if (!currentUser) {
      // Guest Links
      return [
        { href: '/', label: 'Home', icon: Home },
        { href: '/map', label: 'Campus Map', icon: Map },
        { href: '/facilities', label: 'Facilities', icon: Briefcase },
        { href: '/events', label: 'Events', icon: Calendar },
        { href: '/announcements', label: 'Announcements', icon: Radio },
      ];
    }

    if (currentUser.role === 'student') {
      return [
        { href: '/', label: 'Home', icon: Home },
        { href: '/map', label: 'Map', icon: Map },
        { href: '/timetable', label: 'Timetable', icon: Calendar },
        { href: '/facilities', label: 'Facilities', icon: Briefcase },
        { href: '/events', label: 'Events', icon: Calendar },
        { href: '/dashboard/student', label: 'Student Portal', icon: GraduationCap },
      ];
    }

    if (currentUser.role === 'faculty') {
      return [
        { href: '/', label: 'Home', icon: Home },
        { href: '/map', label: 'Map', icon: Map },
        { href: '/timetable', label: 'Timetable', icon: Calendar },
        { href: '/facilities', label: 'Facilities', icon: Briefcase },
        { href: '/events', label: 'Events', icon: Calendar },
        { href: '/announcements', label: 'Announcements', icon: Radio },
        { href: '/dashboard/faculty', label: 'Faculty Portal', icon: Shield },
      ];
    }

    // Admin Links
    return [
      { href: '/', label: 'Home', icon: Home },
      { href: '/map', label: 'Map', icon: Map },
      { href: '/facilities', label: 'Facilities', icon: Briefcase },
      { href: '/events', label: 'Events', icon: Calendar },
      { href: '/announcements', label: 'Announcements', icon: Radio },
      { href: '/dashboard/admin', label: 'Admin Portal', icon: Layers },
    ];
  };

  const links = getNavLinks();

  const handleLogout = () => {
    store.setCurrentUser(null);
  };

  const getPortalLabel = () => {
    if (!currentUser) return 'Sign In / Register';
    if (currentUser.role === 'admin') return 'Admin Dashboard';
    if (currentUser.role === 'faculty') return 'Faculty Dashboard';
    return 'Student Dashboard';
  };

  const getPortalLink = () => {
    if (!currentUser) return '/auth';
    if (currentUser.role === 'admin') return '/dashboard/admin';
    if (currentUser.role === 'faculty') return '/dashboard/faculty';
    return '/dashboard/student';
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#080c14]/85 backdrop-blur-2xl border-b border-slate-800/80 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-purple-600 p-[1.5px] shadow-lg shadow-sky-500/20">
              <div className="w-full h-full bg-[#0b0f19] rounded-[10px] flex items-center justify-center">
                <Compass className="w-4 h-4 text-sky-400 animate-spin-slow" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-base tracking-tight text-white">
                  Campus<span className="text-sky-400">Pulse</span>
                </span>
                <span className="px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase bg-sky-500/15 text-sky-300 border border-sky-500/30 tracking-wider">
                  Smart Campus
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-900/60 border border-slate-800/60 rounded-2xl p-1 text-xs font-semibold">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <link.icon className="w-3.5 h-3.5" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2">
          <EmergencyButton />
          <NotificationPanel />

          {/* User Profile Button */}
          {currentUser ? (
            <div className="flex items-center gap-2">
              <Link
                href={getPortalLink()}
                className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-xs font-bold text-white transition shadow-lg shadow-sky-600/25 border border-sky-400/20"
              >
                <User className="w-3.5 h-3.5" />
                <span className="truncate max-w-[100px]">{currentUser.name.split(' ')[0]}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700/80 text-slate-400 hover:text-white transition"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/auth"
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700/80 text-xs font-bold text-slate-200 hover:text-white transition shadow-md"
            >
              Sign In
            </Link>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition lg:hidden"
          >
            {isOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div className="lg:hidden border-t border-slate-800/80 bg-[#080c14]/95 backdrop-blur-3xl px-4 py-3 space-y-2 animate-in slide-in-from-top duration-300">
          <div className="grid grid-cols-2 gap-2 pb-3 border-b border-slate-800/60">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold ${
                    isActive
                      ? 'bg-sky-600/20 text-sky-400 border border-sky-500/30'
                      : 'bg-slate-900/50 text-slate-300 border border-transparent hover:bg-slate-800/40'
                  }`}
                >
                  <link.icon className="w-4 h-4 text-sky-400" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="pt-2 flex flex-col gap-2">
            {currentUser && (
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-900/50 border border-slate-800 rounded-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentUser.avatar}
                  alt="Avatar"
                  className="w-7 h-7 rounded-lg object-cover border border-slate-700"
                />
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-white leading-none">{currentUser.name}</span>
                  <span className="text-[10px] text-slate-400 capitalize mt-0.5">{currentUser.role}</span>
                </div>
              </div>
            )}
            
            <Link
              href={getPortalLink()}
              onClick={() => setIsOpen(false)}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-center font-bold text-xs text-white shadow-lg flex items-center justify-center gap-1.5"
            >
              <span>{getPortalLabel()}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
