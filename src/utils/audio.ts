class SoundManager {
  private ctx: AudioContext | null = null;
  private enabled = true;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setEnabled(value: boolean) {
    this.enabled = value;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  // Referee whistle sound effect
  public playWhistle(type: 'short' | 'double' | 'final' = 'short') {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const playBlast = (time: number, duration: number) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(2800, time);
      osc.frequency.exponentialRampToValueAtTime(3200, time + duration * 0.5);
      osc.frequency.exponentialRampToValueAtTime(2600, time + duration);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2900, time);
      filter.Q.setValueAtTime(8, time);

      gain.gain.setValueAtTime(0.01, time);
      gain.gain.linearRampToValueAtTime(0.2, time + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(time);
      osc.stop(time + duration);
    };

    if (type === 'short') {
      playBlast(now, 0.22);
    } else if (type === 'double') {
      playBlast(now, 0.15);
      playBlast(now + 0.2, 0.28);
    } else {
      playBlast(now, 0.18);
      playBlast(now + 0.25, 0.18);
      playBlast(now + 0.5, 0.45);
    }
  }

  // Goal Horn & Stadium Roar
  public playGoalHorn() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // Deep Horn
    [130.81, 164.81, 196.0].forEach((freq) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.05, now);
      gain.gain.linearRampToValueAtTime(0.15, now + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 1.8);
    });

    // Crowd cheer noise simulation
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, now);
    filter.frequency.linearRampToValueAtTime(1400, now + 0.6);
    filter.frequency.exponentialRampToValueAtTime(300, now + 2.2);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.02, now);
    noiseGain.gain.linearRampToValueAtTime(0.2, now + 0.3);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 2.2);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);

    noise.start(now);
    noise.stop(now + 2.2);
  }

  // Ball Kick or Pass sound
  public playKick() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.12);

    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  // Crossbar / post hit sound
  public playPostHit() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.4);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.4);
  }

  // UI Click sound
  public playClick() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.04);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.04);
  }

  // Chime for trophy or success
  public playFanfare() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const notes = [392, 523.25, 659.25, 783.99, 1046.5];
    const now = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);

      gain.gain.setValueAtTime(0.001, now + idx * 0.12);
      gain.gain.linearRampToValueAtTime(0.12, now + idx * 0.12 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.6);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 0.6);
    });
  }
}

export const sound = new SoundManager();
