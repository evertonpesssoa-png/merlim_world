import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160/build/three.module.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.160/examples/jsm/loaders/GLTFLoader.js";

// ======================
// SCENE SAFE
// ======================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xeef3ff);
scene.fog = new THREE.FogExp2(0xeef3ff, 0.002);

// luz garantida (evita objeto invisível)
scene.add(new THREE.AmbientLight(0xffffff, 1.2));
const dir = new THREE.DirectionalLight(0xffffff, 1.2);
dir.position.set(20, 40, 20);
scene.add(dir);

// ======================
// CAMERA
// ======================
const camera = new THREE.PerspectiveCamera(
  75,
  innerWidth / innerHeight,
  0.1,
  1000
);

// ======================
// RENDERER
// ======================
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

// ======================
// GROUND (sempre visível)
// ======================
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(1000, 1000),
  new THREE.MeshStandardMaterial({ color: 0xffffff })
);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// grid
scene.add(new THREE.GridHelper(1000, 50, 0x00ffff, 0x00ffff));

// ======================
// PLAYER FALLBACK
// ======================
const player = new THREE.Group();
scene.add(player);

const fallback = new THREE.Mesh(
  new THREE.BoxGeometry(1, 2, 1),
  new THREE.MeshStandardMaterial({ color: 0xffffff })
);
fallback.position.y = 1;
player.add(fallback);

// ======================
// CAMERA CONTROL
// ======================
let rotY = 0;
let rotX = -0.3;

// ======================
// CONTROLS
// ======================
let moveX = 0, moveZ = 0;
let velY = 0;
let gravity = -0.02;
let canJump = false;

// ======================
// MAGA LOADER (CORRIGIDO)
// ======================
const loader = new GLTFLoader();

let maga = null;
let mixer = null;

// 🔥 IMPORTANTE: tenta glb primeiro (não gbl)
loader.load(
  "./maga.glb",   // <<<<<< CORREÇÃO CRÍTICA

  (gltf) => {
    console.log("🧙 Maga carregada");

    maga = gltf.scene;

    // posição segura (não centraliza agressivo)
    maga.position.set(0, 0, 0);
    maga.scale.set(2, 2, 2);

    scene.add(maga);

    if (gltf.animations.length) {
      mixer = new THREE.AnimationMixer(maga);
      gltf.animations.forEach(a => mixer.clipAction(a).play());
    }

    player.remove(fallback);
  },

  undefined,

  (err) => {
    console.error("❌ ERRO MAGA:", err);

    // fallback visível se GLB falhar
    fallback.material.color.set(0xff0000);
  }
);

// ======================
// SIMPLE ANIMATION LOOP
// ======================
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const dt = clock.getDelta();
  if (mixer) mixer.update(dt);

  // player move
  const speed = 0.15;

  if (moveX || moveZ) {
    const ang = Math.atan2(moveX, moveZ);
    const final = ang + rotY;

    player.position.x += Math.sin(final) * speed;
    player.position.z += Math.cos(final) * speed;
  }

  // gravity
  velY += gravity;
  player.position.y += velY;

  if (player.position.y <= 1) {
    player.position.y = 1;
    velY = 0;
    canJump = true;
  }

  // camera follow
  const offset = new THREE.Vector3(0, 5, 10);
  offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), rotY);

  camera.position.copy(player.position).add(offset);
  camera.lookAt(player.position);

  renderer.render(scene, camera);
}

animate();

// resize
addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});