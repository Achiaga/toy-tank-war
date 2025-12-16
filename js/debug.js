import { state } from "./gameState.js";

// Toggle functions for each debug mode
export function toggleImmortal() {
  state.debug.immortal = !state.debug.immortal;
  updateDebugUI();
  console.log(`Immortality: ${state.debug.immortal ? "ON" : "OFF"}`);
}

export function toggleNoTarget() {
  state.debug.noTarget = !state.debug.noTarget;
  updateDebugUI();
  console.log(`No Targeting: ${state.debug.noTarget ? "ON" : "OFF"}`);
}

export function toggleFlying() {
  state.debug.flying = !state.debug.flying;
  updateDebugUI();
  console.log(`Flying Mode: ${state.debug.flying ? "ON" : "OFF"}`);
}

export function toggleNoclip() {
  state.debug.noclip = !state.debug.noclip;
  updateDebugUI();
  console.log(`Noclip: ${state.debug.noclip ? "ON" : "OFF"}`);
}

export function toggleSpeedBoost() {
  state.debug.speedBoost = !state.debug.speedBoost;
  updateDebugUI();
  console.log(`Speed Boost: ${state.debug.speedBoost ? "ON" : "OFF"}`);
}

export function toggleInfiniteAmmo() {
  state.debug.infiniteAmmo = !state.debug.infiniteAmmo;
  updateDebugUI();
  console.log(`Infinite Ammo: ${state.debug.infiniteAmmo ? "ON" : "OFF"}`);
}

export function toggleDebugPanel() {
  state.debug.enabled = !state.debug.enabled;
  const panel = document.getElementById("debug-panel");
  if (panel) {
    panel.style.display = state.debug.enabled ? "block" : "none";
  }
  console.log(`Debug Panel: ${state.debug.enabled ? "OPEN" : "CLOSED"}`);
}

// Update UI checkboxes and indicators
export function updateDebugUI() {
  const checkboxes = {
    immortal: document.getElementById("debug-immortal"),
    noTarget: document.getElementById("debug-notarget"),
    flying: document.getElementById("debug-flying"),
    noclip: document.getElementById("debug-noclip"),
    speedBoost: document.getElementById("debug-speed"),
    infiniteAmmo: document.getElementById("debug-ammo"),
  };

  // Update checkboxes
  Object.keys(checkboxes).forEach((key) => {
    if (checkboxes[key]) {
      checkboxes[key].checked = state.debug[key];
    }
  });

  // Update active modes indicator
  const activeModesEl = document.getElementById("debug-active-modes");
  if (activeModesEl) {
    const activeModes = [];
    if (state.debug.immortal) activeModes.push("Immortal");
    if (state.debug.noTarget) activeModes.push("No Target");
    if (state.debug.flying) activeModes.push("Flying");
    if (state.debug.noclip) activeModes.push("Noclip");
    if (state.debug.speedBoost) activeModes.push("Speed x3");
    if (state.debug.infiniteAmmo) activeModes.push("∞ Ammo");

    if (activeModes.length > 0) {
      activeModesEl.textContent = activeModes.join(" | ");
      activeModesEl.style.display = "block";
    } else {
      activeModesEl.style.display = "none";
    }
  }
}

// Initialize debug panel and event listeners
export function initDebugPanel() {
  const panel = document.getElementById("debug-panel");
  if (!panel) return;

  // Add event listeners to checkboxes
  document
    .getElementById("debug-immortal")
    ?.addEventListener("change", toggleImmortal);
  document
    .getElementById("debug-notarget")
    ?.addEventListener("change", toggleNoTarget);
  document
    .getElementById("debug-flying")
    ?.addEventListener("change", toggleFlying);
  document
    .getElementById("debug-noclip")
    ?.addEventListener("change", toggleNoclip);
  document
    .getElementById("debug-speed")
    ?.addEventListener("change", toggleSpeedBoost);
  document
    .getElementById("debug-ammo")
    ?.addEventListener("change", toggleInfiniteAmmo);

  // Initialize UI state
  updateDebugUI();
}

// Handle debug keyboard shortcuts
export function handleDebugKeys(e) {
  if (!state.gameActive && e.key !== "F1") return; // Only F1 works outside game

  switch (e.key) {
    case "F1":
      e.preventDefault();
      toggleDebugPanel();
      break;
    case "F2":
      e.preventDefault();
      toggleImmortal();
      break;
    case "F3":
      e.preventDefault();
      toggleNoTarget();
      break;
    case "F4":
      e.preventDefault();
      toggleFlying();
      break;
    case "F5":
      e.preventDefault();
      toggleNoclip();
      break;
    case "F6":
      e.preventDefault();
      toggleSpeedBoost();
      break;
    case "F7":
      e.preventDefault();
      toggleInfiniteAmmo();
      break;
  }
}
