import type { Achievement, PlayerStats, GameSession } from '../types/progression';
import { PersistenceManager } from './Persistence';

export class AchievementSystem {
  static checkAchievements(stats: PlayerStats, session: GameSession, currentSnakeLength: number): string[] {
    const unlockedThisSession: string[] = [];

    // 1. First Food
    if (session.score >= 1) {
      if (PersistenceManager.unlockAchievement('FIRST_FOOD')) {
        unlockedThisSession.push('FIRST_FOOD');
      }
    }

    // 2. Score Milestones
    if (session.score >= 100) {
      if (PersistenceManager.unlockAchievement('SCORE_100')) {
        unlockedThisSession.push('SCORE_100');
      }
    }

    // 3. Longest Snake
    if (currentSnakeLength >= 20) {
      if (PersistenceManager.unlockAchievement('SNAKE_20')) {
        unlockedThisSession.push('SNAKE_20');
      }
    }

    // 4. Survival Time
    if (session.duration >= 60) {
      if (PersistenceManager.unlockAchievement('SURVIVAL_60')) {
        unlockedThisSession.push('SURVIVAL_60');
      }
    }

    return unlockedThisSession;
  }
}
