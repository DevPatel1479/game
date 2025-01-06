import * as THREE from "./mrdoob-three.js/build/three.module.js";
import * as Ammo from "./ammo.js-main/builds/ammo.js"

//variable declaration section
let physicsWorld, scene, camera, renderer, rigidBodies = [], pos = new THREE.Vector3(), tmpTrans = null;
let mouseCoords = new THREE.Vector2(), raycaster = new THREE.Raycaster();
let wall, ball;
let ttl = 3, ttlCounter = 0, ballInWorld = false;

//Ammojs Initialization
Ammo().then(start());
function start (){

    tmpTrans = new Ammo.btTransform();

    setupPhysicsWorld();

    setupGraphics();

    createWall();

    setupEventHandlers();
    
    renderFrame();

}

function setupPhysicsWorld(){

    let collisionConfiguration  = new Ammo.btDefaultCollisionConfiguration(),
        dispatcher              = new Ammo.btCollisionDispatcher(collisionConfiguration),
        overlappingPairCache    = new Ammo.btDbvtBroadphase(),
        solver                  = new Ammo.btSequentialImpulseConstraintSolver();

    physicsWorld           = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
    physicsWorld.setGravity(new Ammo.btVector3(0, 0, 0));

}


function setupGraphics(){

    //create clock for timing
    clock = new THREE.Clock();

    //create the scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xabfeff );

    //create camera
    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.2, 5000 );
    camera.position.set( 0, 20, 50 );
    camera.lookAt(new THREE.Vector3(0, 20, 0));

    //Add hemisphere light
    let hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.1 );
    hemiLight.color.setHSL( 0.6, 0.6, 0.6 );
    hemiLight.groundColor.setHSL( 0.1, 1, 0.4 );
    hemiLight.position.set( 0, 50, 0 );
    scene.add( hemiLight );

    //Add directional light
    let dirLight = new THREE.DirectionalLight( 0xffffff , 1);
    dirLight.color.setHSL( 0.1, 1, 0.95 );
    dirLight.position.set( -1, 1.75, 1 );
    dirLight.position.multiplyScalar( 100 );
    scene.add( dirLight );

    dirLight.castShadow = true;

    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;

    let d = 50;

    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;

    dirLight.shadow.camera.far = 13500;

    //Setup the renderer
    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setClearColor( 0xbfd1e5 );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    renderer.gammaInput = true;
    renderer.gammaOutput = true;

    renderer.shadowMap.enabled = true;

}


function renderFrame(){

    let deltaTime = clock.getDelta();

    //update ball time to live if ball in world
    if( ballInWorld ) ttlCounter += deltaTime;

    //if time to live has been exceeded then delete the ball
    if( ttlCounter > ttl ){

        physicsWorld.removeRigidBody( ball.userData.physicsBody );
        scene.remove(ball);

        ttlCounter = 0;
        ballInWorld = false;

    }

    updatePhysics( deltaTime );

    renderer.render( scene, camera );

    requestAnimationFrame( renderFrame );

}


function setupEventHandlers(){

    window.addEventListener( 'resize', onWindowResize, false );
    window.addEventListener( 'mousedown', onMouseDown, false );

}


function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}


function onMouseDown ( event ) {

    if( ballInWorld ) return;

    mouseCoords.set(  ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1 );

    raycaster.setFromCamera( mouseCoords, camera );

    // Create a ball 
    pos.copy( raycaster.ray.direction );
    pos.add( raycaster.ray.origin );

    ball = createBall(pos);
    
    //shoot out the ball
    let ballBody = ball.userData.physicsBody;

    pos.copy( raycaster.ray.direction );
    pos.multiplyScalar( 70 );
    ballBody.setLinearVelocity( new Ammo.btVector3( pos.x, pos.y, pos.z ) );

    ballInWorld = true;

}


function createWall(){
    
    let pos = {x: 0, y: 25, z: -15};
    let scale = {x: 50, y: 50, z: 2};
    let quat = {x: 0, y: 0, z: 0, w: 1};
    let mass = 0;

    //threeJS Section
    wall = new THREE.Mesh(new THREE.BoxBufferGeometry(), new THREE.MeshPhongMaterial({color: 0x42f5bf}));

    wall.position.set(pos.x, pos.y, pos.z);
    wall.scale.set(scale.x, scale.y, scale.z);

    wall.castShadow = true;
    wall.receiveShadow = true;

    scene.add(wall);


    //Ammojs Section
    let transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin( new Ammo.btVector3( pos.x, pos.y, pos.z ) );
    transform.setRotation( new Ammo.btQuaternion( quat.x, quat.y, quat.z, quat.w ) );
    let motionState = new Ammo.btDefaultMotionState( transform );

    let colShape = new Ammo.btBoxShape( new Ammo.btVector3( scale.x * 0.5, scale.y * 0.5, scale.z * 0.5 ) );
    colShape.setMargin( 0.05 );

    let localInertia = new Ammo.btVector3( 0, 0, 0 );
    colShape.calculateLocalInertia( mass, localInertia );

    let rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, colShape, localInertia );
    let body = new Ammo.btRigidBody( rbInfo );

    body.setFriction(4);
    body.setRollingFriction(10);

    physicsWorld.addRigidBody( body );

    //Let's overlay the wall with a grid for visual calibration
    const gridHelper = new THREE.GridHelper( 50, 50, 0x1111aa, 0xaa1111 );

    scene.add( gridHelper );

    gridHelper.rotateX( THREE.Math.degToRad(90));
    gridHelper.position.y = 25;
    gridHelper.position.z = -14;

    wall.userData.tag = "wall";
}


function createBall(pos){
    
    let radius = 0.8;
    let quat = {x: 0, y: 0, z: 0, w: 1};
    let mass = 35;

    //threeJS Section
    let ball = ballObject = new THREE.Mesh(new THREE.SphereBufferGeometry(radius), new THREE.MeshPhongMaterial({color: 0x05ff1e}));

    ball.position.set(pos.x, pos.y, pos.z);
    
    ball.castShadow = true;
    ball.receiveShadow = true;

    scene.add(ball);


    //Ammojs Section
    let transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin( new Ammo.btVector3( pos.x, pos.y, pos.z ) );
    transform.setRotation( new Ammo.btQuaternion( quat.x, quat.y, quat.z, quat.w ) );
    let motionState = new Ammo.btDefaultMotionState( transform );

    let colShape = new Ammo.btSphereShape( radius );
    colShape.setMargin( 0.05 );

    let localInertia = new Ammo.btVector3( 0, 0, 0 );
    colShape.calculateLocalInertia( mass, localInertia );

    let rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, colShape, localInertia );
    let body = new Ammo.btRigidBody( rbInfo );

    body.setFriction(4);
    body.setRollingFriction(10);

    body.setActivationState( STATE.DISABLE_DEACTIVATION )


    physicsWorld.addRigidBody( body );
    rigidBodies.push(ball);
    
    ball.userData.physicsBody = body;
    ball.userData.tag = "ball";
    
    return ball;
}


function updatePhysics( deltaTime ){

    // Step world
    physicsWorld.stepSimulation( deltaTime, 10 );

    // Update rigid bodies
    for ( let i = 0; i < rigidBodies.length; i++ ) {
        let objThree = rigidBodies[ i ];
        let objAmmo = objThree.userData.physicsBody;
        let ms = objAmmo.getMotionState();
        if ( ms ) {
            ms.getWorldTransform( tmpTrans );
            let p = tmpTrans.getOrigin();
            let q = tmpTrans.getRotation();
            objThree.position.set( p.x(), p.y(), p.z() );
            objThree.quaternion.set( q.x(), q.y(), q.z(), q.w() );
        }
    }
}