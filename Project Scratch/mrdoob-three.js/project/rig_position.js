import * as THREE from '../build/three.module.js';
import { OrbitControls } from '../build/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
const cubeMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
scene.add(cube);

// Create a camera rig
const cameraRig = new THREE.Group();
cameraRig.position.set(0, 5, 10);
cameraRig.add(camera);
scene.add(cameraRig);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1, 0);

// Arrow key controls
const moveSpeed = 0.1;
document.addEventListener('keydown', (event) => {
  switch (event.key) {
    case 'ArrowUp':
      cube.position.z -= moveSpeed;
      break;
    case 'ArrowDown':
      cube.position.z += moveSpeed;
      break;
    case 'ArrowLeft':
      cube.position.x -= moveSpeed;
      break;
    case 'ArrowRight':
      cube.position.x += moveSpeed;
      break;
  }
});

const animate = () => {
  requestAnimationFrame(animate);

  // Update the controls
  controls.update();

  // Update camera rig's position to follow the cube
  cameraRig.position.copy(cube.position);

  renderer.render(scene, camera);
};

animate();