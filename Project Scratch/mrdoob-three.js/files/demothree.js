import * as THREE from '../build/three.module.js'
import img30 from './files/img30.jpg'


const scene = new THREE.Scene();


const loader = new THREE.TextureLoader();

scene.background = loader.load('../files/img30.jpg');

let fov = 75;
let aspect = innerWidth/innerHeight;
let near = 0.01;
let far = 1000;


const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

camera.position.z = 10;

const renderer = new THREE.WebGLRenderer();

renderer.setSize(innerWidth, innerHeight);

document.body.appendChild(renderer.domElement);

const geometry = new THREE.BoxGeometry(1, 1, 1);

const material = new THREE.MeshBasicMaterial({color : 'blue'});

const cube = new THREE.Mesh(geometry, material);

scene.add(cube);

//renderer.render(scene, camera);


function animateObject(){

    renderer.render(scene, camera);
    requestAnimationFrame(animateObject);
    // cube.rotation.x += 0.1;
    // cube.rotation.z += 0.1;
    

}

addEventListener("keypress", function (e){

    if (e.code == 'KeyA'){
        cube.position.x -= 0.5;

    }
    else if (e.code == 'KeyW'){
        cube.position.y += 0.5;
    }

    else if (e.code == 'KeyD'){
        cube.position.x += 0.5;

    }
    else if (e.code == 'KeyS'){
        cube.position.y -= 0.5;

    }

});



animateObject();



