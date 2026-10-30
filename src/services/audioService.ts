// Web Audio API Synthesizer for Retro Cybernetic SFX and BGM

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private bgmOscillator: OscillatorNode | null = null;
  private bgmGain: GainNode | null = null;

  constructor() {
    // Try to load mute preference from localStorage
    const savedMute = localStorage.getItem('megabots_audio_muted');
    if (savedMute !== null) {
      this.isMuted = savedMute === 'true';
    }
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    localStorage.setItem('megabots_audio_muted', this.isMuted ? 'true' : 'false');
    if (this.isMuted) {
      this.stopBgm();
    }
    return this.isMuted;
  }

  public playSfx(type: 'hit' | 'heal' | 'crit' | 'equip' | 'victory' | 'defeat' | 'click' | 'levelup') {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      if (type === 'hit') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.15);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === 'crit') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(420, now);
        osc.frequency.exponentialRampToValueAtTime(70, now + 0.28);
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
        osc.start(now);
        osc.stop(now + 0.28);
      } else if (type === 'heal') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(260, now);
        osc.frequency.exponentialRampToValueAtTime(620, now + 0.25);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'equip') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.setValueAtTime(480, now + 0.08);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === 'victory') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(330, now);
        osc.frequency.setValueAtTime(440, now + 0.12);
        osc.frequency.setValueAtTime(554, now + 0.24);
        osc.frequency.setValueAtTime(660, now + 0.36);
        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        osc.start(now);
        osc.stop(now + 0.6);
      } else if (type === 'defeat') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.5);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
      } else if (type === 'levelup') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.setValueAtTime(330, now + 0.1);
        osc.frequency.setValueAtTime(440, now + 0.2);
        osc.frequency.setValueAtTime(587, now + 0.3);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
        osc.start(now);
        osc.stop(now + 0.65);
      } else {
        // click
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc.start(now);
        osc.stop(now + 0.04);
      }
    } catch {
      // AudioContext policy catch
    }
  }

  public playBgm(theme: 'hub' | 'battle' | 'boss') {
    if (this.isMuted) return;
    try {
      this.stopBgm();
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      this.bgmOscillator = this.ctx.createOscillator();
      this.bgmGain = this.ctx.createGain();

      this.bgmOscillator.type = theme === 'boss' ? 'sawtooth' : theme === 'battle' ? 'triangle' : 'sine';
      const baseFreq = theme === 'boss' ? 55 : theme === 'battle' ? 82 : 110;
      this.bgmOscillator.frequency.setValueAtTime(baseFreq, now);

      this.bgmGain.gain.setValueAtTime(0.04, now);
      this.bgmOscillator.connect(this.bgmGain);
      this.bgmGain.connect(this.ctx.destination);

      this.bgmOscillator.start();
    } catch {
      // AudioContext policy
    }
  }

  public stopBgm() {
    try {
      if (this.bgmOscillator) {
        this.bgmOscillator.stop();
        this.bgmOscillator.disconnect();
        this.bgmOscillator = null;
      }
      if (this.bgmGain) {
        this.bgmGain.disconnect();
        this.bgmGain = null;
      }
    } catch {
      // Ignore
    }
  }
}

export const audioService = new SoundEngine();
