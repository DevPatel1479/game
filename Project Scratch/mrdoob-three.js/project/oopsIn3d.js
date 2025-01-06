import * as THREE from '../build/three.module.js'

class Renderer{
    renderer = new Renderer();
    constructor(scene, camera){
        this.scene = scene;
        this.camera = camera;

    }
    setCameraPosition(){
        this.camera.position.set(0, 0, 10);
    }
    setupRenderer(){
        this.renderer = new THREE.WebGLRenderer();
        return this.renderer;
    }
}

let fov = 45;
let aspect = innerWidth/innerHeight;
let near = 0.1;
let far = 1000;
let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

obj3D = new Renderer();
rendererObj = new Renderer();
obj3D.setCameraPosition();

rendererObj = obj3D.setupRenderer();

document.appendChild(rendererObj.renderer.domElement);

rendererObj.render(scene, camera);
