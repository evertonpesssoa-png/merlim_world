import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160/build/three.module.js";

// ======================
// CENA
// ======================

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xeef3ff);
scene.fog = new THREE.Fog(0xeef3ff, 40, 300);

// ======================
// CAMERA
// ======================

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

// ======================
// RENDERER
// ======================

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// ======================
// LUZES
// ======================

scene.add(new THREE.AmbientLight(0xffffff, 0.6));

const dirLight = new THREE.DirectionalLight(0xffffff, 1.4);
dirLight.position.set(30, 60, 20);
dirLight.castShadow = true;
scene.add(dirLight);

// ======================
// CHÃO
// ======================

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(1000, 1000),
  new THREE.MeshStandardMaterial({ color: 0xffffff })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// ======================
// PLAYER (MAGA)
// ======================

const player = new THREE.Group();
scene.add(player);

const body = new THREE.Mesh(
  new THREE.ConeGeometry(0.6, 2, 6),
  new THREE.MeshStandardMaterial({ color: 0xf8f8ff })
);
body.position.y = 1;
player.add(body);

const head = new THREE.Mesh(
  new THREE.SphereGeometry(0.4, 16, 16),
  new THREE.MeshStandardMaterial({ color: 0xffffff })
);
head.position.y = 2.2;
player.add(head);

player.position.y = 1;

// ======================
// CUBOS INTERATIVOS
// ======================

const cubes = [];
const raycaster = new THREE.Raycaster();
const touchVector = new THREE.Vector2();

for (let i = 0; i < 50; i++) {

  const height = Math.random() * 8 + 2;

  const cube = new THREE.Mesh(
    new THREE.BoxGeometry(4, height, 4),
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.2,
      metalness: 0.2
    })
  );

  cube.position.set(
    (Math.random() - 0.5) * 200,
    height / 2,
    (Math.random() - 0.5) * 200
  );

  cube.userData.module = "Módulo " + (i + 1);

  cube.castShadow = true;
  cube.receiveShadow = true;

  cubes.push(cube);
  scene.add(cube);
}

// ======================
// CONTROLE
// ======================

let velocityY = 0;
let gravity = -0.02;
let canJump = false;

const joystick = document.getElementById("joystick");
const jumpButton = document.getElementById("jumpButton");

let moveX = 0;
let moveZ = 0;

// Joystick
joystick.addEventListener("touchmove", (e) => {
  const rect = joystick.getBoundingClientRect();
  const touch = e.touches[0];

  const x = touch.clientX - rect.left - rect.width/2;
  const y = touch.clientY - rect.top - rect.height/2;

  moveX = x / 40;
  moveZ = y / 40;
});

joystick.addEventListener("touchend", () => {
  moveX = 0;
  moveZ = 0;
});

// Pulo
jumpButton.addEventListener("touchstart", () => {
  if (canJump) {
    velocityY = 0.4;
    canJump = false;
  }
});

// ======================
// INTERAÇÃO CUBOS
// ======================

renderer.domElement.addEventListener("touchstart", (event) => {

  touchVector.x = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
  touchVector.y = -(event.touches[0].clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(touchVector, camera);
  const intersects = raycaster.intersectObjects(cubes);

  if (intersects.length > 0) {
    const cube = intersects[0].object;
    cube.material.color.set(0xaaccff);
    alert("Você tocou: " + cube.userData.module);
  }
});

// ======================
// CAMERA TERCEIRA PESSOA
// ======================

function updateCamera() {
  const offset = new THREE.Vector3(0, 5, 10);
  offset.applyAxisAngle(new THREE.Vector3(0,1,0), player.rotation.y);
  camera.position.copy(player.position).add(offset);
  camera.lookAt(player.position);
}

// ======================
// LOOP
// ======================

function animate() {
  requestAnimationFrame(animate);

  const speed = 0.15;

  player.position.x -= Math.sin(player.rotation.y) * moveZ * speed;
  player.position.z -= Math.cos(player.rotation.y) * moveZ * speed;

  player.position.x -= Math.cos(player.rotation.y) * moveX * speed;
  player.position.z += Math.sin(player.rotation.y) * moveX * speed;

  // Gravidade
  velocityY += gravity;
  player.position.y += velocityY;

  if (player.position.y <= 1) {
    player.position.y = 1;
    velocityY = 0;
    canJump = true;
  }

  updateCamera();

  renderer.render(scene, camera);
}

animate();

// Responsivo
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});