// keyboard single player mode

// Canvas Related
const canvas = document.createElement("canvas");
const context = canvas.getContext("2d");
const socket = io("/pong");
let paddleIndex = 0;
let width = 500;
let height = 700;

// Paddle
let paddleHeight = 10;
let paddleWidth = 80;
let paddleDiff = 25;
let paddleX = [225, 225];
let trajectoryX = [0, 0];
let playerMoved = false;

// Keyboard
let left = false;
let right = false;
let topLeft = false;
let topRight = false;

// Ball
let ballX = 250;
let ballY = 350;
let ballRadius = 5;
let ballDirection = 1;

// Speed
let speedY = 2;
let speedX = 0;

// Score for Both Players
let score = [0, 0];

// Create Canvas Element
function createCanvas() {
  canvas.id = "canvas";
  canvas.width = width;
  canvas.height = height;
  document.body.appendChild(canvas);
  renderCanvas();
}

// Wait for Opponents
function renderIntro() {
  // Canvas Background
  context.fillStyle = "black";
  context.fillRect(0, 0, width, height);

  // Intro Text
  context.fillStyle = "white";
  context.font = "30px Courier New";
  context.fillText("Single Player Mode", 20, canvas.height / 2 - 30);
}

// Render Everything on Canvas
function renderCanvas() {
  // Canvas Background
  context.fillStyle = "black";
  context.fillRect(0, 0, width, height);

  // Paddle Color
  context.fillStyle = "white";

  // Bottom Paddle
  context.fillRect(paddleX[0], height - 20, paddleWidth, paddleHeight);

  // Top Paddle
  context.fillRect(paddleX[1], 10, paddleWidth, paddleHeight);

  // Dashed Center Line
  context.beginPath();
  context.setLineDash([4]);
  context.moveTo(0, 350);
  context.lineTo(500, 350);
  context.strokeStyle = "grey";
  context.stroke();

  // Ball
  context.beginPath();
  context.arc(ballX, ballY, ballRadius * 2, 2 * Math.PI, false);
  context.fillStyle = "white";
  context.fill();

  // Score
  context.font = "32px Courier New";
  context.fillText(score[0], 20, canvas.height / 2 + 50);
  context.fillText(score[1], 20, canvas.height / 2 - 30);
}

// Reset Ball to Center
function ballReset() {
  ballX = width / 2;
  ballY = height / 2;
  speedY = 3;
  speedX = 0;
}

// Adjust Ball Movement
function ballMove() {
  // Vertical Speed
  ballY += speedY * ballDirection;
  // Horizontal Speed
  if (playerMoved) {
    ballX += speedX;
  }
}

// Determine What Ball Bounces Off, Score Points, Reset Ball
function ballBoundaries() {
  // Bounce off Left Wall
  if (ballX < 0 && speedX < 0) {
    speedX = -speedX;
  }
  // Bounce off Right Wall
  if (ballX > width && speedX > 0) {
    speedX = -speedX;
  }
  // Bounce off player paddle (bottom)
  if (ballY > height - paddleDiff) {
    if (ballX >= paddleX[0] && ballX <= paddleX[0] + paddleWidth) {
      // Add Speed on Hit
      if (playerMoved) {
        speedY += 0.25;
        // Max Speed
        if (speedY > 5) {
          speedY = 5;
        }
      }
      ballDirection = -ballDirection;
      trajectoryX[0] = ballX - (paddleX[0] + paddleDiff);
      speedX = trajectoryX[0] * 0.3;
    } else {
      // Reset Ball, add to Computer Score
      ballReset();
      score[1]++;
    }
  }
  // Bounce off computer paddle (top)
  if (ballY < paddleDiff) {
    if (ballX >= paddleX[1] && ballX <= paddleX[1] + paddleWidth) {
      // Add Speed on Hit
      if (playerMoved) {
        speedY += 0.5;
        // Max Speed
        if (speedY > 5) {
          speedY = 5;
        }
      }
      ballDirection = -ballDirection;
      trajectoryX[1] = ballX - (paddleX[1] + paddleDiff);
      speedX = trajectoryX[1] * 0.3;
    } else {
      ballReset();
      score[0]++;
    }
  }
}

function animate() {
  ballMove();
  ballBoundaries();
  paddleMove();

  renderCanvas();

  // Called Every Frame
  window.requestAnimationFrame(animate);
}

// Refactor code to separate Load and Start Game

let id;
function loadGame() {
  createCanvas();
  renderIntro();
  id = setTimeout(() => {
    socket.emit("ready", { mode: 1 });
  }, 5000);
}

function handleKeyDown(e) {
  // playerMoved = true;
  switch (e.key) {
    case "ArrowLeft":
      left = true;
      break;
    case "ArrowRight":
      right = true;
      break;
    case "a":
      topLeft = true;
      break;
    case "d":
      topRight = true;
      break;
  }
}

// single player mode
function paddleMove() {
  // this will make it toggle all the time making it hard to hit
  // if (topLeft || topRight || left || right) {
  //   playerMoved = true;
  // } else {
  //   playerMoved = false;
  // }

  if (topLeft) {
    paddleX[1] < 0 ? 0 : (paddleX[1] -= 10);
  }
  if (topRight) {
    paddleX[1] > width - paddleWidth ? width - paddleWidth : (paddleX[1] += 10);
  }
  if (left) {
    paddleX[0] < 0 ? 0 : (paddleX[0] -= 10);
  }
  if (right) {
    paddleX[0] > width - paddleWidth ? width - paddleWidth : (paddleX[0] += 10);
  }
}
function handleKeyUp(e) {
  switch (e.key) {
    case "ArrowLeft":
      left = false;
      break;
    case "ArrowRight":
      right = false;
      break;
    case "a":
      topLeft = false;
      break;
    case "d":
      topRight = false;
      break;
  }
}

// begin the game loop
function startGame() {
  animate();
  document.addEventListener("keydown", (e) => handleKeyDown(e));
  document.addEventListener("keyup", (e) => handleKeyUp(e));
}

// On Load
loadGame();

// Socket Events
socket.on("connect", () => {
  console.log("client connected as ...", socket.id);
});

// server broadcasts a 'startGame' event
socket.on("startGame", () => {
  console.log("start game!");
  startGame();
});
