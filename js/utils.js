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
