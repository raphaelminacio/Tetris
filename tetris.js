// we need to select our canvas and getContext('2d') from
const canvas = document.getElementById("my-canvas");
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById("score");

// first we need to define two constants to represent the gameboard
const ROW = 25;
const COL = COLUMN = 15;
// since the board and the pieces are both made of squares, we'll use a constant called SQ as a unit
const SQ = squareSize = 25;

// a VACANT (empty) square has a white (#becfea) color
const VACANT = "#2f3640";

// 1. Drawing a square
function drawSquare(x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x*SQ, y*SQ, SQ, SQ);

  ctx.strokeStyle = "#2f3640";
  ctx.strokeRect(x*SQ, y*SQ, SQ, SQ);
  //ctx.lineWidth = 4;
}

// creating the board
let board = [];

// first "for loop" creates the rows; the second one creates the columns
for (r = 0; r < ROW; r++) {
  board[r] = [];
  for (c = 0; c < COL; c++) {
    board[r][c] = VACANT;
    // when we first draw the board all the square are empty, so every square has the value #becfea
  }
}

// 2. Drawing the board
function drawBoard() {
  for (r = 0; r < ROW; r++) {
    for (c = 0; c < COL; c++) {
      drawSquare(c, r, board[r][c]); // c and r they're x & y position respectively; board[r][c] represents the color
    }
  }
}

drawBoard();

// 3. The pieces & their colors
const PIECES = [
  [Z, "#ED4C67"],
  [S, "#EE5A24"],
  [T, "#0652DD"],
  [O, "#FFC312"],
  [L, "#D980FA"],
  [I, "#009432"],
  [J, "#6F1E51"]
];

// 4. Function that generates random pieces
function randomPiece() {
  let r = randomN = Math.floor(Math.random() * PIECES.length); // 0 -> 6
  return new Piece(PIECES[r][0], PIECES[r][1]);
}

let p = randomPiece();

// 3. Object Piece (function constructor)
function Piece(tetromino, color) {
  this.tetromino = tetromino; // é o código pro Z tetromino
  this.color = color;

  this.tetrominoN = 0; // it's the index of the chosen tetromino & it starts from the first pattern
  this.activeTetromino = this.tetromino[this.tetrominoN]; // property of the tetromino that we're playing in the real time; it's like saying => Z[0]

  // we need the starting x & y position of the piece; we can control the piece like so
  this.x = 3;
  this.y = -2;
}

// 4. Fill Function
Piece.prototype.fill = function(color) {
  for (r = 0; r < this.activeTetromino.length; r++) {
    for (c = 0; c < this.activeTetromino.length; c++) {
      // we draw only occupied squares
      if (this.activeTetromino[r][c]) {
        drawSquare(this.x + c, this.y + r, color);
      }
    }
  }
}

// 4. Drawing a piece to the board
/* * prototype property allows to add properties to object constructors */
Piece.prototype.draw = function() {
  this.fill(this.color);
}

// 5. Udrawing a piece to the board
Piece.prototype.unDraw = function() {
  this.fill(VACANT);
}

// 6. Moving down a piece
Piece.prototype.moveDown = function() {
  if (!this.collision(0, 1, this.activeTetromino)) {
    this.unDraw();
    this.y++;
    this.draw();
  } else {
    // we lock the piece & generate a new one
    this.lock();
    p = randomPiece();
  }
}

// 7. Moving a piece to the left
Piece.prototype.moveLeft = function() {
  if (!this.collision(-1, 0, this.activeTetromino)) {
    this.unDraw();
    this.x--;
    this.draw();
  }
}

// 8. Moving a piece to the right
Piece.prototype.moveRight = function() {
  if (!this.collision(1, 0, this.activeTetromino)) {
    this.unDraw();
    this.x++;
    this.draw();
  }
}

// 9. Rotating a piece
Piece.prototype.rotate = function() {
  let newPattern = this.tetromino[(this.tetrominoN + 1) % this.tetromino.length];
  let kick = 0; // allows us to rotate the piece if it's next to the wall

  if (this.collision(0, 0, newPattern)) {
    if (this.x > COL / 2) {
      // if the collision occurs on the right side of the wall
      kick = -1; // we need to move the piece to the left
    } else {
      // if the collision occurs on the left side of the wall
      kick = 1; // we need to move the piece to the right
    }
  }

  if (!this.collision(kick, 0, newPattern)) {
    this.unDraw();
    this.tetrominoN = (this.tetrominoN + 1) % this.tetromino.length; // (0 + 1) % 4
    this.x += kick;
    this.activeTetromino = this.tetromino[this.tetrominoN];
    this.draw();
  }
}

let score = 0;

// 10. Locking a piece
Piece.prototype.lock = function() {
  for (r = 0; r < this.activeTetromino.length; r++) {
    for (c = 0; c < this.activeTetromino.length; c++) {
      // skipping the empty squares; we don't want to lock the empty ones
      if (!this.activeTetromino[r][c]) {
        continue;
      }
      // pieces to lock on top = game over
      if (this.y + r < 0) {
        overlayOn();
        //alert("Game Over");
        // stop the requestAnimationFrame
        gameOver = true;
        break;
      }
      // we lock the piece
      board[this.y + r][this.x + c] = this.color;
    }
  }
  // removing full rows
  for (r = 0; r < ROW; r++) {
    let isRowFull = true;

    for (c = 0; c < COL; c++) {
      isRowFull = isRowFull && (board[r][c] != VACANT);
    }
    if (isRowFull) {
      // if the row is full, we move down all the rows above it
      for (y = r; y > 1; y--) {
        for (c = 0; c < COL; c++) {
          board[y][c] = board[y - 1][c];
        }
      }
      /* now, the top row board[0][..] has no row above it
         so, we have to create it again
      */
      for (c = 0; c < COL; c++) {
        board[0][c] = VACANT;
      }
      // so, we increment the score
      score += 100;
    }
  }
  // update the board
  drawBoard();

  // update the score
  scoreElement.innerHTML = score;
}

// 7. Collision Function - detecting a collision
Piece.prototype.collision = function(x, y, piece) {
  for (r = 0; r < piece.length; r++) {
    for (c = 0; c < piece.length; c++) {
      // if the square is empty, we skip interval
      if (!piece[r][c]) {
        continue;
      }
      // coordinates of the piece after movement
      let newX = this.x + c + x;
      let newY = this.y + r + y;

      // conditions
      if (newX < 0 || newX >= COL || newY >= ROW) {
        return true; // true because there's a collision
      }
      // skip newY < 0, because board[-1] will crush our gameboard
      if (newY < 0) {
        continue;
      }
      // check if there's a locked piece already in place
      if (board[newY][newX] != VACANT) {
        return true; // true because there's a collision
      }
    }
  }
  return false;
}

// ***** CONTROL the piece *****

document.addEventListener("keydown", CONTROL);

/* 8. Function to CONTROL(object constructor) the piece
  every Key on the keyboard has a Unicode value, so:
  moveLeft => key 37
  moveUp == rotate in this case => key 38
  moveRight => key 39
  moveDown => key 40
 */
function CONTROL(event) {
  if (event.keyCode == 37) {
    p.moveLeft();
    dropStart = Date.now();
  } else if (event.keyCode == 38) {
    p.rotate();
    dropStart = Date.now();
  } else if (event.keyCode == 39) {
    p.moveRight();
    dropStart = Date.now();
  } else if (event.keyCode == 40) {
    p.moveDown();
  }
}

// 9. Droping a piece every 1 second
let dropStart = Date.now();
let gameOver = false;

function overlayOn() {
  document.getElementById("overlay").style.display = "block";
}

function drop() {
  let now = Date.now();
  let delta = now - dropStart;

  if (delta > 200) {
    p.moveDown();
    dropStart = Date.now();
  }
  if (!gameOver) {
    requestAnimationFrame(drop);
  }
}

drop();
