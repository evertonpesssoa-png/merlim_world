import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160/build/three.module.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.160/examples/jsm/loaders/GLTFLoader.js";

// ======================
// SCENE
// ======================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);

// ======================
// CAMERA (mais próxima)
// ======================
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

camera.position.set(0, 1.5, 3); // 👈 MAIS PERTO
camera.lookAt(0, 0, 0);

// ======================
// RENDERER
// ======================
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

document.body.appendChild(renderer.domElement);

// ======================
// LUZ FORTE (IMPORTANTE)
// ======================
scene.add(new THREE.AmbientLight(0xffffff, 3));

const light = new THREE.DirectionalLight(0xffffff, 3);
light.position.set(5, 10, 5);
scene.add(light);

// ======================
// PLANO DE REFERÊNCIA (pra não ficar “branco infinito”)
// ======================
const grid = new THREE.GridHelper(10, 10);
scene.add(grid);

// ======================
// TESTE DE ORIENTAÇÃO
// ======================
const axis = new THREE.AxesHelper(3);
scene.add(axis);

// ======================
// MODELO
// ======================
const loader = new GLTFLoader();

loader.load(
  "./oculos_kita.glb",

  (gltf) => {
    const model = gltf.scene;

    // 🔥 FORÇA ESCALA EXTREMA PRA TESTE
    model.scale.set(5, 5, 5);

    // 🔥 CENTRALIZA GARANTIDO
    model.position.set(0, 0, 0);

    scene.add(model);

    console.log("MODELO CARREGADO", model);
  },

  undefined,

  (err) => {
    console.error("ERRO GLB:", err);
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
  renderer.render(scene, camera);
}

animate();