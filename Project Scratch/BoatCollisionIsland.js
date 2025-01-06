import * as THREE from "./mrdoob-three.js/build/three.module.js";
import { GLTFLoader } from './mrdoob-three.js/build/GLTFLoader.js';
import { Water } from './mrdoob-three.js/build/Water.js';
import { Sky } from './mrdoob-three.js/build/Sky.js';
import * as CANNON from './cannon-es-debugger-master/dist/cannon-es.js';
import CannonDebugger from './cannon-es-debugger-master/dist/cannon-es-debugger.js';



export let  water, sun;
let mousedown = false;
let timeout = 2000;



const world = new CANNON.World({
    gravity: new CANNON.Vec3(0, -9.81, 0)
});


// Scene and renderer
export const scene = new THREE.Scene();
scene.background = new THREE.Color( 0xa0a0a0 );
scene.fog = new THREE.Fog( 0xa0a0a0, 10, 50 );
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setPixelRatio( window.devicePixelRatio );
// renderer.outputEncoding = THREE.sRGBEncoding;
renderer.shadowMap.enabled = true;
document.body.appendChild( renderer.domElement );

// Lights




export const container = new THREE.Group();
scene.add(container);

// Camera and controls
export const xAxis = new THREE.Vector3(1, 0, 0);
export const tempCameraVector = new THREE.Vector3();
export const tempModelVector = new THREE.Vector3();
const tempCameraVector2 = new THREE.Vector3();
export const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.01, 1000 );
camera.position.set( 0, 2, -7 );
export const cameraOrigin = new THREE.Vector3(0, 1.5, 0);
camera.lookAt(cameraOrigin);




container.add(camera);


sun = new THREE.Vector3();

    // Water

    const waterGeometry = new THREE.PlaneGeometry( 10000, 10000 );

    water = new Water(
        waterGeometry,
        {
            textureWidth: 512,
            textureHeight: 512,
            waterNormals: new THREE.TextureLoader().load( './waternormals.jpg', function ( texture ) {

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

        sun.setFromSphericalCoords( 2, phi, theta );

        sky.material.uniforms[ 'sunPosition' ].value.copy( sun );
        water.material.uniforms[ 'sunDirection' ].value.copy( sun ).normalize();

        if ( renderTarget !== undefined ) renderTarget.dispose();

        renderTarget = pmremGenerator.fromScene( sky );

        scene.environment = renderTarget.texture;

    }

    updateSun();
    let island;
    const islandLoader = new GLTFLoader();
    islandLoader.load('./assets/new_island.glb', function(glb){
      island = glb.scene;
      island.scale.set(0.35,0.5,0.35);
      island.position.z = 465;
      island.position.y = 2;
      scene.add(island);
    
    
    });

    const islandPhysMat = new CANNON.Material();

    const islandBody = new CANNON.Body({
        mass: 0,
        shape: new CANNON.Box(new CANNON.Vec3(250,15,190)),
        position: new CANNON.Vec3(0, 2,465),
        material: islandPhysMat
    });
    world.addBody(islandBody);    



    let boatMixer;
    let model;
    const loader = new GLTFLoader();
    loader.load( './assets/animatedBoat.glb', function ( glb ) {
      model = glb.scene;
      
      model.position.y = -0.3;
      const clips = glb.animations;
      boatMixer = new THREE.AnimationMixer(model);
      const clip = THREE.AnimationClip.findByName(clips,'boatAction');
      const action = boatMixer.clipAction(clip);
      action.play();
      model.traverse( function ( object ) { 
        if ( object.isMesh ) {
          object.castShadow = true;
          
        }   
      });
      container.add(model);
     });
     const BoatPhysMat = new CANNON.Material();
    

     const boatBody = new CANNON.Body({
         mass: 1,
         shape: new CANNON.Box(new CANNON.Vec3(2,2,4)),
         position: new CANNON.Vec3(container.position.x, container.position.y, container.position.z),
         material: BoatPhysMat,
         
       
         
     });
    //boatBody.negate.set(0,0,0);
     world.addBody(boatBody);

    //  const hemiLight = new THREE.HemisphereLight( 0xffffff, 0x4444 );
    //  hemiLight.position.set( 0, 20, -4 );
    //  scene.add( hemiLight );
     
    //  const dirLight = new THREE.DirectionalLight( 0xffffff );
    //  dirLight.position.set( 0, 10, -4 );
    //  dirLight.castShadow = true;
    //  dirLight.shadow.camera.top = 2;
    //  dirLight.shadow.camera.bottom = - 2;
    //  dirLight.shadow.camera.left = - 2;
    //  dirLight.shadow.camera.right = 2;
    //  dirLight.shadow.camera.near = 0.1;
    //  dirLight.shadow.camera.far = 40;
    //  scene.add( dirLight );
    
    
     let c_model;
     let character_mixer;
     const characterLoader = new GLTFLoader();
     characterLoader.load('./assets/animatingCharacter.glb', function (glb){
       c_model = glb.scene;
       c_model.scale.set(0.2,0.2,0.2);
       c_model.rotateY(0.1);
       c_model.position.y = -0.1;
       const charcterClips = glb.animations;
       character_mixer = new THREE.AnimationMixer(c_model);
       const c_clip = THREE.AnimationClip.findByName(charcterClips, 'boatIdle');
       const c_action = character_mixer.clipAction(c_clip);
       c_action.play();
       console.log(charcterClips);
    
       container.add(c_model);
     });

     

let movingForward, movingBackward, movingLeft, movingRight;





const groundMesh = water;
scene.add(groundMesh);



const groundPhysMat = new CANNON.Material();

const groundBody = new CANNON.Body({
    shape: new CANNON.Plane(),
    //mass: 10
    // shape: new CANNON.Box(new CANNON.Vec3(15, 15, 0.1)),
    mass : 0,
    material: groundPhysMat
});
world.addBody(groundBody);
groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);

const groundBoatContactMat = new CANNON.ContactMaterial(
    groundPhysMat,
    BoatPhysMat,
    // {friction: 0.05}
);

world.addContactMaterial(groundBoatContactMat);


const groundIslandContactMat = new CANNON.ContactMaterial(
    groundPhysMat,
    islandPhysMat,
    {restitution: 0.9}
);

world.addContactMaterial(groundIslandContactMat);

const timeStep = 1 / 60;

var status;
var waterHeight = 4;
let i=0;
var collision_flag = 0,new_island=0;




function load() {
  const loaderElement = document.createElement('div');
  loaderElement.className = 'loader';
  loaderElement.innerHTML = '<span class="loading-text">Loading...</span>';
  document.body.appendChild(loaderElement);
  
  const styleString = `
  body {
    margin: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
    background-color: #282c34;
    color: Black;
    font-family: 'Arial', sans-serif;
    background-image: url("home page1.jpg");
     background-repeat: no-repeat;
    background-size: 1550px 870px;
  }
  .loader{
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh; 
    background-color: #eee;
    opacity: 0.7;
    display: flex;
    justify-content: center; 
    align-items: center;
    z-index: 999;} 

  .loading-text { font-size: 24px;
    font-weight: bold;
    color: white;
    display :flex;
    align-items : center; } `;
  
  const styleElement = document.createElement('style');
  styleElement.appendChild(document.createTextNode(styleString));
  document.head.appendChild(styleElement);

  // $('body').append('<div class="loader"><span class="loading-text">Loading...</span></div>');
  // $('head').append("<style>.loader{position: fixed;top: 0;left: 0; width: 100vw;height: 100vh; background-color: #eee; opacity: 0.7; display: flex; justify-content: center; align-items: center; z-index: 999;} .loading-text { font-size: 24px; font-weight: bold; color: #333; display :flex; align-items : center; } </style>");
  new_island= 1;
  if(collision_flag){
    const positions = {
      x : container.position.x,
      y : container.position.y,
      z : container.position.z
    };

    const camera_position = {
      cam_x : camera.position.x,
      cam_y : camera.position.y,
      cam_z : camera.position.z+5,
    }
    
    const container_rotation = {
      rotate_x : container.rotation.x,
      rotate_y : container.rotation.y,
      rotate_z : container.rotation.z
    };

    const island_pos ={
      island_x : island.position.x,
      island_y : island.position.y,
      island_z : island.position.z
    }

    sessionStorage.setItem('container', JSON.stringify(positions));
    sessionStorage.setItem('camera', JSON.stringify(camera_position));
    sessionStorage.setItem('container_rotationY', JSON.stringify(container_rotation));
    sessionStorage.setItem('island', JSON.stringify(island_pos));
    window.location.href="./SplashScreen.html";
  }
}

function checkCollisions() {
    // Check collisions between box and sphere
    var contacts = world.contacts;
    // boatBody.applyEngineForce(1000,2);
    // console.log(contacts);
    for (var i = 0; i < contacts.length; i++) {
        var contact = contacts[i];
        if (
            (contact.bi === boatBody && contact.bj === islandBody) ||
            (contact.bi === islandBody && contact.bj === boatBody)
        ) {
            //console.log('collision detected...');
            collision_flag = 1;
            
            // var collisionDirection = new CANNON.Vec3();
            // contact.ni.negate(collisionDirection);

            // // Set the velocity of the boxBody to zero in the collision direction
            // // boatBody.velocity.vsub(boatBody.velocity, collisionDirection.scale(boatBody.velocity.dot(collisionDirection)));        
            // boatBody.velocity.set(0,0,0);
            boatBody.velocity.set(0, 0, 0);

            // Move the boat slightly away from the island based on collision normal
            const collisionNormal = contact.ni.clone();
            const separationDistance = 0.1; // Adjust this value as needed
            boatBody.position.vadd(collisionNormal.scale(separationDistance), boatBody.position);
            movingForward = false;
            movingBackward = false;
            movingLeft = false;
            movingRight = false;
            load();
            break;
          }
          
    }
   
}

const cannonDebugger = new CannonDebugger(scene, world);


let force;
let clock = new THREE.Clock();
function animate() {

    world.step(timeStep);
    cannonDebugger.update();
    const clockDelta = clock.getDelta();
    boatBody.position.y = 0.4;
   
    // boatBody.velocity.set(0,0,10)  ;
    if (boatMixer){
        boatMixer.update(clockDelta);
    }
   
    if(movingForward) {
        
        // Get the X-Z plane in which camera is looking to move the player
        camera.getWorldDirection(tempCameraVector);
        const cameraDirection = tempCameraVector.setY(0).normalize();
        
        // // Get the X-Z plane in which player is looking to compare with camera
        model.getWorldDirection(tempModelVector);
        c_model.getWorldDirection(tempCameraVector2);
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
        c_model.rotateY(
          Math.max(-0.05, Math.min(sanitisedAngle, 0.05))  
        
      )
        sessionStorage.setItem('model_rotate_w', model.rotation.y);
        // #B29164
        
        const localForward = new THREE.Vector3(0, 0, 1).applyQuaternion(container.quaternion);

    // Scale the local forward vector to determine the force magnitude
    

        
        container.position.add(cameraDirection.multiplyScalar(0.5));        
        camera.lookAt(container.position.clone().add(cameraOrigin));
        // boatBody.applyForce(container);
        boatBody.position.x = container.position.x;
        boatBody.position.y = container.position.y;
        boatBody.position.z = container.position.z;
      }
      else if (movingLeft){
    
        container.rotateY(0.02);
        boatBody.quaternion.copy(container.quaternion);
        sessionStorage.setItem('rotateY', '0.02');
        
    
      }
      else if (movingRight){
    
        container.rotateY(-0.02);
        boatBody.quaternion.copy(container.quaternion);
        sessionStorage.setItem('rotateYNeg', '-0.02');
        
      }
      else if (movingBackward){
        camera.getWorldDirection(tempCameraVector);
        const cameraDirection = tempCameraVector.setY(0).normalize();
        
        // // Get the X-Z plane in which player is looking to compare with camera
        model.getWorldDirection(tempModelVector);
        c_model.getWorldDirection(tempCameraVector2);
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
        c_model.rotateY(
          Math.max(-0.05, Math.min(sanitisedAngle, 0.05))  
        )
        sessionStorage.setItem('model_rotate_w', model.rotation.y);
    
        container.position.add(cameraDirection.multiplyScalar(-0.5));
        camera.lookAt(container.position.clone().add(cameraOrigin));
        boatBody.position.x = container.position.x;
        boatBody.position.y = container.position.y;
        boatBody.position.z = container.position.z;
        
      }
    

    groundMesh.position.copy(groundBody.position);
    groundMesh.quaternion.copy(groundBody.quaternion);
    if (island){
        island.position.copy(islandBody.position);
        island.quaternion.copy(islandBody.quaternion);

    }
    if (container){
        
        container.position.copy(boatBody.position);
        container.quaternion.copy(boatBody.quaternion);
    }
    checkCollisions();
    water.material.uniforms[ 'time' ].value += 0.5 / 60.0;
    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);







window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});


window.addEventListener("keydown", (e) => {
  


    const { event } = e;
    if(e.code === 'KeyW') {
         
      movingForward = true;
      
    }
    else if (e.code === 'KeyA'){
      
      movingLeft = true;
    }
    else if (e.code === 'KeyD'){
      
      movingRight = true;
  
    }
    else if (e.code === 'KeyS'){
      
      movingBackward = true;
    }
  
  
  
  });
  
  
  
  
  window.addEventListener("keyup", (e) => {
    const { event } = e;
    if(e.code === 'KeyW') {
     
      movingForward = false;
    }
    else if (e.code === 'KeyA'){
     
      movingLeft = false;
    }
    else if (e.code === 'KeyD'){
     
      movingRight = false;
    }
    else if (e.code === 'KeyS'){
     
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
  
      const phi = offset.phi - movementY * 0.04;
      offset.theta -= movementX * 0.05;
      offset.phi = Math.max(0.05, Math.min(0.55 * Math.PI, phi));
      camera.position.copy(
        cameraOrigin.clone().add(new THREE.Vector3().setFromSpherical(offset))
      );
      camera.lookAt(container.position.clone().add(cameraOrigin));
    }
  });