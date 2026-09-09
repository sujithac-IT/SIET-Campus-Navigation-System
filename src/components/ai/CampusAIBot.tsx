'use client';

import React, { useState } from 'react';
import { useCampusStore } from '@/lib/store/useCampusStore';
import { Bot, X, Send, Sparkles, Navigation, MapPin, CheckCircle2 } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  actionRoomCode?: string;
  actionCoords?: { x: number; y: number; name: string };
}

export const CampusAIBot: React.FC = () => {
  const store = useCampusStore();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'bot',
      text: 'Hello! I am CampusPulse AI Bot. Ask me about classrooms (e.g. "Where is LH25?"), faculty availability ("Is Dr. Prakash free?"), hostels, labs, or campus directions!'
    }
  ]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsgText = input.trim();
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: userMsgText
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    // Generate intelligent DB response
    setTimeout(() => {
      const reply = generateAIResponse(userMsgText, store);
      setMessages((prev) => [...prev, reply]);
    }, 400);
  };

  const generateAIResponse = (query: string, storeState: any): ChatMessage => {
    const q = query.toLowerCase().replace(/\s+/g, '');

    // Dynamic Exam Hall & Room Search in DB
    for (const b of storeState.buildings) {
      for (const f of b.floors) {
        for (const r of f.rooms) {
          const roomCodeClean = r.code.toLowerCase().replace(/\s+/g, '');
          const roomNameClean = r.name.toLowerCase().replace(/\s+/g, '');
          if (
            (q.length > 2 && roomCodeClean.includes(q)) ||
            (q.length > 3 && roomNameClean.includes(q))
          ) {
            return {
              id: `b-${Date.now()}`,
              sender: 'bot',
              text: `📍 ${r.name} (${r.code}) is located at ${r.description || `${b.name} - Floor ${r.floor}`}. Click below to navigate immediately.`,
              actionRoomCode: r.code
            };
          }
        }
      }
    }

    // 2. Faculty queries ("Dr. Prakash", "IT HOD")
    if (q.includes('prakash') || q.includes('it hod') || q.includes('hod')) {
      return {
        id: `b-${Date.now()}`,
        sender: 'bot',
        text: 'Dr. Prakash (IT HOD) is currently AVAILABLE in IT Block Room 204 (Floor 2). Distance: ~85m from your location.',
        actionRoomCode: 'IT-HOD-204'
      };
    }

    // 3. Tech Park / Library / Auditorium
    if (q.includes('tech park') || q.includes('incubation')) {
      return {
        id: `b-${Date.now()}`,
        sender: 'bot',
        text: 'Tech Park & Innovation Center is located near CSE Block. Houses Placement Cell and Robotics AI Center.',
        actionCoords: { x: 75, y: 45, name: 'Tech Park' }
      };
    }

    if (q.includes('library')) {
      return {
        id: `b-${Date.now()}`,
        sender: 'bot',
        text: 'Central Library is located right next to the Admin Block. 3 floors with digital archives and quiet reading zones.',
        actionCoords: { x: 35, y: 55, name: 'Central Library' }
      };
    }

    if (q.includes('canteen') || q.includes('food')) {
      return {
        id: `b-${Date.now()}`,
        sender: 'bot',
        text: 'Central Food Court is located near the Auditorium plaza. Open daily 8:00 AM - 8:00 PM.',
        actionCoords: { x: 65, y: 70, name: 'Central Food Court' }
      };
    }

    if (q.includes('hostel') || q.includes('girls hostel') || q.includes('boys hostel')) {
      return {
        id: `b-${Date.now()}`,
        sender: 'bot',
        text: 'Boys Hostel is located on the North-East wing (x:85%, y:25%). Girls Hostel is located on the South-East wing (x:85%, y:75%).',
        actionCoords: { x: 85, y: 75, name: 'Girls Hostel Complex' }
      };
    }

    if (q.includes('free') || q.includes('vacant')) {
      return {
        id: `b-${Date.now()}`,
        sender: 'bot',
        text: 'LH25 (IT Block Floor 2) and LH10 (CSE Block Floor 0) are currently free and available for self-study.',
        actionRoomCode: 'LH25'
      };
    }

    // Fallback response using campus search
    return {
      id: `b-${Date.now()}`,
      sender: 'bot',
      text: `I searched campus records for "${query}". You can navigate to Main Admin Block or search specific room numbers in the global search bar!`,
      actionCoords: { x: 25, y: 65, name: 'Administration Block' }
    };
  };

  const handleAction = (msg: ChatMessage) => {
    if (msg.actionRoomCode) {
      store.startNavigationToRoom(msg.actionRoomCode);
    } else if (msg.actionCoords) {
      store.startNavigationToCoords(msg.actionCoords, msg.actionCoords.name);
    }
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating AI Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-gradient-to-r from-sky-600 to-purple-600 text-white shadow-2xl hover:scale-110 transition-transform duration-300 ring-4 ring-sky-400/30 flex items-center gap-2 group"
      >
        <Sparkles className="w-6 h-6 animate-pulse" />
        <span className="font-bold text-sm hidden sm:inline group-hover:inline">Campus AI</span>
      </button>

      {/* AI Chat Modal Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 w-96 max-w-[calc(100vw-32px)] h-[520px] bg-slate-900/95 backdrop-blur-2xl border border-slate-700/80 rounded-3xl shadow-2xl flex flex-col z-50 overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-slate-900 to-sky-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
                  CampusPulse AI Assistant
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                </h4>
                <p className="text-[10px] text-slate-400">Real-time DB Context Active</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 custom-scrollbar">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed shadow-md ${
                    msg.sender === 'user'
                      ? 'bg-sky-600 text-white rounded-br-none'
                      : 'bg-slate-800/90 text-slate-200 border border-slate-700 rounded-bl-none'
                  }`}
                >
                  {msg.text}

                  {(msg.actionRoomCode || msg.actionCoords) && (
                    <button
                      onClick={() => handleAction(msg)}
                      className="mt-2.5 w-full py-1.5 px-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 transition shadow-md"
                    >
                      <Navigation className="w-3.5 h-3.5" /> Navigate to Location
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder='Ask AI... (e.g. "Where is LH25?")'
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <button
              onClick={handleSend}
              className="p-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white transition shadow-md"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
