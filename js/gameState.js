import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js";

export const state = {
  score: 0,
  health: 100,
  gameActive: false,
  scene: null,
  camera: null,
  renderer: null,
  minimapRenderer: null,
  minimapCamera: null,
  playerTank: null,
  ground: null,
  boxes: [],
  walls: [],
  enemyTanks: [],
  playerProjectiles: [],
  enemyProjectiles: [],
  explosions: [],
  minimapMarkers: [],
  cameraRotation: { phi: 0, theta: 0 },
  playerColor: "#1e90ff",
  stats: {
    maxHealth: 100,
    armor: 0,
    firePower: 25,
    fireRate: 0.5, // Seconds between shots
  },
  lastShotTime: 0,
};
