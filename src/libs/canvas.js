import {darkblue} from '../configs'
export default class CanvasTool {
  width = 400; // canvas width
  height = 400; // canvas height
  squareSize = 60; // square size
  circleRadius = 10; // circle radius
  model = undefined; // model
  originModel = undefined; // Backup model
  columns = 4; // Default 4x4
  rows = 4; // Default 4x4
  minXY = this.squareSize; // The smallest coordinates of a circle
  maxXY = (this.columns - 1) * this.minXY; // The maximum coordinates of a circle
  ctx = undefined; // canvas context
  squares = []; // Square array
  points = []; // {x: number, y: number, highlight?: boolean}[]
  activeSquares = []; // [topLeftData, topRightData, bottomRightData, bottomLeftData]
  canvas = undefined;// Dom Canvas
  moveCounter = 0; // move counter
  gameOver = false; // gameOver
  emit = () => { }; // Dispatch event
  bindClick = this.processClick.bind(this)

  constructor(canvasObj, callback) {
    this.canvas = canvasObj;
    this.ctx = canvasObj.getContext("2d");
    this.width = canvasObj.width;
    this.height = canvasObj.height;
    canvasObj.addEventListener("click", this.bindClick); // Bind click event
    this.emit = callback || (() => {});
  }
  // Load model Reset model
  loadModel(model, name) {
    // reset canvas
    this.resetTransform();
    this.clearRect();
    // reset initial data
    this.originModel = model;
    this.model = JSON.parse(JSON.stringify(model));
    this.columns = this.model.board.size;
    this.rows = this.model.board.size;
    this.maxXY = (this.columns - 1) * this.minXY;
    this.squares = this.model.board.squares;
    this.points = [];
    this.activeSquares = [];
    this.moveCounter = 0;
    this.gameOver = false;
    this.addItem(); // Add an Item 5x5
    // dispatch event
    this.emit({ type: "message", data: `Reset and load configuration ${name || ""} successfully` });
    this.emit({ type: "moveCounter", data: 0 });
    this.emit({ type: "gameOver", data: false });

    this.redraw();
  }
  // redraw
  redraw() {
    this.resetTransform();
    this.clearRect();
    // set the origin to the top left of the canvas
    let translateXY = (400 - this.columns * this.squareSize) / 2;
    this.ctx.translate(translateXY, translateXY);

    // DRAW SQUARES
    this.squares.forEach((sq, idx) => {
      sq.index = idx;
      this.ctx.fillStyle = sq.color;
      this.ctx.fillRect(sq.column * this.squareSize, sq.row * this.squareSize, this.squareSize, this.squareSize);
    });

    // DRAW  BOARD
    let cacheHighlight = []; // Draw separately to avoid overlaying the highlighted layers
    this.squares.forEach((sq) => {
      if (!sq.highlight) {
        this.ctx.strokeStyle = "black";
        this.ctx.lineWidth = 4;
        this.ctx.strokeRect(sq.column * this.squareSize, sq.row * this.squareSize, this.squareSize, this.squareSize);
      } else {
        cacheHighlight.push(sq);
      }
    });
    cacheHighlight.forEach((sq) => {
      this.ctx.strokeStyle = "rgba(255, 0, 0, 1.00)";
      this.ctx.lineWidth = 4;
      this.ctx.strokeRect(sq.column * this.squareSize, sq.row * this.squareSize, this.squareSize, this.squareSize);
    });
    // DRAW OR UPDATE CIRCLES
    if (!this.points.length) {
      this.squares.forEach((sq) => {
        let circleX = sq.row * this.squareSize;
        let circleY = sq.column * this.squareSize;
        if (circleX >= this.minXY && circleY >= this.minXY && circleY <= this.maxXY && circleY <= this.maxXY) {
          this.ctx.lineWidth = 2;
          this.ctx.beginPath();
          this.ctx.arc(circleX, circleY, this.circleRadius, 2 * Math.PI, false);
          this.ctx.fillStyle = "white";
          this.ctx.fill();
          this.ctx.strokeStyle = "black";
          this.ctx.stroke();
          this.points.push({ x: circleX, y: circleY });
        }
      });
    } else {
      this.points.forEach((point) => {
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(point.x, point.y, this.circleRadius, 2 * Math.PI, false);
        this.ctx.fillStyle = point.highlight ? "rgba(255, 0, 0, 1.00)" : "white";
        this.ctx.fill();
        this.ctx.strokeStyle = point.highlight ? "rgba(255, 0, 0, 1.00)" : "black";
        this.ctx.stroke();
      });
    }
  }
  // click event
  processClick(e) {
    if (this.gameOver) {
      return;
    }
    // Determine if the click position is inside the circle
    const canvasRect = this.canvas.getBoundingClientRect();
    // normalizing RAW point into localized canvas coordinates.
    let x = e.clientX - canvasRect.left;
    let y = e.clientY - canvasRect.top;
    let translateXY = (this.width - this.columns * this.squareSize) / 2;
    let originX = x - translateXY;
    let originY = y - translateXY;
    let isInside = this.isPointInRectangle(originX, originY);
    // Click on the white circle to select it
    if (isInside.inside) {
      // Gets the square position in the top left corner of the clicked circle
      let clickedColumn = Math.floor((isInside.point.x - this.squareSize) / this.squareSize);
      let clickedRow = Math.floor((isInside.point.y - this.squareSize) / this.squareSize);
      // Gets the rows and columns of the four smaller squares that make up the larger square
      const topLeft = { row: clickedRow, column: clickedColumn };
      const topRight = { row: clickedRow, column: clickedColumn + 1 };
      const bottomLeft = { row: clickedRow + 1, column: clickedColumn };
      const bottomRight = { row: clickedRow + 1, column: clickedColumn + 1 };
      // Get data for four squares
      const topLeftData = this.squares[topLeft.row * this.columns + topLeft.column];
      const topRightData = this.squares[topRight.row * this.columns + topRight.column];
      const bottomLeftData = this.squares[bottomLeft.row * this.columns + bottomLeft.column];
      const bottomRightData = this.squares[bottomRight.row * this.columns + bottomRight.column];
      // Reset all highlighted states
      this.squares.forEach((item) => (item.highlight = false));
      // If the four colors are not white and the colors are the same, change them to white, moveCounter+1
      if (
        topLeftData.color !== "white" &&
        topLeftData.color === topRightData.color &&
        topLeftData.color === bottomLeftData.color &&
        topLeftData.color === bottomRightData.color
      ) {
        topLeftData.color = topRightData.color = bottomLeftData.color = bottomRightData.color = "white";
        this.moveCounter++;
        this.emit({ type: "moveCounter", data: this.moveCounter });
        this.emit({ type: "message", data: `Pairing successful  !` });
        this.activeSquares = [];
        this.points.forEach((item) => (item.highlight = false));
        this.redraw();
        this.checkGameOver();
        return;
      }
      // Check that all four colors are white and ignore this operation
      if (topLeftData.color === "white" && topRightData.color === "white" && bottomLeftData.color === "white" && bottomRightData.color === "white") {
        this.activeSquares = [];
        return;
      }
      // The four colors are not exactly the same, change their borders to red highlight
      topLeftData.highlight = topRightData.highlight = bottomLeftData.highlight = bottomRightData.highlight = true;
      this.activeSquares = [topLeftData, topRightData, bottomRightData, bottomLeftData];
      this.redraw();
      return;
    }
  }
  // rotate clockwise counter-clockwise
  rotate(type) {
    if (this.gameOver) return;
    if (!this.activeSquares.length) return;
    let cloneActiveSquares = JSON.parse(JSON.stringify(this.activeSquares));
    if (type === "clockwise") {
      cloneActiveSquares.unshift(cloneActiveSquares.at(-1));
      cloneActiveSquares.pop();
    }
    if (type === "counterClockwise") {
      cloneActiveSquares.push(cloneActiveSquares[0]);
      cloneActiveSquares.shift();
    }
    cloneActiveSquares.forEach((item, idx) => {
      this.activeSquares[idx].color = item.color;
    });

    this.moveCounter += 1;
    this.emit({ type: "message", data: `Rotation successful.` });
    this.emit({ type: "moveCounter", data: this.moveCounter });
    this.redraw();
    this.checkGameOver();
  }

  // 5x5 Add a piece of data
  addItem() {
    if (this.squares.length < this.columns * this.columns) {
      let lastItem = this.squares[this.squares.length - 1];
      this.squares.push({
        ...lastItem,
        column: lastItem.column + 1,
        color: "white",
      });
    }
  }
  // Determine if the click is in the circle
  isPointInRectangle(clickX, clickY) {
    let inside = false;
    let point = {};
    this.points.forEach((item) => {
      item.highlight = false;
      // Calculate the distance between the click position and the center of the circle
      const distance = Math.sqrt(Math.pow(clickX - item.x, 2) + Math.pow(clickY - item.y, 2));
      // Determine whether the distance is less than or equal to the radius of the circle
      if (distance <= this.circleRadius) {
        // Click position inside the circle
        inside = true;
        item.highlight = true; // Add a highlighted state
        point = { x: item.x, y: item.y };
      }
    });
    return {
      inside,
      point,
    };
  }

  // clear the canvas area before rendering the coordinates held in state
  clearRect() {
    this.ctx.clearRect(0, 0, this.width, this.height); // assume square region
  }

  //reset Matrix transformation
  resetTransform() {
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  reset() {
    this.loadModel(JSON.parse(JSON.stringify(this.originModel)));
  }

  destroy() {
    this.canvas.removeEventListener("click", this.bindClick)
  }

  checkGameOver() {
    // 1.Rules of the game
    let end = this.squares.every((i) => i.color === "white");
    if (end) {
      this.emit({ type: "message", data: `Congratulations, you win the game.` });
      this.emit({ type: "gameOver", data: true });
      this.gameOver = true;
      return;
    }
    // 2.Rules of the game 6x6
    if (this.squares.length === 36 && this.moveCounter >= 5) {
      // Find out if there are still dark blue squares
      let blueSquares = this.squares.filter((i) => i.color === darkblue);
      if (blueSquares.length) {
        this.gameOver = true;
        this.emit({
          type: "message",
          data: `Sorry, you lose the game. You need to eliminate the dark blue square on the middle 6x6 board in 5 moves.`,
        });
        this.emit({ type: "gameOver", data: true });
        this.squares.forEach((i) => (i.highlight = false));
        this.points.forEach((i) => (i.highlight = false));
        this.redraw();
        return;
      }
    }
    // 3.Rules of the game 4x4
    if (this.moveCounter >= 16 && this.squares.length === 16) {
      // Find out if there are any squares that are not white
      let whiteSquares = this.squares.filter((i) => i.color !== "white");
      if (whiteSquares.length) {
        this.gameOver = true;
        this.emit({
          type: "message",
          data: `Sorry, you lose the game. You need to complete the game in 16 moves.`,
        });
        this.emit({ type: "gameOver", data: true });
        this.squares.forEach((i) => (i.highlight = false));
        this.points.forEach((i) => (i.highlight = false));
        this.redraw();
        return;
      }
    }
    return end;
  }
}
