'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Suspense, useRef, useEffect, useState, useCallback } from 'react';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../../utils/useGameStore';
import { getTouchState } from '../../utils/touchControls';

// ─── Constants ────────────────────────────────────────────────────────────────
const THROTTLE_MAX = 100;
const SPEED_SCALE = 0.8;          // units/frame at 100% throttle
const TURN_SPEED = 0.03;
const PITCH_SPEED = 0.025;
const BULLET_SPEED = 6;
const BULLET_RANGE = 2000;
const BULLET_COOLDOWN = 120;      // ms
const ENEMY_COUNT = 6;
const ENEMY_FIRE_INTERVAL = 3000; // ms between enemy shots
const ENEMY_BULLET_SPEED = 3;
const ENEMY_BULLET_RANGE = 1200;
const ENEMY_HIT_RADIUS = 40;
const PLAYER_HIT_RADIUS = 20;
const ENEMY_DAMAGE = 12;
const SCORE_PER_KILL = 500;

// ─── Types ────────────────────────────────────────────────────────────────────
interface BulletState {
  id: number;
  pos: THREE.Vector3;
  dir: THREE.Vector3;
  traveled: number;
  active: boolean;
  isEnemy: boolean;
  enemyIdx?: number;
}

interface EnemyState {
  id: number;
  pos: THREE.Vector3;
  alive: boolean;
  lastFired: number;
}

// ─── Keyboard tracker (module-level, shared) ──────────────────────────────────
const heldKeys = new Set<string>();

function attachKeyListeners() {
  const onDown = (e: KeyboardEvent) => heldKeys.add(e.code);
  const onUp = (e: KeyboardEvent) => heldKeys.delete(e.code);
  window.addEventListener('keydown', onDown);
  window.addEventListener('keyup', onUp);
  return () => {
    window.removeEventListener('keydown', onDown);
    window.removeEventListener('keyup', onUp);
  };
}

// ─── Initial enemy positions ──────────────────────────────────────────────────
function makeEnemies(): EnemyState[] {
  return [
    { id: 0, pos: new THREE.Vector3(-300, -20, -800), alive: true, lastFired: 0 },
    { id: 1, pos: new THREE.Vector3(200, -20, -1200), alive: true, lastFired: 500 },
    { id: 2, pos: new THREE.Vector3(-600, -20, -1600), alive: true, lastFired: 1000 },
    { id: 3, pos: new THREE.Vector3(500, -20, -2000), alive: true, lastFired: 1500 },
    { id: 4, pos: new THREE.Vector3(-100, -20, -2500), alive: true, lastFired: 2000 },
    { id: 5, pos: new THREE.Vector3(700, -20, -1000), alive: true, lastFired: 2500 },
  ];
}

// ─── Scene component (inside Canvas) ─────────────────────────────────────────
function GameScene() {
  const { camera } = useThree();

  // Zustand actions
  const missionStatus = useGameStore((s) => s.missionStatus);
  const setMissionStatus = useGameStore((s) => s.setMissionStatus);
  const setThrottle = useGameStore((s) => s.setThrottle);
  const setHealth = useGameStore((s) => s.setHealth);
  const addScore = useGameStore((s) => s.addScore);
  const setLastShotTime = useGameStore((s) => s.setLastShotTime);

  // Refs for mutable game state (avoid re-renders in game loop)
  const playerRef = useRef<THREE.Mesh>(null);
  const playerVel = useRef(new THREE.Vector3());
  const playerEuler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'));
  const throttleRef = useRef(0);
  const healthRef = useRef(100);
  const scoreRef = useRef(0);
  const lastShotRef = useRef(0);
  const gameOverRef = useRef(false);

  // Bullet pool
  const bulletIdCounter = useRef(0);
  const bullets = useRef<BulletState[]>([]);
  const bulletMeshes = useRef<Map<number, THREE.Mesh>>(new Map());

  // Enemy state
  const enemies = useRef<EnemyState[]>(makeEnemies());
  const enemyMeshes = useRef<Map<number, THREE.Mesh>>(new Map());
  const aliveCount = useRef(ENEMY_COUNT);

  // Reset when mission restarts
  useEffect(() => {
    if (missionStatus === 'in-progress') {
      throttleRef.current = 0;
      healthRef.current = 100;
      scoreRef.current = 0;
      gameOverRef.current = false;
      bullets.current = [];
      enemies.current = makeEnemies();
      aliveCount.current = ENEMY_COUNT;
      if (playerRef.current) {
        playerRef.current.position.set(0, 50, 200);
        playerRef.current.rotation.set(0, 0, 0);
      }
      playerEuler.current.set(0, 0, 0);
    }
  }, [missionStatus]);

  // Attach keyboard listeners
  useEffect(() => {
    return attachKeyListeners();
  }, []);

  // ── Main game loop ──────────────────────────────────────────────────────────
  useFrame((_, delta) => {
    if (missionStatus !== 'in-progress' || gameOverRef.current) return;
    if (!playerRef.current) return;

    const now = performance.now();
    const dt = Math.min(delta, 0.05); // cap at 50ms to avoid spiral of death

    // ── Read input ────────────────────────────────────────────────────────────
    const touch = getTouchState();
    const pitchUp    = heldKeys.has('KeyW') || heldKeys.has('ArrowUp')    || touch.joystickY < -0.3;
    const pitchDown  = heldKeys.has('KeyS') || heldKeys.has('ArrowDown')  || touch.joystickY > 0.3;
    const rollLeft   = heldKeys.has('KeyA') || heldKeys.has('ArrowLeft')  || touch.joystickX < -0.3;
    const rollRight  = heldKeys.has('KeyD') || heldKeys.has('ArrowRight') || touch.joystickX > 0.3;
    const shooting   = heldKeys.has('Space') || touch.shoot;
    const thrUp      = heldKeys.has('ShiftLeft') || heldKeys.has('ShiftRight') || touch.throttleUp;
    const thrDown    = heldKeys.has('ControlLeft') || heldKeys.has('ControlRight') || touch.throttleDown;

    // ── Throttle ──────────────────────────────────────────────────────────────
    if (thrUp)   throttleRef.current = Math.min(THROTTLE_MAX, throttleRef.current + 40 * dt);
    if (thrDown) throttleRef.current = Math.max(0, throttleRef.current - 40 * dt);
    // Auto-throttle: W pitches up and also increases throttle slightly
    if (pitchUp && !thrUp && !thrDown) throttleRef.current = Math.min(THROTTLE_MAX, throttleRef.current + 15 * dt);
    setThrottle(Math.round(throttleRef.current));

    // ── Rotation ──────────────────────────────────────────────────────────────
    if (pitchUp)   playerEuler.current.x -= PITCH_SPEED;
    if (pitchDown) playerEuler.current.x += PITCH_SPEED;
    if (rollLeft)  playerEuler.current.y += TURN_SPEED;
    if (rollRight) playerEuler.current.y -= TURN_SPEED;
    // Clamp pitch
    playerEuler.current.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, playerEuler.current.x));

    playerRef.current.rotation.copy(playerEuler.current);

    // ── Movement ──────────────────────────────────────────────────────────────
    const speed = (throttleRef.current / THROTTLE_MAX) * SPEED_SCALE * 60 * dt;
    const forward = new THREE.Vector3(0, 0, -1).applyEuler(playerEuler.current);
    playerRef.current.position.addScaledVector(forward, speed);

    // Keep aircraft above ocean
    if (playerRef.current.position.y < -10) {
      playerRef.current.position.y = -10;
      // Crash damage
      healthRef.current = Math.max(0, healthRef.current - 30);
      setHealth(healthRef.current);
    }

    // ── Player bullets ────────────────────────────────────────────────────────
    if (shooting && now - lastShotRef.current > BULLET_COOLDOWN) {
      lastShotRef.current = now;
      setLastShotTime(now);
      const bulletDir = forward.clone();
      bullets.current.push({
        id: bulletIdCounter.current++,
        pos: playerRef.current.position.clone().addScaledVector(forward, 15),
        dir: bulletDir,
        traveled: 0,
        active: true,
        isEnemy: false,
      });
    }

    // ── Enemy AI: fire back ───────────────────────────────────────────────────
    for (const enemy of enemies.current) {
      if (!enemy.alive) continue;
      if (now - enemy.lastFired > ENEMY_FIRE_INTERVAL) {
        enemy.lastFired = now;
        const toPlayer = playerRef.current.position.clone().sub(enemy.pos).normalize();
        bullets.current.push({
          id: bulletIdCounter.current++,
          pos: enemy.pos.clone().add(new THREE.Vector3(0, 5, 0)),
          dir: toPlayer,
          traveled: 0,
          active: true,
          isEnemy: true,
          enemyIdx: enemy.id,
        });
      }
    }

    // ── Move bullets & check collisions ──────────────────────────────────────
    for (const bullet of bullets.current) {
      if (!bullet.active) continue;

      const step = bullet.isEnemy ? ENEMY_BULLET_SPEED : BULLET_SPEED;
      const range = bullet.isEnemy ? ENEMY_BULLET_RANGE : BULLET_RANGE;
      bullet.pos.addScaledVector(bullet.dir, step);
      bullet.traveled += step;

      if (bullet.traveled > range) {
        bullet.active = false;
        continue;
      }

      // Update mesh position
      const mesh = bulletMeshes.current.get(bullet.id);
      if (mesh) mesh.position.copy(bullet.pos);

      if (!bullet.isEnemy) {
        // Check vs enemies
        for (const enemy of enemies.current) {
          if (!enemy.alive) continue;
          if (bullet.pos.distanceTo(enemy.pos) < ENEMY_HIT_RADIUS) {
            bullet.active = false;
            enemy.alive = false;
            aliveCount.current--;
            scoreRef.current += SCORE_PER_KILL;
            addScore(SCORE_PER_KILL);
            // Hide enemy mesh
            const em = enemyMeshes.current.get(enemy.id);
            if (em) em.visible = false;
            break;
          }
        }
      } else {
        // Check vs player
        if (bullet.pos.distanceTo(playerRef.current.position) < PLAYER_HIT_RADIUS) {
          bullet.active = false;
          healthRef.current = Math.max(0, healthRef.current - ENEMY_DAMAGE);
          setHealth(healthRef.current);
        }
      }
    }

    // Prune dead bullets
    bullets.current = bullets.current.filter((b) => b.active);

    // ── Win / lose check ──────────────────────────────────────────────────────
    if (healthRef.current <= 0 && !gameOverRef.current) {
      gameOverRef.current = true;
      setMissionStatus('failed');
      return;
    }
    if (aliveCount.current <= 0 && !gameOverRef.current) {
      gameOverRef.current = true;
      setMissionStatus('completed');
      return;
    }

    // ── Chase camera ──────────────────────────────────────────────────────────
    const camOffset = new THREE.Vector3(0, 25, 80).applyEuler(
      new THREE.Euler(0, playerEuler.current.y, 0)
    );
    const targetCamPos = playerRef.current.position.clone().add(camOffset);
    camera.position.lerp(targetCamPos, 0.08);
    camera.lookAt(playerRef.current.position);
  });

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[500, 800, 300]} intensity={1.2} castShadow />

      {/* Stars */}
      <Stars radius={8000} depth={200} count={3000} factor={4} saturation={0} fade />

      {/* Fog */}
      <fog attach="fog" args={['#050d1a', 2000, 12000]} />

      {/* Ocean */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -20, 0]} receiveShadow>
        <planeGeometry args={[40000, 40000, 4, 4]} />
        <meshStandardMaterial color="#0a2a4a" roughness={0.9} metalness={0.05} />
      </mesh>

      {/* Player aircraft — A-10 silhouette (box stand-in) */}
      <mesh ref={playerRef} position={[0, 50, 200]} castShadow>
        {/* Fuselage */}
        <boxGeometry args={[8, 3, 20]} />
        <meshStandardMaterial color="#4a5568" roughness={0.7} />
      </mesh>

      {/* Enemy ships */}
      {enemies.current.map((enemy) => (
        <mesh
          key={enemy.id}
          ref={(el) => { if (el) enemyMeshes.current.set(enemy.id, el); }}
          position={[enemy.pos.x, enemy.pos.y, enemy.pos.z]}
          castShadow
        >
          <boxGeometry args={[30, 8, 60]} />
          <meshStandardMaterial color="#7f1d1d" roughness={0.8} />
        </mesh>
      ))}

      {/* Bullet meshes — rendered for active bullets */}
      <BulletRenderer bulletsRef={bullets} meshMapRef={bulletMeshes} />
    </>
  );
}

// ─── Bullet renderer (separate component to manage bullet mesh pool) ──────────
function BulletRenderer({
  bulletsRef,
  meshMapRef,
}: {
  bulletsRef: React.RefObject<BulletState[]>;
  meshMapRef: React.RefObject<Map<number, THREE.Mesh>>;
}) {
  // We render a fixed pool of bullet meshes and reuse them
  // Since bullets are managed imperatively via refs, we use a dummy
  // useFrame to sync mesh positions (already done in GameScene).
  // This component just provides the mesh objects to the scene.
  const [bulletIds, setBulletIds] = useState<number[]>([]);

  useFrame(() => {
    const current = bulletsRef.current ?? [];
    const activeIds = current.filter((b) => b.active).map((b) => b.id);
    // Only update state if the set of IDs changed (avoid thrashing)
    setBulletIds((prev) => {
      if (prev.length === activeIds.length && prev.every((id, i) => id === activeIds[i])) return prev;
      return activeIds;
    });
  });

  return (
    <>
      {bulletIds.map((id) => {
        const bullet = (bulletsRef.current ?? []).find((b) => b.id === id);
        if (!bullet) return null;
        return (
          <mesh
            key={id}
            ref={(el) => { if (el) meshMapRef.current?.set(id, el); }}
            position={[bullet.pos.x, bullet.pos.y, bullet.pos.z]}
          >
            <sphereGeometry args={[bullet.isEnemy ? 2 : 1, 4, 4]} />
            <meshBasicMaterial color={bullet.isEnemy ? '#ff4444' : '#ffff00'} />
          </mesh>
        );
      })}
    </>
  );
}

// ─── Canvas wrapper ───────────────────────────────────────────────────────────
export function GameCanvas() {
  return (
    <div className="fixed inset-0">
      <Canvas
        camera={{ fov: 75, near: 0.1, far: 20000, position: [0, 75, 280] }}
        gl={{ antialias: true, alpha: false }}
        shadows
      >
        <Suspense fallback={null}>
          <GameScene />
        </Suspense>
      </Canvas>
    </div>
  );
}
