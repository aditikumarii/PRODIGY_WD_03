const cells = document.querySelectorAll(".cell");

const modeButtons = document.querySelectorAll(".mode");

const levelButtons = document.querySelectorAll(".level");

const difficulty = document.getElementById("difficulty");

const turnText = document.getElementById("turnText");

const message = document.getElementById("message");

const newGame = document.getElementById("newGame");

const resetScore = document.getElementById("resetScore");

const scoreXElement = document.getElementById("scoreX");

const scoreOElement = document.getElementById("scoreO");

const playerOLabel = document.getElementById("playerOLabel");

const resultPanel = document.getElementById("resultPanel");

const resultIcon = document.getElementById("resultIcon");

const resultText = document.getElementById("resultText");


let board = Array(9).fill("");

let currentPlayer = "X";

let gameMode = "ai";

let aiLevel = "easy";

let gameFinished = false;

let aiThinking = false;

let scoreX = 0;

let scoreO = 0;


const winningLines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],

    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],

    [0, 4, 8],
    [2, 4, 6]
];


function updateTurn() {

    if (gameFinished) {
        return;
    }

    turnText.textContent = currentPlayer;

    if (
        gameMode === "ai" &&
        currentPlayer === "O"
    ) {
        message.textContent = "AI is thinking...";
    } else {
        message.textContent =
            `Player ${currentPlayer}, your move`;
    }
}


function getResult() {

    for (const line of winningLines) {

        const [a, b, c] = line;

        if (
            board[a] &&
            board[a] === board[b] &&
            board[a] === board[c]
        ) {

            return {
                winner: board[a],
                line: line
            };
        }
    }

    if (!board.includes("")) {
        return {
            winner: "draw",
            line: []
        };
    }

    return null;
}


function placeMark(index, player) {

    if (board[index] !== "") {
        return;
    }

    board[index] = player;

    cells[index].textContent = player;

    cells[index].classList.add(
        "filled",
        player.toLowerCase()
    );
}


function cellClicked(event) {

    if (gameFinished || aiThinking) {
        return;
    }

    if (
        gameMode === "ai" &&
        currentPlayer === "O"
    ) {
        return;
    }

    const index =
        Number(event.currentTarget.dataset.index);

    if (board[index] !== "") {
        return;
    }

    placeMark(
        index,
        currentPlayer
    );

    const result = getResult();

    if (result) {
        finishGame(result);
        return;
    }

    currentPlayer =
        currentPlayer === "X"
            ? "O"
            : "X";

    updateTurn();

    if (
        gameMode === "ai" &&
        currentPlayer === "O"
    ) {

        aiThinking = true;

        setTimeout(() => {

            aiMove();

            aiThinking = false;

        }, 450);
    }
}


function finishGame(result) {

    gameFinished = true;

    if (result.winner === "draw") {

        turnText.textContent = "—";

        message.textContent =
            "It's a draw. Try again!";

        resultIcon.textContent = "≡";

        resultText.textContent =
            "Round ended in a draw";

        return;
    }


    result.line.forEach(index => {

        cells[index].classList.add("winner");

    });


    if (result.winner === "X") {

        scoreX++;

        scoreXElement.textContent = scoreX;

        turnText.textContent = "X";

        message.textContent =
            "🎉 Player X wins!";

        resultIcon.textContent = "🏆";

        resultText.textContent =
            "Player X won the round";

    } else {

        scoreO++;

        scoreOElement.textContent = scoreO;

        turnText.textContent = "O";

        if (gameMode === "ai") {

            message.textContent =
                "🤖 AI wins this round!";

            resultText.textContent =
                "AI won the round";

        } else {

            message.textContent =
                "🎉 Player O wins!";

            resultText.textContent =
                "Player O won the round";
        }

        resultIcon.textContent = "🏆";
    }
}


function resetBoard() {

    board = Array(9).fill("");

    currentPlayer = "X";

    gameFinished = false;

    aiThinking = false;

    cells.forEach(cell => {

        cell.textContent = "";

        cell.className = "cell";

    });

    resultIcon.textContent = "✦";

    resultText.textContent = "Ready to play";

    updateTurn();
}


function resetAll() {

    scoreX = 0;

    scoreO = 0;

    scoreXElement.textContent = "0";

    scoreOElement.textContent = "0";

    resetBoard();
}


function emptyCells() {

    return board
        .map((value, index) =>
            value === ""
                ? index
                : -1
        )
        .filter(index => index !== -1);
}


function randomMove() {

    const available = emptyCells();

    if (!available.length) {
        return null;
    }

    return available[
        Math.floor(
            Math.random() * available.length
        )
    ];
}


function winningMove(player) {

    for (const index of emptyCells()) {

        board[index] = player;

        const result = getResult();

        board[index] = "";

        if (
            result &&
            result.winner === player
        ) {
            return index;
        }
    }

    return null;
}


function mediumMove() {

    const win = winningMove("O");

    if (win !== null) {
        return win;
    }

    const block = winningMove("X");

    if (block !== null) {
        return block;
    }

    if (board[4] === "") {
        return 4;
    }

    const corners =
        [0, 2, 6, 8]
            .filter(index =>
                board[index] === ""
            );

    if (corners.length) {

        return corners[
            Math.floor(
                Math.random() *
                corners.length
            )
        ];
    }

    return randomMove();
}


function hardMove() {

    let bestScore = -Infinity;

    let bestMove = null;

    for (const index of emptyCells()) {

        board[index] = "O";

        const score =
            minimax(board, false);

        board[index] = "";

        if (score > bestScore) {

            bestScore = score;

            bestMove = index;
        }
    }

    return bestMove;
}


function minimax(state, maximizing) {

    const result = getResult();

    if (result) {

        if (result.winner === "O") {
            return 10;
        }

        if (result.winner === "X") {
            return -10;
        }

        return 0;
    }


    if (maximizing) {

        let best = -Infinity;

        for (let i = 0; i < 9; i++) {

            if (state[i] === "") {

                state[i] = "O";

                best = Math.max(
                    best,
                    minimax(state, false)
                );

                state[i] = "";
            }
        }

        return best;

    } else {

        let best = Infinity;

        for (let i = 0; i < 9; i++) {

            if (state[i] === "") {

                state[i] = "X";

                best = Math.min(
                    best,
                    minimax(state, true)
                );

                state[i] = "";
            }
        }

        return best;
    }
}


function aiMove() {

    if (gameFinished) {
        return;
    }

    let move;

    if (aiLevel === "easy") {

        move = randomMove();

    } else if (aiLevel === "medium") {

        move = mediumMove();

    } else {

        move = hardMove();
    }

    if (move === null) {
        return;
    }

    placeMark(move, "O");

    const result = getResult();

    if (result) {

        finishGame(result);

        return;
    }

    currentPlayer = "X";

    updateTurn();
}


/* MODE */

modeButtons.forEach(button => {

    button.addEventListener("click", () => {

        modeButtons.forEach(item => {
            item.classList.remove("active");
        });

        button.classList.add("active");

        gameMode =
            button.dataset.mode;

        if (gameMode === "ai") {

            difficulty.style.display = "flex";

            playerOLabel.textContent = "AI";

        } else {

            difficulty.style.display = "none";

            playerOLabel.textContent =
                "PLAYER O";
        }

        resetBoard();
    });

});


/* AI LEVEL */

levelButtons.forEach(button => {

    button.addEventListener("click", () => {

        levelButtons.forEach(item => {
            item.classList.remove("active");
        });

        button.classList.add("active");

        aiLevel =
            button.dataset.level;

        resetBoard();
    });

});


/* CELLS */

cells.forEach(cell => {

    cell.addEventListener(
        "click",
        cellClicked
    );

});


/* BUTTONS */

newGame.addEventListener(
    "click",
    resetBoard
);

resetScore.addEventListener(
    "click",
    resetAll
);


/* START */

updateTurn();