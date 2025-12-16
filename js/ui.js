import { state } from "./gameState.js";

const scoreElement = document.getElementById("score");
const healthElement = document.getElementById("health");
const armorElement = document.getElementById("armor");
const fireRateElement = document.getElementById("fire-rate");
const finalScoreElement = document.getElementById("final-score");
const gameOverScreen = document.getElementById("game-over");
const startScreen = document.getElementById("start-screen");

export function updateUI() {
  scoreElement.textContent = state.score;
  // healthElement.textContent = Math.ceil(state.health); // Removed text update
  armorElement.textContent = state.stats.armor;
  fireRateElement.textContent = state.stats.fireRate;

  // Update Health Bar
  const healthBar = document.getElementById("health-bar");
  const healthPercent = Math.max(
    0,
    (state.health / state.stats.maxHealth) * 100
  );
  if (healthBar) {
    healthBar.style.width = `${healthPercent}%`;
    // Change color based on health
    if (healthPercent > 60) healthBar.style.backgroundColor = "#00ff00";
    else if (healthPercent > 30) healthBar.style.backgroundColor = "#ffff00";
    else healthBar.style.backgroundColor = "#ff0000";
  }

  // Low Health Overlay
  const overlay = document.getElementById("damage-overlay");
  if (overlay) {
    if (healthPercent <= 30 && state.health > 0) {
      overlay.classList.add("low-health");
    } else {
      overlay.classList.remove("low-health");
    }
  }
}

export function triggerDamageFlash() {
  const overlay = document.getElementById("damage-overlay");
  if (overlay) {
    overlay.classList.remove("flash");
    void overlay.offsetWidth; // Trigger reflow
    overlay.classList.add("flash");
    setTimeout(() => {
      overlay.classList.remove("flash");
    }, 100);
  }
}

export function gameOver() {
  state.gameActive = false;
  document.querySelector("#game-over h2").textContent = "Game Over";
  finalScoreElement.textContent = state.score;
  gameOverScreen.style.display = "flex";
}

export function gameWin() {
  state.gameActive = false;
  document.querySelector("#game-over h2").textContent = "You Win!";
  finalScoreElement.textContent = state.score;
  gameOverScreen.style.display = "flex";
}

export function initUI() {
  startScreen.style.display = "none";
  gameOverScreen.style.display = "none";
  updateUI();
}
