import { state } from "./gameState.js";

const scoreElement = document.getElementById("score");
const healthElement = document.getElementById("health");
const finalScoreElement = document.getElementById("final-score");
const gameOverScreen = document.getElementById("game-over");
const startScreen = document.getElementById("start-screen");

export function updateUI() {
  scoreElement.textContent = state.score;
  healthElement.textContent = state.health;
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
