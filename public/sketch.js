var socket;
var input;
var roomId;
var hide = false;
var taboo ;
var arrow ; 
var timer;
var pause = true;
var fixTime = 30;

var deneme = "melihsinandaaaa"



function setup() {
    let cnv = createCanvas(windowWidth /7 * 6, windowHeight / 7 * 6);
    cnv.position(windowWidth / 2 - width / 2, windowHeight / 2 - height / 2 - 30);
    let HOST = location.origin.replace(/^http/, 'ws')
    console.log(HOST)
    socket = io.connect(HOST);
    
    socket.on('receiveWord', receiveWord);
    socket.on('startTime', countDown);
    socket.on('pause', gotPause);
    socket.on('resume', gotResume);
    socket.on('message',showMessage)

    textFont('Georgia');
    taboo = new Taboo();
    arrow = new Arrow(); 
    timer = new Timer();   

/*  passBtn = createButton('pass');
    passBtn.mousePressed(sendPass);
    passBtn.position(width/2, height/2)
*/
    roomInput = createInput().attribute('placeholder', 'Room Name');;  
    roomInput.position(cnv.position().x + width/2 - roomInput.width/2 , cnv.position().y + height );
    
}

function sendPass() {
    textSize(40)
    console.log("pass pressed"  + textWidth(deneme) + " width : " + width)
}



function mouseClicked(event) {
    if (mouseX < width && mouseX > width / 3 * 2) {
        requestWord();
    }else if(mouseY < height && mouseY > height / 3 * 2){
        if(roomInput.value()){
            joinRoom();
        }else{
            if(pause){
                sendResume()
            }else{
                //sendPause()
            }
        }
        
    }else if(mouseX > 0 && mouseX < width / 3){
        hide = !hide;
        
    }
}

function showMessage(msg) {
    console.log("msg : " + msg)
}

function sendPause() {
    socket.emit('pause');
}
function sendResume() {
    socket.emit('resume');
}

function gotPause() {
    pause = true;
}

function gotResume() {
    pause = false;
    timer.resume();
}

function sendFixTime() {
    socket.emit('fixTime');
}

function countDown() {
    timer.time = new Date();
}

function draw() {
    background(10, 28, 54);
    taboo.show();
    arrow.show();
    timer.show();
}

function joinRoom() {
    roomId = roomInput.value();
    if(roomId){
        socket.emit('joinRoom', roomId);
        requestWord();
    } 
    roomInput.value('');
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
        textSize(30);
        if(roomInput.value()){
            text("JOIN ROOM",width/2, height- 40);
        }else if(pause){
            text("START",width/2, height- 40);
        }
        
        ellipse(80, height/2, 40, 40);
        if(hide){
            textSize(30)
            textAlign(CENTER)
            text("show",80, height/2 + 60 );
        }else{
            textSize(30)
            textAlign(CENTER)
            text("hide",80, height/2 - 40 );
        }
    }
}

function Timer() {
    this.time = new Date();
    this.totalTime = fixTime;

    this.show = function () {
        if(!pause){
            timeLeft =this.totalTime - this.getSeconds();
            if(timeLeft <= 0){
                sendPause();
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
    this.word = { keyword: deneme, taboo_words: ["Room", "Tap", "Start", "Enjoy", "Game"] }
    this.show = function () {
        if(!hide){
            textAlign(CENTER);
            let tSize = height/15;
            fill(139, 142, 124);
            
            var textPosition = tSize ;
            textSize(tSize);
            text(this.word.keyword.toUpperCase(), width / 2, textPosition);
            textPosition += 30;
    
            this.word.taboo_words.forEach(taboo => {
                textPosition += tSize +10;
                text(taboo.toUpperCase(), width / 2, textPosition);
            });
            
            stroke(139, 142, 124)
            strokeWeight(8.0);
            line(0, tSize + 20, width, tSize + 20)
            strokeWeight(1.4);
        }
    }

    this.update = function () {

    }
}