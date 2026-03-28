'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { setMissilePressed } from '../../utils/touchControls';

interface JoystickPos {
  x: number;
  y: number;
}

export function VirtualControls() {
  const [joystickPos, setJoystickPos] = useState<JoystickPos>({ x: 0, y: 0 });
  const [shootActive, setShootActive] = useState(false);
  const [missileActive, setMissileActive] = useState(false);
  const [throttleUpActive, setThrottleUpActive] = useState(false);
  const [throttleDownActive, setThrottleDownActive] = useState(false);

  const joystickBaseRef = useRef<HTMLDivElement>(null);
  const joystickOriginRef = useRef<{ x: number; y: number } | null>(null);
  const joystickTouchIdRef = useRef<number | null>(null);
  const RADIUS = 48; // px — max knob travel

  // ── Joystick ──────────────────────────────────────────────────────────────
  const handleJoystickStart = useCallback((e: React.TouchEvent) => {
    const touch = e.changedTouches[0];
    joystickTouchIdRef.current = touch.identifier;
    joystickOriginRef.current = { x: touch.clientX, y: touch.clientY };
    setJoystickPos({ x: 0, y: 0 });
  }, []);

  const handleJoystickMove = useCallback((e: React.TouchEvent) => {
    if (joystickOriginRef.current === null) return;
    for (const touch of Array.from(e.changedTouches)) {
      if (touch.identifier !== joystickTouchIdRef.current) continue;
      const dx = touch.clientX - joystickOriginRef.current.x;
      const dy = touch.clientY - joystickOriginRef.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const clamped = Math.min(dist, RADIUS);
      const angle = Math.atan2(dy, dx);
      setJoystickPos({
        x: Math.cos(angle) * clamped,
        y: Math.sin(angle) * clamped,
      });
    }
  }, []);

  const handleJoystickEnd = useCallback((e: React.TouchEvent) => {
    for (const touch of Array.from(e.changedTouches)) {
      if (touch.identifier === joystickTouchIdRef.current) {
        joystickTouchIdRef.current = null;
        joystickOriginRef.current = null;
        setJoystickPos({ x: 0, y: 0 });
      }
    }
  }, []);

  // ── Missile button ────────────────────────────────────────────────────────
  const handleMissileStart = useCallback(() => {
    setMissileActive(true);
    setMissilePressed(true);
  }, []);

  const handleMissileEnd = useCallback(() => {
    setMissileActive(false);
    setMissilePressed(false);
  }, []);

  // ── Prevent default scroll on the overlay ────────────────────────────────
  useEffect(() => {
    const prevent = (e: TouchEvent) => e.preventDefault();
    document.addEventListener('touchmove', prevent, { passive: false });
    return () => document.removeEventListener('touchmove', prevent);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-40 select-none">

      {/* ── LEFT SIDE: Joystick ─────────────────────────────────────────── */}
      <div
        ref={joystickBaseRef}
        className="absolute bottom-16 left-10 pointer-events-auto"
        onTouchStart={handleJoystickStart}
        onTouchMove={handleJoystickMove}
        onTouchEnd={handleJoystickEnd}
        onTouchCancel={handleJoystickEnd}
      >
        {/* Base ring */}
        <div
          className="relative flex items-center justify-center rounded-full border-2 border-green-400/50 bg-black/30"
          style={{ width: RADIUS * 2 + 32, height: RADIUS * 2 + 32 }}
        >
          {/* Knob */}
          <div
            className="absolute rounded-full bg-green-400/70 border border-green-300 shadow-lg shadow-green-500/40 transition-none"
            style={{
              width: 44,
              height: 44,
              transform: `translate(${joystickPos.x}px, ${joystickPos.y}px)`,
            }}
          />
          {/* Center dot */}
          <div className="w-2 h-2 rounded-full bg-green-400/30" />
        </div>
        <p className="text-center text-green-400/60 text-xs mt-1 font-mono tracking-widest">MOVE</p>
      </div>

      {/* ── RIGHT SIDE: Action buttons ──────────────────────────────────── */}
      <div className="absolute bottom-16 right-10 flex flex-col items-center gap-4 pointer-events-auto">

        {/* Throttle Up */}
        <button
          className={`w-16 h-12 rounded border-2 font-mono text-xs tracking-widest transition-colors ${
            throttleUpActive
              ? 'bg-green-400/40 border-green-300 text-green-100'
              : 'bg-black/30 border-green-400/50 text-green-400/70'
          }`}
          onTouchStart={() => setThrottleUpActive(true)}
          onTouchEnd={() => setThrottleUpActive(false)}
          onTouchCancel={() => setThrottleUpActive(false)}
        >
          THR+
        </button>

        {/* Throttle Down */}
        <button
          className={`w-16 h-12 rounded border-2 font-mono text-xs tracking-widest transition-colors ${
            throttleDownActive
              ? 'bg-green-400/40 border-green-300 text-green-100'
              : 'bg-black/30 border-green-400/50 text-green-400/70'
          }`}
          onTouchStart={() => setThrottleDownActive(true)}
          onTouchEnd={() => setThrottleDownActive(false)}
          onTouchCancel={() => setThrottleDownActive(false)}
        >
          THR-
        </button>

        {/* Shoot */}
        <button
          className={`w-20 h-14 rounded border-2 font-mono text-sm tracking-widest transition-colors ${
            shootActive
              ? 'bg-red-500/60 border-red-300 text-white'
              : 'bg-black/30 border-red-400/60 text-red-400/80'
          }`}
          onTouchStart={() => setShootActive(true)}
          onTouchEnd={() => setShootActive(false)}
          onTouchCancel={() => setShootActive(false)}
        >
          FIRE
        </button>

        {/* Missile */}
        <button
          className={`w-20 h-14 rounded border-2 font-mono text-sm tracking-widest transition-colors ${
            missileActive
              ? 'bg-yellow-500/60 border-yellow-300 text-white'
              : 'bg-black/30 border-yellow-400/60 text-yellow-400/80'
          }`}
          onTouchStart={handleMissileStart}
          onTouchEnd={handleMissileEnd}
          onTouchCancel={handleMissileEnd}
        >
          MSL
        </button>
      </div>
    </div>
  );
}
