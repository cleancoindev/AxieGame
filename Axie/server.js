'use strict';

console.log(__dirname);
var http = require('http');
var port = process.env.PORT || 1337;
var express = require('express');
var app = express();
app.use('/assets' ,express.static('public'));
var serv = require('http').Server(app);
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});
serv.listen(1337);
console.log("Server started.");