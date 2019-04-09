var express = require('express')
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

let shelf = new Shelf(
  ['input-cube-amp', 'input-slider', 'input-cube', 'input-color-1', 'input-color-2']
);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/index.html');
});

app.get('/phone', function(req, res){
  res.sendFile(__dirname + '/public/phone.html');
});

app.get('/new-world', function(req, res){
  res.sendFile(__dirname + '/public/new-world.html');
});

app.use("/public", express.static(__dirname + '/public'));
app.use("/fonts", express.static(__dirname + '/public/fonts'));

http.listen(port, function(){
  console.log('listening on *:' + port);
});

io.on('connection', function(socket){

  socket.on('getController', function(){
    let controller = shelf.pickController(socket.id);
    console.log(socket.id);
    console.log(controller);
    socket.emit('controller', controller);

    console.log('a friend is now using: ' + controller);
  });

  socket.on('input', function(inputObj){
    io.emit('input', inputObj);
  });

  socket.on('disconnect', function(){
    shelf.putControllerBack(socket.id);

    console.log('disconnected');
  });
});



function Shelf(availableObjects){
  let friends = {};

  // pick up a controller from the shelf
  this.pickController = function(id){
    let controller;
    if(availableObjects.length > 0){
      let num = Math.floor(Math.random() * ((availableObjects.length - 1) - 0) + 0);
      controller = availableObjects[num];
      friends[id] = controller;
      console.log(availableObjects);
      availableObjects.splice(num, 1);
    } else {
      controller = 'NA';
    }

    return controller;
  }

  // put the friends controller back
  this.putControllerBack = function(id){
    let addBack = friends[id];

    if(addBack != undefined) {
      availableObjects.push(friends[id]);
    }

    console.log('adding back:');
    console.log(friends[id]);
    delete friends[id];
  }
}
