'use client';

import { useEffect } from 'react';
import { useGameStore } from '../../utils/useGameStore';

export function TitleScreen() {
  const missionStatus = useGameStore((s) => s.missionStatus);
  const setMissionStatus = useGameStore((s) => s.setMissionStatus);
  const setThrottle = useGameStore((s) => s.setThrottle);

  const startGame = () => {
    setMissionStatus('in-progress');
    setThrottle(0);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        startGame();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (missionStatus !== 'idle') return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 font-mono">
      {/* Scanline overlay */}
      <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.12)_2px,rgba(0,0,0,0.12)_4px)]" />

      <div className="relative z-10 flex flex-col items-center gap-6 text-center px-8">
        {/* Classification stamp */}
        <div className="text-xs tracking-[0.5em] text-green-400/40 animate-pulse">
          ── TOP SECRET ──
        </div>

        {/* Title */}
        <div>
          <h1
            className="text-7xl font-bold tracking-widest text-green-400"
            style={{
              textShadow:
                '0 0 8px #4ade80, 0 0 20px #4ade80, 0 0 40px #22c55e',
            }}
          >
            A-10
          </h1>
          <h2
            className="text-3xl font-bold tracking-[0.6em] text-green-300 mt-1"
            style={{ textShadow: '0 0 6px #4ade80, 0 0 14px #22c55e' }}
          >
            HORMUZ
          </h2>
        </div>

        <p className="text-green-400/60 text-sm tracking-[0.3em]">
          NAVAL COMBAT SIMULATOR
        </p>

        {/* Divider */}
        <div className="w-64 border-t border-green-500/30" />

        {/* Controls */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-xs text-green-400/70 tracking-widest">
          <span className="text-right text-green-300/80">W / ↑</span>
          <span>PITCH UP</span>
          <span className="text-right text-green-300/80">S / ↓</span>
          <span>PITCH DOWN</span>
          <span className="text-right text-green-300/80">A / ←</span>
          <span>ROLL LEFT</span>
          <span className="text-right text-green-300/80">D / →</span>
          <span>ROLL RIGHT</span>
          <span className="text-right text-green-300/80">SPACE</span>
          <span>FIRE GAU-8</span>
          <span className="text-right text-green-300/80">SHIFT</span>
          <span>LAUNCH MISSILE</span>
          <span className="text-right text-green-300/80">C</span>
          <span>TOGGLE CAMERA</span>
        </div>

        {/* Divider */}
        <div className="w-64 border-t border-green-500/30" />

        {/* CTA */}
        <button
          onClick={startGame}
          className="mt-2 border border-green-400/60 px-10 py-3 text-sm tracking-[0.4em] text-green-400 transition-all hover:bg-green-400/10 hover:border-green-300 hover:text-green-300 animate-pulse"
        >
          PRESS ENTER TO LAUNCH
        </button>

        <p className="text-xs text-green-400/30 tracking-widest">
          TAP ANYWHERE ON MOBILE
        </p>
      </div>
    </div>
  );
}
