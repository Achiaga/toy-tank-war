import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js";
import { state } from "./gameState.js";

export function createEnvironment() {
  const groundGeometry = new THREE.PlaneGeometry(50, 50);
  const groundMaterial = new THREE.MeshStandardMaterial({ color: 0xf7b23b });
  state.ground = new THREE.Mesh(groundGeometry, groundMaterial);
  state.ground.rotation.x = -Math.PI / 2;
  state.ground.receiveShadow = true;
  state.scene.add(state.ground);

  const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
  const boundaryWalls = [
    { geometry: new THREE.BoxGeometry(50, 3, 1), position: [0, 1.5, -25] }, // North
    { geometry: new THREE.BoxGeometry(50, 3, 1), position: [0, 1.5, 25] }, // South
    { geometry: new THREE.BoxGeometry(1, 3, 50), position: [25, 1.5, 0] }, // East
    { geometry: new THREE.BoxGeometry(1, 3, 50), position: [-25, 1.5, 0] }, // West
  ];

  boundaryWalls.forEach(({ geometry, position }) => {
    const wall = new THREE.Mesh(geometry, wallMaterial);
    wall.position.set(...position);
    wall.castShadow = true;
    wall.receiveShadow = true;
    state.scene.add(wall);
    state.walls.push(wall);
  });
}

export function createBattleArena() {
  // Ground
  state.ground.geometry.dispose();
  state.ground.geometry = new THREE.PlaneGeometry(60, 60);

  const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x555555 });
  const obstacleMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });

  // Boundary Walls
  const boundaries = [
    { size: [60, 4, 1], pos: [0, 2, -30] }, // North
    { size: [60, 4, 1], pos: [0, 2, 30] }, // South
    { size: [1, 4, 60], pos: [30, 2, 0] }, // East
    { size: [1, 4, 60], pos: [-30, 2, 0] }, // West
  ];

  boundaries.forEach(({ size, pos }) => {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(...size), wallMaterial);
    wall.position.set(...pos);
    wall.castShadow = true;
    wall.receiveShadow = true;
    state.scene.add(wall);
    state.walls.push(wall);
  });

  // Internal Structures (Arena Layout)
  const structures = [
    // Center Cover
    { size: [4, 3, 4], pos: [0, 1.5, 0] },

    // Corner Rooms/Bunkers
    { size: [10, 3, 1], pos: [-20, 1.5, -20] },
    { size: [1, 3, 10], pos: [-25, 1.5, -15] },

    { size: [10, 3, 1], pos: [20, 1.5, 20] },
    { size: [1, 3, 10], pos: [25, 1.5, 15] },

    { size: [10, 3, 1], pos: [20, 1.5, -20] },
    { size: [1, 3, 10], pos: [25, 1.5, -15] },

    { size: [10, 3, 1], pos: [-20, 1.5, 20] },
    { size: [1, 3, 10], pos: [-25, 1.5, 15] },

    // Mid-field Barriers
    { size: [1, 2, 8], pos: [-10, 1, 0] },
    { size: [1, 2, 8], pos: [10, 1, 0] },
    { size: [8, 2, 1], pos: [0, 1, -10] },
    { size: [8, 2, 1], pos: [0, 1, 10] },
  ];

  structures.forEach(({ size, pos }) => {
    const wall = new THREE.Mesh(
      new THREE.BoxGeometry(...size),
      obstacleMaterial
    );
    wall.position.set(...pos);
    wall.castShadow = true;
    wall.receiveShadow = true;
    state.scene.add(wall);
    state.walls.push(wall);
  });
}
