var express = require('express')
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/index.html');
});

app.get('/phone', function(req, res){
  res.sendFile(__dirname + '/public/phone.html');
});

app.use("/public", express.static(__dirname + '/public'));

http.listen(port, function(){
  console.log('listening on *:' + port);
});

io.on('connection', function(socket){
  console.log('connected');

  socket.on('slider update', function(val){
    console.log(val);
    io.emit('slider update', val);
  });
});

io.on('disconnect', function(socket){
  console.log('disconnected');
});
