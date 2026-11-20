# Cyber-Snake-Game

**Snake: Neon Evolution** – a modern, browser‑based Snake clone built with TypeScript, React, Vite, and the Web Audio API.

## 🎮 Features
- Clean **Unidirectional Architecture** separating core engine, rendering, audio, and persistence.
- **Hybrid Audio System**: Procedural sound‑effects with optional MP3 background music, volume & mute controls synced to the player profile.
- Multiple **game modes** – Classic, Time Attack, Challenge with dynamic difficulty scaling.
- Deterministic **PRNG** for reproducible gameplay and reliable automated tests.
- Full **local persistence** (settings, stats, leaderboard) using `window.localStorage` with versioned schema migration.
- Responsive UI with keyboard and touch controls, accessibility support, and neon‑styled theme.

## 🛠️ Tech Stack
- **TypeScript** – strict typing, no `any`.
- **React** – UI components and hooks (`useGameLoop`).
- **Vite** – fast dev server & build.
- **Vitest** – test runner (unit, integration, UI).
- **Web Audio API** – procedural synthesis for SFX.
- **Bun** – package manager and runtime for scripts.

## 📦 Getting Started
```bash
# Install dependencies (Bun is required)
bun install

# Run the development server
bunx vite

# Build for production
bunx vite build
```

## ✅ Running Tests
```bash
# Run all tests with coverage
bunx vitest run --coverage
```

## 📚 Documentation
All design docs live in the `docs/` folder:
- `SYSTEM_ARCHITECTURE.md` – overall system diagram and layer responsibilities.
- `AUDIO_SPECIFICATION.md` – hybrid audio approach and synthesis details.
- `TESTING_STRATEGY.md` – testing philosophy and suite breakdown.
- `GAMEPLAY_SPECIFICATION.md` – scoring, food types, and game modes.
- `PHASE_ACCEPTANCE_CRITERIA.md` – criteria for each development phase.

## 🤝 Contributing
1. Fork the repository.
2. Create a feature branch.
3. Ensure `bun run typecheck` passes and all tests succeed.
4. Open a Pull Request.

---
© 2026 Cyber‑Snake‑Game – All rights reserved.
