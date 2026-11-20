# Game Engine Specification — Snake: Neon Evolution

## 1. Engine Core Responsibilities & Invariants

The `GameEngine` class is the authoritative state machine for gameplay rules. It is headless, side-effect free, and deterministic.

### Invariants:
1. **Grid Boundedness:** All entity coordinates `(x, y)` reside within integer boundaries `[0, gridSize - 1]`.
2. **Single Step Invariant:** The snake moves exactly 1 cell per tick in the active direction.
3. **Body Continuity:** Segment `i` occupies the position segment `i - 1` occupied on the previous tick.
4. **Self-Intersection Invariant:** The snake cannot occupy the same coordinate twice; head colliding with any body segment triggers immediate `GAME_OVER`.
5. **No Reverse Direction:** An input directly opposite to current movement (`UP` vs `DOWN`, `LEFT` vs `RIGHT`) is rejected.

---

## 2. State Machine & Lifecycle

The engine operates under an explicit finite state machine with 5 discrete states:

```
          ┌─────────────┐
          │    READY    │ ◄───────────────────────────────┐
          └──────┬──────┘                                 │
                 │ START                                  │
                 ▼                                        │
          ┌─────────────┐            PAUSE                │
          │             ├──────────────────────────┐      │
          │   PLAYING   │                          │      │
          │             │ ◄────────────────────────┼───┐  │
          └───┬─────┬───┘            RESUME        │   │  │
              │     │                              ▼   │  │
   COLLISION  │     │ FULL BOARD             ┌─────────┴┐ │
              │     └──────────────┐         │  PAUSED  │ │
              ▼                    ▼         └──────────┘ │
       ┌─────────────┐      ┌─────────────┐               │
       │  GAME_OVER  │      │   VICTORY   │               │
       └──────┬──────┘      └──────┬──────┘               │
              │                    │                      │
              └────────────────────┴──────────────────────┘
                              RESET
```

### State Transitions Table

| Current State | Event Trigger | Next State | Allowed Actions |
| :--- | :--- | :--- | :--- |
| `READY` | `START` | `PLAYING` | Queue direction, start tick loop |
| `READY` | `RESET` | `READY` | Reset board, regenerate initial entities |
| `PLAYING` | `PAUSE` | `PAUSED` | Freeze ticks, preserve input buffer |
| `PLAYING` | `COLLIDE` | `GAME_OVER` | Stop ticks, emit `GAME_OVER` event, finalize score |
| `PLAYING` | `WIN` | `VICTORY` | Stop ticks, emit `VICTORY` event (board filled) |
| `PAUSED` | `RESUME` | `PLAYING` | Resume tick loop |
| `PAUSED` | `RESET` | `READY` | Reset board |
| `GAME_OVER` | `RESET` | `READY` | Re-initialize snake, food, score, input buffer |
| `VICTORY` | `RESET` | `READY` | Re-initialize snake, food, score, input buffer |

---

## 3. Data Models & Representation

```typescript
export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export interface Point {
  readonly x: number;
  readonly y: number;
}

export type EngineStatus = 'READY' | 'PLAYING' | 'PAUSED' | 'GAME_OVER' | 'VICTORY';

export interface SnakeSegment extends Point {
  readonly id: number; // Unique monotonic ID for stable rendering keys
}

export interface FoodEntity {
  readonly position: Point;
  readonly type: 'NORMAL' | 'BONUS' | 'RARE' | 'TEMPORARY';
  readonly points: number;
  readonly durationTicks?: number;
  readonly remainingTicks?: number;
}

export interface ObstacleEntity {
  readonly position: Point;
}

export interface EngineSnapshot {
  readonly status: EngineStatus;
  readonly snake: readonly SnakeSegment[];
  readonly direction: Direction;
  readonly food: readonly FoodEntity[];
  readonly obstacles: readonly ObstacleEntity[];
  readonly score: number;
  readonly combo: number;
  readonly multiplier: number;
  readonly tickCount: number;
  readonly gridSize: number;
  readonly speedMs: number;
}
```

---

## 4. Input Buffer & Direction Management

To prevent rapid keystroke race conditions (where pressing `RIGHT` then `DOWN` in under one tick frame could reverse into oneself), the engine maintains a **Strict Input Queue**:

- **Queue Capacity:** Maximum 2 pending directions.
- **Filtering Rules:**
  - If queue is empty, test candidate against current `snake.direction`.
  - If queue has 1 item, test candidate against the queued item.
  - If direction is equal or opposite (`isOpposite(a, b)`), reject immediately.
- **Consumption:** Exactly 1 direction is consumed at the start of each tick:
  ```typescript
  const nextDir = this.inputQueue.shift() ?? this.currentDirection;
  this.currentDirection = nextDir;
  ```

---

## 5. Deterministic Random Number Generator (PRNG)

To guarantee 100% reproducible game runs and test reliability, the engine does not call `Math.random()` directly. It uses a **Mulberry32** or **Linear Congruential Generator (LCG)**:

```typescript
export class PRNG {
  private seed: number;

  constructor(seed: number = Date.now()) {
    this.seed = seed;
  }

  next(): number {
    this.seed |= 0;
    this.seed = (this.seed + 0x6D2B79F5) | 0;
    let t = Math.imul(this.seed ^ (this.seed >>> 15), 1 | this.seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
}
```

---

## 6. Food Spawning & Board Saturation

1. **Occupancy Matrix:** Spawning queries all vacant coordinates:
   $$\text{Vacant} = \{ (x, y) \mid 0 \le x, y < \text{gridSize} \} \setminus (\text{Snake} \cup \text{Obstacles} \cup \text{ExistingFood})$$
2. **Full Board Victory Condition:**
   - If $\lvert \text{Vacant} \rvert = 0$, food cannot spawn.
   - If the snake occupies all reachable non-obstacle squares, the game enters `VICTORY` state immediately.
3. **Random Candidate Selection:**
   - Pick random index $k \in [0, \lvert \text{Vacant} \rvert - 1]$ using `PRNG.nextInt(0, Vacant.length - 1)`.

---

## 7. Tick Lifecycle Pipeline

On every invocation of `engine.tick()`:

1. **State Check:** If `status !== 'PLAYING'`, return immediately.
2. **Input Dequeue:** Resolve next direction.
3. **Head Coordinate Calculation:**
   - `UP`: $(x, y - 1)$
   - `DOWN`: $(x, y + 1)$
   - `LEFT`: $(x - 1, y)$
   - `RIGHT`: $(x + 1, y)$
4. **Collision Tests (Order Matters):**
   - **Wall Collision:** If $x < 0 \lor x \ge \text{gridSize} \lor y < 0 \lor y \ge \text{gridSize} \implies \text{Trigger GAME\_OVER}$.
   - **Obstacle Collision:** If head matches any obstacle position $\implies \text{Trigger GAME\_OVER}$.
   - **Self Collision:** If head matches any segment of current body (excluding tail if tail will vacate this turn and food was not eaten) $\implies \text{Trigger GAME\_OVER}$.
5. **Food Consumption & Growth:**
   - If head coordinates match a food item:
     - Consume food, add points multiplied by active streak multiplier.
     - Increment combo streak counter.
     - Emit `FOOD_CONSUMED` event.
     - Grow snake (do not pop tail segment).
     - Spawn replacement food.
   - Else:
     - Pop tail segment (maintain constant length).
6. **Temporary Food Expiration:**
   - Decrement `remainingTicks` on all timed food items.
   - If `remainingTicks <= 0`, despawn food and emit `FOOD_EXPIRED` event.
7. **Combo Decay:**
   - If no food is consumed within $N$ ticks, reset combo multiplier to 1.
8. **Tick Increment:** `tickCount++`.
