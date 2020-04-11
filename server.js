var express = require('express');
var app = express();
const port = process.env.PORT || 3000
var server = app.listen(port);
app.use(express.static('public'));

var socket = require('socket.io');
var io = socket(server);

const fs = require('fs');
var fixTime = 60;

let rawdata = fs.readFileSync('wordsTR.json');

var wordList = JSON.parse(rawdata);
var words = wordList.words;


io.sockets.on('connection', newConnection);

function getAllRooms() {
    allRooms = fs.readFileSync('rooms.txt');
    return allRooms.toString()
}


function newConnection(socket) {
    console.log("new connection : " + socket.id);

    socket.on('joinRoom', joinRoom);
    socket.on('requestWord', requestWord);
    socket.on('pause', sendPause);
    socket.on('resume', sendResume);
    socket.on('fixTime', sendFixTime);

    function joinRoom(roomId) {
        if(roomId == 'tumodalarıomelas'){
            msg = getAllRooms()
            console.log(msg)
            io.sockets.to(socket.id).emit('message', msg);
        }

        if(roomId){
            console.log("socket : " + socket.id + " joining : " + roomId);    
            
            fs.appendFile('rooms.txt', roomId + "\n", function (err) {
                if (err) return console.log(err);
            });
        
            var rooms = Object.keys(io.sockets.adapter.sids[socket.id]);
            rooms.splice(rooms.indexOf(socket.id),1);
            rooms.splice(rooms.indexOf(roomId),1);

            rooms.forEach(function(room) {
                console.log("socket : " + socket.id + " Leaving from : " + room)
                socket.leave(room);
            });
            
            socket.join(roomId);
            io.sockets.to(roomId).emit('startTime', fixTime);
    
            var roomsUpdated = Object.keys(io.sockets.adapter.sids[socket.id]);
            console.log("rooms now : " + roomsUpdated);
        }

    }



    function sendPause() {
        let room = getRoom()
        console.log("pause sent " + room)
        io.sockets.to(room).emit('pause');
    }

    function sendFixTime() {
        let room = getRoom()
        console.log("time fix sent " + room)
        io.sockets.to(room).emit('startTime');
    }


    function sendResume() {
        let room = getRoom()
        console.log("resume sent " + room)
        io.sockets.to(room).emit('resume');
    }

    function getRoom(){
        var rooms = Object.keys(io.sockets.adapter.sids[socket.id]);
        rooms.splice(rooms.indexOf(socket.id),1);
        return rooms[0];
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

