/* =========================
   CENA
========================= */
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

/* =========================
   LUZ
========================= */
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 5);
scene.add(light);

scene.add(new THREE.AmbientLight(0xffffff, 0.7));

/* =========================
   CHÃO
========================= */
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(200, 200),
  new THREE.MeshStandardMaterial({ color: 0xffffff })
);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

/* =========================
   PLAYER
========================= */
const player = new THREE.Group();

const body = new THREE.Mesh(
  new THREE.CylinderGeometry(0.5, 0.7, 2, 16),
  new THREE.MeshStandardMaterial({ color: 0xcccccc })
);
body.position.y = 1;
player.add(body);

scene.add(player);

/* =========================
   CUBOS
========================= */
const cubes = [];

function createCube(x, z) {
  const cube = new THREE.Mesh(
    new THREE.BoxGeometry(2, 2, 2),
    new THREE.MeshStandardMaterial({
      color: 0xdfe6ff,
      metalness: 0.6,
      roughness: 0.2,
      emissive: 0x001133,
      emissiveIntensity: 0.5
    })
  );

  cube.position.set(x, 1, z);
  scene.add(cube);
  cubes.push(cube);
}

createCube(5, 5);
createCube(-5, 8);
createCube(8, -5);

/* =========================
   MOVIMENTO
========================= */
let moveX = 0;
let moveZ = 0;
let velocityY = 0;
let gravity = -0.02;
let canJump = false;

/* =========================
   JOYSTICK
========================= */
const joystick = document.getElementById("joystick");
const stick = document.getElementById("stick");

joystick.addEventListener("touchmove", e => {
  const rect = joystick.getBoundingClientRect();
  const touch = e.touches[0];

  const x = touch.clientX - rect.left - 60;
  const y = touch.clientY - rect.top - 60;

  moveX = x / 40;
  moveZ = y / 40;

  stick.style.left = (x + 60) + "px";
  stick.style.top = (y + 60) + "px";
});

joystick.addEventListener("touchend", () => {
  moveX = 0;
  moveZ = 0;
  stick.style.left = "30px";
  stick.style.top = "30px";
});

/* =========================
   PULO
========================= */
document.getElementById("jumpBtn").addEventListener("click", () => {
  if (canJump) {
    velocityY = 0.4;
    canJump = false;
  }
});

/* =========================
   CÂMERA
========================= */
let cameraRotationY = 0;
const rotateArea = document.getElementById("rotateArea");

let lastTouchX = 0;

rotateArea.addEventListener("touchstart", e => {
  lastTouchX = e.touches[0].clientX;
});

rotateArea.addEventListener("touchmove", e => {
  const currentX = e.touches[0].clientX;
  const delta = currentX - lastTouchX;
  lastTouchX = currentX;
  cameraRotationY -= delta * 0.005;
});

/* =========================
   INTERAÇÃO
========================= */
const raycaster = new THREE.Raycaster();

window.addEventListener("touchstart", () => {
  raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
  const intersects = raycaster.intersectObjects(cubes);

  if (intersects.length > 0) {
    alert("Módulo Merlim Ativado");
  }
});

/* =========================
   LOOP
========================= */
function animate() {
  requestAnimationFrame(animate);

  const speed = 0.15;

  if (moveX !== 0 || moveZ !== 0) {
    const angle = Math.atan2(moveX, moveZ);
    const finalAngle = angle + cameraRotationY;

    const nextX = player.position.x + Math.sin(finalAngle) * speed;
    const nextZ = player.position.z + Math.cos(finalAngle) * speed;

    let blocked = false;

    cubes.forEach(cube => {
      const box = new THREE.Box3().setFromObject(cube);
      const playerBox = new THREE.Box3(
        new THREE.Vector3(nextX - 0.5, player.position.y - 1, nextZ - 0.5),
        new THREE.Vector3(nextX + 0.5, player.position.y + 2, nextZ + 0.5)
      );

      if (box.intersectsBox(playerBox)) {
        blocked = true;

        if (player.position.y >= cube.position.y) {
          player.position.y = box.max.y + 0.01;
          velocityY = 0;
          canJump = true;
        }
      }
    });

    if (!blocked) {
      player.position.x = nextX;
      player.position.z = nextZ;
    }

    player.rotation.y = finalAngle;
  }

  velocityY += gravity;
  player.position.y += velocityY;

  if (player.position.y <= 1) {
    player.position.y = 1;
    velocityY = 0;
    canJump = true;
  }

  camera.position.x = player.position.x - Math.sin(cameraRotationY) * 6;
  camera.position.z = player.position.z - Math.cos(cameraRotationY) * 6;
  camera.position.y = player.position.y + 4;
  camera.lookAt(player.position);

  renderer.render(scene, camera);
}

animate();

/* =========================
   RESPONSIVO
========================= */
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});