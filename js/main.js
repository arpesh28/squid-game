//  Imports
import * as THREE from "three";
import { gsap } from "gsap";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

//  Create a scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

renderer.setClearColor(0xb7c3f3, 1); // Change background color

const light = new THREE.AmbientLight(0xffffff); // soft white light
scene.add(light);

//  Global Variables
const start_position = 0.6;
const end_position = -start_position;
const text = document.querySelector(".text");
const TIME_LIMIT = 10;
let gameStat = "loading";
let isLookingBack = true;

//  Utility Function to create CUBE
const createCube = (size, positionX, rotY, color = 0xfbc851) => {
  //  Adding a geometry (Cube) to the scene
  const geometry = new THREE.BoxGeometry(size.w, size.h, size.d);
  const material = new THREE.MeshBasicMaterial({ color });
  const cube = new THREE.Mesh(geometry, material);
  cube.position.x = positionX;
  cube.rotation.y = rotY;
  scene.add(cube);
  return cube;
};

camera.position.z = 1; // Sets the distance of the camera from the subject/object

const loader = new GLTFLoader();

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
// Classes
class Doll {
  constructor() {
    loader.load("../models/scene.gltf", (gltf) => {
      scene.add(gltf.scene);
      gltf.scene.scale.set(0.3, 0.3, 0.3);
      gltf.scene.position.set(0, 0.1, 0);
      this.doll = gltf.scene;
    });
  }

  lookBack() {
    // this.doll.rotation.y = -3.15;
    gsap.to(this.doll.rotation, { y: -3.15, duration: 0.5 });
    setTimeout(() => (isLookingBack = true), 200);
  }
  lookFront() {
    // this.doll.rotation.y = 0;
    gsap.to(this.doll.rotation, { y: 0, duration: 0.5 });
    setTimeout(() => (isLookingBack = false), 500);
  }
  async start() {
    this.lookBack();
    await delay(Math.random() * 1000 + 1000);
    this.lookFront();
    await delay(Math.random() * 750 + 750);
    this.start();
  }
}
class Player {
  constructor() {
    const geometry = new THREE.SphereGeometry(0.1, 32, 16);
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);
    sphere.position.x = start_position;
    sphere.position.z = 0.3;
    scene.add(sphere);
    this.player = sphere;
    this.playerInfo = {
      positionX: start_position,
      velocity: 0,
    };
  }
  run() {
    this.playerInfo.velocity = 0.01;
  }
  stop() {
    // this.playerInfo.velocity = 0;
    gsap.to(this.playerInfo, { velocity: 0, duration: 0.1 });
  }
  check() {
    if (this.playerInfo.velocity > 0 && !isLookingBack) {
      text.innerText = "You lose!";
      gameStat = "over";
    }
    if (this.playerInfo.positionX < end_position) {
      text.innerText = "You win!";
      gameStat = "over";
    }
  }
  update() {
    this.check();
    this.playerInfo.positionX -= this.playerInfo.velocity;
    this.player.position.x = this.playerInfo.positionX;
  }
}

const createTrack = () => {
  createCube(
    { w: start_position * 2, h: 0.3, d: 0.2 },
    0,
    0,
    0xe5a716
  ).position.z = -0.5;
  createCube({ w: 0.05, h: 0.3, d: 0.2 }, start_position, -0.2).position.z =
    -0.3;
  createCube({ w: 0.05, h: 0.3, d: 0.2 }, end_position, 0.2).position.z = -0.3;
};
createTrack();

const player = new Player();
let doll = new Doll();

async function init() {
  await delay(1000);
  text.innerText = "Starting in 3";
  await delay(1000);
  text.innerText = "Starting in 2";
  await delay(1000);
  text.innerText = "Starting in 1";
  await delay(500);
  text.innerText = "Go!";
  startGame();
}

function startGame() {
  let progressBar = createCube({ w: 0.5, h: 0.03, d: 0.2 }, 0, 0);
  progressBar.position.y = 0.65;
  gsap.to(progressBar.scale, { x: 0, duration: TIME_LIMIT });
  gameStat = "started";
  doll.start();
  setTimeout(() => {
    if (gameStat !== "over") {
      text.innerText = "Timeout!";
      gameStat = "over";
    }
  }, TIME_LIMIT * 1000);
}
init();

function animate() {
  if (gameStat === "over") return;
  renderer.render(scene, camera);
  //  Rotate animation
  // cube.rotation.x += 0.01;
  // cube.rotation.y += 0.01;
  requestAnimationFrame(animate); //  Keeps calling animate function repetitively to keep rendering
  player.update();
}

animate();

//  Event Listeners
window.addEventListener("resize", onWindowResize, false);

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener("keydown", (e) => {
  if (gameStat !== "started") return;
  if (e.key === "ArrowLeft") {
    player.run();
  }
});

window.addEventListener("keyup", (e) => {
  if (e.key === "ArrowLeft") {
    player.stop();
  }
});
