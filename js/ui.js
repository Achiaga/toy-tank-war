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
  healthElement.textContent = Math.ceil(state.health);
  armorElement.textContent = state.stats.armor;
  fireRateElement.textContent = state.stats.fireRate;
}

export function gameOver() {
  state.gameActive = false;
  finalScoreElement.textContent = state.score;
  gameOverScreen.style.display = "flex";
}

export function initUI() {
  startScreen.style.display = "none";
  gameOverScreen.style.display = "none";
  updateUI();
}
