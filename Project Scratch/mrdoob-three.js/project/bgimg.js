import * as THREE from "../build/three.module.js"
import { RGBELoader } from "../build/RGBELoader.js"
import { OrbitControls } from "../build/OrbitControls.js";

const scene = new THREE.Scene();

const texture = new THREE.TextureLoader();

//var img = texture.load('../project/spreebank.hdr');

//img.repeat = new THREE.Vector2(1,1);


let fov = 45;
let aspect = innerWidth/innerHeight;
let near = 0.1;
let far = 1000;

const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.set(0,0,10);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(innerWidth, innerHeight);




renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.6;
renderer.outputColorSpace = THREE.SRGBColorSpace;

document.body.appendChild(renderer.domElement);

new RGBELoader().load('../project/preller.hdr', function (texture){
    texture.mapping = THREE.EquirectangularRefractionMapping;
    scene.background = texture;
    screen.environment = texture; 
});


var controls = new OrbitControls(camera, renderer.domElement);
controls.minDistance = 10;
controls.maxDistance = 40;
controls.update();


const geometry = new THREE.BoxGeometry(1,1,1);
const material = new THREE.MeshBasicMaterial({ color : 'blue'});
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);


function windowResize(){
    requestAnimationFrame(windowResize);
    renderer.setSize(innerWidth, innerHeight);
}

function animate(){
    cube.rotation.z += 0.1;
    cube.rotation.x += 0.1;
    controls.update();
    requestAnimationFrame(animate);
    renderer.render(scene, camera);

}
windowResize();
animate();

