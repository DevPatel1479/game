import * as THREE from "../mrdoob-three.js/build/three.module.js";
import { GLTFLoader } from './mrdoob-three.js/build/GLTFLoader.js';
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

const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.01, 1000 );
camera.position.set( 0, 2, -7 );
const cameraOrigin = new THREE.Vector3(0, 1.5, 0);
camera.lookAt(cameraOrigin);
container.add(camera);

// Model and animation actions
let fishModel, skeleton, mixer,fishMixer,  clock, numAnimations = 0,
    movingForward = false, mousedown = false, fishMixer2, fishModel2;

let movingLeft = false, movingRight = false, movingBackward = false;

clock = new THREE.Clock();
let clock2 = new THREE.Clock();

const tunaFishesLoaders = [],tunaFishesModels=[],tunaFishesClips=[],
tunaFishesClip = [],tunaFishesMixer = [], tunaFishesAction = [];
let x = 10;
for(let i=0;i<5;i++){
const fishLoader = new GLTFLoader();
tunaFishesLoaders[i] = fishLoader;
tunaFishesLoaders[i].load('./assets/TuneFish.glb', function ( gltf ){

    fishModel = gltf.scene;
    fishModel.scale.set(0.8,0.8,0.8);
    fishModel.position.z = Math.random()*50;
    fishModel.position.y = -3;
    fishModel.traverse( function ( object ) {
      if ( object.isMesh ) {
          object.castShadow = true;
      }
      tunaFishesModels[i] = fishModel;
    });
    scene.add(tunaFishesModels[i]);
    console.log(tunaFishesModels[i]);
    console.log(tunaFishesLoaders[i]);
    const Fclips = gltf.animations;
    tunaFishesClips[i] = Fclips;
    fishMixer = new THREE.AnimationMixer( tunaFishesModels[i] );
    tunaFishesMixer[i] = fishMixer;
    const Fclip = THREE.AnimationClip.findByName(tunaFishesClips[i], 'TunaSwim');
    tunaFishesClip[i] = Fclip;
    const Faction = fishMixer.clipAction(tunaFishesClip[i]);
    tunaFishesAction[i] = Faction;
    tunaFishesAction[i].play();
  });
  x += 1;
}
const fishLoader2 = new GLTFLoader();
fishLoader2.load('./assets/clownFish.glb', function ( gltf ){

    fishModel2 = gltf.scene;
    console.log(gltf.animations);
    fishModel2.scale.set(0.8,0.8,0.8);
    fishModel2.position.z = 4;
    fishModel2.position.y = -3;
    fishModel2.traverse( function ( object ) {
      if ( object.isMesh ) {
          object.castShadow = true;
      }   
    });
    scene.add(fishModel2);
    const Fclips2 = gltf.animations;
    fishMixer2 = new THREE.AnimationMixer( fishModel2 );
    // const Fclip2 = THREE.AnimationClip.findByName(Fclips2, 'TunaSwim');
    // const Faction2 = fishMixer2.clipAction(Fclip2);
    // Faction2.play();

});

var stop = 10;
var time = 0;
const animate = function () {
    

    
  requestAnimationFrame( animate );
  time += 0.1;
  if (fishMixer){
    const fishMixerUpdateDelta = clock.getDelta();
    fishMixer.update(fishMixerUpdateDelta);
    
  }
  if (fishMixer2){
    const fishMixerUpdateDelta2 = clock2.getDelta();
    fishMixer2.update(fishMixerUpdateDelta2);

  }
  if (fishModel){
    // if (time > stop){
    //     time = 0;
    //     fishModel.translateX(0.1);
    //     fishModel.rotateY(1);

    // }
    // else{
    //     // fishModel.position.z -= 0.1;
    // }
  }
  water.material.uniforms[ 'time' ].value += 2.0 / 60.0;  
  renderer.render(scene, camera);
}
animate();

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