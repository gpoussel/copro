// @ts-nocheck
// 🎮 CodinGame Puzzle - detective-pikaptcha-ep2
// https://www.codingame.com/training/easy/detective-pikaptcha-ep2

const [width, height] = readline().split(" ").map(Number);

// Directions, clockwise: 0=up, 1=right, 2=down, 3=left
const DELTA = [
  [-1, 0],
  [0, 1],
  [1, 0],
  [0, -1],
];
const FACING: Record<string, number> = { "^": 0, ">": 1, v: 2, "<": 3 };

const grid: string[][] = [];
let startRow = 0;
let startCol = 0;
let dir = 0;
for (let r = 0; r < height; r++) {
  const row = readline().split("");
  for (let c = 0; c < width; c++) {
    if (row[c] in FACING) {
      startRow = r;
      startCol = c;
      dir = FACING[row[c]];
      row[c] = "0"; // the start cell is a passage
    }
  }
  grid.push(row);
}
const side = readline().trim(); // "L" follows the left wall, "R" the right wall

// Relative turn order. Left-hand rule prefers: left, straight, right, back.
// Right-hand rule prefers: right, straight, left, back (offsets added to dir mod 4).
const order = side === "L" ? [3, 0, 1, 2] : [1, 0, 3, 2];

const count: number[][] = Array.from({ length: height }, () => new Array(width).fill(0));
let r = startRow;
let c = startCol;

// Count a cell each time Pikaptcha *enters* it. The start cell is only counted
// if he loops back onto it; if he is walled in on all sides he never moves, so
// every cell (the start included) stays at 0.
const maxSteps = width * height * 8 + 10; // safety bound; the path is a closed loop
for (let step = 0; step < maxSteps; step++) {
  let moved = false;
  for (const off of order) {
    const nd = (dir + off) % 4;
    const nr = r + DELTA[nd][0];
    const nc = c + DELTA[nd][1];
    if (nr >= 0 && nr < height && nc >= 0 && nc < width && grid[nr][nc] === "0") {
      dir = nd;
      r = nr;
      c = nc;
      moved = true;
      break;
    }
  }
  if (!moved) break; // walled in, cannot move
  count[r][c]++;
  if (r === startRow && c === startCol) break; // back to start: stop
}

const lines: string[] = [];
for (let r2 = 0; r2 < height; r2++) {
  let line = "";
  for (let c2 = 0; c2 < width; c2++) {
    line += grid[r2][c2] === "#" ? "#" : String(count[r2][c2]);
  }
  lines.push(line);
}
console.log(lines.join("\n"));
