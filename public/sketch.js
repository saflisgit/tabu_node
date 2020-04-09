var socket;
var input;
var roomId;
var hide = false;
var taboo ;
var arrow ; 


function setup() {
    let cnv = createCanvas(windowWidth /4 * 3, windowHeight / 4 * 3);
    cnv.position(windowWidth / 2 - width / 2, windowHeight / 2 - height / 2 - 50);
    socket = io.connect('http://localhost:3000');
    textFont('Georgia');
    socket.on('receiveWord', receiveWord);

    taboo = new Taboo();
    arrow = new Arrow();    

    roomInput = createInput();
    console.log()
    
    roomInput.position(cnv.position().x + width/2 - roomInput.width/2 , cnv.position().y + height );



}

function mouseClicked(event) {
    if (mouseX < width && mouseX > width / 3 * 2) {
        requestWord();
    }else if(mouseY < height && mouseY > height / 3 * 2){
        joinRoom();
    }else if(mouseX > 0 && mouseX < width / 3){
        hide = !hide;
    }
}



function draw() {
    background(0);
    taboo.show();
    arrow.show();
}

function joinRoom() {
    roomId = roomInput.value();
    socket.emit('joinRoom', roomId);
    requestWord();
}

function requestWord() {
    console.log("word requested .. ");
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
        text("JOIN ROOM",width/2, height- 40);
        ellipse(80, height/2, 40, 40);
    }
}


function Taboo() {
    this.word = { keyword: "word", taboo_words: ["taboo", "taboo1", "taboo2"] }
    this.show = function () {
        if(!hide){
            textAlign(CENTER);
            textSize(50);
            fill(255, 255, 255);
            var textPosition = 70;
    
            text(this.word.keyword.toUpperCase(), width / 2, textPosition);
            textPosition += 30;
    
            this.word.taboo_words.forEach(taboo => {
                textPosition += 70;
                text(taboo.toUpperCase(), width / 2, textPosition);
            });
            
            stroke(255)
            strokeWeight(12.0);
            line(0, 100, width, 100)
            strokeWeight(2.0);
        }
    }

    this.update = function () {

    }
}