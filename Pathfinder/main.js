//GLOBAL VARIABLES
let grid = [];
let gridBox = document.querySelector(".grid-box");
let row = 20;
let col = 50;
let sX = 8,
  sY = 2;
let eX = 15,
  eY = 45;
let dir = [
  [0, -1],
  [-1, 0],
  [0, 1],
  [1, 0],
];

//GRID
createGrid();
// class Node {
//   constructor(row, col) {
//     this.row = row;
//     this.col = col;
//     this.isObstacle = false;
//     this.isStartNode = false;
//     this.isEndNode = false;
//     this.isVisited = false;
//     this.neighbors = [];
//     this.previousNode = null;
//   }
// }

//CLEAR PATH BUTTON EVENT LISTENER
document.getElementById("clearPath").addEventListener("click", function () {
  for (let i = 0; i < row; i++) {
    for (let j = 0; j < col; j++) {
      let s = i + "," + j;
      let cell = document.getElementById(s);
      if (grid[i][j].isWall) continue;
      else if (
        !cell.classList.contains("start-node") &&
        !cell.classList.contains("end-node")
      )
        cell.style.backgroundColor = "#caf4ff";
    }
  }
});

//CLEAR GRID BUTTON EVENT LISTENER
document.getElementById("clearGrid").addEventListener("click", function () {
  createGrid();
});

//ALGORITHMS DROP-DOWN EVENT LISTENERS
document.getElementById("selector").addEventListener("change", function () {
  let value = document.getElementById("selector").value;
  if (value == "Dfs") {
    let indPair = [];
    let vis = Array.from({ length: row }, () => Array(col).fill(false));
    let prev = Array.from({ length: row }, () => Array(col).fill([-1, -1]));
    let isPathFound = dfs(sX, sY, eX, eY, indPair, vis, prev);
    indPair.shift();
    indPair.pop();
    toggleButtons(true);

    if (isPathFound) {
      let path = shortestPath(sX, sY, eX, eY, prev);
      animate(indPair, path);
    } else animate(indPair);
  } else if (value === "Bfs") {
    let indPair = [];
    let vis = Array.from({ length: row }, () => Array(col).fill(false));
    let prev = Array.from({ length: row }, () =>
      Array.from({ length: col }, () => [-1, -1])
    );

    let isPathFound = bfs(sX, sY, eX, eY, indPair, vis, prev);
    // console.log(prev);
    toggleButtons(true);
    if (isPathFound) {
      let path = shortestPath(sX, sY, eX, eY, prev);
      animate(indPair, path);
    } else animate(indPair);
  } else if (value === "A*") {
    alert("work in progress");
  }
});

//WALL CREATION MOUSEOVER EVENT LISTENER
let cells = document.querySelectorAll(".cell");
let isMouseDown = false;
cells.forEach((cell) => {
  cell.addEventListener("mousedown", () => {
    isMouseDown = true;
    toggleCellColor(cell);
  });

  cell.addEventListener("mouseenter", () => {
    if (isMouseDown) {
      toggleCellColor(cell);
    }
  });

  cell.addEventListener("mouseup", () => {
    isMouseDown = false;
  });

  function toggleCellColor(cell) {
    let row = parseInt(cell.dataset.row);
    let col = parseInt(cell.dataset.col);

    // Check if the cell is not start or end node
    if (!(row === sX && col === sY) && !(row === eX && col === eY)) {
      let cellData = grid[row][col];
      if (cellData.isWall) {
        cell.style.backgroundColor = "#caf4ff";
      } else {
        cell.style.backgroundColor = "#99c3cf";
      }
      cellData.isWall = !cellData.isWall;
    }
  }
});

//CREATE GRID FUNCTION
function createGrid() {
  if (row && col) {
    gridBox.innerHTML = "";
    grid = [];
    for (let i = 0; i < row; i++) {
      let r = document.createElement("div");
      r.className = "row";
      let currRow = [];
      for (let j = 0; j < col; j++) {
        let cell = document.createElement("div");
        cell.id = `${i},${j}`;
        cell.className = "cell";
        cell.dataset.row = i;
        cell.dataset.col = j;
        if (i == sX && j == sY) {
          cell.style.backgroundColor = "red";
          cell.classList.add("start-node");
        }
        if (i == eX && j == eY) {
          cell.style.backgroundColor = "red";
          cell.classList.add("end-node");
        }
        r.appendChild(cell);
        currRow.push({
          isWall: false,
          element: cell,
        });
      }
      grid.push(currRow);
      gridBox.appendChild(r);
    }
  }
}

// FUNCTION TO ENABLE/DISABLE BUTTONS
function toggleButtons(disabled) {
  document.querySelectorAll("button, select").forEach((element) => {
    element.disabled = disabled;
  });
}

//ANIMATE FUNCTIONS
function animate(indPair, shortestPath) {
  if (indPair.length === 0) {
    if (shortestPath) {
      toggleButtons(true);
      animatePath(shortestPath);
    } else toggleButtons(false);
    return;
  }

  let [i, j] = indPair.shift();
  let s = i + "," + j;
  let c = document.getElementById(s);
  if (c) {
    c.style.backgroundColor = "yellow";
  }

  setTimeout(function () {
    if (c) {
      c.style.backgroundColor = "#005C78";
    }
    animate(indPair, shortestPath);
  }, 5);
}

function animatePath(shortestPath) {
  if (shortestPath.length === 0) {
    toggleButtons(false);
    return;
  }

  let [i, j] = shortestPath.shift();
  let s = i + "," + j;
  let c = document.getElementById(s);
  if (c) {
    c.style.backgroundColor = "#003C43";
  }

  setTimeout(function () {
    animatePath(shortestPath);
  }, 5);
}

//ALGORITHMS
function dfs(sX, sY, eX, eY, indPair, vis, prev) {
  if (vis[sX][sY]) {
    return false;
  }
  vis[sX][sY] = true;
  indPair.push([sX, sY]);

  if (sX == eX && sY == eY) {
    return true;
  }

  for (let i = 0; i < 4; i++) {
    let nX = sX + dir[i][0];
    let nY = sY + dir[i][1];

    if (
      nX >= 0 &&
      nX < row &&
      nY >= 0 &&
      nY < col &&
      !vis[nX][nY] &&
      !grid[nX][nY].isWall
    ) {
      prev[nX][nY] = [sX, sY];
      if (dfs(nX, nY, eX, eY, indPair, vis, prev)) {
        return true;
      }
    }
  }
  return false;
}

function bfs(sX, sY, eX, eY, indPair, vis, prev) {
  let dir = [
    [0, -1],
    [-1, 0],
    [0, 1],
    [1, 0],
  ];
  let queue = [];
  queue.push([sX, sY]);
  let pathFound = false;
  while (queue.length > 0) {
    let [i, j] = queue.shift();
    vis[i][j] = true;
    for (let k = 0; k < 4; k++) {
      let nX = i + dir[k][0];
      let nY = j + dir[k][1];
      if (
        nX >= 0 &&
        nX < row &&
        nY >= 0 &&
        nY < col &&
        !vis[nX][nY] &&
        !grid[nX][nY].isWall
      ) {
        prev[nX][nY] = [i, j];
        if (nX == eX && nY == eY) {
          pathFound = true;
          return true;
        }
        queue.push([nX, nY]);
        indPair.push([nX, nY]);
        vis[nX][nY] = true;
      }
    }
  }
  return false;
}

//ARRAY CHECK FUNCTION
function arraysEqual(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

//SHORTEST PATH FUNCTION
function shortestPath(sX, sY, eX, eY, prev) {
  let path = [];
  let curr = [eX, eY];

  if (prev[eX][eY][0] === -1 && prev[eX][eY][1] === -1) {
    return path;
  }
  while (!arraysEqual(curr, [sX, sY])) {
    path.push(curr);
    let [i, j] = curr;
    let prevInd = prev[i][j];
    curr = prevInd;
  }
  path.shift();
  path.reverse();
  return path;
}
