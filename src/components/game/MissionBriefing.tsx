'use client';

import { useEffect, useState } from 'react';
import { useGameStore } from '../../utils/useGameStore';

const BRIEFING_LINES = [
  'CLASSIFICATION: TOP SECRET',
  '',
  'OPERATION: STRAIT GUARDIAN',
  'THEATER: STRAIT OF HORMUZ',
  '',
  'INTEL REPORT:',
  'Enemy naval forces have established',
  'a blockade across the strait.',
  'Multiple surface combatants detected.',
  'Air defense systems are active.',
  '',
  'MISSION OBJECTIVES:',
  '> Neutralize all enemy vessels',
  '> Maintain aircraft integrity',
  '> Secure the strait corridor',
  '',
  'AIRCRAFT: A-10 THUNDERBOLT II',
  'ARMAMENT: GAU-8 / AGM-65 MAVERICK',
  '',
  'GOOD LUCK, PILOT.',
];

export function MissionBriefing() {
  const missionStatus = useGameStore((s) => s.missionStatus);
  const setMissionStatus = useGameStore((s) => s.setMissionStatus);

  const [visible, setVisible] = useState(false);
  const [revealedLines, setRevealedLines] = useState(0);
  const [done, setDone] = useState(false);

  // Show briefing when status transitions to 'in-progress' from 'idle'
  useEffect(() => {
    if (missionStatus === 'in-progress') {
      setVisible(true);
      setRevealedLines(0);
      setDone(false);
    }
  }, [missionStatus]);

  // Typewriter reveal
  useEffect(() => {
    if (!visible || done) return;
    if (revealedLines >= BRIEFING_LINES.length) {
      setDone(true);
      return;
    }
    const timer = setTimeout(() => {
      setRevealedLines((n) => n + 1);
    }, 80);
    return () => clearTimeout(timer);
  }, [visible, revealedLines, done]);

  // Keyboard / tap to dismiss once fully revealed
  useEffect(() => {
    if (!done) return;
    const dismiss = () => setVisible(false);
    window.addEventListener('keydown', dismiss);
    window.addEventListener('touchstart', dismiss);
    return () => {
      window.removeEventListener('keydown', dismiss);
      window.removeEventListener('touchstart', dismiss);
    };
  }, [done]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-6">
      <div className="w-full max-w-lg border border-green-500/60 bg-black/90 p-6 font-mono shadow-lg shadow-green-900/40">
        {/* Header */}
        <div className="mb-4 border-b border-green-500/40 pb-3 text-center">
          <span className="text-xs tracking-[0.4em] text-green-400/60">
            ██ SECURE CHANNEL ██
          </span>
        </div>

        {/* Scrolling text */}
        <div className="min-h-[320px] space-y-1">
          {BRIEFING_LINES.slice(0, revealedLines).map((line, i) => (
            <p
              key={i}
              className={`text-sm leading-relaxed ${
                line.startsWith('>') || line.startsWith('MISSION') || line.startsWith('AIRCRAFT')
                  ? 'text-green-300'
                  : line === '' 
                  ? 'h-2'
                  : 'text-green-400/80'
              }`}
            >
              {line || '\u00A0'}
            </p>
          ))}
          {/* Blinking cursor */}
          {!done && (
            <span className="inline-block w-2 h-4 bg-green-400 animate-pulse" />
          )}
        </div>

        {/* Footer */}
        {done && (
          <div className="mt-4 border-t border-green-500/40 pt-3 text-center animate-pulse">
            <span className="text-xs tracking-[0.3em] text-green-400/70">
              PRESS ANY KEY / TAP TO ENGAGE
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
