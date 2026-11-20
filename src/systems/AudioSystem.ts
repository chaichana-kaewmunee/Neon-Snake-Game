import type { UserProfile } from '../types/progression';
import { PersistenceManager } from './Persistence';

export class AudioSystem {
  private audioContext: AudioContext | null = null;
  // Master gain node for global volume/mute control
  private masterGainNode: GainNode | null = null;
  private music: HTMLAudioElement | null = null;

  constructor() {
    // AudioContext will be created after a user interaction.
  }

  /** Initialize the AudioContext and master gain after a user interaction */
  public async init(): Promise<void> {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGainNode = this.audioContext.createGain();
      this.masterGainNode.gain.value = this.getVolume();
      this.masterGainNode.connect(this.audioContext.destination);
    }
  }

  private getVolume(): number {
    const profile = PersistenceManager.loadProfile();
    return profile.settings.muted ? 0 : profile.settings.volume;
  }

  /** Generate a procedural sound using an OscillatorNode */
  private generateProceduralSound(
    wave: OscillatorType,
    freq: number,
    duration: number
  ): void {
    if (!this.audioContext || !this.masterGainNode) return;
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    osc.type = wave;
    osc.frequency.value = freq;
    // Simple envelope: attack 0.01 s, release at `duration`
    const now = this.audioContext.currentTime;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(1, now + 0.01);
    gain.gain.setValueAtTime(1, now + duration - 0.01);
    gain.gain.linearRampToValueAtTime(0, now + duration);
    osc.connect(gain);
    gain.connect(this.masterGainNode);
    osc.start(now);
    osc.stop(now + duration);
  }

  /** Play a named sound effect using procedural generation */
  play(name: string): void {
    const volume = this.getVolume();
    if (volume === 0 || !this.audioContext) return;
    const soundMap: Record<string, { wave: OscillatorType; freq: number; dur: number }> = {
      eat: { wave: 'triangle', freq: 440, dur: 0.08 },
      die: { wave: 'sawtooth', freq: 220, dur: 0.35 },
      move: { wave: 'square', freq: 600, dur: 0.05 },
    };
    const spec = soundMap[name];
    if (!spec) {
      console.warn(`Unsupported sound ${name}`);
      return;
    }
    this.generateProceduralSound(spec.wave, spec.freq, spec.dur);
  }

  /** Play background music (MP3 asset) – optional */
  playMusic(url: string): void {
    if (this.music) this.music.pause();
    this.music = new Audio(url);
    this.music.loop = true;
    this.music.volume = this.getVolume();
    this.music.play().catch(() => {
      console.log('Music playback blocked by browser autoplay policy');
    });
  }

  /** Update global volume/mute – affects both procedural sounds and music */
  updateVolume(): void {
    const volume = this.getVolume();
    if (this.masterGainNode) this.masterGainNode.gain.value = volume;
    if (this.music) this.music.volume = volume;
  }

  /** Ensure the AudioContext is running after a user gesture */
  async resumeContext(): Promise<void> {
    if (!this.audioContext) {
      await this.init();
    }
    if (this.audioContext?.state === 'suspended') {
      await this.audioContext.resume();
    }
  }
}
