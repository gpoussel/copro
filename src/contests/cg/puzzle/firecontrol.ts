// 🎮 CodinGame Puzzle - firecontrol
// https://www.codingame.com/

const grid: string[] = []
for (let i = 0; i < 6; i++) {
  grid.push(readline())
}

const fires: [number, number][] = []
let treeCount = 0
for (let r = 0; r < 6; r++) {
  for (let c = 0; c < 6; c++) {
    const ch = grid[r][c]
    if (ch === "*") {
      fires.push([r, c])
    } else if (ch === "#") {
      treeCount++
    }
  }
}

if (fires.length === 0) {
  console.log("RELAX")
} else {
  let barrier = 0
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 6; c++) {
      if (grid[r][c] !== "#") {
        continue
      }
      let inRange = false
      for (const [fr, fc] of fires) {
        if (Math.max(Math.abs(fr - r), Math.abs(fc - c)) <= 2) {
          inRange = true
          break
        }
      }
      if (inRange) {
        barrier++
      }
    }
  }
  if (barrier === treeCount) {
    console.log("JUST RUN")
  } else {
    console.log(String(barrier))
  }
}
