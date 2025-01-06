import * as THREE from "../mrdoob-three.js/build/three.module.js";
import { GLTFLoader } from '../mrdoob-three.js/build/GLTFLoader.js';
import { Water } from '../mrdoob-three.js/build/Water.js';
import { Sky } from '../mrdoob-three.js/build/Sky.js';
import * as SkeletonUtils from '../mrdoob-three.js/build/SkeletonUtils.js';
import * as CANNON from '../cannon-es-debugger-master/dist/cannon-es.js';
import CannonDebugger from '../cannon-es-debugger-master/dist/cannon-es-debugger.js';
// import { displayRandomPopup } from "./pop.js";

export let water, sun;
let timeout = 2000;

const world = new CANNON.World({
    gravity: new CANNON.Vec3(0, -9.81, 0)
});

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

    let stoneCollioderArr = [];
    const Stoneloader = new GLTFLoader();
    // const array_grass_stone = [];
    Stoneloader.load('model/rock1.glb', function (glb){
        const stonemodel = glb.scene;
        stonemodel.scale.set(4, 4, 4);
        stonemodel.position.set(10,4,275);
        // console.log(stonemodel.children[0]);
        for (let i = 0; i < 200; i++) {
          let j = parseInt(Math.random() * 6);
            const clonedModel = SkeletonUtils.clone(stonemodel.children[j]);
            // Set a unique name for each cloned grass model
            clonedModel.name = "Grass ".concat(String(i+1));
            clonedModel.scale.set(0.15,0.15,0.15);
            clonedModel.position.y = 3.8;
            clonedModel.position.z = grass_z_position + Math.random()*300;
            clonedModel.position.x = grass_x_position + Math.random()*300;
            const body = new CANNON.Body({ mass: 0 });
            body.addShape(new CANNON.Box(new CANNON.Vec3(1, 1, 1)));
            body.position.set(clonedModel.position.x, clonedModel.position.y, clonedModel.position.z);
            stoneCollioderArr.push(body);
            world.addBody(body);

            
            

            // // Store the cannon.js body in a property of the cloned model for later use
            clonedModel.cannonBody = body;

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
            const body = new CANNON.Body({ mass: 0 });
            body.addShape(new CANNON.Box(new CANNON.Vec3(1, 1, 1)));
            body.position.set(clonedModel.position.x, clonedModel.position.y, clonedModel.position.z);
            stoneCollioderArr.push(body);
            world.addBody(body);

            // // Store the cannon.js body in a property of the cloned model for later use
            clonedModel.cannonBody = body;

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
            const body = new CANNON.Body({ mass: 0 });
            body.addShape(new CANNON.Box(new CANNON.Vec3(1, 1, 1)));
            body.position.set(clonedModel.position.x, clonedModel.position.y, clonedModel.position.z);
            stoneCollioderArr.push(body);
            world.addBody(body);

            // // Store the cannon.js body in a property of the cloned model for later use
            clonedModel.cannonBody = body;

            scene.add(clonedModel);
        }
    });
    
    const Grassloader = new GLTFLoader();
    
    Grassloader.load('model/grass.glb', function (glb){
        const grassmodel = glb.scene;
        grassmodel.scale.set(4, 4, 4);
        grassmodel.position.set(10,4,275);
        // console.log(grassmodel.children[0]);
        for (let i = 0; i < 1250; i++) {
          let j = parseInt(Math.random() * 6);
          // console.log(j)
            const clonedModel = SkeletonUtils.clone(grassmodel.children[j]);
           
            clonedModel.name = "Grass ".concat(String(i+1));
            clonedModel.scale.set(0.1,0.1,0.1);
            clonedModel.position.y = 3.6;
            clonedModel.position.z = grass_z_position + Math.random()*300;
            clonedModel.position.x = grass_x_position + Math.random()*300;
            scene.add(clonedModel);
        }
        
        for (let i = 1250; i < 2500; i++) {
          let j = parseInt(Math.random() * 6);
          // console.log(j)
            const clonedModel = SkeletonUtils.clone(grassmodel.children[j]);
            // Set a unique name for each cloned grass model
            clonedModel.name = "Grass ".concat(String(i+1));
            clonedModel.scale.set(0.1,0.1,0.1);
            clonedModel.position.y = 3.6;
            clonedModel.position.z = (271) + Math.random()*300;
            clonedModel.position.x = (193) - Math.random()*300;
            scene.add(clonedModel);
        }

        for (let i = 2500; i < 3000; i++) {
          let j = parseInt(Math.random() * 6);
          // console.log(j)
            const clonedModel = SkeletonUtils.clone(grassmodel.children[j]);
            // Set a unique name for each cloned grass model
            clonedModel.name = "Grass ".concat(String(i+1));
            clonedModel.scale.set(0.15,0.15,0.15);
            clonedModel.position.y = 3.6;
            clonedModel.position.z = (560) + Math.random()*100;
            clonedModel.position.x = (193) - Math.random()*380;
            scene.add(clonedModel);
        }
    });

    let chestmodel;
    const Chestloader = new GLTFLoader();

    
    Chestloader.load('model/chest.glb', function (glb) {
        chestmodel = glb.scene;
        chestmodel.name = 'ChestModel';
        chestmodel.position.set(-45, 3.4, 470);
        scene.add(chestmodel);
    document.addEventListener('click', onMouseClick, false);
    let intersects = [];
    function onMouseClick(event) {
    // Calculate mouse position in normalized device coordinates (-1 to +1)
      const mouse = new THREE.Vector2();
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Raycasting to check if the mouse click intersects with the cube
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);

      intersects = raycaster.intersectObject(chestmodel);

      if (intersects.length > 0) {
        // Remove the model
                if (chestmodel.name == "ChestModel"){
                     scene.remove(chestmodel);
                     world.removeBody(chestPhysiscsBody);
                     window.location.href = "./game.html";
                }
               
      }
 

  }
    
    });

  const chestphybody = new CANNON.Material();
  const chestPhysiscsBody = new CANNON.Body({
  mass: 0,
  shape: new CANNON.Box(new CANNON.Vec3(0.5,1,0.5)),
  position: new CANNON.Vec3(-45, 3.4, 470),
  material: chestphybody,
  
  });

world.addBody(chestPhysiscsBody);
    let TreesCollider1 = []
    const Treeloader = new GLTFLoader();
    
    Treeloader.load('model/trees1 (1).glb', function (glb){
        const treemodel = glb.scene;

        
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
          const treesBody = new CANNON.Body({ mass: 0 });
          treesBody.addShape(new CANNON.Box(new CANNON.Vec3(1.5, 5, 1.5)));
          treesBody.position.set(clonedModel.position.x, clonedModel.position.y, clonedModel.position.z);
          TreesCollider1.push(treesBody);
          world.addBody(treesBody);
          clonedModel.cannonBody = treesBody;

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
            const treesBody = new CANNON.Body({ mass: 0 });
            treesBody.addShape(new CANNON.Box(new CANNON.Vec3(1.5, 5, 1.5)));
            treesBody.position.set(clonedModel.position.x, clonedModel.position.y, clonedModel.position.z);
            TreesCollider1.push(treesBody);
            world.addBody(treesBody);
            clonedModel.cannonBody = treesBody;
  
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
            const treesBody = new CANNON.Body({ mass: 0 });
            treesBody.addShape(new CANNON.Box(new CANNON.Vec3(1.5, 5, 1.5)));
            treesBody.position.set(clonedModel.position.x, clonedModel.position.y, clonedModel.position.z);
            TreesCollider1.push(treesBody);
            world.addBody(treesBody);
            clonedModel.cannonBody = treesBody;
  
            scene.add(clonedModel);
        }
  });

  let TreesCollider2 = []
  const Treeloader2 = new GLTFLoader();
  Treeloader2.load('model/trees2 (1).glb', function (glb){
      const treemodel = glb.scene;
     
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
        const treesBody2 = new CANNON.Body({ mass: 0 });
        treesBody2.addShape(new CANNON.Box(new CANNON.Vec3(1.5, 5, 1.5)));
        treesBody2.position.set(clonedModel.position.x, clonedModel.position.y, clonedModel.position.z);
        TreesCollider2.push(treesBody2);
        world.addBody(treesBody2);
        clonedModel.cannonBody = treesBody2;

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
        const treesBody2 = new CANNON.Body({ mass: 0 });
        treesBody2.addShape(new CANNON.Box(new CANNON.Vec3(1.5, 5, 1.5)));
        treesBody2.position.set(clonedModel.position.x, clonedModel.position.y, clonedModel.position.z);
        TreesCollider2.push(treesBody2);
        world.addBody(treesBody2);
        clonedModel.cannonBody = treesBody2;

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
      const treesBody2 = new CANNON.Body({ mass: 0 });
      treesBody2.addShape(new CANNON.Box(new CANNON.Vec3(1.5, 5, 1.5)));
      treesBody2.position.set(clonedModel.position.x, clonedModel.position.y, clonedModel.position.z);
      TreesCollider2.push(treesBody2);
      world.addBody(treesBody2);
      clonedModel.cannonBody = treesBody2;

      scene.add(clonedModel);
      
     }
  });

    let boatMixer;
    const Boatloader = new GLTFLoader();
    Boatloader.load( 'model/animatedBoat.glb', function ( glb ) {
      model = glb.scene;
      model.position.set(-197,0.2,465);
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
        
       
        scene.add(model);
      });
     });


// Ground plane
const islandLoader = new GLTFLoader();
    islandLoader.load('model/new_island.glb', function(glb){
      island = glb.scene;
      island.scale.set(0.35,0.5,0.35);
      island.position.set(0,2,465);
      scene.add(island);
  });
  
  const islandPhysMat = new CANNON.Material();

  const islandBody = new CANNON.Body({
      mass: 0,
      shape: new CANNON.Box(new CANNON.Vec3(193,15,150)),
      position: new CANNON.Vec3(0, 2,465),
      material: islandPhysMat
  });
  // world.addBody(islandBody); 




// Container for both camera and person
export const container = new THREE.Group();
scene.add(container);

// Camera and controls
const xAxis = new THREE.Vector3(1, 0, 0);
const tempCameraVector = new THREE.Vector3();
const tempModelVector = new THREE.Vector3();
export const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.01, 1000 );
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
loader.load( 'model/animatingCharacter.glb', function ( glb ) {
  model = glb.scene;
  model.name = "CharacterModel";
  model.scale.set(0.1,0.1,0.1);
  container.add(model);
  model.traverse(function(object){
  // const obj = JSON.parse(sessionStorage.getItem('container'));
    if ( object.isMesh ) {
      object.castShadow = true;
    }
    
 
    
  });
  
  
  container.position.set(-180,3.4,465);
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

export const characterPhys = new CANNON.Material();
export const characterPhysiscsBody = new CANNON.Body({
  mass: 1,
  shape: new CANNON.Box(new CANNON.Vec3(0.5,2,0.5)),
  position: new CANNON.Vec3(-180, 3.4, 465),
  material: characterPhys,
  
});

world.addBody(characterPhysiscsBody);



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
  
  
  let flag = 0;
  function checkCharacterPositionOnIsland(container){

    if ((parseInt(container.position.x) <= -194) ||(parseInt(container.position.x) >= 193)||
      (parseInt(container.position.z) <= 271) || parseInt(container.position.z) >= 660)
        {
          
        
      container.position.y = -1;
          // if(container.children[1]){
          //     container.children[1].rotateZ(-1);
           
          // }
      if (model){
        
        flag = 1;
        model.position.y = 1;
        model.rotateZ(-1.5);
        model.rotateX(0.5);
        loading();
        // model = undefined;
      }
    }
    
  }

  export function container_position(container, camera, tempCameraVector, tempModelVector, xAxis, cameraOrigin){
    if (typeof (Storage) !== undefined){
      const positions = {
        x : container.position.x,
        y : container.position.y,
        z : container.position.z
      };
      const camera_position = {
        cam_x : camera.position.x,
        cam_y : camera.position.y,
        cam_z : camera.position.z,
      }
      const container_rotation = {
        rotate_x : container.rotation.x,
        rotate_y : container.rotation.y,
        rotate_z : container.rotation.z
      };
      sessionStorage.setItem('container', JSON.stringify(positions));
      sessionStorage.setItem('camera', JSON.stringify(camera_position));
      sessionStorage.setItem('container_rotationY', JSON.stringify(container_rotation));
    }  
  }
 
  function detectCollisions() {
    
    const characterBody = characterPhysiscsBody;
    const bodies = world.bodies;
  
    
  const characterPosition = characterBody.position;
    for (let i = 0; i < bodies.length; i++) {
        const body = bodies[i];

        // Check if the body is not the character's body
        if (body !== characterBody) {

            // Perform collision detection
            if (checkCollision(characterBody, body)) {
                // console.log("Collision detected!");
                // Handle collision effect (apply force to the character's body)
                
                  
                  handleCollisionEffect(characterBody);

                
            }
        }
    }
    // console.log(container.position);
}

// Collision Detection Logic
function checkCollision(body1, body2) {
    const shape1 = body1.shapes[0]; // Assuming the shape is a box
    const shape2 = body2.shapes[0]; // Assuming the shape is a box

    const pos1 = body1.position;
    const pos2 = body2.position;

    // Check for overlap between bounding boxes
    return (
        Math.abs(pos1.x - pos2.x) < (shape1.halfExtents.x + shape2.halfExtents.x) &&
        Math.abs(pos1.y - pos2.y) < (shape1.halfExtents.y + shape2.halfExtents.y) &&
        Math.abs(pos1.z - pos2.z) < (shape1.halfExtents.z + shape2.halfExtents.z)
    );
}

// Collision Effect Logic
function handleCollisionEffect(characterBody) {
 
  
  


    const backwardDistance = -1;
    const collisionNormal = new CANNON.Vec3(-1, 0, 2); // Adjust the collision normal based on your needs
    characterBody.position.vsub(collisionNormal.scale(backwardDistance), characterBody.position);
    movingForward = false;
  
    
}


function loading() {
  const loaderElement = document.createElement('div');
  loaderElement.className = 'box-container';
  loaderElement.innerHTML = `<div class="box">
                              <div id="over">Game Over</div>
                              <div class="box-text">Do you want to restart</div><div class="but">
                                <button class="btn-yes">Yes</button>
                                <button class="btn-no">No</button>
                              </div>
                              </div>`;
  document.body.appendChild(loaderElement);
  
  const styleString = `
  @font-face {
    font-family: myFont;
    src: url("PumpkinIsland-Regular.ttf");
  }

  body {
    margin: 0;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    width: 100%;
    height: 100%;
    font-family: myFont;
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  .box-container {
    margin-top: 150px;
    opacity: 0;
    z-index: 1;
    right:700px;
  }

  .box {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    bottom: 50%;
    width: 490px;
    height: 230px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 1;
  }

  .but {
    display: flex;
    flex-direction: row;
    margin-top: 20px;
  }

  .box::before {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    background: linear-gradient(to right, transparent 0%, transparent 50%, black 50%, black 100%);
    background-size: 200% 100%;
    background-position: 100% 0;
    opacity: 0.5;
    border-radius: 15px;
  }

  .box::after {
    content: '';
    position: absolute;
    inset: 5px;
    background-color: #555;
    border-radius: 10px;
  }

  .btn-yes,
  .btn-no {
    background-color: #4CAF50;
    color: white;
    padding: 15px 25px;
    margin: 10px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    z-index: 2;
    font-size: 20px;
    font-family: myFont;
    font-style: italic;
  }

  #over {
    z-index: 1;
    color: white;
    font-size: 60px;
    text-align: center;
    overflow: hidden;
    white-space: nowrap;
    font-family: myFont;
    font-style: italic;
  }

  .btn-no {
    background-color: #f44336;
  }

  .box-text {
    z-index: 1;
    color: white;
    font-size: 35px;
    text-align: center;
    overflow: hidden;
    white-space: nowrap;
    font-family: myFont;
    font-style: italic;
  }

  .blink {
    animation: blink 0.6s ease-in-out;
  }

  @keyframes blink {
    0%, 50%, 100% {
      opacity: 0;
    }
    25%, 75% {
      opacity: 1;
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes fadeOut {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }`      
  const styleElement = document.createElement('style');
  styleElement.appendChild(document.createTextNode(styleString));
  document.head.appendChild(styleElement);

   function applyFadeOutEffect(element, fadeTime, additionalLogic) {
    element.style.opacity = '0';
    setTimeout(function () {
      if (typeof additionalLogic === 'function') {
        additionalLogic();
      }
    }, fadeTime);
  }
  
  function handleButtonClick(element, additionalLogic) {
    applyFadeOutEffect(element, 0, additionalLogic);
    applyFadeOutEffect(btnYes, 5000);
    applyFadeOutEffect(btnNo, 5000);
  }
  
  const boxContainer = document.querySelector('.box-container');
  const btnYes = document.querySelector('.btn-yes');
  const btnNo = document.querySelector('.btn-no');
  
  setTimeout(function () {
    boxContainer.style.opacity = '1';
  }, 1000);
  
  btnYes.addEventListener('click', function () {
    handleButtonClick(boxContainer, function () {
      // Additional logic or actions after fade-out for 'Yes' button
      window.location.href = "./fishrodPicking.html";
    });
  });
  
  btnNo.addEventListener('click', function () {
    handleButtonClick(boxContainer, function () {
      // Additional logic or actions after fade-out for 'No' button
      window.location.href = "./Island.html"
    });
  });
}

const fixedTimeStep = 1.0 / 60.0;
  
const cannondebugger = new CannonDebugger(scene, world);


export const animate = function () {
   
    
   
        // cannondebugger.update();
   
      

        // Update positions of Three.js objects based on cannon.js physics bodies
        scene.children.forEach((object) => {
            if (object.cannonBody) {
                object.position.copy(object.cannonBody.position);
                object.quaternion.copy(object.cannonBody.quaternion);
            }
        });   
        
  detectCollisions();    
  if (container && flag == 0){
    checkCharacterPositionOnIsland(container);
  }
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
      Math.max(-0.05, Math.min(sanitisedAngle, 0.05))
    );
    container.position.add(cameraDirection.multiplyScalar(0.05));
    camera.lookAt(container.position.clone().add(cameraOrigin));
    characterPhysiscsBody.position.x = container.position.x;
    characterPhysiscsBody.position.y = container.position.y;
    characterPhysiscsBody.position.z = container.position.z;

  }
  else if (movingLeft){

    container.rotateY(0.02);
    characterPhysiscsBody.quaternion.copy(container.quaternion);


  }
  else if (movingRight){

    container.rotateY(-0.02);
    characterPhysiscsBody.quaternion.copy(container.quaternion);

  }
  

  if (characterPhysiscsBody) {
    container.position.copy(characterPhysiscsBody.position);
  }
  water.material.uniforms[ 'time' ].value += 0.5 / 60.0;
  renderer.render( scene, camera );
  // console.log(container.position);
};

animate();

// Key and mouse events
// let movingForward = false;
// let movingLeft = false;
// let movingRight = false;

window.addEventListener("keydown", (e) => {
  const { code } = e;

  if (code === "KeyW") {
    movingForward = true;
  } else if (code === "KeyA") {
    movingLeft = true;
  } else if (code === "KeyD") {
    movingRight = true;
  }

  updateMovement();
});

window.addEventListener("keyup", (e) => {
  const { code } = e;

  if (code === "KeyW") {
    movingForward = false;
  }
  else if (code === "KeyA") {
    movingLeft = false;
  }
  else if (code === "KeyD") {
    movingRight = false;
  }

  updateMovement();
});

function updateMovement() {
  // Base action logic here, using movingForward, movingLeft, and movingRight
  // Example:
  if (movingForward) {
    baseActions.Run.weight = 5;
    activateAction(baseActions.Run.action);
  }
  else if(movingLeft || movingRight){
    baseActions.Run.weight = 5;
    activateAction(baseActions.Run.action);
  }
  else {
    baseActions.Run.weight = 0;
    activateAction(baseActions.Run.action);
  }
}

// function updateMovement2() {
//   // Base action logic here, using movingForward, movingLeft, and movingRight
//   // Example:
//   if (movingForward) {
//     baseActions.idle.weight = 0;
//     activateAction(baseActions.Run.action);
//   } else {
//     // Handle idle or other actions
//   }
// }

let eventStat = 0;
window.addEventListener("keypress", (e)=>{
  
  if (e.code === 'KeyX'){
   
     
    
    window.location.href = './Island.html';
    
  }
  if (e.code == 'Space'){
    eventStat = 1;
    if (eventStat == 0){
      eventStat = 1; 
    }
    else{
      container_position(container, camera, tempCameraVector, tempModelVector, xAxis, cameraOrigin);
      eventStat = 0;
      window.location.href = './GamePlay_PauseOnIsland.html';
    }
}
});

window.addEventListener("pointerdown", (e) => {
  mousedown = true;
});

window.addEventListener("pointerup", (e) => {
  mousedown = false;
});

window.addEventListener("pointermove", (e) => {
    const { movementX, movementY } = e;
    const offset = new THREE.Spherical().setFromVector3(
      camera.position.clone().sub(cameraOrigin)
    );
    const phi = offset.phi - movementY * 0.02;
    offset.theta -= movementX * 0.02;
    offset.phi = Math.max(0.01, Math.min(0.60 * Math.PI, phi));
    camera.position.copy(
      cameraOrigin.clone().add(new THREE.Vector3().setFromSpherical(offset))
    );
    camera.lookAt(container.position.clone().add(cameraOrigin));

});