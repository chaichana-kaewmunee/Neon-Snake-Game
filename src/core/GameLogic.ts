import type { Point, Direction, GameState, GameStatus } from '../types';
import { CONSTANTS } from '../types';
import type { Food, FoodType } from '../types/gameplay';

export class GameLogic {
  /**
   * Creates a fresh initial state.
   */
  static createInitialState(): GameState {
    return {
      snake: [...CONSTANTS.INITIAL_SNAKE],
      food: this.generateFood(CONSTANTS.INITIAL_SNAKE, CONSTANTS.GRID_SIZE).position,
      direction: CONSTANTS.INITIAL_DIRECTION,
      score: 0,
      status: 'IDLE',
      gridSize: CONSTANTS.GRID_SIZE,
    };
  }

  /**
   * Generates food at a random position not occupied by the snake.
   * Uses a seed-based random if provided for determinism.
   */
  static generateFood(snake: Point[], gridSize: number, type: FoodType = 'NORMAL', seed?: number): Food {
    const isOccupied = (p: Point) => snake.some(s => s.x === p.x && s.y === p.y);

    let random = () => {
      if (seed === undefined) return Math.random();
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    let pos: Point;
    let attempts = 0;
    const maxAttempts = gridSize * gridSize;

    do {
      pos = {
        x: Math.floor(random() * gridSize),
        y: Math.floor(random() * gridSize),
      };
      attempts++;
      if (attempts > maxAttempts) {
        throw new Error('FULL_BOARD');
      }
    } while (isOccupied(pos));

    const food: Food = { position: pos, type };

    if (type === 'TEMPORARY') {
      food.expiresAt = 30; // Expires in 30 ticks
    }

    return food;
  }

  /**
   * Calculates the next state based on current state and a direction.
   */
  static update(state: GameState, nextDirection: Direction, food: Food): GameState {
    if (state.status !== 'PLAYING') {
      return state;
    }

    const head = state.snake[0];
    if (!head) {
      return { ...state, status: 'GAMEOVER' };
    }

    let newHead: Point;

    switch (nextDirection) {
      case 'UP':    newHead = { x: head.x, y: head.y - 1 }; break;
      case 'DOWN':  newHead = { x: head.x, y: head.y + 1 }; break;
      case 'LEFT':  newHead = { x: head.x - 1, y: head.y }; break;
      case 'RIGHT': newHead = { x: head.x + 1, y: head.y }; break;
      default: throw new Error('Invalid direction');
    }

    // 1. Wall Collision
    if (
      newHead.x < 0 || newHead.x >= state.gridSize ||
      newHead.y < 0 || newHead.y >= state.gridSize
    ) {
      return { ...state, status: 'GAMEOVER' };
    }

    // 2. Self Collision
    if (state.snake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
      return { ...state, status: 'GAMEOVER' };
    }

    // 3. Food Consumption
    if (newHead.x === food.position.x && newHead.y === food.position.y) {
      const newSnake = [newHead, ...state.snake];

      let pointsAdded = 1;
      if (food.type === 'BONUS') pointsAdded = 5;
      if (food.type === 'RARE') pointsAdded = 10;

      return {
        ...state,
        snake: newSnake,
        score: state.score + pointsAdded,
        direction: nextDirection,
      };
    }

    // 4. Regular Movement
    const newSnake = [newHead, ...state.snake.slice(0, -1)];
    return {
      ...state,
      snake: newSnake,
      direction: nextDirection,
    };
  }

  /**
   * Validates if a direction change is legal (not reversing).
   */
  static isLegalDirection(current: Direction, next: Direction): boolean {
    const opposites: Record<Direction, Direction> = {
      UP: 'DOWN',
      DOWN: 'UP',
      LEFT: 'RIGHT',
      RIGHT: 'LEFT',
    };
    return next !== opposites[current];
  }
}
