'use client';

import React, { useState } from 'react';
import { useCampusStore } from '@/lib/store/useCampusStore';
import { useRouter } from 'next/navigation';
import { Sparkles, Send, Bot, User, Navigation, MapPin, ArrowRight, HelpCircle, Building2 } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  actionRoomCode?: string;
  actionLabel?: string;
  timestamp: string;
}

export default function AssistantPage() {
  const store = useCampusStore();
  const router = useRouter();
  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-1',
      sender: 'assistant',
      text: 'Hello! I am your SIET AI Campus Assistant. Ask me about your next class, classroom changes, building locations, or walking directions across campus.',
      timestamp: 'Just now'
    }
  ]);

  const quickQuestions = [
    'Where is my next class?',
    'Did my classroom change?',
    'Where is LH-25?',
    'How do I reach the library?',
    'What class do I have next?'
  ];

  const handleSendMessage = (textToSend?: string) => {
    const query = textToSend || inputQuery;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputQuery('');

    // Generate grounded AI response
    setTimeout(() => {
      let botResponseText = '';
      let actionRoomCode: string | undefined = undefined;
      let actionLabel: string | undefined = undefined;

      const q = query.toLowerCase();

      if (q.includes('next class') || q.includes('class next') || q.includes('where is my next')) {
        const nextSlot = store.timetable[0];
        if (nextSlot) {
          botResponseText = `Your next class is **${nextSlot.subject}** scheduled at **${nextSlot.time}** in room **${nextSlot.roomCode}** (Library Block Floor 2). Walking distance is approximately 280m (~4 min walk).`;
          actionRoomCode = nextSlot.roomCode;
          actionLabel = `Navigate to ${nextSlot.roomCode}`;
        } else {
          botResponseText = 'You have no further classes scheduled for today.';
        }
      } else if (q.includes('change') || q.includes('classroom change') || q.includes('did my classroom')) {
        const changedSlot = store.timetable.find((t) => t.isChanged);
        if (changedSlot) {
          botResponseText = `⚠️ **Yes!** Your **${changedSlot.subject}** class has been reassigned from **${changedSlot.previousRoomCode || 'LH-25'}** to **${changedSlot.roomCode}**. Please leave 5 minutes earlier to reach the new venue on time.`;
          actionRoomCode = changedSlot.roomCode;
          actionLabel = `Navigate to ${changedSlot.roomCode}`;
        } else {
          botResponseText = 'No active classroom changes detected for your section today. All classes are on schedule.';
        }
      } else if (q.includes('lh-25') || q.includes('lh25')) {
        botResponseText = '📍 **LH-25** is located on **Floor 2 of the Library Block**. It features digital smart boards and high-speed Wi-Fi access.';
        actionRoomCode = 'LH-25';
        actionLabel = 'Navigate to LH-25';
      } else if (q.includes('lh-28') || q.includes('lh28')) {
        botResponseText = '📍 **LH-28** is located on **Floor 2 of the Library Block** (adjacent to LH-25). It is currently assigned for Data Structures.';
        actionRoomCode = 'LH-28';
        actionLabel = 'Navigate to LH-28';
      } else if (q.includes('library') || q.includes('reach the library')) {
        botResponseText = '📚 **Central Library Block** is located on the East side of campus grounds next to Tech Park. It houses 45,000+ volumes and digital research hubs.';
        actionRoomCode = 'LH-25';
        actionLabel = 'Navigate to Central Library';
      } else if (q.includes('event') || q.includes('today')) {
        const ev = store.events[0];
        if (ev) {
          botResponseText = `🎉 Today's highlight event is **${ev.title}** at **${ev.time}** organized by ${ev.organizer}. Venue: Tech Park Incubation Center.`;
        } else {
          botResponseText = 'There are no major campus events scheduled for today.';
        }
      } else {
        botResponseText = `Based on SIET official campus records, I found details regarding "${query}". You can search rooms, buildings, labs, and facilities directly on the Digital Twin map.`;
      }

      const botMsg: ChatMessage = {
        id: `b-${Date.now()}`,
        sender: 'assistant',
        text: botResponseText,
        actionRoomCode,
        actionLabel,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, botMsg]);
    }, 600);
  };

  const handleAction = (roomCode: string) => {
    store.startNavigationToRoom(roomCode);
    router.push(`/map?navigate=${encodeURIComponent(roomCode)}`);
  };

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 p-4 sm:p-6 pb-24 max-w-3xl mx-auto flex flex-col justify-between">
      
      {/* Header */}
      <div className="space-y-2 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white">AI Campus Assistant</h1>
            <p className="text-xs text-slate-400">Grounded strictly in official SIET timetable and campus GIS data</p>
          </div>
        </div>

        {/* Quick chip queries */}
        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pt-2">
          {quickQuestions.map((q) => (
            <button
              key={q}
              onClick={() => handleSendMessage(q)}
              className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 hover:border-purple-500/40 text-slate-300 hover:text-purple-300 text-xs font-medium shrink-0 transition"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 my-4 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar pr-1">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start gap-3 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`p-2 rounded-xl shrink-0 ${
                m.sender === 'user'
                  ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                  : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
              }`}
            >
              {m.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`p-4 rounded-2xl max-w-[85%] space-y-2 text-xs leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-sky-600/20 border border-sky-500/30 text-slate-100 rounded-tr-none'
                  : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none shadow-xl'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                <span className="font-bold">{m.sender === 'user' ? 'You' : 'SIET AI Companion'}</span>
                <span>{m.timestamp}</span>
              </div>

              <p className="whitespace-pre-line">{m.text}</p>

              {m.actionRoomCode && (
                <div className="pt-2">
                  <button
                    onClick={() => handleAction(m.actionRoomCode!)}
                    className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs shadow-lg shadow-purple-950 flex items-center gap-1.5 transition"
                  >
                    <Navigation className="w-3.5 h-3.5 fill-current" />
                    <span>{m.actionLabel || `Navigate to ${m.actionRoomCode}`}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="relative flex items-center gap-2 pt-2"
      >
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder="Ask AI: Where is my next class? Did LH-25 change?"
          className="flex-1 px-4 py-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 shadow-xl"
        />
        <button
          type="submit"
          disabled={!inputQuery.trim()}
          className="px-4 py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-purple-950 transition flex items-center justify-center"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
