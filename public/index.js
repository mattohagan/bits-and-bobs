$(function () {
  var socket = io();

  let outputWidth = 600;
  let outputHeight = 600;
  let canvasOutput = new Canvas(outputWidth, outputHeight, "output");

  let controlWidth = 300;
  let controlHeight = 300;
  let canvas = new Canvas(controlWidth, controlHeight, "input-cube");
  let canvas3 = new Canvas(controlWidth, controlHeight, "input-orientation");


  // to use for 2D canvas
	var sketch2D = function(p){
		let buffer, size, xOrigin, yOrigin, ySize;
    let staticVariation = 7;

		p.setup = function(){
			p.createCanvas(400, 560);
			buffer = 100;

			// vars for static block
			xSize = 50;
			ySize = xSize * 4;
			xOrigin = Math.ceil(p.random(25, 160) / 10) * 10;
			yOrigin = xOrigin * 5;

			// vars for circle
			let xEllipse = p.random(0, p.width);
			let yEllipse = p.random(0, p.height);
			size = p.random(100, 400);

			// create circle only once
			p.fill(0, 0, 255);
			p.strokeWeight(0);
			// p.ellipse(xEllipse, yEllipse, size);
		}

		p.draw = function(){
      p.clear();

			// update static block
			p.loadPixels();
			for(var x = xOrigin; x < xOrigin + xSize; x++){
				for(var y = yOrigin; y < yOrigin + ySize; y++){
				  var r = p.random(255);

				  // this is witchcraft
				  var index = (x + (y * ySize)) * staticVariation;

				  p.pixels[index + 0] = r;
				  p.pixels[index + 1] = r;
				  p.pixels[index + 2] = r;
				  p.pixels[index + 3] = 255;
				}
			}
			p.updatePixels();
		}

    function updateStaticVar(val){
      // p.
      staticVariation = Math.floor(THREE.Math.mapLinear(val, 0, 100, 1, 24));
    }

    let slider = document.getElementById('input-slider');
    slider.addEventListener('input', function(){
      let val = $('#input-slider').val();
      socket.emit('slider update', val);
      // canvasOutput.updateRotationX(val, 'input-slider');
      updateStaticVar(val);
    });
	}


  // create p5 instances
	let sketch2 = new p5(sketch2D, 'container2D');



  socket.on('slider update', function(val){
    $('#input-slider').val(val);
    canvasOutput.updateRotationX(val, 'input-slider');
    // sketch2D.updateStaticVar(val);
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
      let margin = 20;
      let floorSize = 100;
      let y = -100;

      let initial = (divisions / 2) * floorSize * -1;
      initial += (floorSize / 2); // offset since boxes are created from center
      initial -= ((margin * (divisions - 1)) / 2);

      for(let i = 0; i < divisions; i++){
        let x = initial + (i * floorSize) + (i * margin);
        let row = [];
        for(let j = 0; j < divisions; j++){
          let z = initial + (j * floorSize) + (j * margin);
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
      let depth = 1;

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

    this.updateRotation = function(x, y, z, inputType){
      switch(inputType){
        case "input-orientation":
          // receiving from slider
          cube.rotation.x = x;
          cube.rotation.y = y;
          cube.rotation.z = z;
          // newVal = THREE.Math.mapLinear(val, 0, 100, 0, Math.PI);
          break;
      }
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


    // device orientation input
    if(id == 'input-orientation'){
      function onDeviceOrientationChangeEvent(event) {
        console.log(event.alpha, event.beta);

        let alpha = event.alpha;
        let beta = event.beta;
        let gamma = event.gamma;
        let x = THREE.Math.degToRad(beta);
        let y = THREE.Math.degToRad(gamma);
        let z = THREE.Math.degToRad(alpha);

        $('#x').text(beta);
        $('#y').text(gamma);
        $('#z').text(alpha);

        cube.rotation.x = x;
        cube.rotation.y = y;
        cube.rotation.z = z;

        canvasOutput.updateRotation(x, y, z, 'input-orientation');
      }

      window.addEventListener('deviceorientation', onDeviceOrientationChangeEvent);
    }


  }





});
