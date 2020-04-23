var socket;
var input;
var roomId;
var hide = true;
var taboo ;
var arrow ; 
var timer;
var pause = true;
var joined = false;
var fixTime = 60;
var anti = {};
var cnv;
var team = 'blue';
var turn = 'blue';
var bgColor = [10, 28, 54];
var turnTaken = false;
var activePlayer = false;



function setup() {
    cnv = createCanvas(windowWidth /7 * 6, windowHeight / 7 * 6);
    cnv.position(windowWidth / 2 - width / 2, windowHeight / 2 - height / 2 - 30);
    let HOST = location.origin.replace(/^http/, 'ws')
    console.log(HOST)
    socket = io.connect(HOST);
    
    socket.on('receiveWord', receiveWord);
    socket.on('startTime', gotStart);
    socket.on('pause', gotPause);
    socket.on('resume', gotResume);
    socket.on('message',showMessage)
    socket.on('join',gotJoin);
    socket.on('leave',gotLeave);
    socket.on('resetGame',resetGame);

    anti['red'] = 'blue';
    anti['blue'] = 'red';

    textFont('Georgia');
    taboo = new Taboo();
    arrow = new Arrow(); 
    timer = new Timer();   

    roomInput = createInput().attribute('placeholder', 'Room ID');
    roomInput.position(cnv.position().x + width/2 - roomInput.width/2 , cnv.position().y + height/2 - roomInput.height/2 )    
}

function draw() {
    
    background(bgColor);
    taboo.show();
    arrow.show();
    timer.show();
}


function touchStarted(event) {
    if (event.type == 'touchstart') return true;
    if (mouseX < width && mouseX > width / 3 * 2 && activePlayer) {
        requestWord();
    }else if(mouseY < height && mouseY > height / 3 * 2){
            if(pause && turn == team && joined){
                sendResume();
                requestWord(); 
                   
            } 
        
    }else if(dist(mouseX,mouseY,80, height/2)< 60){
        if(!joined){
            if(team === 'red'){
                team = 'blue'
                bgColor = [10, 28, 54];
            }else{
                team = 'red'
                bgColor = [165, 42, 42];
            }
        }
        
    }else if(dist(mouseX,mouseY,width/2, height/2 + 80) < 150) {
        if(roomInput.value()){
            joinRoom();
        }
    }
}


function resetGame() {
    turn = 'blue';
    turnTaken = false;
    activePlayer = false;
    pause = true;
    taboo.word = { keyword: "New", taboo_words: ["Player", "Joined", "Game", "Restared!!"] }
}

function gotTurnTaken() {
    turnTaken = true;
}


function showMessage(msg) {
    console.log("msg : " + msg)
}

function sendPause(nextTeam) {
    socket.emit('pause', nextTeam);
}
function sendResume() {
    if(turn == team && !turnTaken){
        socket.emit('resume');
        activePlayer = true;
    }
    
}

function gotPause(nextTeam) {
    pause = true;
    turnTaken = false;
    activePlayer = false;
    turn = nextTeam;

}

function gotResume() {
    pause = false;
    timer.resume();
}

function sendFixTime() {
    socket.emit('fixTime');
}

function gotStart() {
    timer.time = new Date();
    
}

function joinRoom() {
    roomId = roomInput.value();
    if(roomId){
        socket.emit('joinRoom', roomId);
    } 
    roomInput.value('');
}



function gotJoin() {
    joined = true;
    hide = false;
    roomInput.position(cnv.position().x + width/2 - roomInput.width/2 , cnv.position().y + height );
}

function gotLeave() {
    joined = false;
    hide = true;
    roomInput.position(cnv.position().x + width/2 - roomInput.width/2 , cnv.position().y + height/2 - roomInput.height/2 )
}


function requestWord() {
    socket.emit('requestWord', roomId);
}

function receiveWord(word) {
    taboo.word = word;
}

function Arrow() {
    this.x = width - width / 6 + 20;
    this.y = height / 2
    this.show = function () {
        triangle(this.x, this.y - 20, this.x, this.y + 20, this.x + 20, this.y);
        fill(255)
        textSize(30);
        textAlign(CENTER)
        if(roomInput.value() || !joined){
            text("JOIN ROOM",width/2, height/2 + 80);
        }else if(pause){
            text("START",width/2, height- 40);
        }
        
        ellipse(80, height/2, 40, 40);
        if(!joined){
            fill(bgColor)
            ellipse(80, height/2, 20, 20);
            fill(255)
            textSize(30)
            text(team.toUpperCase(),80, height/2 + 50);
        }

    }
}

function Timer() {
    this.time = new Date();
    this.totalTime = fixTime;

    this.show = function () {
        if(!pause){
            timeLeft =this.totalTime - this.getSeconds();
            if(timeLeft <= 0 && activePlayer){
                sendPause(anti[team]);
            }
            text( " " + timeLeft, width-60, height -50);
        }
    }

    this.getSeconds = function () {
        now = new Date();
        seconds = now - this.time;
        seconds = Math.round(seconds / 1000);
        return seconds;
    }

    this.resume = function () {
        this.time = new Date();
    }
}




function Taboo() {
    this.word = { keyword: "Hey!", taboo_words: ["This", "Is", "An", "Idle", "Word"] }
    this.show = function () {
        if(!hide && (activePlayer || turn != team)){
            textAlign(CENTER);
            let tSize = height/15;
            fill(255, 255, 255);
            
            var textPosition = tSize ;
            textSize(tSize);
            if(this.word.keyword.length >= 10){
                textSize(tSize/3 * 2);
            }
            text(this.word.keyword.toUpperCase(), width / 2, textPosition);
            textPosition += 30;
            textSize(tSize);
            this.word.taboo_words.forEach(taboo => {
                textPosition += tSize +10;
                if(taboo.length >= 10){
                    textSize(tSize/3 * 2);
                }
                text(taboo.toUpperCase(), width / 2, textPosition);
                textSize(tSize);
            });
            
            stroke(255, 255, 255)
            strokeWeight(8.0);
            line(0, tSize + 20, width, tSize + 20)
            strokeWeight(1.4);
        }else if( !hide && turn === team ){
            text(turn.toUpperCase() + " team's turn", width / 2, height/2);
        }
    }

    this.update = function () {

    }
}