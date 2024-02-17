// Testing File

// Button
let gameMode = null;
let btn1 = document.getElementById("single");
let btn2 = document.getElementById("multi");
btn1.addEventListener("click", () => {
  gameMode = 1;
});
btn2.addEventListener("click", () => {
  gameMode = 2;
});

// Canvas Related
const canvas = document.createElement("canvas");
const context = canvas.getContext("2d");

// by default socket io connects to the socket server at the same host
// we can use a namespace
const socket = io("/pong");
let isReferee = false;

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
  context.fillText("Wating for your opponent", 20, canvas.height / 2 - 30);
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

  // socket.emit("ballMove", {
  //   ballX,
  //   ballY,
  //   score,
  // });
}

// Adjust Ball Movement
function ballMove() {
  // Vertical Speed
  ballY += speedY * ballDirection;
  // Horizontal Speed
  if (playerMoved) {
    ballX += speedX;
  }

  // socket.emit("ballMove", {
  //   ballX,
  //   ballY,
  //   score,
  // });
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
        speedY += 1;
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
        speedY += 1;
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

// if it's the referee then we will broadcast the data to other clients
function animate() {
  if (isReferee) {
    ballMove();
    ballBoundaries();
    paddleMove();
  }

  renderCanvas();

  // Called Every Frame
  window.requestAnimationFrame(animate);
}

// Refactor code to separate Load and Start Game
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function loadGame() {
  while (gameMode === null) {
    await delay(500);
  }
  createCanvas();
  renderIntro();
  socket.emit("ready", { mode: gameMode });
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
    paddleX[1] += 10;
  }
  if (left) {
    paddleX[0] -= 10;
  }
  if (right) {
    paddleX[0] += 10;
  }

  // to sync data
  // socket.emit("paddleMove", {
  //   xPos: paddleX,
  // });
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

function chooseGameMode() {}

// begin the game loop
function startGame() {
  paddleIndex = isReferee ? 0 : 1; // determines who controls the bottom paddle depending on who's the referee
  animate();
  document.addEventListener("keydown", (e) => handleKeyDown(e));
  document.addEventListener("keyup", (e) => handleKeyUp(e));
  // canvas.addEventListener("mousemove", (e) => {
  //   playerMoved = true;
  //   paddleX[paddleIndex] = e.offsetX;
  //   if (paddleX[paddleIndex] < 0) {
  //     paddleX[paddleIndex] = 0;
  //   }
  //   if (paddleX[paddleIndex] > width - paddleWidth) {
  //     paddleX[paddleIndex] = width - paddleWidth;
  //   }

  //   // emit paddle move event with paddle Data
  //   socket.emit("paddleMove", {
  //     xPos: paddleX[paddleIndex],
  //   });
  //   // Hide Cursor
  //   canvas.style.cursor = "none";
  // });
}

// On Load
loadGame();

// Socket Events
socket.on("connect", () => {
  console.log("client connected as ...", socket.id);
});

// server broadcasts a 'startGame' event
socket.on("startGame", (refereeId) => {
  console.log("Referee ID is", refereeId);

  isReferee = refereeId === socket.id;
  startGame();
});

// listen to 'paddleMove' event
socket.on("paddleMove", (paddleData) => {
  // toggle between paddleIndex ( either zero or one )
  const opponentPaddleId = 1 - paddleIndex;
  paddleX[opponentPaddleId] = paddleData.xPos;
  // for showing sync data for two keyboards
  // paddleX = paddleData.xPos;
});

// listen to 'ballMove' event
socket.on("ballMove", (ballData) => {
  ({ ballX, ballY, score } = ballData); // setting ballX,ballY,score with destructure
});
