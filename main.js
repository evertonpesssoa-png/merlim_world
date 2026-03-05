import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160/build/three.module.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.160/examples/jsm/loaders/GLTFLoader.js";

// ======================
// CENA
// ======================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xeef3ff);
scene.fog = new THREE.FogExp2(0xeef3ff, 0.002);

// ======================
// CAMERA
// ======================
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
let cameraRotationY = 0;
let cameraRotationX = -0.3;

// ======================
// RENDERER
// ======================
const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// ======================
// LUZ
// ======================
scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const dirLight = new THREE.DirectionalLight(0xffffff, 1.4);
dirLight.position.set(30,60,20);
dirLight.castShadow = true;
scene.add(dirLight);

// ======================
// CHÃO FUTURISTA
// ======================
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(1000,1000,100,100),
  new THREE.MeshStandardMaterial({color:0xffffff, wireframe:false})
);
ground.rotation.x = -Math.PI/2;
ground.receiveShadow = true;
scene.add(ground);

// Grid linhas neon
const gridHelper = new THREE.GridHelper(1000, 50, 0x00ffff, 0x00ffff);
gridHelper.position.y = 0.01;
gridHelper.material.opacity = 0.2;
gridHelper.material.transparent = true;
scene.add(gridHelper);

// ======================
// PLAYER (MAGO)
 // Usaremos o modelo GLB aqui
// ======================
const loader = new GLTFLoader();
const player = new THREE.Group();
scene.add(player);

loader.load('maga.glb', (gltf)=>{
  const model = gltf.scene;
  model.traverse(child => {
    if(child.isMesh){
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
  model.scale.set(1,1,1); // ajuste tamanho se necessário
  model.position.y = 0; 
  player.add(model);
}, undefined, (err)=>{console.error("Erro ao carregar mago:", err)});

player.position.y = 0;

// ======================
// CUBOS NEON INTERATIVOS
// ======================
const cubes = [];
const raycaster = new THREE.Raycaster();
const touchVector = new THREE.Vector2();

for(let i=0;i<50;i++){
  const h = Math.random()*8+2;
  const cube = new THREE.Mesh(
    new THREE.BoxGeometry(4,h,4),
    new THREE.MeshStandardMaterial({color:0x111111, emissive:0x000000, roughness:0.3, metalness:0.7})
  );
  cube.position.set((Math.random()-0.5)*200,h/2,(Math.random()-0.5)*200);
  cube.userData.module = "Módulo "+(i+1);
  cube.castShadow = true;
  cube.receiveShadow = true;
  cubes.push(cube);
  scene.add(cube);
}

// ======================
// CONTROLES
// ======================
let velocityY=0, gravity=-0.02, canJump=false;
const joystick=document.getElementById("joystick");
const jumpButton=document.getElementById("jumpButton");
let moveX=0, moveZ=0;

joystick.addEventListener("touchmove",(e)=>{
  const rect=joystick.getBoundingClientRect();
  const touch=e.touches[0];
  moveX = (touch.clientX - rect.left - rect.width/2)/40;
  moveZ = -(touch.clientY - rect.top - rect.height/2)/40;
});
joystick.addEventListener("touchend",()=>{moveX=0;moveZ=0;});
jumpButton.addEventListener("touchstart",()=>{if(canJump){velocityY=0.4;canJump=false;}});

// ======================
// CAMERA SWIPE
// ======================
let isRotating=false;
let previousTouch={x:0,y:0};
renderer.domElement.addEventListener("touchstart",(e)=>{
  if(e.target.id==="joystick"||e.target.id==="jumpButton")return;
  isRotating=true;
  previousTouch.x=e.touches[0].clientX;
  previousTouch.y=e.touches[0].clientY;
});
renderer.domElement.addEventListener("touchmove",(e)=>{
  if(!isRotating)return;
  const touch=e.touches[0];
  const dx=touch.clientX-previousTouch.x;
  const dy=touch.clientY-previousTouch.y;
  cameraRotationY -= dx*0.004;
  cameraRotationX -= dy*0.004;
  cameraRotationX = Math.max(-1.2,Math.min(0.8,cameraRotationX));
  previousTouch.x = touch.clientX;
  previousTouch.y = touch.clientY;
});
renderer.domElement.addEventListener("touchend",()=>{isRotating=false;});

// ======================
// HUD
// ======================
const chatHUD = document.getElementById("chatHUD");
const dashboardHUD = document.getElementById("dashboardHUD");
const chatMessages = document.getElementById("chatMessages");
const chatInput = document.getElementById("chatInput");
const chatIcon = document.getElementById("chatIcon");
const dashIcon = document.getElementById("dashIcon");

function addMessage(text,type="system"){
  const msg=document.createElement("div");
  msg.style.marginBottom="4px";
  msg.textContent=(type==="user"?"Você: ":"Merlim: ")+text;
  chatMessages.appendChild(msg);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

chatInput.addEventListener("keydown",(e)=>{
  if(e.key==="Enter"&&chatInput.value.trim()!==""){
    const userText=chatInput.value;
    addMessage(userText,"user");
    setTimeout(()=>addMessage("Processando módulo..."),500);
    chatInput.value="";
  }
});

let energy=100, modulesActivated=0;
const energyValue=document.getElementById("energyValue");
const moduleCount=document.getElementById("moduleCount");
function updateDashboard(){
  energyValue.textContent=energy;
  moduleCount.textContent=modulesActivated;
}

// Toggle HUD
chatIcon.addEventListener("click",()=>{chatHUD.style.display=chatHUD.style.display==="flex"?"none":"flex";});
dashIcon.addEventListener("click",()=>{dashboardHUD.style.display=dashboardHUD.style.display==="block"?"none":"block";});

// ======================
// INTERAÇÃO CUBOS NEON
// ======================
renderer.domElement.addEventListener("touchstart",(event)=>{
  if(event.target.id==="joystick"||event.target.id==="jumpButton")return;
  touchVector.x=(event.touches[0].clientX/window.innerWidth)*2-1;
  touchVector.y=-(event.touches[0].clientY/window.innerHeight)*2+1;
  raycaster.setFromCamera(touchVector,camera);
  const intersects=raycaster.intersectObjects(cubes);
  if(intersects.length>0){
    const cube=intersects[0].object;
    cube.material.emissive.setHex(0x00ffff);
    setTimeout(()=>{cube.material.emissive.setHex(0x000000)},500);
    modulesActivated++;
    energy -=2;
    addMessage("Módulo ativado: "+cube.userData.module);
    updateDashboard();
  }
});

// ======================
// LOOP
// ======================
function animate(){
  requestAnimationFrame(animate);
  const speed=0.15;
  if(moveX!==0||moveZ!==0){
    const angle=Math.atan2(moveX,moveZ);
    const finalAngle=angle+cameraRotationY;
    player.position.x+=Math.sin(finalAngle)*speed;
    player.position.z+=Math.cos(finalAngle)*speed;
    player.rotation.y=finalAngle;
  }
  velocityY+=gravity;
  player.position.y+=velocityY;
  if(player.position.y<=0){player.position.y=0;velocityY=0;canJump=true;}

  // Câmera terceira pessoa
  const offset=new THREE.Vector3(0,5,10);
  offset.applyAxisAngle(new THREE.Vector3(1,0,0),cameraRotationX);
  offset.applyAxisAngle(new THREE.Vector3(0,1,0),cameraRotationY);
  camera.position.copy(player.position).add(offset);
  camera.lookAt(player.position);

  renderer.render(scene,camera);
}
animate();

window.addEventListener("resize",()=>{
  camera.aspect=window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth,window.innerHeight);
});