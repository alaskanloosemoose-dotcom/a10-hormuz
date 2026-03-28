'use client';

import { useEffect, useState } from 'react';
import { useGameStore } from '../../utils/useGameStore';

export function HUD() {
  const { score, health, throttle, missionStatus, cameraView } = useGameStore();
  const [lastShot, setLastShot] = useState(0);
  const [lastMissile, setLastMissile] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setLastShot(Date.now());
      setLastMissile(Date.now());
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const canShoot = Date.now() - lastShot > 100;
  const canMissile = Date.now() - lastMissile > 2000;

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start">
        <div className="flex flex-col gap-2">
          <div className="text-2xl font-bold text-glow">
            SCORE: {score.toString().padStart(6, '0')}
          </div>
          <div className="text-lg text-glow-dim-green">
            MISSION: {missionStatus === 'idle' ? 'STANDBY' : missionStatus === 'in-progress' ? 'ENGAGING' : missionStatus === 'completed' ? 'MISSION COMPLETE' : 'CRITICAL'}
          </div>
        </div>
        
        {/* Camera view indicator */}
        <div className="text-lg text-glow-dim-green">
          VIEW: {cameraView === 'chase' ? 'CHASE' : 'COCKPIT'}
        </div>
      </div>

      {/* Health bar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-96">
        <div className="text-lg text-glow mb-1">
          SHIP INTEGRITY
        </div>
        <div className="w-full h-6 bg-gray-800 border-2 border-glow-green">
          <div 
            className={`h-full transition-all duration-100 ${health > 50 ? 'bg-glow-green' : health > 25 ? 'bg-yellow-500' : 'bg-red-500'}`}
            style={{ width: `${health}%` }}
          />
        </div>
      </div>

      {/* Bottom left - Weapon status */}
      <div className="absolute bottom-4 left-4 flex flex-col gap-2">
        <div className="text-lg text-glow-dim-green">
          WEAPONS
        </div>
        <div className="flex gap-4">
          <div className={`text-lg ${canShoot ? 'text-glow-green' : 'text-glow-dim-green'}`}>
            GAU-8: {canShoot ? 'READY' : 'COOLDOWN'}
          </div>
          <div className={`text-lg ${canMissile ? 'text-glow-green' : 'text-glow-dim-green'}`}>
            MISSILES: {canMissile ? 'READY' : 'COOLDOWN'}
          </div>
        </div>
      </div>

      {/* Bottom right - Throttle */}
      <div className="absolute bottom-4 right-4 flex flex-col items-end gap-2">
        <div className="text-lg text-glow-dim-green">
          THROTTLE
        </div>
        <div className="w-48 h-8 bg-gray-800 border-2 border-glow-green">
          <div 
            className="h-full bg-glow-green transition-all duration-100"
            style={{ width: `${throttle}%` }}
          />
        </div>
        <div className="text-glow-dim-green">
          {throttle}%
        </div>
      </div>

      {/* Crosshair */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="w-12 h-12 border-2 border-glow-green/50 rounded-full flex items-center justify-center">
          <div className="w-1 h-1 bg-glow-green rounded-full" />
        </div>
      </div>
    </div>
  );
}
