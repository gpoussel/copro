// @ts-nocheck
// 🎮 CodinGame Puzzle - mountain-map-convergence
// https://www.codingame.com/training/easy/mountain-map-convergence

const n = parseInt(readline());
const heights = readline().split(' ').map(Number);

// Build the height profile column by column.
// For each peak h_i:
//   1. From current height c, go to h_i - 1 (the column just before the peak).
//   2. Rise to h_i (the '/' of the peak).
//   3. Fall to h_i - 1 (the '\' of the peak).
// After all peaks, return to 0.
//
// Between consecutive heights in pathHeights, each step is exactly +1 or -1.

function buildPath(peaks: number[]): number[] {
  const path: number[] = [0];
  let current = 0;

  for (const h of peaks) {
    const target = h - 1; // position just before the peak
    const steps = target - current;
    const dir = steps > 0 ? 1 : -1;
    for (let s = 0; s < Math.abs(steps); s++) {
      current += dir;
      path.push(current);
    }
    // Rise to peak
    current = h;
    path.push(current);
    // Fall from peak
    current = h - 1;
    path.push(current);
  }

  // Return to 0 after all peaks
  const steps = 0 - current;
  const dir = steps > 0 ? 1 : -1;
  for (let s = 0; s < Math.abs(steps); s++) {
    current += dir;
    path.push(current);
  }

  return path;
}

const pathHeights = buildPath(heights);

// Determine the height range
const minH = Math.min(...pathHeights);
const maxH = Math.max(...pathHeights);

const numCols = pathHeights.length;
const numRows = maxH - minH + 1;

// Build grid: grid[row][col], row 0 = maxH, row numRows-1 = minH
// Width = numCols-1 (one char per transition between consecutive heights)
const grid: string[][] = [];
for (let r = 0; r < numRows; r++) {
  grid.push(new Array(numCols - 1).fill(' '));
}

function rowOf(h: number): number {
  return maxH - h;
}

// Place characters: for each transition from pathHeights[c-1] to pathHeights[c].
// The character for transition c (1-indexed) is placed at grid column c-1.
//   rising (curr > prev): '/' placed at the HIGHER height (curr)
//   falling (curr < prev): '\' placed at the HIGHER height (prev)
for (let c = 1; c < numCols; c++) {
  const prev = pathHeights[c - 1];
  const curr = pathHeights[c];
  const col = c - 1; // output column (0-indexed)
  if (curr > prev) {
    // rising: '/' at height curr
    grid[rowOf(curr)][col] = '/';
  } else if (curr < prev) {
    // falling: '\' at height prev
    grid[rowOf(prev)][col] = '\\';
  }
}

// Render grid: trim trailing spaces, remove trailing empty lines
const lines: string[] = [];
for (let r = 0; r < numRows; r++) {
  const line = grid[r].join('').replace(/\s+$/, '');
  lines.push(line);
}

while (lines.length > 0 && lines[lines.length - 1] === '') {
  lines.pop();
}

console.log(lines.join('\n'));
