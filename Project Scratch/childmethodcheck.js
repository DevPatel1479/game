import * as THREE from "./mrdoob-three.js/build/three.module.js";
import { GLTFLoader } from './mrdoob-three.js/build/GLTFLoader.js';
import { Water } from './mrdoob-three.js/build/Water.js';
import { Sky } from './mrdoob-three.js/build/Sky.js';
import * as SkeletonUtils from "./mrdoob-three.js/build/SkeletonUtils.js";

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
export const camera = new THREE.PerspectiveCamera
(75,window.innerWidth / window.innerHeight,0.01,1000);
camera.position.set( 0, 2, -7 );
export const cameraOrigin = new THREE.Vector3(0, 1.5, 0);
camera.lookAt(cameraOrigin);

container.add(camera);
let sun,water;
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
    let trees_rocks;
    
  const Chestloader = new GLTFLoader();
  Chestloader.load('model/chest.glb',function(glb){
    let chestmodel = glb.scene;
    chestmodel.name = "ChestModel";
    chestmodel.scale.set(1.5,1.5,1.5);
    chestmodel.position.set(-193,2,465);
    scene.add(chestmodel);
    console.log(chestmodel);
  });
  
    const Cloudloader =new GLTFLoader();
    Cloudloader.load('model/cloud1.glb', function (glb){
      const cloudmodel = glb.scene;
      // treemodel.scale.set(4, 4, 4);
      // treemodel.position.set(10,6,275);
      for (let i = 0; i < 100; i++) {
        let j = parseInt(Math.random()*8);
        const clonedModel = SkeletonUtils.clone(cloudmodel.children[j]);
        // console.log(clonedModel);
        // Set a unique name for each cloned tree model
        clonedModel.scale.set(20,Math.random()*10,20);
        clonedModel.name = "Cloud ".concat(String(i+1));
        clonedModel.position.y = 250;
        clonedModel.position.z = (Math.random()*2520);
        clonedModel.position.x = -(Math.random()*2520);
        clonedModel.rotateZ(0.2);
        scene.add(clonedModel);
      }
      for (let i = 100; i < 200; i++) {
        let j = parseInt(Math.random()*8);
        const clonedModel = SkeletonUtils.clone(cloudmodel.children[j]);
        // console.log(clonedModel);
        // Set a unique name for each cloned tree model
        clonedModel.scale.set(20,Math.random()*10,20);
        clonedModel.name = "Cloud ".concat(String(i+1));
        clonedModel.position.y = 250;
        clonedModel.position.z = (Math.random()*2520);
        clonedModel.position.x = (Math.random()*2520);
        clonedModel.rotateZ(0.2);
        scene.add(clonedModel);
      }
      for (let i = 200; i < 300; i++) {
        let j = parseInt(Math.random()*8);
        const clonedModel = SkeletonUtils.clone(cloudmodel.children[j]);
        // console.log(clonedModel);
        // Set a unique name for each cloned tree model
        clonedModel.scale.set(20,Math.random()*10,20);
        clonedModel.name = "Cloud ".concat(String(i+1));
        clonedModel.position.y = 250;
        clonedModel.position.z = -(Math.random()*2520);
        clonedModel.position.x = (Math.random()*2520);
        clonedModel.rotateZ(0.2);
        scene.add(clonedModel);
      }
      for (let i = 300; i < 400; i++) {
        let j = parseInt(Math.random()*8);
        const clonedModel = SkeletonUtils.clone(cloudmodel.children[j]);
        // console.log(clonedModel);
        // Set a unique name for each cloned tree model
        clonedModel.scale.set(20,Math.random()*10,20);
        clonedModel.name = "Cloud ".concat(String(i+1));
        clonedModel.position.y = 250;
        clonedModel.position.z = -(Math.random()*2520);
        clonedModel.position.x = -(Math.random()*2520);
        clonedModel.rotateZ(0.2);
        scene.add(clonedModel);
      }
    });

    export function animate() {
            
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