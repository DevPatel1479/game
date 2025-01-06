import * as THREE from '../build/three.module.js';
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, 
window.innerWidth / window.innerHeight,
0.1, 
1000 );
const renderer = new THREE.WebGLRenderer();
renderer.setClearColor('black', 1.0);
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const geometry = new THREE.BoxGeometry( 1, 1, 1 );
const geotmp = new THREE.BoxGeometry(1,0.5,1);
const material = new THREE.MeshBasicMaterial( { wireframe: true} );
const mat_tmp = new THREE.MeshBasicMaterial({color : 'yellow'});
const cube = new THREE.Mesh( geometry, material );
const cube2 = new THREE.Mesh(geometry, mat_tmp);
scene.add( cube );
scene.add( cube2);

camera.position.z = 5;

function animate() {
    requestAnimationFrame( animate );

    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    if (cube.rotation.x > 10){

        cube2.position.y = 2;
        cube2.rotation.y +=3;
        cube2.rotation.z += 1;
    }
    renderer.render( scene, camera );
}
animate();
