import * as THREE from "./mrdoob-three.js/build/three.module.js";
import * as YUKA from './yuka-master/build/yuka.module.js';
import { GLTFLoader } from './mrdoob-three.js/build/GLTFLoader.js';
import * as SkeletonUtils from './mrdoob-three.js/build/SkeletonUtils.js';
import { Water } from './mrdoob-three.js/build/Water.js';
import { Sky } from './mrdoob-three.js/build/Sky.js';

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
            waterNormals: new THREE.TextureLoader().load( 'waternormals.jpg', function ( texture ) {

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

const fishLoader = new GLTFLoader();
fishLoader.load('./assets/clownFish.glb', function ( glb ){
  const model = glb.scene;
  const clips = glb.animations;
  // console.log(clips);
  // const fishes = new THREE.AnimationObjectGroup();
  mixer = new THREE.AnimationMixer(model);
  const clip = THREE.AnimationClip.findByName(clips,'ClownFish');
  const action = mixer.clipAction(clip);
  action.play();
    
  model.matrixAutoUpdate = false;

  scene.add(model);
  const vehicle = new YUKA.Vehicle();
  vehicle.setRenderComponent(model, sync);
  vehicle.scale.set(0.5,0.5,0.5);
  vehicle.position.y = -10;
  const path = new YUKA.Path();

 


    path.add( new YUKA.Vector3(-4, -2, 4));
    path.add( new YUKA.Vector3(-6, -2, 0));
    path.add( new YUKA.Vector3(-4, -2, -4));
    path.add( new YUKA.Vector3(0, -2, 0));
    path.add( new YUKA.Vector3(4, -2, -4));
    path.add( new YUKA.Vector3(6, -2, 0));
    path.add( new YUKA.Vector3(4, -2, 4));
    path.add( new YUKA.Vector3(0, -2, 6));

  // path.add(new YUKA.Vector3(0,0,0));
  path.loop = true;

  vehicle.position.copy(path.current());

  vehicle.maxSpeed = 1;

  const followPathBehavior = new YUKA.FollowPathBehavior(path, 0.5);
  vehicle.steering.add(followPathBehavior);

  const onPathBehavior = new YUKA.OnPathBehavior(path, 0.5);
  onPathBehavior.radius = 2;
  vehicle.steering.add(onPathBehavior);

  entityManager.add(vehicle);
  });


  let mixer2;
  const fishLoader2 = new GLTFLoader();
  fishLoader2.load('./assets/brownFish.glb', function ( glb ){
    const model = glb.scene;
    const clips = glb.animations;
    // console.log(clips);
    // const fishes = new THREE.AnimationObjectGroup();
    mixer2 = new THREE.AnimationMixer(model);
    const clip = THREE.AnimationClip.findByName(clips,'BrownFish');
    const action = mixer2.clipAction(clip);
    action.play();
   
   
    
      
    model.matrixAutoUpdate = false;
  
    scene.add(model);
    const vehicle = new YUKA.Vehicle();
    vehicle.setRenderComponent(model, sync);
    vehicle.scale.set(0.5,0.5,0.5);
    vehicle.position.y = -10;
    const path = new YUKA.Path();
  
   
  
  
      path.add( new YUKA.Vector3(4, -2, -4));
      path.add( new YUKA.Vector3(6, -2, -6));
      path.add( new YUKA.Vector3(4, -2, 4));
      path.add( new YUKA.Vector3(0, -2, -0));
      path.add( new YUKA.Vector3(4, -2, 4));
      path.add( new YUKA.Vector3(6, -2, 0));
      path.add( new YUKA.Vector3(4, -2, 4));
      path.add( new YUKA.Vector3(-6, -2, 6));
  
    // path.add(new YUKA.Vector3(0,0,0));
    path.loop = true;
  
    vehicle.position.copy(path.current());
  
    vehicle.maxSpeed = 1;
  
    const followPathBehavior = new YUKA.FollowPathBehavior(path, 0.5);
    vehicle.steering.add(followPathBehavior);
  
    const onPathBehavior = new YUKA.OnPathBehavior(path, 0.5);
    onPathBehavior.radius = 2;
    vehicle.steering.add(onPathBehavior);
  
    entityManager.add(vehicle);
    });
    



  

  
  

  



const time = new YUKA.Time();
const clock = new THREE.Clock();
const clock2 = new THREE.Clock();  
function animate(){
      const clockDelta = clock.getDelta();
      const clockDelta2 = clock2.getDelta();
      if(mixer){
          mixer.update(clockDelta);
      }
      if (mixer2){
          mixer2.update(clockDelta2);
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