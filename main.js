import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160/build/three.module.js";
import { PointerLockControls } from "https://cdn.jsdelivr.net/npm/three@0.160/examples/jsm/controls/PointerLockControls.js";

// Cena
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);
scene.fog = new THREE.Fog(0xffffff, 20, 200);

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
document.body.appendChild(renderer.domElement);

// Luz
const ambient = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambient);

const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(10, 20, 10);
scene.add(dirLight);

// Chão
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(1000, 1000),
  new THREE.MeshStandardMaterial({ color: 0xffffff })
);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// Cubos procedural
for (let i = 0; i < 200; i++) {
  const height = Math.random() * 10 + 1;

  const cube = new THREE.Mesh(
    new THREE.BoxGeometry(
      Math.random() * 4 + 1,
      height,
      Math.random() * 4 + 1
    ),
    new THREE.MeshStandardMaterial({ color: 0xffffff })
  );

  cube.position.set(
    (Math.random() - 0.5) * 200,
    height / 2,
    (Math.random() - 0.5) * 200
  );

  scene.add(cube);
}

// Maga placeholder (geométrica)
const mageGroup = new THREE.Group();

// Corpo
const body = new THREE.Mesh(
  new THREE.ConeGeometry(0.6, 2, 4),
  new THREE.MeshStandardMaterial({ color: 0xeeeeee })
);
body.position.y = 1;
mageGroup.add(body);

// Cabeça
const head = new THREE.Mesh(
  new THREE.SphereGeometry(0.4, 16, 16),
  new THREE.MeshStandardMaterial({ color: 0xffffff })
);
head.position.y = 2.2;
mageGroup.add(head);

scene.add(mageGroup);

// Controles
const controls = new PointerLockControls(camera, document.body);

document.body.addEventListener("click", () => {
  controls.lock();
});

scene.add(controls.getObject());

// Movimento
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;

document.addEventListener("keydown", (e) => {
  switch (e.code) {
    case "KeyW": moveForward = true; break;
    case "KeyS": moveBackward = true; break;
    case "KeyA": moveLeft = true; break;
    case "KeyD": moveRight = true; break;
  }
});

document.addEventListener("keyup", (e) => {
  switch (e.code) {
    case "KeyW": moveForward = false; break;
    case "KeyS": moveBackward = false; break;
    case "KeyA": moveLeft = false; break;
    case "KeyD": moveRight = false; break;
  }
});

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();

  direction.z = Number(moveForward) - Number(moveBackward);
  direction.x = Number(moveRight) - Number(moveLeft);
  direction.normalize();

  if (moveForward || moveBackward)
    velocity.z -= direction.z * 50.0 * delta;
  if (moveLeft || moveRight)
    velocity.x -= direction.x * 50.0 * delta;

  controls.moveRight(-velocity.x * delta);
  controls.moveForward(-velocity.z * delta);

  velocity.x -= velocity.x * 10.0 * delta;
  velocity.z -= velocity.z * 10.0 * delta;

  renderer.render(scene, camera);
}

animate();