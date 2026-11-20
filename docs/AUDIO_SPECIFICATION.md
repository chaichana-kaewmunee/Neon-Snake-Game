# Audio Specification — Snake: Neon Evolution

## 1. Architectural Philosophy: Hybrid Audio System using MP3 assets

Per the project owner's approved decision, "Snake: Neon Evolution" uses a **Hybrid Audio System** that supports procedural synthesis for sound effects and optional MP3 assets for background music.

### Advantages of Procedural Synthesis:
1. **Zero External Assets:** Eliminates missing file 404s, network latency, and MP3 asset dependencies.
2. **Zero Footprint:** Zero kilobytes added to bundle size.
3. **Dynamic Parameterization:** Frequencies, pitches, and envelope timings scale dynamically with game events (e.g., pitch increases with combo streaks).
4. **Deterministic Reproducibility:** Every sound is generated identically via Web Audio API math.

---

## 2. AudioContext Lifecycle & Browser Autoplay Compliance

Browsers enforce strict autoplay policies where an `AudioContext` starts in a `'suspended'` state until an explicit user interaction occurs.

### Lifecycle Management Protocol:
```
[Page Load] ───► AudioContext initialized in 'suspended' state
                       │
             First User Interaction (Keydown, Pointerdown, Click)
                       │
                       ▼
             await audioContext.resume()
                       │
                       ▼
             AudioContext state becomes 'running'
                       │
             Page Hidden / Tab Blurred (visibilitychange)
                       │
                       ▼
             audioContext.suspend() (Conserve CPU & battery)
                       │
             Tab Restored
                       │
                       ▼
             audioContext.resume()
```

---

## 3. Synthesizer Voice Architecture

Every sound effect is generated through a transient node chain that automatically disconnects and garbage-collects upon completion:

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐       ┌────────────────────────┐
│ OscillatorNode  │ ───►  │ GainNode        │ ───►  │ MasterGain      │ ───►  │ AudioContext           │
│ (Waveform/Pitch)│       │ (ADSR Envelope) │       │ (Volume/Mute)   │       │ Destination (Speakers) │
└─────────────────┘       └─────────────────┘       └─────────────────┘       └────────────────────────┘
```

---

## 4. Procedural Sound Event Catalog

### 4.1 Normal Food Eat (`sfx_eat`)
- **Waveform:** Triangle wave (smooth, retro 8-bit pop).
- **Pitch:** Ascends slightly from $440\text{ Hz}$ (`A4`) to $660\text{ Hz}$ (`E5`) over $0.08\text{ s}$.
- **Envelope:** Immediate attack ($0.005\text{ s}$), exponential decay to $0$ at $0.08\text{ s}$.

### 4.2 Special / Bonus Food Eat (`sfx_bonus`)
- **Waveform:** Sine wave arpeggio.
- **Tones:** 3 rapid ascending pulses: $523.25\text{ Hz}$ (`C5`), $659.25\text{ Hz}$ (`E5`), $783.99\text{ Hz}$ (`G5`) over $0.18\text{ s}$.
- **Envelope:** Fast staccato decay for each tone.

### 4.3 Rare Food Eat (`sfx_rare`)
- **Waveform:** Square wave with low-pass filter at $1200\text{ Hz}$.
- **Tones:** Fanfare chord ($587.33\text{ Hz}$, $880\text{ Hz}$, $1174.66\text{ Hz}$).
- **Duration:** $0.25\text{ s}$.

### 4.4 Collision & Death (`sfx_die`)
- **Waveform:** Mixed Sawtooth + Noise buffer.
- **Pitch:** Frequency plunges from $220\text{ Hz}$ down to $40\text{ Hz}$ with pitch decay over $0.35\text{ s}$.
- **Envelope:** Linear attack ($0.01\text{ s}$), sustained rough buzz, exponential fade out.

### 4.5 Combo Pitch Escalation (`sfx_combo`)
- Every consecutive piece of food in a combo streak shifts the base frequency up by 1 semitone:
  $$f_{\text{combo}} = f_{\text{base}} \times 2^{\frac{\min(C, 12)}{12}}$$
- Provides instant, rewarding auditory feedback for building streaks.

### 4.6 UI Interaction (`sfx_click`)
- **Waveform:** High Sine wave at $1200\text{ Hz}$.
- **Duration:** Very short ($0.03\text{ s}$), soft gain ($0.15$).

---

## 5. Ambient Cyber Synth Drone (Optional BGM)

- Rather than playing a heavy MP3 loop, the procedural audio engine can generate a low-pass filtered binaural ambient cyber drone:
  - Oscillator 1: Sine wave at $55\text{ Hz}$ (`A1`).
  - Oscillator 2: Sine wave at $55.5\text{ Hz}$ (slight detune producing a $0.5\text{ Hz}$ pulsating neon rhythm).
  - Filter: Bi-quad low-pass at $180\text{ Hz}$.
  - Volume: Ambient background level ($0.08\times$ master volume).
  - Toggled via Settings (`Music: ON/OFF`).

---

## 6. Volume & Mute Controls

1. **Volume Range:** Decimal float $[0.0, 1.0]$.
2. **Master Gain Node:** All SFX and ambient nodes route through a single `masterGainNode`.
3. **Mute Implementation:** Sets `masterGainNode.gain.setValueAtTime(0, audioContext.currentTime)`.
4. **Persistence:** Volume level and mute flags persist across sessions in the Player Profile.
