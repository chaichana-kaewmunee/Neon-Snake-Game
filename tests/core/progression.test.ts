import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PersistenceManager } from '../../src/systems/Persistence';
import type { UserProfile } from '../../src/types/progression';
import { INITIAL_PROFILE } from '../../src/types/progression';
import { AchievementSystem } from '../../src/systems/AchievementSystem';

// Mock localStorage for Node environment
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
  configurable: true
});

describe('PersistenceManager', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should load default profile when storage is empty', () => {
    const profile = PersistenceManager.loadProfile();
    expect(profile).toEqual(INITIAL_PROFILE);
  });

  it('should save and load profile correctly', () => {
    const customProfile: UserProfile = {
      ...INITIAL_PROFILE,
      stats: { ...INITIAL_PROFILE.stats, highestScore: 500 },
    };
    PersistenceManager.saveProfile(customProfile);
    const loaded = PersistenceManager.loadProfile();
    expect(loaded.stats.highestScore).toBe(500);
  });

  it('should handle corrupted JSON gracefully', () => {
    localStorage.setItem('neon_snake_profile', 'invalid-json');
    const profile = PersistenceManager.loadProfile();
    expect(profile).toEqual(INITIAL_PROFILE);
  });

  it('should migrate old schema versions', () => {
    const oldProfile = { version: 0, stats: {} };
    localStorage.setItem('neon_snake_profile', JSON.stringify(oldProfile));
    const profile = PersistenceManager.loadProfile();
    expect(profile.version).toBe(1);
    expect(profile.stats).toEqual(INITIAL_PROFILE.stats);
  });

  it('should prevent duplicate achievements', () => {
    PersistenceManager.unlockAchievement('FIRST_FOOD');
    const firstUnlock = PersistenceManager.unlockAchievement('FIRST_FOOD');
    expect(firstUnlock).toBe(false);
  });

  it('should sort leaderboard by score descending', () => {
    PersistenceManager.addSession({ id: '1', date: 1, score: 10, duration: 1, snakeLength: 1 });
    PersistenceManager.addSession({ id: '2', date: 2, score: 100, duration: 1, snakeLength: 1 });
    PersistenceManager.addSession({ id: '3', date: 3, score: 50, duration: 1, snakeLength: 1 });

    const lb = PersistenceManager.getLeaderboard();
    const entry0 = lb[0];
    const entry1 = lb[1];
    const entry2 = lb[2];

    if (!entry0 || !entry1 || !entry2) throw new Error('Leaderboard should have at least 3 entries');

    expect(entry0.score).toBe(100);
    expect(entry1.score).toBe(50);
    expect(entry2.score).toBe(10);
  });
});

describe('AchievementSystem', () => {
  it('should trigger First Food achievement', () => {
    const stats = INITIAL_PROFILE.stats;
    const session = { id: '1', date: 1, score: 1, duration: 1, snakeLength: 1 };

    localStorage.clear();
    // Ensure the persistence manager hasn't already unlocked it.
    // We must explicitly set the profile to be empty/default.
    PersistenceManager.saveProfile({
      ...INITIAL_PROFILE,
      achievements: []
    });

    const unlocked = AchievementSystem.checkAchievements(stats, session, 1);
    expect(unlocked).toContain('FIRST_FOOD');
  });

  it('should not trigger achievement twice', () => {
    const stats = INITIAL_PROFILE.stats;
    const session = { id: '1', date: 1, score: 1, duration: 1, snakeLength: 1 };

    localStorage.clear();
    AchievementSystem.checkAchievements(stats, session, 1);
    const secondCheck = AchievementSystem.checkAchievements(stats, session, 1);
    expect(secondCheck).not.toContain('FIRST_FOOD');
  });
});
