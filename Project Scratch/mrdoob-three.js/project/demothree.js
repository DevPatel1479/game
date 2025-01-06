import * as THREE from '../build/three.module.js'
import { OrbitControls } from '../build/OrbitControls.js'

const scene = new THREE.Scene();


const loader = new THREE.TextureLoader();

var bgimg = loader.load('../project/img30.jpg');

scene.background = bgimg;


let fov = 75;
let aspect = innerWidth/innerHeight;
let near = 0.01;
let far = 1000;


const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);


camera.position.set(0,0,10);

const renderer = new THREE.WebGLRenderer();

renderer.setSize(innerWidth, innerHeight);




document.body.appendChild(renderer.domElement);

var controls = new OrbitControls(camera, renderer.domElement);
controls.update();

const geometry = new THREE.BoxGeometry(2, 4, 6);

const material = new THREE.MeshBasicMaterial({color : 'blue',
wireframe : false});

const cube = new THREE.Mesh(geometry, material);

scene.add(cube);

//renderer.render(scene, camera);


function animateObject(){

    renderer.render(scene, camera);
    //cube.rotation.x += 0.1;
    // cube.rotation.y += 0.4;
    //cube.rotation.z += 0.1;
    requestAnimationFrame(animateObject);
    controls.update();
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



