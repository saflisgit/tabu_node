var express = require('express');
var app = express();
const port = process.env.PORT || 3000
var server = app.listen(port);
app.use(express.static('public'));

var socket = require('socket.io');
var io = socket(server);

const fs = require('fs');

let rawdata = fs.readFileSync('wordsTR.json');
var wordList = JSON.parse(rawdata);
var words = wordList.words;


io.sockets.on('connection', newConnection);


function newConnection(socket) {
    console.log("new connection : " + socket.id);

    socket.on('joinRoom', joinRoom);
    socket.on('requestWord', requestWord);

    function joinRoom(roomId) {
        if(roomId){
            console.log("socket : " + socket.id + " joining : " + roomId);       
        
            var rooms = Object.keys(io.sockets.adapter.sids[socket.id]);
            rooms.splice(rooms.indexOf(socket.id),1);
            rooms.splice(rooms.indexOf(roomId),1);

            rooms.forEach(function(room) {
                console.log("socket : " + socket.id + " Leaving from : " + room)
                socket.leave(room);
            });
            
            socket.join(roomId);
    
            var roomsUpdated = Object.keys(io.sockets.adapter.sids[socket.id]);
            console.log("rooms now : " + roomsUpdated);
        }

    }

    function leaveOthers() {

    }

    function requestWord(roomId) {
        console.log("sending word ... ");
        rndm = Math.floor(Math.random() * 800);
        let word = words[rndm];
        console.log("word : " + word + " random : " + rndm);
        io.sockets.to(roomId).emit('receiveWord', word);
    }

}


console.log("socket is running ...."); 

