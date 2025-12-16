import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js";
import { createTank } from "./entities.js";
import { state } from "./gameState.js";

let previewScene, previewCamera, previewRenderer, previewTank;
let animationId;

export function initPreview() {
  const container = document.getElementById("tank-preview");
  if (!container) return;

  // Scene setup
  previewScene = new THREE.Scene();
  previewScene.background = new THREE.Color(0x222222);

  // Camera
  previewCamera = new THREE.PerspectiveCamera(
    45,
    container.clientWidth / container.clientHeight,
    0.1,
    100
  );
  previewCamera.position.set(3, 3, 5);
  previewCamera.lookAt(0, 0, 0);

  // Renderer
  previewRenderer = new THREE.WebGLRenderer({ antialias: true });
  previewRenderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(previewRenderer.domElement);

  // Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  previewScene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
  dirLight.position.set(5, 10, 5);
  previewScene.add(dirLight);

  // Initial Tank
  updatePreviewTank("balanced");

  animatePreview();
}

export function updatePreviewTank(type) {
  if (previewTank) {
    previewScene.remove(previewTank);
  }

  const config = state.tankConfigs[type];
  if (!config) return;

  // Create tank at origin with config scale
  previewTank = createTank(config.color, 0, 0, 0, config.size, type);
  previewScene.add(previewTank);
}

function animatePreview() {
  animationId = requestAnimationFrame(animatePreview);

  if (previewTank) {
    previewTank.rotation.y += 0.01;
  }

  previewRenderer.render(previewScene, previewCamera);
}

export function stopPreview() {
  if (animationId) cancelAnimationFrame(animationId);
  if (previewRenderer) {
    previewRenderer.dispose();
    const container = document.getElementById("tank-preview");
    if (container && container.firstChild) {
      container.removeChild(container.firstChild);
    }
  }
}
