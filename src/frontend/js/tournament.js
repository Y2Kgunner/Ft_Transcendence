// function setupTournamentPage() {
//     const startNewTournamentButton = document.getElementById('startNewTournament');
//     const newTournamentForm = document.getElementById('newTournamentForm');
//     const backToTournamentMainButton = document.getElementById('backToTournamentMain');
//     const minusButton = document.querySelector('.quantity__minus');
//     const plusButton = document.querySelector('.quantity__plus');
//     const input = document.getElementById('numParticipants');

//     function handleStartNewTournament() {
//         document.getElementById('tournament-content').style.display = 'none';
//         document.getElementById('newTournamentContainer').style.display = 'block';
//     }

//     function handleNewTournamentFormSubmit(event) {
//         event.preventDefault();
//         const numParticipants = parseInt(input.value, 10);
//         generateParticipantFields(numParticipants);
//     }

//     function handleBackToTournamentMain() {
//         document.getElementById('newTournamentContainer').style.display = 'none';
//         document.getElementById('tournament-content').style.display = 'block';
//     }

//     function handleMinusButtonClick() {
//         let value = parseInt(input.value, 10);
//         value = Math.max(3, value - 1);
//         input.value = value;
//     }

//     function handlePlusButtonClick() {
//         let value = parseInt(input.value, 10);
//         value = Math.min(value + 1, 8);
//         input.value = value;
//     }

//     startNewTournamentButton.addEventListener('click', handleStartNewTournament);
//     newTournamentForm.addEventListener('submit', handleNewTournamentFormSubmit);
//     backToTournamentMainButton.addEventListener('click', handleBackToTournamentMain);
//     minusButton.addEventListener('click', handleMinusButtonClick);
//     plusButton.addEventListener('click', handlePlusButtonClick);
//     setupStartTournamentForm();
// }

// function generateParticipantFields(num) {
//     const form = document.getElementById('participantDetailsFormInner');
//     form.innerHTML = ''; 

//     fetchUserProfile().then(username => {
//         const formGroupUser = document.createElement('div');
//         formGroupUser.classList.add('form-group');

//         const labelUser = document.createElement('label');
//         labelUser.textContent = `Participant 1 Name:`;
//         formGroupUser.appendChild(labelUser);

//         const inputUser = document.createElement('input');
//         inputUser.type = 'text';
//         inputUser.classList.add('form-control');
//         inputUser.value = username;
//         inputUser.readOnly = true;
//         formGroupUser.appendChild(inputUser);

//         form.appendChild(formGroupUser);

//         //participants
//         for (let i = 1; i < num; i++) {
//             const formGroup = document.createElement('div');
//             formGroup.classList.add('form-group');

//             const label = document.createElement('label');
//             label.textContent = `Participant ${i + 1} Name:`;
//             formGroup.appendChild(label);

//             const input = document.createElement('input');
//             input.type = 'text';
//             input.classList.add('form-control');
//             input.placeholder = `Enter name for participant ${i + 1}`;
//             input.required = true;
//             input.name = `participantName${i}`;
//             formGroup.appendChild(input);

//             form.appendChild(formGroup);
//         }

//         const submitButton = document.createElement('button');
//         submitButton.type = 'submit';
//         submitButton.classList.add('btn', 'btn-primary', 'mt-3');
//         submitButton.textContent = 'Submit Tournament';
//         form.appendChild(submitButton);
//     });

//     document.getElementById('newTournamentContainer').style.display = 'none'; 
//     document.getElementById('participantDetailsForm').style.display = 'block';
// }

// function fetchUserProfile() {
//     return fetch('https://127.0.0.1:443/api/profile', {
//         method: 'GET',
//         headers: {
//             'Content-Type': 'application/json',
//             'Authorization': 'Bearer ' + getCookie('jwt')
//         }
//     })
//     .then(response => {
//         if (!response.ok) {
//             throw new Error('Network response was not ok');
//         }
//         return response.json();
//     })
//     .then(data => {
//         return data.username;
//     })
//     .catch(error => {
//         console.error('Failed to fetch user profile:', error);
//         return 'Unknown';
//     });
// }

// function getCookie(name) {
//     let cookieValue = null;
//     if (document.cookie && document.cookie !== '') {
//       const cookies = document.cookie.split(';');
//       for (let i = 0; i < cookies.length; i++) {
//         const cookie = cookies[i].trim();
//         if (cookie.substring(0, name.length + 1) === (name + '=')) {
//           cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
//           break;
//         }
//       }
//     }
//    //console.log('Cookie value:', cookieValue);
//     return cookieValue;
// }

// function startTournament() {
//     const tournamentName = document.getElementById('tournamentName').value;
//     const participantInputs = document.querySelectorAll('#participantDetailsFormInner .form-control:not([readonly])');
//     const participants = Array.from(participantInputs).map(input => ({ temp_username: input.value }));
//     const loggedInUser = document.querySelector('#participantDetailsFormInner .form-control[readonly]').value;
//     participants.unshift({ username: loggedInUser });

//     const tournamentData = {
//         name: tournamentName,
//         participants: participants
//     };

//     fetch('https://127.0.0.1:443/tournament_api/create', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//             'Authorization': 'Bearer ' + getCookie('jwt')
//         },
//         body: JSON.stringify(tournamentData)
//     })
//     .then(response => {
//         if (!response.ok) {
//             throw new Error('Network response was not ok');
//         }
//         return response.json();
//     })
//     .then(data => {
//        //console.log('Tournament    :', data);
//         alert('Tournament created successfully!');
//         setTournamentId(data.id);
//         // create breacket page here or direct the to the game page
//     })
//     .catch(error => {
//         console.error('Failed to create tournament:', error);
//         alert('Failed to create tournament. Please try again.');
//     });
// }

// function setupStartTournamentForm() {
//     const form = document.getElementById('participantDetailsFormInner');
//     form.addEventListener('submit', function(event) {
//         event.preventDefault();
//         startTournament();
//     });
// }


// function setTournamentId(tournamentId) {
//     localStorage.setItem('currentTournamentId', tournamentId);
// }

// function getTournamentId() {
//     return localStorage.getItem('currentTournamentId');
// }


// export { setupTournamentPage };
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
