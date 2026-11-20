export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlockedAt?: number;
}

export interface PlayerStats {
  totalGames: number;
  highestScore: number;
  totalFoodEaten: number;
  longestSnake: number;
  totalPlayTime: number; // in seconds
}

export interface GameSession {
  id: string;
  date: number;
  score: number;
  duration: number;
  snakeLength: number;
}

export interface LeaderboardEntry {
  name: string;
  score: number;
  date: number;
}

export interface PlayerSettings {
  difficulty: 'EASY' | 'NORMAL' | 'HARD' | 'CUSTOM';
  customTickRate?: number;
  volume: number;
  muted: boolean;
}

export interface UserProfile {
  version: number;
  stats: PlayerStats;
  achievements: string[]; // Array of Achievement IDs
  history: GameSession[];
  settings: PlayerSettings;
}

export const INITIAL_PROFILE: UserProfile = {
  version: 1,
  stats: {
    totalGames: 0,
    highestScore: 0,
    totalFoodEaten: 0,
    longestSnake: 0,
    totalPlayTime: 0,
  },
  achievements: [],
  history: [],
  settings: {
    difficulty: 'NORMAL',
    volume: 0.7,
    muted: false,
  },
};

export const ACHIEVEMENTS_DEFINITIONS: Record<string, Omit<Achievement, 'unlockedAt'>> = {
  'FIRST_FOOD': {
    id: 'FIRST_FOOD',
    title: 'First Bite',
    description: 'Eat your first piece of food.',
  },
  'SCORE_100': {
    id: 'SCORE_100',
    title: 'Centurion',
    description: 'Reach a score of 100.',
  },
  'SNAKE_20': {
    id: 'SNAKE_20',
    title: 'Long Boy',
    description: 'Reach a snake length of 20.',
  },
  'SURVIVAL_60': {
    id: 'SURVIVAL_60',
    title: 'Survivor',
    description: 'Survive for 60 seconds.',
  },
  'PERFECT_START': {
    id: 'PERFECT_START',
    title: 'Perfect Start',
    description: 'Eat 5 pieces of food without changing direction.',
  },
};
