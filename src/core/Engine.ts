import type { Food, FoodType, Difficulty } from '../types/gameplay';
import { DIFFICULTY_SETTINGS } from '../types/gameplay';
import type { Point, Direction, GameState } from '../types';
import { GameLogic } from './GameLogic';

export class Engine {
  private state: GameState;
  private inputQueue: Direction[] = [];
  private tickRate: number;
  private currentFood: Food;
  private combo: number = 0;

  constructor(difficulty: Difficulty = 'NORMAL') {
    this.state = GameLogic.createInitialState();
    this.tickRate = DIFFICULTY_SETTINGS[difficulty];
    this.currentFood = GameLogic.generateFood(this.state.snake, this.state.gridSize);
  }

  getState(): GameState {
    return { ...this.state, food: this.currentFood.position };
  }

  setStatus(status: GameState['status']) {
    this.state = { ...this.state, status };
  }

  handleInput(direction: Direction) {
    const currentDir = this.state.direction;
    const lastQueued = this.inputQueue[this.inputQueue.length - 1] || currentDir;
    if (GameLogic.isLegalDirection(lastQueued, direction)) {
      this.inputQueue.push(direction);
    }
  }

  tick() {
    if (this.state.status !== 'PLAYING') return;

    const nextDir = this.inputQueue.shift() || this.state.direction;

    try {
      const previousScore = this.state.score;
      this.state = GameLogic.update(this.state, nextDir, this.currentFood);

      if (this.state.score > previousScore) {
        this.combo++;
        this.currentFood = this.spawnSpecialFood();
      }

      if (this.currentFood.expiresAt !== undefined) {
        this.currentFood.expiresAt--;
        if (this.currentFood.expiresAt <= 0) {
          this.currentFood = this.spawnSpecialFood();
        }
      }

    } catch (e: any) {
      if (e.message === 'FULL_BOARD') {
        this.state = { ...this.state, status: 'GAMEOVER' };
      } else {
        throw e;
      }
    }
  }

  private spawnSpecialFood(): Food {
    const roll = Math.random();
    let type: FoodType = 'NORMAL';

    if (roll < 0.05) type = 'RARE';
    else if (roll < 0.15) type = 'BONUS';
    else if (roll < 0.30) type = 'TEMPORARY';

    return GameLogic.generateFood(this.state.snake, this.state.gridSize, type);
  }

  reset() {
    this.state = GameLogic.createInitialState();
    this.inputQueue = [];
    this.combo = 0;
    this.currentFood = GameLogic.generateFood(this.state.snake, this.state.gridSize);
  }
}
