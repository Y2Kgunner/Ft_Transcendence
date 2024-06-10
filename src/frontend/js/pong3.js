import { eventManager, inputElement, checkInput, isPrintableASCII } from './inputValidation.js';
import { fetchUserProfile, updateMatch, createMatch } from './pong2.js'

let begin;
let initialVPaddlePos;
let initialHPaddlePos;
let pong3IntervalId;
let pauseModalVisible;
let gameOver;
const matchPoint = 3;
let matchId;
let draw;
let winner;

let ballX;
let ballY;
let ballSpeedX;
let ballSpeedY;
const initialBallSpeedX = 4;
const initialBallSpeedY = 5;

let score1;
let score2;
let score3;
let restartModal;

let player1Alias = "Player 1";
let player2aliasPong3 = "Player 2";
let player3aliasPong3 = "Player 3";
let playerId;

let paddle1;
let paddle2;
let paddle3;

let ball;
let board;

let score1Element;
let score2Element;
let score3Element;
let player1AliasElement;
let player2aliasPong3Element;
let player3aliasPong3Element;

let paddle1MovingUp;
let paddle1MovingDown;
let paddle2MovingUp;
let paddle2MovingDown;
let paddle3MovingLeft;
let paddle3MovingRight;
let inputIds = ["player2aliasPong3", "player3aliasPong3"];

var startModal;
var form;
var modalInit = false;
let pauseModalInstance;
let gameInProgress3;
let countdownIntervalId;





export function startGameSession() {
  gameInProgress3 = true;
  window.addEventListener('beforeunload', handleBeforeUnload);
}

export function endGameSession() {
  gameInProgress3 = false;
  window.removeEventListener('beforeunload', handleBeforeUnload);
}
function handleBeforeUnload(event) {
  if (gameInProgress3) {
    const message = "You have an ongoing game. Are you sure you want to leave and lose your progress?";
    event.returnValue = message;
    return message;
  }
}

async function initGame(){
    player2aliasPong3 = document.getElementById("player2aliasPong3").value;
    player3aliasPong3 = document.getElementById("player3aliasPong3").value;
    // player2aliasPong3 = player2aliasPong3Element;
    // player3aliasPong3 = player3aliasPong3Element.value;
    console.log(player2aliasPong3 + player3aliasPong3);
    closeModal();
    let matchData = {
      player_id: playerId,
      guest_player1: player2aliasPong3,
      guest_player2: player3aliasPong3,
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
      score_guest_player: score3,
      winner: draw ? null : winner,
      is_draw: draw
    }
    updateMatch(matchData);
    startGame();
}

async function validateInput() {
  // const US = document.createElement('div');
  // formGroupUser.classList.add('input-group');
  // formGroupUser.classList.add('d-flex');
  // formGroupUser.classList.add('flex-column');

  const _elementBlock = [
    // new inputElement(player1Alias, 'userName', true, 4, 10),
    new inputElement('player2aliasPong3', 'userName', true, 4, 10),
    new inputElement('player3aliasPong3', 'userName', true, 4, 10),
  ];
  if (!checkInput(_elementBlock))
    return;
  initGame();
}

function waitGameFinish(gameStatus, interval = 100) {
  return new Promise(resolve => {
    const check = () => {
      if (gameOver) {
        console.log("game over");
        resolve();
      } else {
        setTimeout(check, interval);
      }
    };
    check();
  });
}

function initVariables() {
    score1 = matchPoint;
    score2 = matchPoint;
    score3 = matchPoint;
    ballX = 5;
    ballY = 5;
    ballSpeedX = 5;
    ballSpeedY = 5;
    pong3IntervalId = null;
    pauseModalVisible = false;
    gameOver = false;
    begin = false;
    draw = false;
    paddle1MovingUp = false;
    paddle1MovingDown = false;
    paddle2MovingUp = false;
    paddle2MovingDown = false;
    paddle3MovingLeft = false;
    paddle3MovingRight = false;
    gameInProgress3 = false;
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
}

function init3PlyrPong() {
//   score1 = matchPoint;
//   score2 = matchPoint;
//   score3 = matchPoint;
//   ballX = 5;
//   ballY = 5;
//   ballSpeedX = 5;
//   ballSpeedY = 5;
//   pong3IntervalId = null;
//   pauseModalVisible = false;
//   gameOver = false;
//   begin = false;
//   draw = false;
//   paddle1MovingUp = false;
//   paddle1MovingDown = false;
//   paddle2MovingUp = false;
//   paddle2MovingDown = false;
//   paddle3MovingLeft = false;
//   paddle3MovingRight = false;
//   gameInProgress3 = false;
  initVariables();
  restartModal = new bootstrap.Modal(document.getElementById('restartGame'));
  startModal = new bootstrap.Modal(document.getElementById('startGameModal'));
  startModal.show();

  fetchUserProfile().then(data => {
    playerId = data.id;
    player1AliasElement = document.getElementById("player_1_alias");
    player1Alias = data.username;
    player1AliasElement.textContent = player1Alias;
  });

  eventManager.addListener(document.getElementById("startGameBtn"), "click", validateInput);

  restartGameBtn.addEventListener('click', async function (event) {
    initVariables();
    player2aliasPong3 = document.getElementById("player2aliasPong3").value;
    player3aliasPong3 = document.getElementById("player3aliasPong3").value;
    // player2aliasPong3 = player2aliasPong3Element;
    // player3aliasPong3 = player3aliasPong3Element.value;
    console.log(player2aliasPong3 + player3aliasPong3);
    restartModal.hide();
    let matchData = {
      player_id: playerId,
      guest_player1: player2aliasPong3,
      guest_player2: player3aliasPong3,
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
      score_guest_player: score3,
      winner: draw ? null : winner,
      is_draw: draw
	}
    updateMatch(matchData);
    startGame();
  });

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
  // realTimeChecker();
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
    const paddle1Bottom = paddle1.offsetTop + paddle1.offsetHeight;
    const paddle2Bottom = paddle2.offsetTop + paddle2.offsetHeight;

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

    if ((paddle3.offsetLeft + paddle3.offsetWidth > board.offsetWidth - 50)
      || paddle3.offsetLeft < 50)
      ballSpeedX = -initialBallSpeedX * angle;
    else
      ballSpeedX = initialBallSpeedX * angle;
    ballSpeedY = -ballSpeedY;
  }
}

function resetBall() {
  ballX = board.offsetWidth / 2 - ball.offsetWidth / 2;
  ballY = board.offsetHeight / 2 - ball.offsetHeight / 2;
  ball.style.left = `${ballX}px`;
  ball.style.top = `${ballY}px`;
  ballSpeedX = initialBallSpeedY * (Math.random() < 0.5 ? -1 : 1);
  ballSpeedY = initialBallSpeedX * (Math.random() < 0.5 ? -1 : 1);
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
  // let player1Alias = "Player 1";
  // let player2aliasPong3 = "Player 2";
  // let player3aliasPong3 = "Player 3";
  if (score1 === 0) {
    winner = (score2 > score3) ? player2aliasPong3 : player3aliasPong3;
    if (score2 == score3) {
      winner = "draw :" + player2aliasPong3 + " and " + player3aliasPong3;
      draw = true;
    }
  } else if (score2 === 0) {
    winner = (score1 > score3) ? player1Alias : player3aliasPong3;
    if (score1 == score3) {
      winner = "draw :" + player1Alias + " and " + player3aliasPong3;
      draw = true;
    }
  } else {
    winner = (score1 > score2) ? player1Alias : player2aliasPong3;
    if (score1 == score2) {
      winner = "draw :" + player1Alias + " and " + player2aliasPong3;
      draw = true;
    }
  }

  winnerMsg.textContent = `${winner} wins!`;

  // score1 = matchPoint;
  // score2 = matchPoint;
  // score3 = matchPoint;
  resetBall();

  score1Element.textContent = score1;
  score2Element.textContent = score2;
  score3Element.textContent = score3;

  paddle1.style.top = initialVPaddlePos;
  paddle2.style.top = initialVPaddlePos;
  paddle3.style.left = initialHPaddlePos;
  endGameSession();
  restartModal.show();
//   restartGameBtn.addEventListener('click', function() {
//     restartModal.hide();
//     init3PlyrPong()
// });

  clearInterval(pong3IntervalId);
  pong3IntervalId = null;
}

function showCountdown(callback) {
	const countdownElement = document.createElement('div');
	countdownElement.id = 'countdown';
	countdownElement.style.position = 'absolute';
	countdownElement.style.top = '50%';
	countdownElement.style.left = '50%';
	countdownElement.style.transform = 'translate(-50%, -50%)';
	countdownElement.style.fontSize = '48px';
	countdownElement.style.fontWeight = 'bold';
	countdownElement.style.zIndex = '1000';
	countdownElement.style.color = '#07ed26';
	countdownElement.textContent = '5';
	document.body.appendChild(countdownElement);
  
	let count = 5;
	countdownIntervalId = setInterval(() => {
	  count--;
	  countdownElement.textContent = count;
	  if (count === 0) {
		clearInterval(countdownIntervalId);
		document.body.removeChild(countdownElement);
		callback();
	  }
	}, 1000);
}

function cancelCountdown() {
	if (countdownIntervalId) {
	  clearInterval(countdownIntervalId);
	  countdownIntervalId = null;
	  const countdownElement = document.getElementById('countdown');
	  if (countdownElement) {
		countdownElement.textContent = '';
		document.body.removeChild(countdownElement);
	  }
	}
}

function startGame() {
  player2aliasPong3Element = document.getElementById("player_2_alias");
  player3aliasPong3Element = document.getElementById("player_3_alias");
  player2aliasPong3Element.textContent = player2aliasPong3;
  player3aliasPong3Element.textContent = player3aliasPong3;
  cancelCountdown();
  startGameSession();
  begin = true;
  gameOver = false;
  showCountdown(() => {
	pong3IntervalId = setInterval(updateGame, 1000 / 60);
	document.addEventListener("keydown", handleKeyDown);
	document.addEventListener("keyup", handleKeyUp);
  });	
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
  clearInterval(pong3IntervalId);
  pong3IntervalId = null;
  pauseModalInstance = new bootstrap.Modal(document.getElementById('pauseGameModal'));
  pauseModalInstance.show();
  pauseModalVisible = true;
}

function continueGame() {
  pauseModalInstance.hide();
  pauseModalInstance._element.addEventListener('hidden.bs.modal', function () {
    pauseModalVisible = false;
    if (!pong3IntervalId)
      pong3IntervalId = setInterval(updateGame, 16);
  }, { once: true });
}

// async function updateMatch() {
//     const matchData = {
//       match_id: matchId,
//       score_player: score1,
//       score_guest_player1: score2,
//       winner: winner,
//       is_draw : false
//     };
//     endGameSession();
//     console.log(matchData)
//     const response = await fetch('https://127.0.0.1:443/pongApp/update_match', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': 'Bearer ' + getCookie('jwt')
//       },
//       body: JSON.stringify(matchData)

//     })
//     if (!response.ok) {
//       throw new Error('Network response was not ok');
//     }
//     const data = await response.json();
//     return data;
//   }

function closeModal() {
  var modal = document.getElementById('startGameModal');
  var modalInstance = bootstrap.Modal.getInstance(modal);
  modalInstance.hide();
}

export { init3PlyrPong, gameInProgress3, isPrintableASCII, pong3IntervalId };
