import { appRouter } from './router.js';
import { fetchUserProfile } from './pong2.js';
import { createTournament, startTournament, getTournamentDetails, getFirstRound, getSecondRound, updateMatchResult, getNextMatch } from './tournamentApi.js';
import { inputElement, eventManager, checkInput } from './inputValidation.js';


const matchPoint = 1;
let intervalId = null;
let paused = false;
let pauseModalVisible = false;
let gameOver = false;
let winner;
let winnerMsg;
let win;
let participants;
let creator;
let matchDetail;
let round;
let restartGameButton;
let pauseModalInstance;
let startModal;
var restartModal;
var finishTournamentModal;
var matchModal;
let roundDetails;
let roundMsg, matchMsg;
let roundMatchPreview = [];
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
let matchNumber;
let p1, p2;
let paddle1;
let paddle2;
let ball;
let board;
let score1Element;
let score2Element;
let player1AliasElement;
let player2AliasElement;
let roundComplete = true;
let tournamentNameElement;
let begin = false;
let paddle1MovingUp = false;
let paddle1MovingDown = false;
let paddle2MovingUp = false;
let paddle2MovingDown = false;
let numParticipants;
var detailsModal;

let gameInProgressTour = false;

export function startGameSession() {
    gameInProgressTour = true;
    window.addEventListener('beforeunload', handleBeforeUnload);
}

export function endGameSession() {
    gameInProgressTour = false;
    window.removeEventListener('beforeunload', handleBeforeUnload);
}
function handleBeforeUnload(event) {
    if (gameInProgressTour) {
        const message = "You have an ongoing game. Are you sure you want to leave and lose your progress?";
        event.returnValue = message;
        return message;
    }
}

function setupTournamentPage() {
    // Get elements
    roundMatchPreview = [];
    board = document.getElementById("board");
    paddle1 = document.getElementById("paddle_1");
    paddle2 = document.getElementById("paddle_2");
    initialPaddlePos = paddle1.style.top;
    ball = document.getElementById("ball");
    score1Element = document.getElementById("player_1_score");
    score2Element = document.getElementById("player_2_score");
    player1AliasElement = document.getElementById("player_1_alias");
    player2AliasElement = document.getElementById("player_2_alias");


    ballX = board.offsetWidth / 2 - ball.offsetWidth / 2;
    ballY = board.offsetHeight / 2 - ball.offsetHeight / 2;

    score1Element.textContent = score1;
    score2Element.textContent = score2;

    detailsModal = new bootstrap.Modal(document.getElementById('enterTournamentDetails'));
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
    // tournamentName.addEventListener('input', checkInput);
    
    startModal = new bootstrap.Modal(document.getElementById('startGameModal'));
    matchModal = new bootstrap.Modal(document.getElementById('gameDetailsModal'));
    continueBtn.addEventListener('click', validateInputTournamentName(input));
    // colorPickRed.addEventListener('change', changeColor("red"));
    // colorPickBlue.addEventListener('change', changeColor("blue"));
    // document.getElementById('colorPickRed').addEventListener('change', function () {
    //     document.getElementById('gradientHousing').classList.remove('blue');
    //     document.getElementById('gradientHousing').classList.add('red');
    //     document.getElementById('pongHousing').classList.remove('blue');
    //     document.getElementById('pongHousing').classList.add('red');
    // });
    // document.getElementById('colorPickBlue').addEventListener('change', function () {
    //     document.getElementById('gradientHousing').classList.remove('red');
    //     document.getElementById('gradientHousing').classList.add('blue');
    //     document.getElementById('pongHousing').classList.remove('red');
    //     document.getElementById('pongHousing').classList.add('blue');
    // });
    // document.getElementById('colorPickGreen').addEventListener('change', function () {
    //     document.getElementById('gradientHousing').classList.remove('red', 'blue');
    //     document.getElementById('pongHousing').classList.remove('red', 'blue');
    // });
    // continueBtn.addEventListener('submit', validateInput(numParticipants));
    // setupcreateTournamentForm();
};

function handleNewTournamentFormSubmit(input) {

    numParticipants = parseInt(input.value, 10);
    generateParticipantFields(numParticipants);
    detailsModal.hide()
    startModal.show();
}

async function validateInputTournamentName(input) {
 const _elementBlock = [
   new inputElement('tournamentName', 'userName', true, 3, 10)
 ];
    if (!checkInput(_elementBlock))
    {
        // detailsModal.hide()
        return;
    }
}

// async function validateInput(num) {
//     const _elementBlock = [];

//     // Use a for loop to create and insert elements into the array
//     for (var i = 0; i < num; i++) {
//         _elementBlock.push(new inputElement(document.getElementById(`input${i}`), 'userName', true, 3, 10));
//     }

//     if (!checkInput(_elementBlock))
    
//         return;
// }

function generateParticipantFields(num) {
    const form = document.getElementById('participantDetailsFormInner');
    form.innerHTML = '';
    fetchUserProfile().then(data => {
        const formGroupUser = document.createElement('div');
        formGroupUser.classList.add('input-group');
        formGroupUser.classList.add('has-validation');
        const labelUser = document.createElement('label');
        labelUser.textContent = `Participant 1 Name:`;
        formGroupUser.appendChild(labelUser);

        const inputUser = document.createElement('input');
        inputUser.type = 'text';
        inputUser.classList.add('form-control');
        inputUser.value = data.username;
        inputUser.readOnly = true;
        inputUser.id = `input0`;
        formGroupUser.appendChild(inputUser);

        form.appendChild(formGroupUser);

        // <p class="gradientText h5">player2's nickname:</p>
        // <div class="input-group has-validation justify-content-center">
        //   <input type="text" id="player2alias" class="form-control rounded" placeholder=" player 2 nickname" required>
        //   <div class="invalid-feedback">Looks stinky! 🚽</div>
        //   <div class="valid-feedback">Looks good! 🗿</div>
        const invalidFeedback = document.createElement('div');
        invalidFeedback.className = 'invalid-feedback';
        invalidFeedback.textContent = 'Looks stinky! 🚽';

        const validFeedback = document.createElement('div');
        validFeedback.className = 'valid-feedback';
        validFeedback.textContent = 'Looks good! 🗿';

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
            input.id = `input${i}`;
            formGroup.appendChild(input);
            formGroup.appendChild(invalidFeedback);
            formGroup.appendChild(validFeedback);
            form.appendChild(formGroup);
        }

        const submitButton = document.createElement('button');
        submitButton.type = 'submit';
        submitButton.classList.add('btn', 'btn-primary', 'mt-3');
        submitButton.textContent = 'Submit Tournament';
        form.appendChild(submitButton);
    });

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
    endGameSession();
    winnerMsg = document.getElementById('GameWinner');
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

function startGame() {

    pauseModalInstance = new bootstrap.Modal(document.getElementById('pauseGameModal'));
    restartModal = new bootstrap.Modal(document.getElementById('restartGame'));
    begin = true;
    gameOver = false;
    startGameSession();
    tournamentName = document.getElementById("tournamentName").value;
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

// function checkInput() {
//     var button = document.getElementById("continueBtn");
//     tournamentName = document.getElementById("tournamentName").value;
//     if (tournamentName.trim() === '') {
//         button.disabled = true;
//     } else if (tournamentName.length > 10 || tournamentName.length < 3) {
//         tournamentNameElement = document.getElementById("tournamentName");
//         button.disabled = false;
//         // createAlert(notiAlert, 'Alias is between 3 and 10 characters!', 'alert-danger');
//     } else if (!isPrintableASCII(tournamentName)) {
//         tournamentNameElement = document.getElementById("tournamentName");
//         button.disabled = false;
//         // createAlert(notiAlert, 'Alias cannot contain spaces!', 'alert-danger');
//     } else {
//         tournamentNameElement = document.getElementById("tournamentName");
//         button.disabled = false;
//     }
//     // return ;
//     // else if (player1Alias === tournamentName) {
//     //     tournamentNameElement = document.getElementById("player_2_alias");
//     //     button.disabled = false;
//     //     // createAlert(notiAlert, 'Alias cannot be the same as the user!', 'alert-danger');
//     //   }
// };


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


function waitGameFinish(interval = 100) {
    return new Promise(resolve => {
        const check = () => {
            if (gameOver) {
                resolve();
            } else {
                setTimeout(check, interval);
            }
        };
        check();

    })
}

async function getRoundDetails(round) {
    if (round == 1) {
        roundDetails = await getFirstRound();
        matchDetail = roundDetails.match_details;
    }
    else if (round == 2) {
        roundDetails = await getSecondRound();
        matchDetail = roundDetails.second_round_matches;
    }
    console.log(roundDetails);
}

function showRoundPreview(round, match, roundMsg = "") {
    if (roundMsg == "")
        roundMsg = "Round : " + round + "\n";
    for (let j = 0; j < matchDetail.length; j++) {
        let pl1 = participants.find(element => Object.values(element).includes(matchDetail[j].participant_one_id));
        let pl2;
        if (!matchDetail[j].is_bye)
            pl2 = participants.find(element => Object.values(element).includes(matchDetail[j].participant_two_id));
        if (matchDetail[j].is_bye && match == 0) {
            roundMatchPreview.push(pl1.username + " ADVANCES");
        }
        else if (!matchDetail[j].is_bye && match == 0) {
            roundMatchPreview.push(pl1.username + " vs " + pl2.username);
        }
        else {
            if (win && !matchDetail[j].is_bye && j < match) {
                console.log("winner!")
                if (win.username == pl1.username)
                    roundMatchPreview[j] = '<span id="winnerColour">' + pl1.username + "</span>" + " vs " + '<span id="loserColour" class ="text-decoration-line-through">' + pl2.username + "</span>";
                else if (win.username == pl2.username)
                    roundMatchPreview[j] = '<span id="loserColour" class ="text-decoration-line-through">' + pl1.username + "</span>" + " vs " + '<span id="winnerColour">' + pl2.username + "</span>";

            }
            else if (win && matchDetail[j].is_bye && j < match)
                roundMatchPreview[j] = '<span id="winnerColour">' + pl1.username + " ADVANCES" + "</span>";
            else
                roundMatchPreview[j] = matchDetail[j].is_bye ? pl1.username + " ADVANCES" : pl1.username + " vs " + pl2.username;
        }
        if (matchDetail[j].is_bye && match == j) {
            roundMatchPreview[j] = roundMatchPreview[j];
            match++;
            continue;
        }
        if (match == j && !matchDetail[j].is_bye)
            roundMatchPreview[j] = `>> ${roundMatchPreview[j]} <<`;
        else
            roundMatchPreview[j] = roundMatchPreview[j];
    }
    roundMsg = roundMsg + roundMatchPreview.join("\n")
    document.getElementById("gameDetail").innerHTML = roundMsg.replace(/\n/g, "<br>");

}
async function startGameLoop() {
    var p1, p2, remaining = 0, match_id, totalRounds, is_bye = false, matchesInRound;
    startModal.hide();
    if (participants.length > 4) {
        totalRounds = 3;
    }
    else
        totalRounds = 2;
    for (let i = 1; i <= totalRounds; i++) {
        try {
            await getRoundDetails(i);
            console.log("currentround:" + i + " totalrounds:" + totalRounds);

            matchesInRound = matchDetail.filter(match => match.is_bye == false).length;
            for (let j = 0; j < matchesInRound; j++) {
                const data = await getNextMatch();
                p1 = participants.find(element => Object.values(element).includes(data.next_match.participant_one));
                p2 = participants.find(element => Object.values(element).includes(data.next_match.participant_two));
                if (i != totalRounds) {
                    showRoundPreview(i, j);
                    matchModal.show();
                    await waitSubmission(startNextGameBtn);
                }
                else if (i == totalRounds) {
                    roundMsg = "Round : " + i + "\n";
                    matchMsg = ">> " + p1.username + " vs " + p2.username + " <<\n";
                    roundMsg += matchMsg;
                    document.getElementById("gameDetail").innerHTML = roundMsg.replace(/\n/g, "<br>");
                    j = matchesInRound;
                    matchModal.show();
                    await waitSubmission(startNextGameBtn);
                }
                console.log("currentmatch:" + j + " totalmatches:" + matchesInRound);
                player1Alias = p1.username;
                player2Alias = p2.username;
                remaining = data.next_match.remaining_matches;
                match_id = data.next_match.match_id;

                startGame();

                await waitGameFinish();
                win = participants.find(element => Object.values(element).includes(winner));
                await updateMatchResult(match_id, win.id);
                restartGameButton = document.getElementById("restartGameBtn");
                await waitSubmission(restartGameButton);

            }
        } catch (error) {
            console.error('Failed to get next match:', error);
        }
        if (i != totalRounds) {
            console.log("rooound end modal")
            matchModal.show();
            showRoundPreview(i, matchDetail.length, "Round " + i + " Finished!\n\n");
            await waitSubmission(startNextGameBtn);
        }
        roundMatchPreview = [];
    }

    var elem = document.getElementById('finishTournament');
    finishTournamentModal = new bootstrap.Modal(document.getElementById('finishTournament'));
    winnerMsg = document.getElementById('tournamentWinner');
    winnerMsg.textContent = win.username + " wins Tournament!";
    finishTournamentModal.toggle();
    var restartTournament = document.getElementById("restartTournament");
    restartTournament.addEventListener('click', function () {
        finishTournamentModal.hide();
        restartModal.hide();
        appRouter.navigate('/tournament', { force: true });
    });
}
function waitSubmission(element) {
    return new Promise(resolve => {
        element.addEventListener('click', function onClick(event) {
            element.removeEventListener('click', onClick);
            resolve(event);
        });
    });
}

function setupcreateTournamentForm() {
    const form = document.getElementById('participantDetailsFormInner');
    form.addEventListener('submit', async function (event) {
        event.preventDefault();
        await createTournament();
        const details = await getTournamentDetails();
        participants = details.participants;
        creator = details.creator;
        participants[0].username = creator.username;
        await startTournament();
        startGameLoop();
    });
}

function setTournamentId(data) {
    localStorage.setItem('currentTournamentId', data.id);
}

function getTournamentId() {
    return localStorage.getItem('currentTournamentId');
}

export { setupTournamentPage, gameInProgressTour, setTournamentId, getTournamentId };
