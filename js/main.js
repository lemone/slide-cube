jQuery(function() {

	var theContainer = $('#container');

	var scene = new THREE.Scene();
	var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
	var renderer = new THREE.WebGLRenderer();

  renderer.setClearColor(new THREE.Color(0x333333, 1.0));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMapEnabled = true;

	// Number of box objects we want to have in our space cube
  // This should never excede 999. 800 is even a bit much. 
  var numberOfBoxes = 8;
  // Length of one side of the cubes
  var cubeSize = 5;
  var boxes = [];

  // Space cube side length based on numberOfBoxes
  // TODO: find the real math to get this number, so we don't have to do
  // this brute force chump junk
  var spaceBoxDimension = 2;

  // Cap the size to 20
  var spaceBoxDimensionMax = 10;

  // Determine our spaceBox dimension based on the numberOfBoxes
  for (; spaceBoxDimension <= spaceBoxDimensionMax; spaceBoxDimension++) {
    if (Math.pow(spaceBoxDimension, 3) > numberOfBoxes) {
      break;
    }
  }

  // Build an array of the positions in the spaceBox for our cubes.
  // Go along x axis, then y, then z.
  var cubePositions = [];
  for (var z = 0; z < spaceBoxDimension; z++) {
    for (var y = 0; y < spaceBoxDimension; y++) {
      for (var x = 0; x < spaceBoxDimension; x++) {
        var position = {
          x: x * cubeSize,
          y: y * cubeSize,
          z: z * cubeSize,
          occupied: false
        }

        cubePositions.push(position);
      }
    }
  }

  console.log(cubePositions);

  // Uniform cube size
  var boxGeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);

  // The surface colors
  var boxColors = [0x257E78, 0x40B8AF, 0x6C2D58, 0xB2577A, 0xF6B17F, 0xFFFFFF];

  // Create an array of surface meshes of each color
  var boxMaterials = _.map(boxColors, function(color) {
    return new THREE.MeshLambertMaterial({ color: color });
  });

	for (var i = 0; i < numberOfBoxes; i++) {
		var randomMaterial = boxMaterials[Math.floor(Math.random() * boxMaterials.length)];
		var box = new THREE.Mesh(boxGeometry, randomMaterial);

    // Put the boxes in random positions within the spaceCube
    var availablePositions = _.where(cubePositions, { occupied: false });
    var positionIndex = Math.floor(Math.random() * availablePositions.length);
    var cubePosition = availablePositions[positionIndex];
    availablePositions[positionIndex].occupied = true;

    box.position.x = cubePosition.x;
    box.position.y = cubePosition.y;
    box.position.z = cubePosition.z;

		box.castShadow = true;
		box.receiveShadow = true;

		box.step = 0;

    // Add sphere to the spheres array
    boxes.push(box);

    scene.add(box);
  }

  camera.position.set(-30, 40, 20);
  camera.lookAt(scene.position);

  // Add some ambient light
  // var ambientLight = new THREE.AmbientLight( 0x202020 );
  // scene.add(ambientLight);

  var spotLight = new THREE.SpotLight( 0xFFFFFF );
  spotLight.position.set( -40, 40, -20 );
  spotLight.castShadow = true;
  scene.add( spotLight );

  theContainer.append(renderer.domElement);

  renderScene();

  function renderScene() {
    // Determines the speed of the movement. The lower the number the slower we go.
    var step = 0.04;

	  // boxes.forEach(function(box, index) {
  	// 	box.position.x = (index % cubeSize) * cubeSize;
  	// 	box.position.y = Math.floor(index / cubeSize) * cubeSize;
  	// 	box.position.z = 0;
	  // });

	  // render using requestAnimationFrame
	  //requestAnimationFrame(renderScene);
	  renderer.render(scene, camera);
	}
});
