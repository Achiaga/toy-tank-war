import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js";

export function checkWallCollision(position, radius, walls) {
  const sphere = new THREE.Sphere(position, radius);
  return (
    walls.find((wall) =>
      new THREE.Box3().setFromObject(wall).intersectsSphere(sphere)
    ) || null
  );
}

export function resolveWallCollision(position, velocity, wall) {
  const wallBox = new THREE.Box3().setFromObject(wall);
  const wallSize = new THREE.Vector3();
  wallBox.getSize(wallSize);
  const wallPos = new THREE.Vector3();
  wall.getWorldPosition(wallPos);
  const dx = position.x - wallPos.x;
  const dz = position.z - wallPos.z;
  if (wallSize.x > wallSize.z) {
    position.z =
      wallPos.z + (dz > 0 ? wallSize.z / 2 + 1.5 : -wallSize.z / 2 - 1.5);
    velocity.z *= -0.5;
  } else {
    position.x =
      wallPos.x + (dx > 0 ? wallSize.x / 2 + 1.5 : -wallSize.x / 2 - 1.5);
    velocity.x *= -0.5;
  }
}

export function raycastToTarget(origin, direction, distance, obstacles) {
  const raycaster = new THREE.Raycaster(origin, direction);
  const intersects = raycaster.intersectObjects(obstacles);
  return intersects.length > 0 && intersects[0].distance < distance;
}

// Using SAT (Separating Axis Theorem) to check collisions between our rotated tank and the walls
export function checkTankCollision(tank, walls) {
  const tankPos = tank.position;
  const tankSize = tank.userData.size || { width: 2.2, length: 3.2 }; // Fallback
  const tankAngle = tank.rotation.y;

  // Tank corners (relative to center, unrotated)
  const hw = tankSize.width / 2;
  const hl = tankSize.length / 2;

  // 4 corners of the tank in world space
  // We only care about X and Z
  const corners = [
    { x: hw, z: hl },
    { x: -hw, z: hl },
    { x: -hw, z: -hl },
    { x: hw, z: -hl },
  ].map((p) => {
    // Rotate
    const rx = p.x * Math.cos(tankAngle) + p.z * Math.sin(tankAngle);
    const rz = -p.x * Math.sin(tankAngle) + p.z * Math.cos(tankAngle);
    return { x: tankPos.x + rx, z: tankPos.z + rz };
  });

  // Axes to test:
  // 1. Wall X axis (1, 0)
  // 2. Wall Z axis (0, 1)
  // 3. Tank X axis
  // 4. Tank Z axis
  const tankAxes = [
    { x: Math.cos(tankAngle), z: -Math.sin(tankAngle) },
    { x: Math.sin(tankAngle), z: Math.cos(tankAngle) },
  ];

  for (const wall of walls) {
    const wallBox = new THREE.Box3().setFromObject(wall);
    const wallMin = wallBox.min;
    const wallMax = wallBox.max;

    // Wall corners
    const wallCorners = [
      { x: wallMin.x, z: wallMin.z },
      { x: wallMax.x, z: wallMin.z },
      { x: wallMax.x, z: wallMax.z },
      { x: wallMin.x, z: wallMax.z },
    ];

    let overlap = true;
    let minOverlap = Infinity;
    let collisionNormal = null;

    // Test all axes (2 from tank + 2 from world/wall)
    const axes = [...tankAxes, { x: 1, z: 0 }, { x: 0, z: 1 }];

    for (const axis of axes) {
      // Project tank
      let tMin = Infinity,
        tMax = -Infinity;
      for (const p of corners) {
        const proj = p.x * axis.x + p.z * axis.z;
        tMin = Math.min(tMin, proj);
        tMax = Math.max(tMax, proj);
      }

      // Project wall
      let wMin = Infinity,
        wMax = -Infinity;
      for (const p of wallCorners) {
        const proj = p.x * axis.x + p.z * axis.z;
        wMin = Math.min(wMin, proj);
        wMax = Math.max(wMax, proj);
      }

      // Check overlap
      const d1 = tMax - wMin;
      const d2 = wMax - tMin;

      if (d1 < 0 || d2 < 0) {
        overlap = false;
        break;
      }

      const axisOverlap = Math.min(d1, d2);
      if (axisOverlap < minOverlap) {
        minOverlap = axisOverlap;
        // Determine direction
        // We want to push tank OUT of wall
        // Center to center vector
        const wallCenter = {
          x: (wallMin.x + wallMax.x) / 2,
          z: (wallMin.z + wallMax.z) / 2,
        };
        const dir =
          (tankPos.x - wallCenter.x) * axis.x +
          (tankPos.z - wallCenter.z) * axis.z;
        collisionNormal = {
          x: axis.x * (dir < 0 ? -1 : 1),
          z: axis.z * (dir < 0 ? -1 : 1),
        };
      }
    }

    if (overlap) {
      return { wall, overlap: minOverlap, normal: collisionNormal };
    }
  }

  return null;
}

export function resolveTankCollision(tank, collision) {
  const { overlap, normal } = collision;
  // Push tank back
  tank.position.x += normal.x * overlap * 1.01; // 1.01 to ensure separation
  tank.position.z += normal.z * overlap * 1.01;
}
// SAT Collision for Tank vs Tank (both rotated)
export function checkTankTankCollision(tank1, tank2) {
  const getCorners = (tank) => {
    const pos = tank.position;
    const size = tank.userData.size || { width: 2.2, length: 3.2 };
    const angle = tank.rotation.y;
    const hw = size.width / 2;
    const hl = size.length / 2;
    return [
      { x: hw, z: hl },
      { x: -hw, z: hl },
      { x: -hw, z: -hl },
      { x: hw, z: -hl },
    ].map((p) => {
      const rx = p.x * Math.cos(angle) + p.z * Math.sin(angle);
      const rz = -p.x * Math.sin(angle) + p.z * Math.cos(angle);
      return { x: pos.x + rx, z: pos.z + rz };
    });
  };

  const corners1 = getCorners(tank1);
  const corners2 = getCorners(tank2);

  const getAxes = (tank) => {
    const angle = tank.rotation.y;
    return [
      { x: Math.cos(angle), z: -Math.sin(angle) },
      { x: Math.sin(angle), z: Math.cos(angle) },
    ];
  };

  const axes = [...getAxes(tank1), ...getAxes(tank2)];
  let minOverlap = Infinity;
  let collisionNormal = null;

  for (const axis of axes) {
    let min1 = Infinity,
      max1 = -Infinity;
    let min2 = Infinity,
      max2 = -Infinity;

    for (const p of corners1) {
      const proj = p.x * axis.x + p.z * axis.z;
      min1 = Math.min(min1, proj);
      max1 = Math.max(max1, proj);
    }

    for (const p of corners2) {
      const proj = p.x * axis.x + p.z * axis.z;
      min2 = Math.min(min2, proj);
      max2 = Math.max(max2, proj);
    }

    const overlap1 = max1 - min2;
    const overlap2 = max2 - min1;

    if (overlap1 < 0 || overlap2 < 0) return null;

    const overlap = Math.min(overlap1, overlap2);
    if (overlap < minOverlap) {
      minOverlap = overlap;
      collisionNormal = axis;
      if (overlap1 < overlap2) {
        collisionNormal = { x: -axis.x, z: -axis.z };
      }
    }
  }

  return { normal: collisionNormal, overlap: minOverlap };
}

export function resolveTankTankCollision(tank1, tank2, collision) {
  const push = new THREE.Vector3(
    collision.normal.x * collision.overlap * 0.5,
    0,
    collision.normal.z * collision.overlap * 0.5
  );

  // Push both tanks apart
  tank1.position.add(push);
  tank2.position.sub(push);
}
