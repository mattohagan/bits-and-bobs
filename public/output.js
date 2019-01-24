
let outputWidth = 600;
let outputHeight = 600;

let keeper = new Keeper();

// source of truth for output variables
function Keeper(){
  let that = this;

  this.static = {
    "variation": 7,
    "updateVariation": function(val){
      that.static.variation = Math.floor(THREE.Math.mapLinear(val, 0, 100, 1, 24));
    }
  };

  this.mainCube = {
    'rotation': {
      x: 0,
      y: 0,
      z: 0
    },
    'updateRotation': function(rotation){
      that.mainCube.rotation = rotation;
    },
    isRotating: true,
    toggleRotating: function(){
      that.mainCube.isRotating = !that.mainCube.isRotating;
    },
    scale: 1,
    updateScale: function(val){
      let base = 1;
      let delta = 3;
      that.mainCube.scale = THREE.Math.mapLinear(val, 0, 350, base, base + delta);
    }
  }
}


function Output(width, height, id){
  this.rotationSpeedX = 0.01;
  this.rotationSpeedY = 0.01;


  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(75, width/height, 1, 10000);
  camera.position.z = 1000;
  camera.position.y = 300;


  // LIGHTS!
  var ambient = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambient);
  var spotlight = new THREE.SpotLight(0xffffff, 0.3);
  spotlight.position.set(-500, 500, 500);
  scene.add(spotlight);

  // var lightHelper = new THREE.SpotLightHelper( spotlight, 5 );
  // scene.add(lightHelper);

  // could experiment with hemisphere light later
  // var hemisphere = new THREE.HemisphereLight(0xff0000,0xffffff,0.9)
  // scene.add(hemisphere);




  var renderer = new THREE.WebGLRenderer({ alpha: true });
  renderer.setSize(width, height);
  document.getElementById(id).appendChild(renderer.domElement);

  let boxSize = 100;
  // var geometry = new THREE.BoxGeometry(boxSize, boxSize, boxSize, 1, 1, 1);
  var geometry = new THREE.ConeGeometry(boxSize, boxSize, 3);

  var material = new THREE.MeshLambertMaterial({color: 0x0000ff});
  var cube = new THREE.Mesh(geometry, material);
  cube.position.y = 75;

  var geo = new THREE.EdgesGeometry( cube.geometry );
  var mat = new THREE.LineBasicMaterial( { color: 0xffffff, linewidth: 10} );
  var wireframe = new THREE.LineSegments( geo, mat );
  wireframe.renderOrder = 1; // make sure wireframes are rendered 2nd
  // cube.add( wireframe );

  scene.add(cube);


  let sphereSize = 125;
  let sphereSegments = 0;
  // var geoSphere = new THREE.SphereGeometry(sphereSize, sphereSegments, sphereSegments);
  var geoSphere = new THREE.DodecahedronGeometry(sphereSize, sphereSegments);
  var matSphere = new THREE.MeshLambertMaterial({color: 0xff0000});
  var sphere = new THREE.Mesh(geoSphere, matSphere);
  sphere.position.y = 150;
  sphere.position.x = -200;
  sphere.position.z = -200;
  var geoSphereWireframe = new THREE.EdgesGeometry( sphere.geometry );
  var sphereWireframe = new THREE.LineSegments(geoSphereWireframe, mat);
  // sphere.add( sphereWireframe );
  scene.add(sphere);



  let floorPieces = [];
  function addFloor(){
    // to traverse a square
    let xNum = 5;
    let yNum = 5;
    let margin = 20;
    let floorSize = 100;
    let floorDepth = 10;
    let y = -100;

    let xInitial = (xNum / 2) * floorSize * -1;
    xInitial += (floorSize / 2); // offset since boxes are created from center
    xInitial -= ((margin * (xNum - 1)) / 2);

    let yInitial = (yNum / 2) * floorSize * -1;
    yInitial += (floorSize / 2); // offset since boxes are created from center
    yInitial -= ((margin * (yNum - 1)) / 2);

    for(let i = 0; i < xNum; i++){
      let x = xInitial + (i * floorSize) + (i * margin);
      let row = [];
      for(let j = 0; j < yNum; j++){
        let z = yInitial + (j * floorSize) + (j * margin);
        let piece = new FloorSquare(floorSize, floorDepth, x, y, z);
        row.push(piece);

        scene.add(piece.mesh);
      }
      floorPieces.push(row);
    }
  }

  addFloor();


  $('#button-1').click(function(){
    horizontalWave.start();
  });

  $('#button-2').click(function(){
    verticalWave.start();
  });



  function FloorSquare(size, depth, x, y, z){
    // create piece
    var material = new THREE.MeshBasicMaterial({color: 0xffffff});
    let floorGeometry = new THREE.BoxGeometry(size, depth, size, 1, 1, 1);
    let floorSquare = new THREE.Mesh(floorGeometry, material);

    // position piece
    // floorSquare.rotation.x = Math.PI/ 10;
    floorSquare.position.x = x;
    floorSquare.position.z = z;
    floorSquare.position.y = y;

    // add outlines
    let floorGeo = new THREE.EdgesGeometry( floorSquare.geometry );
    var mat = new THREE.LineBasicMaterial( { color: 0x0000ff, linewidth: 10} );
    let floorWireframe = new THREE.LineSegments(floorGeo, mat);
    floorSquare.add( floorWireframe );

    this.setColor = function(color){
      this.mesh.material.color.setHex( color );
    }

    this.mesh = floorSquare;
  }

  let horizontalWave = new ColorWave(floorPieces, 'horizontal', 0x0000ff);
  let verticalWave = new ColorWave(floorPieces, 'vertical', 0xff0000);

  function ColorWave(piecesArray, direction, waveColor){
    let defaultColor = 0xffffff;
    let rowInterval = 0;
    let speed = 0.1;
    let lastRow = -1;

    this.direction = direction;

    this.isRunning = false;

    this.start = function(){
      this.isRunning = true;
    }

    this.step = function(){
      if(this.isRunning){
        rowInterval += speed;
        let row = Math.floor(rowInterval);

        if(row != lastRow){
          lastRow = row;

          // run through row and set colors
          for(let i = 0; i < piecesArray.length; i++){

            // only reset previous row after first row
            if (row != 0){
              this.getMesh(row - 1, i).setColor(defaultColor);
            }

            // default behavior expect for last clearing run
            if (row != floorPieces.length){
              this.getMesh(row, i).setColor(waveColor);
            }
          }

          // reset animation variables
          if(row == piecesArray.length){
            this.isRunning = false;
            lastRow = -1;
            rowInterval = 0;
          }
        }
      }
    }

    this.getMesh = function(i, j){
      if(direction == 'horizontal'){
        return piecesArray[i][j];
      } else if (direction == 'vertical'){
        return piecesArray[j][i];
      }
    }
  }


  // fix for scoping 'this'
  let that = this;
  function render() {
    requestAnimationFrame(render);

    // floor color waves
    verticalWave.step();
    horizontalWave.step();

    cube.rotation.x = keeper.mainCube.rotation.x;
    cube.rotation.y = keeper.mainCube.rotation.y;
    cube.rotation.z = keeper.mainCube.rotation.z;

    // cube rotation
    if(keeper.mainCube.isRotating){
      keeper.mainCube.rotation.y += that.rotationSpeedY;
      keeper.mainCube.rotation.x += that.rotationSpeedX;
    }

    cube.scale.x = keeper.mainCube.scale;
    cube.scale.y = keeper.mainCube.scale;
    cube.scale.z = keeper.mainCube.scale;

    renderer.render(scene, camera);
  };


  this.updateRotation = function(x, y, z, inputType){
    cube.rotation.x = x;
    cube.rotation.y = y;
    cube.rotation.z = z;
  }

  // only called for output canvas
  // IN PROCESS OF DEPRECATING
  this.updateRotationX = function(val, inputType){
    let newVal;

    switch(inputType){
      case "input-slider":
        // receiving from slider
        newVal = THREE.Math.mapLinear(val, 0, 100, 0, Math.PI);
        break;
      case "input-cube":
        // receiving from other cube
        newVal = THREE.Math.mapLinear(val, 0, 178, 0, Math.PI);
        break;
      case "input-orientation":
        newVal = THREE.Math.mapLinear(val, 0, 5, 0, Math.PI);
        break;
    }

    cube.rotation.x = newVal;
  }

  render();
}

output = new Output(outputWidth, outputHeight, "output");
