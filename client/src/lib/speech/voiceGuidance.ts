/**
 * SIET Navigate — Turn-by-Turn Voice Guidance Engine
 * Uses Web Speech API (speechSynthesis) + Web Audio API synthesized chimes.
 * Works 100% client-side and offline (no external TTS server required).
 */

class VoiceGuidanceEngine {
  private synth: SpeechSynthesis | null = null;
  private audioCtx: AudioContext | null = null;
  private isMuted: boolean = false;
  private isSpeaking: boolean = false;
  private announcedStepKeys: Set<string> = new Set();
  private lastSpokenText: string = '';
  private lastSpokenTime: number = 0;
  private listeners: Set<(speaking: boolean) => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      // Warm up voices on mobile browsers
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => {};
      }
    }
  }

  public subscribe(listener: (speaking: boolean) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(speaking: boolean) {
    this.isSpeaking = speaking;
    this.listeners.forEach((cb) => cb(speaking));
  }

  public isMute(): boolean {
    return this.isMuted;
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (muted && this.synth) {
      this.synth.cancel();
      this.notify(false);
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  /**
   * Synthesize a crisp dual-tone navigation chime using Web Audio API
   */
  private async playChime(): Promise<void> {
    if (this.isMuted || typeof window === 'undefined') return;

    try {
      const AudioCtxClass =
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtxClass) return;

      if (!this.audioCtx) {
        this.audioCtx = new AudioCtxClass();
      }
      if (this.audioCtx.state === 'suspended') {
        await this.audioCtx.resume();
      }

      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880.0, now + 0.12); // A5

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.18, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.28);
    } catch {
      // AudioContext unavailable or blocked by autoplay policy
    }
  }

  /**
   * Speak arbitrary text with pitch and speech rate tuned for clear campus navigation
   */
  public speak(text: string, force = false): void {
    if (this.isMuted || !this.synth) return;

    // Throttle duplicate phrases within 4 seconds unless forced
    const now = Date.now();
    if (!force && text === this.lastSpokenText && now - this.lastSpokenTime < 4000) {
      return;
    }

    this.lastSpokenText = text;
    this.lastSpokenTime = now;

    // Cancel currently speaking utterance for timely instructions
    this.synth.cancel();

    // Play chime before alert
    this.playChime().finally(() => {
      if (!this.synth) return;

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.02;
      utterance.pitch = 1.05;
      utterance.lang = 'en-IN'; // Indian English cadence for SIET campus

      // Try selecting a natural sounding English voice
      const voices = this.synth.getVoices();
      const preferred = voices.find(
        (v) =>
          (v.lang === 'en-IN' || v.lang.startsWith('en')) &&
          (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha'))
      );
      if (preferred) {
        utterance.voice = preferred;
      }

      utterance.onstart = () => this.notify(true);
      utterance.onend = () => this.notify(false);
      utterance.onerror = () => this.notify(false);

      this.synth.speak(utterance);
    });
  }

  public resetAnnouncements(): void {
    this.announcedStepKeys.clear();
    this.lastSpokenText = '';
    if (this.synth) {
      this.synth.cancel();
      this.notify(false);
    }
  }

  public announceRouteStart(destName: string, firstInstruction: string, distMeters: number): void {
    const text = `Starting route to ${destName}. In ${Math.round(distMeters)} meters, ${firstInstruction}.`;
    this.speak(text, true);
  }

  public announceApproachingTurn(stepIndex: number, instruction: string, distMeters: number): void {
    const key = `step-${stepIndex}-30m`;
    if (this.announcedStepKeys.has(key)) return;

    this.announcedStepKeys.add(key);
    const text = `In ${Math.round(distMeters)} meters, ${instruction}.`;
    this.speak(text);
  }

  public announceTurnNow(stepIndex: number, instruction: string): void {
    const key = `step-${stepIndex}-now`;
    if (this.announcedStepKeys.has(key)) return;

    this.announcedStepKeys.add(key);
    this.speak(instruction, true);
  }

  public announceFloorTransition(toFloor: number, method: 'stairs' | 'elevator'): void {
    const key = `floor-trans-${toFloor}`;
    if (this.announcedStepKeys.has(key)) return;

    this.announcedStepKeys.add(key);
    const verb = method === 'elevator' ? 'Take elevator to' : 'Take stairs to';
    this.speak(`${verb} Floor ${toFloor}.`, true);
  }

  public announceReroute(): void {
    this.resetAnnouncements();
    this.speak('Off route. Recalculating path to destination.', true);
  }

  /**
   * Synthesize Google Maps arrival celebration chime (C5 -> E5 -> G5)
   */
  public async playArrivalChime(): Promise<void> {
    if (this.isMuted || typeof window === 'undefined') return;
    try {
      const AudioCtxClass =
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtxClass) return;
      if (!this.audioCtx) this.audioCtx = new AudioCtxClass();
      if (this.audioCtx.state === 'suspended') await this.audioCtx.resume();

      const now = this.audioCtx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = this.audioCtx!.createOscillator();
        const gain = this.audioCtx!.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);
        gain.gain.setValueAtTime(0.001, now + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.2, now + idx * 0.12 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.35);
        osc.connect(gain);
        gain.connect(this.audioCtx!.destination);
        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.35);
      });
    } catch {
      // AudioContext unavailable
    }
  }

  public announceArrival(destName: string): void {
    this.resetAnnouncements();
    this.playArrivalChime();
    setTimeout(() => {
      this.speak(`Your destination has arrived. Welcome to ${destName}!`, true);
    }, 450);
  }

  public stop(): void {
    if (this.synth) {
      this.synth.cancel();
    }
    this.notify(false);
  }
}

export const voiceGuidance = new VoiceGuidanceEngine();
