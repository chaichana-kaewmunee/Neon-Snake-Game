# Gameplay Specification — Snake: Neon Evolution

## 1. Scoring & Multiplier Mechanics

### 1.1 Base Food Types & Point Values *(Proposed Defaults — Pending Owner Confirmation)*

| Food Type | Appearance | Spawn Probability | Base Points | Lifetime | Special Effect |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Normal** | Neon Cyan Dot | Always 1 active | 10 pts | Persistent | Standard snake growth (+1 segment) |
| **Bonus** | Neon Amber Ring | 20% on normal eat | 50 pts | 60 ticks | Growth (+1) + Speed boost (+5% for 30 ticks) |
| **Rare** | Magenta Diamond | 5% on normal eat | 150 pts | 40 ticks | Growth (+2 segments) + Instant +2 Combo |
| **Temporary** | Pulsing Violet Star | 15% on normal eat | 30 pts | 30 ticks | Growth (+1); score decays by 1 pt per tick remaining |

### 1.2 Combo & Streak System
- **Combo Counter ($C$):** Increments by 1 with every consecutive piece of food eaten within the **Combo Window** ($T_{\text{window}} = 25\text{ ticks}$).
- **Combo Multiplier ($M$):**
  $$M = 1 + \lfloor \frac{C}{5} \rfloor \times 0.5 \quad (\text{Max Multiplier} = 4.0\times)$$
  - 1–4 food in streak: $1.0\times$
  - 5–9 food in streak: $1.5\times$
  - 10–14 food in streak: $2.0\times$
  - 15–19 food in streak: $2.5\times$
  - 20+ food in streak: $4.0\times$ (Maximum Neon Overdrive)
- **Streak Break:** If $T_{\text{window}}$ expires without food consumption, $C$ resets to 0 and $M$ drops to $1.0\times$.

---

## 2. Difficulty Profiles & Speed Scaling

### 2.1 Default Profiles

| Difficulty Level | Grid Dimension | Base Tick Interval | Minimum Speed Cap | Acceleration Per Food |
| :--- | :--- | :--- | :--- | :--- |
| **EASY** | $16 \times 16$ | $200\text{ ms}$ ($5\text{ ticks/s}$) | $140\text{ ms}$ | $-1.5\text{ ms}$ |
| **NORMAL** | $20 \times 20$ | $150\text{ ms}$ ($6.67\text{ ticks/s}$) | $90\text{ ms}$ | $-2.0\text{ ms}$ |
| **HARD** | $24 \times 24$ | $100\text{ ms}$ ($10\text{ ticks/s}$) | $50\text{ ms}$ | $-2.5\text{ ms}$ |
| **CUSTOM** | User Choice ($10 - 40$) | $50 - 300\text{ ms}$ | User defined | Configurable |

### 2.2 Speed Curve Formula
$$\text{Speed}(N) = \max(\text{MinSpeed}, \text{BaseSpeed} - (N \times \text{Acceleration}))$$
Where $N$ is total food items consumed in the current game session.

---

## 3. Game Modes

### 3.1 Classic Mode
- Traditional snake gameplay.
- Border walls are lethal.
- Normal food constantly respawns; special foods spawn on roll.
- Endless progression until collision.

### 3.2 Time Attack Mode
- Player starts with a 60-second countdown clock.
- Eating Normal food adds $+3\text{ seconds}$.
- Eating Bonus food adds $+5\text{ seconds}$.
- Eating Rare food adds $+10\text{ seconds}$.
- Game ends when timer reaches zero OR upon collision. High score is total points accumulated before time-out.

### 3.3 Challenge Mode (Obstacle Mazes)
- Grid contains fixed and procedural neon barrier obstacles (represented as indestructible dark-purple neon blocks).
- Level progression: Every 10 food items consumed clears the board and loads the next obstacle pattern.
- Colliding with an obstacle is lethal (`GAME_OVER`).

---

## 4. Obstacle System Specification

### 4.1 Obstacle Topologies
1. **Pillars:** $2 \times 2$ clusters of blocks placed symmetrically at quadrant centers.
2. **Crossroads:** Center cross barrier with gap openings.
3. **Border Gates:** Walls with single-cell pass-through openings.

### 4.2 Spawning Safe-Zone Invariant
Obstacles must **never** spawn:
- Within a 3-cell radius of the snake head.
- In locations that partition the grid into unreachable dead-ends.
- On the initial snake starting position.

---

## 5. Game Over & Victory Conditions

### 5.1 Game Over Triggers
1. **Wall Collision:** Snake head coordinate falls outside $[0, \text{gridSize} - 1]$.
2. **Self Collision:** Snake head coordinate overlaps any coordinate of its own body.
3. **Obstacle Collision:** Snake head coordinate matches any active obstacle cell.
4. **Time Expired:** Time Attack clock reaches 0.

### 5.2 Victory Condition
- **Board Saturation:** The snake occupies all non-obstacle cells of the grid.
- **Victory Screen:** Displays final score, time elapsed, max combo, and awards the "Apex Predator" platinum achievement.
