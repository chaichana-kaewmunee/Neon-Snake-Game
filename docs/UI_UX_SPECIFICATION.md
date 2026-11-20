# UI/UX Specification — Snake: Neon Evolution

## 1. Visual Theme & Design Tokens

### 1.1 Aesthetic Direction: "Cyber Neon / Dark Synth"
- Deep obsidian backdrop (`#050505` to `#0d0d12`) to maximize contrast and eliminate eye strain.
- Glowing high-intensity neon accents for active entities.
- Monospace and clean modern cyberpunk typography (`JetBrains Mono`, `Fira Code`, or `system monospace`).
- High-performance CSS glow effects using hardware-accelerated `box-shadow` and SVG filters.

### 1.2 Design Tokens

```css
:root {
  /* Surface Colors */
  --bg-primary: #050505;
  --bg-surface: #0e0e14;
  --bg-surface-elevated: #161622;
  --border-dim: #1f1f2e;

  /* Neon Accent Palette */
  --neon-green: #39ff14;      /* Primary Snake Color */
  --neon-green-head: #bfff00; /* Snake Head Focus */
  --neon-cyan: #00f0ff;       /* Normal Food & Primary HUD */
  --neon-amber: #ffb703;      /* Bonus Food */
  --neon-magenta: #ff007f;    /* Rare Food & Achievements */
  --neon-red: #ff3131;        /* Danger / Collisions / Game Over */
  --neon-purple: #7b2cbf;     /* Obstacles */

  /* Typography */
  --font-family: 'JetBrains Mono', 'Courier New', monospace;
  --text-primary: #f0f0f0;
  --text-muted: #8a8a9e;

  /* Elevation & Glows */
  --glow-green: 0 0 15px rgba(57, 255, 20, 0.45);
  --glow-cyan: 0 0 15px rgba(0, 240, 255, 0.45);
  --glow-red: 0 0 15px rgba(255, 49, 49, 0.55);
}
```

---

## 2. Screen & Component Hierarchy

```
AppContainer
├── MainNavigation (Header / Title / AudioToggle / SettingsButton)
├── ActiveScreenView
│   ├── MainMenuView (Play, Modes, Leaderboard, Stats, Settings)
│   ├── GameScreenView
│   │   ├── HUD (Score, HighScore, ComboMeter, SpeedGauge, Timer)
│   │   ├── CanvasViewport (Responsive HTML5 Canvas with Particle FX)
│   │   └── TouchControls (Virtual D-pad / Swipe Layer for Mobile)
│   ├── LeaderboardModalView (Local Top 10 High Scores)
│   ├── StatisticsModalView (Player Lifetime Metrics)
│   └── SettingsModalView (Difficulty, Audio Sliders, Input Mapping)
└── OverlayNotificationHost (Achievement Unlocks & Combo Banners)
```

---

## 3. Screen Specifications

### 3.1 Main Menu
- **Neon Title:** "SNAKE: NEON EVOLUTION" with pulsing neon green glow animation.
- **Menu Options:**
  - `PLAY CLASSIC`: Quick start default game.
  - `GAME MODES`: Sub-menu choosing Classic, Time Attack, or Challenge.
  - `LEADERBOARD`: View local high scores.
  - `STATISTICS`: View career metrics.
  - `SETTINGS`: Adjust sound, difficulty, controls.

### 3.2 Game Screen & HUD
- **HUD Layout:**
  - **Top Left:** Current Score & High Score indicator.
  - **Top Center:** Combo Streak Bar with animated progress gauge and active multiplier ($1.0\times - 4.0\times$).
  - **Top Right:** Active Speed Gauge & Pause Button (`[⏸]`).
- **Board Area:** Centered, aspect-ratio locked (1:1) HTML5 canvas, bounded by a subtle pulsing neon border.

### 3.3 Pause Modal
- Semi-transparent backdrop (`rgba(5, 5, 8, 0.85)`) with backdrop blur (`blur(8px)`).
- Centered neon menu: `RESUME`, `RESTART`, `SETTINGS`, `QUIT TO MENU`.
- Pressing `Escape` or `P` toggles pause/resume.

### 3.4 Game Over Screen
- Immediate red chromatic aberration pulse on collision.
- Summary Card:
  - Final Score (with "NEW HIGH SCORE!" neon animation if beaten).
  - Food Eaten, Snake Length, Survival Duration, Max Combo Streak.
  - Action Buttons: `PLAY AGAIN` (`Space` / `Enter`), `MAIN MENU`.

---

## 4. Input & Responsive Controls

### 4.1 Keyboard Controls
- **Movement:**
  - Up: `ArrowUp`, `KeyW`
  - Down: `ArrowDown`, `KeyS`
  - Left: `ArrowLeft`, `KeyA`
  - Right: `ArrowRight`, `KeyD`
- **System:**
  - Pause / Resume: `KeyP`, `Escape`
  - Quick Restart: `KeyR`
  - Confirm / Menu Select: `Enter`, `Space`

### 4.2 Touch Controls (Mobile Viewport)
- **Automatic Detection:** Screen width $< 768\text{px}$ or touch capability enables touch layer.
- **Two Control Modes (Configurable in Settings):**
  1. **Virtual D-Pad:** Fixed ergonomic 4-button cluster placed at bottom-center or bottom-right with neon haptic visual feedback.
  2. **Swipe Gestures:** Detects swipe vectors ($\Delta x, \Delta y$) across the canvas with minimum $20\text{px}$ threshold to prevent accidental turns.

---

## 5. Accessibility & Inclusivity (A11y)

1. **Reduced Motion Support:** Respects `@media (prefers-reduced-motion: reduce)` by disabling canvas particle bursts and pulsing HUD animations.
2. **Keyboard Focus:** All buttons, modals, and sliders have visible neon focus rings (`outline: 2px solid var(--neon-cyan); outline-offset: 3px`).
3. **Screen Reader Announcements:** ARIA live region (`aria-live="polite"`) announces score milestones and game-over summaries.
4. **Color Contrast:** All text elements exceed WCAG 2.1 AAA contrast ratio ($> 7:1$) against the black background.
