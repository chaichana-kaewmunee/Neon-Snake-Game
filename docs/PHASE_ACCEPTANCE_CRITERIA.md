# Phase Acceptance Criteria — Snake: Neon Evolution

This document defines the strict, measurable criteria required to pass each development phase. A phase cannot be marked **PASS** without verified empirical command evidence for every acceptance requirement.

---

## Phase 1 — Architecture & Game Specification

| Requirement ID | Description | Expected Behavior | Verification Method | Evidence Required | Phase Owner |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `AC-P1-01` | System Architecture Documented | Comprehensive system boundaries, layer responsibilities, data and event flow documented. | Document review of `docs/SYSTEM_ARCHITECTURE.md`. | Verified file in `docs/`. | Phase 1 |
| `AC-P1-02` | Game Engine Specification Complete | State machine, lifecycle transitions, grid math, and PRNG rules fully specified. | Document review of `docs/GAME_ENGINE_SPECIFICATION.md`. | Verified file in `docs/`. | Phase 1 |
| `AC-P1-03` | Gameplay Specification Complete | Scoring, difficulty tick curves, special foods, and game modes specified with proposed defaults. | Document review of `docs/GAMEPLAY_SPECIFICATION.md`. | Verified file in `docs/`. | Phase 1 |
| `AC-P1-04` | UI/UX & Controls Specified | Screen hierarchy, HUD, modals, keyboard/touch controls, and design tokens specified. | Document review of `docs/UI_UX_SPECIFICATION.md`. | Verified file in `docs/`. | Phase 1 |
| `AC-P1-05` | Procedural Audio Architecture Specified | Web Audio API oscillator synthesis, ADSR envelopes, SFX catalog, and autoplay compliance documented. | Document review of `docs/AUDIO_SPECIFICATION.md`. | Verified file in `docs/`. | Phase 1 |
| `AC-P1-06` | Persistence Model Specified | Storage schema V2, migration pipeline, error handling, and stats models specified. | Document review of `docs/PERSISTENCE_SPECIFICATION.md`. | Verified file in `docs/`. | Phase 1 |
| `AC-P1-07` | Testing Strategy Formulated | Unit, integration, mock timer, and regression strategy documented. | Document review of `docs/TESTING_STRATEGY.md`. | Verified file in `docs/`. | Phase 1 |
| `AC-P1-08` | Phase Acceptance Criteria Formalized | Measurable criteria established for Phases 1–8. | Document review of `docs/PHASE_ACCEPTANCE_CRITERIA.md`. | Verified file in `docs/`. | Phase 1 |
| `AC-P1-09` | Existing Code Reconciliation Completed | Existing prototype audited, problem areas cataloged, and mapped to target phases. | Audit table in Phase 1 Report. | Documented reconciliation matrix. | Phase 1 |
| `AC-P1-10` | Zero Source Code Mutation | Source code (`src/`), existing tests (`tests/`), and package dependencies left untouched. | `git status` check confirming no modified code files. | Clean git working tree diff. | Phase 1 |

---

## Phase 2 — Core Game Engine

| Requirement ID | Description | Expected Behavior | Verification Method | Evidence Required | Phase Owner |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `AC-P2-01` | Headless Engine Extraction | Engine has zero React, DOM, Canvas, or Audio imports. | Code audit & TypeScript compiler check. | File import analysis. | Phase 2 |
| `AC-P2-02` | State Machine Transitions | Valid transitions (`READY` $\to$ `PLAYING` $\to$ `PAUSED` $\to$ `GAME_OVER` / `VICTORY`) enforced. | Vitest state machine tests. | Passing test report. | Phase 2 |
| `AC-P2-03` | Deterministic PRNG | Food coordinates are 100% reproducible given a fixed seed. | Vitest seed generation tests. | Passing test report. | Phase 2 |
| `AC-P2-04` | Direction Buffer Safety | Rapid multi-key inputs prevent reverse self-collisions. | Vitest input queue tests. | Passing test report. | Phase 2 |
| `AC-P2-05` | Dynamic Grid Scaling | Engine handles arbitrary grid sizes ($10 \times 10$ to $40 \times 40$). | Vitest grid dimension tests. | Passing test report. | Phase 2 |
| `AC-P2-06` | Full Board Victory Condition | Board saturation triggers victory state without infinite loop. | Vitest saturation test. | Passing test report. | Phase 2 |

---

## Phase 3 — Rendering & User Interface

| Requirement ID | Description | Expected Behavior | Verification Method | Evidence Required | Phase Owner |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `AC-P3-01` | HiDPI Canvas Scaling | Canvas scales by `window.devicePixelRatio` without blurry pixels. | Renderer inspection & test. | Render snapshot test. | Phase 3 |
| `AC-P3-02` | Responsive Viewport | Canvas resizes responsively while preserving 1:1 aspect ratio. | Resize event test. | Component test report. | Phase 3 |
| `AC-P3-03` | Component Modularization | Break down `main.tsx` into modular React components (`HUD`, `Modals`, `Canvas`). | Code audit. | File structure review. | Phase 3 |
| `AC-P3-04` | External CSS Design System | Replace inline styles with modular CSS tokens. | Code audit & build check. | CSS asset in bundle. | Phase 3 |
| `AC-P3-05` | Neon Glow & Visual Polish | Glowing snake head/body, animated food, and subtle grid lines rendered. | Visual/canvas context inspection. | Render draw calls verified. | Phase 3 |

---

## Phase 4 — Gameplay Systems

| Requirement ID | Description | Expected Behavior | Verification Method | Evidence Required | Phase Owner |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `AC-P4-01` | Special Food Behaviors | Bonus, Rare, and Temporary foods implement correct points, timers, and effects. | Vitest gameplay tests. | Passing test report. | Phase 4 |
| `AC-P4-02` | Combo Multiplier Engine | Consecutive food within window increments multiplier up to $4.0\times$. | Vitest combo math tests. | Passing test report. | Phase 4 |
| `AC-P4-03` | Obstacle Matrix Collision | Obstacles spawn in safe zones and trigger collision death. | Vitest obstacle tests. | Passing test report. | Phase 4 |
| `AC-P4-04` | Game Modes Implemented | Classic, Time Attack (60s timer), and Challenge modes fully functional. | Vitest mode logic tests. | Passing test report. | Phase 4 |

---

## Phase 5 — Progression & Persistence

| Requirement ID | Description | Expected Behavior | Verification Method | Evidence Required | Phase Owner |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `AC-P5-01` | Schema V2 Implementation | Player profile, stats, leaderboard, and settings conform to Schema V2. | Vitest schema validation tests. | Passing test report. | Phase 5 |
| `AC-P5-02` | Automated Migration | Legacy V1 data automatically upgrades to V2 on load without data loss. | Vitest migration tests. | Passing test report. | Phase 5 |
| `AC-P5-03` | Leaderboard View | Local top 10 scores display correct rank, score, mode, and date. | Component test. | UI snapshot / test log. | Phase 5 |
| `AC-P5-04` | Statistics Tracking View | Lifetime games, food, max combo, and playtime display accurately. | Component test. | UI snapshot / test log. | Phase 5 |
| `AC-P5-05` | Achievement Notifications | Unlocking an achievement triggers a neon toast notification. | Event & UI test. | UI notification test log. | Phase 5 |

---

## Phase 6 — UX, Audio & Accessibility

| Requirement ID | Description | Expected Behavior | Verification Method | Evidence Required | Phase Owner |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `AC-P6-01` | Procedural Audio Synthesizer | All SFX (`eat`, `bonus`, `rare`, `die`, `combo`, `click`) synthesize via Web Audio. | Audio mock & browser tests. | Zero network audio requests. | Phase 6 |
| `AC-P6-02` | Autoplay Compliance | AudioContext unlocks cleanly on initial user gesture without console warnings. | Event interaction test. | AudioContext state log. | Phase 6 |
| `AC-P6-03` | Volume & Mute Controls | Master, SFX, and Mute toggles adjust gain nodes immediately. | Vitest audio gain tests. | Passing test report. | Phase 6 |
| `AC-P6-04` | Touch Controls & Gestures | Virtual D-pad and swipe gestures function smoothly on touch viewports. | Touch event simulation tests. | Input handler test report. | Phase 6 |
| `AC-P6-05` | Accessibility Standards | Full keyboard navigation, visible focus rings, and ARIA score announcements. | DOM accessibility audit. | A11y checklist verified. | Phase 6 |

---

## Phase 7 — Quality Assurance

| Requirement ID | Description | Expected Behavior | Verification Method | Evidence Required | Phase Owner |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `AC-P7-01` | Comprehensive Test Suite | Complete suite covering engine, gameplay, persistence, audio, and UI. | `bunx vitest run`. | 100% passing tests. | Phase 7 |
| `AC-P7-02` | Edge Case Coverage | Rapid reverse keys, full board, corrupted storage, and audio suspension tested. | Dedicated edge-case test suite. | Test logs with edge cases. | Phase 7 |
| `AC-P7-03` | Strict TypeScript Compliance | Zero `any` types, zero unchecked type assertions across entire project. | `bun run typecheck`. | Clean zero-error output. | Phase 7 |

---

## Phase 8 — Final Audit & Release

| Requirement ID | Description | Expected Behavior | Verification Method | Evidence Required | Phase Owner |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `AC-P8-01` | Production Bundle Build | Clean Vite production build without bundle errors or warnings. | `bunx vite build`. | Build exit code 0. | Phase 8 |
| `AC-P8-02` | Bundle Size Budget | Total production client bundle $< 350\text{ kB}$ uncompressed ($< 100\text{ kB}$ gzip). | Dist asset analysis. | File size measurement. | Phase 8 |
| `AC-P8-03` | Documentation Package | Complete README, user manual, and developer architecture docs. | Documentation review. | Verified documentation. | Phase 8 |
| `AC-P8-04` | Final Codebase Health Audit | No console errors, no dead code, all phase requirements met. | End-to-end audit. | Final Audit Report. | Phase 8 |
