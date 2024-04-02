let m_gameState = 'start';
let m_paddle_1, m_paddle_2, m_paddle_3, m_board, m_initial_ball, m_ball, m_score_1, m_score_2, m_score_3, m_message;
let m_paddle_1_coord, m_paddle_2_coord, m_paddle_3_coord, m_initial_ball_coord, m_ball_coord, m_board_coord, m_paddle_common;
let m_game_mode;

let m_direction;
let m_initial_velocity = 5;
// let m_velocity_increase = 0.5;
let m_paddle_translate = 120;
let m_score = '-5';
let m_alias1, m_alias2, m_alias3, m_winner;

async function m_goToGame(gamemode) {
	m_alias1 = document.getElementById('multiplayer1').value;
	m_alias2 = document.getElementById('multiplayer2').value;
	m_alias3 = document.getElementById('multiplayer3').value;
	const notiAlert = document.getElementById('select-alert-container');
	if (m_alias1.trim() === '' || m_alias2.trim() === '' || m_alias3.trim() === '') {
		createAlert(notiAlert, 'Alias cannot be empty!', 'alert-danger');
		return;
	}
	if (m_alias2.length > 10 || m_alias2.length < 3 || m_alias3.length > 10 || m_alias3.length < 3 || m_alias1.length > 10 || m_alias1.length < 3) {
		createAlert(notiAlert, 'Alias is between 3 and 10 characters!', 'alert-danger');
		return;
	}
	if (!m_isPrintableASCII(m_alias2) || !m_isPrintableASCII(m_alias3) || !m_isPrintableASCII(m_alias3)) {
		createAlert(notiAlert, 'Alias cannot contain spaces!', 'alert-danger');
		return;
	}
	if (m_alias1 === m_alias2 || m_alias1 === m_alias3 || m_alias2 === m_alias3) {
        createAlert(notiAlert, 'Aliases should be unique!', 'alert-danger');
        return;
    }
	await showSection('gameMulti');

	document.getElementById('player_3_alias').innerHTML = m_alias3;
	document.getElementById('player_2_alias').innerHTML = m_alias2;
	document.getElementById('player_1_alias').innerHTML = m_alias1;
}

function m_isPrintableASCII(str) {
    var printableASCIIRegex = /^[!-~]+$/;
    return printableASCIIRegex.test(str);
}

function m_sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

function m_getRandomInt(min, max) {
	return Math.random() * (max - min) + min;
  }

function m_startgame(gamemode) {
	m_game_mode = gamemode;
	document.getElementById('startgame').disabled = true;
	document.getElementById('grow').style.display = 'none';
    m_paddle_1 = document.getElementById('paddle_1');
    m_paddle_2 = document.getElementById('paddle_2');
    m_paddle_3 = document.getElementById('paddle_3');
    m_initial_ball = document.getElementById('ball');
    m_ball = document.getElementById('ball');
    m_score_1 = document.getElementById('player_1_score');
    m_score_2 = document.getElementById('player_2_score');
    m_score_3 = document.getElementById('player_3_score');
    m_message = document.getElementById('game_message');
    m_paddle_common = document.querySelector('.paddle').getBoundingClientRect();

    document.addEventListener('keydown', m_movePaddle);
	m_startballmovement();
}

function m_startballmovement() {
	m_gameState = 'play';
	requestAnimationFrame(() => {
		m_ball.style = m_initial_ball.style;
		var x = 0;
		var y = 0;
		velocity = m_initial_velocity;
		while (Math.abs(x) <= 0.5 || Math.abs(x) >= 0.8)
		{
			m_direction = m_getRandomInt(0, 2 * Math.PI);
			x =  Math.cos(m_direction);
			y = Math.sin(m_direction);
		}
		m_initializeCoordinates();
		m_moveBall(x, y);
	});
}

function m_initializeCoordinates() {
    m_paddle_1_coord = m_paddle_1.getBoundingClientRect();
    m_paddle_2_coord = m_paddle_2.getBoundingClientRect();
    m_paddle_3_coord = m_paddle_3.getBoundingClientRect();
    m_initial_ball_coord = m_ball.getBoundingClientRect();
    m_ball_coord = m_initial_ball_coord;
    m_board_coord = document.getElementById('board').getBoundingClientRect();
}

function m_calculateBallMove(x, y) {
	const translateX = x * velocity;
	const translateY = y * velocity;

    const existingTransform = m_ball.style.transform;

    const existingTranslate = existingTransform.match(/translate\((.*?)\)/);
    const existingTranslateX = existingTranslate ? parseFloat(existingTranslate[1].split(',')[0]) : 0;
    const existingTranslateY = existingTranslate ? parseFloat(existingTranslate[1].split(',')[1]) : 0;

    const newTranslateX = existingTranslateX + translateX;
    const newTranslateY = existingTranslateY + translateY;

    m_ball.style.transform = `translate(${newTranslateX}px, ${newTranslateY}px)`;

	m_ball_coord = m_ball.getBoundingClientRect();
	requestAnimationFrame(() => {
		m_moveBall(x, y);
	});
}

function m_moveBall(x, y) {
	if (m_ball_coord.top <= m_board_coord.top)
		y *= -1;
	if (m_isCollision(m_paddle_1_coord, m_ball_coord)) {
		x = 1;
	} else if (m_isCollision(m_paddle_2_coord, m_ball_coord)) {
		x = -1;
	} else if (m_isCollision(m_paddle_3_coord, m_ball_coord)) {
		y*= -1;
	}
	if (m_ball_coord.left <= m_board_coord.left || m_ball_coord.right >= m_board_coord.right || m_ball_coord.bottom >= m_board_coord.bottom) { //went outside
		if (m_ball_coord.left <= m_board_coord.left) {
			m_score_1.innerHTML = +m_score_1.innerHTML - 1;
		}
		else if (m_ball_coord.right >= m_board_coord.right) {
			m_score_2.innerHTML = +m_score_2.innerHTML - 1;
		}
		else if (m_ball_coord.bottom >= m_board_coord.bottom) {
			m_score_3.innerHTML = +m_score_3.innerHTML - 1;
		}
		m_ball_coord = m_initial_ball_coord;
		m_ball.style.display = 'none';
		if (m_score_2.innerHTML === m_score || m_score_1.innerHTML === m_score || m_score_3.innerHTML === m_score)
		{
			document.removeEventListener('keydown', m_movePaddle);
			if ((m_score_2.innerHTML === '-5' || m_score_3.innerHTML === '-5') && m_score_1.innerHTML > m_score_2.innerHTML 
				&& m_score_1.innerHTML > m_score_3.innerHTML)
			{
				text = 'Game Over!<br>' + m_alias1 + ' Wins';
				m_message.innerHTML = text;
			}
			else if ((m_score_1.innerHTML === '-5' || m_score_3.innerHTML === '-5') && m_score_2.innerHTML > m_score_1.innerHTML 
					&& m_score_2.innerHTML > m_score_3.innerHTML) {
				text = 'Game Over!<br>' + m_alias2 + ' Wins';
				m_message.innerHTML = text;
			}
			else {
				text = 'Game Over!<br>' + m_alias3 + ' Wins';
				m_message.innerHTML = text;
			}
			document.getElementById('restart').classList.remove('d-none');
			m_gameState = 'start';
		} else {
			m_sleep(2000).then(() => {
				m_startballmovement();
			});
		}
		return;
	}

	m_calculateBallMove(x, y);
}

function m_isCollision (paddle, thisball)
{
	return (
		paddle.left <= thisball.right &&
		paddle.right >= thisball.left &&
		paddle.top <= thisball.bottom &&
		paddle.bottom >= thisball.top
	)
}

function m_movePaddle(e)
{
	if (m_gameState === 'play') {
	requestAnimationFrame(() => {
		if (e.key == 'q') {
			const m_newTop1 = Math.max(0, m_paddle_1.offsetTop - m_paddle_translate);
			m_paddle_1.style.top = `${m_newTop1}px`;
			m_paddle_1_coord = m_paddle_1.getBoundingClientRect();
		} 
		else if (e.key == 'a') {
			const m_newTop1 = Math.min(m_board_coord.height - m_paddle_1_coord.height - 2, m_paddle_1.offsetTop + m_paddle_translate);
			m_paddle_1.style.top = `${m_newTop1}px`;
			m_paddle_1_coord = m_paddle_1.getBoundingClientRect();
		} 
		else if (e.key == 'o') {
			const m_newTop2 = Math.max(0, m_paddle_2.offsetTop - m_paddle_translate);
			m_paddle_2.style.top = `${m_newTop2}px`;
			m_paddle_2_coord = m_paddle_2.getBoundingClientRect();
		} 
		else if (e.key == 'l') {
			const m_newTop2 = Math.min(m_board_coord.height - m_paddle_2_coord.height - 2, m_paddle_2.offsetTop + m_paddle_translate);
			m_paddle_2.style.top = `${m_newTop2}px`;
			m_paddle_2_coord = m_paddle_2.getBoundingClientRect();
		} 
		else if (e.key == 'v') {
			const m_newLeft = Math.max(0, m_paddle_3.offsetLeft - m_paddle_translate);
			m_paddle_3.style.left = `${m_newLeft}px`;
			m_paddle_3_coord = m_paddle_3.getBoundingClientRect();
		} 
		else if (e.key == 'b') {
			const m_newLeft = Math.min(m_board_coord.width - m_paddle_3_coord.width - 2, m_paddle_3.offsetLeft + m_paddle_translate);
			m_paddle_3.style.left = `${m_newLeft}px`;
			m_paddle_3_coord = m_paddle_3.getBoundingClientRect();
		}
	});
	}
}

// function m_getDate() {
// 	const date = new Date();
// 	const day = date.m_getDate();
// 	const month = date.getMonth() + 1;
// 	const year = date.getFullYear();
// 	const fullDate = `${year}-${month}-${day}`;
// 	return(fullDate);
// }
