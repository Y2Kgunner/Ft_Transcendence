let gameState = 'start';
let paddle_1, paddle_2, board, initial_ball, ball, score_1, score_2, message;
let paddle_1_coord, paddle_2_coord, initial_ball_coord, ball_coord, board_coord, paddle_common;
let game_mode;

let direction;
let initial_velocity = 5;
let velocity_increase = 0;
let paddle_translate = 120;
let score = '2';
let alias1, alias2, winner;

async function goToGame(gamemode) {
	if (gamemode == "tournament") {
		let round = localStorage.getItem('round');
		let players = JSON.parse(localStorage.getItem('r' + round + 'players'));
		alias1 = players['player1'];
		alias2 = players['player2'];
	} else {

		alias2 = document.getElementById('player2alias').value;
		const notiAlert = document.getElementById('select-alert-container');
		if (alias2.trim() === '') {
			createAlert(notiAlert, 'Please enter a value for Player 2 Alias!', 'alert-danger');
			return;
		}
		if (alias2.length > 10 || alias2.length < 3) {
			createAlert(notiAlert, 'Alias is between 3 and 10 characters!', 'alert-danger');
			return;
		}
		if (!isPrintableASCII(alias2)) {
			createAlert(notiAlert, 'Alias cannot contain spaces!', 'alert-danger');
			return;
		}

		alias1 = document.getElementById('player2alias').getAttribute('data-user');
		if (alias1 === alias2){
			createAlert(notiAlert, 'Alias cannot be the same as the user!', 'alert-danger');
			return;
		}
	}

	await showSection('game');

	document.getElementById('player_2_alias').innerHTML = alias2;
	document.getElementById('player_1_alias').innerHTML = alias1;
}

function isPrintableASCII(str) {
    var printableASCIIRegex = /^[!-~]+$/;
    return printableASCIIRegex.test(str);
}

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

function getRandomInt(min, max) {
	return Math.random() * (max - min) + min;
  }

function startgame(gamemode) {
	game_mode = gamemode;
	document.getElementById('startgame').disabled = true;
	document.getElementById('grow').style.display = 'none';
    paddle_1 = document.getElementById('paddle_1');
    paddle_2 = document.getElementById('paddle_2');
    initial_ball = document.getElementById('ball');
    ball = document.getElementById('ball');
    score_1 = document.getElementById('player_1_score');
    score_2 = document.getElementById('player_2_score');
    message = document.getElementById('game_message');
    paddle_common = document.querySelector('.paddle').getBoundingClientRect();

    document.addEventListener('keydown', movePaddle);
	startballmovement();
}

function startballmovement() {
	gameState = 'play';
	requestAnimationFrame(() => {
		ball.style = initial_ball.style;
		var x = 0;
		var y = 0;
		velocity = initial_velocity;
		while (Math.abs(x) <= 0.5 || Math.abs(x) >= 0.8)
		{
			direction = getRandomInt(0, 2 * Math.PI);
			x =  Math.cos(direction);
			y = Math.sin(direction);
		}
		initializeCoordinates();
		moveBall(x, y);
	});
}

function initializeCoordinates() {
    paddle_1_coord = paddle_1.getBoundingClientRect();
    paddle_2_coord = paddle_2.getBoundingClientRect();
    initial_ball_coord = ball.getBoundingClientRect();
    ball_coord = initial_ball_coord;
    board_coord = document.getElementById('board').getBoundingClientRect();
}

function calculateBallMove(x, y) {
	const translateX = x * velocity;
	const translateY = y * velocity;

    const existingTransform = ball.style.transform;

    const existingTranslate = existingTransform.match(/translate\((.*?)\)/);
    const existingTranslateX = existingTranslate ? parseFloat(existingTranslate[1].split(',')[0]) : 0;
    const existingTranslateY = existingTranslate ? parseFloat(existingTranslate[1].split(',')[1]) : 0;

    const newTranslateX = existingTranslateX + translateX;
    const newTranslateY = existingTranslateY + translateY;

    ball.style.transform = `translate(${newTranslateX}px, ${newTranslateY}px)`;

	ball_coord = ball.getBoundingClientRect();
	requestAnimationFrame(() => {
		moveBall(x, y);
	});
}

function moveBall(x, y) {
	if (ball_coord.top <= board_coord.top || ball_coord.bottom >= board_coord.bottom)
		y *= -1;
	if (isCollision(paddle_1_coord, ball_coord)) {
		x = 1;
		velocity += velocity_increase;
	} else if (isCollision(paddle_2_coord, ball_coord)) {
		x = -1;
		velocity += velocity_increase;
	}
	if (ball_coord.left <= board_coord.left || ball_coord.right >= board_coord.right) { //went outside
		if (ball_coord.left <= board_coord.left)
			score_2.innerHTML = +score_2.innerHTML + 1;
		else
			score_1.innerHTML = +score_1.innerHTML + 1;
		ball_coord = initial_ball_coord;
		ball.style.display = 'none';
		if (score_2.innerHTML === score || score_1.innerHTML === score)
		{
			document.removeEventListener('keydown', movePaddle);
			if (score_1.innerHTML === '2')
			{
				text = 'Game Over!<br>' + alias1 + ' Wins';
				message.innerHTML = text;
			}
			else {
				text = 'Game Over!<br>' + alias2 + ' Wins';
				message.innerHTML = text;
			}
			document.removeEventListener('keydown', movePaddle);
			if (score_1.innerHTML === score)
				winner = alias1;
			else
				winner = alias2;
			text = 'Game Over!<br>' + winner + ' Wins';
			message.innerHTML = text;
			if (game_mode === 'tournament')
			{
				document.getElementById('restart').onclick = function() { getTournament(winner) };
				newtext = document.getElementById('restart').getAttribute('data-tournament');
				document.getElementById('restart').innerHTML = newtext;
			} else {
				newtext = document.getElementById('restart').getAttribute('data-playagain');
				document.getElementById('restart').innerHTML = newtext;
			}
			document.getElementById('restart').classList.remove('d-none');
			gameState = 'start';
			if (game_mode === 'game')
				addMatch();
		} else {
			sleep(2000).then(() => {
				startballmovement();
			});
		}
		return;
	}

	calculateBallMove(x, y);
}

function isCollision (paddle, thisball)
{
	return (
		paddle.left <= thisball.right &&
		paddle.right >= thisball.left &&
		paddle.top <= thisball.bottom &&
		paddle.bottom >= thisball.top
	)
}

function movePaddle(e)
{
	if (gameState === 'play') {
	requestAnimationFrame(() => {
		if (e.key == 'w') {
			const newTop1 = Math.max(0, paddle_1.offsetTop - paddle_translate);
			paddle_1.style.top = `${newTop1}px`;
			paddle_1_coord = paddle_1.getBoundingClientRect();
		} else if (e.key == 's') {
			const newTop1 = Math.min(board_coord.height - paddle_1_coord.height - 2, paddle_1.offsetTop + paddle_translate);
			paddle_1.style.top = `${newTop1}px`;
			paddle_1_coord = paddle_1.getBoundingClientRect();
		} else if (e.key == 'o') {
			const newTop2 = Math.max(0, paddle_2.offsetTop - paddle_translate);
			paddle_2.style.top = `${newTop2}px`;
			paddle_2_coord = paddle_2.getBoundingClientRect();
		} else if (e.key == 'l') {
			const newTop2 = Math.min(board_coord.height - paddle_2_coord.height - 2, paddle_2.offsetTop + paddle_translate);
			paddle_2.style.top = `${newTop2}px`;
			paddle_2_coord = paddle_2.getBoundingClientRect();
		}
	});
	}
}
