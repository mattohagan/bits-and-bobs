
let outputWidth = 1000;
let outputHeight = 1000;

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

  this.sphere1 = {
    'y': 150,
    'offsetSpeed': 0.02,
    'offsetSpeedMin': 0.02,
    'offsetSpeedMax': 0.2,
    'offset': 0,
    'ampMin': 0.5,
    'ampMax': 20,
    'amp': 0.75,
    'move': function(){
      that.sphere1.offset += that.sphere1.offsetSpeed;
  		let wave = keeper.sphere1.amp * Math.cos(that.sphere1.offset);
      that.sphere1.y += wave;
    },
    'updateAmplitude': function(val){
      console.log('to map: ', val);
      let newAmp = THREE.Math.mapLinear(val, 0, 350, that.sphere1.ampMin, that.sphere1.ampMax);
      let newOffsetSpeed = THREE.Math.mapLinear(val, 0, 350, that.sphere1.offsetSpeedMin, that.sphere1.offsetSpeedMax);
      // console.log(newAmp);
      that.sphere1.amp = newAmp;
      that.sphere1.offsetSpeed = newOffsetSpeed;
    }
  }

  this.sphere2 = {
    'x': 350,
    'y': 50,
    'z': 0,
    'offsetSpeed': 0.035,
    'offset': 0,
    'amp': 4,
    'move': function(){
      that.sphere2.offset += that.sphere2.offsetSpeed;
      let cosWave = keeper.sphere2.amp * Math.cos(that.sphere2.offset);
      let sinWave = keeper.sphere2.amp * Math.sin(that.sphere2.offset);
      that.sphere2.y += cosWave;
      // that.sphere2.x += sinWave;
      that.sphere2.z += sinWave;
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
  var ambient = new THREE.AmbientLight(0xffffff, 0.75);
  scene.add(ambient);
  var spotlight = new THREE.SpotLight(0xffffff, 0.5);
  spotlight.position.set(-2000, 2000, 2000);
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

  var material = new THREE.MeshLambertMaterial({color: 0xFC3F30}); // red: 0xF32E1E
  var cube = new THREE.Mesh(geometry, material);
  cube.position.y = 75;

  var geo = new THREE.EdgesGeometry( cube.geometry );
  var mat = new THREE.LineBasicMaterial( { color: 0x000000, linewidth: 10} );
  var wireframe = new THREE.LineSegments( geo, mat );
  wireframe.renderOrder = 1; // make sure wireframes are rendered 2nd
  // cube.add( wireframe );

  scene.add(cube);


  let sphereSize = 125;
  let sphereSegments = 0;
  // var geoSphere = new THREE.SphereGeometry(sphereSize, sphereSegments, sphereSegments);
  var geoSphere = new THREE.DodecahedronGeometry(sphereSize, sphereSegments);
  var matSphere = new THREE.MeshLambertMaterial({color: 0x0091E2});
  var sphere = new THREE.Mesh(geoSphere, matSphere);
  sphere.position.y = keeper.sphere1.y;
  sphere.position.x = -200;
  sphere.position.z = -200;
  var geoSphereWireframe = new THREE.EdgesGeometry( sphere.geometry );
  var sphereWireframe = new THREE.LineSegments(geoSphereWireframe, mat);
  // sphere.add( sphereWireframe );
  scene.add(sphere);

  let sphereSize2 = 50;
  let sphereSegments2 = 0;
  // var geoSphere = new THREE.SphereGeometry(sphereSize, sphereSegments, sphereSegments);
  var geoSphere2 = new THREE.DodecahedronGeometry(sphereSize2, sphereSegments2);
  var matSphere2 = new THREE.MeshLambertMaterial({color: 0xFFEC5F}); // pink: 0xFCC8C8, purple: 0xD2B7FF
  var sphere2 = new THREE.Mesh(geoSphere2, matSphere2);
  sphere2.position.y = keeper.sphere2.y;
  sphere2.position.x = keeper.sphere2.x;
  sphere2.position.z = keeper.sphere2.z;
  scene.add(sphere2);




  // create a row at a point in Z
  // move whole row up Z
  // delete row once it gets to Z
  // scene.remove( obj ) OR scene.remove( obj.name )


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

  function moveFloorPieces(){

    // run through floorPieces
    // for(let i = 0; i < xNum; i++){
    //   let x = xInitial + (i * floorSize) + (i * margin);
    //   let newZ;
    //   // get newZ for whole row
    //
    //   for(let j = 0; j < yNum; j++){
    //     // update Z of each piece per row
    //
    //     // check if z is too much, then delete object instead of incrementing z
    //   }
    // }
  }



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
    var mat = new THREE.LineBasicMaterial( { color: 0x000000, linewidth: 10} );
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
    moveFloorPieces();

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

    keeper.sphere1.move();
    sphere.position.y = keeper.sphere1.y;

    keeper.sphere2.move();
    sphere2.position.x = keeper.sphere2.x;
    sphere2.position.y = keeper.sphere2.y;
    sphere2.position.z = keeper.sphere2.z;






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
