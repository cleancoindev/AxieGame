'use strict';

console.log(__dirname);
var express = require('express');
var request = require('request');
var http = require('http');
var path = require('path');
var app = express();
var server = http.Server(app);
var io = require('socket.io')(server);
//var react = require('react')(server);
var port = process.env.PORT || 1337;
const AXIE_SPEED = 10;

var axies = {};
var entryPool = {}; 
var gameRooms = {};
var roomIndex = 1;
//app.use(function (req, res, next) {
    //res.setHeader('Access-Control-Allow-Origin', 'http://http://86.143.229.152:1337');
    //res.setHeader('Access-Control-Allow-Origin', 'http://localhost:1337/');
   // res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    //next();
//});
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
    console.log('user connected');
    socket.on('updateAxieMovement', function(movement){
        //console.log('received data');
        if (movement.up) axies[socket.id].y -= AXIE_SPEED;
        if (movement.left) axies[socket.id].x -= AXIE_SPEED;
        if (movement.down) axies[socket.id].y += AXIE_SPEED;
        if (movement.right) axies[socket.id].x += AXIE_SPEED;
        io.sockets.emit('updatedAxieMovement', axies);
    });

    socket.on('createGameRoom', function () {
        gameRooms[roomIndex++] = createGameRoom();
        gameRooms[id].players[socket.id] = axie[socket.id];
    });
    socket.on('joinGameRoom', function (id) {
        if (gameRooms[id].players < 4) {
            socket.emit('loadOtherPlayers', gameRooms[id].players);
            gameRooms[id].players[socket.id] = axie[socket.id];

        }
        else { }//send cant join
    });

    socket.on('disconnect', function () {
        delete axies[socket.id];
        socket.broadcast.emit('userDisconnected', socket.id);
    });
});


function createGameRoom() {
    //this.id = _id;
    this.players = {};
    this.acceptingPlayers = true;
    return this;
}

function fetchAxie(index) {
    request('https://api.axieinfinity.com/v1/axies/' + index, (error, response, body) => {
        if (!error && response.statusCode === 200) {
            return JSON.parse(body);
        }
    }); 
}

server.listen(1337, function(){
    console.log("Server started. Listening on port 1337.");
});