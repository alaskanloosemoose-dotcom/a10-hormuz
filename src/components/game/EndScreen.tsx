'use client';

import { useEffect, useState } from 'react';
import { useGameStore } from '../../utils/useGameStore';

export function EndScreen() {
  const missionStatus = useGameStore((s) => s.missionStatus);
  const score = useGameStore((s) => s.score);
  const reset = useGameStore((s) => s.reset);

  const [visible, setVisible] = useState(false);
  const [flash, setFlash] = useState(false);

  const isComplete = missionStatus === 'completed';
  const isFailed = missionStatus === 'failed';

  useEffect(() => {
    if (isComplete || isFailed) {
      setVisible(true);
      // Dramatic flash effect on appear
      const t = setTimeout(() => setFlash(true), 50);
      return () => clearTimeout(t);
    } else {
      setVisible(false);
      setFlash(false);
    }
  }, [isComplete, isFailed]);

  const handleRestart = () => {
    reset();
  };

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 transition-opacity duration-500 ${
        flash ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Scanline overlay */}
      <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.15)_2px,rgba(0,0,0,0.15)_4px)]" />

      <div className="relative z-10 flex flex-col items-center gap-6 px-8 text-center font-mono">

        {/* Status banner */}
        {isComplete ? (
          <>
            <div className="text-xs tracking-[0.5em] text-green-400/60 animate-pulse">
              ── MISSION DEBRIEF ──
            </div>
            <h1 className="text-5xl font-bold tracking-widest text-green-400 drop-shadow-[0_0_20px_rgba(74,222,128,0.8)]">
              MISSION<br />COMPLETE
            </h1>
            <p className="text-green-300/80 text-sm tracking-widest">
              STRAIT SECURED. WELL DONE, PILOT.
            </p>
          </>
        ) : (
          <>
            <div className="text-xs tracking-[0.5em] text-red-400/60 animate-pulse">
              ── INCIDENT REPORT ──
            </div>
            <h1 className="text-5xl font-bold tracking-widest text-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.8)]">
              MISSION<br />FAILED
            </h1>
            <p className="text-red-300/80 text-sm tracking-widest">
              AIRCRAFT LOST. PILOT KIA.
            </p>
          </>
        )}

        {/* Score panel */}
        <div
          className={`mt-2 w-72 border px-6 py-4 ${
            isComplete ? 'border-green-500/50 bg-green-900/10' : 'border-red-500/50 bg-red-900/10'
          }`}
        >
          <div className="text-xs tracking-[0.3em] text-white/40 mb-2">FINAL SCORE</div>
          <div
            className={`text-4xl font-bold tracking-widest ${
              isComplete ? 'text-green-300' : 'text-red-300'
            }`}
          >
            {score.toString().padStart(6, '0')}
          </div>
        </div>

        {/* Rating */}
        <ScoreRating score={score} success={isComplete} />

        {/* Action buttons */}
        <div className="mt-4 flex gap-4">
          <button
            onClick={handleRestart}
            className={`border px-8 py-3 text-sm tracking-widest transition-colors hover:bg-white/10 ${
              isComplete
                ? 'border-green-400/60 text-green-400 hover:border-green-300'
                : 'border-red-400/60 text-red-400 hover:border-red-300'
            }`}
          >
            RETRY MISSION
          </button>
        </div>

        <p className="text-xs text-white/20 tracking-widest mt-2">
          PRESS R OR TAP RETRY TO RESTART
        </p>
      </div>
    </div>
  );
}

// ── Score rating helper ────────────────────────────────────────────────────
function ScoreRating({ score, success }: { score: number; success: boolean }) {
  const rating = success
    ? score >= 5000
      ? { label: 'ACE', color: 'text-yellow-300' }
      : score >= 3000
      ? { label: 'VETERAN', color: 'text-green-300' }
      : score >= 1000
      ? { label: 'PILOT', color: 'text-green-400/80' }
      : { label: 'ROOKIE', color: 'text-green-400/50' }
    : { label: 'WASHOUT', color: 'text-red-400/70' };

  return (
    <div className="text-center">
      <div className="text-xs tracking-[0.3em] text-white/30 mb-1">RATING</div>
      <div className={`text-2xl font-bold tracking-[0.4em] ${rating.color}`}>
        {rating.label}
      </div>
    </div>
  );
}
