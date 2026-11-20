import { describe, it, expect, beforeEach } from 'vitest';
import { GameLogic } from '../../src/core/GameLogic';
import { Engine } from '../../src/core/Engine';
import { CONSTANTS } from '../../src/types';

describe('GameLogic', () => {
  it('should create initial state correctly', () => {
    const state = GameLogic.createInitialState();
    expect(state.score).toBe(0);
    expect(state.status).toBe('IDLE');
    expect(state.snake).toEqual(CONSTANTS.INITIAL_SNAKE);
  });

  it('should move the snake forward', () => {
    const state = GameLogic.createInitialState();
    const playingState = { ...state, status: 'PLAYING' as any };
    const food = { position: {x: 0, y: 0}, type: 'NORMAL' as any };
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
      status: 'PLAYING' as any,
      snake: [{ x: 0, y: 0 }]
    };
    const food = { position: {x: 5, y: 5}, type: 'NORMAL' as any };
    const nextState = GameLogic.update(atWallState, 'LEFT', food);
    expect(nextState.status).toBe('GAMEOVER');
  });

  it('should handle self collision', () => {
    const state = GameLogic.createInitialState();
    const collidingState = {
      ...state,
      status: 'PLAYING' as any,
      snake: [
        { x: 5, y: 5 },
        { x: 6, y: 5 },
        { x: 6, y: 6 },
        { x: 5, y: 6 },
        { x: 5, y: 5 } // head overlaps tail
      ]
    };
    const state2 = {
        ...state,
        status: 'PLAYING' as any,
        snake: [{x:10,y:10}, {x:11,y:10}, {x:11,y:11}, {x:10,y:11}]
    };
    const food = { position: {x: 0, y: 0}, type: 'NORMAL' as any };
    const result = GameLogic.update(state2, 'DOWN', food);
    expect(result.status).toBe('GAMEOVER');
  });

  it('should consume food and grow', () => {
    const state = GameLogic.createInitialState();
    const foodPos = { x: 10, y: 9 };
    const food = { position: foodPos, type: 'NORMAL' as any };
    const stateWithFood = { ...state, status: 'PLAYING' as any, food: foodPos };

    const nextState = GameLogic.update(stateWithFood, 'UP', food);
    expect(nextState.score).toBe(1);
    expect(nextState.snake.length).toBe(state.snake.length + 1);
  });

  it('should prevent reverse movement', () => {
    expect(GameLogic.isLegalDirection('UP', 'DOWN')).toBe(false);
    expect(GameLogic.isLegalDirection('UP', 'LEFT')).toBe(true);
  });

  it('should handle full board condition', () => {
    const snake: {x: number, y: number}[] = [];
    for(let x=0; x<20; x++) {
        for(let y=0; y<20; y++) {
            snake.push({x, y});
        }
    }
    expect(() => GameLogic.generateFood(snake, 20)).toThrow('FULL_BOARD');
  });
});

describe('Engine', () => {
  let engine: Engine;

  beforeEach(() => {
    engine = new Engine();
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

  it('should ignore illegal queued directions', () => {
    engine.setStatus('PLAYING');
    engine.handleInput('DOWN');
    engine.tick();
    expect(engine.getState().direction).toBe('UP');
  });

  it('should reset state', () => {
    engine.setStatus('PLAYING');
    engine.handleInput('LEFT');
    engine.tick();
    engine.reset();
    expect(engine.getState().status).toBe('IDLE');
    expect(engine.getState().direction).toBe(CONSTANTS.INITIAL_DIRECTION);
  });
});
