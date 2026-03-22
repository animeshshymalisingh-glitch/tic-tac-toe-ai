// ─── State ───────────────────────────────────────────────
const state = {
  board:         Array(9).fill(""),
  mode:          "ai",
  difficulty:    "medium",
  currentPlayer: "X",
  gameOver:      false,
  overlayTimer:  null,          // tracks the pending overlay timeout
  scores:        { X: 0, O: 0, draw: 0 },
};

// ─── Grab DOM elements ───────────────────────────────────
const $ = id => document.getElementById(id);
const boardEl = $("board");

// ─── Result messages ─────────────────────────────────────
const MESSAGES = {
  X_ai:  ["🎉", "You Win!",      "Beginner's luck? Or actual skill?"],
  O_ai:  ["🤖", "AI Wins!",      "Maybe sit this one out next time…"],
  D_ai:  ["🤝", "It's a Draw!",  "You matched a perfect AI. Not bad."],
  X_2p:  ["🏆", "X Wins!",       "Player X takes the round!"],
  O_2p:  ["🏆", "O Wins!",       "Player O takes the round!"],
  D_2p:  ["🤝", "It's a Draw!",  "Great minds think alike."],
};

// ─── Send JSON to Flask, get JSON back ───────────────────
async function post(url, body) {
  const res = await fetch(url, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(body),
  });
  return res.json();
}

// ─── Draw the board from state.board ─────────────────────
function renderBoard(winCombo = null) {
  boardEl.querySelectorAll(".cell").forEach((cell, i) => {
    const val = state.board[i];
    cell.className   = "cell" + (val ? " taken " + val.toLowerCase() : "");
    cell.textContent = val === "X" ? "✕" : val === "O" ? "○" : "";
    if (winCombo?.includes(i)) cell.classList.add("winner");
  });
}

// ─── Handle end of game ──────────────────────────────────
function handleGameOver(data) {
  state.gameOver = true;
  const key = data.is_draw ? "D" : data.winner;
  state.scores[data.is_draw ? "draw" : data.winner]++;
  $("scoreX").textContent    = state.scores.X;
  $("scoreO").textContent    = state.scores.O;
  $("scoreDraw").textContent = state.scores.draw;
  renderBoard(data.winning_combo);

  // if the player clicks New Game before the 1.1s delay finishes.
  state.overlayTimer = setTimeout(() => {
    const [emoji, headline, sub] = MESSAGES[`${key}_${state.mode === "ai" ? "ai" : "2p"}`];
    $("modalEmoji").textContent    = emoji;
    $("modalHeadline").textContent = headline;
    $("modalSub").textContent      = sub;
    $("overlay").classList.remove("hidden");
  }, 1100);
}

// ─── Cell click ──────────────────────────────────────────
async function onCellClick(i) {
  if (state.gameOver || state.board[i] || boardEl.classList.contains("thinking")) return;

  // Two-player: place mark locally, ask backend for game status only
  if (state.mode === "two_player") {
    state.board[i] = state.currentPlayer;
    renderBoard();
    const data = await post("/api/move", { board: state.board, mode: "two_player" });
    if (data.game_over) return handleGameOver(data);
    state.currentPlayer = state.currentPlayer === "X" ? "O" : "X";
    $("statusText").textContent = `Player ${state.currentPlayer}'s turn!`;
    return;
  }

  // AI mode: send move, get AI response
  state.board[i] = "X";
  renderBoard();
  $("statusText").textContent = "🤖 AI is thinking…";
  boardEl.classList.add("thinking");

  const data = await post("/api/move", { board: state.board, difficulty: state.difficulty, mode: "ai" });
  state.board = data.board;
  boardEl.classList.remove("thinking");

  if (data.game_over) return handleGameOver(data);
  renderBoard();
  $("statusText").textContent = "Your turn! Click a cell.";
}

// ─── New game ────────────────────────────────────────────
async function newGame() {
  clearTimeout(state.overlayTimer);

  const data = await post("/api/reset", {});
  state.board         = data.board;
  state.gameOver      = false;
  state.currentPlayer = "X";
  boardEl.classList.remove("thinking");
  $("overlay").classList.add("hidden");
  renderBoard();

  $("statusText").textContent = state.mode === "two_player"
    ? "Player X's turn!"
    : "Your turn! Click a cell.";
}

// ─── Toggle buttons (mode & difficulty) ──────────────────
document.querySelectorAll(".toggle-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const group = btn.closest(".toggle-group");
    group.querySelectorAll(".toggle-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    if (btn.dataset.value === "ai" || btn.dataset.value === "two_player") {
      state.mode = btn.dataset.value;
      const isAI = state.mode === "ai";
      $("difficultyGroup").style.display = isAI ? "flex" : "none";
      $("xLabel").textContent = isAI ? "You"   : "P1 (X)";
      $("oLabel").textContent = isAI ? "AI"    : "P2 (O)";
    } else {
      state.difficulty = btn.dataset.value;
    }
    newGame();
  });
});

// ─── Button listeners ────────────────────────────────────
$("btnPlayAgain").addEventListener("click", newGame);
$("btnNewGame").addEventListener("click",   newGame);
$("btnResetScores").addEventListener("click", () => {
  state.scores = { X: 0, O: 0, draw: 0 };
  $("scoreX").textContent    = 0;
  $("scoreO").textContent    = 0;
  $("scoreDraw").textContent = 0;
});
$("btnQuit").addEventListener("click", () => {
  $("overlay").classList.add("hidden");
  $("statusText").textContent = "Thanks for playing! 👋";
});

// ─── Build board cells & start ───────────────────────────
for (let i = 0; i < 9; i++) {
  const cell = document.createElement("div");
  cell.className = "cell";
  cell.addEventListener("click", () => onCellClick(i));
  boardEl.appendChild(cell);
}

// Sync board visuals and status text with initial state on page load
renderBoard();
$("statusText").textContent = "Your turn! Click a cell.";