// Faithful port of the CodinGame 2048 referee engine.
// Source: https://github.com/eulerscheZahl/2048/blob/master/src/main/java/engine/Board.java
//
// This is the GROUND TRUTH used to verify that the bot's internal simulation
// matches what the site actually does for a given seed. Keep it byte-for-byte
// faithful to Board.java — do not "improve" it.
//
// Grid is stored as a flat length-16 array of *actual tile values* (0 = empty),
// indexed linearly as idx = x + y*4, where x is the column (0..3) and y the row
// (0..3). This matches Board.java's `spawnIndex = x + y*SIZE` and the linear
// `source`/`intermediate` indices used in applyMove.

export const DIRS = "URDL"; // U=0, R=1, D=2, L=3 (Board.dirs)

const TARGET_START = [0, 3, 12, 0];
const TARGET_STEP = [1, 4, 1, 4];
const SOURCE_STEP = [4, -1, -4, 1];

// seed = seed * seed % 50515093 (Java long arithmetic). BigInt keeps it exact
// even for a large initial seed; once reduced, seed < 50515093 forever after.
export function nextSeed(seed) {
  return Number((BigInt(seed) * BigInt(seed)) % 50515093n);
}

// Mirrors Board.spawnTile(). Mutates grid, returns the updated seed.
export function spawnTile(grid, seed) {
  const free = [];
  for (let x = 0; x < 4; x++) {
    for (let y = 0; y < 4; y++) {
      if (grid[x + y * 4] === 0) free.push(x + y * 4);
    }
  }
  const spawnIndex = free[seed % free.length];
  const value = (seed & 0x10) === 0 ? 2 : 4;
  grid[spawnIndex] = value;
  return nextSeed(seed);
}

// Mirrors Board.applyMove(). Mutates grid, returns the score gained this move.
export function applyMove(grid, dir) {
  let turnScore = 0;
  let merged = 0; // bitmask over the 16 cells (replaces boolean[][] merged)
  const targetStart = TARGET_START[dir];
  const targetStep = TARGET_STEP[dir];
  const sourceStep = SOURCE_STEP[dir];
  for (let i = 0; i < 4; i++) {
    const finalTarget = targetStart + i * targetStep;
    for (let j = 1; j < 4; j++) {
      let source = finalTarget + j * sourceStep;
      if (grid[source] === 0) continue;
      for (let k = j - 1; k >= 0; k--) {
        const inter = finalTarget + k * sourceStep;
        if (grid[inter] === 0) {
          grid[inter] = grid[source];
          grid[source] = 0;
          source = inter;
        } else {
          if (!(merged & (1 << inter)) && grid[inter] === grid[source]) {
            grid[source] = 0;
            grid[inter] *= 2;
            merged |= 1 << inter;
            turnScore += grid[inter];
          }
          break;
        }
      }
    }
  }
  return turnScore;
}

// Mirrors Board.canMove(dir): a move is legal iff it changes the grid.
export function canMove(grid, dir) {
  const c = grid.slice();
  applyMove(c, dir);
  for (let i = 0; i < 16; i++) if (c[i] !== grid[i]) return true;
  return false;
}

export function canMoveAny(grid) {
  for (let d = 0; d < 4; d++) if (canMove(grid, d)) return true;
  return false;
}

// Mirrors the Board constructor: two spawns from the initial seed.
export function newGame(seed) {
  const grid = new Array(16).fill(0);
  let s = seed;
  s = spawnTile(grid, s);
  s = spawnTile(grid, s);
  return { grid, seed: s, score: 0 };
}

// Render a grid the way getInput() does: rows y=0..3, columns x=0..3 per row.
export function gridLines(grid) {
  const lines = [];
  for (let y = 0; y < 4; y++) {
    const row = [];
    for (let x = 0; x < 4; x++) row.push(grid[x + y * 4]);
    lines.push(row.join(" "));
  }
  return lines;
}

// Build the exact per-turn input block the referee sends to the player.
export function inputLines(state) {
  return [String(state.seed), String(state.score), ...gridLines(state.grid)];
}

// Play one batch of moves (a single player output line) against the engine,
// mirroring Board.playTurn(): stops at the first illegal command. Mutates state.
// Returns { applied, scoreGained, stoppedAt } where stoppedAt is the index of
// the first illegal command (or -1 if all applied).
export function playTurn(state, action) {
  let applied = 0;
  let gained = 0;
  let stoppedAt = -1;
  const chars = action.toUpperCase().split("");
  for (let n = 0; n < chars.length; n++) {
    const c = chars[n];
    if (c === "-") continue;
    const dir = DIRS.indexOf(c);
    if (dir === -1) {
      stoppedAt = n;
      break;
    }
    if (!canMove(state.grid, dir)) {
      stoppedAt = n;
      break;
    }
    const sc = applyMove(state.grid, dir);
    state.score += sc;
    gained += sc;
    applied++;
    state.seed = spawnTile(state.grid, state.seed);
  }
  return { applied, scoreGained: gained, stoppedAt };
}
