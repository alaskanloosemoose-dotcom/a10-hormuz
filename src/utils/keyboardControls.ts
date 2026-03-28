export interface KeyboardInput {
  throttle: number;
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  shoot: boolean;
  missile: boolean;
  cameraToggle: boolean;
}

export const handleKeyboardInput = (e: KeyboardEvent): KeyboardInput => {
  const keys: Record<string, boolean> = {};
  for (let i = 0; i < e.code.length; i++) {
    keys[e.code] = true;
  }

  // Throttle (WASD or Arrow keys)
  const throttle = (keys['KeyW'] || keys['ArrowUp']) ? 100 :
                   (keys['KeyS'] || keys['ArrowDown']) ? 0 :
                   (keys['KeyA'] || keys['ArrowLeft']) ? 50 :
                   (keys['KeyD'] || keys['ArrowRight']) ? 75 : 0;

  return {
    throttle,
    left: keys['KeyA'] || keys['ArrowLeft'],
    right: keys['KeyD'] || keys['ArrowRight'],
    up: keys['KeyW'] || keys['ArrowUp'],
    down: keys['KeyS'] || keys['ArrowDown'],
    shoot: keys['Space'],
    missile: keys['ShiftLeft'] || keys['ShiftRight'],
    cameraToggle: keys['KeyC'],
  };
};

export const handleTouchInput = (touchEvent: TouchEvent): KeyboardInput => {
  const touches = Array.from(touchEvent.changedTouches);
  
  let throttle = 0;
  let left = false;
  let right = false;
  let up = false;
  let down = false;
  let shoot = false;
  let missile = false;

  for (const touch of touches) {
    const x = touch.clientX;
    const y = touch.clientY;
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Left side of screen - movement
    if (x < width / 2) {
      if (y < height / 3) {
        up = true;
      } else if (y < 2 * height / 3) {
        left = true;
      } else {
        down = true;
      }
    } else {
      // Right side of screen - throttle and actions
      if (y < height / 3) {
        throttle = 100;
      } else if (y < 2 * height / 3) {
        right = true;
      } else {
        shoot = true;
      }
    }
  }

  // Check for missile button (usually a separate button)
  const missileButton = document.querySelector('[data-missile]');
  if (missileButton && (missileButton as HTMLElement).dataset.touched === 'true') {
    missile = true;
  }

  return { throttle, left, right, up, down, shoot, missile, cameraToggle: false };
};
