import { describe, it, expect, beforeEach } from 'vitest';
import { GameLogic } from '../../src/core/GameLogic';
import { Engine } from '../../src/core/Engine';
import { PRNG } from '../../src/core/PRNG';
import { CONSTANTS } from '../../src/types';

describe('GameLogic', () => {
  it('should create initial state correctly with default or custom grid size', () => {
    const state = GameLogic.createInitialState();
    expect(state.score).toBe(0);
    expect(state.status).toBe('IDLE');
    expect(state.gridSize).toBe(CONSTANTS.GRID_SIZE);

    const customState = GameLogic.createInitialState(16);
    expect(customState.gridSize).toBe(16);
    expect(customState.snake.length).toBe(3);
  });

  it('should move the snake forward', () => {
    const state = GameLogic.createInitialState();
    const playingState = { ...state, status: 'PLAYING' as const };
    const food = { position: { x: 0, y: 0 }, type: 'NORMAL' as const };
    const nextState = GameLogic.update(playingState, 'UP', food);

    const head = nextState.snake[0];
    const oldHead = state.snake[0];
    if (!head || !oldHead) throw new Error('Snake head missing');
    expect(head.y).toBe(oldHead.y - 1);
    expect(head.x).toBe(oldHead.x);
  });

  it('should handle wall collision', () => {
    const state = GameLogic.createInitialState();
    const atWallState = {
      ...state,
      status: 'PLAYING' as const,
      snake: [{ x: 0, y: 0 }],
    };
    const food = { position: { x: 5, y: 5 }, type: 'NORMAL' as const };
    const nextState = GameLogic.update(atWallState, 'LEFT', food);
    expect(nextState.status).toBe('GAMEOVER');
  });

  it('should handle self collision', () => {
    const state = GameLogic.createInitialState();
    const state2 = {
      ...state,
      status: 'PLAYING' as const,
      snake: [{ x: 10, y: 10 }, { x: 11, y: 10 }, { x: 11, y: 11 }, { x: 10, y: 11 }],
    };
    const food = { position: { x: 0, y: 0 }, type: 'NORMAL' as const };
    const result = GameLogic.update(state2, 'DOWN', food);
    expect(result.status).toBe('GAMEOVER');
  });

  it('should consume food and grow', () => {
    const state = GameLogic.createInitialState();
    const foodPos = { x: state.snake[0]!.x, y: state.snake[0]!.y - 1 };
    const food = { position: foodPos, type: 'NORMAL' as const };
    const stateWithFood = { ...state, status: 'PLAYING' as const, food: foodPos };

    const nextState = GameLogic.update(stateWithFood, 'UP', food);
    expect(nextState.score).toBe(1);
    expect(nextState.snake.length).toBe(state.snake.length + 1);
  });

  it('should prevent reverse movement', () => {
    expect(GameLogic.isLegalDirection('UP', 'DOWN')).toBe(false);
    expect(GameLogic.isLegalDirection('DOWN', 'UP')).toBe(false);
    expect(GameLogic.isLegalDirection('LEFT', 'RIGHT')).toBe(false);
    expect(GameLogic.isLegalDirection('RIGHT', 'LEFT')).toBe(false);
    expect(GameLogic.isLegalDirection('UP', 'LEFT')).toBe(true);
    expect(GameLogic.isLegalDirection('UP', 'RIGHT')).toBe(true);
  });

  it('should handle full board condition', () => {
    const snake: { x: number; y: number }[] = [];
    for (let x = 0; x < 20; x++) {
      for (let y = 0; y < 20; y++) {
        snake.push({ x, y });
      }
    }
    expect(() => GameLogic.generateFood(snake, 20)).toThrow('FULL_BOARD');
  });
});

describe('PRNG Determinism (AC-P2-03)', () => {
  it('should produce identical numbers for identical seeds', () => {
    const prng1 = new PRNG(42);
    const prng2 = new PRNG(42);

    const sequence1 = [prng1.next(), prng1.next(), prng1.next()];
    const sequence2 = [prng2.next(), prng2.next(), prng2.next()];

    expect(sequence1).toEqual(sequence2);
  });

  it('should produce identical food locations for identical seeds', () => {
    const snake = [{ x: 5, y: 5 }, { x: 5, y: 6 }, { x: 5, y: 7 }];
    const food1 = GameLogic.generateFood(snake, 20, 'NORMAL', 9999);
    const food2 = GameLogic.generateFood(snake, 20, 'NORMAL', 9999);

    expect(food1.position).toEqual(food2.position);
  });
});

describe('Engine State Machine & Direction Buffer (AC-P2-02, AC-P2-04)', () => {
  let engine: Engine;

  beforeEach(() => {
    engine = new Engine('NORMAL', 12345);
  });

  it('should support pause and resume transitions', () => {
    engine.setStatus('PLAYING');
    expect(engine.getState().status).toBe('PLAYING');

    engine.pause();
    expect(engine.getState().status).toBe('PAUSED');

    // Ticks while paused should be no-ops
    const beforeTick = engine.getState();
    engine.tick();
    expect(engine.getState()).toEqual(beforeTick);

    engine.resume();
    expect(engine.getState().status).toBe('PLAYING');
  });

  it('should queue multiple direction changes', () => {
    engine.setStatus('PLAYING');
    engine.handleInput('LEFT');
    engine.handleInput('UP');

    engine.tick();
    expect(engine.getState().direction).toBe('LEFT');

    engine.tick();
    expect(engine.getState().direction).toBe('UP');
  });

  it('should limit input queue to maximum of 2 to prevent stale buffer lag', () => {
    engine.setStatus('PLAYING');
    expect(engine.handleInput('LEFT')).toBe(true);
    expect(engine.handleInput('UP')).toBe(true);
    // Third direction should be rejected
    expect(engine.handleInput('RIGHT')).toBe(false);
  });

  it('should ignore illegal queued directions', () => {
    engine.setStatus('PLAYING');
    engine.handleInput('DOWN');
    engine.tick();
    expect(engine.getState().direction).toBe('UP');
  });

  it('should reset state cleanly', () => {
    engine.setStatus('PLAYING');
    engine.handleInput('LEFT');
    engine.tick();
    engine.reset();
    expect(engine.getState().status).toBe('IDLE');
    expect(engine.getState().direction).toBe(CONSTANTS.INITIAL_DIRECTION);
  });

  it('should trigger VICTORY event when board is filled (AC-P2-06)', () => {
    const smallEngine = new Engine('EASY', 42, 4); // 4x4 grid = 16 cells
    const fullSnake: { x: number; y: number }[] = [];
    for (let x = 0; x < 4; x++) {
      for (let y = 0; y < 4; y++) {
        fullSnake.push({ x, y });
      }
    }

    let victoryEmitted = false;
    smallEngine.addEventListener((e) => {
      if (e.type === 'VICTORY') victoryEmitted = true;
    });

    // Simulate board full
    (smallEngine as any).state.snake = fullSnake;
    (smallEngine as any).state.score = 100;
    (smallEngine as any).state.status = 'PLAYING';
    smallEngine.tick();

    expect(smallEngine.getState().status).toBe('VICTORY');
    expect(victoryEmitted).toBe(true);
  });
});
