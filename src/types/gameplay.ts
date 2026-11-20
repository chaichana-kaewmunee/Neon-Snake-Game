import type { Point } from './index';

export type Difficulty = 'EASY' | 'NORMAL' | 'HARD' | 'CUSTOM';

export type FoodType = 'NORMAL' | 'BONUS' | 'TEMPORARY' | 'RARE';

export interface Food {
  position: Point;
  type: FoodType;
  expiresAt?: number; // Tick count
}

export type GameMode = 'CLASSIC' | 'TIME_ATTACK' | 'CHALLENGE';

export interface GameConfig {
  difficulty: Difficulty;
  mode: GameMode;
  tickRate: number;
  customTickRate?: number;
}

export const DIFFICULTY_SETTINGS: Record<Difficulty, number> = {
  EASY: 200,
  NORMAL: 150,
  HARD: 100,
  CUSTOM: 150,
};

export const FoodTypes = {
  NORMAL: 'NORMAL' as FoodType,
  BONUS: 'BONUS' as FoodType,
  TEMPORARY: 'TEMPORARY' as FoodType,
  RARE: 'RARE' as FoodType,
};
