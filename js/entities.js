import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js";
import { state } from "./gameState.js";

export function createTank(color, x, y, z, scale = 1, type = "balanced") {
  const tank = new THREE.Group();

  // --- CHASSIS ---
  let bodyGeo;
  if (type === "heavy") {
    // Heavy: Wider, bulkier
    bodyGeo = new THREE.BoxGeometry(1.8 * scale, 1.0 * scale, 3.2 * scale);
  } else if (type === "scout") {
    // Scout: Sleeker
    bodyGeo = new THREE.BoxGeometry(1.2 * scale, 0.6 * scale, 2.8 * scale);
  } else {
    // Balanced & Spanish
    bodyGeo = new THREE.BoxGeometry(1.4 * scale, 0.8 * scale, 3 * scale);
  }

  const body = new THREE.Mesh(
    bodyGeo,
    new THREE.MeshStandardMaterial({ color })
  );
  body.castShadow = true;
  body.receiveShadow = true;
  tank.add(body);

  // --- TREADS ---
  const treadMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
  let treadWidth = 0.4 * scale;
  let treadHeight = 0.8 * scale;
  let treadLength = 3.2 * scale;
  let treadOffset = 0.9 * scale;

  if (type === "heavy") {
    treadWidth = 0.6 * scale;
    treadHeight = 1.0 * scale;
    treadLength = 3.4 * scale;
    treadOffset = 1.1 * scale;
  } else if (type === "scout") {
    // Wider wheels for scout
    treadWidth = 0.6 * scale;
    treadOffset = 0.8 * scale; // Slightly closer to body since body is narrower
  }

  const treadGeo = new THREE.BoxGeometry(treadWidth, treadHeight, treadLength);
  const leftTread = new THREE.Mesh(treadGeo, treadMaterial);
  leftTread.position.set(-treadOffset, 0, 0);
  leftTread.castShadow = true;
  leftTread.receiveShadow = true;
  tank.add(leftTread);

  const rightTread = new THREE.Mesh(treadGeo, treadMaterial);
  rightTread.position.set(treadOffset, 0, 0);
  rightTread.castShadow = true;
  rightTread.receiveShadow = true;
  tank.add(rightTread);

  // --- TURRET PIVOT ---
  const turretPivot = new THREE.Group();
  turretPivot.position.y = (type === "heavy" ? 0.6 : 0.5) * scale;
  tank.add(turretPivot);

  // --- TURRET ---
  let turretGeo;
  if (type === "heavy") {
    turretGeo = new THREE.BoxGeometry(1.6 * scale, 0.8 * scale, 1.8 * scale);
  } else if (type === "scout") {
    turretGeo = new THREE.BoxGeometry(1.2 * scale, 0.5 * scale, 2 * scale);
  } else {
    turretGeo = new THREE.BoxGeometry(1.2 * scale, 0.6 * scale, 1.5 * scale);
  }

  const turret = new THREE.Mesh(
    turretGeo,
    new THREE.MeshStandardMaterial({ color })
  );
  turret.castShadow = true;
  turret.receiveShadow = true;
  turretPivot.add(turret);

  // --- CANNON ---
  if (type === "spanish") {
    // MUCHO CANNON
    const cannon = new THREE.Mesh(
      new THREE.CylinderGeometry(0.4 * scale, 0.4 * scale, 4 * scale, 16),
      new THREE.MeshStandardMaterial({ color: 0x222222 })
    );
    cannon.position.set(0, 0, 2.5 * scale);
    cannon.rotation.x = Math.PI / 2;
    cannon.castShadow = true;
    cannon.receiveShadow = true;
    turretPivot.add(cannon);

    // Flag? Maybe just a red/yellow band on the barrel
    const band = new THREE.Mesh(
      new THREE.CylinderGeometry(0.41 * scale, 0.41 * scale, 0.5 * scale, 16),
      new THREE.MeshBasicMaterial({ color: 0xff0000 })
    );
    band.position.set(0, 0, 3.5 * scale);
    band.rotation.x = Math.PI / 2;
    turretPivot.add(band);
  } else if (type === "heavy") {
    // Double Barrel
    const cannonGeo = new THREE.CylinderGeometry(
      0.15 * scale,
      0.15 * scale,
      2.2 * scale,
      16
    );
    const cannonMat = new THREE.MeshStandardMaterial({ color: 0x333333 });

    const c1 = new THREE.Mesh(cannonGeo, cannonMat);
    c1.position.set(-0.2 * scale, 0, 1.5 * scale);
    c1.rotation.x = Math.PI / 2;
    c1.castShadow = true;
    turretPivot.add(c1);

    const c2 = new THREE.Mesh(cannonGeo, cannonMat);
    c2.position.set(0.2 * scale, 0, 1.5 * scale);
    c2.rotation.x = Math.PI / 2;
    c2.castShadow = true;
    turretPivot.add(c2);
  } else {
    // Standard
    const cannon = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15 * scale, 0.15 * scale, 2 * scale, 16),
      new THREE.MeshStandardMaterial({ color: 0x333333 })
    );
    cannon.position.set(0, 0, 1.5 * scale);
    cannon.rotation.x = Math.PI / 2;
    cannon.castShadow = true;
    cannon.receiveShadow = true;
    turretPivot.add(cannon);
  }

  // --- HATCH ---
  const hatch = new THREE.Mesh(
    new THREE.CylinderGeometry(0.4 * scale, 0.4 * scale, 0.1 * scale, 16),
    new THREE.MeshStandardMaterial({ color: 0x222222 })
  );
  hatch.position.set(0, (type === "heavy" ? 0.45 : 0.35) * scale, 0);
  turretPivot.add(hatch);

  // --- EYES ---
  const eyeGeometry = new THREE.SphereGeometry(0.2 * scale, 16, 16);
  const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const pupilMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });

  const eyeZ = (type === "heavy" ? 0.9 : 0.75) * scale;
  const eyeY = 0.3 * scale;
  const eyeX = 0.3 * scale;

  [-1, 1].forEach((i) => {
    const eye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    eye.position.set(i * eyeX, eyeY, eyeZ);
    turretPivot.add(eye);
    const pupil = new THREE.Mesh(
      new THREE.SphereGeometry(0.1 * scale, 16, 16),
      pupilMaterial
    );
    pupil.position.set(i * eyeX, eyeY, eyeZ + 0.15 * scale);
    turretPivot.add(pupil);
  });

  // --- HEADLIGHTS ---
  const headlightGeo = new THREE.SphereGeometry(0.1 * scale, 16, 16);
  const headlightMat = new THREE.MeshBasicMaterial({ color: 0xffff00 });

  const hlZ = 1.5 * scale; // Front of body (approx)
  const hlY = 0.1 * scale; // Lowered
  const hlX = 0.5 * scale;

  [-1, 1].forEach((i) => {
    const hl = new THREE.Mesh(headlightGeo, headlightMat);
    hl.position.set(i * hlX, hlY, hlZ);
    tank.add(hl);
  });

  tank.position.set(x, y, z);
  tank.userData.turretPivot = turretPivot;

  // Store dimensions for collision detection
  // Adjust based on type if needed, but scale handles most of it
  let width = 2.2 * scale;
  if (type === "heavy") width = 2.8 * scale;

  tank.userData.size = {
    width: width,
    length: 3.2 * scale,
    height: 1.5 * scale,
  };
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

  state.playerTank = createTank(
    state.playerColor,
    x,
    0.5,
    z,
    state.stats.size,
    state.selectedTankType
  );
  state.scene.add(state.playerTank);
}

export function createEnemyTanks() {
  const totalEnemies = 12; // Increased from 6
  const centerEnemies = 4; // Enemies guaranteed in the center

  for (let i = 0; i < totalEnemies; i++) {
    let x,
      z,
      valid = false;
    let attempts = 0;
    const isCenterSpawn = i < centerEnemies;

    while (!valid && attempts < 50) {
      if (isCenterSpawn) {
        // Spawn in center arena (radius < 20)
        const angle = Math.random() * Math.PI * 2;
        const radius = 5 + Math.random() * 15; // 5 to 20
        x = Math.cos(angle) * radius;
        z = Math.sin(angle) * radius;
      } else {
        // Spawn in outer maze
        const angle = Math.random() * Math.PI * 2;
        const distance = 25 + Math.random() * 20; // 25 to 45
        x = Math.cos(angle) * distance;
        z = Math.sin(angle) * distance;
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

    if (!valid) continue;

    // Randomize enemy type? For now just standard
    const tank = createTank(0xff4500, x, 0.5, z);

    // Add spotted indicator
    const indicator = createSpottedIndicator();
    indicator.position.set(0, 3, 0);
    tank.add(indicator);

    state.scene.add(tank);
    state.enemyTanks.push({
      mesh: tank,
      indicator: indicator,
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

export function createSpottedIndicator() {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "red";
  ctx.font = "bold 60px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("!", 32, 32);

  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({ map: texture });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(2, 2, 1);
  sprite.visible = false;
  return sprite;
}
