// @ts-nocheck
// 🎮 CodinGame Puzzle - the-fall-episode-1
// https://www.codingame.com/training/medium/the-fall-episode-1

// Game-loop puzzle. Read the grid of room types once, then each turn read Indy's
// current room (XI, YI) and the side he ENTERS from (TOP / LEFT / RIGHT) and
// print the room he will travel to next.
//
// Each of the 14 room types routes an entry side to an exit direction. The 6 base
// shapes give 14 types by rotation:
//   1            funnel: every entry exits DOWN
//   2 / 3        straight: 2 horizontal, 3 vertical
//   4 / 5        wide curve (two valid entries)
//   6 / 7 / 8 / 9  T-shape (one side walled — 6 and 9 differ in which)
//   10 / 11 / 12 / 13  narrow curve (a single valid entry)

// type -> { entrySide: exitDirection }
const ROUTING: Record<number, Record<string, string>> = {
  1: { TOP: "DOWN", LEFT: "DOWN", RIGHT: "DOWN" },
  2: { LEFT: "RIGHT", RIGHT: "LEFT" },
  3: { TOP: "DOWN" },
  4: { TOP: "LEFT", RIGHT: "DOWN" },
  5: { TOP: "RIGHT", LEFT: "DOWN" },
  6: { LEFT: "RIGHT", RIGHT: "LEFT" },
  7: { TOP: "DOWN", RIGHT: "DOWN" },
  8: { LEFT: "DOWN", RIGHT: "DOWN" },
  9: { TOP: "DOWN", LEFT: "DOWN" },
  10: { TOP: "LEFT" },
  11: { TOP: "RIGHT" },
  12: { RIGHT: "DOWN" },
  13: { LEFT: "DOWN" },
};

const [W, H] = readline().split(/\s+/).map(Number);

const grid: number[][] = [];
for (let row = 0; row < H; row++) {
  grid.push(readline().split(/\s+/).map(Number));
}
readline(); // EX — not used in episode 1

while (true) {
  const line = readline();
  if (!line) break;
  const parts = line.split(/\s+/);
  const xi = parseInt(parts[0]);
  const yi = parseInt(parts[1]);
  const pos = parts[2];

  const type = grid[yi][xi];
  const exit = ROUTING[type][pos];

  let nx = xi;
  let ny = yi;
  if (exit === "DOWN") ny = yi + 1;
  else if (exit === "LEFT") nx = xi - 1;
  else if (exit === "RIGHT") nx = xi + 1;

  console.log(`${nx} ${ny}`);
}
