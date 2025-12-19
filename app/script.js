// =======================
// 遊戲狀態
// =======================
let board = Array(9).fill('');
let currentPlayer = 'X';
let gameActive = true;
let playerScore = 0;
let computerScore = 0;
let drawScore = 0;
let difficulty = 'medium';

// =======================
// 獲勝組合
// =======================
const winningConditions = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
];

// =======================
// DOM
// =======================
const cells = document.querySelectorAll('.cell');
const statusDisplay = document.getElementById('status');
const resetBtn = document.getElementById('resetBtn');
const resetScoreBtn = document.getElementById('resetScoreBtn');
const difficultySelect = document.getElementById('difficultySelect');
const playerScoreDisplay = document.getElementById('playerScore');
const computerScoreDisplay = document.getElementById('computerScore');
const drawScoreDisplay = document.getElementById('drawScore');

// =======================
// 初始化
// =======================
function init() {
    cells.forEach(cell => cell.addEventListener('click', handleCellClick));
    resetBtn.addEventListener('click', resetGame);
    resetScoreBtn.addEventListener('click', resetScore);
    difficultySelect.addEventListener('change', handleDifficultyChange);
    updateScoreDisplay();
    updateStatus();
}

// =======================
// 點擊格子
// =======================
function handleCellClick(e) {
    const cellIndex = Number(e.target.dataset.index);

    if (!gameActive || board[cellIndex] !== '' || currentPlayer !== 'X') return;

    statusDisplay.textContent = `您選擇了位置 ${cellIndex}`;
    makeMove(cellIndex, 'X');

    if (gameActive && currentPlayer === 'O') {
        const delay = getSafeDelay();
        setTimeout(() => computerMove(), delay);
    }
}

// =======================
// 安全取得延遲時間
// =======================
function getSafeDelay() {
    const input = prompt('輸入延遲時間（0–2000 毫秒）');
    const delay = Number(input);

    if (Number.isNaN(delay)) return 500;
    return Math.min(Math.max(delay, 0), 2000);
}

// =======================
// 執行落子
// =======================
function makeMove(index, player) {
    board[index] = player;
    const cell = document.querySelector(`[data-index="${index}"]`);
    cell.textContent = player;
    cell.classList.add('taken', player.toLowerCase());

    checkResult();

    if (gameActive) {
        currentPlayer = player === 'X' ? 'O' : 'X';
        updateStatus();
    }
}

// =======================
// 狀態顯示
// =======================
function updateStatus() {
    statusDisplay.textContent =
        currentPlayer === 'X'
        ? '您是 X，輪到您下棋'
        : '電腦是 O，正在思考...';
}

// =======================
// 結果檢查
// =======================
function checkResult() {
    for (const [a,b,c] of winningConditions) {
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            endGame(board[a], [a,b,c]);
            return;
        }
    }

    if (!board.includes('')) {
        gameActive = false;
        drawScore++;
        statusDisplay.textContent = '平手！';
        statusDisplay.classList.add('draw');
        updateScoreDisplay();
    }
}

function endGame(winner, combo) {
    gameActive = false;
    combo.forEach(i =>
        document.querySelector(`[data-index="${i}"]`).classList.add('winning')
    );

    if (winner === 'X') {
        playerScore++;
        statusDisplay.textContent = '🎉 恭喜您獲勝！';
    } else {
        computerScore++;
        statusDisplay.textContent = '😢 電腦獲勝！';
    }

    statusDisplay.classList.add('winner');
    updateScoreDisplay();
}

// =======================
// 電腦邏輯
// =======================
function computerMove() {
    if (!gameActive) return;

    const move =
        difficulty === 'easy' ? getRandomMove() :
        difficulty === 'medium' ? (Math.random() < 0.5 ? getBestMove() : getRandomMove()) :
        getBestMove();

    if (move !== -1) makeMove(move, 'O');
}

function getRandomMove() {
    const empty = board
        .map((v,i) => v === '' ? i : null)
        .filter(v => v !== null);
    return empty.length ? empty[Math.floor(Math.random()*empty.length)] : -1;
}

// =======================
// Minimax
// =======================
function getBestMove() {
    let bestScore = -Infinity;
    let move = -1;

    for (let i=0;i<9;i++) {
        if (board[i] === '') {
            board[i] = 'O';
            const score = minimax(0,false);
            board[i] = '';
            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
    }
    return move;
}

function minimax(depth, isMax) {
    const result = checkWinner();
    if (result !== null) {
        if (result === 'O') return 10 - depth;
        if (result === 'X') return depth - 10;
        return 0;
    }

    let best = isMax ? -Infinity : Infinity;

    for (let i=0;i<9;i++) {
        if (board[i] === '') {
            board[i] = isMax ? 'O' : 'X';
            const score = minimax(depth+1,!isMax);
            board[i] = '';
            best = isMax ? Math.max(best,score) : Math.min(best,score);
        }
    }
    return best;
}

function checkWinner() {
    for (const [a,b,c] of winningConditions) {
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }
    return board.includes('') ? null : 'draw';
}

// =======================
// Reset
// =======================
function resetGame() {
    board.fill('');
    gameActive = true;
    currentPlayer = 'X';
    statusDisplay.className = '';
    updateStatus();

    cells.forEach(cell => {
        cell.textContent = '';
        cell.className = 'cell';
    });
}

function resetScore() {
    playerScore = computerScore = drawScore = 0;
    updateScoreDisplay();
    resetGame();
}

function updateScoreDisplay() {
    playerScoreDisplay.textContent = playerScore;
    computerScoreDisplay.textContent = computerScore;
    drawScoreDisplay.textContent = drawScore;
}

function handleDifficultyChange(e) {
    difficulty = e.target.value;
    resetGame();
}

// =======================
// 啟動
// =======================
init();
