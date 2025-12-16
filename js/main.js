import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js";
import { state } from "./gameState.js";
import { setupScene, updateMinimap } from "./sceneSetup.js";
import { createEnvironment, createBattleArena } from "./environment.js";
import {
  createPlayerTank,
  createEnemyTanks,
  createBoxes,
  createProjectile,
  createExplosion,
  createSpottedIndicator,
} from "./entities.js";
import {
  updateUI,
  gameOver,
  gameWin,
  initUI,
  triggerDamageFlash,
} from "./ui.js";
import { keys, handleKeyDown, handleKeyUp, initControls } from "./controls.js";
import {
  checkWallCollision,
  resolveWallCollision,
  checkTankCollision,
  resolveTankCollision,
  raycastToTarget,
} from "./utils.js";
import { initPreview, updatePreviewTank, stopPreview } from "./tankPreview.js";
import { audioManager } from "./audio.js";

const startButton = document.getElementById("start-button");
const restartButton = document.getElementById("restart-button");
const minimapElement = document.getElementById("minimap");
const tankCards = document.querySelectorAll(".tank-card");

// Initialize preview on load
window.addEventListener("load", () => {
  document.getElementById("start-screen").style.display = "flex";
  initPreview();
});

tankCards.forEach((card) => {
  card.addEventListener("click", () => {
    tankCards.forEach((c) => c.classList.remove("selected"));
    card.classList.add("selected");
    state.selectedTankType = card.dataset.type;

    updatePreviewTank(state.selectedTankType);

    // Optional: Update color picker to default for that tank type
    const colorInput = document.getElementById("tank-color");
    if (state.tankConfigs[state.selectedTankType]) {
      colorInput.value = state.tankConfigs[state.selectedTankType].color;
    }
  });
});

startButton.addEventListener("click", () => {
  stopPreview();
  initGame();
});
restartButton.addEventListener("click", restartGame);

function initGame() {
  try {
    if (!THREE) throw new Error("Three.js not loaded");

    const colorInput = document.getElementById("tank-color");
    state.playerColor = colorInput.value;

    // Load stats from selected tank type
    const config = state.tankConfigs[state.selectedTankType || "balanced"];
    state.stats = { ...config }; // Copy config to stats
    state.health = state.stats.maxHealth;
    state.cameraRotation.theta = Math.PI; // Start camera behind tank

    initUI();
    initControls();
    state.gameActive = true;
    state.score = 0;
    state.enemiesDefeated = 0;

    audioManager.init();

    setupScene();
    createEnvironment();
    createBattleArena();
    createPlayerTank();
    createEnemyTanks();
    createBoxes();

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    animate();
  } catch (e) {
    console.error("Game initialization failed:", e);
    alert("Failed to start game. Please refresh the page.");
  }
}

function restartGame() {
  state.gameActive = false;
  state.score = 0;
  state.health = 100;
  state.boxes = [];
  state.walls = [];
  state.enemyTanks = [];
  state.playerProjectiles = [];
  state.enemyProjectiles = [];
  state.explosions = [];
  state.minimapMarkers = [];
  Object.keys(keys).forEach((key) => (keys[key] = false));

  if (state.minimapRenderer)
    minimapElement.removeChild(state.minimapRenderer.domElement);
  state.scene.remove.apply(state.scene, state.scene.children);
  initGame();
}

function animate() {
  if (!state.gameActive) return;
  requestAnimationFrame(animate);

  const prevPosition = state.playerTank.position.clone();
  const speed = state.stats.speed;
  const rotationSpeed = state.stats.rotationSpeed;

  if (keys.w) state.playerTank.translateZ(speed);
  if (keys.s) state.playerTank.translateZ(-speed);
  if (keys.a) state.playerTank.rotation.y += rotationSpeed;
  if (keys.d) state.playerTank.rotation.y -= rotationSpeed;

  // Update engine sound
  const currentSpeed = keys.w || keys.s ? speed : 0;
  audioManager.updateEngine(currentSpeed);

  const collision = checkTankCollision(state.playerTank, state.walls);
  if (collision) {
    resolveTankCollision(state.playerTank, collision);
  }

  const boundary = 48;
  state.playerTank.position.clamp(
    new THREE.Vector3(-boundary, 0.5, -boundary),
    new THREE.Vector3(boundary, 0.5, boundary)
  );

  // TPS Camera Logic
  const cameraDistance = 5;
  const cameraHeight = 2;

  // Calculate camera position based on spherical coordinates
  const cx =
    state.playerTank.position.x +
    cameraDistance *
      Math.sin(state.cameraRotation.theta) *
      Math.cos(state.cameraRotation.phi);
  const cy =
    state.playerTank.position.y +
    cameraHeight +
    cameraDistance * Math.sin(state.cameraRotation.phi);
  const cz =
    state.playerTank.position.z +
    cameraDistance *
      Math.cos(state.cameraRotation.theta) *
      Math.cos(state.cameraRotation.phi);

  state.camera.position.set(cx, cy, cz);
  state.camera.lookAt(state.playerTank.position);

  // Rotate turret to face camera direction
  const turretPivot = state.playerTank.userData.turretPivot;
  if (turretPivot) {
    // Calculate the target rotation for the turret based on camera angle
    // We want the turret to face away from the camera
    const targetRotation = state.cameraRotation.theta + Math.PI;

    // Convert to local rotation relative to tank body
    const tankRotation = state.playerTank.rotation.y;
    turretPivot.rotation.y = targetRotation - tankRotation;
  }

  state.minimapCamera.position.set(
    state.playerTank.position.x,
    50,
    state.playerTank.position.z
  );

  state.enemyTanks.forEach((enemy, index) => {
    if (enemy.health <= 0) return;
    const prevEnemyPos = enemy.mesh.position.clone();
    const toPlayer = new THREE.Vector3().subVectors(
      state.playerTank.position,
      enemy.mesh.position
    );
    const distance = toPlayer.length();
    const canSeePlayer = !raycastToTarget(
      enemy.mesh.position,
      toPlayer.clone().normalize(),
      distance,
      state.walls
    );

    if (enemy.indicator) {
      enemy.indicator.visible = canSeePlayer && distance < 20;
    }

    if (canSeePlayer && distance < 20) {
      enemy.mesh.lookAt(state.playerTank.position);
      if (distance > 8) {
        const direction = toPlayer.normalize();
        enemy.mesh.position.x += direction.x * 0.05;
        enemy.mesh.position.z += direction.z * 0.05;
        const hitWall = checkWallCollision(
          enemy.mesh.position,
          1.5,
          state.walls
        );
        if (hitWall) {
          enemy.mesh.position.copy(prevEnemyPos);
          const wallBox = new THREE.Box3().setFromObject(hitWall);
          const wallSize = new THREE.Vector3();
          wallBox.getSize(wallSize);
          const detourDir =
            wallSize.x > wallSize.z
              ? new THREE.Vector3(0, 0, 1)
              : new THREE.Vector3(1, 0, 0);
          enemy.patrol.target = enemy.mesh.position
            .clone()
            .add(detourDir.multiplyScalar(5));
        }
      }
      enemy.timeSinceLastShot += 0.016;
      if (enemy.timeSinceLastShot > 2) {
        const direction = new THREE.Vector3(0, 0, 1).applyQuaternion(
          enemy.mesh.quaternion
        );
        const position = new THREE.Vector3(0, 0.5, 1.5)
          .applyQuaternion(enemy.mesh.quaternion)
          .add(enemy.mesh.position);
        createProjectile(false, position, direction);
        enemy.timeSinceLastShot = 0;
      }
    } else {
      const toTarget = new THREE.Vector3().subVectors(
        enemy.patrol.target,
        enemy.mesh.position
      );
      const distanceToTarget = toTarget.length();
      if (distanceToTarget > 0.1) {
        enemy.mesh.lookAt(enemy.patrol.target);
        const direction = toTarget.normalize();
        enemy.mesh.position.x += direction.x * enemy.patrol.speed;
        enemy.mesh.position.z += direction.z * enemy.patrol.speed;
        const hitWall = checkWallCollision(
          enemy.mesh.position,
          1.5,
          state.walls
        );
        if (hitWall) {
          enemy.mesh.position.copy(prevEnemyPos);
          enemy.patrol.target = new THREE.Vector3(
            enemy.mesh.position.x + (Math.random() * 10 - 5),
            0.5,
            enemy.mesh.position.z + (Math.random() * 10 - 5)
          ).clamp(
            new THREE.Vector3(-48, 0.5, -48),
            new THREE.Vector3(48, 0.5, 48)
          );
        }
      } else {
        enemy.patrol.target = new THREE.Vector3(
          enemy.mesh.position.x + (Math.random() * 20 - 10),
          0.5,
          enemy.mesh.position.z + (Math.random() * 20 - 10)
        ).clamp(
          new THREE.Vector3(-48, 0.5, -48),
          new THREE.Vector3(48, 0.5, 48)
        );
      }
    }
  });

  for (let i = state.playerProjectiles.length - 1; i >= 0; i--) {
    const projectile = state.playerProjectiles[i];
    const prevPos = projectile.mesh.position.clone();
    projectile.mesh.position.add(projectile.velocity);
    projectile.lifeTime += 0.016;

    if (checkWallCollision(projectile.mesh.position, 0.3, state.walls)) {
      state.scene.remove(projectile.mesh);
      state.playerProjectiles.splice(i, 1);
      createExplosion(prevPos, 0x00ffff, 0.5);
      continue;
    }

    if (
      projectile.lifeTime > 5 ||
      Math.abs(projectile.mesh.position.x) > 50 ||
      Math.abs(projectile.mesh.position.z) > 50
    ) {
      state.scene.remove(projectile.mesh);
      state.playerProjectiles.splice(i, 1);
      continue;
    }

    state.enemyTanks.forEach((enemy, enemyIndex) => {
      if (enemy.health <= 0) return;
      if (projectile.mesh.position.distanceTo(enemy.mesh.position) < 2) {
        // Calculate damage with armor
        const damage = state.stats.firePower * (100 / (100 + enemy.armor));
        enemy.health -= damage;

        state.scene.remove(projectile.mesh);
        state.playerProjectiles.splice(i, 1);
        createExplosion(projectile.mesh.position, 0xff4500, 1);
        if (enemy.health <= 0) {
          state.scene.remove(enemy.mesh);
          state.score += 100;
          state.enemiesDefeated++;
          updateUI();

          if (state.enemiesDefeated >= 10) {
            gameWin();
          }
        }
        return;
      }
    });

    state.boxes.forEach((box, boxIndex) => {
      if (box.health <= 0) return;
      const distance = projectile.mesh.position.distanceTo(box.mesh.position);
      if (distance < box.size + 0.3) {
        const direction = new THREE.Vector3()
          .subVectors(box.mesh.position, projectile.mesh.position)
          .normalize();
        box.velocity.add(direction.multiplyScalar(0.2));
        box.health -= 25;
        state.scene.remove(projectile.mesh);
        state.playerProjectiles.splice(i, 1);
        createExplosion(projectile.mesh.position, 0xffffff, 0.7);
        state.score += 10;
        if (box.health <= 0) {
          state.scene.remove(box.mesh);
          state.boxes.splice(boxIndex, 1);
          state.score += 20;
        }
        updateUI();
        return;
      }
    });
  }

  for (let i = state.enemyProjectiles.length - 1; i >= 0; i--) {
    const projectile = state.enemyProjectiles[i];
    projectile.mesh.position.add(projectile.velocity);
    projectile.lifeTime += 0.016;

    if (checkWallCollision(projectile.mesh.position, 0.3, state.walls)) {
      state.scene.remove(projectile.mesh);
      state.enemyProjectiles.splice(i, 1);
      continue;
    }

    if (
      projectile.lifeTime > 5 ||
      Math.abs(projectile.mesh.position.x) > 50 ||
      Math.abs(projectile.mesh.position.z) > 50
    ) {
      state.scene.remove(projectile.mesh);
      state.enemyProjectiles.splice(i, 1);
      continue;
    }

    if (projectile.mesh.position.distanceTo(state.playerTank.position) < 2) {
      // Find the enemy who shot this? Simpler to just use a default or store it on projectile
      // For now, let's assume standard enemy damage or store it on projectile creation
      // Let's update createProjectile to store damage
      const damage = 10 * (100 / (100 + state.stats.armor)); // Base 10 damage for now
      state.health -= damage;
      updateUI();
      triggerDamageFlash();
      state.scene.remove(projectile.mesh);
      state.enemyProjectiles.splice(i, 1);
      createExplosion(projectile.mesh.position, 0x1e90ff, 1);
      if (state.health <= 0) gameOver();
    }
  }

  state.boxes.forEach((box, index) => {
    if (box.health <= 0) return;
    box.mesh.position.add(box.velocity);
    box.velocity.multiplyScalar(0.95);
    const hitWall = checkWallCollision(
      box.mesh.position,
      box.size / 2,
      state.walls
    );
    if (hitWall) resolveWallCollision(box.mesh.position, box.velocity, hitWall);

    const boundary = 48 - box.size / 2;
    if (box.mesh.position.x < -boundary) {
      box.mesh.position.x = -boundary;
      box.velocity.x *= -0.5;
    }
    if (box.mesh.position.x > boundary) {
      box.mesh.position.x = boundary;
      box.velocity.x *= -0.5;
    }
    if (box.mesh.position.z < -boundary) {
      box.mesh.position.z = -boundary;
      box.velocity.z *= -0.5;
    }
    if (box.mesh.position.z > boundary) {
      box.mesh.position.z = boundary;
      box.velocity.z *= -0.5;
    }

    if (
      box.mesh.position.distanceTo(state.playerTank.position) <
      box.size / 2 + 1.5
    ) {
      const direction = new THREE.Vector3()
        .subVectors(box.mesh.position, state.playerTank.position)
        .normalize();
      box.velocity.add(direction.multiplyScalar(0.1));
    }

    state.enemyTanks.forEach((enemy) => {
      if (enemy.health <= 0) return;
      if (
        box.mesh.position.distanceTo(enemy.mesh.position) <
        box.size / 2 + 1.5
      ) {
        const direction = new THREE.Vector3()
          .subVectors(box.mesh.position, enemy.mesh.position)
          .normalize();
        box.velocity.add(direction.multiplyScalar(0.1));
      }
    });
  });

  for (let i = state.explosions.length - 1; i >= 0; i--) {
    const exp = state.explosions[i];
    const positions = exp.particles.geometry.attributes.position.array;
    exp.opacity -= 0.02;
    exp.particles.material.opacity = exp.opacity;
    for (let j = 0; j < exp.velocities.length; j++) {
      positions[j * 3] += exp.velocities[j].x;
      positions[j * 3 + 1] += exp.velocities[j].y;
      positions[j * 3 + 2] += exp.velocities[j].z;
      exp.velocities[j].y -= 0.001;
    }
    exp.particles.geometry.attributes.position.needsUpdate = true;
    if (exp.opacity <= 0) {
      state.scene.remove(exp.particles);
      state.explosions.splice(i, 1);
    }
  }

  updateMinimap();
  state.renderer.render(state.scene, state.camera);
  state.minimapRenderer.render(state.scene, state.minimapCamera);

  // Check for center win condition
  if (state.playerTank.position.distanceTo(new THREE.Vector3(0, 0, 0)) < 5) {
    gameWin();
  }

  // Update Reload Bar
  const now = performance.now() / 1000;
  const timeSinceShot = now - state.lastShotTime;
  const reloadProgress = Math.min(timeSinceShot / state.stats.fireRate, 1);
  const reloadBar = document.getElementById("reload-bar");
  if (reloadBar) {
    reloadBar.style.width = `${reloadProgress * 100}%`;
    reloadBar.style.backgroundColor =
      reloadProgress >= 1 ? "#00ff00" : "#ff4500";
  }
}

window.addEventListener("blur", () => {
  if (state.gameActive) state.gameActive = false;
});
window.addEventListener("focus", () => {
  const startScreen = document.getElementById("start-screen");
  const gameOverScreen = document.getElementById("game-over");
  if (
    !state.gameActive &&
    state.health > 0 &&
    startScreen.style.display === "none" &&
    gameOverScreen.style.display === "none"
  ) {
    state.gameActive = true;
    animate();
  }
});
