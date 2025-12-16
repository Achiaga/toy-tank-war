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
  const gateMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });

  // === BOUNDARY WALLS WITH CENTERED GATES (unchanged - already split with ~20-unit gaps) ===
  const boundaryWalls = [];

  boundaryWalls.forEach(({ size, pos }) => {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(...size), wallMaterial);
    wall.position.set(...pos);
    wall.castShadow = true;
    wall.receiveShadow = true;
    state.scene.add(wall);
    state.walls.push(wall);
  });

  // === GATE PILLARS - FIXED POSITIONS TO NOT BLOCK PATH ===
  // Placed exactly at the inner edges of the wall segments (±10 on relevant axis)
  const gatePillars = [
    // North gate pillars (at x = ±10, z = -25)
    { pos: [-10, 1.5, -25] },
    { pos: [10, 1.5, -25] },

    // South gate
    { pos: [-10, 1.5, 25] },
    { pos: [10, 1.5, 25] },

    // East gate pillars (at z = ±10, x = 25)
    { pos: [25, 1.5, -10] },
    { pos: [25, 1.5, 10] },

    // West gate
    { pos: [-25, 1.5, -10] },
    { pos: [-25, 1.5, 10] },
  ];

  gatePillars.forEach(({ pos }) => {
    const pillar = new THREE.Mesh(
      new THREE.BoxGeometry(3, 6, 3), // 3 units wide, leaves plenty of clearance
      gateMaterial
    );
    pillar.position.set(...pos);
    pillar.castShadow = true;
    pillar.receiveShadow = true;
    state.scene.add(pillar);
    state.walls.push(pillar); // Still collidable (tanks can drive between them)
  });
}

export function createBattleArena() {
  // Expand Ground (large flat arena)
  state.ground.geometry.dispose();
  state.ground.geometry = new THREE.PlaneGeometry(500, 500);

  const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x555555 });
  const obstacleMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
  const gateMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });

  // === OUTER BOUNDARY WALLS WITH GATES (unchanged) ===
  const outerWalls = [
    { size: [30, 5, 2], pos: [-30, 2.5, -45] },
    { size: [30, 5, 2], pos: [30, 2.5, -45] },
    { size: [30, 5, 2], pos: [-30, 2.5, 45] },
    { size: [30, 5, 2], pos: [30, 2.5, 45] },
    { size: [2, 5, 30], pos: [45, 2.5, -30] },
    { size: [2, 5, 30], pos: [45, 2.5, 30] },
    { size: [2, 5, 30], pos: [-45, 2.5, -30] },
    { size: [2, 5, 30], pos: [-45, 2.5, 30] },
  ];

  outerWalls.forEach(({ size, pos }) => {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(...size), wallMaterial);
    wall.position.set(...pos);
    wall.castShadow = true;
    wall.receiveShadow = true;
    state.scene.add(wall);
    state.walls.push(wall);
  });

  // === OUTER GATE PILLARS (unchanged) ===
  const outerGatePillars = [
    { pos: [-15, 2.5, -45] },
    { pos: [15, 2.5, -45] },
    { pos: [-15, 2.5, 45] },
    { pos: [15, 2.5, 45] },
    { pos: [45, 2.5, -15] },
    { pos: [45, 2.5, 15] },
    { pos: [-45, 2.5, -15] },
    { pos: [-45, 2.5, 15] },
  ];

  outerGatePillars.forEach(({ pos }) => {
    const pillar = new THREE.Mesh(new THREE.BoxGeometry(4, 8, 4), gateMaterial);
    pillar.position.set(...pos);
    pillar.castShadow = true;
    pillar.receiveShadow = true;
    state.scene.add(pillar);
    state.walls.push(pillar);
  });

  // === CORNER BUNKERS (unchanged) ===
  const cornerBunkers = [
    { size: [12, 4, 2], pos: [-34, 2, -34] },
    { size: [2, 4, 12], pos: [-40, 2, -28] },
    { size: [12, 4, 2], pos: [34, 2, -34] },
    { size: [2, 4, 12], pos: [40, 2, -28] },
    { size: [12, 4, 2], pos: [34, 2, 34] },
    { size: [2, 4, 12], pos: [40, 2, 28] },
    { size: [12, 4, 2], pos: [-34, 2, 34] },
    { size: [2, 4, 12], pos: [-40, 2, 28] },
  ];

  cornerBunkers.forEach(({ size, pos }) => {
    const obj = new THREE.Mesh(
      new THREE.BoxGeometry(...size),
      obstacleMaterial
    );
    obj.position.set(...pos);
    obj.castShadow = true;
    obj.receiveShadow = true;
    state.scene.add(obj);
    state.walls.push(obj);
  });

  // === INNER RING WITH 4 GATES ===
  // Split into segments with centered openings on N/S/E/W
  const innerRingSegments = [
    // North/South sides (horizontal segments, rotated)
    { size: [4, 4, 12], pos: [-8, 2, -15], rotation: [0, Math.PI / 2, 0] },
    { size: [4, 4, 12], pos: [8, 2, -15], rotation: [0, Math.PI / 2, 0] },
    { size: [4, 4, 12], pos: [-8, 2, 15], rotation: [0, Math.PI / 2, 0] },
    { size: [4, 4, 12], pos: [8, 2, 15], rotation: [0, Math.PI / 2, 0] },

    // East/West sides (vertical segments)
    { size: [12, 4, 4], pos: [-15, 2, -8] },
    { size: [12, 4, 4], pos: [-15, 2, 8] },
    { size: [12, 4, 4], pos: [15, 2, -8] },
    { size: [12, 4, 4], pos: [15, 2, 8] },
  ];

  innerRingSegments.forEach(({ size, pos, rotation = [0, 0, 0] }) => {
    const wall = new THREE.Mesh(
      new THREE.BoxGeometry(...size),
      obstacleMaterial
    );
    wall.position.set(...pos);
    wall.rotation.set(...rotation);
    wall.castShadow = true;
    wall.receiveShadow = true;
    state.scene.add(wall);
    state.walls.push(wall);
  });

  // === INNER GATE PILLARS (mark the 4 entrances to center) ===
  const innerGatePillars = [
    // North gate to center
    { pos: [-8, 2, -8] },
    { pos: [8, 2, -8] },
    // South
    { pos: [-8, 2, 8] },
    { pos: [8, 2, 8] },
    // East
    { pos: [8, 2, -8] },
    { pos: [8, 2, 8] },
    // West
    { pos: [-8, 2, -8] },
    { pos: [-8, 2, 8] },
  ];

  innerGatePillars.forEach(({ pos }) => {
    const pillar = new THREE.Mesh(new THREE.BoxGeometry(3, 6, 3), gateMaterial);
    pillar.position.set(...pos);
    pillar.castShadow = true;
    pillar.receiveShadow = true;
    state.scene.add(pillar);
    state.walls.push(pillar);
  });

  // === OUTER MAZE BARRIERS (unchanged, for additional paths/chokepoints) ===
  const mazeBarriers = [
    { size: [8, 4, 20], pos: [-20, 2, -10], rotation: [0, Math.PI / 4, 0] },
    { size: [8, 4, 20], pos: [20, 2, 10], rotation: [0, Math.PI / 4, 0] },
    { size: [8, 4, 20], pos: [20, 2, -10], rotation: [0, -Math.PI / 4, 0] },
    { size: [8, 4, 20], pos: [-20, 2, 10], rotation: [0, -Math.PI / 4, 0] },
    { size: [25, 4, 4], pos: [0, 2, -25] },
    { size: [25, 4, 4], pos: [0, 2, 25] },
    { size: [4, 4, 25], pos: [-25, 2, 0], rotation: [0, Math.PI / 2, 0] },
    { size: [4, 4, 25], pos: [25, 2, 0], rotation: [0, Math.PI / 2, 0] },
  ];

  mazeBarriers.forEach(({ size, pos, rotation = [0, 0, 0] }) => {
    const wall = new THREE.Mesh(
      new THREE.BoxGeometry(...size),
      obstacleMaterial
    );
    wall.position.set(...pos);
    wall.rotation.set(...rotation);
    wall.castShadow = true;
    wall.receiveShadow = true;
    state.scene.add(wall);
    state.walls.push(wall);
  });

  // === CENTRAL OBJECTIVE: Flat on ground (unchanged) ===
  const platformGeometry = new THREE.CylinderGeometry(12, 12, 0.2, 32);
  const platformMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 });
  const platform = new THREE.Mesh(platformGeometry, platformMaterial);
  platform.position.set(0, 0.1, 0);
  platform.receiveShadow = true;
  state.scene.add(platform);

  const pillarGeometry = new THREE.CylinderGeometry(2, 2, 8, 16);
  const pillarMaterial = new THREE.MeshStandardMaterial({
    color: 0x00ffff,
    emissive: 0x00ffff,
    emissiveIntensity: 2,
  });
  const objectivePillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
  objectivePillar.position.set(0, 4, 0);
  objectivePillar.castShadow = true;
  state.scene.add(objectivePillar);

  // === RANDOM OUTER OBSTACLES (unchanged) ===
  for (let i = 0; i < 40; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 20 + Math.random() * 25;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const size = Math.random() * 4 + 2;

    const obstacle = new THREE.Mesh(
      new THREE.BoxGeometry(size, size * 1.2, size),
      obstacleMaterial
    );
    obstacle.position.set(x, size * 0.6, z);
    obstacle.castShadow = true;
    obstacle.receiveShadow = true;
    state.scene.add(obstacle);
    state.walls.push(obstacle);
  }
}
