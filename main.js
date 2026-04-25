import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160/build/three.module.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.160/examples/jsm/loaders/GLTFLoader.js";

// ======================
// CORE
// ======================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xeef3ff);
scene.fog = new THREE.FogExp2(0xeef3ff, 0.002);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// ======================
// LUZ (mais robusta)
// ======================
scene.add(new THREE.AmbientLight(0xffffff, 0.8));

const dirLight = new THREE.DirectionalLight(0xffffff, 1.3);
dirLight.position.set(30, 60, 20);
scene.add(dirLight);

scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 1.2));

// ======================
// CHÃO + GRID
// ======================
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(1000, 1000),
  new THREE.MeshStandardMaterial({ color: 0xffffff })
);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

const grid = new THREE.GridHelper(1000, 50, 0x00ffff, 0x00ffff);
grid.position.y = 0.01;
grid.material.transparent = true;
grid.material.opacity = 0.25;
scene.add(grid);

// ======================
// PLAYER BASE
// ======================
const player = new THREE.Group();
player.position.y = 1;
scene.add(player);

const placeholder = new THREE.Mesh(
  new THREE.ConeGeometry(0.6, 2, 6),
  new THREE.MeshStandardMaterial({ color: 0xffffff })
);
placeholder.position.y = 1;
player.add(placeholder);

// ======================
// CAMERA CONTROL
// ======================
let camRotY = 0;
let camRotX = -0.3;

// ======================
// CONTROLES
// ======================
let moveX = 0, moveZ = 0;
let velocityY = 0;
let gravity = -0.02;
let canJump = false;

const joystick = document.getElementById("joystick");
const jumpButton = document.getElementById("jumpButton");

joystick.addEventListener("touchmove", (e) => {
  const rect = joystick.getBoundingClientRect();
  const t = e.touches[0];

  moveX = (t.clientX - rect.left - rect.width / 2) / 40;
  moveZ = -(t.clientY - rect.top - rect.height / 2) / 40;
});

joystick.addEventListener("touchend", () => {
  moveX = 0;
  moveZ = 0;
});

jumpButton.addEventListener("touchstart", () => {
  if (canJump) {
    velocityY = 0.4;
    canJump = false;
  }
});

// ======================
// CAMERA SWIPE
// ======================
let rotating = false;
let prev = { x: 0, y: 0 };

renderer.domElement.addEventListener("touchstart", (e) => {
  if (e.target.id === "joystick" || e.target.id === "jumpButton") return;

  rotating = true;
  prev.x = e.touches[0].clientX;
  prev.y = e.touches[0].clientY;
});

renderer.domElement.addEventListener("touchmove", (e) => {
  if (!rotating) return;

  const t = e.touches[0];
  const dx = t.clientX - prev.x;
  const dy = t.clientY - prev.y;

  camRotY -= dx * 0.004;
  camRotX -= dy * 0.004;

  camRotX = Math.max(-1.2, Math.min(0.8, camRotX));

  prev.x = t.clientX;
  prev.y = t.clientY;
});

renderer.domElement.addEventListener("touchend", () => {
  rotating = false;
});

// ======================
// MAGA GLB (ROBUSTA)
// ======================
const loader = new GLTFLoader();

let maga = null;
let mixer = null;

loader.load(
  "maga.gbl",

  (gltf) => {
    console.log("🧙 Maga carregada");

    maga = gltf.scene;

    // 🔥 garante visibilidade SEM depender de bounding box extrema
    maga.position.set(0, 0, 0);
    maga.scale.set(2, 2, 2);

    scene.add(maga);

    // animação
    if (gltf.animations && gltf.animations.length > 0) {
      mixer = new THREE.AnimationMixer(maga);
      gltf.animations.forEach((clip) => mixer.clipAction(clip).play());
    }

    player.remove(placeholder);
  },

  undefined,

  (err) => {
    console.error("Erro ao carregar maga:", err);
  }
);

// ======================
// CUBOS (VISÍVEIS SEM FALHA)
// ======================
const cubes = [];
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

for (let i = 0; i < 30; i++) {
  const cube = new THREE.Mesh(
    new THREE.BoxGeometry(3, Math.random() * 6 + 2, 3),
    new THREE.MeshStandardMaterial({
      color: 0x111111,
      emissive: 0x000000,
      metalness: 0.4,
      roughness: 0.5
    })
  );

  cube.position.set(
    (Math.random() - 0.5) * 150,
    2,
    (Math.random() - 0.5) * 150
  );

  cube.userData.module = "Módulo " + i;

  cubes.push(cube);
  scene.add(cube);
}

// ======================
// HUD CHAT
// ======================
const chatHUD = document.getElementById("chatHUD");
const dashboardHUD = document.getElementById("dashboardHUD");
const chatMessages = document.getElementById("chatMessages");

function addMessage(text) {
  const msg = document.createElement("div");
  msg.textContent = "Merlim: " + text;
  chatMessages.appendChild(msg);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// ======================
// INTERAÇÃO CUBOS
// ======================
renderer.domElement.addEventListener("touchstart", (e) => {
  if (e.target.id === "joystick" || e.target.id === "jumpButton") return;

  mouse.x = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.touches[0].clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  const hit = raycaster.intersectObjects(cubes);

  if (hit.length > 0) {
    const c = hit[0].object;

    c.material.emissive.set(0x00ffff);

    setTimeout(() => {
      c.material.emissive.set(0x000000);
    }, 400);

    addMessage("Ativou " + c.userData.module);
  }
});

// ======================
// LOOP
// ======================
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();

  if (mixer) mixer.update(delta);

  const speed = 0.15;

  if (moveX || moveZ) {
    const angle = Math.atan2(moveX, moveZ);
    const final = angle + camRotY;

    player.position.x += Math.sin(final) * speed;
    player.position.z += Math.cos(final) * speed;

    player.rotation.y = final;
  }

  velocityY += gravity;
  player.position.y += velocityY;

  if (player.position.y <= 1) {
    player.position.y = 1;
    velocityY = 0;
    canJump = true;
  }

  // câmera segura
  const offset = new THREE.Vector3(0, 5, 10);
  offset.applyAxisAngle(new THREE.Vector3(1, 0, 0), camRotX);
  offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), camRotY);

  camera.position.copy(player.position).add(offset);
  camera.lookAt(player.position);

  renderer.render(scene, camera);
}

animate();

// ======================
// RESIZE
// ======================
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});