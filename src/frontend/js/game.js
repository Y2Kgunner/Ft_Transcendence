import { getCookie } from './profile.js';
const matchPoint = 1;
let intervalId = null;
let paused = false;
let pauseModalVisible = false;
let gameOver = false;
var startModal;
let pauseModalInstance;
let playerId;
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
let winner_match;
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
let matchId;
function setupGamePage() {
    board = document.getElementById("board");
    paddle1 = document.getElementById("paddle_1");
    paddle2 = document.getElementById("paddle_2");
    initialPaddlePos = paddle1.style.top;
    ball = document.getElementById("ball");
    score1Element = document.getElementById("player_1_score");
    score2Element = document.getElementById("player_2_score");

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
        console.log(player1Alias);
    });
    player2Alias = document.getElementById("player2alias");
    console.log(player2Alias);
    player2alias.addEventListener('input', checkInput);
    startGameBtn.addEventListener('click', async function (event) {
        await createMatch();
        startGame();
        await waitGameFinish();
        updateMatch();
    });
    restartGameBtn.addEventListener('click', async function (event) {
        await createMatch();
        startGame();
        await waitGameFinish();
        updateMatch();
    });
    
};

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

async function createMatch() {
    const matchData = {
        player_id: playerId,
        guest_player1: player2Alias
    };
    console.log(matchData)
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
async function updateMatch() {
    const matchData = {
        match_id : matchId,
        score_player : score1,
        score_guest_player1: score2,
        winner : winner_match
    };
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

function haltGame(winner) {
    winner_match = winner;
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
    //   player1Alias = document.getElementById("player1alias").value;
    player1AliasElement.textContent = player1Alias;
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

function hideOverflow() {
    const content = document.getElementsById('board');
    content.style.opacity = 1;
}

function checkInput() {
    var button = document.getElementById("startGameBtn");
    player2Alias = document.getElementById("player2alias").value;
    if (player2Alias.trim() === '') {
        button.disabled = true;
    } else if (player2Alias.length > 10 || player2Alias.length < 3) {
        player2AliasElement = document.getElementById("player_2_alias");
        button.disabled = false;
    } else if (!isPrintableASCII(player2Alias)) {
        player2AliasElement = document.getElementById("player_2_alias");
        button.disabled = false;
    } else if (player1Alias === player2Alias) {
        player2AliasElement = document.getElementById("player_2_alias");
        button.disabled = false;
    } else {
        player2AliasElement = document.getElementById("player_2_alias");
        button.disabled = false;
    }
}


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

export { setupGamePage };