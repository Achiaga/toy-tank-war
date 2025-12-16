import { state } from "./gameState.js";
import { firePlayerProjectile } from "./entities.js";

export const keys = { w: false, a: false, s: false, d: false, space: false };

export function handleKeyDown(e) {
  let key = e.key.toLowerCase();
  if (key === "arrowup") key = "w";
  if (key === "arrowleft") key = "a";
  if (key === "arrowdown") key = "s";
  if (key === "arrowright") key = "d";
  if (key in keys) keys[key] = true;
  if (key === " " && !keys.space) {
    keys.space = true;
    firePlayerProjectile();
  }
}

export function handleKeyUp(e) {
  let key = e.key.toLowerCase();
  if (key === "arrowup") key = "w";
  if (key === "arrowleft") key = "a";
  if (key === "arrowdown") key = "s";
  if (key === "arrowright") key = "d";
  if (key in keys) keys[key] = false;
  if (key === " ") keys.space = false;
}

export function initControls() {
  document.addEventListener("click", () => {
    if (state.gameActive) {
      document.body.requestPointerLock();
    }
  });

  document.addEventListener("mousemove", (e) => {
    if (document.pointerLockElement === document.body && state.gameActive) {
      state.cameraRotation.theta -= e.movementX * 0.002;
      state.cameraRotation.phi -= e.movementY * 0.002;

      // Clamp vertical rotation
      state.cameraRotation.phi = Math.max(
        -Math.PI / 3,
        Math.min(Math.PI / 6, state.cameraRotation.phi)
      );
    }
  });
}
