let begin = false;
let initialVPaddlePos;
let initialHPaddlePos;
let intervalId = null;
let pauseModalVisible = false;
let gameOver = false;
const matchPoint = 100;

let ballX = 5;
let ballY = 5;
let ballSpeedX = 2;
let ballSpeedY = 2;
const initialBallSpeedX = 5;
const initialBallSpeedY = 5;

let score1 = matchPoint;
let score2 = matchPoint;
let score3 = matchPoint;

let player1Alias = "Player 1";
let player2Alias = "Player 2";
let player3Alias = "Player 3";

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

let paddle1MovingUp = false;
let paddle1MovingDown = false;
let paddle2MovingUp = false;
let paddle2MovingDown = false;
let paddle3MovingLeft = false;
let paddle3MovingRight = false;

// Input validation
var inputField;
var startGameBtn;
var startModal;
var form;
var modalInit = false;
const inputIds = ["player2alias", "player3alias"];

let pauseModalInstance;

window.onload = function () {
  checkInput();
}

function init3PlyrPong() {
  console.log('hello');
  board = document.getElementById("board");
  paddle1 = document.getElementById("paddle_1");
  paddle2 = document.getElementById("paddle_2");
  paddle3 = document.getElementById("paddle_3");

  ball = document.getElementById("ball");
  ballX = board.offsetWidth / 2 - ball.offsetWidth / 2;
  ballY = board.offsetHeight / 2 - ball.offsetHeight / 2;

  score1Element = document.getElementById("player_1_score");
  score1Element.textContent = score1;
  score2Element = document.getElementById("player_2_score");
  score2Element.textContent = score2;
  score3Element = document.getElementById("player_3_score");
  score3Element.textContent = score3;

  initialVPaddlePos = paddle1.style.top;
  initialHPaddlePos = paddle3.style.left;

  startGameBtn = document.getElementById("startGameBtn");
  if (startGameBtn) {
    startGameBtn.addEventListener("click", function () {
      checkInput();
    });
  } else {
    console.error("startGameBtn not found");
  }

  form = document.querySelector('.needs-validation');
  if (form) {
    form.addEventListener('keyup', function (event) {
      if (event.key === 'Enter') {
        event.preventDefault();
        checkInput();
      }
    });
  } else {
    console.log("form not found");
  }
  realTimeChecker();
}

function handleKeyDown(event) {
  switch (event.key) {
    case "w":
    case "W":
      paddle1MovingUp = true;
      break;
    case "s":
    case "S":
      paddle1MovingDown = true;
      break;
    case "ArrowUp":
      paddle2MovingUp = true;
      break;
    case "ArrowDown":
      paddle2MovingDown = true;
      break;
    case "n":
    case "N":
      paddle3MovingLeft = true;
      break;
    case "m":
    case "M":
      paddle3MovingRight = true;
      break;
    case " ":
      togglePause();
  }
}

function handleKeyUp(event) {
  switch (event.key) {
    case "w":
    case "W":
      paddle1MovingUp = false;
      break;
    case "s":
    case "S":
      paddle1MovingDown = false;
      break;
    case "ArrowUp":
      paddle2MovingUp = false;
      break;
    case "ArrowDown":
      paddle2MovingDown = false;
      break;
    case "n":
    case "N":
      paddle3MovingLeft = false;
      break;
    case "m":
    case "M":
      paddle3MovingRight = false;
      break;
  }
}

function updatePaddles() {
  // Paddle 1 movement
  if (paddle1MovingUp && paddle1.offsetTop > 8)
    paddle1.style.top = `${paddle1.offsetTop - 5}px`;
  if (paddle1MovingDown && paddle1.offsetTop + paddle1.offsetHeight < board.offsetHeight - 8)
    paddle1.style.top = `${paddle1.offsetTop + 5}px`;

  // Paddle 2 movement
  if (paddle2MovingUp && paddle2.offsetTop > 8)
    paddle2.style.top = `${paddle2.offsetTop - 5}px`;
  if (paddle2MovingDown && paddle2.offsetTop + paddle2.offsetHeight < board.offsetHeight - 8)
    paddle2.style.top = `${paddle2.offsetTop + 5}px`;

  // Paddle 3 movement
  if (paddle3MovingLeft && paddle3.offsetLeft > 50)
    paddle3.style.left = `${paddle3.offsetLeft - 5}px`;
  if (paddle3MovingRight && paddle3.offsetLeft + paddle3.offsetWidth < board.offsetWidth - 50)
    paddle3.style.left = `${paddle3.offsetLeft + 5}px`;
}

function updateBall() {
  ballX += ballSpeedX;
  ballY += ballSpeedY;

  ball.style.left = `${ballX}px`;
  ball.style.top = `${ballY}px`;

  // Ball out of bounds
  if (ballX <= 0) {
    score1--;
    score1Element.textContent = score1;
    resetBall();
  } if (ballX + ball.offsetWidth >= board.offsetWidth) {
    score2--;
    score2Element.textContent = score2;
    resetBall();
  } if (ballY >= board.offsetHeight) {
    score3--;
    score3Element.textContent = score3;
    resetBall();
  } if (score1 === 0 || score2 === 0 || score3 === 0) {
    haltGame();
  }

  if (ballY <= 0) {
    ballSpeedY = -ballSpeedY;
  }

  const ballRect = ball.getBoundingClientRect();
  const paddle1Rect = paddle1.getBoundingClientRect();
  const paddle2Rect = paddle2.getBoundingClientRect();
  const paddle3Rect = paddle3.getBoundingClientRect();

  let paddleCollisionY =
    (ballRect.right >= paddle1Rect.left &&
      ballRect.left <= paddle1Rect.right &&
      ballRect.top <= paddle1Rect.bottom &&
      ballRect.bottom >= paddle1Rect.top) ||
    (ballRect.right >= paddle2Rect.left &&
      ballRect.left <= paddle2Rect.right &&
      ballRect.top <= paddle2Rect.bottom &&
      ballRect.bottom >= paddle2Rect.top);
  let paddleCollisionX =
    (ballRect.right >= paddle3Rect.left &&
      ballRect.left <= paddle3Rect.right &&
      ballRect.top <= paddle3Rect.bottom &&
      ballRect.bottom >= paddle3Rect.top);

  // Ball collision with paddles
  if (paddleCollisionY) {
    const ballCenterY = ballY + ball.offsetHeight / 2;
    const paddle1CenterY = paddle1.offsetTop + paddle1.offsetHeight / 2;
    const paddle2CenterY = paddle2.offsetTop + paddle2.offsetHeight / 2;

    let paddleCenterY;
    if (ballSpeedX < 0)
      paddleCenterY = paddle1CenterY;
    else
      paddleCenterY = paddle2CenterY;

    const collisionOffset = ballCenterY - paddleCenterY;
    const maxOffset = paddle1.offsetHeight / 2;
    const angle = collisionOffset / maxOffset;

    ballSpeedY = initialBallSpeedY * angle;
    ballSpeedX = -ballSpeedX;
  } if (paddleCollisionX) {
    const ballCenterX = ballX + ball.offsetWidth / 2;
    const paddle3CenterX = paddle3.offsetLeft + paddle3.offsetWidth / 2;

    const collisionOffset = ballCenterX - paddle3CenterX;
    const maxOffset = paddle1.offsetHeight / 2;
    const angle = collisionOffset / maxOffset;

    ballSpeedX = initialBallSpeedX * angle;
    ballSpeedY = -ballSpeedY;
  }
}

function resetBall() {
  ballX = board.offsetWidth / 2 - ball.offsetWidth / 2;
  ballY = board.offsetHeight / 2 - ball.offsetHeight / 2;
  ball.style.left = `${ballX}px`;
  ball.style.top = `${ballY}px`;
  ballSpeedX = (Math.random() < 0.5 ? -1 : 1);
  ballSpeedY = (Math.random() < 0.5 ? -1 : 1);
}

function updateGame() {
  if (!begin && pauseModalVisible)
    return;
  updatePaddles();
  updateBall();
}

function haltGame() {
  pauseModalVisible = false;
  begin = false;
  gameOver = true;
  let winnerMsg = document.getElementById('GameWinner');
  let winner = '';

  if (score1 === 0) {
    winner = 'Player 2 and Player 3';
  } else if (score2 === 0) {
    winner = 'Player 1 and Player 3';
  } else if (score3 === 0) {
    winner = 'Player 1 and Player 2';
  }

  winnerMsg.textContent = `${winner} win!`;

  score1 = matchPoint;
  score2 = matchPoint;
  score3 = matchPoint;
  resetBall();

  score1Element.textContent = score1;
  score2Element.textContent = score2;
  score3Element.textContent = score3;

  paddle1.style.top = initialVPaddlePos;
  paddle2.style.top = initialVPaddlePos;
  paddle3.style.left = initialHPaddlePos;

  var restartModal = new bootstrap.Modal(document.getElementById('restartGame'));
  restartModal.show();

  clearInterval(intervalId);
  intervalId = null;
}

function startGame() {
  player2AliasElement = document.getElementById("player_2_alias");
  player3AliasElement = document.getElementById("player_3_alias");
  player2AliasElement.textContent = player2Alias;
  player3AliasElement.textContent = player3Alias;
  
  begin = true;
  gameOver = false;
  intervalId = setInterval(updateGame, 16);
  document.addEventListener("keydown", handleKeyDown);
  document.addEventListener("keyup", handleKeyUp);
}

// Pause and Resume

function togglePause() {
  if (!pauseModalVisible && !gameOver) {
    pauseGame();
  } else {
    continueGame();
  }
}

function pauseGame() {
  clearInterval(intervalId);
  intervalId = null;
  pauseModalInstance = new bootstrap.Modal(document.getElementById('pauseGameModal'));
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

function realTimeChecker() {
  inputIds.forEach((inputId) => {
    var inputField = document.getElementById(inputId);
    inputField.addEventListener('input', function () {
    var invalidFeedback = inputField.nextElementSibling;
    var validFeedback = invalidFeedback.nextElementSibling;
    inputId = inputField.value.trim();
    
    invalidFeedback.style.display = "none";
    validFeedback.style.display = "none";
    inputField.classList.remove("is-invalid", "is-valid");
    
    if (!modalInit) modalInit = true;
    else if (inputId.length > 10 || inputId.length < 3) {
      inputField.classList.add("is-invalid");
      invalidFeedback.style.display = "block";
    } else if (!isPrintableASCII(inputId)) {
      inputField.classList.add("is-invalid");
      invalidFeedback.style.display = "block";
    } else if (player1Alias === inputId) {
      inputField.classList.add("is-invalid");
      invalidFeedback.style.display = "block";
    } else if (inputId === '') {
      inputField.classList.add("is-invalid");
      invalidFeedback.style.display = "block";
    } else {
      inputField.classList.add("is-valid");
      validFeedback.style.display = "block";
    }
  });
});
}

function isPrintableASCII(str) {
  var printableASCIIRegex = /^[!-~]+$/;
  return printableASCIIRegex.test(str);
}

function checkInput() {
  let allInputsValid = true;

  inputIds.forEach((inputId) => {
    const inputField = document.getElementById(inputId);
    var invalidFeedback = inputField.nextElementSibling;
    var validFeedback = invalidFeedback.nextElementSibling;

    if (inputField) {
      const playerAlias = inputField.value.trim();

      invalidFeedback.textContent = "Looks stinky! 🚽";
      validFeedback.style.display = "none";
      inputField.classList.remove("is-invalid", "is-valid");

      if (!modalInit) {
        modalInit = true;
      } else if (playerAlias === '') {
        invalidFeedback.textContent = "Player alias cannot be empty!";
        inputField.classList.add("is-invalid");
        clearTimeout(window.timeoutId);
        window.timeoutId = setTimeout(clearErrorMessage, 5000, invalidFeedback, inputField);
        allInputsValid = false;
      } else if (!isPrintableASCII(playerAlias)) {
        invalidFeedback.textContent = "Player alias can only contain printable ASCII characters!";
        inputField.classList.add("is-invalid");
        clearTimeout(window.timeoutId);
        window.timeoutId = setTimeout(clearErrorMessage, 5000, invalidFeedback, inputField);
        allInputsValid = false;
      } else if (playerAlias.length > 10 || playerAlias.length < 3) {
        invalidFeedback.textContent = "Player alias must be between 3 and 10 characters long!";
        inputField.classList.add("is-invalid");
        clearTimeout(window.timeoutId);
        window.timeoutId = setTimeout(clearErrorMessage, 5000, invalidFeedback, inputField);
        allInputsValid = false;
      } else {
        validFeedback.style.display = "block";
        inputField.classList.add("is-valid");
      }
    } else {
      console.error(`inputField with ID ${inputId} not found`);
    }
  });
  if (allInputsValid) {
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
