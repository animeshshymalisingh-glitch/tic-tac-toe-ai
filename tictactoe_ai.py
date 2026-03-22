

from flask import Flask, render_template, request, jsonify
import random

app = Flask(__name__)

# ─── Constants ───────────────────────────────────────────
PLAYER   = "X"
COMPUTER = "O"
EMPTY    = ""

WINS = [
    [0,1,2], [3,4,5], [6,7,8],  # rows
    [0,3,6], [1,4,7], [2,5,8],  # columns
    [0,4,8], [2,4,6],            # diagonals
]

# Centre → corners → edges.
# MOVE_ORDER only makes a difference when paired with Alpha-Beta pruning.
# With pruning active, searching stronger squares first means weak branches
# get cut earlier — so this list genuinely reduces nodes evaluated.
MOVE_ORDER = [4, 0, 2, 6, 8, 1, 3, 5, 7]

# Difficulty settings: (random_chance, depth)
#   easy   — 80% random moves, shallow search  → makes obvious blunders
#   medium — 40% random moves, mid depth       → plays okay, misses wins
#   hard   — fully deterministic, full search  → unbeatable
DIFFICULTY = {
    "easy":   (0.80, 2),
    "medium": (0.40, 4),
    "hard":   (0.00, 9),
}

# ─── Game helpers (from tictactoe.py base) ───────────────
def check_winner_silent(spaces: list, symbol: str) -> bool:
    """Check if symbol has won — no output, no side effects."""
    return any(all(spaces[i] == symbol for i in line) for line in WINS)

def winning_line(spaces: list, symbol: str) -> list | None:
    """Return the winning combo for symbol, or None."""
    return next((line for line in WINS if all(spaces[i] == symbol for i in line)), None)

def check_tie(spaces: list) -> bool:
    """Return True when no empty cells remain."""
    return EMPTY not in spaces

def status(spaces: list) -> dict:
    """Return a game-status dict for the current board."""
    for p in (PLAYER, COMPUTER):
        line = winning_line(spaces, p)
        if line:
            return {"winner": p, "winning_combo": line, "is_draw": False, "game_over": True}
    if check_tie(spaces):
        return {"winner": None, "winning_combo": None, "is_draw": True,  "game_over": True}
    return     {"winner": None, "winning_combo": None, "is_draw": False, "game_over": False}

# ─── Minimax + Alpha-Beta Pruning ────────────────────────
def minimax(spaces: list, is_maximizing: bool, depth: int, max_depth: int,
            alpha: int, beta: int) -> int:
    
    if check_winner_silent(spaces, COMPUTER): return 10 - depth
    if check_winner_silent(spaces, PLAYER):   return depth - 10
    if check_tie(spaces) or depth >= max_depth: return 0

    if is_maximizing:
        best = -99
        for i in MOVE_ORDER:
            if spaces[i] != EMPTY: continue
            spaces[i] = COMPUTER
            score = minimax(spaces, False, depth + 1, max_depth, alpha, beta)
            spaces[i] = EMPTY
            best  = max(best, score)
            alpha = max(alpha, best)
            if alpha >= beta: break          # ✂ beta cut-off
        return best
    else:
        best = 99
        for i in MOVE_ORDER:
            if spaces[i] != EMPTY: continue
            spaces[i] = PLAYER
            score = minimax(spaces, True, depth + 1, max_depth, alpha, beta)
            spaces[i] = EMPTY
            best = min(best, score)
            beta = min(beta, best)
            if alpha >= beta: break          # ✂ alpha cut-off
        return best

# ─── Computer move ───────────────────────────────────────
def computer_move(spaces: list, difficulty: str) -> int:
    """Return the index of the computer's best move."""
    empty = [i for i in range(9) if spaces[i] == EMPTY]
    if not empty:
        return -1

    rand_chance, max_depth = DIFFICULTY.get(difficulty, (0.0, 9))

    # Random move: gives easy/medium their beatable character.
    if random.random() < rand_chance:
        return random.choice(empty)

    best_score = -99
    best_index = empty[0]
    alpha      = -99

    for i in MOVE_ORDER:
        if spaces[i] != EMPTY: continue
        spaces[i] = COMPUTER
        score = minimax(spaces, False, 0, max_depth, alpha, 99)
        spaces[i] = EMPTY
        if score > best_score:
            best_score, best_index = score, i
            alpha = best_score

    return best_index

# ─── Routes ──────────────────────────────────────────────
@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/move", methods=["POST"])
def make_move():
    data       = request.get_json()
    spaces     = data.get("board", [EMPTY] * 9)
    difficulty = data.get("difficulty", "hard")
    mode       = data.get("mode", "ai")

    ai_move = -1
    if mode == "ai" and not status(spaces)["game_over"]:
        ai_move = computer_move(spaces, difficulty)
        if ai_move != -1:
            spaces[ai_move] = COMPUTER

    s = status(spaces)
    return jsonify({**s, "board": spaces, "ai_move": ai_move})

@app.route("/api/reset", methods=["POST"])
def reset():
    return jsonify({"board": [EMPTY] * 9})

# ─── Run ─────────────────────────────────────────────────
if __name__ == "__main__":
    app.run(debug=True)