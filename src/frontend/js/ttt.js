import { fetchUserProfile, isPrintableASCII, createMatch } from './game.js';
import { getCookie } from './profile.js';

let player1Name = "";
let player2Name;
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

var startTTTBtn;
var form;
var modalInit = false;

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

  winnerMessageElement = document.getElementById('winner');
  nextMoveElement = document.querySelector('.turn');
  boxes = document.querySelectorAll('.box');
  playerNamesElement = document.querySelector('.player-names');

  WinnerMessage = () => `Winner is: ${nextMove}`;
  nextMoveMessage = () => `Next Move: ${nextMove} (use ${useMouse ? 'mouse' : 'keyboard'})`;

  restartModal = new bootstrap.Modal(document.getElementById('restartTTTModal'));

  startModal = new bootstrap.Modal(document.getElementById('startTTTModal'));
  startModal.show();

  fetchUserProfile().then(data => {
    console.log(data);
    playerId = data.id;
    console.log(data.username);
    player1Name = data.username;
    console.log(player1Name);
  });

  startTTTBtn = document.getElementById("startTTTBtn");
  if (startTTTBtn) {
    startTTTBtn.addEventListener("click", function () {
      checkInput();
    });
  } else {
    console.error("startTTTBtn not found");
  }

  form = document.querySelector('.needs-validation');
  if (form) {
    form.addEventListener('keyup', function (event) {
      if (event.key === 'Enter') {
        event.preventDefault();
        checkInput();
        startTTTBtn.click();
      }
    });
  }
  
  startTTTBtn.addEventListener('click', async function (event) {
    if (!isInputValid)
      return ;
    await createMatch("TTT").then(data => {
      matchId = data.match_id;
    });
    Game();
    await waitGameFinish(gameOver);
    if (nextMove == "X")
      winner = player2Alias;
    else
      winner = player1Name;
    updateMatch();
  });
  // startTTTBtn.addEventListener('keypress', async function (event) {
  //   if (event.keyCode === 13) {
  //     event.preventDefault();
  //   }
  // });

  restartTTTBtn.addEventListener('click', async function (event) {
    await createMatch("TTT").then(data => {
      matchId = data.match_id;
    });
    boxIndexValues = new Array(9).fill("");
    nextMove = 'X';
    gameOver = false;
    useMouse = true;
    currentFocusIndex = 0;
    Game();
    await waitGameFinish(gameOver);
    if (nextMove == "X")
      winner = player2Alias;
    else
      winner = player1Name
    updateMatch();
  });
  realTimeChecker();
}

function waitGameFinish(gameStatus, interval = 100) {
  return new Promise(resolve => {
    const check = () => {
      checkWinner();
      if (gameOver) {
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
  let matchData;
  if (draw) {
    matchData = {
      match_id: matchId,
      score_player: 0,
      score_guest_player1: 0,
      is_draw: draw,
    };
  }
  else {
    matchData = {
      match_id: matchId,
      score_player: 0,
      score_guest_player1: 0,
      winner: winner,
      is_draw: false
    };
  }
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

function Game() {
  playerNamesElement.innerHTML = `${player1Name} vs ${player2Alias}`;
  nextMoveElement.innerHTML = nextMoveMessage();
  updateFocus();
  boxes.forEach(box => {
    box.addEventListener('click', handleBoxClick);
  });

  document.addEventListener('keydown', handleKeyPress);

  function handleBoxClick(event) {
    if (!useMouse || gameOver) return;

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

  function handleKeyPress(event) {
    if (useMouse || gameOver) return;

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
};

function checkWinner() {
  for (const condition of winningConditions) {
    const [a, b, c] = condition;
    if (
      boxIndexValues[a] !== "" &&
      boxIndexValues[a] === boxIndexValues[b] &&
      boxIndexValues[a] === boxIndexValues[c]
    ) {
      gameOver = true;
      winnerMessageElement.innerHTML = WinnerMessage();
      restartModal.show();
      return;
    }
  }

  if (!boxIndexValues.includes("") && !gameOver) {
    winnerMessageElement.innerHTML = "Draw.";
    draw = true;
    gameOver = true;
    restartModal.show();
  }
}


//?
//? 
function realTimeChecker() {
  var inputField = document.getElementById("player2Name");
  inputField.addEventListener('input', function () {
    var invalidFeedback = inputField.nextElementSibling;
    var validFeedback = invalidFeedback.nextElementSibling;
    var inputId = inputField.value.trim();

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
    } else if (player1Name === inputId) {
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
}

function checkInput() {
  const player2Name = document.getElementById("player2Name");
  var invalidFeedback = player2Name.nextElementSibling;
  var validFeedback = invalidFeedback.nextElementSibling;

  player2Alias = player2Name.value.trim();

  invalidFeedback.textContent = "Looks stinky! 🚽";
  validFeedback.style.display = "none";
  player2Name.classList.remove("is-invalid", "is-valid");

  if (!modalInit) {
    modalInit = true;
  } else if (player2Alias === '') {
    invalidFeedback.textContent = "Player alias cannot be empty!";
    player2Name.classList.add("is-invalid");
    clearTimeout(window.timeoutId);
    window.timeoutId = setTimeout(clearErrorMessage, 5000, invalidFeedback, player2Name);
  } else if (!isPrintableASCII(player2Alias)) {
    invalidFeedback.textContent = "Player alias can only contain printable ASCII characters!";
    player2Name.classList.add("is-invalid");
    clearTimeout(window.timeoutId);
    window.timeoutId = setTimeout(clearErrorMessage, 5000, invalidFeedback, player2Name);
  } else if (player2Alias.length > 10 || player2Alias.length < 3) {
    invalidFeedback.textContent = "Player alias must be between 3 and 10 characters long!";
    player2Name.classList.add("is-invalid");
    clearTimeout(window.timeoutId);
    window.timeoutId = setTimeout(clearErrorMessage, 5000, invalidFeedback, player2Name);
  } else {
    validFeedback.style.display = "block";
    player2Name.classList.add("is-valid");
    isInputValid = true;
    closeModal();
    document.getElementById('game-container').style.display = 'block';
    document.getElementById('loading-screen').style.display = 'none';
  }
}

function clearErrorMessage(invalidFeedback, inputField) {
  invalidFeedback.textContent = "Looks stinky! 🚽";
  inputField.classList.remove("is-invalid");
}

function closeModal() {
  var modal = document.getElementById('startTTTModal');
  var modalInstance = bootstrap.Modal.getInstance(modal);
  modalInstance.hide();
}

//? 
//?

export { setupTTT };





// import { fetchUserProfile , isPrintableASCII, createMatch} from './game.js';
// import { getCookie } from './profile.js';
// let player1Name = "";
// let player2Name;
// let playerId;
// let startModal;
// let player2Alias ="";
// let matchId;
// let winningConditions;
// let winner;
// let boxIndexValues;
// let nextMove;
// let gameOver = false;
// let draw = false;
// let useMouse; 
// let currentFocusIndex;
// var restartModal;
// let winnerMessageElement;
// let nextMoveElement;
// let boxes;
// let playerNamesElement;

// let WinnerMessage;
// let nextMoveMessage;

// function checkInput() {
//     var button = document.getElementById("startTTTBtn");
//     player2Alias = document.getElementById("player2Name").value;
//     console.log(player2Alias)
//     if (player2Alias.trim() === '') {
//         button.disabled = true;
//     } else if (player2Alias.length > 10 || player2Alias.length < 3) {
//         // player2AliasElement = document.getElementById("player_2_alias");
//         button.disabled = false;
//     } else if (!isPrintableASCII(player2Alias)) {
//         // player2AliasElement = document.getElementById("player_2_alias");
//         button.disabled = false;
//     } else if (player1Name === player2Alias) {
//         // player2AliasElement = document.getElementById("player_2_alias");
//         button.disabled = false;
//     } else {
//         // player2AliasElement = document.getElementById("player_2_alias");
//         button.disabled = false;
//     }
// }


// function setupTTT() {
//     winningConditions = [
//         [0, 1, 2],
//         [3, 4, 5],
//         [6, 7, 8],
//         [0, 3, 6],
//         [1, 4, 7],
//         [2, 5, 8],
//         [0, 4, 8],
//         [2, 4, 6],
//     ];

//     boxIndexValues = new Array(9).fill("");
//     nextMove = 'X';
//     gameOver = false;
//     useMouse = true; // Start with mouse for player 'X'
//     currentFocusIndex = 0;

//     winnerMessageElement = document.querySelector('.winner');
//     nextMoveElement = document.querySelector('.turn');
//     boxes = document.querySelectorAll('.box');
//     playerNamesElement = document.querySelector('.player-names');

//     WinnerMessage = () => `Winner is: ${nextMove}`;
//     nextMoveMessage = () => `Next Move: ${nextMove} (use ${useMouse ? 'mouse' : 'keyboard'})`;

//     restartModal = new bootstrap.Modal(document.getElementById('restartGame'));

//     startModal = new bootstrap.Modal(document.getElementById('startTTTModal'));
//     startModal.show();
//     fetchUserProfile().then(data => {
//         console.log(data);
//         playerId = data.id;
//         console.log(data.username);
//         // player1AliasElement = document.getElementById("player_1_alias");
//         player1Name = data.username;
//         console.log(player1Name);
//     });

//     player2Name = document.getElementById("player2Name");
//     console.log(player2Name);
//     player2Name.addEventListener('input', checkInput);

//     startTTTBtn.addEventListener('click', async function (event) {
//         await createMatch("TTT").then( data => {
//             matchId = data.match_id;
//         });

//         // console.log(matchId);
//         // console.log(gameOver);
//         Game();
//         // console.log(gameOver);
//         await waitGameFinish(gameOver);
//         // console.log(gameOver);
//         // console.log("finished");
//         if (nextMove == "X")
//             winner = player2Alias;
//         else
//             winner = player1Name
//         // console.log(winner);
//         updateMatch();
//     });
//     restartTTTBtn.addEventListener('click', async function (event) {
//         await createMatch("TTT").then( data => {
//             matchId = data.match_id;
//         });
//         boxIndexValues = new Array(9).fill("");
//         nextMove = 'X';
//         gameOver = false;
//         useMouse = true; // Start with mouse for player 'X'
//         currentFocusIndex = 0;
//         Game();
//         await waitGameFinish(gameOver);
//         if (nextMove == "X")
//             winner = player2Alias;
//         else
//             winner = player1Name
//         updateMatch();
//     });

// }
// function waitGameFinish(gameStatus,interval = 100) {
//     return new Promise(resolve => {
//       const check = () => {
//         checkWinner();
//         if(gameOver) {
//           console.log("game over")
//           resolve();
//         } else {
//           setTimeout(check,interval);
//         }
//       };
//       check();

//     })
//   }
// async function updateMatch() {
//     let matchData;
//     if (draw)
//     {
//         matchData = {
//             match_id : matchId,
//             score_player : 0,
//             score_guest_player1: 0,
//             is_draw : draw,
//         };
//     }
//     else
//     {
//         matchData = {
//             match_id : matchId,
//             score_player : 0,
//             score_guest_player1: 0,
//             winner : winner,
//             is_draw : false
//         };
//     }

//     console.log(matchData)
//     const response = await fetch('https://127.0.0.1:443/pongApp/update_match', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//             'Authorization': 'Bearer ' + getCookie('jwt')
//         },
//         body: JSON.stringify(matchData)
//     })
//     if (!response.ok) {
//         throw new Error('Network response was not ok');
//     }
//     const data = await response.json();
//     return data;
// }

// function Game() {
//     // Handle confirm button click
//     // document.getElementById('confirmButton').addEventListener('click', () => {
//     //     const player1Name = "player1";
//     //     const player2Name = document.getElementById('player2Name').value;
//     //     if (player1Name && player2Name) {
//     //         document.getElementById('name-entry').style.display = 'none';
//     //         document.getElementById('game-container').style.display = 'block';
//     //         // playerNamesElement.innerHTML = `${player1Name} vs ${player2Name}`;
//     //         // nextMoveElement.innerHTML = nextMoveMessage();
//     //         // updateFocus();
//     //     }
//     // });
//     console.log("game starting");
//     playerNamesElement.innerHTML = `${player1Name} vs ${player2Alias}`;
//     nextMoveElement.innerHTML = nextMoveMessage();
//     updateFocus();
//     boxes.forEach(box => {
//         box.addEventListener('click', handleBoxClick);
//     });

//     document.addEventListener('keydown', handleKeyPress);

//     function handleBoxClick(event) {
//         if (!useMouse || gameOver) return;

//         const target = event.target;
//         const boxIndex = target.dataset.boxIndex;
//         if (boxIndexValues[boxIndex] !== "") {
//             return; // If the box is already filled, do nothing
//         }

//         boxIndexValues[boxIndex] = nextMove;
//         target.innerHTML = nextMove;
//         checkWinner();
//         changeNextMove();
//     }

//     function handleKeyPress(event) {
//         if (useMouse || gameOver) return;

//         const key = event.key;

//         switch (key) {
//             case 'ArrowUp':
//                 if (currentFocusIndex >= 3) moveFocus(currentFocusIndex - 3);
//                 break;
//             case 'ArrowDown':
//                 if (currentFocusIndex < 6) moveFocus(currentFocusIndex + 3);
//                 break;
//             case 'ArrowLeft':
//                 if (currentFocusIndex % 3 !== 0) moveFocus(currentFocusIndex - 1);
//                 break;
//             case 'ArrowRight':
//                 if (currentFocusIndex % 3 !== 2) moveFocus(currentFocusIndex + 1);
//                 break;
//             case 'Enter':
//                 if (boxIndexValues[currentFocusIndex] === "") {
//                     boxIndexValues[currentFocusIndex] = nextMove;
//                     boxes[currentFocusIndex].innerHTML = nextMove;
//                     checkWinner();
//                     changeNextMove();
//                 }
//                 break;
//         }
//     }

//     function moveFocus(newIndex) {
//         boxes[currentFocusIndex].classList.remove('focus');
//         currentFocusIndex = newIndex;
//         updateFocus();
//     }

//     function updateFocus() {
//         if (useMouse || gameOver) {
//             boxes[currentFocusIndex].classList.remove('focus');
//         } else {
//             boxes[currentFocusIndex].classList.add('focus');
//         }
//     }

//     function changeNextMove() {
//         nextMove = nextMove === "X" ? "O" : "X";
//         useMouse = !useMouse; // Alternate input method
//         nextMoveElement.innerHTML = nextMoveMessage();
//         updateFocus();
//     }

// };
// function checkWinner() {
//     for (const condition of winningConditions) {
//         const [a, b, c] = condition;
//         if (
//             boxIndexValues[a] !== "" &&
//             boxIndexValues[a] === boxIndexValues[b] &&
//             boxIndexValues[a] === boxIndexValues[c]
//         ) {
//             gameOver = true;
//             winnerMessageElement.innerHTML = WinnerMessage();
//             restartModal.show();
//             return;
//         }
//     }

//     if (!boxIndexValues.includes("") && !gameOver) {
//         winnerMessageElement.innerHTML = "Draw.";
//         draw = true;
//         gameOver = true;
//         restartModal.show();
//     }
// }

// export { setupTTT };


























