'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { Stars, Environment } from '@react-three/drei';

/**
 * GameCanvas — the Three.js scene root.
 * 
 * This is a placeholder scaffold. The actual aircraft, terrain, enemies,
 * and physics will be added in subsequent implementation steps.
 * The canvas is intentionally kept minimal here so the UI layer
 * (HUD, overlays, virtual controls) can be developed and tested independently.
 */
export function GameCanvas() {
  return (
    <div className="fixed inset-0">
      <Canvas
        camera={{ fov: 75, near: 0.1, far: 20000, position: [0, 50, 200] }}
        gl={{ antialias: true, alpha: false }}
        shadows
      >
        <Suspense fallback={null}>
          {/* Ambient lighting */}
          <ambientLight intensity={0.3} />
          <directionalLight
            position={[500, 800, 300]}
            intensity={1.2}
            castShadow
            shadow-mapSize={[2048, 2048]}
          />

          {/* Sky / stars */}
          <Stars
            radius={8000}
            depth={200}
            count={3000}
            factor={4}
            saturation={0}
            fade
          />

          {/* Ocean placeholder — flat blue plane */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -20, 0]} receiveShadow>
            <planeGeometry args={[40000, 40000, 64, 64]} />
            <meshStandardMaterial
              color="#0a2a4a"
              roughness={0.8}
              metalness={0.1}
            />
          </mesh>

          {/* Horizon fog */}
          <fog attach="fog" args={['#050d1a', 2000, 12000]} />
        </Suspense>
      </Canvas>
    </div>
  );
}
