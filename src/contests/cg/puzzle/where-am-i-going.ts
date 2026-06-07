// 🎮 CodinGame Puzzle - where-am-i-going
// https://www.codingame.com/training/easy/where-am-i-going

const h = parseInt(readline())
const w = parseInt(readline())
const grid: string[] = []
for (let i = 0; i < h; i++) {
  grid.push(readline())
}

// Direction vectors indexed as: 0=right, 1=down, 2=left, 3=up
const DR = [0, 1, 0, -1]
const DC = [1, 0, -1, 0]

// We start outside the field heading right, entering at (0, 0)
// Position (r, c) is the current cell we occupy
let r = 0
let c = 0
let dir = 0 // heading right (entering from the left)
let steps = 1 // we're already on the first '#' cell

const result: string[] = []

while (true) {
  // Try to continue in current direction
  const fr = r + DR[dir]
  const fc = c + DC[dir]

  if (fr >= 0 && fr < h && fc >= 0 && fc < w && grid[fr][fc] === "#") {
    // Move forward
    r = fr
    c = fc
    steps++
  } else {
    // Can't go forward — try turning right then left
    const rightDir = (dir + 1) % 4
    const leftDir = (dir + 3) % 4

    const rr = r + DR[rightDir]
    const rc = c + DC[rightDir]
    const lr = r + DR[leftDir]
    const lc = c + DC[leftDir]

    const canRight = rr >= 0 && rr < h && rc >= 0 && rc < w && grid[rr][rc] === "#"
    const canLeft = lr >= 0 && lr < h && lc >= 0 && lc < w && grid[lr][lc] === "#"

    if (!canRight && !canLeft) {
      // Dead end — path terminates here
      result.push(steps.toString())
      break
    } else if (canRight) {
      result.push(steps + "R")
      steps = 1
      dir = rightDir
      r = rr
      c = rc
    } else {
      result.push(steps + "L")
      steps = 1
      dir = leftDir
      r = lr
      c = lc
    }
  }
}

console.log(result.join(""))
