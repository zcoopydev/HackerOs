// Synthesized Web Audio API terminal sound effects

class TerminalSoundEngine {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Crisp mechanical/teletype "tik" sound for each terminal log line
  playTik() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      // Sharp click frequency modulation: high frequency snap decaying to low
      osc.type = 'square';
      osc.frequency.setValueAtTime(1400 + Math.random() * 400, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.012);

      // High-pass filter for crisp CRT teletype character
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(800, now);

      // Very quick snappy envelope (0.015s duration)
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.015);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.016);
    } catch {
      // Ignore audio policy errors
    }
  }

  // Heavy mechanical relay switch sound for the Boot button
  playBootPower() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;

      // Relay switch click
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.08);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.09);

      // CRT Capacitor hum spool-up
      const humOsc = this.ctx.createOscillator();
      const humGain = this.ctx.createGain();
      humOsc.type = 'sine';
      humOsc.frequency.setValueAtTime(60, now + 0.02);
      humOsc.frequency.exponentialRampToValueAtTime(440, now + 0.4);

      humGain.gain.setValueAtTime(0.001, now + 0.02);
      humGain.gain.linearRampToValueAtTime(0.06, now + 0.15);
      humGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

      humOsc.connect(humGain);
      humGain.connect(this.ctx.destination);
      humOsc.start(now + 0.02);
      humOsc.stop(now + 0.46);
    } catch {
      // Ignore
    }
  }

  // Dual tone success beep when 5-second boot completes
  playBootReady() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      [587.33, 880].forEach((freq, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.1);

        gain.gain.setValueAtTime(0.12, now + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.1 + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now + i * 0.1);
        osc.stop(now + i * 0.1 + 0.26);
      });
    } catch {
      // Ignore
    }
  }

  // Harsh error buzz for invalid password / access denied
  playAccessDenied() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(110, now);
      osc.frequency.setValueAtTime(90, now + 0.1);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.29);
    } catch {
      // Ignore
    }
  }

  // Affirmative cyber chime for access granted
  playAccessGranted() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      [440, 659.25, 880].forEach((freq, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.08);

        gain.gain.setValueAtTime(0.12, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.08 + 0.3);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.31);
      });
    } catch {
      // Ignore
    }
  }

  // Futuristic warp entrance de-cloaking sound
  playWarp() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // Sub-bass sweep
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(60, now);
      osc.frequency.exponentialRampToValueAtTime(900, now + 0.5);
      osc.frequency.exponentialRampToValueAtTime(180, now + 1.2);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.4);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 1.35);

      // Shimmering chord burst
      [523.25, 659.25, 783.99, 1046.5].forEach((freq) => {
        const chordOsc = this.ctx!.createOscillator();
        const chordGain = this.ctx!.createGain();
        chordOsc.type = 'sine';
        chordOsc.frequency.setValueAtTime(freq, now + 0.4);

        chordGain.gain.setValueAtTime(0.08, now + 0.4);
        chordGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.4);

        chordOsc.connect(chordGain);
        chordGain.connect(this.ctx!.destination);
        chordOsc.start(now + 0.4);
        chordOsc.stop(now + 1.42);
      });
    } catch {
      // Ignore
    }
  }

  // Emergency Warhead siren oscillation
  playSiren() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(450, now);
      osc.frequency.linearRampToValueAtTime(900, now + 0.35);
      osc.frequency.linearRampToValueAtTime(450, now + 0.7);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.75);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.76);
    } catch {}
  }

  // Countdown beep for bomb sequence
  playCountdownBeep(highPitch = false) {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(highPitch ? 1400 : 880, now);

      gain.gain.setValueAtTime(0.16, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + (highPitch ? 0.25 : 0.08));

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + (highPitch ? 0.26 : 0.09));
    } catch {}
  }

  // Cyber EMP / Detonation shockwave sound
  playDetonation() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // Heavy low boom
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(25, now + 1.5);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.6);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 1.65);
    } catch {}
  }

  // Crypto block mined chime
  playBlockMined() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      [800, 1200, 1600].forEach((freq, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.06);

        gain.gain.setValueAtTime(0.1, now + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.2);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(now + i * 0.06);
        osc.stop(now + i * 0.06 + 0.21);
      });
    } catch {}
  }

  toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  setMuted(muted: boolean): void {
    this.isMuted = muted;
  }

  isMutedState(): boolean {
    return this.isMuted;
  }
}

export const terminalSound = new TerminalSoundEngine();
