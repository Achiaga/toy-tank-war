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

export function generateMaze(width, height) {
  const maze = Array(height)
    .fill()
    .map(() => Array(width).fill(true));
  const stack = [];
  const startX = 1;
  const startY = 1;
  maze[startY][startX] = false;
  stack.push([startX, startY]);

  const directions = [
    [0, -2], // North
    [0, 2], // South
    [2, 0], // East
    [-2, 0], // West
  ];

  while (stack.length > 0) {
    const current = stack[stack.length - 1];
    const [cx, cy] = current;
    const neighbors = [];

    for (const [dx, dy] of directions) {
      const nx = cx + dx;
      const ny = cy + dy;
      if (
        nx > 0 &&
        nx < width - 1 &&
        ny > 0 &&
        ny < height - 1 &&
        maze[ny][nx]
      ) {
        neighbors.push([nx, ny, cx + dx / 2, cy + dy / 2]);
      }
    }

    if (neighbors.length > 0) {
      const [nx, ny, mx, my] =
        neighbors[Math.floor(Math.random() * neighbors.length)];
      maze[ny][nx] = false;
      maze[my][mx] = false;
      stack.push([nx, ny]);
    } else {
      stack.pop();
    }
  }

  // Clear center area for player spawn
  const centerX = Math.floor(width / 2);
  const centerY = Math.floor(height / 2);
  for (let y = centerY - 2; y <= centerY + 2; y++) {
    for (let x = centerX - 2; x <= centerX + 2; x++) {
      if (y >= 0 && y < height && x >= 0 && x < width) {
        maze[y][x] = false;
      }
    }
  }

  return maze;
}

export function createMaze() {
  const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
  const mazeWidth = 11;
  const mazeHeight = 11;
  const maze = generateMaze(mazeWidth, mazeHeight);

  // Randomly remove walls to make it more open (20% chance)
  for (let y = 1; y < mazeHeight - 1; y++) {
    for (let x = 1; x < mazeWidth - 1; x++) {
      if (maze[y][x] && Math.random() < 0.2) {
        maze[y][x] = false;
      }
    }
  }

  const cellSize = 50 / mazeWidth;

  for (let y = 0; y < mazeHeight; y++) {
    for (let x = 0; x < mazeWidth; x++) {
      if (maze[y][x]) {
        const wallGeometry = new THREE.BoxGeometry(cellSize, 3, cellSize);
        const wall = new THREE.Mesh(wallGeometry, wallMaterial);
        wall.position.set(
          (x - mazeWidth / 2) * cellSize + cellSize / 2,
          1.5,
          (y - mazeHeight / 2) * cellSize + cellSize / 2
        );
        wall.castShadow = true;
        wall.receiveShadow = true;
        state.scene.add(wall);
        state.walls.push(wall);
      }
    }
  }
}
