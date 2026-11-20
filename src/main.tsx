import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Engine } from './core/Engine';
import { CanvasRenderer } from './renderer/CanvasRenderer';
import { useGameLoop } from './ui/hooks/useGameLoop';
import type { Direction } from './types';
import { AudioSystem } from './systems/AudioSystem';
import { PersistenceManager } from './systems/Persistence';
import type { UserProfile } from './types/progression';

const GameApp = () => {
  const engine = useRef(new Engine()).current;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<CanvasRenderer | null>(null);
  const audioRef = useRef(new AudioSystem()).current;
  const [status, setStatus] = useState(engine.getState().status);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState(PersistenceManager.loadProfile().settings);

  const state = useGameLoop(engine);

  useEffect(() => {
    if (canvasRef.current) {
      rendererRef.current = new CanvasRenderer(canvasRef.current);
      window.addEventListener('resize', () => rendererRef.current?.resize());
    }
  }, []);

  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.render(state);
    }
  }, [state]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const keyMap: Record<string, Direction> = {
        ArrowUp: 'UP', w: 'UP',
        ArrowDown: 'DOWN', s: 'DOWN',
        ArrowLeft: 'LEFT', a: 'LEFT',
        ArrowRight: 'RIGHT', d: 'RIGHT',
      };
      const dir = keyMap[e.key];
      if (dir) {
        // Resume audio context on first interaction
        audioRef.resumeContext();
        engine.handleInput(dir);
        if (status === 'IDLE') {
          engine.setStatus('PLAYING');
          setStatus('PLAYING');
          audioRef.playMusic('/sounds/bgm.mp3');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status]);

  // Handle Touch Inputs
  const handleTouch = (dir: Direction) => {
    audioRef.resumeContext();
    engine.handleInput(dir);
    if (status === 'IDLE') {
      engine.setStatus('PLAYING');
      setStatus('PLAYING');
      audioRef.playMusic('/sounds/bgm.mp3');
    }
  };

  const handleRestart = () => {
    engine.reset();
    engine.setStatus('PLAYING');
    setStatus('PLAYING');
  };

  const saveSettings = (newSettings: any) => {
    const profile = PersistenceManager.loadProfile();
    PersistenceManager.saveProfile({ ...profile, settings: newSettings });
    setSettings(newSettings);
    audioRef.updateVolume();
  };

  return (
    <div style={styles.container}>
      <div style={styles.hud}>
        <h1 style={styles.title}>NEON SNAKE</h1>
        <div style={styles.scoreBoard}>SCORE: {state.score}</div>
        <button onClick={() => setShowSettings(true)} style={styles.settingsBtn}>⚙️</button>
      </div>

      <div style={styles.gameWrapper}>
        <canvas ref={canvasRef} style={styles.canvas} />

        {status === 'IDLE' && (
          <div style={styles.overlay}>
            <h2 style={styles.overlayText}>PRESS ANY KEY TO START</h2>
            <div style={styles.touchControls}>
                <button onClick={() => handleTouch('UP')} style={styles.touchBtn}>▲</button>
                <div style={styles.touchRow}>
                    <button onClick={() => handleTouch('LEFT')} style={styles.touchBtn}>◀</button>
                    <button onClick={() => handleTouch('DOWN')} style={styles.touchBtn}>▼</button>
                    <button onClick={() => handleTouch('RIGHT')} style={styles.touchBtn}>▶</button>
                </div>
            </div>
          </div>
        )}

        {status === 'GAMEOVER' && (
          <div style={styles.overlay}>
            <h2 style={styles.overlayText}>GAME OVER</h2>
            <button onClick={handleRestart} style={styles.button}>RESTART</button>
          </div>
        )}
      </div>

      {showSettings && (
        <div style={styles.settingsOverlay}>
          <div style={styles.settingsModal}>
            <h2 style={styles.overlayText}>SETTINGS</h2>
            <div style={styles.settingItem}>
              <label>Volume: {Math.round(settings.volume * 100)}%</label>
              <input
                type="range" min="0" max="1" step="0.1"
                value={settings.volume}
                onChange={(e) => saveSettings({...settings, volume: parseFloat(e.target.value)})}
              />
            </div>
            <div style={styles.settingItem}>
              <label>Muted</label>
              <input
                type="checkbox"
                checked={settings.muted}
                onChange={(e) => saveSettings({...settings, muted: e.target.checked})}
              />
            </div>
            <button onClick={() => setShowSettings(false)} style={styles.button}>CLOSE</button>
          </div>
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: '#050505',
    color: '#39ff14',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'monospace',
    overflow: 'hidden',
    touchAction: 'none', // Prevents scrolling during gameplay
  },
  hud: {
    textAlign: 'center',
    marginBottom: '20px',
    position: 'relative',
    width: '100%',
    maxWidth: '600px',
  },
  title: {
    fontSize: '3rem',
    margin: '0',
    textShadow: '0 0 10px #39ff14',
  },
  scoreBoard: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
  },
  settingsBtn: {
    position: 'absolute',
    right: '0',
    top: '0',
    background: 'none',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
  },
  gameWrapper: {
    position: 'relative',
    boxShadow: '0 0 50px rgba(57, 255, 20, 0.2)',
    borderRadius: '8px',
  },
  canvas: {
    display: 'block',
    backgroundColor: '#0a0a0a',
    borderRadius: '8px',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '8px',
    backdropFilter: 'blur(4px)',
  },
  overlayText: {
    fontSize: '2rem',
    textShadow: '0 0 10px #39ff14',
    marginBottom: '20px',
  },
  button: {
    padding: '10px 20px',
    fontSize: '1.2rem',
    backgroundColor: 'transparent',
    color: '#39ff14',
    border: '2px solid #39ff14',
    cursor: 'pointer',
    fontFamily: 'monospace',
    transition: 'all 0.2s',
    boxShadow: '0 0 5px #39ff14',
  },
  touchControls: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
  },
  touchRow: {
    display: 'flex',
    gap: '10px',
  },
  touchBtn: {
    width: '60px',
    height: '60px',
    fontSize: '1.5rem',
    backgroundColor: 'rgba(57, 255, 20, 0.2)',
    color: '#39ff14',
    border: '1px solid #39ff14',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  settingsOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  settingsModal: {
    backgroundColor: '#111',
    padding: '30px',
    borderRadius: '12px',
    border: '2px solid #39ff14',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    minWidth: '300px',
  },
  settingItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '20px',
  },
};

const root = createRoot(document.getElementById('root')!);
root.render(<GameApp />);
