// @ts-nocheck
// 🎮 CodinGame Puzzle - minesweeper
// https://www.codingame.com/training/medium/minesweeper

const [h, w] = readline().split(' ').map(Number);
const nb = parseInt(readline());
const grid: string[] = [];
for (let i = 0; i < h; i++) {
  grid.push(readline());
}

// Collect all '?' positions (candidate mine locations)
const unknowns: [number, number][] = [];
for (let r = 0; r < h; r++) {
  for (let c = 0; c < w; c++) {
    if (grid[r][c] === '?') {
      unknowns.push([r, c]);
    }
  }
}

// For each numbered cell, collect which unknowns are neighbors
interface Constraint {
  count: number;           // number of mines required
  neighbors: number[];     // indices into unknowns[]
}

const constraints: Constraint[] = [];
for (let r = 0; r < h; r++) {
  for (let c = 0; c < w; c++) {
    const ch = grid[r][c];
    if (ch === '.' || ch === '?') continue;
    const required = parseInt(ch);
    const neighborIdx: number[] = [];
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const nr = r + dr;
        const nc = c + dc;
        if (nr < 0 || nr >= h || nc < 0 || nc >= w) continue;
        if (grid[nr][nc] === '?') {
          // find index
          const idx = unknowns.findIndex(([ur, uc]) => ur === nr && uc === nc);
          if (idx !== -1 && !neighborIdx.includes(idx)) {
            neighborIdx.push(idx);
          }
        }
      }
    }
    constraints.push({ count: required, neighbors: neighborIdx });
  }
}

// Backtracking: assign mine=true/false to each unknown
const assignment = new Array<boolean>(unknowns.length).fill(false);
let solution: boolean[] | null = null;

function isFeasible(idx: number): boolean {
  // Check all constraints that only involve indices <= idx
  for (const c of constraints) {
    // Count how many are assigned as mines, how many are still unassigned
    let mineCount = 0;
    let unassigned = 0;
    for (const ni of c.neighbors) {
      if (ni <= idx) {
        if (assignment[ni]) mineCount++;
      } else {
        unassigned++;
      }
    }
    // After assigning up to idx:
    // mineCount can't exceed required
    if (mineCount > c.count) return false;
    // remaining unassigned can't compensate
    if (mineCount + unassigned < c.count) return false;
  }
  return true;
}

function backtrack(idx: number, minesSoFar: number): void {
  if (solution !== null) return;

  if (idx === unknowns.length) {
    if (minesSoFar === nb) {
      // Verify all constraints satisfied exactly
      for (const c of constraints) {
        let count = 0;
        for (const ni of c.neighbors) {
          if (assignment[ni]) count++;
        }
        if (count !== c.count) return;
      }
      solution = assignment.slice();
    }
    return;
  }

  // Pruning: can we still reach exactly nb mines?
  const remaining = unknowns.length - idx;
  if (minesSoFar > nb) return;
  if (minesSoFar + remaining < nb) return;

  // Try placing a mine at idx
  assignment[idx] = true;
  if (isFeasible(idx)) {
    backtrack(idx + 1, minesSoFar + 1);
  }

  if (solution !== null) return;

  // Try not placing a mine at idx
  assignment[idx] = false;
  if (isFeasible(idx)) {
    backtrack(idx + 1, minesSoFar);
  }
}

backtrack(0, 0);

// Collect mine positions from solution
const mines: [number, number][] = [];
if (solution !== null) {
  for (let i = 0; i < unknowns.length; i++) {
    if (solution[i]) {
      mines.push(unknowns[i]);
    }
  }
}

// Sort by column ascending, then line ascending
mines.sort((a, b) => {
  const [ar, ac] = a;
  const [br, bc] = b;
  if (ac !== bc) return ac - bc;
  return ar - br;
});

// Output: col lin
for (const [r, c] of mines) {
  console.log(c + ' ' + r);
}
