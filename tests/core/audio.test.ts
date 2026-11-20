import { describe, test, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { AudioSystem } from '../../src/systems/AudioSystem';
import { PersistenceManager } from '../../src/systems/Persistence';

// Mock localStorage for test environment
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    clear: () => { store = {}; },
    removeItem: (key: string) => { delete store[key]; },
  };
})();

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
  configurable: true,
});

// Mock window for non-browser test environment
if (typeof window === 'undefined') {
  (globalThis as any).window = globalThis;
}

// Mock implementations for Web Audio API
class MockGainNode {
  gain = { value: 0, setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() };
  connect = vi.fn();
}
class MockOscillatorNode {
  type = '';
  frequency = { value: 0 };
  start = vi.fn();
  stop = vi.fn();
  connect = vi.fn();
}
class MockAudioContext {
  destination = {};
  currentTime = 0;
  state = 'running';
  createGain() { return new MockGainNode(); }
  createOscillator() { return new MockOscillatorNode(); }
  resume = vi.fn(() => Promise.resolve());
}

describe('AudioSystem', () => {
  let originalAudioContext: any;
  beforeAll(() => {
    originalAudioContext = (global as any).AudioContext;
    (global as any).AudioContext = MockAudioContext;
  });
  afterAll(() => {
    (global as any).AudioContext = originalAudioContext;
  });

  beforeEach(() => {
    localStorage.clear();
  });

  test('play uses volume from profile', async () => {
    const profile = {
      version: 1,
      stats: { totalGames: 0, highestScore: 0, totalFoodEaten: 0, longestSnake: 0, totalPlayTime: 0 },
      achievements: [],
      history: [],
      settings: { difficulty: 'NORMAL', volume: 0.5, muted: false },
    } as any;
    localStorage.setItem('neon_snake_profile', JSON.stringify(profile));
    const audio = new AudioSystem();
    await audio.init();
    const masterGain = (audio as any).masterGainNode as MockGainNode;
    expect(masterGain.gain.value).toBe(0.5);
    // Ensure procedural sound is generated
    const genSpy = vi.spyOn(audio as any, 'generateProceduralSound');
    audio.play('eat');
    expect(genSpy).toHaveBeenCalled();
    genSpy.mockRestore();
  });

  test('mute prevents playback', async () => {
    const profile = {
      version: 1,
      stats: { totalGames: 0, highestScore: 0, totalFoodEaten: 0, longestSnake: 0, totalPlayTime: 0 },
      achievements: [],
      history: [],
      settings: { difficulty: 'NORMAL', volume: 0.7, muted: true },
    } as any;
    localStorage.setItem('neon_snake_profile', JSON.stringify(profile));
    const audio = new AudioSystem();
    await audio.init();
    const masterGain = (audio as any).masterGainNode as MockGainNode;
    expect(masterGain.gain.value).toBe(0);
    const genSpy = vi.spyOn(audio as any, 'generateProceduralSound');
    audio.play('eat');
    expect(genSpy).not.toHaveBeenCalled();
    genSpy.mockRestore();
  });

  test('resumeContext initializes and resumes suspended context', async () => {
    const audio = new AudioSystem();
    expect((audio as any).audioContext).toBeNull();
    await audio.resumeContext();
    expect((audio as any).audioContext).not.toBeNull();
    // Simulate suspended state
    (audio as any).audioContext.state = 'suspended';
    await audio.resumeContext();
    expect((audio as any).audioContext.resume).toHaveBeenCalled();
  });
});
