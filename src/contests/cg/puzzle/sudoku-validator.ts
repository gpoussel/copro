// @ts-nocheck
// 🎮 CodinGame Puzzle - sudoku-validator
// https://www.codingame.com/training/easy/sudoku-validator

const grid: number[][] = [];
for (let i = 0; i < 9; i++) {
  grid.push(readline().split(' ').map(Number));
}

function hasAllDigits(cells: number[]): boolean {
  const seen = new Set(cells);
  for (let d = 1; d <= 9; d++) {
    if (!seen.has(d)) return false;
  }
  return seen.size === 9;
}

let valid = true;

// Check rows
for (let r = 0; r < 9; r++) {
  if (!hasAllDigits(grid[r])) { valid = false; break; }
}

// Check columns
if (valid) {
  for (let c = 0; c < 9; c++) {
    const col = grid.map(row => row[c]);
    if (!hasAllDigits(col)) { valid = false; break; }
  }
}

// Check 3x3 subgrids
if (valid) {
  outer: for (let br = 0; br < 3; br++) {
    for (let bc = 0; bc < 3; bc++) {
      const cells: number[] = [];
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          cells.push(grid[br * 3 + r][bc * 3 + c]);
        }
      }
      if (!hasAllDigits(cells)) { valid = false; break outer; }
    }
  }
}

console.log(valid ? 'true' : 'false');
