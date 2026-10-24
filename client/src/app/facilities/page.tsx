'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCampusStore } from '@/lib/store/useCampusStore';
import { Room, Building } from '@/types';
import { 
  Footprints, 
  Utensils, 
  DollarSign, 
  Droplet, 
  Car, 
  ArrowUpDown, 
  Shield, 
  Activity, 
  BookOpen, 
  Building2,
  Navigation,
  Map,
  CornerDownRight,
  DoorOpen,
  Briefcase,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  X,
  Sparkles,
  Users,
  Search
} from 'lucide-react';

interface HallBooking {
  id: string;
  roomCode: string;
  roomName: string;
  date: string;
  startTime: string; // e.g. "09:00"
  endTime: string;   // e.g. "11:00"
  eventTitle: string;
  department: string;
  organizer: string;
  status: 'confirmed' | 'pending';
}

const INITIAL_BOOKINGS: HallBooking[] = [
  {
    id: 'bk-1',
    roomCode: 'AUD-MAIN',
    roomName: 'Main Auditorium',
    date: '2026-10-24',
    startTime: '10:00',
    endTime: '12:30',
    eventTitle: 'National Conference on AI in Robotics (Keynote)',
    department: 'Department of Computer Science & Engineering',
    organizer: 'Dr. R. Meenakshi',
    status: 'confirmed',
  },
  {
    id: 'bk-2',
    roomCode: 'LH-01',
    roomName: 'Lecture Hall 01',
    date: '2026-10-24',
    startTime: '14:00',
    endTime: '16:00',
    eventTitle: 'Guest Lecture: Scalable Microservice Architecture',
    department: 'Department of Information Technology',
    organizer: 'Prof. S. Rajesh',
    status: 'confirmed',
  },
  {
    id: 'bk-3',
    roomCode: 'LAB-DS',
    roomName: 'Data Structures Laboratory',
    date: '2026-10-24',
    startTime: '09:00',
    endTime: '11:00',
    eventTitle: 'CS304 Data Structures Hands-on Lab Exam',
    department: 'Department of Computer Science & Engineering',
    organizer: 'Dr. Prakash',
    status: 'confirmed',
  },
  {
    id: 'bk-4',
    roomCode: 'SEM-01',
    roomName: 'Seminar Hall 1',
    date: '2026-10-24',
    startTime: '11:30',
    endTime: '13:00',
    eventTitle: 'IEEE Student Branch Paper Presentation',
    department: 'Electrical & Electronics Engineering',
    organizer: 'Dr. K. Swaminathan',
    status: 'confirmed',
  },
];

const CATEGORIES = [
  { id: 'all', label: 'All Venues & Amenities', icon: Building2, color: 'text-sky-400 bg-sky-500/10 border-sky-500/20' },
  { id: 'seminar', label: '🎤 Seminar Halls', icon: Sparkles, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
  { id: 'auditorium', label: '🎭 Auditoriums', icon: Building2, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
  { id: 'lab', label: '🔬 Research & Computer Labs', icon: Activity, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
  { id: 'classroom', label: '🏫 Lecture Theatres', icon: BookOpen, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  { id: 'restroom', label: '🚻 Restrooms', icon: Footprints, color: 'text-pink-400 bg-pink-500/10 border-pink-500/20' },
  { id: 'canteen', label: '🍴 Canteen & Food Court', icon: Utensils, color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
  { id: 'atm', label: '🏧 ATMs', icon: DollarSign, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  { id: 'water', label: '💧 RO Drinking Water', icon: Droplet, color: 'text-sky-400 bg-sky-500/10 border-sky-500/20' },
  { id: 'parking', label: '🚗 Vehicle Parking', icon: Car, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  { id: 'lift', label: '🛗 Lifts & Elevators', icon: ArrowUpDown, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
  { id: 'security', label: '🛡️ Security Gate Check', icon: Shield, color: 'text-teal-400 bg-teal-500/10 border-teal-500/20' },
  { id: 'medical', label: '🏥 Health Center', icon: Activity, color: 'text-red-400 bg-red-500/10 border-red-500/20' },
  { id: 'library', label: '📚 Central Library', icon: BookOpen, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
];

function FacilitiesContent() {
  const store = useCampusStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryCategory = searchParams.get('category') || 'all';

  const [activeCategory, setActiveCategory] = useState<string>(queryCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [bookings, setBookings] = useState<HallBooking[]>(INITIAL_BOOKINGS);

  // Booking Modal State
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedRoomForBooking, setSelectedRoomForBooking] = useState<{ room: Room; building: Building } | null>(null);
  const [bookingDate, setBookingDate] = useState('2026-10-24');
  const [bookingStartTime, setBookingStartTime] = useState('14:00');
  const [bookingEndTime, setBookingEndTime] = useState('16:00');
  const [bookingEventTitle, setBookingEventTitle] = useState('');
  const [bookingDepartment, setBookingDepartment] = useState('Information Technology');
  const [bookingOrganizer, setBookingOrganizer] = useState('Faculty In-charge');
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    if (searchParams.get('category')) {
      setActiveCategory(searchParams.get('category') || 'all');
    }
  }, [searchParams]);

  // Conflict detection function
  const checkConflict = (roomCode: string, date: string, start: string, end: string): HallBooking | null => {
    const toMinutes = (timeStr: string) => {
      const [h, m] = timeStr.split(':').map(Number);
      return (h || 0) * 60 + (m || 0);
    };
    const reqStart = toMinutes(start);
    const reqEnd = toMinutes(end);

    return bookings.find((b) => {
      if (b.roomCode !== roomCode || b.date !== date) return false;
      const bStart = toMinutes(b.startTime);
      const bEnd = toMinutes(b.endTime);
      // Overlap condition: start < bEnd && end > bStart
      return reqStart < bEnd && reqEnd > bStart;
    }) || null;
  };

  // Recheck conflict dynamically when modal values change
  useEffect(() => {
    if (bookingModalOpen && selectedRoomForBooking) {
      const conflict = checkConflict(
        selectedRoomForBooking.room.code,
        bookingDate,
        bookingStartTime,
        bookingEndTime
      );
      if (conflict) {
        setConflictWarning(
          `Conflict detected with "${conflict.eventTitle}" (${conflict.startTime} - ${conflict.endTime}) booked by ${conflict.department}. Double-booking is disallowed.`
        );
      } else {
        setConflictWarning(null);
      }
    }
  }, [bookingModalOpen, selectedRoomForBooking, bookingDate, bookingStartTime, bookingEndTime, bookings]);

  const handleOpenBooking = (room: Room, building: Building) => {
    setSelectedRoomForBooking({ room, building });
    setBookingEventTitle('');
    setBookingSuccess(false);
    setBookingModalOpen(true);
  };

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoomForBooking || !bookingEventTitle) return;

    const conflict = checkConflict(
      selectedRoomForBooking.room.code,
      bookingDate,
      bookingStartTime,
      bookingEndTime
    );

    if (conflict) {
      setConflictWarning(
        `Cannot confirm reservation: Overlaps with existing booking "${conflict.eventTitle}".`
      );
      return;
    }

    const newBooking: HallBooking = {
      id: `bk-${Date.now()}`,
      roomCode: selectedRoomForBooking.room.code,
      roomName: selectedRoomForBooking.room.name,
      date: bookingDate,
      startTime: bookingStartTime,
      endTime: bookingEndTime,
      eventTitle: bookingEventTitle,
      department: bookingDepartment,
      organizer: bookingOrganizer,
      status: 'confirmed',
    };

    setBookings((prev) => [newBooking, ...prev]);
    store.addNotification({
      title: `Venue Reserved: ${selectedRoomForBooking.room.name}`,
      message: `${bookingEventTitle} successfully booked for ${bookingDate} (${bookingStartTime} - ${bookingEndTime}).`,
      type: 'info',
      roleTarget: 'all',
    });

    setBookingSuccess(true);
    setTimeout(() => {
      setBookingSuccess(false);
      setBookingModalOpen(false);
    }, 1500);
  };

  // Extract rooms matching category
  const getFacilities = () => {
    const list: { room: Room; building: Building }[] = [];
    store.buildings.forEach((b) => {
      b.floors.forEach((f) => {
        f.rooms.forEach((r) => {
          if (activeCategory === 'all') {
            list.push({ room: r, building: b });
          } else if (r.type === activeCategory) {
            list.push({ room: r, building: b });
          }
        });
      });
    });

    if (!searchQuery.trim()) return list;

    const q = searchQuery.toLowerCase();
    return list.filter(
      (item) =>
        item.room.name.toLowerCase().includes(q) ||
        item.room.code.toLowerCase().includes(q) ||
        item.building.name.toLowerCase().includes(q) ||
        (item.room.description && item.room.description.toLowerCase().includes(q))
    );
  };

  const facilitiesList = getFacilities();

  const handleViewOnMap = (room: Room, building: Building) => {
    store.selectBuilding(building.id);
    store.setFloor(room.floor);
    store.selectedRoomCode = room.code;
    store.destination = null;
    store.activeRoute = null;
    router.push('/map');
  };

  const handleNavigate = (room: Room) => {
    store.startNavigationToRoom(room.code);
    router.push('/map');
  };

  // Determine current room schedule status
  const getRoomLiveStatus = (roomCode: string) => {
    const todayBooking = bookings.find((b) => b.roomCode === roomCode && b.date === '2026-10-24');
    if (todayBooking) {
      return {
        isOccupied: true,
        badge: 'In Session / Reserved',
        badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
        detail: `${todayBooking.eventTitle} (${todayBooking.startTime} - ${todayBooking.endTime})`,
      };
    }
    return {
      isOccupied: false,
      badge: 'Available Now',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      detail: 'No conflict detected for today',
    };
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-100">
      {/* Title & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
            <Briefcase className="w-6 h-6 text-cyan-400" />
            <span>Campus Venues, Halls & Amenities Locator</span>
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl">
            Live availability status, conflict-free faculty venue reservation, and direct geodesic turn-by-turn walking routes across all Sri Shakthi Institute academic blocks.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search venue, lab, room or ATM..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex overflow-x-auto gap-2 pb-2 custom-scrollbar text-xs font-bold scroll-smooth">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id;
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id);
                router.replace(`/facilities?category=${cat.id}`);
              }}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-xl border transition-all ${
                isActive
                  ? 'bg-cyan-600 text-white border-cyan-500 shadow-lg shadow-cyan-500/20'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {facilitiesList.length > 0 ? (
          facilitiesList.map(({ room, building }) => {
            const matchedCategory = CATEGORIES.find((c) => c.id === room.type) || CATEGORIES[0];
            const Icon = matchedCategory?.icon || Building2;
            const liveStatus = getRoomLiveStatus(room.code);
            const isBookable = ['seminar', 'auditorium', 'lab', 'classroom'].includes(room.type);

            return (
              <div
                key={room.id}
                className="bg-slate-900/40 border border-slate-800 hover:border-slate-700/80 rounded-2.5xl p-5 shadow-xl transition-all duration-300 flex flex-col justify-between hover:translate-y-[-2px] group"
              >
                <div className="space-y-3">
                  {/* Category badge + Code */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg border text-[10px] font-extrabold tracking-wide uppercase ${matchedCategory?.color}`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {room.type.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono font-bold">
                      {room.code}
                    </span>
                  </div>

                  {/* Title & Location details */}
                  <div className="space-y-1">
                    <h3 className="font-extrabold text-sm text-slate-100 group-hover:text-cyan-400 transition-colors">
                      {room.name}
                    </h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1 font-semibold">
                      <Building2 className="w-3.5 h-3.5 text-slate-500" />
                      <span>{building.name} • Floor {room.floor}</span>
                    </p>
                    {room.description && (
                      <p className="text-[11px] text-slate-300 leading-relaxed pt-1 flex items-start gap-1">
                        <CornerDownRight className="w-3 h-3 text-cyan-400 flex-shrink-0 mt-0.5" />
                        <span>{room.description}</span>
                      </p>
                    )}
                  </div>

                  {/* Live Availability Status */}
                  <div className="pt-1">
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md border text-[10px] font-bold ${liveStatus.badgeColor}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${liveStatus.isOccupied ? 'bg-rose-400 animate-ping' : 'bg-emerald-400'}`} />
                        {liveStatus.badge}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 truncate">
                      {liveStatus.detail}
                    </p>
                  </div>

                  {/* Amenities / Accessibility tags */}
                  {(room.accessibilityInfo || room.openingHours) && (
                    <div className="pt-1 flex flex-wrap gap-1.5 text-[9px] font-bold">
                      {room.accessibilityInfo && (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          ♿ {room.accessibilityInfo}
                        </span>
                      )}
                      {room.openingHours && (
                        <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          🕒 Open: {room.openingHours}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="pt-4 mt-4 border-t border-slate-800/60 flex items-center gap-2">
                  <button
                    onClick={() => handleViewOnMap(room, building)}
                    className="flex-1 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 text-slate-300 hover:text-white font-bold text-xs transition flex items-center justify-center gap-1"
                  >
                    <Map className="w-3.5 h-3.5 text-cyan-400" />
                    <span>View Map</span>
                  </button>

                  {isBookable && (
                    <button
                      onClick={() => handleOpenBooking(room, building)}
                      className="py-2 px-3 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 font-bold text-xs transition flex items-center justify-center gap-1"
                    >
                      <Calendar className="w-3.5 h-3.5 text-purple-400" />
                      <span>Book</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleNavigate(room)}
                    className="flex-1 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black text-xs transition shadow-md flex items-center justify-center gap-1"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Navigate</span>
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-16 text-center bg-slate-900/20 border border-slate-800 rounded-3xl border-dashed">
            <DoorOpen className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-400">No facilities matching your search filter were found.</p>
          </div>
        )}
      </div>

      {/* Booking Modal with Conflict Detection */}
      {bookingModalOpen && selectedRoomForBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-[#0b1329] border border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/60">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-100">Reserve Hall / Laboratory</h2>
                  <p className="text-xs text-slate-400">
                    {selectedRoomForBooking.room.name} ({selectedRoomForBooking.room.code}) • {selectedRoomForBooking.building.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setBookingModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {bookingSuccess ? (
              <div className="p-8 text-center space-y-3">
                <div className="inline-flex p-4 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="w-10 h-10 animate-bounce" />
                </div>
                <h3 className="text-base font-bold text-slate-100">Venue Reservation Confirmed!</h3>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  {selectedRoomForBooking.room.name} has been booked for {bookingDate} ({bookingStartTime} - {bookingEndTime}). System conflict prevention verified.
                </p>
              </div>
            ) : (
              <form onSubmit={handleConfirmBooking} className="p-6 space-y-4">
                {/* Event Title */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Event Title / Purpose</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AI Hackathon Mentorship Workshop"
                    value={bookingEventTitle}
                    onChange={(e) => setBookingEventTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                {/* Date & Department */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Date</label>
                    <input
                      type="date"
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Department</label>
                    <select
                      value={bookingDepartment}
                      onChange={(e) => setBookingDepartment(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                    >
                      <option value="Computer Science & Engineering">CSE</option>
                      <option value="Information Technology">IT</option>
                      <option value="Artificial Intelligence & Data Science">AI & DS</option>
                      <option value="Electronics & Communication">ECE</option>
                      <option value="Mechanical Engineering">Mech</option>
                      <option value="Biotechnology">Biotech</option>
                    </select>
                  </div>
                </div>

                {/* Time Slot Range */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Start Time</label>
                    <input
                      type="time"
                      value={bookingStartTime}
                      onChange={(e) => setBookingStartTime(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">End Time</label>
                    <input
                      type="time"
                      value={bookingEndTime}
                      onChange={(e) => setBookingEndTime(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                {/* Real-time Conflict Alert Banner */}
                {conflictWarning ? (
                  <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-300">
                    <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-extrabold block text-rose-200">Double-Booking Conflict</span>
                      <span>{conflictWarning}</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2 text-xs text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Slot is free. No scheduling conflicts detected for this venue.</span>
                  </div>
                )}

                {/* Submit button */}
                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setBookingModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-bold text-xs transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!!conflictWarning || !bookingEventTitle.trim()}
                    className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-black text-xs transition shadow-lg shadow-cyan-500/20"
                  >
                    Confirm Reservation
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function FacilitiesPage() {
  return (
    <Suspense fallback={<div className="text-white text-xs p-8">Loading Facilities locator...</div>}>
      <FacilitiesContent />
    </Suspense>
  );
}
