# Testing Strategy — Snake: Neon Evolution

## 1. Testing Philosophy & Quality Standard

"Snake: Neon Evolution" maintains high reliability and maintainability by adhering to:
- **100% Deterministic Unit Testing:** Game simulation tests use fixed PRNG seeds and mock clocks; zero flaky timing tests.
- **Strict TypeScript Assertions:** Tests do not bypass type checking with `any` or unchecked casts.
- **Behavior-Driven Assertions:** Tests verify domain rules (collisions, scoring formulas, migration) rather than internal private variables.

---

## 2. Test Pyramid & Tooling

```
      ▲
     / \     E2E / Browser Smoke Tests (Vite Build + Bundle Verification)
    /   \
   /-----\   Integration Tests (Engine + Timer Hook + Persistence + Achievements)
  /       \
 /---------\ Unit Tests (Pure Game Logic, PRNG, Direction Queue, Migrations)
```

- **Test Runner:** Vitest v5.1.1 (executed via Bun runtime or Vitest CLI).
- **DOM Simulation:** Happy-DOM / JSDOM for React component and hook testing.
- **Mocking:** Vitest native mocks (`vi.fn()`, `vi.useFakeTimers()`).

---

## 3. Test Suites & Coverage Scope

### 3.1 Unit Testing: Pure Core Engine (`tests/core/`)
- **Initial State:** Validates grid dimensions, snake head/tail spawn positions, and default score.
- **Movement Physics:** Validates 1-cell translation per tick across all 4 vector directions.
- **Input Queue Invariants:**
  - Enqueuing opposite direction is discarded.
  - Rapid double input (e.g. `UP` then `RIGHT` when moving `DOWN`) is queued and dequeued sequentially without self-collision.
  - Buffer overflow (more than 2 inputs) drops trailing inputs.
- **Collision Rules:**
  - Boundary checks for all 4 walls at $(0, y)$, $(\text{gridSize}-1, y)$, $(x, 0)$, $(x, \text{gridSize}-1)$.
  - Self-collision triggers game over.
  - Head moving into vacating tail segment does NOT collide when not eating food.
- **Food Spawning:**
  - Food never spawns on snake segments or obstacles.
  - Seedable PRNG produces identical food sequence for identical seeds.
  - Full-board condition gracefully enters victory state.

### 3.2 Unit Testing: Scoring & Progression (`tests/progression/`)
- Base food scoring ($10\text{ pts}$).
- Bonus food scoring ($50\text{ pts}$).
- Combo multiplier step scaling ($1.0\times \to 1.5\times \to 2.0\times \dots$).
- Combo expiration after window ticks.
- High score record updates.

### 3.3 Unit Testing: Persistence & Migration (`tests/systems/`)
- Empty storage defaults to initial profile.
- JSON serialization/deserialization integrity.
- Malformed JSON recovery without exception throws.
- V1 to V2 migration preserves historical scores while applying new schema fields.
- Duplicate achievement unlock prevention.
- Leaderboard sorting descending by score, tie-broken by date.

### 3.4 Integration Testing: Game Loop & Timer Hook (`tests/integration/`)
- Fixed timestep accumulation verifies that variable frame rates do not cause physics glitches.
- Pausing prevents tick updates and preserves accumulator state.
- Resuming continues smoothly from the exact accumulated fraction.
- Tab backgrounding (`document.hidden`) freezes ticks and prevents massive catch-up tick bursts.

### 3.5 UI Component Testing (`tests/ui/`)
- HUD accurately renders score, high score, and combo status.
- Modal dialogs open and close on respective state transitions (`PAUSED`, `GAME_OVER`).
- Settings modal correctly updates and persists volume/difficulty changes.

---

## 4. Test Execution & CI Automation Commands

```bash
# Run all unit and integration tests with Vitest
bunx vitest run

# Run tests in watch mode during development
bunx vitest

# Run with test coverage report
bunx vitest run --coverage

# Strict TypeScript type checking across source and tests
bun run typecheck
```
