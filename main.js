import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160/build/three.module.js";

// Cena
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf2f2f2);
scene.fog = new THREE.Fog(0xf2f2f2, 20, 200);

// Câmera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 2, 5);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// Luz
const ambient = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambient);

const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(10, 20, 10);
dirLight.castShadow = true;
scene.add(dirLight);

// Chão
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(1000, 1000),
  new THREE.MeshStandardMaterial({ color: 0xffffff })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Cubos
for (let i = 0; i < 80; i++) {
  const height = Math.random() * 10 + 1;

  const cube = new THREE.Mesh(
    new THREE.BoxGeometry(
      Math.random() * 4 + 1,
      height,
      Math.random() * 4 + 1
    ),
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.3,
      metalness: 0.1
    })
  );

  cube.position.set(
    (Math.random() - 0.5) * 200,
    height / 2,
    (Math.random() - 0.5) * 200
  );

  cube.castShadow = true;
  cube.receiveShadow = true;

  scene.add(cube);
}

// Maga placeholder
const mageGroup = new THREE.Group();

const body = new THREE.Mesh(
  new THREE.ConeGeometry(0.6, 2, 4),
  new THREE.MeshStandardMaterial({ color: 0xeeeeee })
);
body.position.y = 1;
mageGroup.add(body);

const head = new THREE.Mesh(
  new THREE.SphereGeometry(0.4, 16, 16),
  new THREE.MeshStandardMaterial({ color: 0xffffff })
);
head.position.y = 2.2;
mageGroup.add(head);

scene.add(mageGroup);

// =============================
// CONTROLE MOBILE
// =============================

// Olhar ao redor
let isTouching = false;
let previousTouch = { x: 0, y: 0 };

document.addEventListener("touchstart", (e) => {
  isTouching = true;
  previousTouch.x = e.touches[0].clientX;
  previousTouch.y = e.touches[0].clientY;
});

document.addEventListener("touchmove", (e) => {
  if (!isTouching) return;

  const touch = e.touches[0];
  const deltaX = touch.clientX - previousTouch.x;
  const deltaY = touch.clientY - previousTouch.y;

  camera.rotation.y -= deltaX * 0.005;
  camera.rotation.x -= deltaY * 0.005;

  camera.rotation.x = Math.max(
    -Math.PI / 2,
    Math.min(Math.PI / 2, camera.rotation.x)
  );

  previousTouch.x = touch.clientX;
  previousTouch.y = touch.clientY;
});

document.addEventListener("touchend", () => {
  isTouching = false;
});

// Joystick
const joystick = document.getElementById("joystick");

let moveX = 0;
let moveZ = 0;

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

// =============================
// ANIMAÇÃO
// =============================

function animate() {
  requestAnimationFrame(animate);

  const speed = 0.1;

  camera.position.x -= Math.sin(camera.rotation.y) * moveZ * speed;
  camera.position.z -= Math.cos(camera.rotation.y) * moveZ * speed;

  camera.position.x -= Math.cos(camera.rotation.y) * moveX * speed;
  camera.position.z += Math.sin(camera.rotation.y) * moveX * speed;

  renderer.render(scene, camera);
}

animate();

// Responsivo
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});