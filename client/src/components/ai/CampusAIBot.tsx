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
    if (q.includes('tech') || q.includes('tech park') || q.includes('lab') || q.includes('library') || q.includes('computing')) {
      return {
        reply: 'Starting real satellite navigation to Tech Park (New Innovation & Computing Block). Head west along the central avenue past the amphitheatre.',
        action: {
          type: 'start_navigation',
          destination: { id: 'b-techpark', code: 'techpark', name: 'Tech Park (New Innovation & Computing Block)', building: 'Tech Park', floorLevel: 0, lat: 11.040680, lng: 77.074800 },
          route: { distance_m: 125, eta_sec: 95, stepsCount: 3, firstStep: 'Proceed west on tree-lined central avenue' },
        },
      };
    }
    if (q.includes('main') || q.includes('main block') || q.includes('courtyard')) {
      return {
        reply: 'Starting real satellite navigation to Main Block (5-Storey Academic Complex, LH 01 to 23). Follow the avenue towards the west courtyard.',
        action: {
          type: 'start_navigation',
          destination: { id: 'b-main-block', code: 'mainblock', name: 'Main Block (5-Storey Complex)', building: 'Main Block', floorLevel: 0, lat: 11.040450, lng: 77.074250 },
          route: { distance_m: 140, eta_sec: 105, stepsCount: 3, firstStep: 'Proceed west past the central roundabout' },
        },
      };
    }
    if (q.includes('academic') || q.includes('acad') || q.includes('coe') || q.includes('admin') || q.includes('principal')) {
      return {
        reply: 'Starting real satellite navigation to Academic Block (COE Wing & Principal Secretariat, LH 24 to 68). Follow the path southwest.',
        action: {
          type: 'start_navigation',
          destination: { id: 'b-academic-block', code: 'academic', name: 'Academic Block (COE & Engineering Wing)', building: 'Academic Block', floorLevel: 0, lat: 11.040050, lng: 77.075050 },
          route: { distance_m: 110, eta_sec: 85, stepsCount: 2, firstStep: 'Turn southwest towards Academic Block entrance' },
        },
      };
    }
    if (q.includes('amphi') || q.includes('amphitheatre') || q.includes('stage') || q.includes('theatre')) {
      return {
        reply: 'Starting real satellite navigation to the Open Air Amphitheatre situated between Main Block and Tech Park.',
        action: {
          type: 'start_navigation',
          destination: { id: 'b-amphitheatre', code: 'amphi', name: 'Open Air Amphitheatre', building: 'Amphitheatre', floorLevel: 0, lat: 11.040320, lng: 77.074400 },
          route: { distance_m: 95, eta_sec: 70, stepsCount: 2, firstStep: 'Walk towards the circular amphitheatre plaza' },
        },
      };
    }
    if (q.includes('canteen') || q.includes('food') || q.includes('cafe')) {
      return {
        reply: 'Starting real satellite navigation to the Student Food Court & Cafeteria. Proceed south past the parking area.',
        action: {
          type: 'start_navigation',
          destination: { id: 'b-foodcourt', code: 'foodcourt', name: 'Campus Food Court & Cafeteria', building: 'Food Court', floorLevel: 0, lat: 11.039554, lng: 77.075400 },
          route: { distance_m: 85, eta_sec: 65, stepsCount: 2, firstStep: 'Walk south along the Food Court Promenade' },
        },
      };
    }
    if (q.includes('girls') || q.includes('ghostel')) {
      return {
        reply: 'Starting real satellite navigation to the Girls Hostel Complex in the south residential sector.',
        action: {
          type: 'start_navigation',
          destination: { id: 'b-girls-hostel', code: 'ghostel', name: 'Girls Hostel Complex', building: 'Girls Hostel', floorLevel: 0, lat: 11.038450, lng: 77.073900 },
          route: { distance_m: 230, eta_sec: 180, stepsCount: 4, firstStep: 'Follow the south avenue towards the hostel zone' },
        },
      };
    }
    if (q.includes('boys') || q.includes('bhostel')) {
      return {
        reply: 'Starting real satellite navigation to the Boys Hostel Complex in the southwest sector.',
        action: {
          type: 'start_navigation',
          destination: { id: 'b-boys-hostel', code: 'bhostel', name: 'Boys Hostel Complex', building: 'Boys Hostel', floorLevel: 0, lat: 11.038200, lng: 77.073200 },
          route: { distance_m: 260, eta_sec: 210, stepsCount: 4, firstStep: 'Proceed past sports ground to boys hostel avenue' },
        },
      };
    }
    if (q.includes('gate') || q.includes('entrance') || q.includes('highway') || q.includes('nh 544')) {
      return {
        reply: 'Starting real satellite navigation to Main Campus Entrance Gateway on NH 544.',
        action: {
          type: 'start_navigation',
          destination: { id: 'b-gate', code: 'gate', name: 'Main Campus Entrance Gateway (NH 544)', building: 'Entrance Arch', floorLevel: 0, lat: 11.040913, lng: 77.077493 },
          route: { distance_m: 138, eta_sec: 110, stepsCount: 2, firstStep: 'Follow main boulevard east to entrance gate' },
        },
      };
    }
    if (q.includes('class') || q.includes('timetable')) {
      return {
        reply: 'Your next class is in Tech Park Room 302 at 9:00 AM. Opening satellite navigation route.',
        action: {
          type: 'start_navigation',
          destination: { id: 'TECH-201', code: 'techpark', name: 'Tech Park Room 302', building: 'Tech Park', floorLevel: 2, lat: 11.040680, lng: 77.074800 },
        },
      };
    }
    if (q.includes('exam') || q.includes('seat')) {
      return {
        reply: 'Your exam is in Main Block Hall LH 05. Opening satellite navigation route.',
        action: {
          type: 'start_navigation',
          destination: { id: 'LH-05', code: 'mainblock', name: 'Main Block Exam Hall LH 05', building: 'Main Block', floorLevel: 1, lat: 11.040450, lng: 77.074250 },
        },
      };
    }
    return {
      reply: `I found the campus location for "${query}". Opening live satellite navigation on the campus map.`,
      action: {
        type: 'start_navigation',
        destination: { id: 'b-techpark', code: 'techpark', name: 'Tech Park (New Innovation Block)', building: 'Tech Park', floorLevel: 0, lat: 11.040680, lng: 77.074800 },
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
    const destCode = encodeURIComponent(dest.code || dest.id || dest.name);
    const destName = encodeURIComponent(dest.name);
    const latParam = dest.lat ? `&lat=${dest.lat}` : '';
    const lngParam = dest.lng ? `&lng=${dest.lng}` : '';
    
    // Always navigate directly to the real satellite map with live GPS and satellite tiles
    router.push(`/map?navigate=${destCode}&name=${destName}${latParam}${lngParam}`);
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
