const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const paddleWidth = 10;
const paddleHeight = 100;
const paddleColor = 'blue'; // Set paddle color here
let paddleSpeed = 5;

let player1Score = 0;
let player2Score = 0;

let ball = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 10,
  dx: 5,
  dy: 5,
  color: 'red' // Set ball color here
};

let player1 = {
  x: 10,
  y: canvas.height / 2 - paddleHeight / 2
};

let player2 = {
  x: canvas.width - paddleWidth - 10,
  y: canvas.height / 2 - paddleHeight / 2
};

function draw() {
  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw paddles
  ctx.fillStyle = paddleColor;
  ctx.fillRect(player1.x, player1.y, paddleWidth, paddleHeight);
  ctx.fillRect(player2.x, player2.y, paddleWidth, paddleHeight);

  // Draw ball
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = ball.color;
  ctx.fill();

  // Draw scores
  ctx.font = '24px Arial';
  ctx.fillText(`Player 1: ${player1Score}`, 20, 30);
  ctx.fillText(`Player 2: ${player2Score}`, canvas.width - 140, 30);
}

function update() {
  // Update ball position and direction
  ball.x += ball.dx;
  ball.y += ball.dy;

  // Ball collision with walls
  if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
    ball.dy = -ball.dy;
  }

  // Ball collision with paddles
  if (
    ball.x + ball.radius >= player2.x &&
    ball.x - ball.radius <= player2.x + paddleWidth &&
    ball.y >= player2.y &&
    ball.y <= player2.y + paddleHeight
  ) {
    ball.dx = -ball.dx; // Reverse ball direction on collision with player 2 paddle
  } else if (
    ball.x - ball.radius <= player1.x + paddleWidth &&
    ball.x + ball.radius >= player1.x &&
    ball.y >= player1.y &&
    ball.y <= player1.y + paddleHeight
  ) {
    ball.dx = -ball.dx; // Reverse ball direction on collision with player 1 paddle
  }

  // Ball out of bounds (scoring)
  if (ball.x + ball.radius > canvas.width) {
    player1Score++;
    resetBall();
  } else if (ball.x - ball.radius < 0) {
    player2Score++;
    resetBall();
  }
}

function resetBall() {
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;
  ball.dx = -ball.dx; // Change ball direction
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

// Start the game loop
gameLoop();
