// @ts-nocheck
// 🎮 CodinGame Puzzle - organic-compounds
// https://www.codingame.com/training/easy/organic-compounds

const N = parseInt(readline());
const rows: string[] = [];
for (let i = 0; i < N; i++) {
  rows.push(readline());
}

// The grid is tokenized into 3-char wide slots.
// Each slot is either:
//   CHn  - a carbon unit with n hydrogens (valence = 4 - n)
//   (m)  - a bond of strength m
//   '   ' - empty space

// Build a 2D array of tokens: grid[row][col]
// where col is the 0-based index at multiples of 3 characters.

function getToken(row: number, col: number): string {
  if (row < 0 || row >= rows.length) return '   ';
  const line = rows[row];
  const pos = col * 3;
  if (pos >= line.length) return '   ';
  return line.slice(pos, pos + 3).padEnd(3, ' ');
}

function isCarbon(tok: string): boolean {
  return tok.startsWith('CH');
}

function isBond(tok: string): boolean {
  return tok.startsWith('(') && tok.endsWith(')');
}

function getBondStrength(tok: string): number {
  if (!isBond(tok)) return 0;
  return parseInt(tok[1]);
}

function getValence(tok: string): number {
  // CHn => valence = 4 - n
  return 4 - parseInt(tok[2]);
}

// Determine max column count across all rows
let maxCols = 0;
for (const line of rows) {
  const cols = Math.ceil(line.length / 3);
  if (cols > maxCols) maxCols = cols;
}

let valid = true;

// Check each carbon
for (let r = 0; r < rows.length; r++) {
  for (let c = 0; c <= maxCols; c++) {
    const tok = getToken(r, c);
    if (!isCarbon(tok)) continue;

    const valence = getValence(tok);

    // Sum adjacent bonds
    let totalBonds = 0;

    // Left: (r, c-1)
    const leftTok = getToken(r, c - 1);
    if (isBond(leftTok)) totalBonds += getBondStrength(leftTok);

    // Right: (r, c+1)
    const rightTok = getToken(r, c + 1);
    if (isBond(rightTok)) totalBonds += getBondStrength(rightTok);

    // Up: (r-1, c)
    const upTok = getToken(r - 1, c);
    if (isBond(upTok)) totalBonds += getBondStrength(upTok);

    // Down: (r+1, c)
    const downTok = getToken(r + 1, c);
    if (isBond(downTok)) totalBonds += getBondStrength(downTok);

    if (totalBonds !== valence) {
      valid = false;
      break;
    }
  }
  if (!valid) break;
}

console.log(valid ? 'VALID' : 'INVALID');
