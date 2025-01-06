import * as THREE from "../mrdoob-three.js/build/three.module.js";
import { GLTFLoader } from '../mrdoob-three.js/build/GLTFLoader.js';
import { Water } from '../mrdoob-three.js/build/Water.js';
import { Sky } from '../mrdoob-three.js/build/Sky.js';
import * as YUKA from '../yuka-master/build/yuka.module.js';
import * as SkeletonUtils from '../mrdoob-three.js/build/SkeletonUtils.js';
import * as CANNON from '../cannon-es-debugger-master/dist/cannon-es.js';
import CannonDebugger from '../cannon-es-debugger-master/dist/cannon-es-debugger.js';


import { displayRandomPopup } from "./pop.js";

export function initiatePopupCycle(text1, text2, text3){



 


  
  displayRandomPopup(text1, 'popup', 'popupText', 5000);
  setTimeout(()=>{
    displayRandomPopup(text2, 'popup', 'popupText', 5000);
  }, 6000)
  setTimeout(()=>{
    displayRandomPopup(text3, 'popup', 'popupText', 5000);
  }, 12000)
  }
// }
export let text1 = "";
export let text2 = "";
export let text3 = "";
initiatePopupCycle(text1, text2, text3);
// Cannon Physics world
const world = new CANNON.World({
  gravity: new CANNON.Vec3(0, -9.81, 0)
});



export let  water, sun;
// Scene and renderer

export const scene = new THREE.Scene();
scene.background = new THREE.Color( 0xa0a0a0 );
scene.fog = new THREE.Fog( 0xa0a0a0, 10, 50 );
export const renderer = new THREE.WebGLRenderer();
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


// window.addEventListener('resize', function(renderer){
  
// })


let barrel_z_position = 100;
let barrel_x_position = 10;
let clonedModel;
export let popped_barrels = [];
export let barrel_pickup_flag = 0;

const barrelLoader = new GLTFLoader();

barrelLoader.load('model/barrel.glb', function (glb){
    const barrelmodel = glb.scene;
    barrelmodel.scale.set(.8, .8, .8);
    barrelmodel.rotation.set(1, 2, 0.6);

    for (let i = 0; i < 10; i++) {
        const clonedModel = SkeletonUtils.clone(barrelmodel);

        // Set a unique name for each cloned barrel model
        clonedModel.name = "barrel ".concat(String(i+1));
        
        clonedModel.position.z = barrel_z_position;
        clonedModel.position.x = barrel_x_position;
        scene.add(clonedModel);
        barrel_z_position += 30;
        if (i % 2 == 0) {
            barrel_x_position -= 30;
        } else {
            barrel_x_position += 30;
        }
        document.addEventListener('click', onMouseClick, false);
        
        function onMouseClick(event) {
        // Calculate mouse position in normalized device coordinates (-1 to +1)
          const mouse = new THREE.Vector2();
          mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
          mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        // Raycasting to check if the mouse click intersects with the cube
          const raycaster = new THREE.Raycaster();
          raycaster.setFromCamera(mouse, camera);

          intersects = raycaster.intersectObject(clonedModel);

          if (intersects.length > 0) {
            // Remove the model
            if (clonedModel.name == 'barrel 1'){
              barrel_pickup_flag = 1;
            }
            displayRandomPopup("Barrel picked up !!!", 'popup', 'popupText', 5000);
            container_position(container, camera, tempCameraVector, tempModelVector, xAxis, cameraOrigin);
            sessionStorage.setItem('barrel_1_pop', JSON.stringify(clonedModel));
            scene.remove(clonedModel);
            
            popped_barrels.push(clonedModel);
            
            
            
          }
          else{
            barrel_r = false;
          }
        }

    }

});



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

// Container for both camera and person
export let container = new THREE.Group();
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






let fishc_s;



// Model and animation actions
let model, fishModel, skeleton, mixer,fishMixer,  clock, numAnimations = 0,
    movingForward = false, mousedown = false, island, mixer2;

export let movingLeft = false, movingRight = false;
let movingBackward = false;

clock = new THREE.Clock();

const entityManager = new YUKA.EntityManager();

function sync(entity, renderComponent) {
    

    renderComponent.matrix.copy(entity.worldMatrix);
}


const islandLoader = new GLTFLoader();
islandLoader.load('model/island.glb', function(glb){
  island = glb.scene;
  island.scale.set(1,0.5,1);
  island.position.z = 465;
  island.position.y = 2;
  scene.add(island);


});


const islandPhysMat = new CANNON.Material();

const islandBody = new CANNON.Body({
    mass: 0,
    shape: new CANNON.Box(new CANNON.Vec3(320,15,230)),
    position: new CANNON.Vec3(0, 2,465),
    material: islandPhysMat
});
world.addBody(islandBody);    



let   raycaster = new THREE.Raycaster();
export let intersects;
export var barrel_r = false;
let mouse;



let fishCollectionCount = 0;

const Fishloader = new GLTFLoader();

Fishloader.load('model/TuneFish.glb',function(glb){
  const model = glb.scene;
  const clips = glb.animations;
  
  const fishes = new THREE.AnimationObjectGroup();
  mixer = new THREE.AnimationMixer(fishes);
  const clip = THREE.AnimationClip.findByName(clips,'TunaSwim');
  const action = mixer.clipAction(clip);
  action.play();
  
  var v1 = -359;
  var v2 = 536;
  for(let i=0;i<25;i++){
      //const vehicleM = new THREE.Mesh()
      const vehicle = new YUKA.Vehicle();
      const path = new YUKA.Path();
      const fishClone = SkeletonUtils.clone(model);
      
      fishClone.position.z = 100;
      fishClone.matrixAutoUpdate = false;

      scene.add(fishClone);
      fishes.add(fishClone);
      
      document.addEventListener('click', onMouseClick, false);

      function onMouseClick(event){
          const mouse = new THREE.Vector2();
          mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
          mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  
        // Raycasting to check if the mouse click intersects with the cube
          const raycaster = new THREE.Raycaster();
          raycaster.setFromCamera(mouse, camera);
          
          intersects = raycaster.intersectObject(fishClone);
  
          if (intersects.length > 0){
            fishCollectionCount += 1;
            fishc_s = String(fishCollectionCount);
            scene.remove(fishClone);
            displayRandomPopup("You catched ".concat(fishc_s, " fish"), 'popup', 'popupText', 5000);              
          }
  
      }

      vehicle.setRenderComponent(fishClone,sync);
      
      vehicle.position.x = Math.random()* v1 + v2;
      vehicle.position.z = -Math.random()* v1 - v2;
      if (i%2==0){
        var x = 2.5 * Math.random() * -5;
        var z = 2.5 - Math.random() * 150;
      }
      else{
        var x = 2.5 - Math.random() * 25;
        var z = 2.5 * Math.random() * 250;

      }
      
      for (let j = 0; j<9; j++){

        path.add( new YUKA.Vector3(x, -4, z));
        x+=Math.random() * Math.random();
        z+=12;
        path.add( new YUKA.Vector3(x, -4, z));
        x+=2;
        z+=22;

        path.add( new YUKA.Vector3(x, -4, z));
        x+=2;
        z+=32;

        path.add( new YUKA.Vector3(x, -4, z));
        x+=2;
        z+=42;

        path.add( new YUKA.Vector3(x, -4, z));
        x+=2;
        z+=52;

        path.add( new YUKA.Vector3(x, -4, z));
        x+=2;
        z+=-2;

        path.add( new YUKA.Vector3(x, -4, z));
        x+=2;
        z+=-20;

        path.add( new YUKA.Vector3(x, -4, z));
        if (i%2 == 0){
          x+=z * x + Math.random();
          z-=x * z - Math.random() + 240;
        }
        else{
          x-=z -Math.random() * x;
          z+=x + Math.random() * z + 150;
        }


      }
      
      path.loop = true;

  
    vehicle.position.copy(path.current());
  
    vehicle.maxspeed = 5;
  
    const followPathBehavior = new YUKA.FollowPathBehavior(path, 0.5);
    vehicle.steering.add(followPathBehavior);
  
    const onPathBehavior = new YUKA.OnPathBehavior(path, 0.5);
    onPathBehavior.radius = 2;
    vehicle.steering.add(onPathBehavior);
  
    entityManager.add(vehicle);
    
    
  
  }
  
  var v1 = -4670;
  var v2 = 7006;
  for(let i=0;i<15;i++){
      
      const vehicle = new YUKA.Vehicle();
      const path = new YUKA.Path();
      const fishClone = SkeletonUtils.clone(model);
      fishClone.position.z = 150;
      fishClone.matrixAutoUpdate = false;
      // fishClone.position.x = Math.random()*5;
      fishClone.position.z = Math.random()*5;
      scene.add(fishClone);
      fishes.add(fishClone);
      document.addEventListener('click', onMouseClick, false);

      function onMouseClick(event){
          const mouse = new THREE.Vector2();
          mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
          mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  
        // Raycasting to check if the mouse click intersects with the cube
          const raycaster = new THREE.Raycaster();
          raycaster.setFromCamera(mouse, camera);
          
          intersects = raycaster.intersectObject(fishClone);

          if (intersects.length > 0){
              fishCollectionCount += 1;
              fishc_s = String(fishCollectionCount);
              
              scene.remove(fishClone);
              displayRandomPopup("You catched ".concat(fishc_s, " fish"), 'popup', 'popupText', 5000);              
          }
  
      }
      
      vehicle.setRenderComponent(fishClone,sync);
      vehicle.position.x = Math.random()* v1 + v2;
      vehicle.position.z = -Math.random()* v1 - v2;
      if (i%2==0){
        var x = 2.5 + Math.random() * 15;
        var z = 2.5 - Math.random() * 230;
      }
      else{
        var x = 2.5 - Math.random() * 15;
        var z = 2.5 + Math.random() * 140;

      }
      
      for (let j = 0; j<9; j++){

        path.add( new YUKA.Vector3(x, -4, z));
        x+=4;
        z-=8;
        path.add( new YUKA.Vector3(x, -4, z));
        x+=10;
        z-=18;

        path.add( new YUKA.Vector3(x, -4, z));
        x+=15;
        z-=28;

        path.add( new YUKA.Vector3(x, -4, z));
        x+=20;
        z-=38;

        path.add( new YUKA.Vector3(x, -4, z));
        x+=25;
        z-=48;

        path.add( new YUKA.Vector3(x, -4, z));
        x+=30;
        z-=58;

        path.add( new YUKA.Vector3(x, -4, z));
        x+=35;
        z-=68;

        path.add( new YUKA.Vector3(x, -4, z));
        if (i%2 == 0){
          x+=z;
          z-=x;
        }
        else{
          x-=z * Math.random() + 200;
          z+=x * Math.random() + 23;
        }


      }
      
      path.loop = true;

  
    vehicle.position.copy(path.current());
  
    vehicle.maxspeed = 5;
  
    const followPathBehavior = new YUKA.FollowPathBehavior(path, 0.5);
    vehicle.steering.add(followPathBehavior);
  
    const onPathBehavior = new YUKA.OnPathBehavior(path, 0.5);
    onPathBehavior.radius = 2;
    vehicle.steering.add(onPathBehavior);
  
    entityManager.add(vehicle);
  
  }
  // 3

  var v1 = -108999;
  var v2 = -20399999;
  for(let i=0;i<5;i++){
    
      const vehicle = new YUKA.Vehicle();
      const path = new YUKA.Path();
      const fishClone = SkeletonUtils.clone(model);
      fishClone.position.z = 200;
      fishClone.matrixAutoUpdate = false;
     
      scene.add(fishClone);
      fishes.add(fishClone);
      document.addEventListener('click', onMouseClick, false);

      function onMouseClick(event){
          const mouse = new THREE.Vector2();
          mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
          mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  
        // Raycasting to check if the mouse click intersects with the cube
          const raycaster = new THREE.Raycaster();
          raycaster.setFromCamera(mouse, camera);
          
          intersects = raycaster.intersectObject(fishClone);
  
          if (intersects.length > 0){
            fishCollectionCount += 1;
            fishc_s = String(fishCollectionCount);
            scene.remove(fishClone);
            displayRandomPopup("You catched ".concat(fishc_s, " fish"), 'popup', 'popupText', 5000);              

              
          }
  
      }
      
      vehicle.setRenderComponent(fishClone,sync);
      vehicle.position.x = Math.random()* v1 + v2 * -Math.random();
      vehicle.position.z = -Math.random()* v2 - v1 * Math.random();
      if (i%2==0){
        var x = 2.5 + Math.random() * v1;
        var z = 2.5 - Math.random() * v2;
      }
      else{
        var x = 2.5 - Math.random() * v2;
        var z = 2.5 + Math.random() * v1;

      }
      
      for (let j = 0; j<1000; j++){

        path.add( new YUKA.Vector3(x, -4, z));
        x*=v1;
        z-=v2;
        path.add( new YUKA.Vector3(x, -4, z));
        x*=v1;
        z-=v2;

        path.add( new YUKA.Vector3(x, -4, z));
        x-=v2;
        z+=v1;

        path.add( new YUKA.Vector3(x, -4, z));
        x*=v2;
        z+=v1;

        path.add( new YUKA.Vector3(x, -4, z));
        x+=v1;
        z*=v2;

        path.add( new YUKA.Vector3(x, -4, z));
        x*=v2;
        z+=v1;

        path.add( new YUKA.Vector3(x, -4, z));
        x-=v2;
        z+=v2;

        path.add( new YUKA.Vector3(x, -4, z));
        if (i%2 == 0){
          x+=z * v2;
          z-=x + v1;
        }
        else{
          x-=z * Math.random() - v2;
          z+=x * Math.random() + v1;
        }


      }
      
      path.loop = true;

  
    vehicle.position.copy(path.current());
  
    vehicle.maxspeed = 5;
  
    const followPathBehavior = new YUKA.FollowPathBehavior(path, 0.5);
    vehicle.steering.add(followPathBehavior);
  
    const onPathBehavior = new YUKA.OnPathBehavior(path, 0.5);
    onPathBehavior.radius = 2;
    vehicle.steering.add(onPathBehavior);
  
    entityManager.add(vehicle);
  
  }
  // 4
  var v1 = 4665;
  var v2 = 8045;
  for(let i=0;i<25;i++){
    
      const vehicle = new YUKA.Vehicle();
      const path = new YUKA.Path();
      const fishClone = SkeletonUtils.clone(model);
      fishClone.position.z = 250;
      fishClone.matrixAutoUpdate = false;
     
      scene.add(fishClone);
      fishes.add(fishClone);
      document.addEventListener('click', onMouseClick, false);

      function onMouseClick(event){
          const mouse = new THREE.Vector2();
          mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
          mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  
        // Raycasting to check if the mouse click intersects with the cube
          const raycaster = new THREE.Raycaster();
          raycaster.setFromCamera(mouse, camera);
          
          intersects = raycaster.intersectObject(fishClone);
  
          if (intersects.length > 0){
            fishCollectionCount += 1;
            fishc_s = String(fishCollectionCount);
            scene.remove(fishClone);
            displayRandomPopup("You catched ".concat(fishc_s, " fish"), 'popup', 'popupText', 5000);              

              
          }
  
      }
      
      vehicle.setRenderComponent(fishClone,sync);
      vehicle.position.x = Math.random()* v1 + v2 * -Math.random();
      vehicle.position.z = -Math.random()* v2 - v1 * Math.random();
      if (i%2==0){
        var x = 15.5 + Math.random() * v1;
        var z = -15.5 - Math.random() * v2;
      }
      else{
        var x = -15.5 - Math.random() * v2;
        var z = 15.5 + Math.random() * v1;

      }
      
      for (let j = 0; j<10; j++){

        path.add( new YUKA.Vector3(x, -4, z));
        x+=v1 - 1200;
        z-=v2 + 1500;
        path.add( new YUKA.Vector3(x, -4, z));
        x+=v1 + 1600;
        z-=v2 - 5677;

        path.add( new YUKA.Vector3(x, -4, z));
        x+=v2 * 5667;
        z-=v1 * 4344;

        path.add( new YUKA.Vector3(x, -4, z));
        x+=v2 *3344;
        z-=v1 *5677;

        path.add( new YUKA.Vector3(x, -4, z));
        x+=v1 + 5656;
        z-=v2 + 3445;

        path.add( new YUKA.Vector3(x, -4, z));
        x+=v2 - 1200;
        z-=v1 - 4500;

        path.add( new YUKA.Vector3(x, -4, z));
        x+=v2;
        z-=v2;

        path.add( new YUKA.Vector3(x, -4, z));
        if (i%2 == 0){
          x+=z * v2;
          z-=x + v1;
        }
        else{
          x-=z * Math.random() - v2;
          z+=x * Math.random() + v1;
        }


      }
      
      path.loop = true;

  
    vehicle.position.copy(path.current());
  
    vehicle.maxspeed = 5;
  
    const followPathBehavior = new YUKA.FollowPathBehavior(path, 0.5);
    vehicle.steering.add(followPathBehavior);
  
    const onPathBehavior = new YUKA.OnPathBehavior(path, 0.5);
    onPathBehavior.radius = 2;
    vehicle.steering.add(onPathBehavior);
  
    entityManager.add(vehicle);
  
  }

})







// 3

const Fishloader3 = new GLTFLoader();

Fishloader3.load('model/TuneFish.glb',function(glb){
    const model = glb.scene;
    const clips = glb.animations;
    
    const fishes = new THREE.AnimationObjectGroup();
    mixer2 = new THREE.AnimationMixer(fishes);
    const clip = THREE.AnimationClip.findByName(clips,'TunaSwim');
    const action = mixer2.clipAction(clip);
    action.play();
    
    var v1 = 37400;
    var v2 = 718;
    // 1
    for(let i=0;i<25;i++){
        //const vehicleM = new THREE.Mesh()
        const vehicle = new YUKA.Vehicle();
        const path = new YUKA.Path();
        const fishClone = SkeletonUtils.clone(model);
        
        fishClone.position.z = 400;
        fishClone.matrixAutoUpdate = false;
        // fishClone.position.x = Math.random()*5;
        // fishClone.position.z = Math.random()*5;
        scene.add(fishClone);
        fishes.add(fishClone);
        document.addEventListener('click', onMouseClick, false);

        function onMouseClick(event){
            const mouse = new THREE.Vector2();
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
          // Raycasting to check if the mouse click intersects with the cube
            const raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(mouse, camera);
            
            intersects = raycaster.intersectObject(fishClone);
    
            if (intersects.length > 0){
              fishCollectionCount += 1;
              fishc_s = String(fishCollectionCount);
              scene.remove(fishClone);
              displayRandomPopup("You catched ".concat(fishc_s, " fish"), 'popup', 'popupText', 5000);              

                
            }
    
        }
          

        vehicle.setRenderComponent(fishClone,sync);
        
        vehicle.position.x = Math.random()* v1 + v2;
        vehicle.position.z = -Math.random()* v1 - v2;
        if (i%2==0){
          var x = 100 * Math.random() * -5;
          var z = 50 - Math.random() * 25;
        }
        else{
          var x = 150 - Math.random() * 25;
          var z = 17 * Math.random() * -5;

        }
        
        for (let j = 0; j<9; j++){

          path.add( new YUKA.Vector3(x, -4, z));
          x+=Math.random() * Math.random();
          z+=12;
          path.add( new YUKA.Vector3(x, -4, z));
          x+=2;
          z+=22;

          path.add( new YUKA.Vector3(x, -4, z));
          x+=2;
          z+=32;

          path.add( new YUKA.Vector3(x, -4, z));
          x+=2;
          z+=42;

          path.add( new YUKA.Vector3(x, -4, z));
          x+=2;
          z+=52;

          path.add( new YUKA.Vector3(x, -4, z));
          x+=2;
          z+=-2;

          path.add( new YUKA.Vector3(x, -4, z));
          x+=2;
          z+=-20;

          path.add( new YUKA.Vector3(x, -4, z));
          if (i%2 == 0){
            x+=z * x + Math.random();
            z-=x * z - Math.random();
          }
          else{
            x-=z -Math.random() * x;
            z+=x + Math.random() * z;
          }


        }
        
        path.loop = true;

    
      vehicle.position.copy(path.current());
    
      vehicle.maxspeed = 5;
    
      const followPathBehavior = new YUKA.FollowPathBehavior(path, 0.5);
      vehicle.steering.add(followPathBehavior);
    
      const onPathBehavior = new YUKA.OnPathBehavior(path, 0.5);
      onPathBehavior.radius = 2;
      vehicle.steering.add(onPathBehavior);
    
      entityManager.add(vehicle);
    
    }
    // 2
    for(let i=0;i<25;i++){
      //const vehicleM = new THREE.Mesh()
      const vehicle = new YUKA.Vehicle();
      const path = new YUKA.Path();
      const fishClone = SkeletonUtils.clone(model);
      
      fishClone.position.z = 400;
      fishClone.matrixAutoUpdate = false;
      // fishClone.position.x = Math.random()*5;
      // fishClone.position.z = Math.random()*5;
      scene.add(fishClone);
      fishes.add(fishClone);
      document.addEventListener('click', onMouseClick, false);

      function onMouseClick(event){
          const mouse = new THREE.Vector2();
          mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
          mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  
        // Raycasting to check if the mouse click intersects with the cube
          const raycaster = new THREE.Raycaster();
          raycaster.setFromCamera(mouse, camera);
          
          intersects = raycaster.intersectObject(fishClone);
  
          if (intersects.length > 0){
            fishCollectionCount += 1;
            fishc_s = String(fishCollectionCount);
            scene.remove(fishClone);
            displayRandomPopup("You catched ".concat(fishc_s, " fish"), 'popup', 'popupText', 5000);              

              
          }
  
      }
      

      vehicle.setRenderComponent(fishClone,sync);
      
      vehicle.position.x = Math.random()* v1 + v2;
      vehicle.position.z = -Math.random()* v1 - v2;
      if (i%2==0){
        var x = -300 * Math.random() * -5;
        var z = -70 - Math.random() * 25;
      }
      else{
        var x = -550 - Math.random() * 25;
        var z = -17 * Math.random() * -5;

      }
      
      for (let j = 0; j<9; j++){

        path.add( new YUKA.Vector3(x, -4, z));
        x+=Math.random() * Math.random();
        z+=12;
        path.add( new YUKA.Vector3(x, -4, z));
        x+=2;
        z+=22;

        path.add( new YUKA.Vector3(x, -4, z));
        x+=2;
        z+=32;

        path.add( new YUKA.Vector3(x, -4, z));
        x+=2;
        z+=42;

        path.add( new YUKA.Vector3(x, -4, z));
        x+=2;
        z+=52;

        path.add( new YUKA.Vector3(x, -4, z));
        x+=2;
        z+=-2;

        path.add( new YUKA.Vector3(x, -4, z));
        x+=2;
        z+=-20;

        path.add( new YUKA.Vector3(x, -4, z));
        if (i%2 == 0){
          x+=z * x + Math.random();
          z-=x * z - Math.random();
        }
        else{
          x-=z -Math.random() * x;
          z+=x + Math.random() * z;
        }


      }
      
      path.loop = true;

  
    vehicle.position.copy(path.current());
  
    vehicle.maxspeed = 5;
  
    const followPathBehavior = new YUKA.FollowPathBehavior(path, 0.5);
    vehicle.steering.add(followPathBehavior);
  
    const onPathBehavior = new YUKA.OnPathBehavior(path, 0.5);
    onPathBehavior.radius = 2;
    vehicle.steering.add(onPathBehavior);
  
    entityManager.add(vehicle);
  
  }


});
    




// BrownFish
let mixer3;
const Fishloader4 = new GLTFLoader();

Fishloader4.load('model/TuneFish.glb',function(glb){
    const model = glb.scene;
    const clips = glb.animations;
    
    const fishes = new THREE.AnimationObjectGroup();
    mixer3 = new THREE.AnimationMixer(fishes);
    const clip = THREE.AnimationClip.findByName(clips,'TunaSwim');
    const action = mixer3.clipAction(clip);
    action.play();
    
    var v1 = 5740;
    var v2 = 218;
    // 1
    for(let i=0;i<15;i++){
        //const vehicleM = new THREE.Mesh()
        const vehicle = new YUKA.Vehicle();
        const path = new YUKA.Path();
        const fishClone = SkeletonUtils.clone(model);
        
        fishClone.position.z = 200;
        fishClone.matrixAutoUpdate = false;
        // fishClone.position.x = Math.random()*5;
        // fishClone.position.z = Math.random()*5;
        scene.add(fishClone);
        fishes.add(fishClone);
        document.addEventListener('click', onMouseClick, false);

        function onMouseClick(event){
            const mouse = new THREE.Vector2();
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
          // Raycasting to check if the mouse click intersects with the cube
            const raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(mouse, camera);
            
            intersects = raycaster.intersectObject(fishClone);
    
            if (intersects.length > 0){
              fishCollectionCount += 1;
              fishc_s = String(fishCollectionCount);
              scene.remove(fishClone);
              displayRandomPopup("You catched ".concat(fishc_s, " fish"), 'popup', 'popupText', 5000);              
  
                
            }
    
        }
          

        vehicle.setRenderComponent(fishClone,sync);
        
        vehicle.position.x = Math.random()* v1 + v2;
        vehicle.position.z = -Math.random()* v1 - v2;
        if (i%2==0){
          var x = -10 * Math.random() * -5;
          var z = 4 - Math.random() * 25;
        }
        else{
          var x = 40 - Math.random() * 25;
          var z = -170 * Math.random() * -5;

        }
        
        for (let j = 0; j<9; j++){

          path.add( new YUKA.Vector3(x, -4, z));
          x+=Math.random() * Math.random();
          z+=12;
          path.add( new YUKA.Vector3(x, -4, z));
          x+=2;
          z+=22;

          path.add( new YUKA.Vector3(x, -4, z));
          x+=2;
          z+=32;

          path.add( new YUKA.Vector3(x, -4, z));
          x+=2;
          z+=42;

          path.add( new YUKA.Vector3(x, -4, z));
          x+=2;
          z+=52;

          path.add( new YUKA.Vector3(x, -4, z));
          x+=2;
          z+=-2;

          path.add( new YUKA.Vector3(x, -4, z));
          x+=2;
          z+=-20;

          path.add( new YUKA.Vector3(x, -4, z));
          if (i%2 == 0){
            x+=z * x + Math.random();
            z-=x * z - Math.random();
          }
          else{
            x-=z -Math.random() * x;
            z+=x + Math.random() * z;
          }


        }
        
        path.loop = true;

    
      vehicle.position.copy(path.current());
    
      vehicle.maxspeed = 5;
    
      const followPathBehavior = new YUKA.FollowPathBehavior(path, 0.5);
      vehicle.steering.add(followPathBehavior);
    
      const onPathBehavior = new YUKA.OnPathBehavior(path, 0.5);
      onPathBehavior.radius = 2;
      vehicle.steering.add(onPathBehavior);
    
      entityManager.add(vehicle);
    
    }
    // 2
    for(let i=0;i<5;i++){
      //const vehicleM = new THREE.Mesh()
      const vehicle = new YUKA.Vehicle();
      const path = new YUKA.Path();
      const fishClone = SkeletonUtils.clone(model);
      
      fishClone.position.z = 100;
      fishClone.matrixAutoUpdate = false;
      // fishClone.position.x = Math.random()*5;
      // fishClone.position.z = Math.random()*5;
      scene.add(fishClone);
      fishes.add(fishClone);
      
      document.addEventListener('click', onMouseClick, false);

      function onMouseClick(event){
          const mouse = new THREE.Vector2();
          mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
          mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  
        // Raycasting to check if the mouse click intersects with the cube
          const raycaster = new THREE.Raycaster();
          raycaster.setFromCamera(mouse, camera);
          
          intersects = raycaster.intersectObject(fishClone);
  
          if (intersects.length > 0){
            fishCollectionCount += 1;
            fishc_s = String(fishCollectionCount);
            scene.remove(fishClone);
            displayRandomPopup("You catched ".concat(fishc_s, " fish"), 'popup', 'popupText', 5000);              

              
          }
  
      }

      vehicle.setRenderComponent(fishClone,sync);
      
      vehicle.position.x = Math.random()* v1 + v2;
      vehicle.position.z = -Math.random()* v1 - v2;
      if (i%2==0){
        var x = -200 * Math.random() * -5;
        var z = 70 - Math.random() * 25;
      }
      else{
        var x = 550 - Math.random() * 25;
        var z = 17 * Math.random() * -5;

      }
      
      for (let j = 0; j<9; j++){

        path.add( new YUKA.Vector3(x, -4, z));
        x+=Math.random() * Math.random();
        z+=12;
        path.add( new YUKA.Vector3(x, -4, z));
        x+=2;
        z+=22;

        path.add( new YUKA.Vector3(x, -4, z));
        x+=2;
        z+=32;

        path.add( new YUKA.Vector3(x, -4, z));
        x+=2;
        z+=42;

        path.add( new YUKA.Vector3(x, -4, z));
        x+=2;
        z+=52;

        path.add( new YUKA.Vector3(x, -4, z));
        x+=2;
        z+=-2;

        path.add( new YUKA.Vector3(x, -4, z));
        x+=2;
        z+=-20;

        path.add( new YUKA.Vector3(x, -4, z));
        if (i%2 == 0){
          x+=z * x + Math.random();
          z-=x * z - Math.random();
        }
        else{
          x-=z -Math.random() * x;
          z+=x + Math.random() * z;
        }


      }
      
      path.loop = true;

  
    vehicle.position.copy(path.current());
  
    vehicle.maxspeed = 5;
  
    const followPathBehavior = new YUKA.FollowPathBehavior(path, 0.5);
    vehicle.steering.add(followPathBehavior);
  
    const onPathBehavior = new YUKA.OnPathBehavior(path, 0.5);
    onPathBehavior.radius = 2;
    vehicle.steering.add(onPathBehavior);
  
    entityManager.add(vehicle);
  
  }


});



export let new_c_model;
let boatMixer;

const loader = new GLTFLoader();
loader.load( 'model/animatedBoat.glb', function ( glb ) {
  model = glb.scene;
  
  model.position.y = 0.4;
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
    

 export const boatBody = new CANNON.Body({
     mass: 1,
     shape: new CANNON.Box(new CANNON.Vec3(2,2,4)),
     position: new CANNON.Vec3(container.position.x, container.position.y, container.position.z),
     material: BoatPhysMat,
     
   
     
 });

 world.addBody(boatBody);


const vehicle2 = new YUKA.Vehicle();
const path2 = new YUKA.Path();

 export let c_model;
 let character_mixer;

 function characterLoading(x, y, z, y_rotate){

 
 const characterLoader = new GLTFLoader();
 characterLoader.load('model/animatingCharacter.glb', function (glb){
   c_model = glb.scene;
   c_model.scale.set(0.2,0.2,0.2);
   c_model.rotateY(y_rotate);
   c_model.position.y = 0.5;
   c_model.name = "characterModel";
   const charcterClips = glb.animations;
   character_mixer = new THREE.AnimationMixer(c_model);
   const c_clip = THREE.AnimationClip.findByName(charcterClips, 'boatIdle');
   const c_action = character_mixer.clipAction(c_clip);
   c_action.play();
   console.log(charcterClips);
  
   container.add(c_model);
 });
 }

let x,y,z;
let y_rotate = 0.1;
if (container){
  x = container.position.x;
  y = container.position.y;
  z = container.position.z;
}

characterLoading(x, 0.5, z, y_rotate) ;


// Shark Body 
const SharkPhysMat = new CANNON.Material();
    

const sharkBody = new CANNON.Body({
    mass: 1,
    shape: new CANNON.Box(new CANNON.Vec3(2,2,4)),
    position: new CANNON.Vec3(0,-2.5,-45),
    material: SharkPhysMat,
                 
});


sharkBody.velocity.set(0,0,0);
world.addBody(sharkBody);


let s_clips;
let sharkModel;
let sharkMixer;


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



const groundSharkContactMat = new CANNON.ContactMaterial(
    groundPhysMat,
    SharkPhysMat,
    {friction : 0.05}
);



world.addContactMaterial(groundSharkContactMat);




const timeStep = 1 / 60;


export function container_position(container, camera){
  if (typeof (Storage) !== undefined){

    
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
    // sessionStorage.setItem('container', JSON.stringify(positions));
    sessionStorage.setItem('camera', JSON.stringify(camera_position));
    sessionStorage.setItem('rotate_x', container.rotation.x);
    sessionStorage.setItem('rotate_y', container.rotation.y);
    sessionStorage.setItem('rotate_z', container.rotation.z);
    sessionStorage.setItem('container_x', container.position.x);
    sessionStorage.setItem('container_y', container.position.y);
    sessionStorage.setItem('container_z', container.position.z);
  }  
  
  
}


var collision_flag = 0,new_island=0;



var attacked_flag = 0;
var reached_island_flag = 0;

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
            scene.remove(sharkModel);
            world.removeBody(sharkBody);

            reached_island_flag = 1;
            //console.log('collision detected...');
            collision_flag = 1;
            
       
            boatBody.velocity.set(0, 0, 0);

            // Move the boat slightly away from the island based on collision normal
            const collisionNormal = contact.ni.clone();
            const separationDistance = 0.1; // Adjust this value as needed
            boatBody.position.vadd(collisionNormal.scale(separationDistance), boatBody.position);
            movingForward = false;
           
          }
          else if (
            (contact.bi === sharkBody && contact.bj === boatBody) ||
            (contact.bi === boatBody && contact.bj === sharkBody)
        ) {
            // container.remove(c_model);
            // console.log("collision detected... ");
            attacked_flag = 1;
            let force = new CANNON.Vec3(-3, -0.1, -container.position.z);
            sharkBody.velocity.set(0, 0, 0);
        //     // Move the boat slightly away from the island based on collision normal
            const collisionNormal = contact.ni.clone();
            const separationDistance = 0.1; // Adjust this value as needed
            sharkBody.position.vadd(collisionNormal.scale(separationDistance), sharkBody.position);
            movingForward = false;
            // alert('You are been attacked by shark... ');
            world.removeBody(boatBody);
            // alert('You have lost the game... ');
           
          }
          
    }
   
}

const cannonDebugger = new CannonDebugger(scene, world);

  
let flag = 0;
const time = new YUKA.Time();

let new_model_loaded_flag = 0;
export function callback(){
const animate = function () {
  
  requestAnimationFrame( animate ); 
  // cannonDebugger.update();
  const clockDelta = clock.getDelta();
  if (vehicle2 && path2){
    vehicle2.maxSpeed = 45;
    path2.loop = false;
  }
  world.step(timeStep);

  boatBody.position.y = 0.5;
  sharkBody.position.y = -2.5;
  sharkBody.position.x = container.position.x;

  if (barrel_pickup_flag){
    displayRandomPopup("Hurray!! you found a fishing Rod !! Start collecting fish",'popup', 'popupText', 5000); 
   
    
    
    const rodLoading = new GLTFLoader();
    
    rodLoading.load('model/animatingCharacter_2.glb', function (glb){

      new_c_model = glb.scene;
      new_c_model.scale.set(0.2,0.2,0.2);
      new_c_model.rotateY(0.1);
      new_c_model.position.y = 0.5;
      new_c_model.name = "newCharacterModel";
      const charcterClips = glb.animations;
      console.log(charcterClips);
      character_mixer = new THREE.AnimationMixer(new_c_model);
      const c_clip = THREE.AnimationClip.findByName(charcterClips, "fishingRod");
      const c_action = character_mixer.clipAction(c_clip);
      c_action.play();
      
      container.remove(c_model);
      container.add(new_c_model);
      new_model_loaded_flag = 1;

      const new_model_obj = {
        loaded : true,
      };

      sessionStorage.setItem("new_model", JSON.stringify(new_model_obj));
      


    });
    barrel_pickup_flag = 0;
  }
  if (fishCollectionCount == 2){
    displayRandomPopup("Shark is coming behind go to island soon !!!",'popup', 'popupText', 5000);     
    container.remove(new_c_model);
    new_c_model = undefined;
    characterLoading(container.position.x, 0.5, container.position.z, 0.1);
    fishCollectionCount = -1;
    const SharkLoader = new GLTFLoader();
    SharkLoader.load('model/shark.glb', function (glb){
     sharkModel = glb.scene;
   //   sharkModel.matrixAutoUpdate = false;
     sharkModel.position.y = -2.5;
     sharkModel.position.z = -45;
     sharkModel.scale.set(0.8,0.8,0.8);
     s_clips = glb.animations;
     sharkMixer = new THREE.AnimationMixer(sharkModel);
   //   console.log(s_clips);
   //   const clips = ['swimming', 'bite'];
       
       const s_clip = THREE.AnimationClip.findByName(s_clips,'swimming');
       const s_action = sharkMixer.clipAction(s_clip);
       s_action.play();
 

   
     scene.add(sharkModel);

     
   


   
   
     
       


       vehicle2.maxSpeed = 4;
       for (let j=0; j<70; j++){
           
         path2.add(new YUKA.Vector3(container.position.x, -2.5, z));
         z += 0.01;

       }

       
     
     
       
       
   
 
   vehicle2.position.copy(path2.current());
       
   // vehicle.maxspeed = 15;
 
   const followPathBehavior = new YUKA.FollowPathBehavior(path2, 0.5);
   vehicle2.steering.add(followPathBehavior);
 
   const onPathBehavior = new YUKA.OnPathBehavior(path2, 0.5);
   onPathBehavior.radius = 2;
   vehicle2.steering.add(onPathBehavior);
 
   entityManager.add(vehicle2);



    });


  }
  if(mixer){
      mixer.update(clockDelta);
  }
  if (mixer2){
      mixer2.update(clockDelta);
  }
  if (mixer3){
    mixer3.update(clockDelta);
  }
  if (boatMixer){
    boatMixer.update(clockDelta);
  }
  if (character_mixer){
    character_mixer.update(clockDelta);
  }
  if (sharkMixer){
    sharkMixer.update(clockDelta);
  }
  const delta = time.update().getDelta();
  entityManager.update(delta);
  if (sharkModel && container){
    sharkModel.position.x = container.position.x;
    z += 0.45;
    const s_clip = THREE.AnimationClip.findByName(s_clips,'bite');
    const s_action = sharkMixer.clipAction(s_clip);
    s_action.play();
    
    // console.log(vehicle.maxSpeed);
    path2.add(new YUKA.Vector3(0,-2.5,z));
    

    // sharkModel.position.copy(entityManager.entities[0].position);
    sharkModel.position.z = z;
    // console.log(sharkModel.position.z);
    sharkBody.position.z = sharkModel.position.z;
    
}

  if(movingForward) {
    // Get the X-Z plane in which camera is looking to move the player
    camera.getWorldDirection(tempCameraVector);
    const cameraDirection = tempCameraVector.setY(0).normalize();
    
    // // Get the X-Z plane in which player is looking to compare with camera
    model.getWorldDirection(tempModelVector);
    if (new_c_model){
      new_c_model.getWorldDirection(tempCameraVector2);  
    }
    else{

    
      c_model.getWorldDirection(tempCameraVector2);

    }
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
    if (new_c_model){
      new_c_model.rotateY(
        Math.max(-0.05, Math.min(sanitisedAngle, 0.05))  
    )
  
    }
    else{
      c_model.rotateY(
        Math.max(-0.05, Math.min(sanitisedAngle, 0.05))  
      )
    }
    sessionStorage.setItem('model_rotate_w', model.rotation.y);
    
    
    
    container.position.add(cameraDirection.multiplyScalar(0.5));    
    camera.lookAt(container.position.clone().add(cameraOrigin));
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
    if (new_c_model){
      new_c_model.getWorldDirection(tempCameraVector2);  
    }
    else{

    
      c_model.getWorldDirection(tempCameraVector2);

    }

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
    if (new_c_model){
      new_c_model.rotateY(
        Math.max(-0.05, Math.min(sanitisedAngle, 0.05))  
    )
  
    }
    else{
      c_model.rotateY(
        Math.max(-0.05, Math.min(sanitisedAngle, 0.05))  
      )
    }
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

  if (attacked_flag){
      
      container.remove(c_model);
      world.removeBody(sharkBody);
      // alert('You are been attacked by shark... ');
      displayRandomPopup("You are been attacked by Shark !!",'popup', 'popupText', 5000);       
      scene.remove(sharkModel);

      movingForward = false;
      movingBackward = false;
      movingRight = false;
      movingLeft = false;
      attacked_flag = 0;
      setTimeout(()=>{
        window.location.href = './fishrodPicking.html';
      }, 2000);

      
      

  }
  if(reached_island_flag){
      // alert('You have been safely reached to the island... ');
      
      world.removeBody(boatBody);
      reached_island_flag = 0;
      window.location.href = "./Survivaljs.html";
  }  
  // console.log(container.rotation.x, container.rotation.y, container.rotation.z);
  water.material.uniforms[ 'time' ].value += 0.5 / 60.0;
  renderer.render( scene, camera );
};

animate();

}

callback();






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
      container_position(container, camera);
      eventStat = 0;
      window.location.href = './GamePlay_Pause.html';
      
        
    }
}
});


// Key and mouse events
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



window.addEventListener("pointermove", (e) => {
  
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
  
});

