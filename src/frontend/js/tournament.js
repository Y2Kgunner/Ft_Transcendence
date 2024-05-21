const matchPoint = 1;
let intervalId = null;
let paused = false;
let pauseModalVisible = false;
let gameOver = false;
let winner;
let participants;
let creator;

let pauseModalInstance;
let startModal;
var restartModal;

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
let initialPaddlePos;
let tournamentName = "";

let paddle1;
let paddle2;
let ball;
let board;
let score1Element;
let score2Element;
let player1AliasElement;
let player2AliasElement;

let tournamentNameElement;
let begin = false;
let paddle1MovingUp = false;
let paddle1MovingDown = false;
let paddle2MovingUp = false;
let paddle2MovingDown = false;





function setupTournamentPage() {
    // Get elements
    board = document.getElementById("board");
    paddle1 = document.getElementById("paddle_1");
    paddle2 = document.getElementById("paddle_2");
    initialPaddlePos = paddle1.style.top;
    ball = document.getElementById("ball");
    score1Element = document.getElementById("player_1_score");
    score2Element = document.getElementById("player_2_score");
    pauseModalInstance = new bootstrap.Modal(document.getElementById('pauseGameModal'));
    restartModal = new bootstrap.Modal(document.getElementById('restartGame'));
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
    var detailsModal = new bootstrap.Modal(document.getElementById('enterTournamentDetails'));
    detailsModal.show();

    const minusButton = document.querySelector('.quantity__minus');
    const plusButton = document.querySelector('.quantity__plus');
    const input = document.getElementById('numParticipants');

    function handleMinusButtonClick() {
        let value = parseInt(input.value, 10);
        value = Math.max(3, value - 1);
        input.value = value;
    }

    function handlePlusButtonClick() {
        let value = parseInt(input.value, 10);
        value = Math.min(value + 1, 8);
        input.value = value;
    }
    minusButton.addEventListener('click', handleMinusButtonClick);
    plusButton.addEventListener('click', handlePlusButtonClick);
    tournamentName = document.getElementById("tournamentName");
    tournamentName.addEventListener('input', checkInput);
    startModal = new bootstrap.Modal(document.getElementById('startGameModal'));
    continueBtn.addEventListener('click', handleNewTournamentFormSubmit)

    function handleNewTournamentFormSubmit(event) {
        event.preventDefault();

        const numParticipants = parseInt(input.value, 10);
        generateParticipantFields(numParticipants);
        detailsModal.toggle();
        startModal.show();
    }
    continueBtn.addEventListener('submit', handleNewTournamentFormSubmit);
    setupcreateTournamentForm();
    // startModal.hide();
    // startGameLoop();
};

function generateParticipantFields(num) {
    const form = document.getElementById('participantDetailsFormInner');
    form.innerHTML = '';
    fetchUserProfile().then(username => {
        const formGroupUser = document.createElement('div');
        formGroupUser.classList.add('form-group');

        const labelUser = document.createElement('label');
        labelUser.textContent = `Participant 1 Name:`;
        formGroupUser.appendChild(labelUser);

        const inputUser = document.createElement('input');
        inputUser.type = 'text';
        inputUser.classList.add('form-control');
        inputUser.value = username;
        inputUser.readOnly = true;
        formGroupUser.appendChild(inputUser);

        form.appendChild(formGroupUser);

        //participants
        for (let i = 1; i < num; i++) {
            const formGroup = document.createElement('div');
            formGroup.classList.add('form-group');

            const label = document.createElement('label');
            label.textContent = `Participant ${i + 1} Name:`;
            formGroup.appendChild(label);

            const input = document.createElement('input');
            input.type = 'text';
            input.classList.add('form-control');
            input.placeholder = `Enter name for participant ${i + 1}`;
            input.required = true;
            input.name = `participantName${i}`;
            formGroup.appendChild(input);

            form.appendChild(formGroup);
        }

        const submitButton = document.createElement('button');
        submitButton.type = 'submit';
        submitButton.classList.add('btn', 'btn-primary', 'mt-3');
        submitButton.textContent = 'Submit Tournament';
        form.appendChild(submitButton);
    });

    // document.getElementById('newTournamentContainer').style.display = 'none';
    // document.getElementById('participantDetailsForm').style.display = 'block';
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
  } else if (event.key === " ") {
    togglePause();
  }
};

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
};

function togglePause() {
  if (!pauseModalVisible && !gameOver) {
    paused = true;
    pauseGame();
  } else {
    continueGame();
  }
};

function updateGame() {
  if (begin && !pauseModalVisible) {
    // Update paddle positions
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
    ball.style.left = `${ballX}px`;
    ball.style.top = `${ballY}px`;

    if (ballX <= 0) {
      score2++;
      score2Element.textContent = score2;
      resetBall();
    } else if (ballX + ball.offsetWidth >= board.offsetWidth) {
      score1++;
      score1Element.textContent = score1;
      resetBall();
    }
    if (score1 === matchPoint || score2 === matchPoint) {
      haltGame(score1 === matchPoint ? player1Alias : player2Alias);
    }

    if (ballY <= 0 || ballY + ball.offsetHeight >= board.offsetHeight)
      ballSpeedY = -ballSpeedY;

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
      ballSpeedY = initialBallSpeedY * angle;
      ballSpeedX = -ballSpeedX;
    }
  }
}

function haltGame(winning_player) {
  winner = winning_player;
  paused = false;
  pauseModalVisible = false;
  gameOver = true;
  let winnerMsg = document.getElementById('GameWinner');
  winnerMsg.textContent = winning_player.toString() + " wins!";
  score1 = 0;
  score2 = 0;
  resetBall();
  begin = false;
  score1Element.textContent = score1;
  score2Element.textContent = score2;
  paddle1.style.top = initialPaddlePos;
  paddle2.style.top = initialPaddlePos;
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

// function startGame() {
//   begin = true;
//   tournamentName = document.getElementById("tournamentName").value;
//   // player2AliasElement.textContent = player2Alias;
//   setInterval(updateGame, 16); // 16ms = 60fps
//   document.addEventListener("keydown", handleKeyDown);
//   document.addEventListener("keyup", handleKeyUp);
// };

function startGame() {
  begin = true;
  gameOver = false;
  tournamentName = document.getElementById("tournamentName").value;
  // player2Alias = document.getElementById("player2alias").value;
  // player2AliasElement.textContent = player2Alias;
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

function hideOverflow() {
    const content = document.getElementsById('board');
    content.style.opacity = 1;
}

function checkInput() {
  var button = document.getElementById("continueBtn");
  tournamentName = document.getElementById("tournamentName").value;
  if (tournamentName.trim() === '') {
      button.disabled = true;
  } else if (tournamentName.length > 10 || tournamentName.length < 3) {
      tournamentNameElement = document.getElementById("tournamentName");
      button.disabled = false;
      // createAlert(notiAlert, 'Alias is between 3 and 10 characters!', 'alert-danger');
  } else if (!isPrintableASCII(tournamentName)) {
      tournamentNameElement = document.getElementById("tournamentName");
      button.disabled = false;
      // createAlert(notiAlert, 'Alias cannot contain spaces!', 'alert-danger');
  } else {
      tournamentNameElement = document.getElementById("tournamentName");
      button.disabled = false;
  }
  // return ;
  // else if (player1Alias === tournamentName) {
  //     tournamentNameElement = document.getElementById("player_2_alias");
  //     button.disabled = false;
  //     // createAlert(notiAlert, 'Alias cannot be the same as the user!', 'alert-danger');
  //   }
};


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

// Get the element with the class baseTest
// let baseTestElement = document.querySelector('.baseTest');

// Add an event listener to the game start event (e.g. a button click)
// document.getElementById('continueBtn').addEventListener('click', () => {
//   // Remove the class baseTest from the element
//   baseTestElement.classList.remove('baseTest');
// });
// export { checkInput };



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
        return data.username;
    })
    .catch(error => {
        console.error('Failed to fetch user profile:', error);
        return 'Unknown';
    });
}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === (name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
   //console.log('Cookie value:', cookieValue);
    return cookieValue;
}

function createTournament() {
    const tournamentName = document.getElementById('tournamentName').value;
    const participantInputs = document.querySelectorAll('#participantDetailsFormInner .form-control:not([readonly])');
    const participants = Array.from(participantInputs).map(input => ({ temp_username: input.value }));
    const loggedInUser = document.querySelector('#participantDetailsFormInner .form-control[readonly]').value;
    participants.unshift({ username: loggedInUser });

    const tournamentData = {
        name: tournamentName,
        participants: participants
    };

    fetch('https://127.0.0.1:443/tournament_api/create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + getCookie('jwt')
        },
        body: JSON.stringify(tournamentData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log('Tournament    :', data);
        // alert('Tournament created successfully!');
        // setTournamentId(data.id);
        // console.log(data.id);
        getMatchData();
        // getNextMatch(data.id);
    })
    .catch(error => {
        console.error('Failed to create tournament:', error);
        alert('Failed to create tournament. Please try again.');
    });
}

// function sleep(ms) {
//   return new Promise(resolve => setTimeout(resolve,ms));
// }
function startTournament(id) {
  fetch(`https://127.0.0.1:443/tournament_api/start`, {
      method: 'POST',
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
     console.log('Tournament    :', data);
     startGameLoop();
    //  alert('started Tournament!');
  })
  .catch(error => {
      console.error('Failed to start tournanment:', error);
      alert('failed to start Tournament!');
  });
}

function getMatchData() {
    console.log();
    fetch(`https://127.0.0.1:443/tournament_api/detail`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + getCookie('jwt')
        }
        // },
        // body: JSON.stringify(id)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
       //console.log('Tournament    :', data);
      //  alert('Tournament details pulled successfully!');
      participants = data.participants;
      creator = data.creator;
      participants[0].username = creator.username;
      console.log(creator);
      console.log(participants);
        setTournamentId(data);
        startTournament(data.id);
        // arrangeNextRound(data.id);
    })
    .catch(error => {
        console.error('Failed to find tournament:', error);
    });
}

function waitGameFinish(interval = 100) {
  return new Promise(resolve => {
    const check = () => {
      if(gameOver) {
        console.log("game over")
        resolve();
      } else {
        setTimeout(check,interval);
      }
    };
    check();

  })
}

async function startGameLoop() {
  var p1,p2,win,remaining,match_id;
  console.log("hi");
  for(let i = 0; i<3;i++)
  {
    try {
      const data = await getNextMatch();
      console.log("hi");
      if (i == 0)
        startModal.hide();
      console.log(data);
      p1 = participants.find(element => Object.values(element).includes(data.next_match.participant_one));
      p2 = participants.find(element => Object.values(element).includes(data.next_match.participant_two));

      player1Alias = p1.username;
      player2Alias = p2.username;
      remaining = data.next_match.remaining_matches;
      match_id =  data.next_match.match_id;
      console.log(remaining);
      console.log(p1);
      console.log(p2);
      startGame();

      await waitGameFinish();
      win = participants.find(element => Object.values(element).includes(winner));
      console.log(win.id);
      await updateMatchResult(match_id,win.id);
      restartGameBtn = document.getElementById('restartGameBtn');
      // restartGameBtn.addEventListener('click', async function(event) {
      //   event.preventDefault();
        await waitSubmission(restartGameBtn);
        restartModal.toggle();
      // });
      } catch (error){
      console.error('Failed to get next match:', error);
      }
  }

    // var p1 = match.participant_one;
    // var p2 = match.participant_two;
    // var remaining = match.remaining_matches;
    // console.log(remaining);
    // console.log(p1);
    // console.log(p2);
    // startModal.hide();
    // startGame();
}
function waitSubmission(element) {
  return new Promise(resolve => {
    element.addEventListener('click', function onClick(event) {
      element.removeEventListener('click', onClick);
      resolve(event);
    });
  });
}
async function updateMatchResult(match_id,winner) {
  const matchData = {
    winner_id : winner
  };
  const response = await fetch(`https://127.0.0.1:443/tournament_api/update-match-result/${match_id}/`, {
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

async function getNextMatch() {
    const response = await fetch(`https://127.0.0.1:443/tournament_api/get-next-match/${getTournamentId()}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + getCookie('jwt')
        }
    })
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
}

function setupcreateTournamentForm() {
    const form = document.getElementById('participantDetailsFormInner');
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        createTournament();
    });
}

function setTournamentId(data) {
    localStorage.setItem('currentTournamentId', data.id);
}

function getTournamentId() {
    return localStorage.getItem('currentTournamentId');
}

export { setupTournamentPage };