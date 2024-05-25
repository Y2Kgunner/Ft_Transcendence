document.addEventListener('DOMContentLoaded', () => {
    const winningConditions = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];

    let boxIndexValues = new Array(9).fill("");
    let nextMove = 'X';
    let gameOver = false;
    let useMouse = true; // Start with mouse for player 'X'
    let currentFocusIndex = 0;

    const winnerMessageElement = document.querySelector('.winner');
    const nextMoveElement = document.querySelector('.turn');
    const boxes = document.querySelectorAll('.box');
    const playerNamesElement = document.querySelector('.player-names');

    const WinnerMessage = () => `Winner is: ${nextMove}`;
    const nextMoveMessage = () => `Next Move: ${nextMove} (use ${useMouse ? 'mouse' : 'keyboard'})`;

    // Handle confirm button click
    document.getElementById('confirmButton').addEventListener('click', () => {
        const player1Name = document.getElementById('player1Name').value;
        const player2Name = document.getElementById('player2Name').value;
        if (player1Name && player2Name) {
            document.getElementById('name-entry').style.display = 'none';
            document.getElementById('game-container').style.display = 'block';
            playerNamesElement.innerHTML = `${player1Name} vs ${player2Name}`;
            nextMoveElement.innerHTML = nextMoveMessage();
            updateFocus();
        }
    });

    boxes.forEach(box => {
        box.addEventListener('click', handleBoxClick);
    });

    document.addEventListener('keydown', handleKeyPress);

    function handleBoxClick(event) {
        if (!useMouse || gameOver) return;

        const target = event.target;
        const boxIndex = target.dataset.boxIndex;
        if (boxIndexValues[boxIndex] !== "") {
            return; // If the box is already filled, do nothing
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
                return;
            }
        }

        if (!boxIndexValues.includes("") && !gameOver) {
            winnerMessageElement.innerHTML = "Draw.";
        }
    }
});
