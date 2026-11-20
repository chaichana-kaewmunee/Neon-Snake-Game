# System Architecture — Snake: Neon Evolution

## 1. System Overview & Boundaries

"Snake: Neon Evolution" is an advanced, high-performance browser-based arcade game engineered in TypeScript, React, HTML5 Canvas, and Web Audio API.

### 1.1 System Boundaries
- **Runtime Environment:** Modern evergreen web browsers (Chromium, Firefox, Safari) on Desktop and Mobile.
- **Client-Side Only:** 100% client-side execution; zero external backend, zero database, zero remote API reliance.
- **Storage Boundary:** Browser `window.localStorage` with strict schema validation and error fallback.
- **Audio Boundary:** In-memory procedural synthesis via browser `window.AudioContext` (zero external audio file requests).
- **Network Boundary:** No runtime network traffic required after initial static asset bundle delivery.

---

## 2. High-Level Architectural Pattern

The project implements a **Clean Unidirectional Architecture** separating pure game simulation from presentation, input, audio, and persistence:

```
┌────────────────────────────────────────────────────────────────────────┐
│                          React Presentation Layer                      │
│     (AppRoot, MainMenu, GameHUD, Modals, Settings, VirtualControls)    │
└───────────────┬────────────────────────────────────────▲───────────────┘
                │ Dispatches Commands                    │ Subscribes to Snapshots
┌───────────────▼────────────────────────────────────────┴───────────────┐
│                           Engine Bridge Subsystem                       │
│     (useGameLoop Hook, Frame Scheduler, Accumulator, Visibility)       │
└───────────────┬────────────────────────────────────────▲───────────────┘
                │ Fixed Timestep Ticks                   │ State Snapshots & Events
┌───────────────▼────────────────────────────────────────┴───────────────┐
│                          Pure Core Game Engine                          │
│     - State Machine (READY, PLAYING, PAUSED, GAME_OVER, VICTORY)        │
│     - Snake & Grid Matrix Math                                         │
│     - Collision Detection (Wall, Body, Obstacle)                       │
│     - Deterministic Food & Item Spawner (Seedable PRNG)                │
│     - Scoring & Multiplier Engine                                      │
└───────────────┬────────────────────────────────────────┬───────────────┘
                │ Snapshot Reads                         │ Event Subscriptions
┌───────────────▼──────────────┐         ┌───────────────▼───────────────┐
│     Canvas 2D Renderer       │         │        Audio Subsystem        │
│  - HiDPI Responsive Canvas   │         │  - Web Audio Procedural Synth │
│  - Neon Glow Shader Effects  │         │  - SFX Dispatcher             │
│  - Particle Effects System   │         │  - Volume & Mute Controller   │
└──────────────────────────────┘         └───────────────────────────────┘
                                         ┌───────────────────────────────┐
                                         │     Persistence Subsystem     │
                                         │  - LocalStorage Repository    │
                                         │  - Schema Migration & Guard   │
                                         │  - Leaderboard & Achievements │
                                         └───────────────────────────────┘
```

---

## 3. Layer Responsibilities & Module Separation

### 3.1 Pure Core Engine (`src/core/`)
- **Responsibility:** Owns game state, rule enforcement, collision physics, coordinate calculations, food spawning, and score calculations.
- **Purity Guarantee:** Strictly **zero imports** from React, DOM, Canvas, Web Audio, or LocalStorage. Completely headless and 100% deterministic given identical seed and inputs.
- **Output:** Emits immutable game state snapshots and lifecycle events (`FOOD_EATEN`, `SNAKE_COLLIDED`, `COMBO_STREAK`, `SPEED_INCREASED`, `GAME_COMPLETED`).

### 3.2 Renderer Subsystem (`src/renderer/`)
- **Responsibility:** Draws the game world on an HTML5 `<canvas>` using 2D rendering context.
- **Contract:** Read-only consumer of game state snapshots. Never alters game state directly.
- **Features:** HiDPI / Device Pixel Ratio scaling, dynamic grid sizing, neon glow effects (`shadowBlur`), particle explosions upon food consumption or death.

### 3.3 React Presentation Layer (`src/ui/`)
- **Responsibility:** Renders the application shell, HUD (score, combo, speed, timer), overlays (MainMenu, PauseModal, GameOverModal, SettingsModal, LeaderboardModal), and responsive touch controls.
- **Bridge:** Connects to the engine via a dedicated React hook (`useGameLoop`) that manages frame scheduling without re-rendering unnecessary DOM trees on every sub-tick.

### 3.4 Audio Subsystem (`src/systems/audio/`)
- **Responsibility:** Generates retro neon synthesized sound effects programmatically via Web Audio API oscillators and gain envelopes.
- **Contract:** Subscribes to engine events. Zero network requests or audio file dependencies.

### 3.5 Persistence Subsystem (`src/systems/persistence/`)
- **Responsibility:** Manages player profile, high scores, statistics, and achievement progress in `localStorage`.
- **Contract:** Uses schema validation with Zod/typed guards, automated schema version migration, and resilient fallback to default state on parse errors.

---

## 4. Module Dependencies & Dependency Inversion Rules

1. **Inward Dependency Rule:** Dependencies point inward toward the Core Engine.
   - UI depends on Engine interfaces.
   - Renderer depends on Engine state interfaces.
   - Audio depends on Engine event definitions.
   - Core Engine depends on **nothing** external.
2. **Circular Dependencies:** Absolutely forbidden. Checked during build via Vite/TypeScript.
3. **Typing Hygiene:** Strict mode enabled. No `any`, no implicit index lookups, and no unvalidated type assertions.

---

## 5. Data Flow & Event Architecture

```
User Input (Keyboard / Touch)
        │
        ▼
Input Buffer (Engine.queueDirection)
        │
        ▼
Fixed Timestep Tick (Engine.tick)
        │
        ├─────────────────────────────┬─────────────────────────────┐
        ▼                             ▼                             ▼
Next Immutable State          Engine Event Emitted          Render Loop
(Score, Snake, Food)          (Eat, Die, Combo)             (Canvas Redraw)
        │                             │
        ▼                             ├─────────────────────────────┐
React State Hook                      ▼                             ▼
(HUD, Overlays)               Audio Synth (SFX)             Persistence (Save)
```

1. **Input Dispatch:** Keyboard or touch events are validated and enqueued into a circular input buffer (maximum 2 commands deep to prevent reversing or dropped turns).
2. **Tick Execution:** Timestep accumulator triggers an engine tick at the active frequency (dependent on game difficulty and speed mode).
3. **State Distribution:** The engine evaluates collisions, updates coordinates, emits domain events, and provides the current immutable snapshot.
4. **Subscription Consumption:**
   - Canvas Renderer redraws the grid, snake, food, and particles.
   - Audio System plays procedural SFX corresponding to emitted events.
   - React UI updates HUD state and modal visibility.
   - Persistence updates high score and stats on game-over or session milestones.

---

## 6. Error Handling Strategy

1. **Invalid Engine Actions:** Ignored gracefully (e.g., immediate 180° reverse direction change is rejected; pause while game is in `READY` state is a no-op).
2. **Persistence Failures:** `localStorage` exceptions (`QuotaExceededError`, disabled storage in private browsing) are trapped with fallback to an in-memory mock store.
3. **Audio Context Suspended:** If the browser blocks Web Audio due to autoplay policy, the Audio System remains in an unmuted idle state and auto-resumes on the first registered user gesture (click, tap, keydown).
4. **Canvas Context Loss:** Canvas `contextrestored` and `contextlost` listeners are attached to recover gracefully without crashing the application.
