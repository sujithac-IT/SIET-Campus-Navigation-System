'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCampusStore } from '@/lib/store/useCampusStore';
import { UserRole, PrivacyLevel, AvailabilityStatus } from '@/types';
import { Compass, ArrowLeft, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

function AuthContent() {
  const router = useRouter();
  const store = useCampusStore();
  const searchParams = useSearchParams();

  const initialRole = (searchParams.get('role') as UserRole) || 'student';
  const [role, setRole] = useState<UserRole>(initialRole);
  const [isSignUp, setIsSignUp] = useState(false);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  // Student specific
  const [regNo, setRegNo] = useState('7376211IT105');
  const [dept, setDept] = useState('Information Technology');
  const [year, setYear] = useState(3);
  const [section, setSection] = useState('A');
  // Faculty specific
  const [empId, setEmpId] = useState('EMP-402');
  const [designation, setDesignation] = useState('Assistant Professor');
  const [roomNo, setRoomNo] = useState('204');
  const [status, setStatus] = useState<AvailabilityStatus>('Available');
  const [privacy, setPrivacy] = useState<PrivacyLevel>('campus');
  const [shareLocation, setShareLocation] = useState(true);

  const [message, setMessage] = useState('');

  const handleQuickLogin = (targetRole: UserRole) => {
    const demoUser = store.users.find((u) => u.role === targetRole) || store.users[0];
    store.setCurrentUser(demoUser);
    router.push(
      targetRole === 'admin'
        ? '/dashboard/admin'
        : targetRole === 'faculty'
        ? '/dashboard/faculty'
        : '/dashboard/student'
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isSignUp) {
      const newUser: any = {
        id: `u-${Date.now()}`,
        name: name || (role === 'student' ? 'New Student' : role === 'faculty' ? 'Dr. Staff' : 'Campus User'),
        email: email || `${name.toLowerCase().replace(/\s+/g, '.')}@siet.edu.in`,
        role,
        avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
        liveLocationSharing: shareLocation,
        privacySetting: privacy,
        currentCoordinates: { x: 15, y: 88 }
      };

      if (role === 'student') {
        newUser.registerNumber = regNo;
        newUser.department = dept;
        newUser.year = Number(year);
        newUser.section = section;
      } else if (role === 'faculty') {
        newUser.employeeId = empId;
        newUser.department = dept;
        newUser.designation = designation;
        newUser.roomNumber = roomNo;
        newUser.buildingId = 'b-it';
        newUser.subjects = ['Computer Networks'];
        newUser.status = status;
      }

      store.users.push(newUser);
      store.setCurrentUser(newUser);
      setMessage('Account created & verified successfully!');
    } else {
      const found = store.users.find((u) => u.role === role) || store.users[0];
      store.setCurrentUser(found);
      setMessage('Logged in successfully!');
    }

    setTimeout(() => {
      router.push(
        role === 'admin'
          ? '/dashboard/admin'
          : role === 'faculty'
          ? '/dashboard/faculty'
          : '/dashboard/student'
      );
    }, 600);
  };

  return (
    <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-2xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-purple-600 flex items-center justify-center mx-auto shadow-lg shadow-sky-500/20">
          <Compass className="w-7 h-7 text-white" />
        </div>
        <h2 className="text-2xl font-black text-white">
          {isSignUp ? 'Create CampusPulse Account' : 'Sign In to CampusPulse'}
        </h2>
        <p className="text-xs text-slate-400">SIET Digital Twin Smart Navigation Portal</p>
      </div>

      {/* Role Selector Tabs */}
      <div className="grid grid-cols-4 gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold">
        <button
          onClick={() => setRole('student')}
          className={`py-2 rounded-lg transition ${
            role === 'student' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Student
        </button>
        <button
          onClick={() => setRole('faculty')}
          className={`py-2 rounded-lg transition ${
            role === 'faculty' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Faculty
        </button>
        <button
          onClick={() => setRole('visitor')}
          className={`py-2 rounded-lg transition ${
            role === 'visitor' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Visitor
        </button>
        <button
          onClick={() => setRole('admin')}
          className={`py-2 rounded-lg transition ${
            role === 'admin' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Admin
        </button>
      </div>

      {message && (
        <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold text-center flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" /> {message}
        </div>
      )}

      {/* Auth Form */}
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {isSignUp && (
          <div>
            <label className="block text-slate-400 font-semibold mb-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>
        )}

        <div>
          <label className="block text-slate-400 font-semibold mb-1">College Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={role === 'student' ? 'rahul.21it105@siet.edu.in' : 'faculty@siet.edu.in'}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-slate-400 font-semibold mb-1">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
          />
        </div>

        {/* Student Profile Fields */}
        {isSignUp && role === 'student' && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Register Number</label>
              <input
                type="text"
                value={regNo}
                onChange={(e) => setRegNo(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Department</label>
              <select
                value={dept}
                onChange={(e) => setDept(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
              >
                <option value="Information Technology">IT</option>
                <option value="Computer Science">CSE</option>
                <option value="ECE">ECE</option>
              </select>
            </div>
          </div>
        )}

        {/* Faculty Profile Fields */}
        {isSignUp && role === 'faculty' && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Employee ID</label>
              <input
                type="text"
                value={empId}
                onChange={(e) => setEmpId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Room Number</label>
              <input
                type="text"
                value={roomNo}
                onChange={(e) => setRoomNo(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs shadow-lg shadow-sky-600/30 transition"
        >
          {isSignUp ? 'Complete Registration & Sign In' : 'Sign In'}
        </button>
      </form>

      {/* Quick Demo Login Option */}
      <div className="pt-4 border-t border-slate-800 text-center space-y-2">
        <p className="text-[11px] text-slate-400">Want instant access without typing?</p>
        <button
          onClick={() => handleQuickLogin(role)}
          className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 font-bold text-xs transition border border-slate-700 flex items-center justify-center gap-2"
        >
          <Compass className="w-4 h-4" /> Quick Demo Login as {role.toUpperCase()}
        </button>

        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-[11px] text-slate-400 hover:text-white transition mt-2 block mx-auto underline"
        >
          {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Register"}
        </button>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative">
      <Link
        href="/"
        className="absolute top-6 left-6 text-slate-400 hover:text-white flex items-center gap-2 text-xs font-semibold"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Landing Page
      </Link>

      <Suspense fallback={<div className="text-white text-xs">Loading Auth Engine...</div>}>
        <AuthContent />
      </Suspense>
    </div>
  );
}
