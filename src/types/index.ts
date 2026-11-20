export type Point = { x: number; y: number };

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export type GameStatus = 'IDLE' | 'PLAYING' | 'PAUSED' | 'GAMEOVER';

export interface GameState {
  snake: Point[];
  food: Point;
  direction: Direction;
  score: number;
  status: GameStatus;
  gridSize: number;
}

export interface GameConstants {
  INITIAL_SNAKE: Point[];
  INITIAL_DIRECTION: Direction;
  GRID_SIZE: number;
}

export const CONSTANTS: GameConstants = {
  INITIAL_SNAKE: [{ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 }],
  INITIAL_DIRECTION: 'UP',
  GRID_SIZE: 20,
};
