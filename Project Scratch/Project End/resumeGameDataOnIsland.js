import * as Survival from './Survival.js';

const cam_obj = JSON.parse(sessionStorage.getItem('camera'));

// console.log(container);

Survival.camera.position.set(
    cam_obj.cam_x,
    cam_obj.cam_y,
    cam_obj.cam_z
);


const obj = JSON.parse(sessionStorage.getItem('container'));

Survival.container.position.set(
    obj.x,
    obj.y,
    obj.z
);

Survival.characterPhysiscsBody.position.set(
    obj.x,
    obj.y,
    obj.z
)

if (Survival.container.position.x == 0 && Survival.container.position.y == 0 && Survival.container.position.z == 0){

    Survival.camera.lookAt(Survival.container.position);
    Survival.animate();    
}

else{
    Survival.container.rotateY(parseFloat(sessionStorage.getItem('model_rotate_w')));
    const container_rotation_Y  = JSON.parse(sessionStorage.getItem('container_rotationY'));

    Survival.container.rotation.set(
        container_rotation_Y.rotate_x,
        container_rotation_Y.rotate_y,
        container_rotation_Y.rotate_z
    );
   

    Survival.water.material.uniforms[ 'time' ].value = 1.0 / 60.0;
    Survival.camera.lookAt(Survival.container.position);
    Survival.animate();
}