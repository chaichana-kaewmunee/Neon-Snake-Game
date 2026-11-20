import { useEffect, useState, useRef } from 'react';
import { Engine } from '../../core/Engine';

export function useGameLoop(engine: Engine) {
  const [gameState, setGameState] = useState(engine.getState());
  const requestRef = useRef<number | null>(null);
  const lastTickRef = useRef<number>(0);

  useEffect(() => {
    const animate = (time: number) => {
      if (lastTickRef.current === 0) lastTickRef.current = time;
      const delta = time - lastTickRef.current;
      const currentTickRate = engine.getTickRate();

      if (delta >= currentTickRate) {
        if (engine.getState().status === 'PLAYING') {
          engine.tick();
          setGameState({ ...engine.getState() });
        }
        lastTickRef.current = time - (delta % currentTickRate);
      }

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [engine]);

  return gameState;
}
