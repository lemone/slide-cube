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
  var numberOfBoxes = 65;
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

  // Find the center point of the spaceCube
  var actualDimensionMidPoint = ((spaceBoxDimension * cubeSize) / 2) - 1;
  var spaceBoxCenter = new THREE.Vector3(actualDimensionMidPoint, actualDimensionMidPoint, actualDimensionMidPoint);

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

  // Uniform cube size
  var boxGeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);

  // The surface colors
  var boxColors = [0x983265, 0x986598, 0x979735, 0x339798, 0x006699, 0xCCCC99];

  // Create an array of surface meshes of each color
  var boxMaterials = _.map(boxColors, function(color) {
    return new THREE.MeshLambertMaterial({ color: color });
  });

	for (var i = 0; i < numberOfBoxes; i++) {
		var randomMaterial = boxMaterials[Math.floor(Math.random() * boxMaterials.length)];
		var box = new THREE.Mesh(boxGeometry, randomMaterial);

    // Put the boxes in random positions within the spaceCube
    var availablePositions = _.filter(cubePositions, function(position) {
      return position.occupied == false;
    });
    var randomIndex = Math.floor(Math.random() * availablePositions.length);
    var cubePosition = availablePositions[randomIndex];
    availablePositions[randomIndex].occupied = true;

    box.positionIndex = cubePositions.indexOf(cubePosition);
    box.position.x = cubePosition.x;
    box.position.y = cubePosition.y;
    box.position.z = cubePosition.z;

    //adjacentPositions(box.positionIndex, spaceBoxDimension);

		box.castShadow = true;
		box.receiveShadow = true;

		box.step = 0;

    // Add sphere to the spheres array
    boxes.push(box);

    scene.add(box);
  }

  // Camera distance from origin
  var cameraDimension = ((spaceBoxDimension * cubeSize) - 1) * 2;
  // camera.position.set(-cameraDimension, cameraDimension, cameraDimension);
  // camera.lookAt(spaceBoxCenter);

  // Add some ambient light
  var ambientLight = new THREE.AmbientLight( 0x202020 );
  scene.add(ambientLight);

  var spotLight1 = new THREE.SpotLight( 0xFFFFFF );
  var spotLight2 = new THREE.SpotLight( 0xFFFFFF, 0.4 );
  spotLight1.position.set( -cameraDimension, cameraDimension, -cameraDimension );
  spotLight2.position.set( cameraDimension, cameraDimension, cameraDimension );
  spotLight1.castShadow = true;
  spotLight2.castShadow = true;
  spotLight1.lookAt(spaceBoxCenter);
  spotLight2.lookAt(spaceBoxCenter);
  scene.add( spotLight1 );
  scene.add( spotLight2 );

  theContainer.append(renderer.domElement);

  // Toggle whether a box is currently moving
  var boxMoving = false;
  var boxToMove = {};
  var step = 0;

  renderScene();

  function renderScene() {
    // Determines the speed of the movement. The lower the number the slower we go.
    step += 0.005;

    // Pick a random box
    // if (boxMoving === false) {
    //   boxToMove = boxes[Math.floor(Math.random() * boxes.length)];

    //   // Make sure this box has an empty adjacent position to move to

    //   boxMoving = true;
    // }

    // Orbit the camera
    camera.position.x = spaceBoxCenter.x + (cameraDimension * Math.cos(step));
    camera.position.y = spaceBoxCenter.y + (cameraDimension * Math.sin(step));
    camera.position.z = spaceBoxCenter.z + (cameraDimension * Math.sin(step));
    camera.lookAt(spaceBoxCenter);

	  // render using requestAnimationFrame
	  requestAnimationFrame(renderScene);
	  renderer.render(scene, camera);
	}

  // Give a cube dimension and a position finds the adjacent positions
  function adjacentPositions(positionIndex, spaceBoxDimension) {
    console.log('positionIndex', positionIndex);
    console.log('spaceBoxDimension', spaceBoxDimension);
  }
});
