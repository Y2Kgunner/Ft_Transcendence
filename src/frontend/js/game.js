import { getCookie } from './profile.js';

const matchPoint = 11;
let intervalId = null;
let paused = false;
let pauseModalVisible = false;
let gameOver = false;
let modalInit = false;

let ballX = 20;
let ballY = 20;
let ballSpeedX = 7.7;
let ballSpeedY = -4.55;
let initialBallSpeedX = 10;
let initialBallSpeedY = 10;
let score1 = 0;
let score2 = 0;
let player1Alias = "Player 1";
let player2Alias = "";
let initialPaddlePos;

let playerId;
let matchId;

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
let pauseModalInstance;

var inputField;
var startGameBtn;
var startModal;
var form;

let gameInProgress = false;


function resetBall() {
  ballX = board.offsetWidth / 2;
  ballY = board.offsetHeight / 2;
  ball.style.left = `${ballX}px`;
  ball.style.top = `${ballY}px`;

  // const randomDirection = Math.random() < 0.5 ? -1 : 1;
  // ballSpeedX = initialBallSpeedX * randomDirection;
  // ballSpeedY = initialBallSpeedY * (Math.random() * 2 - 1);
  ballSpeedX = 7.7;
  ballSpeedY = 4;
}

export function startGameSession() {
  gameInProgress = true;
  window.addEventListener('beforeunload', handleBeforeUnload);
}

export function endGameSession() {
  gameInProgress = false;
  window.removeEventListener('beforeunload', handleBeforeUnload);
}
function handleBeforeUnload(event) {
  if (gameInProgress) {
    const message = "You have an ongoing game. Are you sure you want to leave and lose your progress?";
    event.returnValue = message;
    return message;
  }
}

function setupGamePage() {
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

  pauseModalInstance = new bootstrap.Modal(document.getElementById('pauseGameModal'));
  startModal = new bootstrap.Modal(document.getElementById('startGameModal'));
  startModal.show();

  fetchUserProfile().then(data => {
    console.log(data);
    playerId = data.id;
    console.log(data.username);
    player1AliasElement = document.getElementById("player_1_alias");
    player1Alias = data.username;
    player1AliasElement.textContent = player1Alias;
    console.log(player1Alias);
  });

  startGameBtn = document.getElementById("startGameBtn");
  startGameBtn.addEventListener("click", function () {
    checkInput();
  });

  form = document.querySelector('.needs-validation');
  form.addEventListener('keyup', function (event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      // checkInput();
      startGameBtn.click();
    }
  });

  inputField = document.getElementById("player2alias");
  inputField.addEventListener('input', function () {
    updateValidationIcon();
  });

  restartGameBtn.addEventListener('click', async function (event) {
    await createMatch("Pong");
    startGame();
    await waitGameFinish(gameOver);
    updateMatch();
  });

  startGameBtn.addEventListener('click', async function (event) {
    await createMatch("Pong");
    startGame();
    await waitGameFinish(gameOver);
    updateMatch();
  });
}

function waitGameFinish(gameStatus, interval = 100) {
  return new Promise(resolve => {
    const check = () => {
      if (gameStatus) {
        console.log("game over")
        resolve();
      } else {
        setTimeout(check, interval);
      }
    };
    check();

  })
}

async function updateMatch() {
  const matchData = {
    match_id: matchId,
    score_player: score1,
    score_guest_player1: score2,
    winner: winner_match
  };
  endGameSession();
  console.log(matchData)
  const response = await fetch('https://127.0.0.1:443/pongApp/update_match', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + getCookie('jwt')
    },
    body: JSON.stringify(matchData)

  })
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  const data = await response.json();
  return data;
}

function fetchUserProfile() {
  return fetch('https://127.0.0.1:443/api/profile', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + getCookie('jwt')
    }
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      console.log(data);
      return data;
    })
    .catch(error => {
      console.error('Failed to fetch user profile:', error);
      return 'Unknown';
    });
}

async function createMatch(type) {
  const matchData = {
    player_id: playerId,
    guest_player1: player2Alias,
    game_type: type
  };
  console.log(matchData);
  startGameSession();
  const response = await fetch('https://127.0.0.1:443/pongApp/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + getCookie('jwt')
    },
    body: JSON.stringify(matchData)
  })
  // if (!response.ok) {
  //     throw new Error('Network response was not ok');
  // }
  const data = await response.json();
  console.log(data.match_id);
  matchId = data.match_id;
  return data;
}

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

function updateGame() {
  if (begin && !pauseModalVisible) {
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

    ballX += ballSpeedX;
    ballY += ballSpeedY;

    if (ballX <= 0) {
      score2++;
      score2Element.textContent = score2;
      resetBall();
    } else if (ballX + ball.offsetWidth >= board.offsetWidth) {
      score1++;
      score1Element.textContent = score1;
      resetBall();
    }

    if (ballY <= 0 || ballY + ball.offsetHeight >= board.offsetHeight)
      ballSpeedY = -ballSpeedY;

    ball.style.left = `${ballX}px`;
    ball.style.top = `${ballY}px`;

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

      const paddle1BottomThreshold = board.offsetHeight - paddle1.offsetHeight / 2;
      const paddle2BottomThreshold = board.offsetHeight - paddle2.offsetHeight / 2;
      if ((paddle1.offsetTop > 2 && (paddle1.offsetTop + paddle1.offsetHeight) < (board.offsetHeight - 2))
        && (paddle2.offsetTop > 2 && (paddle2.offsetTop + paddle2.offsetHeight) < (board.offsetHeight - 2))) {

        if (
          (ballSpeedX < 0 && paddle1.offsetTop > paddle1BottomThreshold && angle > 0) ||
          (ballSpeedX > 0 && paddle2.offsetTop > paddle2BottomThreshold && angle > 0)
        ) {
          ballSpeedY = -initialBallSpeedY * Math.abs(angle);
        } else {
          ballSpeedY = initialBallSpeedY * angle;
        }

        ballSpeedX = -ballSpeedX;
      } else {
        if (paddle1.offsetTop > 2 || paddle2.offsetTop > 2)
          ballSpeedY = -(ballSpeedY + 2.1);
        if ((paddle1.offsetTop + paddle1.offsetHeight) < (board.offsetHeight - 2)
          || (paddle2.offsetTop + paddle2.offsetHeight) < (board.offsetHeight - 2))
          ballSpeedY = -(ballSpeedY + 2.5);
        ballSpeedX = -ballSpeedX;
      }
    }
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

function startGame() {
  begin = true;
  gameOver = false;
  player2Alias = document.getElementById("player2alias").value;
  player2AliasElement.textContent = player2Alias;
  if (intervalId)
    clearInterval(intervalId);
  intervalId = setInterval(updateGame, 16);
  document.addEventListener("keydown", handleKeyDown);
  document.addEventListener("keyup", handleKeyUp);
}

function isPrintableASCII(str) {
  var printableASCIIRegex = /^[!-~]+$/;
  return printableASCIIRegex.test(str);
}

function pauseGame() {
  clearInterval(intervalId);
  intervalId = null;
  pauseModalInstance.show();
  pauseModalVisible = true;
}

function continueGame() {
  pauseModalInstance._element.addEventListener('hidden.bs.modal', function () {
    pauseModalVisible = false;
    if (!intervalId) {
      intervalId = setInterval(updateGame, 16);
    }
  }, { once: true });
  pauseModalInstance.hide();
}

//? modal input validation
//?
//?
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
  else if (player2Alias === '') {
    invalidFeedback.textContent = "Player 2 alias cannot be empty!";
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
  } else if (player2Alias.length > 10 || player2Alias.length < 3) {
    invalidFeedback.textContent = "Player 2 alias must be between 3 and 10 characters long!";
    inputField.classList.add("is-invalid");
    clearTimeout(window.timeoutId);
    window.timeoutId = setTimeout(clearErrorMessage, 5000, invalidFeedback, inputField);
  } else {
    validFeedback.style.display = "block";
    inputField.classList.add("is-valid");
    closeModal();
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

export { setupGamePage, fetchUserProfile, isPrintableASCII, waitGameFinish, updateMatch, gameInProgress };