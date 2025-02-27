class SnakeGame {
    #xDir;
    #yDir;
    #maxX;
    #maxY;
    #snakePositions;
    #dot;
    #skipFrequency;

    constructor() {
        this.#xDir = 1;
        this.#yDir = 0;
        this.#maxX = 30;
        this.#maxY = 14;
        this.#snakePositions = [[5,6],[4,6],[3,6]];
        this.#dot = null;
        this.#skipFrequency = 6; //How many frame updates between each snake move.
        this.#setNewDot();
    }
    getSnakeLength(){
        return this.#snakePositions.length;
    }
    getSkipFrequency(){
        return this.#skipFrequency;
    }
    setDir(key) {
        if ((key=="ArrowUp" || key=="KeyW") && this.#yDir!=1){
            this.#xDir = 0;
            this.#yDir = -1;
            return true;
        } else if ((key=="ArrowLeft" || key=="KeyA") && this.#xDir!=1){
            this.#xDir = -1;
            this.#yDir = 0;
            return true;
        } else if ((key=="ArrowDown" || key=="KeyS") && this.#yDir!=-1){
            this.#xDir = 0;
            this.#yDir = 1;
            return true;
        } else if ((key=="ArrowRight" || key=="KeyD") && this.#xDir!=-1){
            this.#xDir = 1;
            this.#yDir = 0;
            return true;
        }
        return false;
    }
    #setNewDot() {
        var foundLegalPlace = false;
        while (foundLegalPlace==false) {
            this.#dot = [Math.floor(Math.random()*(this.#maxX+1)),Math.floor(Math.random()*(this.#maxY+1))];
            foundLegalPlace = true;
            //Check if snake occupies the dot position:
            for (var i=0;i<this.#snakePositions.length;i++) {
                if (this.#dot[0]==this.#snakePositions[i][0] && this.#dot[1]==this.#snakePositions[i][1]) {
                    foundLegalPlace = false;
                }
            }
            //Check if dot is right in front of snake:
            if (this.#snakePositions[0][0]+this.#xDir==this.#dot[0] && this.#snakePositions[0][1]+this.#yDir==this.#dot[1]){
                foundLegalPlace = false;
            }
        }
    }
    move() {
        if (!this.#isLegalMove(this.#snakePositions[0][0]+this.#xDir, this.#snakePositions[0][1]+this.#yDir)) {
            return false;
        }
        //Moves snake, returns whether we're still in game or not (game over)
        if (this.#dot[0]==this.#snakePositions[0][0]+this.#xDir && this.#dot[1]==this.#snakePositions[0][1]+this.#yDir){
            //Eating dot, lenthening snake, moving snake
            this.#snakePositions.push(this.#snakePositions[this.#snakePositions.length-1])
            for (var i=this.#snakePositions.length-2;i>0;i--){
                this.#snakePositions[i] = [this.#snakePositions[i-1][0],this.#snakePositions[i-1][1]];
            }
            this.#snakePositions[0][0] = this.#dot[0];
            this.#snakePositions[0][1] = this.#dot[1];
            if (this.#skipFrequency>1){
                this.#skipFrequency -= 0.25; //Increase the speed of the snake (reduce the frequency) if max speed hasn't been reached.
            }
            this.#setNewDot();
        } else {
            //Just moving snake
            for (var i=this.#snakePositions.length-1;i>0;i--){
                this.#snakePositions[i] = [this.#snakePositions[i-1][0],this.#snakePositions[i-1][1]];
            }
            this.#snakePositions[0][0] += this.#xDir;
            this.#snakePositions[0][1] += this.#yDir;
        }
        return true;
    }
    #isLegalMove(xPos,yPos) {
        //Check if snake will hit edge of board or itself, in which case "false" is returned. Otherwise, "true" is returned.
        if (xPos<0 || xPos>this.#maxX || yPos<0 || yPos>this.#maxY) {
            return false;
        }
        for (var i=0;i<s.#snakePositions.length-1;i++){
            if (xPos==this.#snakePositions[i][0] && yPos==this.#snakePositions[i][1]){
                return false;
            }
        }
        return true;
    }
    getPointsToDraw(){
        var drawPoints = [[...this.#dot]];
        for (var i=0;i<this.#snakePositions.length;i++){
            drawPoints.push([...this.#snakePositions[i]]);
        }
        return drawPoints;
    }
};

var s = new SnakeGame();
var minSnakeMoveInterval = 25;
var recWidth = 620;
var recHeight = 300;
var takeInput = false;
var updateCount = 0;
var inGame = true;
var drawPoints = null;
var highScore = localStorage.getItem('highscore');
if (highScore==null){
    highScore = 0;
}
document.getElementById("hs").innerHTML = "Highscore: " + highScore;

const canvas = document.getElementById("snakeGame");
const ctx = canvas.getContext("2d");
ctx.fillStyle = "white";
ctx.fillRect(0, 0, recWidth, recHeight);

window.addEventListener("keydown", (e) => {
    if (takeInput==true){
        if(inGame==true)
            s.setDir(e.code);
        takeInput=false;
    }
});

window.addEventListener("click", (e) => {
    if (inGame==false){
        s = new SnakeGame();
        snakeInterval = setInterval(() => {
            playGame();
        }, minSnakeMoveInterval);
        inGame = true;
    }
});

function drawGameOver(){
    ctx.fillStyle = "black";
    ctx.fillRect(recWidth/4-3,2*recHeight/5-3,recWidth/2+6,recHeight/5+6);
    ctx.fillStyle = "white";
    ctx.fillRect(recWidth/4,2*recHeight/5,recWidth/2,recHeight/5);
    ctx.fillStyle = "black";
    ctx.font = "30px Arial";
    ctx.fillText("Play again",50*recWidth/128,11*recHeight/20);
}

function playGame(){
    ctx.clearRect(0,0,recWidth,recHeight);
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, recWidth, recHeight);
    ctx.fillStyle = "black";
    drawPoints = s.getPointsToDraw();
    for(var i=0;i<drawPoints.length;i++){
        ctx.fillRect(20*drawPoints[i][0], 20*drawPoints[i][1], 20, 20);
    }
    if (updateCount>s.getSkipFrequency()){
        inGame = s.move(); //see whether game is still going on.
        if (s.getSnakeLength()>highScore) {
            highScore = s.getSnakeLength();
            localStorage.setItem('highscore', highScore);
            document.getElementById("hs").innerHTML = "Highscore: " + highScore;
        }
        if (!inGame) {
            drawGameOver();
            clearInterval(snakeInterval);
        }
        updateCount = 0;
        takeInput = true;
    } else {
        updateCount++;
    }    
}

snakeInterval = setInterval(() => {
    playGame();
}, minSnakeMoveInterval);