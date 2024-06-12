import { fetchUserProfile, updateMatch, createMatch } from './pong2.js';
import { inputElement, checkInput, eventManager } from './inputValidation.js';
import { appRouter } from './router.js';

let player1Name = "";
let playerId;
let startModal;
let player2Alias = "";
let matchId;
let winningConditions;
let winner;
let boxIndexValues;
let nextMove;
let gameOver = false;
let draw = false;
let useMouse;
let currentFocusIndex;
var restartModal;
let winnerMessageElement;
let nextMoveElement;
let boxes;
let playerNamesElement;
let isInputValid = false;
let WinnerMessage;
let nextMoveMessage;
var restartTTTBtn;
var startTTTBtn;
var form;

function handleKeyPress(event) {
  if (useMouse || gameOver) 
    return;
  const key = event.key;
  switch (key) {
    case 'ArrowUp':
      if (currentFocusIndex >= 3) moveFocus(currentFocusIndex - 3);
      break;
    case 'ArrowDown':
      if (currentFocusIndex < 6) moveFocus(currentFocusIndex + 3);
      break;
    case 'ArrowLeft':
      if (currentFocusIndex % 3 !== 0) moveFocus(currentFocusIndex - 1);
      break;
    case 'ArrowRight':
      if (currentFocusIndex % 3 !== 2) moveFocus(currentFocusIndex + 1);
      break;
    case 'Enter':
      if (boxIndexValues[currentFocusIndex] === "") {
        boxIndexValues[currentFocusIndex] = nextMove;
        boxes[currentFocusIndex].innerHTML = nextMove;
        checkWinner();
        changeNextMove();
      }
      break;
  }
}

function moveFocus(newIndex) {
  boxes[currentFocusIndex].classList.remove('focus');
  currentFocusIndex = newIndex;
  updateFocus();
}

function updateFocus() {
  if (useMouse || gameOver) {
    boxes[currentFocusIndex].classList.remove('focus');
  } else {
    boxes[currentFocusIndex].classList.add('focus');
  }
}

function changeNextMove() {
  nextMove = nextMove === "X" ? "O" : "X";
  useMouse = !useMouse; // Alternate input method
  nextMoveElement.innerHTML = nextMoveMessage();
  updateFocus();
}

function setupTTT() {
  winningConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  boxIndexValues = new Array(9).fill("");
  nextMove = 'X';
  gameOver = false;
  useMouse = true;
  currentFocusIndex = 0;

  nextMoveElement = document.querySelector('.turn');
  boxes = document.querySelectorAll('.box');
  playerNamesElement = document.querySelector('.player-names');

  WinnerMessage = () => `Winner is: ${winner}`;
  nextMoveMessage = () => `Next Move: ${nextMove} (use ${useMouse ? 'mouse' : 'keyboard'})`;

  restartModal = new bootstrap.Modal(document.getElementById('restartTTTModal'));
  startModal = new bootstrap.Modal(document.getElementById('startTTTModal'));
  startModal.show();

  fetchUserProfile().then(data => {
    playerId = data.id;
    player1Name = data.username;
  });

  startTTTBtn = document.getElementById("startTTTBtn");
  if (startTTTBtn) {
    startTTTBtn.addEventListener("click", async function () {
      const _elementBlock = [
        new inputElement('', '', !true, 69, 69, player1Name),
        new inputElement('player2Name', 'userName', true, 4, 10, "")
      ];
      if (!checkInput(_elementBlock)) 
        return;
      closeModal();
      player2Alias = document.getElementById('player2Name').value.trim();
      isInputValid = true;
      document.getElementById('game-container').style.display = 'block';
      document.getElementById('loading-screen').style.display = 'none';

      let matchData = {
        player_id: playerId,
        guest_player1: player2Alias,
        game_type: "TTT"
      };
      await createMatch(matchData).then(data => {
        matchId = data.match_id;
      });
      Game();
      await waitGameFinish(gameOver);
      matchData = {
        match_id: matchId,
        score_player: 0,
        score_guest_player1: 0,
        is_draw: draw ? true : false,
        winner: draw ? null : winner
      };
      updateMatch(matchData);
    });
  } 
  else {
    console.error("startTTTBtn not found");
  }

  form = document.querySelector('.needs-validation');
  if (form) {
    form.addEventListener('keyup', function (event) {
      if (event.key === 'Enter') {
        event.preventDefault();
        startTTTBtn.click();
      }
    });
  }

  eventManager.addListener(document.getElementById("backToMenu"), "click", function() {
    appRouter.navigate('/ttt', { force: true });
  });

  restartTTTBtn = document.getElementById("restartTTTBtn");
  restartTTTBtn.addEventListener('click', async function (event) {
    if (!isInputValid)
      return;
    let matchData = {
      player_id: playerId,
      guest_player1: player2Alias,
      game_type: "TTT"
    };
    await createMatch(matchData).then(data => {
      matchId = data.match_id;
    });
    boxIndexValues = new Array(9).fill("");
    nextMove = 'X';
    gameOver = false;
    useMouse = true;
    currentFocusIndex = 0;
    draw = false;
    boxes.forEach(box => {
      box.innerHTML = "";
    });

    document.removeEventListener('keydown', handleKeyPress);

    Game();
    await waitGameFinish(gameOver);
    matchData = {
      match_id: matchId,
      score_player: 0,
      score_guest_player1: 0,
      is_draw: draw ? true : false,
      winner: draw ? null : winner
    }
    updateMatch(matchData);
  });
}

function waitGameFinish(gameStatus, interval = 100) {
  return new Promise(resolve => {
    const check = () => {
      checkWinner();
      if (gameOver) {
        resolve();
      } else {
        setTimeout(check, interval);
      }
    };
    check();
  });
}

function Game() {
  player2Alias = document.getElementById('player2Name').value.trim();
  playerNamesElement.innerHTML = `${player1Name} vs ${player2Alias}`;
  nextMoveElement.innerHTML = nextMoveMessage();
  updateFocus();
  boxes.forEach(box => {
    box.addEventListener('click', handleBoxClick);
  });

  document.addEventListener('keydown', handleKeyPress);

  function handleBoxClick(event) {
    if (!useMouse || gameOver)
      return;
    const target = event.target;
    const boxIndex = target.dataset.boxIndex;
    if (boxIndexValues[boxIndex] !== "") {
      return;
    }

    boxIndexValues[boxIndex] = nextMove;
    target.innerHTML = nextMove;
    checkWinner();
    changeNextMove();
  }
}

function checkWinner() {
  for (const condition of winningConditions) {
    const [a, b, c] = condition;
    if (
      boxIndexValues[a] !== "" &&
      boxIndexValues[a] === boxIndexValues[b] &&
      boxIndexValues[a] === boxIndexValues[c]
    ) {
      gameOver = true;
      winnerMessageElement = document.getElementById('winner');
      if (nextMove == "X")
        winner = player2Alias;
      else
        winner = player1Name;
      winnerMessageElement.innerHTML = WinnerMessage();
      restartModal.show();
      return;
    }
  }

  if (!boxIndexValues.includes("") && !gameOver) {
    winnerMessageElement = document.getElementById('winner');
    winnerMessageElement.innerHTML = "Draw.";
    draw = true;
    gameOver = true;
    restartModal.show();
  }
}

function closeModal() {
  var modal = document.getElementById('startTTTModal');
  var modalInstance = bootstrap.Modal.getInstance(modal);
  modalInstance.hide();
}
export { setupTTT };