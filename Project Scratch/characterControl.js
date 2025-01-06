import * as  Physijs from './Physijs-master/physijs_worker.js';
        // Scene and camera
        const scene = Physijs.scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 5;

        // Renderer

        
const renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);

        // Character model

        
let character;
        const loader = new THREE.GLTFLoader();
        loader.load('./assets/animationTest (1).glb', (glb) => {
            character = new Physijs.Mesh(glb.scene, {
                mass: 1,
                restitution: 0.2,
            });
            character.scale.set(0.1, 0.1, 0.1);
            scene.add(character);
        });

        // Terrain model
        let terrain;
        const heightMap = new THREE.TextureLoader().load('./assets/island.glb');
        const terrainGeometry = new THREE.PlaneGeometry(10, 10, 100, 100);
        terrain = new Physijs.BoxMesh(terrainGeometry, new THREE.MeshBasicMaterial({ map: heightMap }), {
            mass: 0,
        });
        terrain.rotation.x = -Math.PI / 2;
        scene.add(terrain);

        // Movement variables
        let moveSpeed = 0.05;
        let direction = new THREE.Vector3(0, 0, 0);
        let isMoving = false;

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(10, 10, 10);
        scene.add(ambientLight, directionalLight);

        // Animate loop
        function animate() {
            requestAnimationFrame(animate);

            if (isMoving) {
                character.applyCentralForce(direction.clone().multiplyScalar(moveSpeed));
                character.__dirtyPosition = true;
            }

            scene.simulate(); // Update physics simulation
            renderer.render(scene, camera);
        }

        animate();

        // Keyboard events
        document.addEventListener('keydown', (event) => {
            switch (event.key) {
                case 'w':
                    isMoving = true;
                    direction = new THREE.Vector3(0, 0, 1);
                    break;
                case 's':
                    isMoving = true;
                    direction = new THREE.Vector3(0, 0, -1);
                    break;
                case 'a':
                    isMoving = true;
                    direction = new THREE.Vector3(-1, 0, 0);
                    break;
                case 'd':
                    isMoving = true;
                    direction = new THREE.Vector3(1, 0, 0);
                    break;
            }
        });

        document.addEventListener('keyup', () => {
            isMoving = false;
        });