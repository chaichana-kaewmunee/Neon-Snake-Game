import type { UserProfile, PlayerStats, GameSession, LeaderboardEntry } from '../types/progression';
import { INITIAL_PROFILE } from '../types/progression';

export class PersistenceManager {
  private static STORAGE_KEY = 'neon_snake_profile';

  static saveProfile(profile: UserProfile): void {
    try {
      const serialized = JSON.stringify(profile);
      localStorage.setItem(this.STORAGE_KEY, serialized);
    } catch (e) {
      console.error('Failed to save profile to localStorage', e);
    }
  }

  static loadProfile(): UserProfile {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) return INITIAL_PROFILE;

      const parsed = JSON.parse(data);
      return this.validateAndMigrate(parsed);
    } catch (e) {
      console.error('Failed to load profile, returning default', e);
      return INITIAL_PROFILE;
    }
  }

  private static validateAndMigrate(data: any): UserProfile {
    // Basic validation: Ensure it's an object and has a version
    if (!data || typeof data !== 'object' || typeof data.version !== 'number') {
      return INITIAL_PROFILE;
    }

    // Migration Logic
    let profile = { ...data };
    if (profile.version < 1) {
      // Future migrations go here
      profile.version = 1;
    }

    // Ensure all required fields exist (defensive programming)
    return {
      version: profile.version,
      stats: { ...INITIAL_PROFILE.stats, ...profile.stats },
      achievements: Array.isArray(profile.achievements) ? profile.achievements : [],
      history: Array.isArray(profile.history) ? profile.history : [],
      settings: { ...INITIAL_PROFILE.settings, ...profile.settings },
    };
  }

  static updateStats(stats: Partial<PlayerStats>): void {
    const profile = this.loadProfile();
    const newStats = { ...profile.stats, ...stats };

    // Ensure we only increase values (highestScore, totalGames, etc)
    newStats.totalGames = (profile.stats.totalGames || 0) + (stats.totalGames || 0);
    newStats.highestScore = Math.max(profile.stats.highestScore, stats.highestScore || 0);
    newStats.totalFoodEaten = (profile.stats.totalFoodEaten || 0) + (stats.totalFoodEaten || 0);
    newStats.longestSnake = Math.max(profile.stats.longestSnake, stats.longestSnake || 0);
    newStats.totalPlayTime = (profile.stats.totalPlayTime || 0) + (stats.totalPlayTime || 0);

    profile.stats = newStats;
    this.saveProfile(profile);
  }

  static addSession(session: GameSession): void {
    const profile = this.loadProfile();
    profile.history.unshift(session);
    // Keep only last 50 sessions
    profile.history = profile.history.slice(0, 50);
    this.saveProfile(profile);
  }

  static unlockAchievement(id: string): boolean {
    const profile = this.loadProfile();
    if (profile.achievements.includes(id)) return false;

    profile.achievements.push(id);
    this.saveProfile(profile);
    return true;
  }

  static getLeaderboard(limit: number = 10): LeaderboardEntry[] {
    const profile = this.loadProfile();
    return profile.history
      .map(s => ({
        name: 'Player', // Single player for now
        score: s.score,
        date: s.date,
      }))
      .sort((a, b) => b.score - a.score || b.date - a.date)
      .slice(0, limit);
  }
}
