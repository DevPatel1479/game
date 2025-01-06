// import * as THREE from "../build/three.module.js";

// var camera, scene, renderer, mesh, goal;

// var matrix = new THREE.Matrix4();

// var stop = 1;
// var DEGTORAD = 0.01745327;
// var temp = new THREE.Vector3;

// init();
// animate();

// function init() {

//     camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 10 );
//     camera.position.set( 0, 0.5, - 2 );
    
//     scene = new THREE.Scene();
//     camera.lookAt( scene.position );

//     var geometry = new THREE.BoxGeometry( 0.2, 0.2, 0.2 );
//     var material = new THREE.MeshNormalMaterial();

//     mesh = new THREE.Mesh( geometry, material );
    
//     goal = new THREE.Object3D;
    
//     mesh.add( goal );
//     scene.add( mesh );
    
//     goal.position.set(0, 2, -2);
    
//     var gridHelper = new THREE.GridHelper( 4, 10 );
//     scene.add( gridHelper );
    
//     scene.add( new THREE.AxesHelper() );

//     renderer = new THREE.WebGLRenderer( { antialias: true } );
//     renderer.setSize( window.innerWidth, window.innerHeight );
//     document.body.appendChild( renderer.domElement );

// }


// addEventListener("keypress", function (event){

//     if (event.code === "KeyA"){
//         mesh.position.x += 0.1;
//     }
//     else if (event.code === "KeyW"){
//         mesh.position.z += 0.1;
//     }
//     else if (event.code === "KeyD"){
//         mesh.position.x -= 0.1;
//     }
//     else if (event.code === "KeyS"){
//         mesh.position.z -= 0.1;
//     }


// });


// function animate() {

//     requestAnimationFrame( animate );

   
  
//       // mesh.rotateY( Math.random() * 360 * DEGTORAD )

    
      
      
      
    
// 		  // mesh.translateZ(0.01);
    
//     // temp.setFromMatrixPosition(goal.matrixWorld);
    
     
//     const tmpZ = mesh.position.z - 0.5;
//     camera.position.set(0, 0.5, tmpZ);
    
//     const tmpX = mesh.position.x;
//     camera.position.set(tmpX, 0.5, tmpZ-0.5);
//     // camera.position.lerp(temp, 0.5);

    
//     renderer.render( scene, camera );

// }
import * as THREE from "../build/three.module.js"
var camera, scene, renderer, mesh, goal;
var time = 0;var newPosition = new THREE.Vector3();
var matrix = new THREE.Matrix4();
var stop = 1;var DEGTORAD = 0.01745327;
var temp = new THREE.Vector3;
init();
animate();
function init() {    camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 10 ); 
  camera.position.set( 0, 0.5, -2 );
          scene = new THREE.Scene();
              camera.lookAt( scene.position ); 
                 var geometry = new THREE.BoxGeometry( 0.2, 0.2, 0.2 );
                     var material = new THREE.MeshNormalMaterial();
                         mesh = new THREE.Mesh( geometry, material );
                                mesh.position.set(0,0.2,0);
                             goal = new THREE.Object3D;
                                     mesh.add( goal );    scene.add( mesh );
                                             goal.position.set(0, 0.5, -2);
            var gridHelper = new THREE.GridHelper( 100, 100 );
                scene.add( gridHelper );
                        // scene.add( new THREE.AxesHelper() );
                            renderer = new THREE.WebGLRenderer( { antialias: true } );
        renderer.setSize( window.innerWidth, window.innerHeight );
            document.body.appendChild( renderer.domElement );
        }
        addEventListener("keypress", function (e){    if (e.code == "KeyW"){
         mesh.position.z += 0.2;
            }
        else if (e.code == "KeyD")
        {
           mesh.position.x -= 0.2;
         }
     else if (e.code == "KeyS"){
          mesh.position.z -= 0.2;
    }
    else if (e.code == "KeyA"){
     mesh.position.x += 0.2;
    }
 // console.log(mesh.position);
    });
    function animate() {
    requestAnimationFrame( animate );
     // time += 0.01;
     //mesh.translateZ(0.01);
     temp.setFromMatrixPosition(goal.matrixWorld);
    camera.position.lerp(temp, 0.2);
    camera.lookAt( mesh.position );        
renderer.render( scene, camera );}