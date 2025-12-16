import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js";
import { state } from "./gameState.js";

export function createTank(color, x, y, z) {
  const tank = new THREE.Group();

  // Body
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(1.4, 0.8, 3),
    new THREE.MeshStandardMaterial({ color })
  );
  body.castShadow = true;
  body.receiveShadow = true;
  tank.add(body);

  // Treads
  const treadGeometry = new THREE.BoxGeometry(0.4, 0.8, 3.2);
  const treadMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });

  const leftTread = new THREE.Mesh(treadGeometry, treadMaterial);
  leftTread.position.set(-0.9, 0, 0);
  leftTread.castShadow = true;
  leftTread.receiveShadow = true;
  tank.add(leftTread);

  const rightTread = new THREE.Mesh(treadGeometry, treadMaterial);
  rightTread.position.set(0.9, 0, 0);
  rightTread.castShadow = true;
  rightTread.receiveShadow = true;
  tank.add(rightTread);

  // Turret Pivot
  const turretPivot = new THREE.Group();
  turretPivot.position.y = 0.5;
  tank.add(turretPivot);

  // Turret
  const turret = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 0.6, 1.5),
    new THREE.MeshStandardMaterial({ color })
  );
  turret.castShadow = true;
  turret.receiveShadow = true;
  turretPivot.add(turret);

  // Cannon
  const cannon = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15, 0.15, 2, 16),
    new THREE.MeshStandardMaterial({ color: 0x333333 })
  );
  cannon.position.set(0, 0, 1.5);
  cannon.rotation.x = Math.PI / 2;
  cannon.castShadow = true;
  cannon.receiveShadow = true;
  turretPivot.add(cannon);

  // Hatch
  const hatch = new THREE.Mesh(
    new THREE.CylinderGeometry(0.4, 0.4, 0.1, 16),
    new THREE.MeshStandardMaterial({ color: 0x222222 })
  );
  hatch.position.set(0, 0.35, 0);
  turretPivot.add(hatch);

  // Eyes
  const eyeGeometry = new THREE.SphereGeometry(0.2, 16, 16);
  const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const pupilMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
  [-1, 1].forEach((i) => {
    const eye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    eye.position.set(i * 0.3, 0.3, 0.75); // Adjusted position for new turret
    turretPivot.add(eye);
    const pupil = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 16, 16),
      pupilMaterial
    );
    pupil.position.set(i * 0.3, 0.3, 0.9);
    turretPivot.add(pupil);
  });

  tank.position.set(x, y, z);
  tank.userData.turretPivot = turretPivot;
  return tank;
}

function findValidSpawnPosition(radius) {
  let x,
    z,
    validPosition = false;
  let attempts = 0;
  while (!validPosition && attempts < 100) {
    x = Math.random() * 56 - 28; // -28 to 28
    z = Math.random() * 56 - 28; // -28 to 28

    // Check map boundaries
    if (Math.abs(x) > 29 || Math.abs(z) > 29) {
      attempts++;
      continue;
    }

    // Check wall collisions
    validPosition = !state.walls.some((wall) => {
      const box = new THREE.Box3().setFromObject(wall);
      const entityPos = new THREE.Vector3(x, radius, z);
      const entitySize = new THREE.Vector3(radius * 2, radius * 2, radius * 2);
      const entityBox = new THREE.Box3().setFromCenterAndSize(
        entityPos,
        entitySize
      );
      return box.intersectsBox(entityBox);
    });
    attempts++;
  }
  return { x, z };
}

export function createPlayerTank() {
  // Spawn in outer ring (between 32 and 42)
  let x,
    z,
    valid = false;
  while (!valid) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 32 + Math.random() * 10; // 32 to 42
    x = Math.cos(angle) * radius;
    z = Math.sin(angle) * radius;

    // Check wall collisions
    valid = !state.walls.some((wall) => {
      const box = new THREE.Box3().setFromObject(wall);
      const entityPos = new THREE.Vector3(x, 1.5, z);
      const entitySize = new THREE.Vector3(3, 3, 3); // Slightly larger check
      const entityBox = new THREE.Box3().setFromCenterAndSize(
        entityPos,
        entitySize
      );
      return box.intersectsBox(entityBox);
    });
  }

  state.playerTank = createTank(state.playerColor, x, 0.5, z);
  state.scene.add(state.playerTank);
}

export function createEnemyTanks() {
  for (let i = 0; i < 6; i++) {
    // Increased enemy count
    let x,
      z,
      valid = false;
    let attempts = 0;

    // Try to spawn near player first
    while (!valid && attempts < 50) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 10 + Math.random() * 15; // 10 to 25 units away from player

      if (state.playerTank) {
        x = state.playerTank.position.x + Math.cos(angle) * distance;
        z = state.playerTank.position.z + Math.sin(angle) * distance;
      } else {
        // Fallback if player not created yet (shouldn't happen if called order is correct)
        x = Math.random() * 40 - 20;
        z = Math.random() * 40 - 20;
      }

      // Keep within map boundaries (approx 48)
      if (Math.abs(x) > 48 || Math.abs(z) > 48) {
        attempts++;
        continue;
      }

      // Check wall collisions
      valid = !state.walls.some((wall) => {
        const box = new THREE.Box3().setFromObject(wall);
        const entityPos = new THREE.Vector3(x, 0.5, z);
        const entitySize = new THREE.Vector3(3, 3, 3);
        const entityBox = new THREE.Box3().setFromCenterAndSize(
          entityPos,
          entitySize
        );
        return box.intersectsBox(entityBox);
      });
      attempts++;
    }

    if (!valid) continue; // Skip if no valid position found

    const tank = createTank(0xff4500, x, 0.5, z);
    state.scene.add(tank);
    state.enemyTanks.push({
      mesh: tank,
      health: 100,
      maxHealth: 100,
      armor: 0,
      firePower: 10,
      fireRate: 2,
      timeSinceLastShot: 0,
      patrol: {
        current: new THREE.Vector3(x, 0.5, z),
        target: new THREE.Vector3(
          x + (Math.random() * 10 - 5),
          0.5,
          z + (Math.random() * 10 - 5)
        ),
        speed: 0.03 + Math.random() * 0.02,
      },
    });
  }
}

export function createBoxes() {
  for (let i = 0; i < 10; i++) {
    const size = Math.random() * 1.5 + 0.5;
    const { x, z } = findValidSpawnPosition(size / 2);

    const boxGeometry = new THREE.BoxGeometry(size, size, size);
    const boxMaterial = new THREE.MeshStandardMaterial({
      color: Math.random() * 0xffffff,
    });
    const box = new THREE.Mesh(boxGeometry, boxMaterial);
    box.position.set(x, size / 2, z);
    box.castShadow = true;
    box.receiveShadow = true;
    state.scene.add(box);
    state.boxes.push({
      mesh: box,
      velocity: new THREE.Vector3(),
      size,
      health: 50,
    });
  }
}

export function createProjectile(isPlayer, position, direction) {
  const projectile = new THREE.Mesh(
    new THREE.SphereGeometry(0.3, 16, 16),
    new THREE.MeshStandardMaterial({
      color: isPlayer ? 0x00ffff : 0xff0000,
      emissive: isPlayer ? 0x00ffff : 0xff0000,
      emissiveIntensity: 0.5,
    })
  );
  projectile.position.copy(position);
  const projectileObj = {
    mesh: projectile,
    velocity: direction.normalize().multiplyScalar(0.5),
    isPlayer,
    lifeTime: 0,
  };
  (isPlayer ? state.playerProjectiles : state.enemyProjectiles).push(
    projectileObj
  );
  state.scene.add(projectile);
}

export function firePlayerProjectile() {
  if (!state.gameActive) return;

  const now = performance.now() / 1000;
  if (now - state.lastShotTime < state.stats.fireRate) return;
  state.lastShotTime = now;

  const turretPivot = state.playerTank.userData.turretPivot;
  const direction = new THREE.Vector3(0, 0, 1).applyQuaternion(
    turretPivot.getWorldQuaternion(new THREE.Quaternion())
  );
  const position = new THREE.Vector3(0, 0, 1.5)
    .applyQuaternion(turretPivot.getWorldQuaternion(new THREE.Quaternion()))
    .add(turretPivot.getWorldPosition(new THREE.Vector3()));
  createProjectile(true, position, direction);
}

export function createExplosion(position, color, size) {
  const particleCount = 20;
  const positions = new Float32Array(particleCount * 3);
  const velocities = [];
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = 0;
    positions[i * 3 + 1] = 0;
    positions[i * 3 + 2] = 0;
    velocities.push(
      new THREE.Vector3(
        (Math.random() - 0.5) * 0.1 * size,
        (Math.random() - 0.5) * 0.1 * size + 0.05 * size,
        (Math.random() - 0.5) * 0.1 * size
      )
    );
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({
    color,
    size: 0.2,
    transparent: true,
    opacity: 1,
  });
  const particles = new THREE.Points(geometry, material);
  particles.position.copy(position);
  state.scene.add(particles);
  state.explosions.push({ particles, velocities, opacity: 1 });
}
