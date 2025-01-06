import * as THREE from "../build/three.module.js"


const scene = new THREE.Scene();

scene.background = new THREE.Color('blue');

let fov = 75;
let aspect = innerWidth / innerHeight;
let near = 0.01;
let far = 1000;


const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);



const renderer = new THREE.WebGLRenderer();

document.body.appendChild(renderer.domElement);

renderer.setSize(innerWidth, innerHeight);

// const g_plane = new THREE.PlaneGeometry(10, 10);

// const m_plane = new THREE.MeshBasicMaterial({color: 'blue', side: THREE.DoubleSide});

// const plane = new THREE.Mesh(g_plane, m_plane);

// plane.rotation.x =  15;

// scene.add( plane );


const g_cube = new THREE.BoxGeometry(1, 1, 1);

const m_cube = new THREE.MeshBasicMaterial({color: 'yellow'});

const cube = new THREE.Mesh(g_cube, m_cube);

cube.position.z = 5;

const tmpCubePosition = new THREE.Vector3(0,5,0);

console.log(cube.position);

camera.position.set(0,1,7);



// console.log(cube.position);
scene.add( cube );

renderer.render(scene, camera);


addEventListener("keypress", function (event){

    if (event.code == 'KeyW'){
        cube.position.z -= 1;
    }
    else if (event.code == 'KeyD'){
        cube.position.x += 1;
    }
    else if (event.code == 'KeyS'){
        cube.position.z += 1;
    }
    else if (event.code == 'KeyA'){
        cube.position.x -= 1;
    }

    renderer.render(scene, camera);
});



function animate(){

    requestAnimationFrame(animate);
    // console.log(cube.position.x, cube.position.y, cube.position.z);
    camera.position.set(
        cube.position.x,
        cube.position.y+1,
        cube.position.z+1
    )
     console.log(camera.position);
    

}

animate();
