
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



// Possible words for abstractions
//
// colonialism
// encouragement
// money
// sharing
// care
// ideology
//

$(function () {
  var socket = io();

  let canvas, canvas3, sketch2;
  let controlWidth = 300;
  let controlHeight = 300;

  let router = new Router();

  if(page == 'phone'){
    // setup events for navigation
    let controlContainer = $('#controls');
    let typeContainer = $('#type');

    // transition to use control
    $('#nav-control').click(function(){
      typeContainer.fadeOut(200, function(){
        typeContainer.hide();

        controlContainer.fadeIn(200, function(){
          $(controlContainer).css('opacity', 1);
        });
      });

      $('#nav-control').addClass('nav-item--is-active');
      $('#nav-type').removeClass('nav-item--is-active');
    });

    // transition to type emotion
    $('#nav-type').click(function(){
      controlContainer.fadeOut(200, function(){
        controlContainer.hide();

        typeContainer.fadeIn(200, function(){
          $(typeContainer).css('opacity', 1);
          $('#input-emotion').focus();
        });
      });

      $('#nav-type').addClass('nav-item--is-active');
      $('#nav-control').removeClass('nav-item--is-active');
    });

    // watch for emotion input typing
    document.getElementById('input-emotion').addEventListener('input', function(e){
      let str = e.srcElement.innerText;

      let input = {
        type: 'type-emotion',
        value: str
      };
      router.input(input);
    });
  }

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
	};

  let colorWheel1, colorWheel2;

  function handleColorChange1(colorObj){
    let input = {
      type: 'input-color-1',
      value: {
        colorObj: colorObj,
        wheelObj: colorWheel1
      }
    };
    router.input(input);
  }

  function handleColorChange2(colorObj){
    let input = {
      type: 'input-color-2',
      value: {
        colorObj: colorObj,
        wheelObj: colorWheel2
      }
    };
    router.input(input);
  }


  function Router(){
    let controlsParentId = 'controls';
    let controls = {};

    let inputControls = {
      // 'input-color-1': {
      //   update: function(val){
      //     let elId = 'input-color-1';
      //
      //     if(page == 'all'){
      //       val.wheelObj.color.set(val.colorObj.hsv);
      //       keeper.color.updateColor('1', val.colorObj.hexString);
      //     }
      //   },
      //   render: function(parentId){
      //     let elId = 'input-color-1';
      //     let el = $("<div id='" + elId + "' />");
      //     $('#' + parentId).append(el);
      //
      //     colorWheel1 = new iro.ColorPicker("#"+elId, {
      //       color: '#fff',
      //       padding: 6,
      //       borderWidth: 0,
      //       borderColor: '#fff',
      //       display: 'block',
      //       anticlockwise: false,
      //       width: 320,
      //       height: 320,
      //       sliderHeight: undefined,
      //       sliderMargin: 24,
      //       markerRadius: 8,
      //       wheelLightness: undefined,
      //     });
      //
      //     colorWheel1.on('color:change', debounce(handleColorChange, 250, false));
      //   }
      // },

      'input-color-1': {
        update: function(val){
          let elId = 'input-color-1';

          if(page == 'all'){
            $("#" + elId).spectrum("set", val);
            keeper.color.updateColor('1', val);
          }
        },
        render: function(parentId){
          let elId = 'input-color-1';
          let el = $("<input type='range' id='" + elId + "' />");

          $('#' + parentId).append(el);

          $("#" + elId).spectrum({
              flat: true,
              showInput: false,
              allowEmpty:false,
              move: function(color){
                let hex = color.toHexString();

                let input = {
                  type: elId,
                  value: hex
                };
                router.input(input);
              }
          });
        }
      },

      'input-color-2': {
        update: function(val){
          let elId = 'input-color-2';

          if(page == 'all'){
            $("#" + elId).spectrum("set", val);
            keeper.color.updateColor('2', val);
          }
        },
        render: function(parentId){
          let elId = 'input-color-2';
          let el = $("<input type='range' id='" + elId + "' />");

          $('#' + parentId).append(el);

          $("#" + elId).spectrum({
              flat: true,
              showInput: false,
              allowEmpty:false,
              move: function(color){
                let hex = color.toHexString();

                let input = {
                  type: elId,
                  value: hex
                };
                router.input(input);
              }
          });
        }
      },

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
          controls['input-cube'].updatePosition(val.position.x, val.position.y, val.position.z);

          if(page == 'all'){
            keeper.mainCube.updateRotation(val.rotation);
            keeper.mainCube.updateScale(val.position.y);
          }
        },
        render: function(parentId){
          let el = "<div id='input-cube'></div>";
          $('#' + parentId).append(el);
          controls['input-cube'] = new Canvas(controlWidth, controlHeight, "input-cube");
        }
      },

      'input-cube-amp': {
        update: function(val){
          controls['input-cube-amp'].updateRotation(val.rotation.x, val.rotation.y, val.rotation.z);
          controls['input-cube-amp'].updatePosition(val.position.x, val.position.y, val.position.z);

          if(page == 'all'){
            // console.log('position.y: ', val.position.y)
            // console.log('rotation.x: ', val.rotation.x)
            let mappedY = THREE.Math.mapLinear(val.position.y, 0, 350, 1, 2);
            // console.log('mappedY: ', mappedY);
            let combinedVal = val.rotationX * mappedY;


            keeper.sphere1.updateAmplitude(combinedVal);
          }
        },
        render: function(parentId){
          let el = "<div id='input-cube-amp'></div>";
          $('#' + parentId).append(el);
          controls['input-cube-amp'] = new Canvas(controlWidth, controlHeight, "input-cube-amp");
        }
      },

      'input-orientation': {
        update: function(val){
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

      'button-rotate': {
        update: function(val){
          if(page == 'all'){
            keeper.mainCube.toggleRotating();
          }
        },
        render: function(parentId){
          let elId = 'button-rotate';
          let el = $("<input type='button' id='" + elId + "' />");
          el.on('click', function(){
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

      'type-emotion': {
        update: function(val){
          if(page == 'all'){
            keeper.emotion.updateText(val);
          }
        }
      },

      'input-cube-river': {
        update: function(val){
          controls['input-cube-river'].updateRotation(val.rotation.x, val.rotation.y, val.rotation.z);
          controls['input-cube-river'].updatePosition(val.position.x, val.position.y, val.position.z);

          if(page == 'all'){
            keeper.river.setSpeed(val.position.y);
          }
        },
        render: function(parentId){
          let el = "<div id='input-cube-river'></div>";
          $('#' + parentId).append(el);
          controls['input-cube-river'] = new Canvas(controlWidth, controlHeight, "input-cube-river");
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
      let controls = ['input-slider', 'input-cube', 'input-cube-amp', 'input-color-1', 'input-color-2', 'input-cube-river'];
      for(let i = 0; i < controls.length; i++){
        inputControls[controls[i]].render(controlsParentId);
      }
    }

    this.renderControl = function(controlId){
      inputControls[controlId].render(controlsParentId);
    }
  }


  // receive input from server
  socket.on('input', function(input){
    if(page == 'all'){
      router.input(input)
    }
  });

  // receive controller assignment
  socket.on('controller', function(controllerId){
    if(page == 'phone'){
      router.renderControl(controllerId);
      $('#controls').animate({
        opacity: 1
      }, 200, function() {
        // Animation complete.
        console.log('done');
        $(this).css('opacity', 1);
      });
    }
  });



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

    // if(page == 'phone') {
    //   let phoneScale = 3;
    //   width = width * phoneScale;
    //   height = height * phoneScale;
    // }


    var scene = new THREE.Scene();
  	var camera = new THREE.PerspectiveCamera(75, width/height, 1, 10000);
    camera.position.z = 1000;
    camera.position.y = 300;

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


    // fix for scoping 'this'
    let that = this;
  	function render() {
  		requestAnimationFrame(render);
  		renderer.render(scene, camera);
  	};

    this.updateRotation = function(x, y, z){
      cube.rotation.x = x;
      cube.rotation.y = y;
      cube.rotation.z = z;
    }

    this.updatePosition = function(x, y, z){
      cube.position.x = x;
      cube.position.y = y;
      cube.position.z = z;
    }


    // create a grid
    var gridSize = 400;
    var gridDivisions = 5;

    var gridHelper = new THREE.GridHelper( gridSize, gridDivisions, 0xff0000, 0xff0000);
    gridHelper.position.y = -100;
		gridHelper.position.x = 0;
    // gridHelper.geometry.rotateX( Math.PI / 10 );
    scene.add( gridHelper );

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

    let renderArea;
    if(page == 'phone'){
      renderArea = document;
    } else {
      renderArea = renderer.domElement;
    }


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

      let rotatingRight = true;

      if(isDragging) {
          // let deltaRotationQuaternion = new THREE.Quaternion().
          // setFromEuler(
          //     new THREE.Euler(toRadians(deltaMove.y * 1), toRadians(deltaMove.x * 1), 0, 'XYZ')
          // );


          // update rotation around Y axis
          let deltaRotationQuaternion = new THREE.Quaternion().
          setFromEuler(
              new THREE.Euler(0, toRadians(deltaMove.x * 1), 0, 'XYZ')
          );
          cube.quaternion.multiplyQuaternions(deltaRotationQuaternion, cube.quaternion);


          // update position and eventually size

          let direction = null;
          if (offsetX > previousMousePosition.x && offsetY > previousMousePosition.y) {
            // direction="bottom-right";
            direction = "down";
          }
          else if (offsetX > previousMousePosition.x && offsetY < previousMousePosition.y) {
            // direction="top-right";
            direction = "up";
          }
          else if (offsetX < previousMousePosition.x && offsetY < previousMousePosition.y) {
              // direction="top-left";
              direction = "up";
          }
          else if (offsetX < previousMousePosition.x && offsetY > previousMousePosition.y) {
              // direction="bottom-left";
              direction = "down";
          }
          else if (offsetX == previousMousePosition.x && offsetY > previousMousePosition.y) {
              direction = "down";
          }
          else if (offsetX == previousMousePosition.x && offsetY < previousMousePosition.y) {
              direction = "up";
          }



          let moveDelta = 15;

          if(direction == "up"){
            cube.position.y += moveDelta;
          } else if (direction == "down"){
            cube.position.y -= moveDelta;
          }



          let val = toDegrees(cube.rotation.y);


          let rotationMax = Math.PI;

          let rotationMin = 0;
          if(cube.rotation.y > rotationMax) {
            cube.rotation.y = rotationMax
          } else if (val < 0) {
            // cube.rotation.y = toRadians(rotationMin);
          }

          // if(rotatingRight){
          //   if(val > rotationMax){
          //
          //   }
          // }


          // console.log('rotation.y origin: ', cube.rotation.y);
          let input = {
            type: id,
            value: {
              rotationX: val,
              rotation: {
                x: cube.rotation.x,
                y: cube.rotation.y,
                z: cube.rotation.z
              },
              position: {
                x: cube.position.x,
                y: cube.position.y,
                z: cube.position.z
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

// found online somewhere
function debounce(func, wait, immediate) {
  var timeout;
  return function() {
    var context = this, args = arguments;
    var later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
};
