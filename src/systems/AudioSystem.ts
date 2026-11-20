import type { UserProfile } from '../types/progression';
import { PersistenceManager } from './Persistence';

export class AudioSystem {
  private audioContext: AudioContext | null = null;
  private sounds: Map<string, AudioBuffer> = new Map();
  private music: HTMLAudioElement | null = null;

  constructor() {
    this.init();
  }

  private async init() {
    // AudioContext must be created after a user gesture
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    await this.loadSounds();
  }

  private async loadSounds() {
    const soundFiles: Record<string, string> = {
      eat: '/sounds/eat.mp3',
      die: '/sounds/die.mp3',
      move: '/sounds/move.mp3',
    };

    for (const [name, url] of Object.entries(soundFiles)) {
      try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await this.audioContext!.decodeAudioData(arrayBuffer);
        this.sounds.set(name, audioBuffer);
      } catch (e) {
        console.warn(`Failed to load sound ${name}: ${url}`);
      }
    }
  }

  private getVolume(): number {
    const profile = PersistenceManager.loadProfile();
    return profile.settings.muted ? 0 : profile.settings.volume;
  }

  play(name: string) {
    const volume = this.getVolume();
    if (volume === 0 || !this.audioContext || !this.sounds.has(name)) return;

    const source = this.audioContext.createBufferSource();
    source.buffer = this.sounds.get(name)!;

    const gainNode = this.audioContext.createGain();
    gainNode.gain.value = volume;

    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    source.start(0);
  }

  playMusic(url: string) {
    if (this.music) this.music.pause();

    this.music = new Audio(url);
    this.music.loop = true;
    this.music.volume = this.getVolume();
    this.music.play().catch(() => {
      console.log('Music playback blocked by browser autoplay policy');
    });
  }

  updateVolume() {
    if (this.music) {
      this.music.volume = this.getVolume();
    }
  }

  async resumeContext() {
    if (this.audioContext?.state === 'suspended') {
      await this.audioContext.resume();
    }
  }
}
