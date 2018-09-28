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
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', 'http://http://86.143.229.152:1337');
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:1337/');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    next();
});
app.use('/assets' ,express.static('public'));
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
    socket.emit('idSent', {
        id: socket.id,
        coordinates: {x: 400, y: 300}
    });
    socket.on('axieLoaded', function () {
        socket.emit('loadOtherPlayers', axies);
    });
    axies[socket.id] = {
        x: 400,
        y: 300
    };
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
        if(movement.up) axies[socket.id].y -=2;
        if(movement.left) axies[socket.id].x -=2;
        if(movement.down) axies[socket.id].y +=2;
        if(movement.right) axies[socket.id].x +=2;
        socket.emit('updatedAxieMovement', axies);
    });
    socket.on('disconnect', function () {
        delete axies[socket.id];
        socket.broadcast.emit('userDisconnected', socket.id);
    });
});


server.listen(1337, function(){
    console.log("Server started. Listening on port 1337.");
});