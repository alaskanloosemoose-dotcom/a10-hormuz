import { create } from 'zustand';

export interface GameState {
  score: number;
  health: number;
  throttle: number;
  missionStatus: 'idle' | 'in-progress' | 'completed' | 'failed';
  lastShotTime: number;
  lastMissileTime: number;
  isPaused: boolean;
  cameraView: 'chase' | 'cockpit';
}

export interface Action {
  addScore: (points: number) => void;
  setHealth: (health: number) => void;
  setThrottle: (throttle: number) => void;
  setMissionStatus: (status: GameState['missionStatus']) => void;
  setLastShotTime: (time: number) => void;
  setLastMissileTime: (time: number) => void;
  setIsPaused: (paused: boolean) => void;
  setCameraView: (view: GameState['cameraView']) => void;
  reset: () => void;
}

export const useGameStore = create<GameState & Action>((set, get) => ({
  score: 0,
  health: 100,
  throttle: 0,
  missionStatus: 'idle',
  lastShotTime: 0,
  lastMissileTime: 0,
  isPaused: false,
  cameraView: 'chase',

  addScore: (points) => set((state) => ({ score: state.score + points })),
  setHealth: (health) => set((state) => ({ health: Math.min(100, Math.max(0, health)) })),
  setThrottle: (throttle) => set((state) => ({ throttle: Math.min(100, Math.max(0, throttle)) })),
  setMissionStatus: (status) => set((state) => ({ missionStatus: status })),
  setLastShotTime: (time) => set((state) => ({ lastShotTime: time })),
  setLastMissileTime: (time) => set((state) => ({ lastMissileTime: time })),
  setIsPaused: (paused) => set((state) => ({ isPaused: paused })),
  setCameraView: (view) => set((state) => ({ cameraView: view })),
  reset: () => set({
    score: 0,
    health: 100,
    throttle: 0,
    missionStatus: 'idle',
    lastShotTime: 0,
    lastMissileTime: 0,
    isPaused: false,
    cameraView: 'chase',
  }),
}));
