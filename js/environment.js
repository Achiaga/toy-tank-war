import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js";
import { state } from "./gameState.js";

export function createEnvironment() {
  // Small practice arena - keeping your fixed gated version (open and accessible)
  const groundGeometry = new THREE.PlaneGeometry(50, 50);
  const groundMaterial = new THREE.MeshStandardMaterial({ color: 0xf7b23b });
  state.ground = new THREE.Mesh(groundGeometry, groundMaterial);
  state.ground.rotation.x = -Math.PI / 2;
  state.ground.receiveShadow = true;
  state.scene.add(state.ground);

  const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
  const gateMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });

  const boundaryWalls = [
    { size: [15, 3, 1], pos: [-17.5, 1.5, -25] },
    { size: [15, 3, 1], pos: [17.5, 1.5, -25] },
    { size: [15, 3, 1], pos: [-17.5, 1.5, 25] },
    { size: [15, 3, 1], pos: [17.5, 1.5, 25] },
    { size: [1, 3, 15], pos: [25, 1.5, -17.5] },
    { size: [1, 3, 15], pos: [25, 1.5, 17.5] },
    { size: [1, 3, 15], pos: [-25, 1.5, -17.5] },
    { size: [1, 3, 15], pos: [-25, 1.5, 17.5] },
  ];

  boundaryWalls.forEach(({ size, pos }) => {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(...size), wallMaterial);
    wall.position.set(...pos);
    wall.castShadow = true;
    wall.receiveShadow = true;
    state.scene.add(wall);
    state.walls.push(wall);
  });

  const gatePillars = [
    { pos: [-10, 1.5, -25] },
    { pos: [10, 1.5, -25] },
    { pos: [-10, 1.5, 25] },
    { pos: [10, 1.5, 25] },
    { pos: [25, 1.5, -10] },
    { pos: [25, 1.5, 10] },
    { pos: [-25, 1.5, -10] },
    { pos: [-25, 1.5, 10] },
  ];

  gatePillars.forEach(({ pos }) => {
    const pillar = new THREE.Mesh(new THREE.BoxGeometry(3, 6, 3), gateMaterial);
    pillar.position.set(...pos);
    pillar.castShadow = true;
    pillar.receiveShadow = true;
    state.scene.add(pillar);
    state.walls.push(pillar);
  });
}

export function createBattleArena() {
  // Fresh large flat arena
  state.ground.geometry.dispose();
  state.ground.geometry = new THREE.PlaneGeometry(500, 500);
  state.ground.material = new THREE.MeshStandardMaterial({ color: 0xaaaaaa }); // Neutral gray for battle feel

  const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x555555 });
  const obstacleMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
  const gateMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });

  // === OUTER BOUNDARY WITH 4 WIDE GATES ===
  const outerWalls = [
    // North & South segments
    { size: [40, 6, 3], pos: [-35, 3, -50] },
    { size: [40, 6, 3], pos: [35, 3, -50] },
    { size: [40, 6, 3], pos: [-35, 3, 50] },
    { size: [40, 6, 3], pos: [35, 3, 50] },
    // East & West segments
    { size: [3, 6, 40], pos: [50, 3, -35] },
    { size: [3, 6, 40], pos: [50, 3, 35] },
    { size: [3, 6, 40], pos: [-50, 3, -35] },
    { size: [3, 6, 40], pos: [-50, 3, 35] },
  ];

  outerWalls.forEach(({ size, pos }) => {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(...size), wallMaterial);
    wall.position.set(...pos);
    wall.castShadow = true;
    wall.receiveShadow = true;
    state.scene.add(wall);
    state.walls.push(wall);
  });

  // Gate pillars to mark entrances
  const gatePillars = [
    { pos: [-20, 3, -50] },
    { pos: [20, 3, -50] },
    { pos: [-20, 3, 50] },
    { pos: [20, 3, 50] },
    { pos: [50, 3, -20] },
    { pos: [50, 3, 20] },
    { pos: [-50, 3, -20] },
    { pos: [-50, 3, 20] },
  ];

  gatePillars.forEach(({ pos }) => {
    const pillar = new THREE.Mesh(
      new THREE.BoxGeometry(5, 10, 5),
      gateMaterial
    );
    pillar.position.set(...pos);
    pillar.castShadow = true;
    pillar.receiveShadow = true;
    state.scene.add(pillar);
    state.walls.push(pillar);
  });

  // === CORNER COVER BUNKERS (partial walls for protection) ===
  const bunkers = [
    // NW
    { size: [15, 5, 3], pos: [-40, 2.5, -40] },
    { size: [3, 5, 15], pos: [-40, 2.5, -40] },
    // NE
    { size: [15, 5, 3], pos: [40, 2.5, -40] },
    { size: [3, 5, 15], pos: [40, 2.5, -40] },
    // SE
    { size: [15, 5, 3], pos: [40, 2.5, 40] },
    { size: [3, 5, 15], pos: [40, 2.5, 40] },
    // SW
    { size: [15, 5, 3], pos: [-40, 2.5, 40] },
    { size: [3, 5, 15], pos: [-40, 2.5, 40] },
  ];

  bunkers.forEach(({ size, pos }) => {
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

  // === SCATTERED MID OBSTACLES (easy to go around, good cover) ===
  const midObstacles = [
    { pos: [-20, 2, 0], size: 8 },
    { pos: [20, 2, 0], size: 8 },
    { pos: [0, 2, -20], size: 10 },
    { pos: [0, 2, 20], size: 10 },
    { pos: [-15, 2, -15], size: 6 },
    { pos: [15, 2, 15], size: 6 },
    { pos: [15, 2, -15], size: 6 },
    { pos: [-15, 2, 15], size: 6 },
  ];

  midObstacles.forEach(({ pos, size }) => {
    const obs = new THREE.Mesh(
      new THREE.BoxGeometry(size, 4, size),
      obstacleMaterial
    );
    obs.position.set(...pos);
    obs.castShadow = true;
    obs.receiveShadow = true;
    state.scene.add(obs);
    state.walls.push(obs);
  });

  // === CENTRAL OBJECTIVE (open and glowing) ===
  const platform = new THREE.Mesh(
    new THREE.CylinderGeometry(15, 15, 0.05, 32),
    new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  platform.position.y = 0.15;
  state.scene.add(platform);

  const objectivePillar = new THREE.Mesh(
    new THREE.CylinderGeometry(3, 3, 12, 8),
    new THREE.MeshStandardMaterial({
      color: 0x00ffff,
      emissive: 0x00ffff,
      emissiveIntensity: 2,
    })
  );
  objectivePillar.position.y = 6;
  objectivePillar.castShadow = true;
  state.scene.add(objectivePillar);

  // === RANDOM SMALLER OBSTACLES (variety, not blocking) ===
  for (let i = 0; i < 30; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 15 + Math.random() * 30;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const size = 3 + Math.random() * 5;

    const obs = new THREE.Mesh(
      new THREE.BoxGeometry(size, size * 1.2, size),
      obstacleMaterial
    );
    obs.position.set(x, size * 0.6, z);
    obs.castShadow = true;
    obs.receiveShadow = true;
    state.scene.add(obs);
    state.walls.push(obs);
  }
}
