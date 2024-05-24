let startModal;

let paddle1Y = 0;
let paddle2Y = 0;
let paddle3Y = 0;
let ballX = 5;
let ballY = 5;
let ballSpeedX = 5;
let ballSpeedY = 5;
let initialBallSpeedX = 5;
let initialBallSpeedY = 5;
let score1 = 0;
let score2 = 0;
let score3 = 0;
let player1Alias = "Player 1";
let player2Alias = "";
let player3Alias = "";

let paddle1;
let paddle2;
let paddle3;
let ball;
let board;
let score1Element;
let score2Element;
let score3Element;
let player1AliasElement;
let player2AliasElement;
let player3AliasElement;
let begin = false;
let paddle1MovingUp = false;
let paddle1MovingDown = false;
let paddle2MovingUp = false;
let paddle2MovingDown = false;
let paddle3MovingUp = false;
let paddle3MovingDown = false;

function setupMultiGamePage() {
  // Get elements
  board = document.getElementById("board");
  paddle1 = document.getElementById("paddle_1");
  paddle2 = document.getElementById("paddle_2");
  paddle3 = document.getElementById("paddle_3");
  ball = document.getElementById("ball");
  score1Element = document.getElementById("player_1_score");
  score2Element = document.getElementById("player_2_score");
  score3Element = document.getElementById("player_3_score");

  // Set initial paddle positions
  paddle1.style.top = "33%";
  paddle2.style.top = "33%";
  paddle3.style.top = "33%";

  // Set initial ball position
  ballX = board.offsetWidth / 2 - ball.offsetWidth / 2;
  ballY = board.offsetHeight / 2 - ball.offsetHeight / 2;
  ball.style.left = `${ballX}px`;
  ball.style.top = `${ballY}px`;

  // Update scores and aliases
  score1Element.textContent = score1;
  score2Element.textContent = score2;
  score3Element.textContent = score3;

  startModal = new bootstrap.Modal(document.getElementById('startGameModal'));
  startModal.show();

  player2Alias = document.getElementById("player2alias");
  player2alias.addEventListener('input', checkInput);
  player3Alias = document.getElementById("player3alias");
  player3alias.addEventListener('input', checkInput);
  startGameBtn.addEventListener('click', startGame);

};

function handleKeyDown(event) {
  if (event.key === "w" || event.key === "W") {
    paddle1MovingUp = true;
  } else if (event.key === "s" || event.key === "S") {
    paddle1MovingDown = true;
  } else if (event.key === "ArrowUp") {
    paddle2MovingUp = true;
  } else if (event.key === "ArrowDown") {
    paddle2MovingDown = true;
  } else if (event.key === "ArrowLeft") {
    paddle3MovingUp = true;
  } else if (event.key === "ArrowRight") {
    paddle3MovingDown = true;
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
  } else if (event.key === "ArrowLeft") {
    paddle3MovingUp = false;
  } else if (event.key === "ArrowRight") {
    paddle3MovingDown = false;
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

    if (paddle3MovingUp && paddle3.offsetTop > 0) {
      paddle3.style.top = `${paddle3.offsetTop - 6}px`;
    } else if (paddle3MovingDown && paddle3.offsetTop + paddle3.offsetHeight < board.offsetHeight) {
      paddle3.style.top = `${paddle3.offsetTop + 6}px`;
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
    } else if (ballX + ball.offsetWidth >= board.offsetWidth - 50) {
      // Ball hit right wall, score point for player 3
      score3++;
      score3Element.textContent = score3;
      resetBall();
    }

    // Ball hit top or bottom wall, reverse Y direction
    if (ballY <= 0 || ballY + ball.offsetHeight >= board.offsetHeight)
      ballSpeedY = -ballSpeedY;

    // Paddle collision detection
    const ballRect = ball.getBoundingClientRect();
    const paddle1Rect = paddle1.getBoundingClientRect();
    const paddle2Rect = paddle2.getBoundingClientRect();
    const paddle3Rect = paddle3.getBoundingClientRect();

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
        ballSpeedX > 0) ||
      (ballRect.right >= paddle3Rect.left &&
        ballRect.left <= paddle3Rect.right &&
        ballRect.top <= paddle3Rect.bottom &&
        ballRect.bottom >= paddle3Rect.top &&
        ballSpeedX > 0);

    if (paddleCollision)
      ballSpeedX = -ballSpeedX;
  }
}

function resetBall() {
  ballX = board.offsetWidth / 2;
  ballY = board.offsetHeight / 2;
  ball.style.left = `${ballX}px`;
  ball.style.top= `${ballY}px`;
  ballSpeedX = initialBallSpeedX;
  ballSpeedY = initialBallSpeedY;
}

function startGame() {
  begin = true;
  player2Alias = document.getElementById("player2alias").value;
  player3Alias = document.getElementById("player3alias").value;
  player2AliasElement = document.getElementById("player_2_alias");
  player3AliasElement = document.getElementById("player_3_alias");
  player2AliasElement.textContent = player2Alias;
  player3AliasElement.textContent = player3Alias;
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
  player3Alias = document.getElementById("player3alias").value;
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
  } else if (player1Alias === player2Alias || player1Alias === player3Alias || player2Alias === player3Alias) {
    player2AliasElement = document.getElementById("player_2_alias");
    player3AliasElement = document.getElementById("player_3_alias");
    button.disabled = false;
    // createAlert(notiAlert, 'Alias cannot be the same as another player!', 'alert-danger');
  } else {
    player2AliasElement = document.getElementById("player_2_alias");
    player3AliasElement = document.getElementById("player_3_alias");
    button.disabled = false;
  }
}

export { setupMultiGamePage };