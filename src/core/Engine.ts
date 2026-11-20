import type { Food, FoodType, Difficulty } from '../types/gameplay';
import { DIFFICULTY_SETTINGS } from '../types/gameplay';
import type { Point, Direction, GameState, GameStatus, EngineEvent } from '../types';
import { GameLogic } from './GameLogic';
import { PRNG } from './PRNG';

export type EngineListener = (event: EngineEvent) => void;

export class Engine {
  private state: GameState;
  private inputQueue: Direction[] = [];
  private tickRate: number;
  private currentFood: Food;
  private combo: number = 0;
  private prng: PRNG;
  private listeners: Set<EngineListener> = new Set();
  private maxQueueSize: number = 2;

  constructor(difficulty: Difficulty = 'NORMAL', seed?: number, gridSize?: number) {
    this.prng = new PRNG(seed ?? Date.now());
    this.state = GameLogic.createInitialState(gridSize);
    this.tickRate = DIFFICULTY_SETTINGS[difficulty] ?? 150;
    this.currentFood = GameLogic.generateFood(this.state.snake, this.state.gridSize, 'NORMAL', this.prng);
  }

  getState(): GameState {
    return { ...this.state, food: this.currentFood.position };
  }

  getFood(): Food {
    return { ...this.currentFood };
  }

  getTickRate(): number {
    return this.tickRate;
  }

  setDifficulty(difficulty: Difficulty): void {
    this.tickRate = DIFFICULTY_SETTINGS[difficulty] ?? 150;
  }

  setStatus(status: GameStatus): void {
    const prevStatus = this.state.status;
    this.state = { ...this.state, status };
    if (prevStatus !== status) {
      this.emit({ type: 'STATUS_CHANGED', payload: { prevStatus, nextStatus: status } });
    }
  }

  pause(): void {
    if (this.state.status === 'PLAYING') {
      this.setStatus('PAUSED');
    }
  }

  resume(): void {
    if (this.state.status === 'PAUSED') {
      this.setStatus('PLAYING');
    }
  }

  addEventListener(listener: EngineListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit(event: EngineEvent): void {
    for (const listener of this.listeners) {
      listener(event);
    }
  }

  /**
   * Buffers direction changes preventing rapid multi-key reverse collisions.
   * Maximum queue depth is 2.
   */
  handleInput(direction: Direction): boolean {
    if (this.state.status !== 'PLAYING' && this.state.status !== 'IDLE' && this.state.status !== 'READY') {
      return false;
    }

    if (this.inputQueue.length >= this.maxQueueSize) {
      return false;
    }

    const currentDir = this.state.direction;
    const referenceDir = this.inputQueue[this.inputQueue.length - 1] ?? currentDir;

    if (GameLogic.isLegalDirection(referenceDir, direction)) {
      this.inputQueue.push(direction);
      return true;
    }

    return false;
  }

  tick(): void {
    if (this.state.status !== 'PLAYING') return;

    // Check if board was already saturated
    if (this.state.snake.length >= this.state.gridSize * this.state.gridSize) {
      this.state = { ...this.state, status: 'VICTORY' };
      this.emit({ type: 'VICTORY', payload: { score: this.state.score } });
      return;
    }

    const nextDir = this.inputQueue.shift() ?? this.state.direction;

    try {
      const previousScore = this.state.score;
      const nextState = GameLogic.update(this.state, nextDir, this.currentFood);

      if (nextState.status === 'VICTORY') {
        this.state = nextState;
        this.emit({ type: 'VICTORY', payload: { score: this.state.score } });
        return;
      }

      if (nextState.status === 'GAMEOVER' || nextState.status === 'GAME_OVER') {
        this.state = nextState;
        this.emit({ type: 'COLLIDED', payload: { score: this.state.score } });
        return;
      }

      this.state = nextState;

      // Food Eaten
      if (this.state.score > previousScore) {
        this.combo++;
        this.emit({ type: 'FOOD_EATEN', payload: { food: this.currentFood, combo: this.combo } });

        if (this.state.snake.length >= this.state.gridSize * this.state.gridSize) {
          this.state = { ...this.state, status: 'VICTORY' };
          this.emit({ type: 'VICTORY', payload: { score: this.state.score } });
          return;
        }

        this.currentFood = this.spawnSpecialFood();
      }

      // Handle expiring food
      if (this.currentFood.expiresAt !== undefined) {
        this.currentFood.expiresAt--;
        if (this.currentFood.expiresAt <= 0) {
          this.currentFood = this.spawnSpecialFood();
        }
      }

    } catch (error: unknown) {
      if (error instanceof Error && error.message === 'FULL_BOARD') {
        this.state = { ...this.state, status: 'VICTORY' };
        this.emit({ type: 'VICTORY', payload: { score: this.state.score } });
      } else {
        throw error;
      }
    }
  }

  private spawnSpecialFood(): Food {
    const roll = this.prng.next();
    let type: FoodType = 'NORMAL';

    if (roll < 0.05) type = 'RARE';
    else if (roll < 0.15) type = 'BONUS';
    else if (roll < 0.30) type = 'TEMPORARY';

    try {
      return GameLogic.generateFood(this.state.snake, this.state.gridSize, type, this.prng);
    } catch (e: unknown) {
      if (e instanceof Error && e.message === 'FULL_BOARD') {
        this.state = { ...this.state, status: 'VICTORY' };
        return { position: { x: -1, y: -1 }, type: 'NORMAL' };
      }
      throw e;
    }
  }

  reset(): void {
    this.state = GameLogic.createInitialState(this.state.gridSize);
    this.inputQueue = [];
    this.combo = 0;
    this.currentFood = GameLogic.generateFood(this.state.snake, this.state.gridSize, 'NORMAL', this.prng);
    this.emit({ type: 'STATUS_CHANGED', payload: { nextStatus: this.state.status } });
  }
}
