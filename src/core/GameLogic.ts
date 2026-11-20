import type { Point, Direction, GameState } from '../types';
import { CONSTANTS } from '../types';
import type { Food, FoodType } from '../types/gameplay';
import { PRNG } from './PRNG';

export class GameLogic {
  /**
   * Creates a fresh initial state.
   */
  static createInitialState(gridSize: number = CONSTANTS.GRID_SIZE): GameState {
    const initialSnake: Point[] = [
      { x: Math.floor(gridSize / 2), y: Math.floor(gridSize / 2) },
      { x: Math.floor(gridSize / 2), y: Math.floor(gridSize / 2) + 1 },
      { x: Math.floor(gridSize / 2), y: Math.floor(gridSize / 2) + 2 },
    ];

    return {
      snake: initialSnake,
      food: this.generateFood(initialSnake, gridSize).position,
      direction: CONSTANTS.INITIAL_DIRECTION,
      score: 0,
      status: 'IDLE',
      gridSize,
    };
  }

  /**
   * Generates food at a random position not occupied by the snake.
   * Uses deterministic PRNG if provided, with seed-based fallback.
   */
  static generateFood(
    snake: Point[],
    gridSize: number,
    type: FoodType = 'NORMAL',
    prngOrSeed?: PRNG | number
  ): Food {
    const isOccupied = (p: Point) => snake.some(s => s.x === p.x && s.y === p.y);

    let prng: PRNG;
    if (prngOrSeed instanceof PRNG) {
      prng = prngOrSeed;
    } else if (typeof prngOrSeed === 'number') {
      prng = new PRNG(prngOrSeed);
    } else {
      prng = new PRNG(Date.now());
    }

    // Collect all unoccupied coordinates
    const availablePoints: Point[] = [];
    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        const candidate = { x, y };
        if (!isOccupied(candidate)) {
          availablePoints.push(candidate);
        }
      }
    }

    if (availablePoints.length === 0) {
      throw new Error('FULL_BOARD');
    }

    const randomIndex = prng.nextInt(0, availablePoints.length - 1);
    const pos = availablePoints[randomIndex]!;

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

      const isVictory = newSnake.length >= state.gridSize * state.gridSize;

      return {
        ...state,
        snake: newSnake,
        score: state.score + pointsAdded,
        direction: nextDirection,
        status: isVictory ? 'VICTORY' : state.status,
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
   * Validates if a direction change is legal (not reversing 180 degrees).
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
