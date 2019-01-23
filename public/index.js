
// TODO
// - Create prototype of instrument builder
// - Put output visualization code into its own script
// - Create a single source of truth for instrument rendering functions
//

// ideas -> collective inputs to toggle between two things
// increase of height incrementally moves toggle between text and emoji
// work together to change bigger things in the environment
//
// lower values create calmer environment
// higher values create chaotic environment
// what happens in the middle!?

// bits and bobbles



// proces for creating a controller
// 1. add to inputControls in Router with update and render functions
// 2. add listener to call router.input in render function or separate class
// 3. add route to affect one of the keeper variables


$(function () {
  var socket = io();

  let canvas, canvas3, sketch2;
  let controlWidth = 300;
  let controlHeight = 300;

  let router = new Router();

  // to use for 2D canvas
	var sketch2D = function(p){
		let buffer, size, xOrigin, yOrigin, ySize;

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
				  var index = (x + (y * ySize)) * keeper.static.variation;

				  p.pixels[index + 0] = r;
				  p.pixels[index + 1] = r;
				  p.pixels[index + 2] = r;
				  p.pixels[index + 3] = 255;
				}
			}
			p.updatePixels();
		}
	}




  function Router(){
    let controls = {};

    let inputControls = {
      'input-slider': {
        update: function(val){
          let elId = 'input-slider';
          $('#' + elId).val(val);
          if(page == 'all'){
            keeper.static.updateVariation(val);
          }
        },
        render: function(parentId){
          let elId = 'input-slider';
          let el = $("<input type='range' id='" + elId + "' />");
          el.on('input', function(){
            let val = $('#'+elId).val();
            let input = {
              type: elId,
              value: val
            }

            router.input(input);
          });

          $('#' + parentId).append(el);
        }
      },

      'input-cube': {
        update: function(val){
          controls['input-cube'].updateRotation(val.rotation.x, val.rotation.y, val.rotation.z);

          if(page == 'all'){
            keeper.mainCube.updateRotation(val.rotation);
          }
        },
        render: function(parentId){
          let el = "<div id='input-cube'></div>";
          $('#' + parentId).append(el);
          console.log('here');
          controls['input-cube'] = new Canvas(controlWidth, controlHeight, "input-cube");
        }
      },

      'input-orientation': {
        update: function(val){
          console.log(val);
          canvas3.updateRotation(val.x, val.y, val.z, 'input-orientation');

          if(page == 'all'){
            output.updateRotation(val.x, val.y, val.z, 'input-orientation');
          }
        },
        render: function(parentId){
          let el = "<div id='input-orientation'></div>";
          $('#' + parentId).append(el);
          canvas3 = new Canvas(controlWidth, controlHeight, "input-orientation");
        }
      },

      'NA': {
        render: function(parentId){
          $(document).append('<b>Try refreshing</b><br>No controls available');
        }
      }
    }

    // fired on both original value update and on all visuals
    this.input = function(inputObj){
      if(page == 'phone'){
        socket.emit('input', inputObj);
      }

      inputControls[inputObj.type].update(inputObj.value);
    }

    this.renderAllControls = function(){
      let controls = ['input-slider', 'input-cube'];
      for(let i = 0; i < controls.length; i++){
        inputControls[controls[i]].render('controls');
      }
    }
  }


  // receive input from server
  socket.on('input', function(input){
    router.input()
  });

  // receive controller assignment
  socket.on('controller', function(controllerType){
    if(page == 'phone'){
      renderInstrument(controllerType);
    }
  });

  function renderInstrument(type){
    // NOTE type is currently unused
    //inputControls[type].render();


    $('#adjust-1').on('input', function(ev){
      console.log(this.value);
      console.log(ev.target.value);
      console.log($('#adjust-1').val());
    });

  }


// take input
// feed into machine
// machine takes input and input type
// routes the input to a render function based on input type
// render function takes input and adjusts necessary values
//




  function Canvas(width, height, id){
    this.rotationSpeedX = 0.01;
    this.rotationSpeedY = 0.01;
    let isRotating = true;


    var scene = new THREE.Scene();
  	var camera = new THREE.PerspectiveCamera(75, width/height, 1, 10000);
    camera.position.z = 1000;
    camera.position.y = 300;

  	var renderer = new THREE.WebGLRenderer({ alpha: true });
  	renderer.setSize(width, height);
    console.log(document.getElementById(id));
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


    // fix for scoping 'this'
    let that = this;
  	function render() {
  		requestAnimationFrame(render);
  		renderer.render(scene, camera);
  	};

    this.updateSelfPosition = function(rotation){
      cube.rotation = rotation;
    }

    this.updateRotation = function(x, y, z, inputType){
      cube.rotation.x = x;
      cube.rotation.y = y;
      cube.rotation.z = z;
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

      if(isDragging && id == 'input-cube') {
          let deltaRotationQuaternion = new THREE.Quaternion().
          setFromEuler(
              new THREE.Euler(toRadians(deltaMove.y * 1), toRadians(deltaMove.x * 1), 0, 'XYZ')
          );

          cube.quaternion.multiplyQuaternions(deltaRotationQuaternion, cube.quaternion);

          let val = toDegrees(cube.rotation.x);
          let input = {
            type: 'input-cube',
            value: {
              rotationX: val,
              rotation: {
                x: cube.rotation.x,
                y: cube.rotation.y,
                z: cube.rotation.z
              }
            }
          };

          router.input(input);
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

        let alpha = event.alpha;
        let beta = event.beta;
        let gamma = event.gamma;
        let x = THREE.Math.degToRad(beta);
        let y = THREE.Math.degToRad(gamma);
        let z = THREE.Math.degToRad(alpha);

        $('#x').text(x);
        $('#y').text(y);
        $('#z').text(z);

        // update control's cube
        cube.rotation.x = x;
        cube.rotation.y = y;
        cube.rotation.z = z;

        let inputObj = {
          x: x,
          y: y,
          z: z
        }

        // update output cube
        output.updateRotation(x, y, z, 'input-orientation');
        socket.emit('input', {
          type: 'input-orientation',
          value: inputObj
        });
      }

      window.addEventListener('deviceorientation', onDeviceOrientationChangeEvent);
    }


  }


  window.addEventListener('beforeunload', function () {
     socket.disconnect();
  });


  if (page == 'all'){

    // create p5 instance
  	sketch2 = new p5(sketch2D, 'container2D');

    router.renderAllControls();
  } else if (page == 'phone'){

    // ask server for a controller
    socket.emit('getController');
  }



});
