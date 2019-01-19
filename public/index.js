$(function () {
  var socket = io();

  let outputWidth = 600;
  let outputHeight = 600;
  let canvasOutput = new Canvas(outputWidth, outputHeight, "output");

  let controlWidth = 300;
  let controlHeight = 300;
  let canvas = new Canvas(controlWidth, controlHeight, "input-cube");
  let canvas3 = new Canvas(controlWidth, controlHeight, "input-orientation");

  let slider = document.getElementById('input-slider');
  slider.addEventListener('input', function(){
    let val = $('#input-slider').val();
    socket.emit('slider update', val);
    canvasOutput.updateRotationX(val, 'input-slider');
  });

  socket.on('slider update', function(val){
    $('#input-slider').val(val);
    canvasOutput.updateRotationX(val, 'input-slider');
  });


  function Canvas(width, height, id){
    this.rotationSpeedX = 0.01;
    this.rotationSpeedY = 0.01;
    let isRotating = true;


    var scene = new THREE.Scene();
  	var camera = new THREE.PerspectiveCamera(75, width/height, 1, 10000);

  	var renderer = new THREE.WebGLRenderer({ alpha: true });
  	renderer.setSize(width, height);
  	document.getElementById(id).appendChild(renderer.domElement);

    let boxSize = 200;
  	var geometry = new THREE.BoxGeometry(boxSize, boxSize, boxSize, 1, 1, 1);

  	var material = new THREE.MeshBasicMaterial({color: 0xffffff});
  	var cube = new THREE.Mesh(geometry, material);
    cube.position.y = 75;

    var geo = new THREE.EdgesGeometry( cube.geometry );
    var mat = new THREE.LineBasicMaterial( { color: 0x000000, linewidth: 10} );
    var wireframe = new THREE.LineSegments( geo, mat );
    wireframe.renderOrder = 1; // make sure wireframes are rendered 2nd
    cube.add( wireframe );

  	scene.add(cube);



    let floorPieces = [];
    function addFloor(){
      // to traverse a square
      let divisions = 5;
      let y = -100;
      let floorSize = 100;
      let initial = (divisions / 2) * floorSize * -1;
      initial += (floorSize / 2) // offset since boxes are created from center

      for(let i = 0; i < divisions; i++){
        let x = initial + (i * floorSize)
        let row = [];
        for(let j = 0; j < divisions; j++){
          let z = initial + (j * floorSize);
          let piece = new FloorSquare(floorSize, x, y, z);
          row.push(piece);

          scene.add(piece.mesh);
        }
        floorPieces.push(row);
      }
    }

    if(id == 'output'){
      addFloor();
    }


    $('#button-1').click(function(){
      horizontalWave.start();
    });

    $('#button-2').click(function(){
      verticalWave.start();
    });

    $('#button-3').click(function(){
      isRotating = !isRotating;
    })


    function FloorSquare(size, x, y, z){
      let depth = 20;

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


    camera.position.z = 1000;
    camera.position.y = 300;

    // fix for scoping 'this'
    let that = this;
  	function render() {
  		requestAnimationFrame(render);

      // floor color waves
      verticalWave.step();
      horizontalWave.step();

      // cube rotation, pause when dragging
      if(!isDragging && isRotating && id == 'output'){
        cube.rotation.y += that.rotationSpeedY;
        cube.rotation.x += that.rotationSpeedX;
      }

  		renderer.render(scene, camera);
  	};

    this.updateSelfPosition = function(rotation){
      cube.rotation = rotation;
    }

    // only called for output canvas
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

    // create a grid
    var gridSize = 400;
    var gridDivisions = 5;

    var gridHelper = new THREE.GridHelper( gridSize, gridDivisions, 0xff0000, 0xff0000);
    gridHelper.position.y = -100;
		gridHelper.position.x = 0;
    // gridHelper.geometry.rotateX( Math.PI / 10 );
    if(id == 'input-cube' || id == 'input-orientation'){
      scene.add( gridHelper );
    }

  	render();



    // mouse drag logic
    var isDragging = false;
    var previousMousePosition = {
        x: 0,
        y: 0
    };

    const toRadians = (angle) => {
        return angle * (Math.PI / 180);
    };

    const toDegrees = (angle) => {
        return angle * (180 / Math.PI);
    };

    const renderArea = renderer.domElement;


    ['mousedown', 'touchstart'].forEach(function(e) {
      renderArea.addEventListener(e, function(){
        isDragging = true;
      });
    });

    renderArea.addEventListener('touchmove', (e) => {
      let touches = e.changedTouches;
      let touch = touches[0];

      // could try clientX if something's buggy
      handleMove(touch.pageX, touch.pageY);
    });

    renderArea.addEventListener('mousemove', (e) => {
        handleMove(e.offsetX, e.offsetY);
        console.log(e);
    });

    function handleMove(offsetX, offsetY){
      var deltaMove = {
          x: offsetX-previousMousePosition.x,
          y: offsetY-previousMousePosition.y
      };

      if(isDragging) {
          let deltaRotationQuaternion = new THREE.Quaternion().
          setFromEuler(
              new THREE.Euler(toRadians(deltaMove.y * 1), toRadians(deltaMove.x * 1), 0, 'XYZ')
          );

          cube.quaternion.multiplyQuaternions(deltaRotationQuaternion, cube.quaternion);

          if(id == "input-cube"){
            canvasOutput.updateRotationX(toDegrees(cube.rotation.x), id);
          }
      }

      previousMousePosition = {
          x: offsetX,
          y: offsetY
      };
    }

    ['mouseup', 'touchend'].forEach(function(e) {
      renderArea.addEventListener(e, function(){
        isDragging = false;
      });
    });


    if(id == 'input-orientation'){
      function onDeviceOrientationChangeEvent(event) {
        console.log(event.alpha, event.beta);
        let alpha = event.alpha;
        let rad = THREE.Math.degToRad(alpha);

        canvasOutput.updateRotationX(rad, 'input-orientation');
      }

      window.addEventListener('deviceorientation', onDeviceOrientationChangeEvent, false);
    }


  }


});
