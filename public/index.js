$(function () {
  var socket = io();
  let canvas = new Canvas(200, 200, "input-cube");
  let canvas2 = new Canvas(200, 200, "output")

  let slider = document.getElementById('slider');
  slider.addEventListener('input', function(){
    let val = $('#slider').val();
    console.log(val);
    socket.emit('slider update', val);
    canvas.updateRotationX(val);
  });

  socket.on('slider update', function(val){
    console.log(val);
    $('#slider').val(val);
    canvas.updateRotationX(val);
  });


  function Canvas(height, width, id){
    this.rotationX = 0.01;
    this.rotationY = 0.01;



    var scene = new THREE.Scene();
  	var camera = new THREE.PerspectiveCamera(75, width/height, 1, 10000);

  	var renderer = new THREE.WebGLRenderer({ alpha: true });
  	renderer.setSize(width, height);
  	document.getElementById(id).appendChild(renderer.domElement);

    let boxSize = 500;
  	var geometry = new THREE.BoxGeometry(boxSize, boxSize, boxSize, 1, 1, 1);
    // var wireframe_material = new THREE.MeshBasicMaterial( { color: 0xffff, wireframe: true, wireframe_linewidth: 2 } );
    // // new THREE.Mesh( new Cube( 100, 100,100 ), [ new THREE.MeshBasicMaterial( { color: 0xff0000 } ), wireframe_material ] );
    //
  	var material = new THREE.MeshBasicMaterial({color: 0xffffff});
  	var cube = new THREE.Mesh(geometry, material);
    // var cube = new THREE.Mesh( geometry, [ new THREE.MeshBasicMaterial( { color: 0xff0000 } ), new THREE.MeshBasicMaterial( { color: 0x000000, wireframe: true, wireframe_linewidth: 10 } ) ] );

  	scene.add(cube);

    var geo = new THREE.EdgesGeometry( cube.geometry );
    var mat = new THREE.LineBasicMaterial( { color: 0x000000, linewidth: 10} );
    var wireframe = new THREE.LineSegments( geo, mat );
    wireframe.renderOrder = 1; // make sure wireframes are rendered 2nd
    cube.add( wireframe );

    camera.position.z = 1000;

    // fix for scoping 'this'
    let that = this;
  	function render() {
  		requestAnimationFrame(render);

  	  // cube.rotation.x = that.rotationX;
  		// cube.rotation.y += that.rotationY;

      if(!isDragging){
        cube.rotation.y = that.rotationX;
      }

  		renderer.render(scene, camera);
  	};

    this.updateRotationX = function(val){
      let newVal;

      switch(id){
        case "input-cube":
          // receiving from slider
          newVal = THREE.Math.mapLinear(val, 0, 100, 0, Math.PI);
          break;
        case "output":
          // receiving from other cube
          newVal = THREE.Math.mapLinear(val, 0, 178, 0, Math.PI);
          console.log(newVal);
          break;
      }

      // console.log(sliderVal);
      this.rotationX = newVal;
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

    renderArea.addEventListener('mousedown', (e) => {
        isDragging = true;
    });

    renderArea.addEventListener('mousemove', (e) => {
        var deltaMove = {
            x: e.offsetX-previousMousePosition.x,
            y: e.offsetY-previousMousePosition.y
        };

        if(isDragging) {
            let deltaRotationQuaternion = new THREE.Quaternion().
            setFromEuler(
                new THREE.Euler(toRadians(deltaMove.y * 1), toRadians(deltaMove.x * 1), 0, 'XYZ')
            );

            cube.quaternion.multiplyQuaternions(deltaRotationQuaternion, cube.quaternion);

            if(id == "input-cube"){
              console.log(toDegrees(cube.rotation.x));
              canvas2.updateRotationX(toDegrees(cube.rotation.x));
            }
        }

        previousMousePosition = {
            x: e.offsetX,
            y: e.offsetY
        };
    });

    document.addEventListener('mouseup', (e) => {
        isDragging = false;
    });


  }


});
