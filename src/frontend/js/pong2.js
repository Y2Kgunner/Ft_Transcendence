import { getCookie } from './profile.js';
import { inputElement, checkInput, eventManager } from './inputValidation.js';

const matchPoint = 11;
let pongIntervalId;
let gameOver;

let ballX;
let ballY;
let ballSpeedX;
let ballSpeedY;
let initialBallSpeedX;
let initialBallSpeedY;
let score1;
let score2;
let player1Alias = "Player 1";
let player2Alias = "";
let initialPaddlePos;
let winner;

let playerId;
let matchId;

let paddle1;
let paddle2;
const paddleSpeed = 12;
let ball;
let board;
let score1Element;
let score2Element;
let player1AliasElement;
let player2AliasElement;
let begin;
let paddle1MovingUp;
let paddle1MovingDown;
let paddle2MovingUp;
let paddle2MovingDown;


var startModal;
var restartModal;

let gameInProgress;
let countdownIntervalPong2;

function resetBall() {
  ballX = board.offsetWidth / 2 - ball.offsetWidth / 2;
  ballY = board.offsetHeight / 2 - ball.offsetHeight / 2;
  ball.style.left = `${ballX}px`;
  ball.style.top = `${ballY}px`;

  const randomDirection = Math.random() < 0.5 ? -1 : 1;
  ballSpeedX = initialBallSpeedX * randomDirection;
  ballSpeedY = initialBallSpeedY * (Math.random() * 2 - 1);
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

function startEnterKey(event) {
  if (event.key === 'Enter') {
    event.preventDefault();
    document.getElementById("startGameBtn");
  }
}

function initVariables() {
  ballX = 10;
  ballY = 10;
  ballSpeedX = 5;
  ballSpeedY = 5;
  initialBallSpeedX = 10;
  initialBallSpeedY = 10;
  score1 = 0;
  score2 = 0;
  begin = false;
  paddle1MovingUp = false;
  paddle1MovingDown = false;
  paddle2MovingUp = false;
  paddle2MovingDown = false;
  pongIntervalId = null;
  gameOver = false;
  gameInProgress = false;

  board = document.getElementById("board");
  paddle1 = document.getElementById("paddle_1");
  paddle2 = document.getElementById("paddle_2");
  initialPaddlePos = paddle1.style.top;
  ball = document.getElementById("ball");
  score1Element = document.getElementById("player_1_score");
  score2Element = document.getElementById("player_2_score");
  player2AliasElement = document.getElementById("player_2_alias");
  player2AliasElement.textContent = "Player-2";
  document.getElementById('player2alias').value = "";

  score1Element.textContent = score1;
  score2Element.textContent = score2;

}

function bringMenu() {
  initVariables();
  restartModal.hide();
  startModal.show();
}

function init2PlyrPong() {
  initVariables();
  startModal = new bootstrap.Modal(document.getElementById('startGameModal'));
  restartModal = new bootstrap.Modal(document.getElementById('restartGame'));
  startModal.show();

  fetchUserProfile().then(data => {
    playerId = data.id;
    player1AliasElement = document.getElementById("player_1_alias");
    player1Alias = data.username;
    player1AliasElement.textContent = player1Alias;
  });

  eventManager.addListener(document.getElementById("startGameBtn"), "click", validateInput);
  eventManager.addListener(document.getElementById("startGameModal"), "keypress", startEnterKey);
  eventManager.addListener(document.getElementById("backToMenu"), "click", bringMenu);


  const restartGameBtn = document.getElementById('restartGameBtn');
  restartGameBtn.addEventListener('click', async function (event) {
    initVariables();
    player2AliasElement.textContent = player2Alias;
    let matchData = {
      player_id: playerId,
      guest_player1: player2Alias,
      game_type: "Pong"
    };
    await createMatch(matchData).then(data => {
      matchId = data.match_id;
    });
    startGame();
    await waitGameFinish(gameOver);
    console.log("match :" +matchId);
    matchData = {
      match_id: matchId,
      score_player: score1,
      score_guest_player1: score2,
      winner: winner,
      is_draw: false
    }
    updateMatch(matchData);
    startGame();
  });
}

async function validateInput() {
  const _elementBlock = [
    new inputElement('', '', !true, 69, 69, player1Alias),
    new inputElement('player2alias', 'userName', true, 4, 10, "")
  ];
  if (!checkInput(_elementBlock)) {
    return;
  }
  player2Alias = document.getElementById("player2alias").value;
  closeModal();
  let matchData = {
    player_id: playerId,
    guest_player1: player2Alias,
    game_type: "Pong"
  };
  await createMatch(matchData).then(data => {
    matchId = data.match_id;
  });
  startGame();
  await waitGameFinish();
  console.log(gameOver);
  matchData = {
    match_id: matchId,
    score_player: score1,
    score_guest_player1: score2,
    winner: winner,
    is_draw: false
  }
  updateMatch(matchData);
}

function waitGameFinish(interval = 100) {
  return new Promise(resolve => {
    const check = () => {
      if (gameOver) {
        console.log("game over")
        resolve();
      } else {
        // console.log(gameOver);
        setTimeout(check, interval);
      }
    };
    check();
  })
}

async function updateMatch(matchData) {
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

async function createMatch(matchData) {
  startGameSession();
  const response = await fetch('https://127.0.0.1:443/pongApp/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + getCookie('jwt')
    },
    body: JSON.stringify(matchData)
  })
  const data = await response.json();

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
    if (paddle1MovingUp && paddle1.offsetTop > 6) {
      paddle1.style.top = `${paddle1.offsetTop - paddleSpeed}px`;
    } else if (paddle1MovingDown && paddle1.offsetTop + paddle1.offsetHeight < (board.offsetHeight - 6)) {
      paddle1.style.top = `${paddle1.offsetTop + paddleSpeed}px`;
    }
    if (paddle2MovingUp && paddle2.offsetTop > 6) {
      paddle2.style.top = `${paddle2.offsetTop - paddleSpeed}px`;
    } else if (paddle2MovingDown && paddle2.offsetTop + paddle2.offsetHeight < (board.offsetHeight - 6)) {
      paddle2.style.top = `${paddle2.offsetTop + paddleSpeed}px`;
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
      if ((paddle1.offsetTop > 6 && (paddle1.offsetTop + paddle1.offsetHeight) < (board.offsetHeight - 6))
        && (paddle2.offsetTop > 6 && (paddle2.offsetTop + paddle2.offsetHeight) < (board.offsetHeight - 6))) {
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
        if (paddle1.offsetTop > 6 || paddle2.offsetTop > 6)
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

function haltGame(game_winner) {
  gameOver = true;
  let winnerMsg = document.getElementById('GameWinner');
  winnerMsg.textContent = game_winner.toString() + " wins!";
  winner = game_winner;
  score1 = 0;
  score2 = 0;
  resetBall();
  begin = false;
  score1Element.textContent = score1;
  score2Element.textContent = score2;
  paddle1.style.top = initialPaddlePos;
  paddle2.style.top = initialPaddlePos;
  endGameSession();
  restartModal.show();
  clearInterval(pongIntervalId);
  pongIntervalId = null;
}

function showCountdown(callback) {
  let count = 5;
  var countdownElement = document.getElementById('countdown');
  countdownElement.textContent = count;
  countdownElement.style.display = "block";
  countdownIntervalPong2 = setInterval(() => {
    count--;
    countdownElement.textContent = count;
    if (count === 0) {
      clearInterval(countdownIntervalPong2);
      countdownElement.style.display = "none";
      callback();
    }
  }, 1000);
}

function cancelCountdown() {
  if (countdownIntervalPong2) {
    clearInterval(countdownIntervalPong2);
    document.getElementById('countdown').style.display = "none";
  }
}

function startGame() {
  begin = true;
  gameOver = false;
  player2AliasElement.textContent = player2Alias;
  if (pongIntervalId)
    clearInterval(pongIntervalId);
  resetBall();
  cancelCountdown();
  showCountdown(() => {
    pongIntervalId = setInterval(updateGame, 1000 / 60);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
  });
}

function isPrintableASCII(str) {
  var printableASCIIRegex = /^[!-~]+$/;
  return printableASCIIRegex.test(str);
}

function closeModal() {
  var modal = document.getElementById('startGameModal');
  var modalInstance = bootstrap.Modal.getInstance(modal);
  modalInstance.hide();
}
//?
//?
//? end of modal input validation

export { init2PlyrPong, fetchUserProfile, isPrintableASCII, waitGameFinish, updateMatch, createMatch, gameInProgress, pongIntervalId, countdownIntervalPong2 };
