import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js";

export const state = {
  score: 0,
  enemiesDefeated: 0,
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
  platformCaptureTime: null, // When player entered platform
  platformCaptureRequired: 10, // Seconds needed on platform to win
  selectedTankType: "balanced",
  tankConfigs: {
    heavy: {
      name: "Heavy",
      maxHealth: 200,
      armor: 50,
      firePower: 40,
      fireRate: 1.0,
      speed: 0.1,
      rotationSpeed: 0.02,
      size: 1.2, // Scale factor
      color: "#8B0000",
    },
    balanced: {
      name: "Balanced",
      maxHealth: 100,
      armor: 0,
      firePower: 25,
      fireRate: 0.5,
      speed: 0.15,
      rotationSpeed: 0.03,
      size: 1.0,
      color: "#1e90ff",
    },
    scout: {
      name: "Scout",
      maxHealth: 60,
      armor: -10, // Takes more damage
      firePower: 15,
      fireRate: 0.25,
      speed: 0.25,
      rotationSpeed: 0.05,
      size: 0.8,
      color: "#006400",
    },
    spanish: {
      name: "Spanish",
      maxHealth: 150,
      armor: 20,
      firePower: 100, // Mucho damage
      fireRate: 2.0, // Slow reload
      speed: 0.12,
      rotationSpeed: 0.02,
      size: 1.1,
      color: "#FFC400", // Spanish yellow/gold
    },
  },
};
