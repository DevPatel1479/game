import * as THREE from "./mrdoob-three.js/build/three.module.js";
import { GLTFLoader } from './mrdoob-three.js/build/GLTFLoader.js';
import { Water } from './mrdoob-three.js/build/Water.js';
import { Sky } from './mrdoob-three.js/build/Sky.js';
import * as SkeletonUtils from "./mrdoob-three.js/build/SkeletonUtils.js";
import * as CANNON from './cannon-es-debugger-master/dist/cannon-es.js';
import CannonDebugger from './cannon-es-debugger-master/dist/cannon-es-debugger.js';

export let water, sun;
let timeout = 2000;

// const world = new CANNON.World({
//     gravity: new CANNON.Vec3(0, -9.81, 0)
// });

// Scene and renderer
const scene = new THREE.Scene();
scene.background = new THREE.Color( 0xa0a0a0 );
scene.fog = new THREE.Fog( 0xa0a0a0, 10, 50 );
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setPixelRatio( window.devicePixelRatio );
renderer.outputEncoding = THREE.sRGBEncoding;
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

// Sun,Water and Boat

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

    let grass_z_position = 273,grass_x_position = -193;

    const Stoneloader = new GLTFLoader();
    // const array_grass_stone = [];
    Stoneloader.load('./assets/rock1.glb', function (glb){
        const stonemodel = glb.scene;
        stonemodel.scale.set(4, 4, 4);
        stonemodel.position.set(10,4,275);
        // console.log(stonemodel.children[0]);
        for (let i = 0; i < 200; i++) {
          let j = parseInt(Math.random() * 6);
          // console.log(j)
            const clonedModel = SkeletonUtils.clone(stonemodel.children[j]);
            // Set a unique name for each cloned grass model
            clonedModel.name = "Grass ".concat(String(i+1));
            clonedModel.scale.set(0.15,0.15,0.15);
            clonedModel.position.y = 3.8;
            clonedModel.position.z = grass_z_position + Math.random()*300;
            clonedModel.position.x = grass_x_position + Math.random()*300;
            scene.add(clonedModel);
        }
        
        for (let i = 200; i < 400; i++) {
          let j = parseInt(Math.random() * 6);
          // console.log(j)
            const clonedModel = SkeletonUtils.clone(stonemodel.children[j]);
            // Set a unique name for each cloned grass model
            clonedModel.name = "Grass ".concat(String(i+1));
            clonedModel.scale.set(0.15,0.15,0.15);
            clonedModel.position.y = 3.8;
            clonedModel.position.z = (271) + Math.random()*300;
            clonedModel.position.x = (193) - Math.random()*300;
            scene.add(clonedModel);
        }
        
        for (let i = 400; i < 600; i++) {
          let j = parseInt(Math.random() * 6);
          // console.log(j)
            const clonedModel = SkeletonUtils.clone(stonemodel.children[j]);
            // Set a unique name for each cloned grass model
            clonedModel.name = "Grass ".concat(String(i+1));
            clonedModel.scale.set(0.15,0.15,0.15);
            clonedModel.position.y = 3.8;
            clonedModel.position.z = (560) + Math.random()*100;
            clonedModel.position.x = (193) - Math.random()*380;
            scene.add(clonedModel);
        }
    });

    const Grassloader = new GLTFLoader();
    // const array_grass = [];
    Grassloader.load('./assets/grass.glb', function (glb){
        const grassmodel = glb.scene;
        grassmodel.scale.set(4, 4, 4);
        grassmodel.position.set(10,4,275);
        // console.log(grassmodel.children[0]);
        for (let i = 0; i < 100; i++) {
          let j = parseInt(Math.random() * 6);
          // console.log(j)
            const clonedModel = SkeletonUtils.clone(grassmodel.children[j]);
            // Set a unique name for each cloned grass model
            clonedModel.name = "Grass ".concat(String(i+1));
            clonedModel.scale.set(0.1,0.1,0.1);
            clonedModel.position.y = 4;
            clonedModel.position.z = grass_z_position + Math.random()*300;
            clonedModel.position.x = grass_x_position + Math.random()*300;
            scene.add(clonedModel);
        }
        
        for (let i = 200; i < 400; i++) {
          let j = parseInt(Math.random() * 6);
          // console.log(j)
            const clonedModel = SkeletonUtils.clone(grassmodel.children[j]);
            // Set a unique name for each cloned grass model
            clonedModel.name = "Grass ".concat(String(i+1));
            clonedModel.scale.set(0.1,0.1,0.1);
            clonedModel.position.y = 3.8;
            clonedModel.position.z = (271) + Math.random()*300;
            clonedModel.position.x = (193) - Math.random()*300;
            scene.add(clonedModel);
        }

        for (let i = 400; i < 600; i++) {
          let j = parseInt(Math.random() * 6);
          // console.log(j)
            const clonedModel = SkeletonUtils.clone(grassmodel.children[j]);
            // Set a unique name for each cloned grass model
            clonedModel.name = "Grass ".concat(String(i+1));
            clonedModel.scale.set(0.15,0.15,0.15);
            clonedModel.position.y = 3.8;
            clonedModel.position.z = (560) + Math.random()*100;
            clonedModel.position.x = (193) - Math.random()*380;
            scene.add(clonedModel);
        }
    });
    
    // const Rocksloader = new GLTFLoader();
    // const array_rocks = [];
    // Rocksloader.load('./assets/rock1.glb',function(glb){
    //   const rockmodel = glb.scene;
      
    // });
  //   let tree_z_position = 275;
  //   let tree_x_position = 10;

    const Treeloader = new GLTFLoader();
    const array = [];
    Treeloader.load('./assets/trees1 (1).glb', function (glb){
        const treemodel = glb.scene;
        // treemodel.scale.set(4, 4, 4);
        // treemodel.position.set(10,6,275);
        
        for (let i = 0; i < 100; i++) {
          let j = parseInt(Math.random()*20);
          const clonedModel = SkeletonUtils.clone(treemodel.children[j]);
          // console.log(clonedModel);
          // Set a unique name for each cloned tree model
          clonedModel.scale.set(0.8,1,0.8);
          clonedModel.name = "Tree ".concat(String(i+1));
          clonedModel.position.y = 5;
          clonedModel.position.z = grass_z_position + (Math.random()*350);
          clonedModel.position.x = grass_x_position + (Math.random()*300);
          scene.add(clonedModel);
        }

        for (let i = 100; i < 200; i++) {
          let j = parseInt(Math.random() * 6);
          // console.log(j)
            const clonedModel = SkeletonUtils.clone(treemodel.children[j]);
            // Set a unique name for each cloned tree model
            clonedModel.name = "Grass ".concat(String(i+1));
            clonedModel.scale.set(0.8,1,0.8);
            clonedModel.position.y = 5;
            clonedModel.position.z = (271) + Math.random()*300;
            clonedModel.position.x = (193) - Math.random()*300;
            scene.add(clonedModel);
        }

        for (let i = 200; i < 300; i++) {
          let j = parseInt(Math.random() * 6);
          // console.log(j)
            const clonedModel = SkeletonUtils.clone(treemodel.children[j]);
            // Set a unique name for each cloned tree model
            clonedModel.name = "Grass ".concat(String(i+1));
            clonedModel.scale.set(0.8,1,0.8);
            clonedModel.position.y = 5;
            clonedModel.position.z = (560) + Math.random()*100;
            clonedModel.position.x = (193) - Math.random()*380;
            scene.add(clonedModel);
        }
  });

  const Treeloader2 = new GLTFLoader();
  Treeloader2.load('./assets/trees2 (1).glb', function (glb){
      const treemodel = glb.scene;
      // treemodel.scale.set(4, 4, 4);
      // treemodel.position.set(10,6,275);
      for (let i = 200; i < 300; i++) {
        let j = parseInt(Math.random()*20);
        const clonedModel = SkeletonUtils.clone(treemodel.children[j]);
        // console.log(clonedModel);
        // Set a unique name for each cloned tree model
        clonedModel.scale.set(0.8,1,0.8);
        clonedModel.name = "Tree ".concat(String(i+1));
        clonedModel.position.y = 5;
        clonedModel.position.z = grass_z_position + (Math.random()*350);
        clonedModel.position.x = grass_x_position + (Math.random()*300);
        scene.add(clonedModel);
      }

      for (let i = 300; i < 400; i++) {
        let j = parseInt(Math.random()*20);
        const clonedModel = SkeletonUtils.clone(treemodel.children[j]);
        // console.log(clonedModel);
        // Set a unique name for each cloned tree model
        clonedModel.scale.set(0.8,1,0.8);
        clonedModel.name = "Tree ".concat(String(i+1));
        clonedModel.position.y = 5;
        clonedModel.position.z = (271) + (Math.random()*350);
        clonedModel.position.x = (193) - (Math.random()*300);
        scene.add(clonedModel);
     }

     for (let i = 400; i < 600; i++) {
      let j = parseInt(Math.random()*20);
      const clonedModel = SkeletonUtils.clone(treemodel.children[j]);
      // console.log(clonedModel);
      // Set a unique name for each cloned tree model
      clonedModel.scale.set(0.8,1,0.8);
      clonedModel.name = "Tree ".concat(String(i+1));
      clonedModel.position.y = 5;
      clonedModel.position.z = (560) + Math.random()*100;
      clonedModel.position.x = (193) - Math.random()*380;
      scene.add(clonedModel);
      
     }
  });

  const Chestloader = new GLTFLoader();
  Chestloader.load('./assets/chest.glb',function(glb){
    let chestmodel = glb.scene;
    chestmodel.name = "ChestModel";
    chestmodel.scale.set(0.5,0.5,0.5);
    chestmodel.position.set(-193,5,465);
    scene.add(chestmodel);
    console.log(chestmodel);

  });
  // const pointLight = new THREE.PointLight(0xffffff, 50);
  // pointLight.position.set(-193, 4, 470);
  // scene.add(pointLight);
  // const directionalLight = new THREE.DirectionalLight(0xffffff, 500);
  // directionalLight.position.set(-193, 4, 470);
  // scene.add(directionalLight);
    // const Cloudloader = new GLTFLoader();
  // Cloudloader.load('./assets/cloud1.glb', function (glb){
  //     const cloudmodel = glb.scene;
  //     // treemodel.scale.set(4, 4, 4);
  //     // treemodel.position.set(10,6,275);
  //     for (let i = 0; i < 100; i++) {
  //       let j = parseInt(Math.random()*8);
  //       const clonedModel = SkeletonUtils.clone(cloudmodel.children[j]);
  //       console.log(clonedModel);
  //       // Set a unique name for each cloned tree model
  //       clonedModel.scale.set(Math.random()*2,Math.random()*2,Math.random()*2);
  //       clonedModel.name = "Cloud ".concat(String(i+1));
  //       clonedModel.position.y = 9;
  //       clonedModel.position.z = grass_z_position + (Math.random()*10);
  //       clonedModel.position.x = grass_x_position + (Math.random()*10300);
  //       scene.add(clonedModel);
  //   }
  // });

    let boatMixer;
    const Boatloader = new GLTFLoader();
    Boatloader.load( './assets/animatedBoat.glb', function ( glb ) {
      model = glb.scene;
      
      const clips = glb.animations;
      boatMixer = new THREE.AnimationMixer(model);
      const clip = THREE.AnimationClip.findByName(clips,'boatAction');
      const action = boatMixer.clipAction(clip);
      action.play();
      model.traverse( function ( object ) { 
        if ( object.isMesh ) {
          object.castShadow = true;
        }
        const obj = JSON.parse(sessionStorage.getItem('container'));
        model.position.set(obj.x,obj.y,obj.z-5);
        scene.add(model);
      });
      // container.add(model);
     });


// Ground plane
const islandLoader = new GLTFLoader();
    islandLoader.load('./assets/new_island.glb', function(glb){
      island = glb.scene;
      island.scale.set(0.35,0.5,0.35);
      island.position.set(0,2,465);
      scene.add(island);
  });
  
// Container for both camera and person
const container = new THREE.Group();
scene.add(container);

// Camera and controls
const xAxis = new THREE.Vector3(1, 0, 0);
const tempCameraVector = new THREE.Vector3();
const tempModelVector = new THREE.Vector3();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.01, 1000 );
camera.position.set( 0, 2, -2 );
const cameraOrigin = new THREE.Vector3(0, 1.5, 0);
camera.lookAt(cameraOrigin);
container.add(camera);

// Model and animation actions
let model, skeleton, mixer, clock, numAnimations = 0,island,
    movingForward = false, mousedown = false;

let movingLeft = false, movingRight = false, movingBackward = false;

clock = new THREE.Clock();
const allActions = [];
const baseActions = {
  idle: { weight: 0 },
  Run: { weight: 0 },
  Run: { weight: 0 }
};
function setWeight( action, weight ) {
  action.enabled = true;
  action.setEffectiveTimeScale( 1 );
  action.setEffectiveWeight( weight );
}
function activateAction( action ) {
  const clip = action.getClip();
  const settings = baseActions[ clip.name ];
  setWeight( action, settings.weight );
  action.play();
}

const loader = new GLTFLoader();
loader.load( './assets/animatingCharacter.glb', function ( glb ) {
  model = glb.scene;
  model.scale.set(0.1,0.1,0.1);
  container.add(model);
  model.traverse(function(object){
  // const obj = JSON.parse(sessionStorage.getItem('container'));
    if ( object.isMesh ) {
      object.castShadow = true;
    }
    
  //   if(obj.x > 194  & obj.x < -194 & obj.z < 269 ){
  //     // container.position.set(obj.x,obj.y+3,obj.z+5);
  //     // container.rotateY(4);
  //   }
  //   else if(obj.x < -196 & obj.z > 268 & obj.z < 658){
  //     container.position.set(obj.x+3,obj.y+3,obj.z-5);
  //     // container.rotateY(4);
  //   }
    
  //   else if( obj.x < 195 & obj.z > 268 & obj.z < 658){
  //     container.position.set(obj.x-4,obj.y+3,obj.z);
  //     // container.rotateY(4);
  //   }
  //   else if(obj.x > 194  & obj.x < -194 & obj.z > 665){
  //     container.position.set(obj.x,obj.y-3,obj.z-2);
  //     // container.rotateY(4);
  //   }
    
  });
  
  
  skeleton = new THREE.SkeletonHelper( model );
  skeleton.visible = false;
  container.add( skeleton );
  container.position.set(-193,3.4,465);
  container.rotateY(1.95);
  const animations = glb.animations;
  mixer = new THREE.AnimationMixer( model );
  
  // console.log(animations);
  let a = animations.length;
  for ( let i = 0; i < a; ++ i ) {
    let clip = animations[ i ];
    const name = clip.name;
    console.log(name)
    if ( baseActions[ name ] ) {
      const action = mixer.clipAction( clip );
      activateAction( action );
      baseActions[ name ].action = action;
      allActions.push( action );
      numAnimations += 1;
    }
  }
});

// ... (existing code) ...

// Define variables for keyboard controls
const keys = {
    W: false,
    S: false,
    A: false,
    D: false,
  };
  
  // Keydown event listener
  window.addEventListener('keydown', (event) => {
    const key = event.key.toUpperCase();
    if (keys[key] !== undefined) {
      keys[key] = true;
    }
  });
  
  // Keyup event listener
  window.addEventListener('keyup', (event) => {
    const key = event.key.toUpperCase();
    if (keys[key] !== undefined) {
      keys[key] = false;
    }
  });
  
  const  movementSpeed = 0.1; // Adjust the movement speed as needed
  

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
    
    // Get the X-Z plane in which player is looking to compare with camera
    model.getWorldDirection(tempModelVector);
    const playerDirection = tempModelVector.setY(0).normalize();

    // Get the angle to x-axis. z component is used to compare if the angle is clockwise or anticlockwise since angleTo returns a positive value
    const cameraAngle = cameraDirection.angleTo(xAxis) * (cameraDirection.z > 0 ? 1 : -1);
    const playerAngle = playerDirection.angleTo(xAxis) * (playerDirection.z > 0 ? 1 : -1);
    
    // Get the angle to rotate the player to face the camera. Clockwise positive
    const angleToRotate = playerAngle - cameraAngle;
    
    // Get the shortest angle from clockwise angle to ensure the player always rotates the shortest angle
    let sanitisedAngle = angleToRotate;
    
    if(angleToRotate > Math.PI) {
      sanitisedAngle = angleToRotate - 2 * Math.PI
    }
    if(angleToRotate < -Math.PI) {
      sanitisedAngle = angleToRotate + 2 * Math.PI
    }
    
    // Rotate the model by a tiny value towards the camera direction
    model.rotateY(
      Math.max(-0.05, Math.min(sanitisedAngle, 1))
    );
    container.position.add(cameraDirection.multiplyScalar(1));
    camera.lookAt(container.position.clone().add(cameraOrigin));
    
  }
  else if (movingLeft){

    container.rotateY(0.02);


  }
  else if (movingRight){

    container.rotateY(-0.02);

  }
  else if (movingBackward){
    let movementSpeed = 0.01;
    container.translateZ(-movementSpeed);

  }
  water.material.uniforms[ 'time' ].value += 0.5 / 60.0;
  renderer.render( scene, camera );
  // console.log(container.position);
};

animate();

// Key and mouse events
window.addEventListener("keydown", (e) => {
  const { event } = e;
  if(e.code === 'KeyW') {
    // baseActions.idle.weight = 0;
    baseActions.Run.weight = 5;   
    activateAction(baseActions.Run.action);
    // activateAction(baseActions.idle.action);
    movingForward = true;
  }
  else if (e.code === 'KeyA'){
    // baseActions.idle.weight = 0;
    baseActions.Run.weight = 5;   
    activateAction(baseActions.Run.action);
    // activateAction(baseActions.idle.action);
    movingLeft = true;
  }
  else if (e.code === 'KeyD'){
    // baseActions.idle.weight = 0;
    baseActions.Run.weight = 5;   
    activateAction(baseActions.Run.action);
    // activateAction(baseActions.idle.action);
    movingRight = true;

  }
  else if (e.code === 'KeyS'){
    // baseActions.idle.weight = 0;
    baseActions.Run.weight = 1;   
    activateAction(baseActions.Run.action);
    // activateAction(baseActions.idle.action);
    movingBackward = true;
  }
});

window.addEventListener("keyup", (e) => {
  const { event } = e;
  if(e.code === 'KeyW') {
    // baseActions.idle.weight = 1;
    baseActions.Run.weight = 0;
    activateAction(baseActions.Run.action);
    // activateAction(baseActions.idle.action);
    movingForward = false;
  }
  else if (e.code === 'KeyA'){
    // baseActions.idle.weight = 1;
    baseActions.Run.weight = 0;
    activateAction(baseActions.Run.action);
    // activateAction(baseActions.idle.action);
    movingLeft = false;
  }
  else if (e.code === 'KeyD'){
    // baseActions.idle.weight = 1;
    baseActions.Run.weight = 0;
    activateAction(baseActions.Run.action);
    // activateAction(baseActions.idle.action);
    movingRight = false;
  }
  else if (e.code === 'KeyS'){
    // baseActions.idle.weight = 1;
    baseActions.Run.weight = 0;
    activateAction(baseActions.Run.action);
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
    offset.phi = Math.max(0.01, Math.min(0.55 * Math.PI, phi));
    camera.position.copy(
      cameraOrigin.clone().add(new THREE.Vector3().setFromSpherical(offset))
    );
    camera.lookAt(container.position.clone().add(cameraOrigin));
  }
});