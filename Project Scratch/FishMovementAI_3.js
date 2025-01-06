import * as THREE from "../mrdoob-three.js/build/three.module.js";
import * as YUKA from './yuka-master/build/yuka.module.js';
import { GLTFLoader } from '../mrdoob-three.js/build/GLTFLoader.js';
import * as SkeletonUtils from '../mrdoob-three.js/build/SkeletonUtils.js';
import { Water } from '../mrdoob-three.js/build/Water.js';
import { Sky } from '../mrdoob-three.js/build/Sky.js';

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
            waterNormals: new THREE.TextureLoader().load( '../textures/waternormals.jpg', function ( texture ) {

                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

            } ),
            sunDirection: new THREE.Vector3(),
            sunColor: 'YEllow',
            waterColor: '#09deed',
            distortionScale: 3.7,
            fog: scene.fog !== undefined,
            shininess: 1,
  		      color: 0x8ab39f,
		        transparent: true,
		        opacity: 0.4
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

const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.01, 1000 );
camera.position.set( 0, 2, -7 );
const cameraOrigin = new THREE.Vector3(0, 1.5, 0);
camera.lookAt(cameraOrigin);
container.add(camera);

// Model and animation actions
let fishModel, skeleton,fishMixer, mixer, numAnimations = 0,
    movingForward = false, mousedown = false, fishMixer2, fishModel2;

let movingLeft = false, movingRight = false, movingBackward = false;


const entityManager = new YUKA.EntityManager();

function sync(entity, renderComponent) {
    

    renderComponent.matrix.copy(entity.worldMatrix);
}




const loader = new GLTFLoader();

loader.load('assets/dory.glb',function(glb){
    const model = glb.scene;
    const clips = glb.animations;
    const fishes = new THREE.AnimationObjectGroup();
    mixer = new THREE.AnimationMixer(fishes);
    const clip = THREE.AnimationClip.findByName(clips,'TunaSwim');
    const action = mixer.clipAction(clip);
    action.play();
    
    var v1 = -35;
    var v2 = -45;
    for(let i=0;i<15;i++){
        //const vehicleM = new THREE.Mesh()
        const vehicle = new YUKA.Vehicle();
        const path = new YUKA.Path();
        const fishClone = SkeletonUtils.clone(model);
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
    
      vehicle.maxSpeed = 1;
    
      const followPathBehavior = new YUKA.FollowPathBehavior(path, 0.5);
      vehicle.steering.add(followPathBehavior);
    
      const onPathBehavior = new YUKA.OnPathBehavior(path, 0.5);
      onPathBehavior.radius = 2;
      vehicle.steering.add(onPathBehavior);
    
      entityManager.add(vehicle);
    
    }
    // 2
    var v1 = -400;
    var v2 = -70;
    for(let i=0;i<15;i++){
        //const vehicleM = new THREE.Mesh()
        const vehicle = new YUKA.Vehicle();
        const path = new YUKA.Path();
        const fishClone = SkeletonUtils.clone(model);
        fishClone.matrixAutoUpdate = false;
        // fishClone.position.x = Math.random()*5;
        // fishClone.position.z = Math.random()*5;
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
    
      vehicle.maxSpeed = 1;
    
      const followPathBehavior = new YUKA.FollowPathBehavior(path, 0.5);
      vehicle.steering.add(followPathBehavior);
    
      const onPathBehavior = new YUKA.OnPathBehavior(path, 0.5);
      onPathBehavior.radius = 2;
      vehicle.steering.add(onPathBehavior);
    
      entityManager.add(vehicle);
    
    }
    // 3
  
    var v1 = 1000;
    var v2 = 4000;
    for(let i=0;i<5;i++){
      
        const vehicle = new YUKA.Vehicle();
        const path = new YUKA.Path();
        const fishClone = SkeletonUtils.clone(model);
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
    
      vehicle.maxSpeed = 1;
    
      const followPathBehavior = new YUKA.FollowPathBehavior(path, 0.5);
      vehicle.steering.add(followPathBehavior);
    
      const onPathBehavior = new YUKA.OnPathBehavior(path, 0.5);
      onPathBehavior.radius = 2;
      vehicle.steering.add(onPathBehavior);
    
      entityManager.add(vehicle);
    
    }
    // 4
    var v1 = 2000;
    var v2 = -6000;
    for(let i=0;i<25;i++){
      
        const vehicle = new YUKA.Vehicle();
        const path = new YUKA.Path();
        const fishClone = SkeletonUtils.clone(model);
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
    
      vehicle.maxSpeed = 1;
    
      const followPathBehavior = new YUKA.FollowPathBehavior(path, 0.5);
      vehicle.steering.add(followPathBehavior);
    
      const onPathBehavior = new YUKA.OnPathBehavior(path, 0.5);
      onPathBehavior.radius = 2;
      vehicle.steering.add(onPathBehavior);
    
      entityManager.add(vehicle);
    
    }

})

const time = new YUKA.Time();
const clock = new THREE.Clock();

function animate(){
      const clockDelta = clock.getDelta();
     
      if(mixer){
          mixer.update(clockDelta);
      }
      const delta = time.update().getDelta();
      entityManager.update(delta);
      water.material.uniforms[ 'time' ].value += 1.0 / 60.0;
      renderer.render(scene,camera);
}
  
renderer.setAnimationLoop(animate);
  
window.addEventListener('resize',function(){
      camera.aspect = this.innerWidth/this.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(this.innerWidth,this.innerHeight);
})

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