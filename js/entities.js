import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js";
import { state } from "./gameState.js";

export function createTank(color, x, y, z) {
  const tank = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(2, 0.8, 3),
    new THREE.MeshStandardMaterial({ color })
  );
  body.castShadow = true;
  body.receiveShadow = true;
  tank.add(body);

  const turretPivot = new THREE.Group();
  turretPivot.position.y = 0.5;
  tank.add(turretPivot);

  const turret = new THREE.Mesh(
    new THREE.CylinderGeometry(0.8, 0.8, 0.5, 16),
    new THREE.MeshStandardMaterial({ color })
  );
  turret.castShadow = true;
  turret.receiveShadow = true;
  turretPivot.add(turret);

  const cannon = new THREE.Mesh(
    new THREE.CylinderGeometry(0.2, 0.2, 1.5, 16),
    new THREE.MeshStandardMaterial({ color: 0x333333 })
  );
  cannon.position.set(0, 0, 1.5);
  cannon.rotation.x = Math.PI / 2;
  cannon.castShadow = true;
  cannon.receiveShadow = true;
  turretPivot.add(cannon);

  const eyeGeometry = new THREE.SphereGeometry(0.2, 16, 16);
  const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const pupilMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
  [-1, 1].forEach((i) => {
    const eye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    eye.position.set(i * 0.5, 0.3, 0.8);
    turretPivot.add(eye);
    const pupil = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 16, 16),
      pupilMaterial
    );
    pupil.position.set(i * 0.55, 0.3, 0.9);
    turretPivot.add(pupil);
  });

  tank.position.set(x, y, z);
  tank.userData.turretPivot = turretPivot;
  return tank;
}

export function createPlayerTank() {
  state.playerTank = createTank(0x1e90ff, 0, 0.5, 20);
  state.scene.add(state.playerTank);
}

export function createEnemyTanks() {
  const enemyPositions = [
    [-20, 20],
    [20, -20],
    [0, -15],
    [15, 10],
  ];
  enemyPositions.forEach(([x, z]) => {
    const tank = createTank(0xff4500, x, 0.5, z);
    state.scene.add(tank);
    state.enemyTanks.push({
      mesh: tank,
      health: 100,
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
  });
}

export function createBoxes() {
  for (let i = 0; i < 10; i++) {
    const size = Math.random() * 1.5 + 0.5;
    let x,
      z,
      validPosition = false;
    while (!validPosition) {
      x = Math.random() * 40 - 20;
      z = Math.random() * 40 - 20;
      if (Math.abs(x) < 5 && Math.abs(z - 20) < 5) continue;
      validPosition = !state.walls.some((wall) => {
        const box = new THREE.Box3().setFromObject(wall);
        const boxPos = new THREE.Vector3(x, size / 2, z);
        const boxSize = new THREE.Vector3(size, size, size);
        return box.intersectsBox(
          new THREE.Box3().setFromCenterAndSize(boxPos, boxSize)
        );
      });
    }
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
