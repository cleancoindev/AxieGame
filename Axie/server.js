'use strict';

console.log(__dirname);

const gameStates = Object.freeze({
    ACCEPTING_PLAYERS : 0,
    ROOM_FILLED : 1,
    STARTING_GAME : 2,
    AWAITING_PLAYER_INPUT : 3,
    EXECUTING_TURN : 4,
    GAME_OVER_CHECK : 5,
    GAME_ENDING : 6,
    DISTRIBUTING_REWARDS : 7,
    DELETING_GAME_ROOM : 8
});

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

    //messages for live battles
    socket.on('createGameRoom', function () {
        var index = roomIndex++;
        gameRooms[index] = createGameRoom(index);
        gameRooms[index].players[socket.id] = {
            _socket : socket,
            isReady: false
        };
    });
    socket.on('joinGameRoom', function (id) {
        if (gameRooms[id].state === gameStates.ACCEPTING_PLAYERS) {
            //socket.emit('loadOtherPlayers', gameRooms[id].players);
            gameRooms[id].players[socket.id] = {
                _socket : socket,
                isReady: false
            };
            if(Object.keys(gameRooms[id].players).length === 2){
                gameRooms[id].state = gameStates.ROOM_FILLED;
                gameRooms[id].handleNextState();
            }
        }
        else { 
            socket.emit('Error', "Room not accepting players");
        }
    });

    socket.on('playerReady', function(id){
        if(gameRooms[id]){
            if(gameRooms[id].players[socket.id]){
                gameRooms[id].players[socket.id].isReady = true;
                gameRooms[id].handleNextState();
            }
        }
    });

    socket.on('disconnect', function () {
        delete axies[socket.id];
        socket.broadcast.emit('userDisconnected', socket.id);
    });
});


function createGameRoom(_id) {
    const GAME_TICKS = 1000;
    var room = this;
    var turnTimer = {};
    var turnTickCounter = 0;
    this.id = _id;
    this.state = gameStates.ACCEPTING_PLAYERS;
    this.players = {};
    this.axies = [];
    this.handleNextState = function(){
        switch(room.state)
        {
            case gameStates.ROOM_FILLED:
            Object.keys(room.players).forEach(player => {
                player.emit('RoomFilled');
            });
            room.state = gameStates.STARTING_GAME;
            break;
            case gameStates.STARTING_GAME:
            var playersReady = false;
            Object.keys(room.players).forEach(player => {
                playersReady = player.isReady;
            });
            if(playersReady){
                room.broadcastMessage('playersReady');
            }
            room.state = gameStates.AWAITING_PLAYER_INPUT;
            turnTimer = setInterval(room.checkPlayerInput, GAME_TICKS);
            break;
        }
    };
    this.checkPlayerInput = function(){
        if(turnTickCounter === 15){
            clearInterval(turnTimer);
            turnTickCounter = 0;
            room.state = gameStates.EXECUTING_TURN;
            room.handleNextState();
        }
    };
    this.broadcastMessage = function(messageType) {
        Object.keys(room.players).foreach(player => {
            player.socket.emit(messageType);
        });
    };
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