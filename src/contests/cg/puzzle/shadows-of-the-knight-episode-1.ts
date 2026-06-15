// 🎮 CodinGame Puzzle - shadows-of-the-knight-episode-1
// https://www.codingame.com/training/medium/shadows-of-the-knight-episode-1

// Init reads
const [W, H]: number[] = readline().split(" ").map(Number)
readline()
const [x0, y0]: number[] = readline().split(" ").map(Number)

// Search bounds (inclusive on both ends)
let loX: number = 0
let hiX: number = W - 1
let loY: number = 0
let hiY: number = H - 1

// Current position
let bx: number = x0
let by: number = y0

// Game loop
while (true) {
  const bombDir: string = readline()

  // Update horizontal bounds based on direction hint
  if (bombDir.includes("L")) {
    hiX = bx - 1
  } else if (bombDir.includes("R")) {
    loX = bx + 1
  }
  // else: no horizontal component, bounds unchanged

  // Update vertical bounds based on direction hint
  if (bombDir.includes("U")) {
    hiY = by - 1
  } else if (bombDir.includes("D")) {
    loY = by + 1
  }
  // else: no vertical component, bounds unchanged

  // Jump to midpoint of remaining search space
  bx = Math.floor((loX + hiX) / 2)
  by = Math.floor((loY + hiY) / 2)

  console.log(`${bx} ${by}`)
}
