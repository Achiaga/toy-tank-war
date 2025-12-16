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
  const textureLoader = new THREE.TextureLoader();

  // 1. Ground: Wooden Floor
  const woodTexture = textureLoader.load("assets/wood_floor.png");
  woodTexture.wrapS = THREE.RepeatWrapping;
  woodTexture.wrapT = THREE.RepeatWrapping;
  woodTexture.repeat.set(10, 10);

  state.ground.geometry.dispose();
  state.ground.geometry = new THREE.PlaneGeometry(500, 500);
  state.ground.material = new THREE.MeshStandardMaterial({
    map: woodTexture,
    roughness: 0.8,
    metalness: 0.1,
  });

  // Toy Colors Palette
  const toyColors = [
    0xff0000, // Red
    0x00ff00, // Green
    0x0000ff, // Blue
    0xffff00, // Yellow
    0xffa500, // Orange
    0x800080, // Purple
  ];

  const getRandomToyMaterial = () => {
    const color = toyColors[Math.floor(Math.random() * toyColors.length)];
    return new THREE.MeshStandardMaterial({
      color: color,
      roughness: 0.2, // Shiny plastic
      metalness: 0.1,
    });
  };

  // 2. Boundary Walls: Cloud Wallpaper
  const cloudTexture = textureLoader.load("assets/cloud_wallpaper.png");
  cloudTexture.wrapS = THREE.RepeatWrapping;
  cloudTexture.wrapT = THREE.RepeatWrapping;
  cloudTexture.repeat.set(4, 1);

  const roomWallMaterial = new THREE.MeshStandardMaterial({
    map: cloudTexture,
  });
  const baseboardMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 }); // Dark Wood

  const outerWalls = [
    // North
    { size: [100, 40, 2], pos: [0, 20, -50] },
    // South
    { size: [100, 40, 2], pos: [0, 20, 50] },
    // East
    { size: [2, 40, 100], pos: [50, 20, 0] },
    // West
    { size: [2, 40, 100], pos: [-50, 20, 0] },
  ];

  outerWalls.forEach(({ size, pos }) => {
    // Baseboard
    const bbHeight = 4;
    const bb = new THREE.Mesh(
      new THREE.BoxGeometry(size[0], bbHeight, size[2]),
      baseboardMaterial
    );
    bb.position.set(pos[0], bbHeight / 2, pos[2]);
    bb.receiveShadow = true;
    state.scene.add(bb);
    state.walls.push(bb);

    // Wall
    const wall = new THREE.Mesh(
      new THREE.BoxGeometry(size[0], size[1], size[2]),
      roomWallMaterial
    );
    wall.position.set(pos[0], bbHeight + size[1] / 2, pos[2]);
    wall.receiveShadow = true;
    state.scene.add(wall);
    state.walls.push(wall);
  });

  // 3. Obstacles: Toys!

  // Helper to add physics object
  const addToy = (mesh) => {
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    state.scene.add(mesh);
    state.walls.push(mesh);
  };

  // Helper to create a Lego-like brick
  const createLegoBrick = (width, height, depth, x, y, z, material) => {
    const brick = new THREE.Mesh(
      new THREE.BoxGeometry(width, height, depth),
      material
    );
    brick.position.set(x, y, z);
    brick.castShadow = true;
    brick.receiveShadow = true;

    // Studs on top
    const studGeo = new THREE.CylinderGeometry(0.6, 0.6, 0.4, 16);
    const studCountX = Math.floor(width / 2);
    const studCountZ = Math.floor(depth / 2);

    for (let i = 0; i < studCountX; i++) {
      for (let j = 0; j < studCountZ; j++) {
        const stud = new THREE.Mesh(studGeo, material);
        stud.position.set(
          -width / 2 + 1 + i * 2,
          height / 2 + 0.2,
          -depth / 2 + 1 + j * 2
        );
        brick.add(stud);
      }
    }

    state.scene.add(brick);
    state.walls.push(brick);
  };

  // A. Building Block Forts (Lego Style)
  const createBlockFort = (x, z) => {
    createLegoBrick(4, 4, 8, x, 2, z, getRandomToyMaterial());
    createLegoBrick(8, 4, 4, x, 6, z, getRandomToyMaterial());
  };

  createBlockFort(-35, -35);
  createBlockFort(35, -35);
  createBlockFort(35, 35);
  createBlockFort(-35, 35);

  // B. Scattered Toys (Mid Obstacles)
  const midToys = [
    { type: "box", pos: [-20, 2, 0], size: [6, 6, 6] }, // Giant Dice?
    { type: "cylinder", pos: [20, 3, 0], size: [3, 3, 6] }, // Soda can
    { type: "sphere", pos: [0, 3, -20], size: [4] }, // Ball
    { type: "box", pos: [0, 2, 20], size: [8, 4, 2] }, // Domino
  ];

  midToys.forEach((toy) => {
    let mesh;
    const mat = getRandomToyMaterial();
    if (toy.type === "box") {
      // Make it a lego brick if it's a box
      createLegoBrick(
        toy.size[0],
        toy.size[1],
        toy.size[2],
        toy.pos[0],
        toy.pos[1],
        toy.pos[2],
        mat
      );
      return;
    } else if (toy.type === "cylinder") {
      mesh = new THREE.Mesh(
        new THREE.CylinderGeometry(toy.size[0], toy.size[1], toy.size[2], 32),
        mat
      );
    } else if (toy.type === "sphere") {
      mesh = new THREE.Mesh(new THREE.SphereGeometry(toy.size[0], 32, 32), mat);
    }
    mesh.position.set(...toy.pos);
    addToy(mesh);
  });

  // C. Central Objective: The "Claw" Machine Base or Tower
  const platform = new THREE.Mesh(
    new THREE.CylinderGeometry(10, 10, 0.5, 32),
    new THREE.MeshStandardMaterial({ color: 0x333333 })
  );
  platform.position.y = 0.25;
  platform.receiveShadow = true;
  state.scene.add(platform);

  const tower = new THREE.Mesh(
    new THREE.CylinderGeometry(3, 4, 15, 8),
    new THREE.MeshStandardMaterial({
      color: 0xff00ff,
      emissive: 0xff00ff,
      emissiveIntensity: 0.5,
      roughness: 0.2,
    })
  );
  tower.position.y = 7.5;
  addToy(tower);

  // D. Random Scattered Bricks
  for (let i = 0; i < 25; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 15 + Math.random() * 25;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;

    const size = 2 + Math.floor(Math.random() * 3) * 2; // Even sizes for studs
    const shapeType = Math.random();

    if (shapeType < 0.6) {
      // Lego Brick
      createLegoBrick(size, 2, size, x, 1, z, getRandomToyMaterial());
    } else {
      // Cylinder
      const mat = getRandomToyMaterial();
      const mesh = new THREE.Mesh(
        new THREE.CylinderGeometry(size / 2, size / 2, size, 16),
        mat
      );
      mesh.position.set(x, size / 2, z);
      addToy(mesh);
    }
  }
}
