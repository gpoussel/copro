// @ts-nocheck
// 🎮 CodinGame Puzzle - rectangular-block-spinner
// https://www.codingame.com/training/easy/rectangular-block-spinner

const size = parseInt(readline());
const angle = parseInt(readline());

let grid: string[][] = [];
for (let r = 0; r < size; r++) {
  grid.push(readline().split(" "));
}

// Any odd multiple of 45° = 45° + k*90°. Apply the k extra quarter-turns
// counterclockwise to the square grid first, then the 45° diamond transform.
const quarters = ((((angle - 45) / 90) % 4) + 4) % 4;

function rotateCCW(g: string[][]): string[][] {
  const n = g.length;
  const out: string[][] = [];
  for (let i = 0; i < n; i++) {
    const row: string[] = [];
    for (let j = 0; j < n; j++) {
      // 90° counterclockwise: out[i][j] = g[j][n-1-i]
      row.push(g[j][n - 1 - i]);
    }
    out.push(row);
  }
  return out;
}

for (let q = 0; q < quarters; q++) {
  grid = rotateCCW(grid);
}

// 45° counterclockwise diamond transform.
// Output row i (0..2*size-2) gathers cells where r-c = d = i-(size-1),
// ordered by the anti-diagonal a = r+c ascending. The diamond is padded with
// spaces on BOTH ends (the statement requires it).
const n = size;
const lines: string[] = [];
for (let i = 0; i < 2 * n - 1; i++) {
  const d = i - (n - 1); // r - c
  const glyphs: string[] = [];
  for (let r = Math.max(0, d); r <= Math.min(n - 1, n - 1 + d); r++) {
    const c = r - d;
    glyphs.push(grid[r][c]);
  }
  const k = glyphs.length; // = n - |d|
  const pad = " ".repeat(n - k);
  lines.push(pad + glyphs.join(" ") + pad);
}

console.log(lines.join("\n"));
