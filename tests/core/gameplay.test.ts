import { describe, it, expect } from 'vitest';
import { GameLogic } from '../../src/core/GameLogic';
import { Engine } from '../../src/core/Engine';
import { FoodTypes } from '../../src/types/gameplay';

describe('Advanced Gameplay Systems', () => {
  it('should award bonus points for bonus food', () => {
    const state = GameLogic.createInitialState();
    const food = { position: { x: 10, y: 9 }, type: FoodTypes.BONUS };
    const playingState = { ...state, status: 'PLAYING' as any };

    const nextState = GameLogic.update(playingState, 'UP', food);
    expect(nextState.score).toBe(5);
  });

  it('should award rare points for rare food', () => {
    const state = GameLogic.createInitialState();
    const food = { position: { x: 10, y: 9 }, type: FoodTypes.RARE };
    const playingState = { ...state, status: 'PLAYING' as any };

    const nextState = GameLogic.update(playingState, 'UP', food);
    expect(nextState.score).toBe(10);
  });

  it('should handle temporary food expiration in logic', () => {
    const tempFood = GameLogic.generateFood([{x:0,y:0}, {x:0,y:1}], 20, 'TEMPORARY');
    expect(tempFood.expiresAt).toBe(30);
  });

  it('should spawn food outside the snake', () => {
    const snake = [{x: 0, y: 0}, {x: 1, y: 0}, {x: 2, y: 0}];
    const food = GameLogic.generateFood(snake, 20);
    const isInside = snake.some(s => s.x === food.position.x && s.y === food.position.y);
    expect(isInside).toBe(false);
  });
});
