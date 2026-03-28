'use client';

import dynamic from 'next/dynamic';
import { HUD } from '../../components/game/HUD';
import { TitleScreen } from '../../components/game/TitleScreen';
import { MissionBriefing } from '../../components/game/MissionBriefing';
import { EndScreen } from '../../components/game/EndScreen';
import { VirtualControls } from '../../components/game/VirtualControls';
import { useGameStore } from '../../utils/useGameStore';
import { useEffect, useState } from 'react';
import { initTouchControls, destroyTouchControls } from '../../utils/touchControls';

// Dynamically import the 3D canvas to avoid SSR issues
const GameCanvas = dynamic(() => import('../../components/game/GameCanvas').then(m => ({ default: m.GameCanvas })), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 flex items-center justify-center bg-black font-mono text-green-400 text-sm tracking-widest animate-pulse">
      INITIALIZING SYSTEMS...
    </div>
  ),
});

export default function GamePage() {
  const missionStatus = useGameStore((s) => s.missionStatus);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detect touch device
    const checkMobile = () => setIsMobile(window.matchMedia('(pointer: coarse)').matches);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Init touch controls
    initTouchControls();

    return () => {
      window.removeEventListener('resize', checkMobile);
      destroyTouchControls();
    };
  }, []);

  const gameActive = missionStatus === 'in-progress';

  return (
    <main className="relative w-full h-screen overflow-hidden bg-black">
      {/* 3D Scene */}
      <GameCanvas />

      {/* HUD — only shown during active gameplay */}
      {gameActive && <HUD />}

      {/* UI Overlays */}
      <TitleScreen />
      <MissionBriefing />
      <EndScreen />

      {/* Mobile virtual controls — only shown during active gameplay on touch devices */}
      {gameActive && isMobile && <VirtualControls />}
    </main>
  );
}
