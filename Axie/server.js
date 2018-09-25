'use strict';

console.log(__dirname);
var express = require('express');
var http = require('http');
var path = require('path');
var app = express();
var server = http.Server(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 1337;

var axies = {};

app.use('/assets' ,express.static('public'));
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
    axies[socket.id] = {
        x : 400,
        y : 300
    };
    socket.emit('idSent', {
        id : socket.id, 
        coordinates : axies[socket.id]
    });
    socket.broadcast.emit('newPlayer', {
        id : socket.id, 
        coordinates : axies[socket.id]
    });
    socket.emit('News', 'Hello world!');
    console.log('user connected');
    socket.on('echo1', function(data){
        console.log(data);
    });
    socket.on('updateAxieMovement', function(movement){
        //console.log('received data');
        if(movement.up) axies[socket.id].y -=1;
        if(movement.left) axies[socket.id].x -=1;
        if(movement.down) axies[socket.id].y +=1;
        if(movement.right) axies[socket.id].x +=1;
        socket.emit('updatedAxieMovement', axies);
    });
    socket.on('disconnect', function(){
        socket.broadcast.emit('userDisconnected', socket.id);
    });
});


server.listen(1337, function(){
    console.log("Server started. Listening on port 1337.");
});
setInterval(function() {
    io.sockets.emit('message', 'hi!');
  }, 1000);