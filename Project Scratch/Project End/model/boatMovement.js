import * as THREE from "../build/three.module.js";
import { OrbitControls } from "../build/OrbitControls.js";
import { GLTFLoader } from '../build/GLTFLoader.js';
import { Water } from '../build/Water.js';
import { Sky } from '../build/Sky.js';
let controls, water, sun;

// Scene and renderer
const scene = new THREE.Scene();
scene.background = new THREE.Color( 0xa0a0a0 );
scene.fog = new THREE.Fog( 0xa0a0a0, 10, 50 );
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setPixelRatio( window.devicePixelRatio );
// renderer.outputEncoding = THREE.sRGBEncoding;
renderer.shadowMap.enabled = true;
document.body.appendChild( renderer.domElement );

// Lights
const hemiLight = new THREE.HemisphereLight( 0xffffff, 0x444444 );
hemiLight.position.set( 0, 20, 0 );
scene.add( hemiLight );

const dirLight = new THREE.DirectionalLight( 0xffffff );
dirLight.position.set( 3, 10, 10 );
dirLight.castShadow = true;
dirLight.shadow.camera.top = 2;
dirLight.shadow.camera.bottom = - 2;
dirLight.shadow.camera.left = - 2;
dirLight.shadow.camera.right = 2;
dirLight.shadow.camera.near = 0.1;
dirLight.shadow.camera.far = 40;
scene.add( dirLight );

// Ground plane
// const mesh = new THREE.Mesh( new THREE.PlaneGeometry( 100, 100 ), new THREE.MeshPhongMaterial( { color: 0x999999, depthWrite: false } ) );
// mesh.rotation.x = - Math.PI / 2;
// mesh.receiveShadow = true;
// scene.add( mesh );
// const gridHelper = new THREE.GridHelper( 100, 100 );
// scene.add( gridHelper );

sun = new THREE.Vector3();

    // Water

    const waterGeometry = new THREE.PlaneGeometry( 10000, 10000 );

    water = new Water(
        waterGeometry,
        {
            textureWidth: 512,
            textureHeight: 512,
            waterNormals: new THREE.TextureLoader().load( 'watertest1.jpeg', function ( texture ) {

                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

            } ),
            sunDirection: new THREE.Vector3(),
            sunColor: 'YEllow',
            waterColor: '#09deed',
            distortionScale: 3.7,
            fog: scene.fog !== undefined
        }
    );


    water.rotation.x = - Math.PI / 2;

    scene.add( water );

    // Skybox

    const sky = new Sky();
    sky.scale.setScalar( 10000 );
    scene.add( sky );

    const skyUniforms = sky.material.uniforms;

    skyUniforms[ 'turbidity' ].value = 10;
    skyUniforms[ 'rayleigh' ].value = 2;
    skyUniforms[ 'mieCoefficient' ].value = 0.005;
    skyUniforms[ 'mieDirectionalG' ].value = 0.8;

    const parameters = {
        elevation: 10,
        azimuth: 180
    };

    const pmremGenerator = new THREE.PMREMGenerator( renderer );
    let renderTarget;

    function updateSun() {

        const phi = THREE.MathUtils.degToRad(90 - parameters.elevation );
        const theta = THREE.MathUtils.degToRad( parameters.azimuth );

        sun.setFromSphericalCoords( 1, phi, theta );

        sky.material.uniforms[ 'sunPosition' ].value.copy( sun );
        water.material.uniforms[ 'sunDirection' ].value.copy( sun ).normalize();

        if ( renderTarget !== undefined ) renderTarget.dispose();

        renderTarget = pmremGenerator.fromScene( sky );

        scene.environment = renderTarget.texture;

    }

    updateSun();

// Container for both camera and person
const container = new THREE.Group();
scene.add(container);

// Camera and controls
const xAxis = new THREE.Vector3(1, 0, 0);
const tempCameraVector = new THREE.Vector3();
const tempModelVector = new THREE.Vector3();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.01, 1000 );
camera.position.set( 0, 2, -7 );
const cameraOrigin = new THREE.Vector3(0, 1.5, 0);
camera.lookAt(cameraOrigin);
container.add(camera);

// Model and animation actions
let model, skeleton, mixer, clock, numAnimations = 0,
    movingForward = false, mousedown = false;

let movingLeft = false, movingRight = false, movingBackward = false;

// clock = new THREE.Clock();
// const allActions = [];
// const baseActions = {
//   idle: { weight: 1 },
//   walk: { weight: 0 },
//   run: { weight: 0 }
// };
// function setWeight( action, weight ) {
//   action.enabled = true;
//   action.setEffectiveTimeScale( 1 );
//   action.setEffectiveWeight( weight );
// }
// function activateAction( action ) {
//   const clip = action.getClip();
//   const settings = baseActions[ clip.name ];
//   setWeight( action, settings.weight );
//   action.play();
// }

const loader = new GLTFLoader();
loader.load( 'model/boat_embedded.gltf', function ( gltf ) {
  model = gltf.scene;
  container.add(model);
  model.traverse( function ( object ) { 
    if ( object.isMesh ) {
      object.castShadow = true;
    
    }   
  });


  


  
//   skeleton = new THREE.SkeletonHelper( model );
//   skeleton.visible = false;
//   container.add( skeleton );
//   const animations = gltf.animations;
//   mixer = new THREE.AnimationMixer( model );

//   // console.log(animations);
//   let a = animations.length;
//   for ( let i = 0; i < a; ++ i ) {
//     let clip = animations[ i ];
//     const name = clip.name;
//     if ( baseActions[ name ] ) {
//       const action = mixer.clipAction( clip );
//       activateAction( action );
//       baseActions[ name ].action = action;
//       allActions.push( action );
//       numAnimations += 1;
//     }
//   }
 });

// ... (existing code) ...

// Define variables for keyboard controls
// const keys = {
//     W: false,
//     S: false,
//     A: false,
//     D: false,
//   };
  
  // Keydown event listener
  // window.addEventListener('keydown', (event) => {
  //   const key = event.key.toUpperCase();
  //   if (keys[key] !== undefined) {
  //     keys[key] = true;
  //   }
  // });
  
  // // Keyup event listener
  // window.addEventListener('keyup', (event) => {
  //   const key = event.key.toUpperCase();
  //   if (keys[key] !== undefined) {
  //     keys[key] = false;
  //   }
  // });
  
  const  movementSpeed = 0.1; // Adjust the movement speed as needed
  
  
  // ... (existing code) ...
  



const animate = function () {
    // console.log(camera.position.x, camera.position.z);
    
        // console.log(true);
    



    
  requestAnimationFrame( animate );
  for ( let i = 0; i < numAnimations; i++ ) {
    const action = allActions[ i ];
    const clip = action.getClip();
    const settings = baseActions[clip.name];
    // settings.weight = action.getEffectiveWeight();
  }

  if(mixer) {
    const mixerUpdateDelta = clock.getDelta();
    mixer.update( mixerUpdateDelta );
  }
  
  if(movingForward) {
    // Get the X-Z plane in which camera is looking to move the player
    camera.getWorldDirection(tempCameraVector);
    const cameraDirection = tempCameraVector.setY(0).normalize();
    
    // // Get the X-Z plane in which player is looking to compare with camera
    model.getWorldDirection(tempModelVector);
    const playerDirection = tempModelVector.setY(0).normalize();

    // // Get the angle to x-axis. z component is used to compare if the angle is clockwise or anticlockwise since angleTo returns a positive value
    const cameraAngle = cameraDirection.angleTo(xAxis) * (cameraDirection.z > 0 ? 1 : -1);
    const playerAngle = playerDirection.angleTo(xAxis) * (playerDirection.z > 0 ? 1 : -1);
    
    // // Get the angle to rotate the player to face the camera. Clockwise positive
    const angleToRotate = playerAngle - cameraAngle;
    
    // // Get the shortest angle from clockwise angle to ensure the player always rotates the shortest angle
    let sanitisedAngle = angleToRotate;
    
    if(angleToRotate > Math.PI) {
      sanitisedAngle = angleToRotate - 2 * Math.PI
    }
    if(angleToRotate < -Math.PI) {
      sanitisedAngle = angleToRotate + 2 * Math.PI
    }
    
    // Rotate the model by a tiny value towards the camera direction
    model.rotateY(
      Math.max(-0.05, Math.min(sanitisedAngle, 0.05))
    );
    
    // #B29164


    container.position.add(cameraDirection.multiplyScalar(1.5));
    camera.lookAt(container.position.clone().add(cameraOrigin));
    // console.log("Model Position on W pressed ", model.position);
    // console.log("Camera Position on W pressed ", camera.position);
  }
  else if (movingLeft){

    container.rotateY(0.02);


  }
  else if (movingRight){

    container.rotateY(-0.02);

  }
  else if (movingBackward){
    camera.getWorldDirection(tempCameraVector);
    const cameraDirection = tempCameraVector.setY(0).normalize();
    
    // // Get the X-Z plane in which player is looking to compare with camera
    model.getWorldDirection(tempModelVector);
    const playerDirection = tempModelVector.setY(0).normalize();

    // // Get the angle to x-axis. z component is used to compare if the angle is clockwise or anticlockwise since angleTo returns a positive value
    const cameraAngle = cameraDirection.angleTo(xAxis) * (cameraDirection.z > 0 ? 1 : -1);
    const playerAngle = playerDirection.angleTo(xAxis) * (playerDirection.z > 0 ? 1 : -1);
    
    // // Get the angle to rotate the player to face the camera. Clockwise positive
    const angleToRotate = playerAngle - cameraAngle;
    
    // // Get the shortest angle from clockwise angle to ensure the player always rotates the shortest angle
    let sanitisedAngle = angleToRotate;
    
    if(angleToRotate > Math.PI) {
      sanitisedAngle = angleToRotate - 2 * Math.PI
    }
    if(angleToRotate < -Math.PI) {
      sanitisedAngle = angleToRotate + 2 * Math.PI
    }
    
    // Rotate the model by a tiny value towards the camera direction
    model.rotateY(
      Math.max(-0.05, Math.min(sanitisedAngle, 0.05))
    );
    
    // #B29164


    container.position.add(cameraDirection.multiplyScalar(-1.5));
    camera.lookAt(container.position.clone().add(cameraOrigin));
    // console.log("Model Position on W pressed ", model.position);
    // console.log("Camera Position on W pressed ", camera.position);
  }


  
  water.material.uniforms[ 'time' ].value += 2.0 / 60.0;
  renderer.render( scene, camera );
};

animate();

// Key and mouse events
window.addEventListener("keydown", (e) => {
  const { event } = e;
  if(e.code === 'KeyW') {
    // baseActions.idle.weight = 0;
    // baseActions.run.weight = 5;   
    // activateAction(baseActions.run.action);
    // activateAction(baseActions.idle.action);
    
    movingForward = true;
  }
  else if (e.code === 'KeyA'){
    // baseActions.idle.weight = 0;
    // baseActions.run.weight = 5;   
    // activateAction(baseActions.run.action);
    // activateAction(baseActions.idle.action);
    movingLeft = true;
  }
  else if (e.code === 'KeyD'){
    // baseActions.idle.weight = 0;
    // baseActions.run.weight = 5;   
    // activateAction(baseActions.run.action);
    // activateAction(baseActions.idle.action);
    movingRight = true;

  }
  else if (e.code === 'KeyS'){
    // baseActions.idle.weight = 0;
    // baseActions.run.weight = 1;   
    // activateAction(baseActions.run.action);
    // activateAction(baseActions.idle.action);
    movingBackward = true;
  }
});

window.addEventListener("keyup", (e) => {
  const { event } = e;
  if(e.code === 'KeyW') {
    // baseActions.idle.weight = 1;
    // baseActions.run.weight = 0;
    // activateAction(baseActions.run.action);
    // activateAction(baseActions.idle.action);
    movingForward = false;
  }
  else if (e.code === 'KeyA'){
    // baseActions.idle.weight = 1;
    // baseActions.run.weight = 0;
    // activateAction(baseActions.run.action);
    // activateAction(baseActions.idle.action);
    movingLeft = false;
  }
  else if (e.code === 'KeyD'){
    // baseActions.idle.weight = 1;
    // baseActions.run.weight = 0;
    // activateAction(baseActions.run.action);
    // activateAction(baseActions.idle.action);
    movingRight = false;
  }
  else if (e.code === 'KeyS'){
    // baseActions.idle.weight = 1;
    // baseActions.run.weight = 0;
    // activateAction(baseActions.run.action);
    // activateAction(baseActions.idle.action);
    movingBackward = false;

  }
});

window.addEventListener("pointerdown", (e) => {
  mousedown = true;
});

window.addEventListener("pointerup", (e) => {
  mousedown = false;
});

window.addEventListener("pointermove", (e) => {
  if(mousedown) {
    const { movementX, movementY } = e;
    const offset = new THREE.Spherical().setFromVector3(
      camera.position.clone().sub(cameraOrigin)
    );
    const phi = offset.phi - movementY * 0.02;
    offset.theta -= movementX * 0.02;
    offset.phi = Math.max(0.01, Math.min(0.35 * Math.PI, phi));
    camera.position.copy(
      cameraOrigin.clone().add(new THREE.Vector3().setFromSpherical(offset))
    );
    camera.lookAt(container.position.clone().add(cameraOrigin));
  }
});