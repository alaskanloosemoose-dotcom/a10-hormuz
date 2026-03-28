export interface TouchControlState {
  joystickX: number;   // -1 to 1 (left/right)
  joystickY: number;   // -1 to 1 (up/down)
  throttleUp: boolean;
  throttleDown: boolean;
  shoot: boolean;
  missile: boolean;
}

const state: TouchControlState = {
  joystickX: 0,
  joystickY: 0,
  throttleUp: false,
  throttleDown: false,
  shoot: false,
  missile: false,
};

// Active touch tracking: touchId -> zone
const activeTouches = new Map<number, string>();

// Joystick origin (set when joystick touch starts)
let joystickOrigin: { x: number; y: number } | null = null;
const JOYSTICK_RADIUS = 60; // px

function getZone(x: number, y: number): string {
  const w = window.innerWidth;
  const h = window.innerHeight;

  if (x < w * 0.45) {
    return 'joystick';
  }
  if (x > w * 0.55) {
    if (y < h * 0.5) return 'throttle-up';
    if (y >= h * 0.5 && y < h * 0.75) return 'throttle-down';
    if (y >= h * 0.75) return 'shoot';
  }
  return 'none';
}

function onTouchStart(e: TouchEvent) {
  for (const touch of Array.from(e.changedTouches)) {
    const zone = getZone(touch.clientX, touch.clientY);
    activeTouches.set(touch.identifier, zone);

    if (zone === 'joystick') {
      joystickOrigin = { x: touch.clientX, y: touch.clientY };
      state.joystickX = 0;
      state.joystickY = 0;
    } else if (zone === 'throttle-up') {
      state.throttleUp = true;
    } else if (zone === 'throttle-down') {
      state.throttleDown = true;
    } else if (zone === 'shoot') {
      state.shoot = true;
    }
  }
}

function onTouchMove(e: TouchEvent) {
  for (const touch of Array.from(e.changedTouches)) {
    const zone = activeTouches.get(touch.identifier);
    if (zone === 'joystick' && joystickOrigin) {
      const dx = touch.clientX - joystickOrigin.x;
      const dy = touch.clientY - joystickOrigin.y;
      state.joystickX = Math.max(-1, Math.min(1, dx / JOYSTICK_RADIUS));
      state.joystickY = Math.max(-1, Math.min(1, dy / JOYSTICK_RADIUS));
    }
  }
}

function onTouchEnd(e: TouchEvent) {
  for (const touch of Array.from(e.changedTouches)) {
    const zone = activeTouches.get(touch.identifier);
    activeTouches.delete(touch.identifier);

    if (zone === 'joystick') {
      // Only reset joystick if no other joystick touches remain
      const hasJoystick = Array.from(activeTouches.values()).some((z) => z === 'joystick');
      if (!hasJoystick) {
        state.joystickX = 0;
        state.joystickY = 0;
        joystickOrigin = null;
      }
    } else if (zone === 'throttle-up') {
      state.throttleUp = false;
    } else if (zone === 'throttle-down') {
      state.throttleDown = false;
    } else if (zone === 'shoot') {
      state.shoot = false;
    }
  }
}

/** Call once to attach global touch listeners */
export function initTouchControls() {
  window.addEventListener('touchstart', onTouchStart, { passive: true });
  window.addEventListener('touchmove', onTouchMove, { passive: true });
  window.addEventListener('touchend', onTouchEnd, { passive: true });
  window.addEventListener('touchcancel', onTouchEnd, { passive: true });
}

/** Call on cleanup to remove listeners */
export function destroyTouchControls() {
  window.removeEventListener('touchstart', onTouchStart);
  window.removeEventListener('touchmove', onTouchMove);
  window.removeEventListener('touchend', onTouchEnd);
  window.removeEventListener('touchcancel', onTouchEnd);
}

/** Read current touch state (call each frame) */
export function getTouchState(): Readonly<TouchControlState> {
  return state;
}

/** Programmatically set missile button state (called from VirtualControls) */
export function setMissilePressed(pressed: boolean) {
  state.missile = pressed;
}
