import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js";
import { state } from "./gameState.js";

export function createEnvironment() {
  const groundGeometry = new THREE.PlaneGeometry(50, 50);
  const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x7cfc00 });
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

export function createMaze() {
  const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
  const mazeLayout = [
    [-20, -15, 15, false],
    [-10, -5, 20, false],
    [5, 5, 15, false],
    [-15, 15, 30, false],
    [-15, -20, 10, true],
    [0, -20, 15, true],
    [15, -15, 20, true],
    [-5, 0, 15, true],
    [10, -5, 10, true],
  ];

  mazeLayout.forEach(([x, z, length, isVertical]) => {
    const wallGeometry = isVertical
      ? new THREE.BoxGeometry(1, 3, length)
      : new THREE.BoxGeometry(length, 3, 1);
    const wall = new THREE.Mesh(wallGeometry, wallMaterial);
    wall.position.set(
      isVertical ? x : x + length / 2,
      1.5,
      isVertical ? z + length / 2 : z
    );
    wall.castShadow = true;
    wall.receiveShadow = true;
    state.scene.add(wall);
    state.walls.push(wall);
  });
}
