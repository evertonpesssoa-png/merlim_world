import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160/build/three.module.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.160/examples/jsm/loaders/GLTFLoader.js";

// ======================
// DEBUG NA TELA
// ======================
const debug = document.createElement("div");

debug.style.position = "fixed";
debug.style.top = "10px";
debug.style.left = "10px";
debug.style.padding = "8px 12px";
debug.style.background = "rgba(0,0,0,0.7)";
debug.style.color = "#00ff88";
debug.style.fontFamily = "monospace";
debug.style.fontSize = "14px";
debug.style.borderRadius = "8px";
debug.style.zIndex = "9999";

debug.innerText = "INIT";
document.body.appendChild(debug);

// ======================
// SCENE
// ======================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x222222);

// ======================
// CAMERA
// ======================
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

camera.position.set(0, 2, 8);
camera.lookAt(0, 0, 0);

// ======================
// RENDERER
// ======================
const renderer = new THREE.WebGLRenderer({
  antialias: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;

// ======================
// CANVAS
// ======================
renderer.domElement.style.position = "fixed";
renderer.domElement.style.top = "0";
renderer.domElement.style.left = "0";
renderer.domElement.style.width = "100%";
renderer.domElement.style.height = "100%";
renderer.domElement.style.zIndex = "999";

document.body.appendChild(renderer.domElement);

// ======================
// LUZES
// ======================
const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
directionalLight.position.set(5, 10, 5);
scene.add(directionalLight);

// ======================
// CHÃO
// ======================
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 20),
  new THREE.MeshStandardMaterial({ color: 0x111111 })
);

floor.rotation.x = -Math.PI / 2;
floor.position.y = -2;
scene.add(floor);

// ======================
// MODELO OCULOS GLB
// ======================
const loader = new GLTFLoader();

let model = null;

loader.load(
  "./oculos_kita.glb", // 👈 está na raiz

  (gltf) => {
    model = gltf.scene;

    model.scale.set(1, 1, 1);
    model.position.set(0, 0, 0);

    model.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    scene.add(model);

    debug.innerText = "OCULOS OK";
  },

  (xhr) => {
    if (xhr.total) {
      const percent = (xhr.loaded / xhr.total) * 100;
      debug.innerText = "CARREGANDO " + percent.toFixed(0) + "%";
    }
  },

  (error) => {
    console.error(error);
    debug.innerText = "ERRO GLB";
  }
);

// ======================
// RESPONSIVO
// ======================
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ======================
// LOOP
// ======================
function animate() {
  requestAnimationFrame(animate);

  if (model) {
    model.rotation.y += 0.01; // leve rotação pra teste
  }

  renderer.render(scene, camera);
}

// ======================
// START
// ======================
try {
  animate();
  debug.innerText = "RENDER OK";
} catch (e) {
  debug.innerText = "ERRO: " + e.message;
  console.error(e);
}