import * as THREE from "../mrdoob-three.js/build/three.module.js";
import { OrbitControls } from "../mrdoob-three.js/build/OrbitControls.js";
import { GLTFLoader } from '../mrdoob-three.js/build/GLTFLoader.js';
import { Water } from '../mrdoob-three.js/build/Water.js';
import { Sky } from '../mrdoob-three.js/build/Sky.js';
import * as YUKA from './yuka-master/build/yuka.module.js';
import * as SkeletonUtils from '../mrdoob-three.js/build/SkeletonUtils.js';
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



sun = new THREE.Vector3();

    // Water

    const waterGeometry = new THREE.PlaneGeometry( 10000, 10000 );

    water = new Water(
        waterGeometry,
        {
            textureWidth: 512,
            textureHeight: 512,
            waterNormals: new THREE.TextureLoader().load( 'waternormals.jpg', function ( texture ) {

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
let model, fishModel, skeleton, mixer,fishMixer,  clock, numAnimations = 0,
  movingForward = false, mousedown = false, island,model2;

let movingLeft = false, movingRight = false, movingBackward = false;

clock = new THREE.Clock();

const entityManager = new YUKA.EntityManager();

function sync(entity, renderComponent){
  renderComponent.matrix.copy(entity.worldMatrix);
}

const islandLoader = new GLTFLoader();
islandLoader.load('./assets/island.glb', function(glb){
  island = glb.scene;
  island.scale.set(1,0.5,1);
  island.position.z = 465;
  island.position.y = 2;
  scene.add(island);
});


var boatPos = 0;


const loader = new GLTFLoader(),loader2 = new GLTFLoader();
loader.load( './assets/boat_embedded.gltf', function ( gltf ) {
  model = gltf.scene;
  
  model.position.y = 0.15;
  container.add(model);
  model.traverse( function ( object ) { 
    if ( object.isMesh ) {
      object.castShadow = true;
    
    }   
  });
 });
 loader2.load( './assets/character.gltf',(gltf)=>{
  model2 = gltf.scene;
  model2.scale.set(0.4,0.4,0.4)
  model2.rotateY(7.2);
  model2.position.x = -1.8;
  model2.position.y = 0.18;
  model2.position.z = 1.6;
  container.add(model2);
  model2.traverse( (object )=> { 
    if ( object.isMesh ) {
      object.castShadow = true;
    
    }   
  });
 });
 var barrelModel;
 function barrelsLoading(){
  const barrelLoader = new GLTFLoader();
  barrelLoader.load('./assets/barrel.glb', function (glb){
      barrelModel = glb.scene;
      barrelModel.position.z = 5;
      barrelModel.position.x = 100;
      barrelModel.rotation.set(1,2,0.5);
      let x = -100;
      let z = 500;
      let randomX = Math.random();
      let randomZ = Math.random();
      for (let i=0; i<36; i++){
        const barrelClone = SkeletonUtils.clone(barrelModel);

        if (i % 2 == 0){

        
          barrelClone.position.z -= randomZ;
          barrelClone.position.x += randomX;
          
          randomZ = Math.random() * 100 + 100;
          randomX = Math.random() * 50 + 100;
          x += Math.random()*Math.PI *345 ;
          z += Math.random() * 556 + Math.PI;
          
        }
        else{
          barrelClone.position.z -= randomZ;
          barrelClone.position.x -= randomX;
          
          randomZ = Math.random() * 400 - 1000;
          randomX = Math.random() * 200 - 1000;
          x -= Math.random()*Math.PI *340 ;
          z -= Math.random() * 516 + Math.PI;

        }
        console.log(barrelClone.position.z);
        scene.add(barrelClone);
      }

      
  });
  
}

barrelsLoading();






const Fishloader = new GLTFLoader();


// 2
  

Fishloader.load('./assets/TuneFish.glb',function(glb){
  const model = glb.scene;
  const clips = glb.animations;
  
  const fishes = new THREE.AnimationObjectGroup();
  mixer = new THREE.AnimationMixer(fishes);
  const clip = THREE.AnimationClip.findByName(clips,'TunaSwim');
  const action = mixer.clipAction(clip);
  action.play();
  
  var v1 = 3589;
  var v2 = 5536;
  for(let i=0;i<15;i++){
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

  var v1 = 1008;
  var v2 = 25103;
  for(let i=0;i<5;i++){
    
      const vehicle = new YUKA.Vehicle();
      const path = new YUKA.Path();
      const fishClone = SkeletonUtils.clone(model);
      fishClone.position.z = 200;
      fishClone.matrixAutoUpdate = false;
     
      scene.add(fishClone);
      fishes.add(fishClone);
      
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
  var v1 = -4665;
  var v2 = 8045;
  for(let i=0;i<25;i++){
    
      const vehicle = new YUKA.Vehicle();
      const path = new YUKA.Path();
      const fishClone = SkeletonUtils.clone(model);
      fishClone.position.z = 250;
      fishClone.matrixAutoUpdate = false;
     
      scene.add(fishClone);
      fishes.add(fishClone);
      
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

Fishloader3.load('./assets/TuneFish.glb',function(glb){
    const model = glb.scene;
    const clips = glb.animations;
    
    const fishes = new THREE.AnimationObjectGroup();
    mixer = new THREE.AnimationMixer(fishes);
    const clip = THREE.AnimationClip.findByName(clips,'TunaSwim');
    const action = mixer.clipAction(clip);
    action.play();
    
    var v1 = 3785;
    var v2 = 21257;
    for(let i=0;i<15;i++){
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
        

        vehicle.setRenderComponent(fishClone,sync);
        
        vehicle.position.x = Math.random()* v1 + v2;
        vehicle.position.z = -Math.random()* v1 - v2;
        if (i%2==0){
          var x = 2.5 * Math.random() * -5;
          var z = 2.5 - Math.random() * 25;
        }
        else{
          var x = 2.5 - Math.random() * 25;
          var z = 2.5 * Math.random() * -5;

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
    
    var v1 = 4200;
    var v2 = 16770;
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
        
        vehicle.setRenderComponent(fishClone,sync);
        vehicle.position.x = Math.random()* v1 + v2;
        vehicle.position.z = -Math.random()* v1 - v2;
        if (i%2==0){
          var x = 2.5 + Math.random() * 15;
          var z = 2.5 - Math.random() * 15;
        }
        else{
          var x = 2.5 - Math.random() * 15;
          var z = 2.5 + Math.random() * 15;

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
            x-=z * Math.random();
            z+=x * Math.random();
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
  
    var v1 = -1000;
    var v2 = 1146;
    for(let i=0;i<5;i++){
      
        const vehicle = new YUKA.Vehicle();
        const path = new YUKA.Path();
        const fishClone = SkeletonUtils.clone(model);
        fishClone.position.z = 200;
        fishClone.matrixAutoUpdate = false;
       
        scene.add(fishClone);
        fishes.add(fishClone);
        
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
    var v1 = 5780;
    var v2 = 3990;
    for(let i=0;i<25;i++){
      
        const vehicle = new YUKA.Vehicle();
        const path = new YUKA.Path();
        const fishClone = SkeletonUtils.clone(model);
        fishClone.position.z = 250;
        fishClone.matrixAutoUpdate = false;
       
        scene.add(fishClone);
        fishes.add(fishClone);
        
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

// 4
  

const time = new YUKA.Time();

const animate = function () {
  
    
  requestAnimationFrame( animate );
  for ( let i = 0; i < numAnimations; i++ ) {
    const action = allActions[ i ];
    const clip = action.getClip();
    const settings = baseActions[clip.name];
    // settings.weight = action.getEffectiveWeight();
  }

  const clockDelta = clock.getDelta();
     
  if(mixer){
      mixer.update(clockDelta);
  }
  const delta = time.update().getDelta();
  entityManager.update(delta);
  
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
    // model2.translateY(0.02);

  }
  else if (movingRight){

    container.rotateY(-0.02);
    // model2.translateY(-0.02);
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
 


    container.position.add(cameraDirection.multiplyScalar(-1.5));
    camera.lookAt(container.position.clone().add(cameraOrigin));
   
  }

  
  water.material.uniforms[ 'time' ].value += 2.0 / 60.0;
  renderer.render( scene, camera );
};

animate();
console.log(container);
// Key and mouse events
window.addEventListener("keydown", (e) => {
  const { event } = e;
  if(e.code === 'KeyW') {
   
    
    movingForward = true;
    boatPos += 5;
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
    const phi = offset.phi - movementY * 0.02;
    offset.theta -= movementX * 0.02;
    offset.phi = Math.max(0.01, Math.min(0.35 * Math.PI, phi));
    camera.position.copy(
      cameraOrigin.clone().add(new THREE.Vector3().setFromSpherical(offset))
    );
    camera.lookAt(container.position.clone().add(cameraOrigin));
  }
});