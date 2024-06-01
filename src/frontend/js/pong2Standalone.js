const matchPoint = 11;
let intervalId = null;
let paused = false;
let pauseModalVisible = false;
let gameOver = false;
let modalInit = false;


let paddle1Y = 0;
let paddle2Y = 0;
let ballX = 5;
let ballY = 5;
let ballSpeedX = 10;
let ballSpeedY = 10;
let initialBallSpeedX = 10;
let initialBallSpeedY = 10;
let score1 = 0;
let score2 = 0;
let player1Alias = "Player 1";
let player2Alias = "";
let initialPaddlePos;

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
  board = document.getElementById("board");
  paddle1 = document.getElementById("paddle_1");
  paddle2 = document.getElementById("paddle_2");
  initialPaddlePos = paddle1.style.top;
  ball = document.getElementById("ball");
  score1Element = document.getElementById("player_1_score");
  score2Element = document.getElementById("player_2_score");
  player2AliasElement = document.getElementById("player_2_alias");

  ballX = board.offsetWidth / 2 - ball.offsetWidth / 2;
  ballY = board.offsetHeight / 2 - ball.offsetHeight / 2;

  score1Element.textContent = score1;
  score2Element.textContent = score2;
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
  } else if (event.key === " ") {
    togglePause();
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

function togglePause() {
  if (!pauseModalVisible && !gameOver) {
    paused = true;
    pauseGame();
  } else {
    continueGame();
  }
}

// function updateGame() {
//   if (begin && !pauseModalVisible) {
//     if (paddle1MovingUp && paddle1.offsetTop > 0) {
//       paddle1.style.top = `${paddle1.offsetTop - 10}px`;
//     } else if (paddle1MovingDown && paddle1.offsetTop + paddle1.offsetHeight < board.offsetHeight) {
//       paddle1.style.top = `${paddle1.offsetTop + 10}px`;
//     }

//     if (paddle2MovingUp && paddle2.offsetTop > 0) {
//       paddle2.style.top = `${paddle2.offsetTop - 10}px`;
//     } else if (paddle2MovingDown && paddle2.offsetTop + paddle2.offsetHeight < board.offsetHeight) {
//       paddle2.style.top = `${paddle2.offsetTop + 10}px`;
//     }

//     ballX += ballSpeedX;
//     ballY += ballSpeedY;
//     ball.style.left = `${ballX}px`;
//     ball.style.top = `${ballY}px`;

//     if (ballX <= 0) {
//       score2++;
//       score2Element.textContent = score2;
//       resetBall();
//     } else if (ballX + ball.offsetWidth >= board.offsetWidth) {
//       score1++;
//       score1Element.textContent = score1;
//       resetBall();
//     }
//     if (score1 === matchPoint || score2 === matchPoint) {
//       haltGame(score1 === matchPoint ? player1Alias : player2Alias);
//     }

//     if (ballY <= 0 || ballY + ball.offsetHeight >= board.offsetHeight)
//         ballSpeedY = -ballSpeedY;

//     const ballRect = ball.getBoundingClientRect();
//     const paddle1Rect = paddle1.getBoundingClientRect();
//     const paddle2Rect = paddle2.getBoundingClientRect();

//     let paddleCollision =
//       (ballRect.right >= paddle1Rect.left &&
//         ballRect.left <= paddle1Rect.right &&
//         ballRect.top <= paddle1Rect.bottom &&
//         ballRect.bottom >= paddle1Rect.top &&
//         ballSpeedX < 0) ||
//       (ballRect.right >= paddle2Rect.left &&
//         ballRect.left <= paddle2Rect.right &&
//         ballRect.top <= paddle2Rect.bottom &&
//         ballRect.bottom >= paddle2Rect.top &&
//         ballSpeedX > 0);

//     if (paddleCollision) {
//       const ballCenterY = ballY + ball.offsetHeight / 2;
//       const paddle1CenterY = paddle1.offsetTop + paddle1.offsetHeight / 2;
//       const paddle2CenterY = paddle2.offsetTop + paddle2.offsetHeight / 2;

//       let paddleCenterY;
//       if (ballSpeedX < 0) {
//         paddleCenterY = paddle1CenterY;
//       } else {
//         paddleCenterY = paddle2CenterY;
//       }

//       const collisionOffset = ballCenterY - paddleCenterY;
//       const maxOffset = paddle1.offsetHeight / 2;

//       const angle = collisionOffset / maxOffset;
//       ballSpeedY = initialBallSpeedY * angle;
//       ballSpeedX = -ballSpeedX;
//     }
//   }
// }

function updateGame() {
  if (begin && !pauseModalVisible) {
    // Move paddles
    if (paddle1MovingUp && paddle1.offsetTop > 0) {
      paddle1.style.top = `${paddle1.offsetTop - 10}px`;
    } else if (paddle1MovingDown && paddle1.offsetTop + paddle1.offsetHeight < board.offsetHeight) {
      paddle1.style.top = `${paddle1.offsetTop + 10}px`;
    }
    if (paddle2MovingUp && paddle2.offsetTop > 0) {
      paddle2.style.top = `${paddle2.offsetTop - 10}px`;
    } else if (paddle2MovingDown && paddle2.offsetTop + paddle2.offsetHeight < board.offsetHeight) {
      paddle2.style.top = `${paddle2.offsetTop + 10}px`;
    }

    // Move the ball
    ballX += ballSpeedX;
    ballY += ballSpeedY;

    // Check for collisions with walls
    if (ballX <= 0) {
      score2++;
      score2Element.textContent = score2;
      resetBall();
    } else if (ballX + ball.offsetWidth >= board.offsetWidth) {
      score1++;
      score1Element.textContent = score1;
      resetBall();
    }

    // Check for collisions with top/bottom walls
    if (ballY <= 0 || ballY + ball.offsetHeight >= board.offsetHeight)
      ballSpeedY = -ballSpeedY;

    ball.style.left = `${ballX}px`;
    ball.style.top = `${ballY}px`;

    // Check for collisions with paddles
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

    if (paddleCollision) {
      const ballCenterY = ballY + ball.offsetHeight / 2;
      const paddle1CenterY = paddle1.offsetTop + paddle1.offsetHeight / 2;
      const paddle2CenterY = paddle2.offsetTop + paddle2.offsetHeight / 2;
      let paddleCenterY;
      if (ballSpeedX < 0) {
        paddleCenterY = paddle1CenterY;
      } else {
        paddleCenterY = paddle2CenterY;
      }
      const collisionOffset = ballCenterY - paddleCenterY;
      const maxOffset = paddle1.offsetHeight / 2;
      const angle = collisionOffset / maxOffset;

      // Check if the ball is hitting the bottom part of the paddle near the bottom wall
      //! not doing its job at the moment! lmao
      const paddle1BottomThreshold = board.offsetHeight - paddle1.offsetHeight / 2;
      const paddle2BottomThreshold = board.offsetHeight - paddle2.offsetHeight / 2;
      if (
        (ballSpeedX < 0 && paddle1.offsetTop > paddle1BottomThreshold && angle > 0) ||
        (ballSpeedX > 0 && paddle2.offsetTop > paddle2BottomThreshold && angle > 0)
      ) {
        // Adjust the ball's direction to go upwards
        ballSpeedY = -initialBallSpeedY * Math.abs(angle);
      } else {
        ballSpeedY = initialBallSpeedY * angle;
      }

      ballSpeedX = -ballSpeedX;
    }

    // Check for game over
    if (score1 === matchPoint || score2 === matchPoint) {
      haltGame(score1 === matchPoint ? player1Alias : player2Alias);
    }
  }
}

function haltGame(winner) {
  paused = false;
  pauseModalVisible = false;
  gameOver = true;
  let winnerMsg = document.getElementById('GameWinner');
  winnerMsg.textContent = winner.toString() + " wins!";
  score1 = 0;
  score2 = 0;
  resetBall();
  begin = false;
  score1Element.textContent = score1;
  score2Element.textContent = score2;
  paddle1.style.top = initialPaddlePos;
  paddle2.style.top = initialPaddlePos;
  var restartModal = new bootstrap.Modal(document.getElementById('restartGame'));
  restartModal.show();
  clearInterval(intervalId);
  intervalId = null;
}

function resetBall() {
  ballX = board.offsetWidth / 2;
  ballY = board.offsetHeight / 2;
  ball.style.left = `${ballX}px`;
  ball.style.top = `${ballY}px`;

  const randomDirection = Math.random() < 0.5 ? -1 : 1;
  ballSpeedX = initialBallSpeedX * randomDirection;
  ballSpeedY = initialBallSpeedY * (Math.random() * 2 - 1);
}

function startGame() {
  begin = true;
  gameOver = false;
  player2Alias = document.getElementById("player2alias").value;
  player2AliasElement.textContent = player2Alias;
  if (intervalId) {
    clearInterval(intervalId);
  }
  intervalId = setInterval(updateGame, 16);
  document.addEventListener("keydown", handleKeyDown);
  document.addEventListener("keyup", handleKeyUp);
}

function isPrintableASCII(str) {
  var printableASCIIRegex = /^[!-~]+$/;
  return printableASCIIRegex.test(str);
}

// function hideOverflow() {
//   const content = document.getElementsById('board');
//   content.style.opacity = 1;
// }

let pauseModalInstance = new bootstrap.Modal(document.getElementById('pauseGameModal'));

function pauseGame() {
  clearInterval(intervalId);
  intervalId = null;
  pauseModalInstance.show();
  pauseModalVisible = true;
}

function continueGame() {
  pauseModalInstance.hide();
  pauseModalInstance._element.addEventListener('hidden.bs.modal', function () {
    pauseModalVisible = false;
    if (!intervalId)
    intervalId = setInterval(updateGame, 16);
  }, { once: true });
}


//? modal input validation
//?
//?
window.onload = function() {
  checkInput();
}

var startGameBtn = document.getElementById("startGameBtn");
startGameBtn.addEventListener("click", function() {
  checkInput();
});

var form = document.querySelector('.needs-validation');
form.addEventListener('keyup', function(event) {
  if (event.key === 'Enter') {
    event.preventDefault();
    checkInput();
  }
});

var inputField = document.getElementById("player2alias");
inputField.addEventListener('input', function() {
  updateValidationIcon();
});

function updateValidationIcon() {
  var invalidFeedback = inputField.nextElementSibling;
  var validFeedback = invalidFeedback.nextElementSibling;
  player2Alias = inputField.value.trim();

  invalidFeedback.style.display = "none";
  validFeedback.style.display = "none";
  inputField.classList.remove("is-invalid", "is-valid");

  if (!modalInit) modalInit = true;
  else if (player2Alias.length > 10 || player2Alias.length < 3) {
    inputField.classList.add("is-invalid");
    invalidFeedback.style.display = "block";
  } else if (!isPrintableASCII(player2Alias)) {
    inputField.classList.add("is-invalid");
    invalidFeedback.style.display = "block";
  } else if (player1Alias === player2Alias) {
    inputField.classList.add("is-invalid");
    invalidFeedback.style.display = "block";
  } else if (player2Alias === '') {
    inputField.classList.add("is-invalid");
    invalidFeedback.style.display = "block";
  } else {
    inputField.classList.add("is-valid");
    validFeedback.style.display = "block";
  }
}

function checkInput() {
  var inputField = document.getElementById("player2alias");
  var invalidFeedback = inputField.nextElementSibling;
  var validFeedback = invalidFeedback.nextElementSibling;
  player2Alias = inputField.value.trim();

  invalidFeedback.textContent = "Looks stinky! 🚽";
  validFeedback.style.display = "none";
  inputField.classList.remove("is-invalid", "is-valid");

  if (!modalInit) modalInit = true;
  else if (player2Alias.length > 10 || player2Alias.length < 3) {
    invalidFeedback.textContent = "Player 2 alias must be between 3 and 10 characters long!";
    inputField.classList.add("is-invalid");
    clearTimeout(window.timeoutId);
    window.timeoutId = setTimeout(clearErrorMessage, 5000, invalidFeedback, inputField);
  } else if (!isPrintableASCII(player2Alias)) {
    invalidFeedback.textContent = "Player 2 alias can only contain printable ASCII characters!";
    inputField.classList.add("is-invalid");
    clearTimeout(window.timeoutId);
    window.timeoutId = setTimeout(clearErrorMessage, 5000, invalidFeedback, inputField);
  } else if (player1Alias === player2Alias) {
    invalidFeedback.textContent = "Player 2 alias cannot be the same as Player 1 alias!";
    inputField.classList.add("is-invalid");
    clearTimeout(window.timeoutId);
    window.timeoutId = setTimeout(clearErrorMessage, 5000, invalidFeedback, inputField);
  } else if (player2Alias === '') {
    invalidFeedback.textContent = "Player 2 alias cannot be empty!";
    inputField.classList.add("is-invalid");
    clearTimeout(window.timeoutId);
    window.timeoutId = setTimeout(clearErrorMessage, 5000, invalidFeedback, inputField);
  } else {
    validFeedback.style.display = "block";
    inputField.classList.add("is-valid");
    closeModal();
    startGame();
  }
}

function clearErrorMessage(invalidFeedback, inputField) {
  invalidFeedback.textContent = "Looks stinky! 🚽";
  inputField.classList.remove("is-invalid");
}

function closeModal() {
  var modal = document.getElementById('startGameModal');
  var modalInstance = bootstrap.Modal.getInstance(modal);
  modalInstance.hide();
}

//?
//?
//? end of modal input validation
