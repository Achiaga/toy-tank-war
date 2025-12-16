import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js";
import { state } from "./gameState.js";

export function setupScene() {
  state.scene = new THREE.Scene();
  state.scene.background = new THREE.Color(0x87ceeb);

  state.camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  state.camera.position.set(0, 10, 15);
  state.camera.lookAt(0, 0, 0);

  state.renderer = new THREE.WebGLRenderer({ antialias: true });
  state.renderer.setSize(window.innerWidth, window.innerHeight);
  state.renderer.shadowMap.enabled = true;
  document.body.appendChild(state.renderer.domElement);

  state.minimapCamera = new THREE.OrthographicCamera(-25, 25, 25, -25, 1, 1000);
  state.minimapCamera.position.set(0, 50, 0);
  state.minimapCamera.lookAt(0, 0, 0);
  state.minimapCamera.rotation.z = Math.PI;

  const minimapElement = document.getElementById("minimap");
  state.minimapRenderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
  });
  state.minimapRenderer.setSize(150, 150);
  state.minimapRenderer.setClearColor(0x000000, 0);
  minimapElement.appendChild(state.minimapRenderer.domElement);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  state.scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(5, 10, 7);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 1024;
  directionalLight.shadow.mapSize.height = 1024;
  directionalLight.shadow.camera.near = 0.5;
  directionalLight.shadow.camera.far = 50;
  directionalLight.shadow.camera.left = -25;
  directionalLight.shadow.camera.right = 25;
  directionalLight.shadow.camera.top = 25;
  directionalLight.shadow.camera.bottom = -25;
  state.scene.add(directionalLight);

  window.addEventListener("resize", () => {
    state.camera.aspect = window.innerWidth / window.innerHeight;
    state.camera.updateProjectionMatrix();
    state.renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

export function updateMinimap() {
  state.minimapMarkers.forEach((marker) => state.scene.remove(marker));
  state.minimapMarkers = [];

  const markerGeometry = new THREE.CircleGeometry(0.5, 16);
  const playerMarker = new THREE.Mesh(
    markerGeometry,
    new THREE.MeshBasicMaterial({ color: 0x0000ff })
  );
  playerMarker.position.set(
    state.playerTank.position.x,
    0.1,
    state.playerTank.position.z
  );
  state.scene.add(playerMarker);
  state.minimapMarkers.push(playerMarker);

  state.enemyTanks.forEach((enemy) => {
    if (enemy.health > 0) {
      const marker = new THREE.Mesh(
        markerGeometry,
        new THREE.MeshBasicMaterial({ color: 0xff0000 })
      );
      marker.position.set(enemy.mesh.position.x, 0.1, enemy.mesh.position.z);
      state.scene.add(marker);
      state.minimapMarkers.push(marker);
    }
  });

  state.boxes.forEach((box) => {
    if (box.health > 0) {
      const marker = new THREE.Mesh(
        markerGeometry,
        new THREE.MeshBasicMaterial({ color: 0x00ff00 })
      );
      marker.position.set(box.mesh.position.x, 0.1, box.mesh.position.z);
      state.scene.add(marker);
      state.minimapMarkers.push(marker);
    }
  });
}
