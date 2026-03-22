<div align="center">

# 🎮 Tic-Tac-Toe AI

### A full-stack web game powered by **Python Flask** + **Minimax with Alpha-Beta Pruning**

![Python](https://img.shields.io/badge/Python-3.7%2B-blue?style=for-the-badge&logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-2.x-black?style=for-the-badge&logo=flask&logoColor=white)
![HTML](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

> Built from scratch to deeply understand how game-playing AI works — from the algorithm to a fully playable web interface.

</div>

---

## ✨ Features

- 🤖 **Unbeatable AI** — Minimax algorithm with Alpha-Beta Pruning
- 🎯 **3 Difficulty Levels** — Easy, Medium, Hard (each feels genuinely different)
- 👥 **Two-Player Mode** — play against a friend on the same device
- 📊 **Live Score Tracker** — persists across rounds with a reset option
- 🏆 **Winning Line Highlight** — golden pulse animation on the winning cells
- 🎬 **Result Modal** — fade-in overlay with Play Again / Quit buttons
- 🌈 **Colourful UI** — animated background, glowing marks, smooth transitions
- ⚡ **REST API** — clean separation between Python backend and JS frontend

---

## 🚀 Getting Started

### Prerequisites
- Python 3.7 or higher
- pip

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/animeshshymalisingh-glitch/tic-tac-toe-ai.git
cd tic-tac-toe-ai

# 2. Install the dependency
pip install flask

# 3. Run the app
python tictactoe_ai.py
```

**4.** Open your browser and go to **http://localhost:5000**

---

## 🗂️ Project Structure

```
tic-tac-toe-ai/
├── tictactoe_ai.py               ← Python/Flask backend — all game logic & AI
├── templates/
│   └── index.html       ← Page structure
├── static/
│   ├── style.css        ← All styling & animations
│   └── script.js        ← Frontend logic & Flask communication
└── README.md
```

---

## 🏗️ How It Works

### Architecture

```
Browser (HTML / CSS / JS)
         │
         │  "I clicked cell 4"  →  POST /api/move  (JSON)
         ▼
Flask Backend (app.py)
         │
         │  runs Minimax, picks best move
         ▼
         │  "AI plays cell 6"  →  JSON response
         ▼
Browser updates the UI
```

The Python backend handles **only game logic** — no display.
The frontend handles **only display** — no AI.
They talk through a clean JSON API. This is how real web apps are built.

---

## 🧠 The AI — Minimax + Alpha-Beta Pruning

### Minimax
The AI builds a complete game tree of every possible move sequence and scores terminal states:

| Outcome | Score |
|---------|-------|
| AI wins | `+(10 - depth)` |
| Draw | `0` |
| You win | `-(10 - depth)` |

The **depth penalty** (`10 - depth`) means the AI always prefers a win on move 1 over a win on move 5 — it never "plays with its food."

### Alpha-Beta Pruning
Cuts branches of the game tree that can't affect the final decision:

```
alpha (α) = best score AI has guaranteed so far
beta  (β) = best score human has guaranteed so far

If α ≥ β → stop searching this branch
```

### Move Order Optimisation
Searches **centre → corners → edges** first:
```python
MOVE_ORDER = [4, 0, 2, 6, 8, 1, 3, 5, 7]
```
This finds strong moves earlier, so Alpha-Beta can prune more branches — fewer nodes evaluated overall.

### Root-Level Alpha Propagation
The `computer_move()` function carries `alpha` forward across root branches, so each branch benefits from what was already found — no "amnesia" between root evaluations.

---

## 🎮 Difficulty Levels

| Level | Random Chance | Search Depth | Feel |
|-------|--------------|-------------|------|
| 😊 Easy | 80% random | 2 | Makes obvious blunders — very beatable |
| 😤 Medium | 40% random | 4 | Plays okay but slips up regularly |
| 💀 Hard | 0% random | 9 | Fully deterministic — unbeatable |

Depth alone doesn't create meaningful difficulty in Tic-Tac-Toe (the board is too small). Randomness is what makes Easy and Medium actually feel different.

---

## 📡 API Reference

### `POST /api/move`
Receives the board state, returns the AI's move and game status.

**Request:**
```json
{
  "board": ["X", "", "", "", "O", "", "", "", ""],
  "difficulty": "hard",
  "mode": "ai"
}
```

**Response:**
```json
{
  "board": ["X", "", "", "", "O", "", "O", "", ""],
  "ai_move": 6,
  "winner": null,
  "winning_combo": null,
  "is_draw": false,
  "game_over": false
}
```

### `POST /api/reset`
Returns a fresh empty board.

**Response:**
```json
{ "board": ["", "", "", "", "", "", "", "", ""] }
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Backend | Python + Flask | Game logic, Minimax AI, REST API |
| Frontend | HTML5 | Page structure |
| Styling | CSS3 | Animations, layout, theming |
| Interactivity | Vanilla JavaScript | Click handling, fetch API, DOM updates |
| Fonts | Google Fonts (Fredoka One + Nunito) | Playful display typography |

---

## 💡 What I Learned Building This

- How the **Minimax algorithm** works and why it guarantees perfect play
- Why **Alpha-Beta Pruning** matters and how move ordering makes it faster
- How to build a **REST API with Flask** and connect it to a frontend via `fetch()`
- The difference between **backend logic** and **frontend display** in a real web app
- How to fix subtle bugs like race conditions, root-level alpha amnesia, and lazy AI scoring

---

## 📄 License

[MIT](LICENSE) — free to use, modify, and learn from. A ⭐ is always appreciated!

---

<div align="center">

Built with Python 🐍 · Flask 🌶️ · HTML/CSS/JS 🌐

</div>