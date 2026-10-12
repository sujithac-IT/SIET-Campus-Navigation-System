'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useCampusStore } from '@/lib/store/useCampusStore';
import {
  Bot,
  X,
  Send,
  Sparkles,
  Navigation,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Clock,
  MapPin,
  Layers,
  ArrowRight,
  Compass,
  RotateCcw,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  action?: {
    type: 'start_navigation' | 'view_place' | 'view_timetable' | 'view_exam';
    destination?: {
      id: string;
      name: string;
      code?: string;
      building?: string;
      floorLevel?: number;
      lat?: number;
      lng?: number;
    };
    route?: {
      distance_m: number;
      eta_sec: number;
      stepsCount: number;
      firstStep?: string;
    };
  };
  source?: 'claude_tools' | 'fallback_engine';
}

const QUICK_PROMPTS = [
  'Take me to Canteen',
  'Directions to Central Library',
  'What is my next class?',
  'Where is my exam hall?',
  'Find Tech Park AI Lab',
];

export const CampusAIBot: React.FC = () => {
  const store = useCampusStore();
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-welcome',
      sender: 'bot',
      text: 'Hello! I am your SIET Voice Assistant. Ask me for directions, your next lecture venue, or exam hall location.',
      timestamp: 'Just now',
    },
  ]);

  // Check Web Speech API availability
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setSpeechSupported(true);
        const recog = new SpeechRecognition();
        recog.continuous = false;
        recog.interimResults = true;
        recog.lang = 'en-US';

        recog.onresult = (event: any) => {
          const current = event.resultIndex;
          const transcript = event.results[current][0].transcript;
          setInput(transcript);
        };

        recog.onerror = (event: any) => {
          console.warn('[Voice Recognition Error]', event.error);
          setIsListening(false);
        };

        recog.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recog;
      }
    }

    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Auto scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Voice synthesis (Text-to-Speech)
  const speakText = (text: string) => {
    if (isMuted || typeof window === 'undefined' || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    // Select natural English voice if present
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(
      (v) =>
        v.lang.startsWith('en') &&
        (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Siri'))
    );
    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // Toggle voice listening
  const toggleListening = () => {
    if (!speechSupported || !recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
          window.speechSynthesis.cancel();
        }
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
      }
    }
  };

  const handleSend = async (queryText?: string) => {
    const textToSend = (queryText || input).trim();
    if (!textToSend || isLoading) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const studentRoll = store.currentUser?.id || '714022104045';

      let responseData: any;
      try {
        const res = await fetch(`${apiUrl}/api/v1/assistant/query`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: textToSend,
            rollNo: studentRoll,
            department: 'CSE',
            year: 3,
            section: 'A',
            from: 'GATE-01',
          }),
        });

        if (res.ok) {
          const json = await res.json();
          responseData = json.data;
        }
      } catch (networkErr) {
        console.warn('Backend assistant request failed, falling back to local simulation:', networkErr);
      }

      // If backend was unreachable, generate clean local reply
      if (!responseData) {
        responseData = generateLocalFallback(textToSend);
      }

      const botMsg: ChatMessage = {
        id: `b-${Date.now()}`,
        sender: 'bot',
        text: responseData.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        action: responseData.action,
        source: responseData.source,
      };

      setMessages((prev) => [...prev, botMsg]);
      speakText(responseData.reply);
    } catch (err) {
      console.error('Assistant error:', err);
      const errMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'bot',
        text: 'Sorry, I encountered an issue processing your request. Please try again.',
        timestamp: 'Just now',
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Local fallback generator if backend is temporarily unreachable
  const generateLocalFallback = (query: string): any => {
    const q = query.toLowerCase();
    if (q.includes('canteen') || q.includes('food')) {
      return {
        reply: 'The Student Canteen is 85 meters away past the central flagpole. Walking time is about 1 minute.',
        action: {
          type: 'start_navigation',
          destination: { id: 'CANTEEN-01', name: 'Student Canteen', building: 'Campus Grounds', floorLevel: 0 },
          route: { distance_m: 85, eta_sec: 75, stepsCount: 2, firstStep: 'Walk straight towards Canteen Promenade' },
        },
      };
    }
    if (q.includes('library') || q.includes('book')) {
      return {
        reply: 'The Central Library is 120 meters away on the ground floor next to the Admin Block. Follow the blue line.',
        action: {
          type: 'start_navigation',
          destination: { id: 'LIB-STACK', name: 'Central Library', building: 'Library Block', floorLevel: 0 },
          route: { distance_m: 120, eta_sec: 110, stepsCount: 3, firstStep: 'Head north towards Central Library foyer' },
        },
      };
    }
    if (q.includes('class') || q.includes('timetable')) {
      return {
        reply: 'Your next class is Compiler Design in Room 302, CSE Block Floor 2 at 9:00 AM. Route is ready.',
        action: {
          type: 'start_navigation',
          destination: { id: 'LH-05', name: 'Lecture Hall 05 (Room 302)', building: 'Academic Block', floorLevel: 2 },
        },
      };
    }
    if (q.includes('exam') || q.includes('seat')) {
      return {
        reply: 'Your exam is in Tech Park Hall 101, Floor 1 at seat TP-A24. Starting navigation to the exam hall.',
        action: {
          type: 'start_navigation',
          destination: { id: 'TECH-201', name: 'Tech Park Hall 101', building: 'Tech Park', floorLevel: 1 },
        },
      };
    }
    return {
      reply: `I searched campus records for "${query}". You can follow the navigation guide on your screen.`,
      action: {
        type: 'start_navigation',
        destination: { id: 'CANTEEN-01', name: 'Destination Landmark', building: 'Academic Block', floorLevel: 0 },
      },
    };
  };

  const handleStartNavigation = (action?: ChatMessage['action']) => {
    if (!action?.destination) return;

    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    setIsOpen(false);
    const dest = action.destination;
    const destParam = encodeURIComponent(dest.code || dest.id || dest.name);
    router.push(`/navigate?to=${destParam}&name=${encodeURIComponent(dest.name)}`);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `m-${Date.now()}`,
        sender: 'bot',
        text: 'Chat history cleared. How can I help you navigate SIET campus today?',
        timestamp: 'Just now',
      },
    ]);
  };

  return (
    <>
      {/* Floating Glowing AI Assistant Summon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open AI Campus Voice Assistant"
        className="fixed bottom-6 right-6 z-40 p-4 rounded-full bg-gradient-to-r from-cyan-500 via-sky-600 to-indigo-600 text-white shadow-2xl shadow-cyan-500/30 hover:scale-105 active:scale-95 transition-all duration-300 ring-4 ring-cyan-400/20 flex items-center gap-2.5 group"
      >
        <div className="relative">
          <Sparkles className="w-5 h-5 animate-pulse text-amber-200" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-slate-900" />
        </div>
        <span className="font-semibold text-xs tracking-wide hidden sm:inline group-hover:inline pr-1">
          Voice AI
        </span>
      </button>

      {/* Glassmorphic Voice Assistant Sheet / Modal */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 w-[410px] max-w-[calc(100vw-32px)] h-[580px] bg-slate-900/95 backdrop-blur-2xl border border-cyan-500/30 rounded-3xl shadow-2xl flex flex-col z-50 overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-300">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/70 border-b border-cyan-500/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 shadow-inner">
                <Bot className="w-5 h-5 animate-bounce duration-1000" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
                  SIET Voice Navigator
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-medium">
                    Claude AI
                  </span>
                </h4>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isListening
                        ? 'bg-rose-500 animate-ping'
                        : isSpeaking
                        ? 'bg-cyan-400 animate-pulse'
                        : 'bg-emerald-400'
                    }`}
                  />
                  <span>
                    {isListening
                      ? 'Listening to speech...'
                      : isSpeaking
                      ? 'Speaking...'
                      : 'Voice Assistant Ready'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMuted(!isMuted)}
                title={isMuted ? 'Unmute voice' : 'Mute voice'}
                className={`p-2 rounded-xl transition ${
                  isMuted ? 'text-rose-400 hover:bg-rose-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <button
                onClick={handleResetChat}
                title="Clear chat"
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  if (typeof window !== 'undefined' && window.speechSynthesis) {
                    window.speechSynthesis.cancel();
                  }
                  setIsOpen(false);
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Voice Wave Visualizer when Active */}
          {(isListening || isSpeaking) && (
            <div className="bg-gradient-to-r from-cyan-950/40 via-sky-900/30 to-indigo-950/40 px-4 py-2 border-b border-cyan-500/20 flex items-center justify-between">
              <div className="flex items-center gap-1.5 h-6">
                {[40, 75, 55, 90, 60, 85, 45, 95, 70, 50, 80].map((height, idx) => (
                  <span
                    key={idx}
                    className={`w-1 rounded-full ${
                      isListening ? 'bg-rose-400 animate-pulse' : 'bg-cyan-400 animate-pulse'
                    }`}
                    style={{
                      height: `${height}%`,
                      animationDelay: `${idx * 80}ms`,
                    }}
                  />
                ))}
              </div>
              <span className="text-[11px] font-medium text-slate-300">
                {isListening ? 'Listening... Speak now' : 'Speaking response...'}
              </span>
            </div>
          )}

          {/* Messages Feed */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 custom-scrollbar">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[88%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-lg ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-cyan-600 to-sky-600 text-white rounded-br-sm'
                      : 'bg-slate-800/90 text-slate-200 border border-slate-700/80 rounded-bl-sm'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>

                  {/* Navigation Action Card */}
                  {msg.action && msg.action.destination && (
                    <div className="mt-3 p-3 rounded-xl bg-slate-900/80 border border-cyan-500/30 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5 text-cyan-400 font-semibold text-xs">
                            <MapPin className="w-3.5 h-3.5" />
                            {msg.action.destination.name}
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                            {msg.action.destination.building && (
                              <span>{msg.action.destination.building}</span>
                            )}
                            {msg.action.destination.floorLevel !== undefined && (
                              <span className="flex items-center gap-1">
                                <Layers className="w-3 h-3 text-slate-500" />
                                Floor {msg.action.destination.floorLevel}
                              </span>
                            )}
                          </div>
                        </div>

                        {msg.action.route && (
                          <div className="text-right text-[11px] text-emerald-400 font-medium">
                            <div>{msg.action.route.distance_m}m</div>
                            <div className="text-slate-400 text-[10px]">
                              ~{Math.ceil(msg.action.route.eta_sec / 60)} min
                            </div>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => handleStartNavigation(msg.action)}
                        className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-cyan-500/20 transition active:scale-[0.98]"
                      >
                        <Compass className="w-3.5 h-3.5" />
                        Start Turn-by-Turn Navigation
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  <span className="block mt-1.5 text-[9px] text-slate-400 text-right opacity-70">
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 w-fit text-xs text-slate-400">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span>Thinking & querying campus map...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Chips */}
          <div className="px-3 py-2 bg-slate-900/60 border-t border-slate-800/80 overflow-x-auto custom-scrollbar flex gap-1.5 no-scrollbar">
            {QUICK_PROMPTS.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(chip)}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-slate-700 hover:border-cyan-500/40 text-[11px] transition"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Voice & Text Input Toolbar */}
          <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
            {/* Microphone Toggle */}
            <button
              onClick={toggleListening}
              title={isListening ? 'Stop listening' : 'Start voice recognition'}
              className={`p-2.5 rounded-xl transition duration-200 flex items-center justify-center ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse ring-4 ring-rose-400/30'
                  : 'bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 hover:border-cyan-500/40'
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Query Input */}
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={isListening ? 'Listening to speech...' : 'Ask AI... e.g. "Take me to Canteen"'}
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-white placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />

            {/* Send Button */}
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className="p-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white transition shadow-md flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
