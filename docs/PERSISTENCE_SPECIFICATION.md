# Persistence Specification — Snake: Neon Evolution

## 1. Storage Boundaries & Guarantees

All user data, career metrics, leaderboards, and settings are preserved client-side in the browser's `window.localStorage`.

### Key Guarantees:
1. **Schema Versioning:** Every stored record carries an explicit integer `version`.
2. **Automated Migration:** Upgrades seamlessly migrate older schemas to the latest specification without data loss.
3. **Defensive Sanitization:** Corrupted or tampered JSON data is trapped, repaired, or gracefully reset to defaults without crashing the game engine.
4. **Storage Quota Protection:** History arrays are capped (e.g. latest 50 game sessions) to prevent storage bloat.

---

## 2. Storage Data Model (Version 2 Schema)

```typescript
export interface PlayerSettings {
  difficulty: 'EASY' | 'NORMAL' | 'HARD' | 'CUSTOM';
  customTickRate: number;
  masterVolume: number;    // 0.0 to 1.0
  sfxVolume: number;       // 0.0 to 1.0
  musicVolume: number;     // 0.0 to 1.0
  muted: boolean;
  controlScheme: 'ARROWS' | 'WASD' | 'SWIPE' | 'DPAD';
  reducedMotion: boolean;
}

export interface PlayerStats {
  totalGames: number;
  totalPlayTimeSeconds: number;
  highestScore: number;
  totalFoodConsumed: number;
  longestSnakeLength: number;
  highestComboStreak: number;
  totalVictories: number;
}

export interface LeaderboardEntry {
  readonly id: string;
  readonly playerName: string;
  readonly score: number;
  readonly mode: 'CLASSIC' | 'TIME_ATTACK' | 'CHALLENGE';
  readonly difficulty: 'EASY' | 'NORMAL' | 'HARD' | 'CUSTOM';
  readonly snakeLength: number;
  readonly timestamp: number; // Unix Epoch ms
}

export interface AchievementProgress {
  readonly id: string;
  readonly unlocked: boolean;
  readonly unlockedAt?: number;
}

export interface GameSessionLog {
  readonly id: string;
  readonly timestamp: number;
  readonly mode: string;
  readonly score: number;
  readonly durationSeconds: number;
  readonly snakeLength: number;
}

export interface UserProfileSchemaV2 {
  readonly version: 2;
  readonly settings: PlayerSettings;
  readonly stats: PlayerStats;
  readonly leaderboard: readonly LeaderboardEntry[];
  readonly achievements: readonly AchievementProgress[];
  readonly history: readonly GameSessionLog[];
}
```

---

## 3. Default Initial State

```typescript
export const INITIAL_USER_PROFILE: UserProfileSchemaV2 = {
  version: 2,
  settings: {
    difficulty: 'NORMAL',
    customTickRate: 150,
    masterVolume: 0.8,
    sfxVolume: 0.8,
    musicVolume: 0.5,
    muted: false,
    controlScheme: 'ARROWS',
    reducedMotion: false,
  },
  stats: {
    totalGames: 0,
    totalPlayTimeSeconds: 0,
    highestScore: 0,
    totalFoodConsumed: 0,
    longestSnakeLength: 3,
    highestComboStreak: 0,
    totalVictories: 0,
  },
  leaderboard: [],
  achievements: [
    { id: 'FIRST_BITE', unlocked: false },
    { id: 'CENTURION', unlocked: false },
    { id: 'ANACONDA', unlocked: false },
    { id: 'COMBO_KING', unlocked: false },
    { id: 'SURVIVOR', unlocked: false },
    { id: 'SPEED_DEMON', unlocked: false },
    { id: 'APEX_PREDATOR', unlocked: false },
  ],
  history: [],
};
```

---

## 4. Schema Validation & Migration Pipeline

```
Raw localStorage String
          │
          ▼
JSON.parse() (Wrapped in try/catch)
          │
          ├──────────────────────────────────┐
     (Valid JSON)                       (SyntaxError)
          │                                  │
          ▼                                  ▼
Version Detection                     Return Safe Default Profile
          │
          ├──────────────┬───────────────────┐
     Version < 1    Version == 1        Version == 2
          │              │                   │
          ▼              ▼                   ▼
    Migrate to V1   Migrate to V2       Zod / Guard Schema Check
          │              │                   │
          └──────────────┴───────────────────┤
                                             ▼
                                    Save Clean V2 to Storage
```

### Migration Rules:
- **From V1 to V2:** Adds new fields (`sfxVolume`, `musicVolume`, `reducedMotion`, `highestComboStreak`, `totalVictories`) while strictly preserving existing scores, achievements, and game counts.
- **Field Validation Guards:** Numerical stats must be non-negative integers; leaderboard entries are sorted by score descending; `history` is clamped to the last 50 items.

---

## 5. Storage Error & Edge Case Resilience

1. **Private Browsing / Cookies Disabled:** When `localStorage` throws a SecurityError or is inaccessible, the persistence manager falls back to an in-memory session object. The user is notified via UI toast that stats will not persist past the active session.
2. **Quota Exceeded (`QuotaExceededError`):** If storage limit is reached, the manager purges the oldest 25 items from `history` and retries saving.
3. **Concurrent Tabs:** Attaches `window.addEventListener('storage', ...)` to sync settings or leaderboard changes between multiple open browser tabs.
