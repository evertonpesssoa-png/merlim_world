import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160/build/three.module.js";

// ======================
// DEBUG NA TELA
// ======================
const debug = document.createElement("div");
debug.style.position = "fixed";
debug.style.top = "10px";
debug.style.left = "10px";
debug.style.color = "red";
debug.style.zIndex = "9999";
debug.innerText = "INIT";
document.body.appendChild(debug);

// ======================
// SCENE
// ======================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x222222);

// ======================
// CAMERA (FORÇADA)
// ======================
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
camera.position.set(0, 5, 10);
camera.lookAt(0, 0, 0);

// ======================
// RENDERER (FORÇA NA FRENTE)
// ======================
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);

// 🔥 ISSO RESOLVE MUITO BUG
renderer.domElement.style.position = "fixed";
renderer.domElement.style.top = "0";
renderer.domElement.style.left = "0";
renderer.domElement.style.zIndex = "0";

document.body.appendChild(renderer.domElement);

// ======================
// LUZ
// ======================
scene.add(new THREE.AmbientLight(0xffffff, 2));

// ======================
// OBJETO TESTE (SE NÃO APARECER → PROBLEMA GLOBAL)
// ======================
const cube = new THREE.Mesh(
  new THREE.BoxGeometry(2, 2, 2),
  new THREE.MeshStandardMaterial({ color: 0x00ff00 })
);
scene.add(cube);

// ======================
// LOOP
// ======================
function animate() {
  requestAnimationFrame(animate);

  cube.rotation.y += 0.01;

  renderer.render(scene, camera);
}

try {
  animate();
  debug.innerText = "RENDER OK";
} catch (e) {
  debug.innerText = "ERRO: " + e.message;
}