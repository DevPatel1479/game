import * as Island from './fishPickingUsingRod.js';

import * as THREE from '../mrdoob-three.js/build/three.module.js';
import { GLTFLoader } from '../mrdoob-three.js/build/GLTFLoader.js';
// import { displayRandomPopup } from './pop.js';

Island.initiatePopupCycle("Game Resumed !!", "Start your journey !!!", "Good to go!!");


const cam_obj = JSON.parse(sessionStorage.getItem('camera'));

console.log(cam_obj);


Island.camera.position.set(
    cam_obj.cam_x,
    cam_obj.cam_y,
    cam_obj.cam_z
);


const obj = JSON.parse(sessionStorage.getItem('container'));


// Island.container.position.set(
//     obj.x,
//     obj.y,
//     obj.z
// );



let x = parseFloat(sessionStorage.getItem('container_x'));
let y = parseFloat(sessionStorage.getItem('container_y'));
let z = parseFloat(sessionStorage.getItem('container_z'));



Island.container.position.set(
    x, 
    y, 
    z
);


Island.boatBody.position.set(
    x,
    y,
    z
);


let x_rotate = parseFloat(sessionStorage.getItem('rotate_x'));
let y_rotate = parseFloat(sessionStorage.getItem('rotate_y'));
let z_rotate = parseFloat(sessionStorage.getItem('rotate_z'));


Island.container.rotation.set(
    x_rotate,
    y_rotate,
    z_rotate
)

//  Island.boatBody.quaternion.copy(Island.container.quaternion);

const characterRodModel = JSON.parse(sessionStorage.getItem('new_model'));
let new_model, character_mixer, clock;
clock = new THREE.Clock();


if (Island.container.position.x == 0 && Island.container.position.y == 0 && Island.container.position.z == 0){

    Island.callback();
    Island.camera.lookAt(Island.container.position);
    
    
}

else{

    if (characterRodModel.loaded){
        const rodLoading = new GLTFLoader();
        
        rodLoading.load('model/animatingCharacter_2.glb', function (glb){
    
          new_model = glb.scene;
          new_model.scale.set(0.2,0.2,0.2);
          new_model.rotateY(0.1);
          new_model.position.y = 0.5;
          new_model.name = "characterModel";
          const charcterClips = glb.animations;
          console.log(charcterClips);
          character_mixer = new THREE.AnimationMixer(new_model);
          const c_clip = THREE.AnimationClip.findByName(charcterClips, "fishingRod");
          const c_action = character_mixer.clipAction(c_clip);
          c_action.play();
          
          Island.container.remove(Island.c_model);
          Island
          Island.container.add(new_model);

          function updateMixers(){
           
            requestAnimationFrame(updateMixers);
            const clockDelta = clock.getDelta();
            if (character_mixer){
                // console.log(char_mixer);
                character_mixer.update(clockDelta);
            }
          }
          updateMixers();
        });
       
    }
    


Island.container.rotateY(parseFloat(sessionStorage.getItem('model_rotate_w')));





Island.water.material.uniforms[ 'time' ].value = 1.0 / 60.0;




Island.camera.lookAt(Island.container.position);



Island.callback();





}
