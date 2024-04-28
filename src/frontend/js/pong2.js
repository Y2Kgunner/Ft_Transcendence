let paddle1Y = 0;
let paddle2Y = 0;
let ballX = 5;
let ballY = 5;
let ballSpeedX = 5;
let ballSpeedY = 5;
let initialBallSpeedX = 5;
let initialBallSpeedY = 5;
let score1 = 0;
let score2 = 0;
let player1Alias = "Player 1";
let player2Alias = "";

let paddle1;
let paddle2;
let ball;
let board;
let score1Element;
let score2Element;
let player1AliasElement;
let player2AliasElement;
let begin = false;
let paddle1MovingUp = false;
let paddle1MovingDown = false;
let paddle2MovingUp = false;
let paddle2MovingDown = false;

document.addEventListener("DOMContentLoaded", function () {
  // Get elements
  board = document.getElementById("board");
  paddle1 = document.getElementById("paddle_1");
  paddle2 = document.getElementById("paddle_2");
  ball = document.getElementById("ball");
  score1Element = document.getElementById("player_1_score");
  score2Element = document.getElementById("player_2_score");

  // Set initial paddle positions
  // paddle1.style.top = "50%";
  // paddle2.style.top = "50%";

  // Set initial ball position
  ballX = board.offsetWidth / 2 - ball.offsetWidth / 2;
  ballY = board.offsetHeight / 2 - ball.offsetHeight / 2;
  // ball.style.left = `${ballX}px`;
  // ball.style.top = `${ballY}px`;

  // Update scores and aliases
  score1Element.textContent = score1;
  score2Element.textContent = score2;
  // player1AliasElement.textContent = player1Alias;
  // player2AliasElement.textContent = player2Alias;
  var startModal = new bootstrap.Modal(document.getElementById('startGameModal'));
  startModal.show();
});

function handleKeyDown(event) {
  if (event.key === "w" || event.key === "W") {
    paddle1MovingUp = true;
  } else if (event.key === "s" || event.key === "S") {
    paddle1MovingDown = true;
  } else if (event.key === "ArrowUp") {
    paddle2MovingUp = true;
  } else if (event.key === "ArrowDown") {
    paddle2MovingDown = true;
  }
}

function handleKeyUp(event) {
  if (event.key === "w" || event.key === "W") {
    paddle1MovingUp = false;
  } else if (event.key === "s" || event.key === "S") {
    paddle1MovingDown = false;
  } else if (event.key === "ArrowUp") {
    paddle2MovingUp = false;
  } else if (event.key === "ArrowDown") {
    paddle2MovingDown = false;
  }
}

function updateGame() {
  if (begin) {
    // Update paddle positions
    if (paddle1MovingUp && paddle1.offsetTop > 0) {
      paddle1.style.top = `${paddle1.offsetTop - 6}px`;
    } else if (paddle1MovingDown && paddle1.offsetTop + paddle1.offsetHeight < board.offsetHeight) {
      paddle1.style.top = `${paddle1.offsetTop + 6}px`;
    }

    if (paddle2MovingUp && paddle2.offsetTop > 0) {
      paddle2.style.top = `${paddle2.offsetTop - 6}px`;
    } else if (paddle2MovingDown && paddle2.offsetTop + paddle2.offsetHeight < board.offsetHeight) {
      paddle2.style.top = `${paddle2.offsetTop + 6}px`;
    }

    // Update ball position
    ballX += ballSpeedX;
    ballY += ballSpeedY;
    ball.style.left = `${ballX}px`;
    ball.style.top = `${ballY}px`;

    // Collision detection
    if (ballX <= 0) {
      // Ball hit left wall, score point for player 2
      score2++;
      score2Element.textContent = score2;
      resetBall();
    } else if (ballX + ball.offsetWidth >= board.offsetWidth) {
      // Ball hit right wall, score point for player 1
      score1++;
      score1Element.textContent = score1;
      resetBall();
    }

    // Ball hit top or bottom wall, reverse Y direction
    if (ballY <= 0 || ballY + ball.offsetHeight >= board.offsetHeight)
      ballSpeedY = -ballSpeedY;

    // Paddle collision detection
    const ballRect = ball.getBoundingClientRect();
    const paddle1Rect = paddle1.getBoundingClientRect();
    const paddle2Rect = paddle2.getBoundingClientRect();

    let paddleCollision =
      (ballRect.right >= paddle1Rect.left &&
        ballRect.left <= paddle1Rect.right &&
        ballRect.top <= paddle1Rect.bottom &&
        ballRect.bottom >= paddle1Rect.top &&
        ballSpeedX < 0) ||
      (ballRect.right >= paddle2Rect.left &&
        ballRect.left <= paddle2Rect.right &&
        ballRect.top <= paddle2Rect.bottom &&
        ballRect.bottom >= paddle2Rect.top &&
        ballSpeedX > 0);

    if (paddleCollision)
      ballSpeedX = -ballSpeedX;
  }
}

function resetBall() {
  ballX = board.offsetWidth / 2;
  ballY = board.offsetHeight / 2;
  ball.style.left = `${ballX}px`;
  ball.style.top = `${ballY}px`;
  ballSpeedX = initialBallSpeedX;
  ballSpeedY = initialBallSpeedY;
}

function startGame() {
  begin = true;
  player2Alias = document.getElementById("player2alias").value;
  player2AliasElement.textContent = player2Alias;
  setInterval(updateGame, 16); // 16ms = 60fps
  document.addEventListener("keydown", handleKeyDown);
  document.addEventListener("keyup", handleKeyUp);
}

function isPrintableASCII(str) {
  var printableASCIIRegex = /^[!-~]+$/;
  return printableASCIIRegex.test(str);
}

function hideOverflow() {
  const content = document.getElementsById('board');
  content.style.opacity = 1;
}

function checkInput() {
  var button = document.getElementById("startGameBtn");
  player2Alias = document.getElementById("player2alias").value;
  player1Alias = "poopy";
  if (player2Alias.trim() === '') {
    button.disabled = true;
  } else if (player2Alias.length > 10 || player2Alias.length < 3) {
    player2AliasElement = document.getElementById("player_2_alias");
    button.disabled = false;
    // createAlert(notiAlert, 'Alias is between 3 and 10 characters!', 'alert-danger');
  } else if (!isPrintableASCII(player2Alias)) {
    player2AliasElement = document.getElementById("player_2_alias");
    button.disabled = false;
    // createAlert(notiAlert, 'Alias cannot contain spaces!', 'alert-danger');
  } else if (player1Alias === player2Alias) {
    player2AliasElement = document.getElementById("player_2_alias");
    button.disabled = false;
    // createAlert(notiAlert, 'Alias cannot be the same as the user!', 'alert-danger');
  } else {
    player2AliasElement = document.getElementById("player_2_alias");
    button.disabled = false;
  }
  // return ;
}

// Get the element with the class baseTest
let baseTestElement = document.querySelector('.baseTest');

// Add an event listener to the game start event (e.g. a button click)
document.getElementById('startGameBtn').addEventListener('click', () => {
  // Remove the class baseTest from the element
  baseTestElement.classList.remove('baseTest');
});
