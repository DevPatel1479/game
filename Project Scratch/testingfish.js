import * as THREE from './mrdoob-three.js/build/three.module.js';
import { GLTFLoader } from './mrdoob-three.js/build/GLTFLoader.js';
// import {FBXLoader} from  "./mrdoob-three.js/build/FBXLoader.js";
import { OrbitControls } from './mrdoob-three.js/build/OrbitControls.js';
import { Water } from './mrdoob-three.js/build/Water.js';
import { Sky } from './mrdoob-three.js/build/Sky.js';
// import { OBJLoader } from './mrdoob-three.js/build/OBJLoader.js';  

let container, stats;
let camera, scene, renderer;
let controls, water, sun, model, animations, numAnimations = 0, mixer; 
// clock = new THREE.Clock();





init();
animate();

function init() {

    container = document.getElementById( 'container' );

    //

    renderer = new THREE.WebGLRenderer();

    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );

    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.5;
    renderer.gammaOutput = true;
    document.body.appendChild( renderer.domElement );

    //

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera( 55, window.innerWidth / window.innerHeight, 1, 20000 );
    camera.position.set( 30, 30, 100 );

    //
    camera.lookAt(scene.position);
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
    
    //
    
    let clock = new THREE.Clock();

    const loader = new GLTFLoader();
        loader.load( './assets/TuneFish.glb', function ( gltf ) {
            
            // var texture = new THREE.TextureLoader().load('model/img30.jpg');

            
           
            // var material = new THREE.MeshBasicMaterial({color : 'blue'});
            // obj.traverse(function (child){
            //     if (child.isMesh){
            //         child.material = material;
            //     }
            // });

            model = gltf.scene;
            model.scale.set(3,3,3);
            model.position.y = -12;
            model.traverse( function ( object ) {
                if ( object.isMesh ) {
                  object.castShadow = true;
                }   
              });
            scene.add(model);
            const clips = gltf.animations;
            mixer = new THREE.AnimationMixer( model );
            const clip = THREE.AnimationClip.findByName(clips, 'TunaSwim');
            const action = mixer.clipAction(clip);
            action.play();
           
           

          
    });
    
    

    // const geometry = new THREE.BoxGeometry( 30, 30, 30 );
    // const material = new THREE.MeshStandardMaterial( { roughness: 0 } );

    // mesh = new THREE.Mesh( geometry, material );
    // scene.add( mesh );

    //
    const directionLight = new THREE.DirectionalLight(0xcbab10, 2);
    directionLight.position.set(1,1,1);

    // scene.add(directionLight);

    const pointerLight = new THREE.PointLight(0xfff, 10, 0);
    pointerLight.position.set(1,0,-2);
    // scene.add(pointerLight);

    // const directionLight2 = new THREE.DirectionalLight(0xffffff,100);
    // directionLight2.position.set(-10,0,0);
    
    // scene.add(directionLight);
    // const directionLight3 = new THREE.DirectionalLight(0xfff,100);
    // directionLight3.position.set(20,1,-4);
    
    // scene.add(directionLight);

    controls = new OrbitControls( camera, renderer.domElement );
    controls.maxPolarAngle = Math.PI * 0.495;
    controls.target.set( 0, 2, 2 );
    controls.minDistance = 40.0;
    controls.maxDistance = 200.0;
    controls.update();

    //

    // stats = new Stats();
    // container.appendChild( stats.dom );

    // GUI

    // const gui = new GUI();

    // const folderSky = gui.addFolder( 'Sky' );
    // folderSky.add( parameters, 'elevation', 0, 90, 0.1 ).onChange( updateSun );
    // folderSky.add( parameters, 'azimuth', - 180, 180, 0.1 ).onChange( updateSun );
    // folderSky.open();

    // const waterUniforms = water.material.uniforms;

    // const folderWater = gui.addFolder( 'Water' );
    // folderWater.add( waterUniforms.distortionScale, 'value', 0, 8, 0.1 ).name( 'distortionScale' );
    // folderWater.add( waterUniforms.size, 'value', 0.1, 10, 0.1 ).name( 'size' );
    // folderWater.open();

    //


    window.addEventListener( 'resize', onWindowResize );

}

function onWindowResize() {

    // camera.aspect = window.innerWidth / window.innerHeight;
    // camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}



// function objectMoving(){

//     addEventListener("keypress", function (event){

//         if (event.code === 'KeyW'){
//             model.position.z += 0.001;
//         }
//         else if (event.code === 'KeyS'){
//             model.position.z -= 0.001;
//         }
//         else if (event.code === 'KeyA'){
//             model.position.x -= 0.001;
//         }
//         else if (event.code === 'KeyD'){
//             model.position.x += 0.001;
//         }
    

//     });
// }


console.log(camera.position);

let clock = new THREE.Clock();
function animate() {
   
    requestAnimationFrame( animate );
    // for ( let i = 0; i < numAnimations; i++ ) {
    //     const action = allActions[ i ];
    //     const clip = action.getClip();
    //     // console.log(clip);
        
    //     const settings = baseActions[clip.name];
    //     settings.weight = action.getEffectiveWeight();
    //   }
      if(mixer) {
        const mixerUpdateDelta = clock.getDelta();
        mixer.update( mixerUpdateDelta );
      }
    
    render();


}


function render() {

    // const time = performance.now() * 0.001;

    // mesh.position.y = Math.sin( time ) * 20 + 5;
    // mesh.rotation.x = time * 0.5;
    // mesh.rotation.z = time * 0.51;

    water.material.uniforms[ 'time' ].value += 2.0 / 60.0;

    renderer.render( scene, camera );

}


window.addEventListener('keydown', function (e)  {
   
});