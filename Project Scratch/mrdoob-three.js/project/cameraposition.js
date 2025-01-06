import * as THREE from '../build/three.module.js'


// Set up the scene, camera, and renderer
let camera, scene, renderer, cube;
    const cubeSpeed = 0.1;
    const cameraDistance = 5;

    function init() {
      scene = new THREE.Scene();

      camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.set(0, 2, cameraDistance);
      camera.rotation.set(0, 0, 0); // Optional: Set initial rotation
      scene.add(camera);

      const light = new THREE.DirectionalLight(0xffffff, 1);
      light.position.set(1, 1, 1).normalize();
      scene.add(light);

      const geometry = new THREE.BoxGeometry();
      const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
      cube = new THREE.Mesh(geometry, material);
      scene.add(cube);

      renderer = new THREE.WebGLRenderer();
      renderer.setSize(window.innerWidth, window.innerHeight);
      document.body.appendChild(renderer.domElement);

      window.addEventListener('resize', onWindowResize);

      animate();
    }

    function onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function animate() {
      requestAnimationFrame(animate);

      // Cube movement
      const delta = cubeSpeed;
      if (cube.position.x > -5) {
        cube.position.x -= delta;
      }

      // Camera follows cube
      camera.position.x = cube.position.x;
      camera.position.z = cube.position.z + cameraDistance;
      camera.lookAt(cube.position);

      renderer.render(scene, camera);
    }

    document.addEventListener('keydown', (event) => {
      const keyCode = event.keyCode;
      if (keyCode === 37) {
        // Left arrow key
        cube.position.x += cubeSpeed;
      }
      if (keyCode === 39) {
        // Right arrow key
        cube.position.x -= cubeSpeed;
      }
      renderer.render(scene, camera);
    });

    init();