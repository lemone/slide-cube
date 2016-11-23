(function() {
  "use strict";

  var theContainer = document.getElementById('container');

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  var renderer = new THREE.WebGLRenderer({
                   alpha: true,
                   antialias: true
                 });

  renderer.setClearColor(0xb6a754, 0.8);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;

  // Number of box objects we want to have in our space cube
  // This should never excede 999. 800 is even a bit much. 
  var numberOfBoxes = 7;
  // Length of one side of the cubes
  var cubeSize = 5;
  var boxes = [];

  // Space cube side length based on numberOfBoxes
  var spaceBoxDimension = Math.ceil(Math.cbrt(numberOfBoxes));

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
  var boxColors = [0x293e6a, 0x3b5998, 0x639bf1, 0x77ba9b];

  // Create an array of surface meshes of each color
  var boxMaterials = _.map(boxColors, function(color) {
    return new THREE.MeshStandardMaterial({ color: color });
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

  var ambientLight = new THREE.AmbientLight( 0x405040 );
  scene.add( ambientLight );

  var spotLight1 = new THREE.SpotLight( 0xFFFFFF );
  spotLight1.position.set( -cameraDimension, cameraDimension, -cameraDimension );
  spotLight1.castShadow = true;
  spotLight1.lookAt(spaceBoxCenter);
  scene.add( spotLight1 );

  var spotLight2 = new THREE.SpotLight( 0xFFFFFF );
  spotLight2.position.set( cameraDimension, -cameraDimension, cameraDimension );
  spotLight2.castShadow = true;
  spotLight2.lookAt(spaceBoxCenter);
  scene.add( spotLight2 );

  theContainer.appendChild(renderer.domElement);

  // Toggle whether a box is currently moving
  var boxMoving = false;
  var boxToMove = {};
  // The current movement axis
  var axis = '';
  var destinationPosition,
      destinationPositionIndex;

  // The movement
  var moveDiff = 0;

  var step = 0;

  renderScene();

  function renderScene() {
    // Only used for the camera movement at the moment
    step += 0.005;

    // Pick a random box
    if (boxMoving === false) {
      boxToMove = boxes[Math.floor(Math.random() * boxes.length)];

      // Make sure this box has an empty adjacent position to move to
      var availablePositions = adjacentOpenPositions(boxToMove.positionIndex, spaceBoxDimension);
      if (availablePositions.length > 0) {
        destinationPositionIndex = availablePositions[Math.floor(Math.random() * availablePositions.length)];
        destinationPosition = cubePositions[destinationPositionIndex];
        destinationPosition.occupied = true;
        cubePositions[boxToMove.positionIndex].occupied = false;

        // Determine which axis to move along
        if (destinationPosition.x !== boxToMove.position.x) {
          moveDiff = boxToMove.position.x - destinationPosition.x;
          axis = 'x';
        } else if (destinationPosition.y !== boxToMove.position.y) {
          moveDiff = boxToMove.position.y - destinationPosition.y;
          axis = 'y';
        } else if (destinationPosition.z !== boxToMove.position.z) {
          moveDiff = boxToMove.position.z - destinationPosition.z;
          axis = 'z';
        }

        boxMoving = true;
      }
    }

    if (boxMoving === true && axis !== '') {
      if (boxToMove.position[axis] !== destinationPosition[axis]) {

        boxToMove.position[axis] -= moveDiff / 40.0;

      } else {
        boxToMove.positionIndex = destinationPositionIndex;
        boxMoving = false;
      }
    }

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
  function adjacentOpenPositions(positionIndex, spaceBoxDimension) {
    var adjacentOpenPositionIndexes = [];
    var zLayerSize = Math.pow(spaceBoxDimension, 2);

    // We can get our x axis neighbors from this mess
    var xMod = positionIndex % spaceBoxDimension;
    if (xMod !== 0) {
      checkOccupancy(positionIndex - 1);
    }
    if (xMod !== spaceBoxDimension - 1) {
      checkOccupancy(positionIndex + 1);
    }

    // The y axis neighbors
    if (positionIndex - spaceBoxDimension > 0) {
      // We have a y position below
      checkOccupancy(positionIndex - spaceBoxDimension);
    }
    if (positionIndex + spaceBoxDimension < zLayerSize) {
      // We have a y position above
      checkOccupancy(positionIndex + spaceBoxDimension);
    }

    // The z axis neighbors
    if (positionIndex - zLayerSize >= 0) {
      // We have a lower z neighbor
      checkOccupancy(positionIndex - zLayerSize);
    }
    if (positionIndex + zLayerSize < Math.pow(spaceBoxDimension, 3)) {
      // We have a higher z neighbor
      checkOccupancy(positionIndex + zLayerSize);
    }

    function checkOccupancy(index) {
      if (!cubePositions[index].occupied) {
        adjacentOpenPositionIndexes.push(index);
      }
    }

    return adjacentOpenPositionIndexes;
  }
})();
