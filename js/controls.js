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
